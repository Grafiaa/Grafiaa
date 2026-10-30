import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { criarApp } from '../src/app.js';
import { GLIFO_DE_ESPACO } from '../src/fontes.js';
import { contasDeMentira, fontesDeMentira } from './bancoDeMentira.js';

/** App com a ana e a bia já com conta; devolve o cookie de cada uma. */
async function montar() {
  const contas = contasDeMentira();
  const fontes = fontesDeMentira();
  const app = criarApp({
    verificarBanco: async () => {},
    contas: { repositorio: contas.repositorio, segredo: 'segredo-de-teste' },
    fontes: fontes.repositorio,
  });
  async function entrarComo(email: string) {
    const resposta = await request(app).post('/api/contas').send({ email, senha: 'letras123' });
    const cookies = ([] as string[]).concat(resposta.headers['set-cookie'] ?? []);
    return cookies[0].split(';')[0];
  }
  const ana = await entrarComo('ana@exemplo.com');
  const bia = await entrarComo('bia@exemplo.com');
  return { app, fontes, ana, bia, idDaAna: 1, idDaBia: 2 };
}

const QUADRADO = {
  largura: 500,
  contornos: [
    {
      closed: true,
      pts: [
        { x: 50, y: 0, t: 'on' as const },
        { x: 450, y: 0, t: 'on' as const },
        { x: 450, y: 500, t: 'on' as const },
        { x: 50, y: 500, t: 'on' as const },
      ],
    },
  ],
};

describe('ver minhas fontes (RF03)', () => {
  it('cenário 1: quem acabou de criar a conta vê a lista vazia e o limite de 20', async () => {
    const { app, ana } = await montar();
    const resposta = await request(app).get('/api/fontes').set('Cookie', ana);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ fontes: [], limite: 20 });
  });

  it('cenário 2: a fonte aparece com o nome, a amostra e a data da última alteração', async () => {
    const { app, fontes, ana, idDaAna } = await montar();
    fontes.criar(idDaAna, 'Minha Serifa', { atualizadoEm: '2026-10-30T14:32:00.000Z', glifos: 2, amostra: [QUADRADO] });

    const resposta = await request(app).get('/api/fontes').set('Cookie', ana);

    expect(resposta.body.fontes).toHaveLength(1);
    expect(resposta.body.fontes[0]).toMatchObject({
      nome: 'Minha Serifa',
      atualizadoEm: '2026-10-30T14:32:00.000Z',
      glifos: 2,
      amostra: [QUADRADO],
    });
  });

  it('cenário 3: a fonte de outra pessoa não aparece na lista', async () => {
    const { app, fontes, ana, idDaBia } = await montar();
    fontes.criar(idDaBia, 'Runas da Bia');

    const resposta = await request(app).get('/api/fontes').set('Cookie', ana);

    expect(resposta.body.fontes).toEqual([]);
  });

  it('cenário 3: abrir o endereço da fonte de outra pessoa responde 404 "Fonte não encontrada."', async () => {
    const { app, fontes, ana, idDaBia } = await montar();
    const runas = fontes.criar(idDaBia, 'Runas da Bia');

    const resposta = await request(app).get(`/api/fontes/${runas.id}`).set('Cookie', ana);

    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual({ erro: 'Fonte não encontrada.' });
  });

  it('fonte de outra pessoa, que não existe ou com endereço estranho: a mesma resposta', async () => {
    const { app, fontes, ana, idDaBia } = await montar();
    const runas = fontes.criar(idDaBia, 'Runas da Bia');

    const deOutra = await request(app).get(`/api/fontes/${runas.id}`).set('Cookie', ana);
    const naoExiste = await request(app).get('/api/fontes/999').set('Cookie', ana);
    const estranho = await request(app).get('/api/fontes/abc').set('Cookie', ana);

    expect(naoExiste.status).toBe(deOutra.status);
    expect(naoExiste.body).toEqual(deOutra.body);
    expect(estranho.status).toBe(deOutra.status);
    expect(estranho.body).toEqual(deOutra.body);
  });

  it('a dona abre a própria fonte pelo endereço', async () => {
    const { app, fontes, bia, idDaBia } = await montar();
    const runas = fontes.criar(idDaBia, 'Runas da Bia');

    const resposta = await request(app).get(`/api/fontes/${runas.id}`).set('Cookie', bia);

    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ id: runas.id, nome: 'Runas da Bia' });
  });

  it('a lista vem da fonte alterada mais recente para a mais antiga', async () => {
    const { app, fontes, ana, idDaAna } = await montar();
    fontes.criar(idDaAna, 'Antiga', { atualizadoEm: '2026-10-01T10:00:00.000Z' });
    fontes.criar(idDaAna, 'Nova', { atualizadoEm: '2026-10-30T10:00:00.000Z' });

    const resposta = await request(app).get('/api/fontes').set('Cookie', ana);

    expect(resposta.body.fontes.map((f: { nome: string }) => f.nome)).toEqual(['Nova', 'Antiga']);
  });

  it('sem ter entrado, a lista e a fonte respondem 401', async () => {
    const { app } = await montar();
    expect((await request(app).get('/api/fontes')).status).toBe(401);
    expect((await request(app).get('/api/fontes/1')).status).toBe(401);
  });
});

describe('criar, renomear e excluir fonte (RF04)', () => {
  it('cenário 1: cria a fonte em branco com o nome e só o glifo de espaço', async () => {
    const { app, ana } = await montar();
    const criada = await request(app).post('/api/fontes').set('Cookie', ana).send({ nome: 'Minha Serifa' });

    expect(criada.status).toBe(201);
    expect(criada.body).toMatchObject({ nome: 'Minha Serifa', glifos: 1 });
    const lista = await request(app).get('/api/fontes').set('Cookie', ana);
    expect(lista.body.fontes.map((f: { nome: string }) => f.nome)).toEqual(['Minha Serifa']);
  });

  it('o glifo de espaço da fonte nova tem largura de 250 (RN08)', () => {
    expect(GLIFO_DE_ESPACO).toEqual({ nome: 'space', unicode: 32, largura: 250 });
  });

  it('cenário 2: renomear muda o nome da fonte', async () => {
    const { app, ana } = await montar();
    const criada = await request(app).post('/api/fontes').set('Cookie', ana).send({ nome: 'Minha Serifa' });
    const renomeada = await request(app)
      .patch(`/api/fontes/${criada.body.id}`)
      .set('Cookie', ana)
      .send({ nome: 'Serifa da Ana' });

    expect(renomeada.status).toBe(200);
    expect(renomeada.body.nome).toBe('Serifa da Ana');
    const lista = await request(app).get('/api/fontes').set('Cookie', ana);
    expect(lista.body.fontes[0].nome).toBe('Serifa da Ana');
  });

  it('cenário 3: excluir a única fonte deixa a lista vazia', async () => {
    const { app, ana } = await montar();
    const criada = await request(app).post('/api/fontes').set('Cookie', ana).send({ nome: 'Serifa da Ana' });
    const excluida = await request(app).delete(`/api/fontes/${criada.body.id}`).set('Cookie', ana);

    expect(excluida.status).toBe(204);
    const lista = await request(app).get('/api/fontes').set('Cookie', ana);
    expect(lista.body.fontes).toEqual([]);
  });

  it('cenário 4: fonte sem nome responde "Dê um nome para a fonte." e não é criada', async () => {
    const { app, ana, fontes } = await montar();
    const vazio = await request(app).post('/api/fontes').set('Cookie', ana).send({ nome: '' });
    const soEspacos = await request(app).post('/api/fontes').set('Cookie', ana).send({ nome: '   ' });

    expect(vazio.status).toBe(400);
    expect(vazio.body).toEqual({ erro: 'Dê um nome para a fonte.', campo: 'nome' });
    expect(soEspacos.body).toEqual(vazio.body);
    expect(fontes.fontes).toHaveLength(0);
  });

  it('o nome tem de 1 a 60 caracteres, ao criar e ao renomear (RN05)', async () => {
    const { app, ana } = await montar();
    const com60 = await request(app).post('/api/fontes').set('Cookie', ana).send({ nome: 'a'.repeat(60) });
    const com61 = await request(app).post('/api/fontes').set('Cookie', ana).send({ nome: 'a'.repeat(61) });
    const renomearVazio = await request(app).patch(`/api/fontes/${com60.body.id}`).set('Cookie', ana).send({ nome: ' ' });

    expect(com60.status).toBe(201);
    expect(com61.status).toBe(400);
    expect(com61.body.erro).toBe('O nome pode ter até 60 caracteres.');
    expect(renomearVazio.status).toBe(400);
    expect(renomearVazio.body.erro).toBe('Dê um nome para a fonte.');
  });

  it('cenário 5: com 20 fontes, a 21ª responde "Você chegou ao limite de 20 fontes." e não é criada', async () => {
    const { app, ana, fontes, idDaAna } = await montar();
    for (let i = 1; i <= 20; i++) fontes.criar(idDaAna, `Fonte ${i}`);

    const resposta = await request(app).post('/api/fontes').set('Cookie', ana).send({ nome: 'Mais uma' });

    expect(resposta.status).toBe(409);
    expect(resposta.body).toEqual({ erro: 'Você chegou ao limite de 20 fontes.' });
    expect(fontes.fontes).toHaveLength(20);
  });

  it('não dá para renomear nem excluir a fonte de outra pessoa (RN03)', async () => {
    const { app, fontes, ana, idDaBia } = await montar();
    const runas = fontes.criar(idDaBia, 'Runas da Bia');

    const renomear = await request(app).patch(`/api/fontes/${runas.id}`).set('Cookie', ana).send({ nome: 'Peguei' });
    const excluir = await request(app).delete(`/api/fontes/${runas.id}`).set('Cookie', ana);

    expect(renomear.status).toBe(404);
    expect(excluir.status).toBe(404);
    expect(fontes.fontes).toEqual([expect.objectContaining({ nome: 'Runas da Bia' })]);
  });

  it('sem ter entrado, criar, renomear e excluir respondem 401', async () => {
    const { app } = await montar();
    expect((await request(app).post('/api/fontes').send({ nome: 'X' })).status).toBe(401);
    expect((await request(app).patch('/api/fontes/1').send({ nome: 'X' })).status).toBe(401);
    expect((await request(app).delete('/api/fontes/1')).status).toBe(401);
  });
});
