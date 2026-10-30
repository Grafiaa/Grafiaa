type Campo = 'email' | 'senha';

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

/** Apaga a sessão no servidor. Mesmo que a rede falhe, a tela volta para Entrar. */
export async function sair(): Promise<void> {
  try {
    await fetch('/api/sessoes', { method: 'DELETE' });
  } catch {
    // Sem rede, o cookie fica até vencer; a pessoa pode sair de novo depois.
  }
}
