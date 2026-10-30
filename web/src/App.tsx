import { useEffect, useState } from 'react';
import { quemEntrou, sair } from './api';
import { MinhasFontes } from './MinhasFontes';
import { TelaDaFonte } from './TelaDaFonte';
import { TelaEntrar } from './TelaEntrar';

/**
 * Quem não entrou fica em /. Quem entrou fica em /fontes ou em /fontes/:id;
 * qualquer outro endereço leva para /fontes.
 */
function enderecoCerto(email: string | null, caminho: string) {
  if (!email) return '/';
  return /^\/fontes(\/[^/]+)?$/.test(caminho) ? caminho : '/fontes';
}

export function App() {
  // undefined: ainda perguntando ao servidor; null: ninguém entrou.
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [caminho, setCaminho] = useState(location.pathname);

  function irPara(novo: string, jeito: 'trocar' | 'avancar') {
    if (location.pathname !== novo) {
      if (jeito === 'avancar') history.pushState(null, '', novo);
      else history.replaceState(null, '', novo);
    }
    setCaminho(novo);
  }

  useEffect(() => {
    // Ao abrir a página e ao apertar "voltar", pergunta de novo quem está entrado.
    const conferir = () =>
      quemEntrou().then((quem) => {
        irPara(enderecoCerto(quem, location.pathname), 'trocar');
        setEmail(quem);
      });
    conferir();
    addEventListener('popstate', conferir);
    return () => removeEventListener('popstate', conferir);
  }, []);

  function entrou(quem: string) {
    irPara('/fontes', 'avancar');
    setEmail(quem);
  }

  async function saiu() {
    await sair();
    irPara('/', 'avancar');
    setEmail(null);
  }

  if (email === undefined) return null;
  if (!email) return <TelaEntrar aoEntrar={entrou} />;

  const idDaFonte = caminho.match(/^\/fontes\/([^/]+)$/)?.[1];
  if (idDaFonte) {
    return (
      <TelaDaFonte id={idDaFonte} email={email} aoSair={saiu} aoVoltar={() => irPara('/fontes', 'avancar')} />
    );
  }
  return <MinhasFontes email={email} aoSair={saiu} aoAbrir={(id) => irPara(`/fontes/${id}`, 'avancar')} />;
}
