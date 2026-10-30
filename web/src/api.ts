import type { Contorno } from './desenho';

type Campo = 'email' | 'senha';

/** O que o card de Minhas fontes mostra. */
export interface ResumoDeFonte {
  id: number;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;
  glifos: number;
  amostra: { largura: number; contornos: Contorno[] }[];
}

export type ResultadoDeAcesso = { ok: true; email: string } | { ok: false; erro: string; campo?: Campo };

const SEM_SERVIDOR = 'Não deu para falar com o servidor. Tente de novo.';

/** E-mail de quem está entrado, ou null se ninguém entrou. */
export async function quemEntrou(): Promise<string | null> {
  try {
    const resposta = await fetch('/api/eu');
    if (!resposta.ok) return null;
    return ((await resposta.json()) as { email: string }).email;
  } catch {
    return null;
  }
}

/** Criar conta e entrar mandam o mesmo (e-mail e senha) e recebem o mesmo tipo de resposta. */
async function enviarAcesso(caminho: string, email: string, senha: string): Promise<ResultadoDeAcesso> {
  try {
    const resposta = await fetch(caminho, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });
    const corpo = (await resposta.json()) as { email?: string; erro?: string; campo?: Campo };
    if (resposta.ok && corpo.email) return { ok: true, email: corpo.email };
    return { ok: false, erro: corpo.erro ?? SEM_SERVIDOR, campo: corpo.campo };
  } catch {
    return { ok: false, erro: SEM_SERVIDOR };
  }
}

export function criarConta(email: string, senha: string) {
  return enviarAcesso('/api/contas', email, senha);
}

export function entrar(email: string, senha: string) {
  return enviarAcesso('/api/sessoes', email, senha);
}

export type ResultadoDaLista = { ok: true; fontes: ResumoDeFonte[]; limite: number } | { ok: false; erro: string };

export async function minhasFontes(): Promise<ResultadoDaLista> {
  try {
    const resposta = await fetch('/api/fontes');
    if (!resposta.ok) return { ok: false, erro: SEM_SERVIDOR };
    const corpo = (await resposta.json()) as { fontes: ResumoDeFonte[]; limite: number };
    return { ok: true, fontes: corpo.fontes, limite: corpo.limite };
  } catch {
    return { ok: false, erro: SEM_SERVIDOR };
  }
}

export type ResultadoDaFonte = { tipo: 'achou'; fonte: ResumoDeFonte } | { tipo: 'nao-achou' } | { tipo: 'erro' };

/** A fonte pelo endereço. "Não achou" vale para a que não existe e para a de outra pessoa. */
export async function abrirFonte(id: string): Promise<ResultadoDaFonte> {
  try {
    const resposta = await fetch(`/api/fontes/${encodeURIComponent(id)}`);
    if (resposta.status === 404) return { tipo: 'nao-achou' };
    if (!resposta.ok) return { tipo: 'erro' };
    return { tipo: 'achou', fonte: (await resposta.json()) as ResumoDeFonte };
  } catch {
    return { tipo: 'erro' };
  }
}

/** Apaga a sessão no servidor. Mesmo que a rede falhe, a tela volta para Entrar. */
export async function sair(): Promise<void> {
  try {
    await fetch('/api/sessoes', { method: 'DELETE' });
  } catch {
    // Sem rede, o cookie fica até vencer; a pessoa pode sair de novo depois.
  }
}
