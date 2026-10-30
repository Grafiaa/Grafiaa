import express from 'express';
import type pg from 'pg';
import { conferirSenha, gerarHashDeSenha } from './senha.js';
import {
  DURACAO_DA_SESSAO_MS,
  NOME_DO_COOKIE,
  gerarCodigoDeSessao,
  impressaoDoCodigo,
  lerCookie,
  opcoesDoCookie,
} from './sessao.js';

export interface Usuario {
  id: number;
  email: string;
}

/** O que as rotas de conta precisam do banco. Nos testes, entra uma versão em memória. */
export interface RepositorioDeContas {
  /** Cria a conta e devolve o usuário, ou null se o e-mail já tem conta. */
  criarUsuario(email: string, senhaHash: string): Promise<Usuario | null>;
  /** A conta com a senha embaralhada, para conferir na hora de entrar. */
  contaPorEmail(email: string): Promise<(Usuario & { senhaHash: string }) | null>;
  criarSessao(usuarioId: number, impressao: string, expiraEm: Date): Promise<void>;
  /** Dono da sessão, se ela existe e ainda não venceu. */
  usuarioDaSessao(impressao: string): Promise<Usuario | null>;
  apagarSessao(impressao: string): Promise<void>;
}

export const MENSAGENS = {
  emailInvalido: 'Informe um e-mail válido.',
  senhaCurta: 'A senha precisa ter pelo menos 8 caracteres.',
  emailRepetido: 'Esse e-mail já tem conta.',
  entrarErrado: 'E-mail ou senha incorretos.',
  naoEntrou: 'Você não entrou.',
} as const;

export const TAMANHO_MINIMO_DA_SENHA = 8;

/** Sem espaços nas pontas e em minúsculas: ANA@Exemplo.com e ana@exemplo.com são a mesma conta. */
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailValido(email: string): boolean {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Descobre, pelo cookie, quem fez o pedido. Devolve null se ninguém entrou ou se a sessão venceu. */
export function criarLeitorDeUsuario(contas: RepositorioDeContas, segredo: string) {
  return async (req: express.Request): Promise<Usuario | null> => {
    const codigo = lerCookie(req.headers.cookie, NOME_DO_COOKIE);
    return codigo ? contas.usuarioDaSessao(impressaoDoCodigo(codigo, segredo)) : null;
  };
}

export type LeitorDeUsuario = ReturnType<typeof criarLeitorDeUsuario>;

export function rotasDeContas(contas: RepositorioDeContas, segredo: string) {
  const rotas = express.Router();
  const lerUsuario = criarLeitorDeUsuario(contas, segredo);

  // Senha embaralhada de mentira: quem tenta entrar com um e-mail sem conta espera o mesmo tempo
  // de quem erra a senha, e assim não dá para descobrir quais e-mails têm conta.
  const senhaDeMentira = gerarHashDeSenha('ninguem-tem-esta-senha');

  async function abrirSessao(req: express.Request, res: express.Response, usuario: Usuario) {
    const codigo = gerarCodigoDeSessao();
    const expiraEm = new Date(Date.now() + DURACAO_DA_SESSAO_MS);
    await contas.criarSessao(usuario.id, impressaoDoCodigo(codigo, segredo), expiraEm);
    res.cookie(NOME_DO_COOKIE, codigo, opcoesDoCookie(req.secure));
  }

  rotas.post('/contas', async (req, res) => {
    const corpo = (req.body ?? {}) as { email?: unknown; senha?: unknown };
    const email = typeof corpo.email === 'string' ? normalizarEmail(corpo.email) : '';
    const senha = typeof corpo.senha === 'string' ? corpo.senha : '';

    if (!emailValido(email)) {
      res.status(400).json({ erro: MENSAGENS.emailInvalido, campo: 'email' });
      return;
    }
    if (senha.length < TAMANHO_MINIMO_DA_SENHA) {
      res.status(400).json({ erro: MENSAGENS.senhaCurta, campo: 'senha' });
      return;
    }

    const usuario = await contas.criarUsuario(email, await gerarHashDeSenha(senha));
    if (!usuario) {
      res.status(409).json({ erro: MENSAGENS.emailRepetido, campo: 'email' });
      return;
    }

    await abrirSessao(req, res, usuario);
    res.status(201).json({ email: usuario.email });
  });

  rotas.post('/sessoes', async (req, res) => {
    const corpo = (req.body ?? {}) as { email?: unknown; senha?: unknown };
    const email = typeof corpo.email === 'string' ? normalizarEmail(corpo.email) : '';
    const senha = typeof corpo.senha === 'string' ? corpo.senha : '';

    const conta = emailValido(email) ? await contas.contaPorEmail(email) : null;
    const senhaCerta = await conferirSenha(senha, conta?.senhaHash ?? (await senhaDeMentira));
    if (!conta || !senhaCerta) {
      res.status(401).json({ erro: MENSAGENS.entrarErrado });
      return;
    }

    await abrirSessao(req, res, conta);
    res.json({ email: conta.email });
  });

  rotas.delete('/sessoes', async (req, res) => {
    const codigo = lerCookie(req.headers.cookie, NOME_DO_COOKIE);
    if (codigo) await contas.apagarSessao(impressaoDoCodigo(codigo, segredo));
    res.clearCookie(NOME_DO_COOKIE, opcoesDoCookie(req.secure));
    res.status(204).end();
  });

  rotas.get('/eu', async (req, res) => {
    const usuario = await lerUsuario(req);
    if (!usuario) {
      res.status(401).json({ erro: MENSAGENS.naoEntrou });
      return;
    }
    res.json({ email: usuario.email });
  });

  return rotas;
}

/** A versão de verdade, no PostgreSQL. */
export function repositorioDeContas(pool: pg.Pool): RepositorioDeContas {
  return {
    async criarUsuario(email, senhaHash) {
      const { rows } = await pool.query<{ id: string; email: string }>(
        'INSERT INTO usuarios (email, senha_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING RETURNING id, email',
        [email, senhaHash],
      );
      return rows[0] ? { id: Number(rows[0].id), email: rows[0].email } : null;
    },

    async contaPorEmail(email) {
      const { rows } = await pool.query<{ id: string; email: string; senha_hash: string }>(
        'SELECT id, email, senha_hash FROM usuarios WHERE email = $1',
        [email],
      );
      return rows[0] ? { id: Number(rows[0].id), email: rows[0].email, senhaHash: rows[0].senha_hash } : null;
    },

    async criarSessao(usuarioId, impressao, expiraEm) {
      await pool.query('INSERT INTO sessoes (usuario_id, token_hash, expira_em) VALUES ($1, $2, $3)', [
        usuarioId,
        impressao,
        expiraEm,
      ]);
    },

    async usuarioDaSessao(impressao) {
      const { rows } = await pool.query<{ id: string; email: string }>(
        `SELECT u.id, u.email
           FROM sessoes s
           JOIN usuarios u ON u.id = s.usuario_id
          WHERE s.token_hash = $1 AND s.expira_em > now()`,
        [impressao],
      );
      return rows[0] ? { id: Number(rows[0].id), email: rows[0].email } : null;
    },

    async apagarSessao(impressao) {
      await pool.query('DELETE FROM sessoes WHERE token_hash = $1', [impressao]);
    },
  };
}
