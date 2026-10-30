import fs from 'node:fs';
import path from 'node:path';
import { criarApp } from './app.js';
import { criarPool } from './banco.js';
import { repositorioDeContas } from './contas.js';
import { repositorioDeFontes } from './fontes.js';
import { aplicarMigracoes } from './migracoes.js';

if (fs.existsSync('.env')) process.loadEnvFile('.env');

const raiz = process.cwd();
const pool = criarPool();
const segredo = process.env.SESSION_SECRET;

if (pool && !segredo) {
  throw new Error('Falta o SESSION_SECRET: sem ele, ninguém consegue criar conta nem entrar.');
}

if (pool) {
  const conexao = await pool.connect();
  try {
    const aplicadas = await aplicarMigracoes(conexao, path.join(raiz, 'server/migracoes'));
    if (aplicadas.length > 0) console.log(`Migrações aplicadas: ${aplicadas.join(', ')}`);
  } finally {
    conexao.release();
  }
} else {
  console.warn('Sem DATABASE_URL: o app sobe, mas o /health vai responder que o banco está fora.');
}

const app = criarApp({
  verificarBanco: async () => {
    if (!pool) throw new Error('Sem banco configurado');
    await pool.query('SELECT 1');
  },
  pastaWeb: path.join(raiz, 'web/dist'),
  contas: pool && segredo ? { repositorio: repositorioDeContas(pool), segredo } : undefined,
  fontes: pool ? repositorioDeFontes(pool) : undefined,
});

const porta = Number(process.env.PORT ?? 3000);
app.listen(porta, () => {
  console.log(`Grafiaa no ar em http://localhost:${porta}`);
});
