import { type FormEvent, useState } from 'react';
import { criarConta, entrar } from './api';
import { Marca } from './Marca';

type Aba = 'entrar' | 'criar';
type Erros = Partial<Record<'email' | 'senha', string>>;

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** T1 do protótipo: abas Entrar e Criar conta. */
export function TelaEntrar({ aoEntrar }: { aoEntrar: (email: string) => void }) {
  const [aba, setAba] = useState<Aba>('entrar');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<Erros>({});
  const [erroDoForm, setErroDoForm] = useState('');
  const [enviando, setEnviando] = useState(false);
  const criando = aba === 'criar';

  function trocarAba(nova: Aba) {
    setAba(nova);
    setErros({});
    setErroDoForm('');
  }

  function conferirCampos(): Erros {
    const encontrados: Erros = {};
    if (!EMAIL_VALIDO.test(email.trim())) encontrados.email = 'Informe um e-mail válido.';
    if (!senha) encontrados.senha = 'Informe a senha.';
    else if (criando && senha.length < 8) encontrados.senha = 'A senha precisa ter pelo menos 8 caracteres.';
    return encontrados;
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErroDoForm('');
    const encontrados = conferirCampos();
    setErros(encontrados);
    if (Object.keys(encontrados).length > 0) return;

    setEnviando(true);
    const resultado = criando ? await criarConta(email, senha) : await entrar(email, senha);
    setEnviando(false);
    if (resultado.ok) aoEntrar(resultado.email);
    else if (resultado.campo) setErros({ [resultado.campo]: resultado.erro });
    else setErroDoForm(resultado.erro);
  }

  return (
    <div className="entrar">
      <section className="entrar-placa" aria-labelledby="titulo">
        <Marca />
        <h1 id="titulo">Desenhe letras. Invente alfabetos.</h1>
        <p className="lede">
          Modifique uma fonte aberta em Latino, Grego ou Cirílico, ou crie um alfabeto novo e digite com ele no
          teclado. Tudo no navegador.
        </p>
      </section>

      <section className="entrar-lado" aria-label="Acesso">
        <div className="abas" role="tablist" aria-label="Acesso">
          <button type="button" className="aba" role="tab" aria-selected={!criando} onClick={() => trocarAba('entrar')}>
            Entrar
          </button>
          <button type="button" className="aba" role="tab" aria-selected={criando} onClick={() => trocarAba('criar')}>
            Criar conta
          </button>
        </div>

        <form className="entrar-form" role="tabpanel" onSubmit={enviar} noValidate>
          {erroDoForm && (
            <p className="erro-do-form" role="alert">
              {erroDoForm}
            </p>
          )}

          <div className={erros.email ? 'campo com-erro' : 'campo'}>
            <label htmlFor="email">E-mail</label>
            <input
              className="entrada"
              id="email"
              type="email"
              autoComplete="email"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              aria-invalid={Boolean(erros.email)}
              aria-describedby={erros.email ? 'email-erro' : undefined}
            />
            {erros.email && (
              <p className="erro-do-campo" id="email-erro">
                {erros.email}
              </p>
            )}
          </div>

          <div className={erros.senha ? 'campo com-erro' : 'campo'}>
            <label htmlFor="senha">Senha</label>
            <input
              className="entrada"
              id="senha"
              type="password"
              autoComplete={criando ? 'new-password' : 'current-password'}
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              aria-invalid={Boolean(erros.senha)}
              aria-describedby={erros.senha ? 'senha-erro' : criando ? 'senha-dica' : undefined}
            />
            {erros.senha ? (
              <p className="erro-do-campo" id="senha-erro">
                {erros.senha}
              </p>
            ) : (
              criando && (
                <p className="dica" id="senha-dica">
                  Pelo menos 8 caracteres.
                </p>
              )
            )}
          </div>

          <button className="botao botao-principal botao-grande" type="submit" disabled={enviando}>
            {criando ? (enviando ? 'Criando conta…' : 'Criar conta') : enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </section>
    </div>
  );
}
