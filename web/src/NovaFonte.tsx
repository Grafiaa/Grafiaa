import { type FormEvent, useState } from 'react';
import { criarFonte } from './api';
import { Dialogo } from './Dialogo';

/** T3 do protótipo. Por enquanto só o ponto de partida Em branco; os outros chegam nas próximas features. */
export function NovaFonte({ aoCriar, aoFechar }: { aoCriar: () => void; aoFechar: () => void }) {
  const [nome, setNome] = useState('');
  const [erroDoNome, setErroDoNome] = useState('');
  const [erroDoForm, setErroDoForm] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErroDoForm('');
    if (!nome.trim()) {
      setErroDoNome('Dê um nome para a fonte.');
      return;
    }
    setEnviando(true);
    const resultado = await criarFonte(nome);
    setEnviando(false);
    if (resultado.ok) aoCriar();
    else if (resultado.campo === 'nome') setErroDoNome(resultado.erro);
    else setErroDoForm(resultado.erro);
  }

  return (
    <Dialogo titulo="Nova fonte" aoFechar={aoFechar}>
      <form onSubmit={enviar} noValidate>
        <div className="dialogo-corpo">
          {erroDoForm && (
            <p className="erro-do-form" role="alert">
              {erroDoForm}
            </p>
          )}

          <div className={erroDoNome ? 'campo com-erro' : 'campo'}>
            <label htmlFor="nome-da-fonte">Nome da fonte</label>
            <div className="entrada-com-contador">
              <input
                className="entrada"
                id="nome-da-fonte"
                maxLength={60}
                placeholder="Ex.: Ana Sans"
                autoComplete="off"
                autoFocus
                value={nome}
                onChange={(evento) => {
                  setNome(evento.target.value);
                  if (evento.target.value.trim()) setErroDoNome('');
                }}
                aria-invalid={Boolean(erroDoNome)}
                aria-describedby={erroDoNome ? 'nome-erro' : undefined}
              />
              <span className="contador mono">{nome.length}/60</span>
            </div>
            {erroDoNome && (
              <p className="erro-do-campo" id="nome-erro">
                {erroDoNome}
              </p>
            )}
          </div>

          <fieldset className="pontos-de-partida">
            <legend>Ponto de partida</legend>
            <label className="ponto escolhido">
              <input type="radio" name="partida" value="branco" defaultChecked />
              <span className="ponto-arte" aria-hidden="true" />
              <b>Em branco</b>
              <span className="ponto-texto">Só o glifo de espaço. Você adiciona o resto quando quiser.</span>
            </label>
            <p className="dica">Começar de uma fonte aberta, de um alfabeto inventado ou de um arquivo chega nas próximas atualizações.</p>
          </fieldset>
        </div>

        <footer className="dialogo-rodape">
          <button type="button" className="botao botao-contorno" onClick={aoFechar}>
            Cancelar
          </button>
          <button type="submit" className="botao botao-principal" disabled={enviando}>
            {enviando ? 'Criando…' : 'Criar fonte'}
          </button>
        </footer>
      </form>
    </Dialogo>
  );
}
