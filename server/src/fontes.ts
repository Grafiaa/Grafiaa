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

export const MENSAGENS_DE_FONTE = {
  nomeVazio: 'Dê um nome para a fonte.',
  nomeLongo: 'O nome pode ter até 60 caracteres.',
  limite: `Você chegou ao limite de ${LIMITE_DE_FONTES} fontes.`,
} as const;

/** Toda fonte nova já nasce com o glifo de espaço, com largura de 250 unidades (RN08). */
export const GLIFO_DE_ESPACO = { nome: 'space', unicode: 32, largura: 250 } as const;

/** O que as rotas de fontes precisam do banco. Nos testes, entra uma versão em memória. */
export interface RepositorioDeFontes {
  /** As fontes da pessoa, da alterada mais recente para a mais antiga. */
  fontesDoUsuario(usuarioId: number): Promise<ResumoDeFonte[]>;
  /** A fonte, só se ela for dessa pessoa (RN03). */
  fonteDoUsuario(usuarioId: number, fonteId: number): Promise<ResumoDeFonte | null>;
  /** Cria a fonte com o glifo de espaço. Devolve null se a pessoa já chegou ao limite. */
  criarFonteEmBranco(usuarioId: number, nome: string, limite: number): Promise<ResumoDeFonte | null>;
  /** Renomeia, só se a fonte for dessa pessoa. */
  renomearFonte(usuarioId: number, fonteId: number, nome: string): Promise<ResumoDeFonte | null>;
  /** Exclui a fonte e os glifos dela, só se a fonte for dessa pessoa. */
  excluirFonte(usuarioId: number, fonteId: number): Promise<boolean>;
}

/** Nome sem espaços nas pontas, com 1 a 60 caracteres (RN05). */
export function conferirNome(nome: unknown): { ok: true; nome: string } | { ok: false; erro: string } {
  const limpo = typeof nome === 'string' ? nome.trim() : '';
  if (!limpo) return { ok: false, erro: MENSAGENS_DE_FONTE.nomeVazio };
  if ([...limpo].length > 60) return { ok: false, erro: MENSAGENS_DE_FONTE.nomeLongo };
  return { ok: true, nome: limpo };
}

/** Só aceita endereço com número; o resto vira "não encontrada". */
function idDaFonte(texto: string): number | null {
  return /^\d{1,15}$/.test(texto) ? Number(texto) : null;
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
    const id = idDaFonte(req.params.id);
    const fonte = id === null ? null : await fontes.fonteDoUsuario(usuario.id, id);
    if (!fonte) {
      res.status(404).json({ erro: FONTE_NAO_ENCONTRADA });
      return;
    }
    res.json(fonte);
  });

  rotas.post('/fontes', async (req, res) => {
    const usuario = await lerUsuario(req);
    if (!usuario) {
      res.status(401).json({ erro: MENSAGENS.naoEntrou });
      return;
    }
    const nome = conferirNome((req.body ?? {}).nome);
    if (!nome.ok) {
      res.status(400).json({ erro: nome.erro, campo: 'nome' });
      return;
    }
    const fonte = await fontes.criarFonteEmBranco(usuario.id, nome.nome, LIMITE_DE_FONTES);
    if (!fonte) {
      res.status(409).json({ erro: MENSAGENS_DE_FONTE.limite });
      return;
    }
    res.status(201).json(fonte);
  });

  rotas.patch('/fontes/:id', async (req, res) => {
    const usuario = await lerUsuario(req);
    if (!usuario) {
      res.status(401).json({ erro: MENSAGENS.naoEntrou });
      return;
    }
    const nome = conferirNome((req.body ?? {}).nome);
    if (!nome.ok) {
      res.status(400).json({ erro: nome.erro, campo: 'nome' });
      return;
    }
    const id = idDaFonte(req.params.id);
    const fonte = id === null ? null : await fontes.renomearFonte(usuario.id, id, nome.nome);
    if (!fonte) {
      res.status(404).json({ erro: FONTE_NAO_ENCONTRADA });
      return;
    }
    res.json(fonte);
  });

  rotas.delete('/fontes/:id', async (req, res) => {
    const usuario = await lerUsuario(req);
    if (!usuario) {
      res.status(401).json({ erro: MENSAGENS.naoEntrou });
      return;
    }
    const id = idDaFonte(req.params.id);
    const excluiu = id !== null && (await fontes.excluirFonte(usuario.id, id));
    if (!excluiu) {
      res.status(404).json({ erro: FONTE_NAO_ENCONTRADA });
      return;
    }
    res.status(204).end();
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

    async criarFonteEmBranco(usuarioId, nome, limite) {
      const conexao = await pool.connect();
      let fonteId = 0;
      try {
        await conexao.query('BEGIN');
        // Trava a conta enquanto conta as fontes, para dois cliques ao mesmo tempo não passarem do limite.
        await conexao.query('SELECT id FROM usuarios WHERE id = $1 FOR UPDATE', [usuarioId]);
        const { rows: contagem } = await conexao.query<{ total: string }>(
          'SELECT count(*) AS total FROM fontes WHERE usuario_id = $1',
          [usuarioId],
        );
        if (Number(contagem[0].total) >= limite) {
          await conexao.query('ROLLBACK');
          return null;
        }
        const { rows } = await conexao.query<{ id: string }>(
          'INSERT INTO fontes (usuario_id, nome) VALUES ($1, $2) RETURNING id',
          [usuarioId, nome],
        );
        fonteId = Number(rows[0].id);
        await conexao.query('INSERT INTO glifos (fonte_id, nome, unicode, largura) VALUES ($1, $2, $3, $4)', [
          fonteId,
          GLIFO_DE_ESPACO.nome,
          GLIFO_DE_ESPACO.unicode,
          GLIFO_DE_ESPACO.largura,
        ]);
        await conexao.query('COMMIT');
      } catch (erro) {
        await conexao.query('ROLLBACK');
        throw erro;
      } finally {
        conexao.release();
      }
      return this.fonteDoUsuario(usuarioId, fonteId);
    },

    async renomearFonte(usuarioId, fonteId, nome) {
      const { rowCount } = await pool.query(
        'UPDATE fontes SET nome = $3, atualizado_em = now() WHERE usuario_id = $1 AND id = $2',
        [usuarioId, fonteId, nome],
      );
      return rowCount ? this.fonteDoUsuario(usuarioId, fonteId) : null;
    },

    async excluirFonte(usuarioId, fonteId) {
      const { rowCount } = await pool.query('DELETE FROM fontes WHERE usuario_id = $1 AND id = $2', [
        usuarioId,
        fonteId,
      ]);
      return Boolean(rowCount);
    },
  };
}
