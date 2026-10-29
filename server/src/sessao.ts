import { createHmac, randomBytes } from 'node:crypto';
import type { CookieOptions } from 'express';

export const NOME_DO_COOKIE = 'grafiaa_sessao';

/** Quanto tempo a pessoa fica entrada sem precisar entrar de novo: 30 dias. */
export const DURACAO_DA_SESSAO_MS = 30 * 24 * 60 * 60 * 1000;

/** Código aleatório que vai no cookie. Só o navegador da pessoa conhece. */
export function gerarCodigoDeSessao(): string {
  return randomBytes(32).toString('base64url');
}

/** Impressão digital do código, embaralhada com o SESSION_SECRET. É o que vai para o banco. */
export function impressaoDoCodigo(codigo: string, segredo: string): string {
  return createHmac('sha256', segredo).update(codigo).digest('hex');
}

/** Cookie que o JavaScript da página não lê, que outro site não usa e que, em produção, só viaja por HTTPS. */
export function opcoesDoCookie(seguro: boolean): CookieOptions {
  return { httpOnly: true, secure: seguro, sameSite: 'lax', path: '/', maxAge: DURACAO_DA_SESSAO_MS };
}

/** Acha o valor de um cookie no cabeçalho Cookie que o navegador manda. */
export function lerCookie(cabecalho: string | undefined, nome: string): string | undefined {
  if (!cabecalho) return undefined;
  for (const parte of cabecalho.split(';')) {
    const igual = parte.indexOf('=');
    if (igual === -1) continue;
    if (parte.slice(0, igual).trim() === nome) return decodeURIComponent(parte.slice(igual + 1).trim());
  }
  return undefined;
}
