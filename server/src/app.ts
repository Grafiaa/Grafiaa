import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { type RepositorioDeContas, rotasDeContas } from './contas.js';

export interface Opcoes {
  /** Resolve se o banco responde; rejeita se não responde. */
  verificarBanco: () => Promise<void>;
  /** Pasta com o front já compilado (web/dist). Se não existir, só a API sobe. */
  pastaWeb?: string;
  /** Contas e sessões. Sem isso, as rotas de conta não existem. */
  contas?: { repositorio: RepositorioDeContas; segredo: string };
}

export function criarApp({ verificarBanco, pastaWeb, contas }: Opcoes) {
  const app = express();
  app.disable('x-powered-by');
  // No Render, o HTTPS chega antes, num proxy; assim o Express sabe que a visita veio por HTTPS.
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '5mb' }));

  app.get('/health', async (_req, res) => {
    try {
      await verificarBanco();
      res.json({ status: 'ok', banco: 'ok' });
    } catch {
      res.status(503).json({ status: 'erro', banco: 'erro' });
    }
  });

  if (contas) app.use('/api', rotasDeContas(contas.repositorio, contas.segredo));

  app.use('/api', (_req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
  });

  if (pastaWeb && fs.existsSync(pastaWeb)) {
    app.use(express.static(pastaWeb));
    app.get('/{*caminho}', (_req, res) => {
      res.sendFile(path.join(pastaWeb, 'index.html'));
    });
  }

  return app;
}
