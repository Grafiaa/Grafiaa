import type { ReactNode } from 'react';
import { Marca } from './Marca';

/** Barra do topo das telas de quem entrou: marca, caminho opcional, e-mail e Sair. */
export function Barra({ email, aoSair, children }: { email: string; aoSair: () => void; children?: ReactNode }) {
  return (
    <header className="barra">
      <Marca />
      {children}
      <div className="espaco" />
      <span className="quem">{email}</span>
      <button type="button" className="botao botao-contorno botao-pequeno" onClick={aoSair}>
        Sair
      </button>
    </header>
  );
}
