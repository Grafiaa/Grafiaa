import { type MouseEvent, useEffect, useState } from 'react';
import { type ResumoDeFonte, minhasFontes } from './api';
import { Barra } from './Barra';
import { caminhoDaLetra, textoDaAlteracao, textoDosGlifos } from './desenho';

/** Até 3 letras desenhadas, como no card do protótipo; sem nenhuma, um "Aa" apagado. */
function Amostra({ fonte }: { fonte: ResumoDeFonte }) {
  const letras = fonte.amostra.slice(0, 3);
  return (
    <svg viewBox="0 0 360 170" aria-hidden="true">
      {letras.length === 0 ? (
        <text className="amostra-vazia" x="180" y="121" textAnchor="middle">
          Aa
        </text>
      ) : (
        letras.map((letra, i) => (
          <svg
            key={i}
            x={180 - (letras.length * 96 - 8) / 2 + i * 96}
            y="40"
            width="88"
            height="88"
            viewBox={`0 -800 ${letra.largura} 1000`}
          >
            <path fillRule="evenodd" d={caminhoDaLetra(letra.contornos)} />
          </svg>
        ))
      )}
    </svg>
  );
}

function Marcas() {
  return (
    <>
      <span className="marca-canto ce" />
      <span className="marca-canto cd" />
      <span className="marca-canto be" />
      <span className="marca-canto bd" />
    </>
  );
}

type Estado = { tipo: 'carregando' } | { tipo: 'erro'; erro: string } | { tipo: 'pronto'; fontes: ResumoDeFonte[]; limite: number };

/** T2 do protótipo: as fontes de quem entrou, ou o quadro vazio. Criar fonte chega na #14. */
export function MinhasFontes({
  email,
  aoSair,
  aoAbrir,
}: {
  email: string;
  aoSair: () => void;
  aoAbrir: (id: number) => void;
}) {
  const [estado, setEstado] = useState<Estado>({ tipo: 'carregando' });

  useEffect(() => {
    minhasFontes().then((resultado) =>
      setEstado(resultado.ok ? { tipo: 'pronto', ...resultado } : { tipo: 'erro', erro: resultado.erro }),
    );
  }, []);

  function abrir(evento: MouseEvent, id: number) {
    evento.preventDefault();
    aoAbrir(id);
  }

  return (
    <>
      <Barra email={email} aoSair={aoSair} />

      <main className="pagina">
        <div className="pagina-topo">
          <h1>Minhas fontes</h1>
          {estado.tipo === 'pronto' && (
            <p className="meta">
              <span className="mono">
                {estado.fontes.length} de {estado.limite}
              </span>{' '}
              fontes
            </p>
          )}
        </div>

        {estado.tipo === 'erro' && (
          <p className="erro-do-form" role="alert">
            {estado.erro}
          </p>
        )}

        {estado.tipo === 'pronto' && estado.fontes.length === 0 && (
          <section className="vazio" aria-labelledby="vazio-titulo">
            <h2 id="vazio-titulo">Você ainda não tem nenhuma fonte</h2>
            <p>
              Comece de uma fonte aberta em Latino, Grego ou Cirílico e mude o desenho das letras. Ou invente um
              alfabeto, desenhe um símbolo para cada tecla e digite com ele.
            </p>
            <button type="button" className="botao botao-principal botao-grande" disabled>
              Criar minha primeira fonte
            </button>
            <p className="dica">Criar fonte chega na próxima atualização.</p>
          </section>
        )}

        {estado.tipo === 'pronto' && estado.fontes.length > 0 && (
          <div className="cards">
            {estado.fontes.map((fonte) => (
              <article className="card" key={fonte.id}>
                <a
                  className="card-arte"
                  href={`/fontes/${fonte.id}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={(e) => abrir(e, fonte.id)}
                >
                  <Marcas />
                  <Amostra fonte={fonte} />
                </a>
                <h2 className="card-nome">
                  <a href={`/fontes/${fonte.id}`} onClick={(e) => abrir(e, fonte.id)}>
                    {fonte.nome}
                  </a>
                </h2>
                <p className="card-meta">
                  {textoDosGlifos(fonte.glifos)} · {textoDaAlteracao(fonte.atualizadoEm)}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
