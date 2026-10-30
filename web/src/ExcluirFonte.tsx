import { type FormEvent, useState } from 'react';
import { excluirFonte, type ResumoDeFonte } from './api';
import { Dialogo } from './Dialogo';

export function ExcluirFonte({
  fonte,
  aoExcluir,
  aoFechar,
}: {
  fonte: ResumoDeFonte;
  aoExcluir: () => void;
  aoFechar: () => void;
}) {
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function confirmar(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    const excluiu = await excluirFonte(fonte.id);
    setEnviando(false);
    if (excluiu) aoExcluir();
    else setErro('Não deu para excluir agora. Tente de novo.');
  }

  return (
    <Dialogo titulo="Excluir fonte?" pequeno aoFechar={aoFechar}>
      <form onSubmit={confirmar}>
        <div className="dialogo-corpo">
          {erro && (
            <p className="erro-do-form" role="alert">
              {erro}
            </p>
          )}
          <p>
            A fonte “{fonte.nome}” e todos os seus glifos serão apagados. Isso não tem volta.
          </p>
        </div>
        <footer className="dialogo-rodape">
          <button type="button" className="botao botao-contorno" onClick={aoFechar}>
            Cancelar
          </button>
          <button type="submit" className="botao botao-perigo" disabled={enviando} autoFocus>
            {enviando ? 'Excluindo…' : 'Excluir'}
          </button>
        </footer>
      </form>
    </Dialogo>
  );
}
