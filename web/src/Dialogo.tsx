import { type ReactNode, useEffect, useRef } from 'react';

/** Janela por cima da página, como as do protótipo. Esc fecha. */
export function Dialogo({
  titulo,
  pequeno,
  aoFechar,
  children,
}: {
  titulo: string;
  pequeno?: boolean;
  aoFechar: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  return (
    <dialog ref={ref} className={pequeno ? 'dialogo dialogo-pequeno' : 'dialogo'} aria-label={titulo} onClose={aoFechar}>
      <header className="dialogo-topo">
        <h2>{titulo}</h2>
      </header>
      {children}
    </dialog>
  );
}
