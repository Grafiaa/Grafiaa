type Campo = 'email' | 'senha';

export type ResultadoDeCriarConta = { ok: true; email: string } | { ok: false; erro: string; campo?: Campo };

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

export async function criarConta(email: string, senha: string): Promise<ResultadoDeCriarConta> {
  try {
    const resposta = await fetch('/api/contas', {
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
