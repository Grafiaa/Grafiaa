import express from 'express';
import type pg from 'pg';
import { type LeitorDeUsuario, MENSAGENS } from './contas.js';

/** Um ponto do contorno, como no protótipo: "on" fica na linha; "off" é alça de curva. */
export interface Ponto {
  x: number;
  y: number;
  t: 'on' | 'off';
  s?: boolean;
}

export interface Contorno {
  closed: boolean;
  pts: Ponto[];
}

/** Um glifo desenhado, só o que o card precisa para a amostra. */
export interface GlifoDaAmostra {
  largura: number;
  contornos: Contorno[];
}

/** O que o card de Minhas fontes mostra. */
export interface ResumoDeFonte {
  id: number;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;
  glifos: number;
  /** Até 3 glifos com contorno fechado, na ordem da fonte. */
  amostra: GlifoDaAmostra[];
}

/** Limite de fontes por conta (RN04). */
export const LIMITE_DE_FONTES = 20;

export const FONTE_NAO_ENCONTRADA = 'Fonte não encontrada.';

/** O que as rotas de fontes precisam do banco. Nos testes, entra uma versão em memória. */
export interface RepositorioDeFontes {
  /** As fontes da pessoa, da alterada mais recente para a mais antiga. */
  fontesDoUsuario(usuarioId: number): Promise<ResumoDeFonte[]>;
  /** A fonte, só se ela for dessa pessoa (RN03). */
  fonteDoUsuario(usuarioId: number, fonteId: number): Promise<ResumoDeFonte | null>;
}

export function rotasDeFontes(fontes: RepositorioDeFontes, lerUsuario: LeitorDeUsuario) {
  const rotas = express.Router();

  rotas.get('/fontes', async (req, res) => {
    const usuario = await lerUsuario(req);
    if (!usuario) {
      res.status(401).json({ erro: MENSAGENS.naoEntrou });
      return;
    }
    res.json({ fontes: await fontes.fontesDoUsuario(usuario.id), limite: LIMITE_DE_FONTES });
  });

  rotas.get('/fontes/:id', async (req, res) => {
    const usuario = await lerUsuario(req);
    if (!usuario) {
      res.status(401).json({ erro: MENSAGENS.naoEntrou });
      return;
    }
    // Fonte de outra pessoa, que não existe ou com endereço estranho: a mesma resposta (RN03).
    const fonte = /^\d{1,15}$/.test(req.params.id)
      ? await fontes.fonteDoUsuario(usuario.id, Number(req.params.id))
      : null;
    if (!fonte) {
      res.status(404).json({ erro: FONTE_NAO_ENCONTRADA });
      return;
    }
    res.json(fonte);
  });

  return rotas;
}

const SELECT_RESUMO = `
  SELECT f.id, f.nome, f.criado_em, f.atualizado_em,
         (SELECT count(*) FROM glifos g WHERE g.fonte_id = f.id) AS glifos,
         COALESCE((
           SELECT json_agg(json_build_object('largura', a.largura, 'contornos', a.contornos) ORDER BY a.ordem, a.id)
             FROM (SELECT g.largura, g.contornos, g.ordem, g.id
                     FROM glifos g
                    WHERE g.fonte_id = f.id AND jsonb_path_exists(g.contornos, '$[*] ? (@.closed == true)')
                    ORDER BY g.ordem, g.id
                    LIMIT 3) a
         ), '[]'::json) AS amostra
    FROM fontes f`;

interface LinhaDeResumo {
  id: string;
  nome: string;
  criado_em: Date;
  atualizado_em: Date;
  glifos: string;
  amostra: GlifoDaAmostra[];
}

function paraResumo(linha: LinhaDeResumo): ResumoDeFonte {
  return {
    id: Number(linha.id),
    nome: linha.nome,
    criadoEm: linha.criado_em.toISOString(),
    atualizadoEm: linha.atualizado_em.toISOString(),
    glifos: Number(linha.glifos),
    amostra: linha.amostra,
  };
}

/** A versão de verdade, no PostgreSQL. */
export function repositorioDeFontes(pool: pg.Pool): RepositorioDeFontes {
  return {
    async fontesDoUsuario(usuarioId) {
      const { rows } = await pool.query<LinhaDeResumo>(
        `${SELECT_RESUMO} WHERE f.usuario_id = $1 ORDER BY f.atualizado_em DESC, f.id DESC`,
        [usuarioId],
      );
      return rows.map(paraResumo);
    },

    async fonteDoUsuario(usuarioId, fonteId) {
      const { rows } = await pool.query<LinhaDeResumo>(`${SELECT_RESUMO} WHERE f.usuario_id = $1 AND f.id = $2`, [
        usuarioId,
        fonteId,
      ]);
      return rows[0] ? paraResumo(rows[0]) : null;
    },
  };
}
