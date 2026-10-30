import { Marca } from './Marca';

/** T2 do protótipo, por enquanto só vazia. A lista de verdade chega na #13. */
export function MinhasFontes({ email, aoSair }: { email: string; aoSair: () => void }) {
  return (
    <>
      <header className="barra">
        <Marca />
        <div className="espaco" />
        <span className="quem">{email}</span>
        <button type="button" className="botao botao-contorno botao-pequeno" onClick={aoSair}>
          Sair
        </button>
      </header>

      <main className="pagina">
        <div className="pagina-topo">
          <h1>Minhas fontes</h1>
          <p className="meta">
            <span className="mono">0 de 20</span> fontes
          </p>
        </div>

        <section className="vazio" aria-labelledby="vazio-titulo">
          <h2 id="vazio-titulo">Você ainda não tem nenhuma fonte</h2>
          <p>
            Comece de uma fonte aberta em Latino, Grego ou Cirílico e mude o desenho das letras. Ou invente um
            alfabeto, desenhe um símbolo para cada tecla e digite com ele.
          </p>
        </section>
      </main>
    </>
  );
}
