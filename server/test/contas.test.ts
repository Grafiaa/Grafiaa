import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { criarApp } from '../src/app.js';
import { MENSAGENS } from '../src/contas.js';
import { conferirSenha } from '../src/senha.js';
import { contasDeMentira } from './bancoDeMentira.js';

function montar() {
  const banco = contasDeMentira();
  const app = criarApp({
    verificarBanco: async () => {},
    contas: { repositorio: banco.repositorio, segredo: 'segredo-de-teste' },
  });
  return { app, ...banco };
}

function cookieDaSessao(resposta: request.Response): string {
  const cookies = ([] as string[]).concat(resposta.headers['set-cookie'] ?? []);
  const cookie = cookies.find((c) => c.startsWith('grafiaa_sessao='));
  if (!cookie) throw new Error('A resposta não trouxe o cookie da sessão');
  return cookie;
}

describe('criar conta (RF01)', () => {
  it('cenário 1: cria a conta, já entra e o /api/eu diz quem é', async () => {
    const { app } = montar();
    const resposta = await request(app).post('/api/contas').send({ email: 'ana@exemplo.com', senha: 'letras123' });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual({ email: 'ana@exemplo.com' });
    const cookie = cookieDaSessao(resposta);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');

    const eu = await request(app).get('/api/eu').set('Cookie', cookie.split(';')[0]);
    expect(eu.status).toBe(200);
    expect(eu.body).toEqual({ email: 'ana@exemplo.com' });
  });

  it('cenário 2: e-mail já usado responde 409 com a mensagem', async () => {
    const { app } = montar();
    await request(app).post('/api/contas').send({ email: 'ana@exemplo.com', senha: 'letras123' });
    const resposta = await request(app).post('/api/contas').send({ email: 'ana@exemplo.com', senha: 'outra1234' });

    expect(resposta.status).toBe(409);
    expect(resposta.body).toEqual({ erro: MENSAGENS.emailRepetido, campo: 'email' });
  });

  it('cenário 3: senha de 7 caracteres responde 400 e a conta não é criada', async () => {
    const { app, usuarios } = montar();
    const resposta = await request(app).post('/api/contas').send({ email: 'ana@exemplo.com', senha: 'abc1234' });

    expect(resposta.status).toBe(400);
    expect(resposta.body).toEqual({ erro: 'A senha precisa ter pelo menos 8 caracteres.', campo: 'senha' });
    expect(usuarios).toHaveLength(0);
  });

  it('critério 4: a senha não volta na resposta e o banco guarda só a versão embaralhada', async () => {
    const { app, usuarios } = montar();
    const resposta = await request(app).post('/api/contas').send({ email: 'ana@exemplo.com', senha: 'letras123' });

    expect(JSON.stringify(resposta.body)).not.toContain('letras123');
    expect(usuarios[0].senhaHash).not.toContain('letras123');
    expect(await conferirSenha('letras123', usuarios[0].senhaHash)).toBe(true);
  });

  it('ANA@Exemplo.com é o mesmo e-mail de ana@exemplo.com', async () => {
    const { app } = montar();
    await request(app).post('/api/contas').send({ email: 'ana@exemplo.com', senha: 'letras123' });
    const resposta = await request(app).post('/api/contas').send({ email: ' ANA@Exemplo.com ', senha: 'letras123' });

    expect(resposta.status).toBe(409);
  });

  it('e-mail inválido responde 400 com a mensagem do protótipo', async () => {
    const { app } = montar();
    const resposta = await request(app).post('/api/contas').send({ email: 'ana-sem-arroba', senha: 'letras123' });

    expect(resposta.status).toBe(400);
    expect(resposta.body).toEqual({ erro: 'Informe um e-mail válido.', campo: 'email' });
  });
});

describe('entrar e sair (RF02)', () => {
  async function montarComAna() {
    const montado = montar();
    await request(montado.app).post('/api/contas').send({ email: 'ana@exemplo.com', senha: 'letras123' });
    return montado;
  }

  it('cenário 1: com o e-mail e a senha certos, entra e o /api/eu diz quem é', async () => {
    const { app } = await montarComAna();
    const resposta = await request(app).post('/api/sessoes').send({ email: 'ana@exemplo.com', senha: 'letras123' });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ email: 'ana@exemplo.com' });
    const eu = await request(app).get('/api/eu').set('Cookie', cookieDaSessao(resposta).split(';')[0]);
    expect(eu.body).toEqual({ email: 'ana@exemplo.com' });
  });

  it('cenário 2: senha errada responde 401 "E-mail ou senha incorretos."', async () => {
    const { app } = await montarComAna();
    const resposta = await request(app).post('/api/sessoes').send({ email: 'ana@exemplo.com', senha: 'errada123' });

    expect(resposta.status).toBe(401);
    expect(resposta.body).toEqual({ erro: 'E-mail ou senha incorretos.' });
    expect(resposta.headers['set-cookie']).toBeUndefined();
  });

  it('cenário 4: e-mail sem conta responde exatamente o mesmo que a senha errada', async () => {
    const { app } = await montarComAna();
    const senhaErrada = await request(app).post('/api/sessoes').send({ email: 'ana@exemplo.com', senha: 'errada123' });
    const semConta = await request(app).post('/api/sessoes').send({ email: 'bia@exemplo.com', senha: 'letras123' });

    expect(semConta.status).toBe(senhaErrada.status);
    expect(semConta.body).toEqual(senhaErrada.body);
  });

  it('cenário 3: sair apaga o cookie e o cookie antigo deixa de valer', async () => {
    const { app } = await montarComAna();
    const entrou = await request(app).post('/api/sessoes').send({ email: 'ana@exemplo.com', senha: 'letras123' });
    const cookie = cookieDaSessao(entrou).split(';')[0];

    const saiu = await request(app).delete('/api/sessoes').set('Cookie', cookie);
    expect(saiu.status).toBe(204);
    expect(cookieDaSessao(saiu)).toMatch(/^grafiaa_sessao=;.*Expires=Thu, 01 Jan 1970/);

    const eu = await request(app).get('/api/eu').set('Cookie', cookie);
    expect(eu.status).toBe(401);
  });

  it('entra com o e-mail em maiúsculas', async () => {
    const { app } = await montarComAna();
    const resposta = await request(app).post('/api/sessoes').send({ email: ' ANA@Exemplo.com ', senha: 'letras123' });
    expect(resposta.status).toBe(200);
  });

  it('sair sem ter entrado responde 204 sem quebrar', async () => {
    const { app } = montar();
    const resposta = await request(app).delete('/api/sessoes');
    expect(resposta.status).toBe(204);
  });
});

describe('quem está entrado (/api/eu)', () => {
  it('responde 401 sem cookie', async () => {
    const { app } = montar();
    const resposta = await request(app).get('/api/eu');
    expect(resposta.status).toBe(401);
  });

  it('responde 401 com um cookie inventado', async () => {
    const { app } = montar();
    const resposta = await request(app).get('/api/eu').set('Cookie', 'grafiaa_sessao=inventado');
    expect(resposta.status).toBe(401);
  });

  it('o banco guarda a impressão, e não o código que vai no cookie', async () => {
    const { app, sessoes } = montar();
    const resposta = await request(app).post('/api/contas').send({ email: 'ana@exemplo.com', senha: 'letras123' });
    const codigo = cookieDaSessao(resposta).split(';')[0].split('=')[1];

    expect(sessoes).toHaveLength(1);
    expect(sessoes[0].impressao).not.toBe(codigo);
    expect(sessoes[0].impressao).not.toContain(codigo);
  });
});
