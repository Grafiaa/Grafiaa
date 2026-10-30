import { useCallback, useEffect, useState } from 'react';
import { type ResumoDeFonte, minhasFontes } from './api';
import { Barra } from './Barra';
import { CardDaFonte } from './CardDaFonte';
import { ExcluirFonte } from './ExcluirFonte';
import { NovaFonte } from './NovaFonte';

type Estado = { tipo: 'carregando' } | { tipo: 'erro'; erro: string } | { tipo: 'pronto'; fontes: ResumoDeFonte[]; limite: number };

/** T2 do protótipo: as fontes de quem entrou, ou o quadro vazio. */
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
  const [criando, setCriando] = useState(false);
  const [excluindo, setExcluindo] = useState<ResumoDeFonte | null>(null);

  const carregar = useCallback(() => {
    minhasFontes().then((resultado) =>
      setEstado(resultado.ok ? { tipo: 'pronto', ...resultado } : { tipo: 'erro', erro: resultado.erro }),
    );
  }, []);

  useEffect(carregar, [carregar]);

  return (
    <>
      <Barra email={email} aoSair={aoSair} />

      <main className="pagina">
        <div className="pagina-topo">
          <div>
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
          {estado.tipo === 'pronto' && estado.fontes.length > 0 && (
            <button type="button" className="botao botao-principal" onClick={() => setCriando(true)}>
              Nova fonte
            </button>
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
            <button type="button" className="botao botao-principal botao-grande" onClick={() => setCriando(true)}>
              Criar minha primeira fonte
            </button>
          </section>
        )}

        {estado.tipo === 'pronto' && estado.fontes.length > 0 && (
          <div className="cards">
            {estado.fontes.map((fonte) => (
              <CardDaFonte
                key={fonte.id}
                fonte={fonte}
                aoAbrir={aoAbrir}
                aoMudar={carregar}
                aoPedirExclusao={setExcluindo}
              />
            ))}
          </div>
        )}
      </main>

      {criando && (
        <NovaFonte
          aoFechar={() => setCriando(false)}
          aoCriar={() => {
            setCriando(false);
            carregar();
          }}
        />
      )}

      {excluindo && (
        <ExcluirFonte
          fonte={excluindo}
          aoFechar={() => setExcluindo(null)}
          aoExcluir={() => {
            setExcluindo(null);
            carregar();
          }}
        />
      )}
    </>
  );
}
