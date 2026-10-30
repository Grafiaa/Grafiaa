import { useEffect, useState } from 'react';
import { quemEntrou, sair } from './api';
import { MinhasFontes } from './MinhasFontes';
import { TelaEntrar } from './TelaEntrar';

/** Quem entrou fica em /fontes; quem não entrou fica em /. Abrir /fontes sem ter entrado volta para /. */
function ajustarEndereco(email: string | null, jeito: 'trocar' | 'avancar') {
  const certo = email ? '/fontes' : '/';
  if (location.pathname === certo) return;
  if (jeito === 'avancar') history.pushState(null, '', certo);
  else history.replaceState(null, '', certo);
}

export function App() {
  // undefined: ainda perguntando ao servidor; null: ninguém entrou.
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    // Ao abrir a página e ao apertar "voltar", pergunta de novo quem está entrado.
    const conferir = () =>
      quemEntrou().then((quem) => {
        ajustarEndereco(quem, 'trocar');
        setEmail(quem);
      });
    conferir();
    addEventListener('popstate', conferir);
    return () => removeEventListener('popstate', conferir);
  }, []);

  function entrou(quem: string) {
    ajustarEndereco(quem, 'avancar');
    setEmail(quem);
  }

  async function saiu() {
    await sair();
    ajustarEndereco(null, 'avancar');
    setEmail(null);
  }

  if (email === undefined) return null;
  return email ? <MinhasFontes email={email} aoSair={saiu} /> : <TelaEntrar aoEntrar={entrou} />;
}
