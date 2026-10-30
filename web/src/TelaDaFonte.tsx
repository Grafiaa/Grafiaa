import { type MouseEvent, useEffect, useState } from 'react';
import { type ResultadoDaFonte, abrirFonte } from './api';
import { Barra } from './Barra';
import { textoDaAlteracao, textoDosGlifos } from './desenho';

/** O endereço /fontes/:id. Por enquanto só o nome; as letras da fonte chegam na #15 (RF05). */
export function TelaDaFonte({
  id,
  email,
  aoSair,
  aoVoltar,
}: {
  id: string;
  email: string;
  aoSair: () => void;
  aoVoltar: () => void;
}) {
  const [resultado, setResultado] = useState<ResultadoDaFonte | null>(null);

  useEffect(() => {
    setResultado(null);
    abrirFonte(id).then(setResultado);
  }, [id]);

  function voltar(evento: MouseEvent) {
    evento.preventDefault();
    aoVoltar();
  }

  const nome = resultado?.tipo === 'achou' ? resultado.fonte.nome : null;

  return (
    <>
      <Barra email={email} aoSair={aoSair}>
        <nav className="caminho" aria-label="Você está em">
          <a href="/fontes" onClick={voltar}>
            Minhas fontes
          </a>
          {nome && (
            <>
              <span aria-hidden="true">/</span>
              <b>{nome}</b>
            </>
          )}
        </nav>
      </Barra>

      <main className="pagina">
        {resultado?.tipo === 'achou' && (
          <div className="pagina-topo">
            <div>
              <h1>{resultado.fonte.nome}</h1>
              <p className="meta">
                {textoDosGlifos(resultado.fonte.glifos)} · {textoDaAlteracao(resultado.fonte.atualizadoEm)}
              </p>
            </div>
          </div>
        )}

        {resultado?.tipo === 'nao-achou' && (
          <section className="vazio" aria-labelledby="nao-achou-titulo">
            <h2 id="nao-achou-titulo">Fonte não encontrada</h2>
            <p>Ela não existe, foi excluída ou é de outra pessoa.</p>
            <a className="botao botao-principal botao-grande" href="/fontes" onClick={voltar}>
              Voltar para Minhas fontes
            </a>
          </section>
        )}

        {resultado?.tipo === 'erro' && (
          <p className="erro-do-form" role="alert">
            Não deu para falar com o servidor. Tente de novo.
          </p>
        )}
      </main>
    </>
  );
}
