import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { criarApp } from '../src/app.js';
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
