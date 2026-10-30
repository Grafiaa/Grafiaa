import { type KeyboardEvent, type MouseEvent, useEffect, useRef, useState } from 'react';
import { renomearFonte, type ResumoDeFonte } from './api';
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

function IconeDeMais() {
  return (
    <svg className="icone" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </svg>
  );
}

/** Um card de Minhas fontes, com o menu ⋯: Renomear (ali mesmo, no card) e Excluir. */
export function CardDaFonte({
  fonte,
  aoAbrir,
  aoMudar,
  aoPedirExclusao,
}: {
  fonte: ResumoDeFonte;
  aoAbrir: (id: number) => void;
  aoMudar: () => void;
  aoPedirExclusao: (fonte: ResumoDeFonte) => void;
}) {
  const [menuAberto, setMenuAberto] = useState(false);
  const [renomeando, setRenomeando] = useState(false);
  const [nome, setNome] = useState(fonte.nome);
  const [erro, setErro] = useState('');
  const menu = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora dele ou apertar Esc.
  useEffect(() => {
    if (!menuAberto) return;
    const fecharSeFora = (evento: globalThis.MouseEvent) => {
      if (!menu.current?.contains(evento.target as Node)) setMenuAberto(false);
    };
    const fecharComEsc = (evento: globalThis.KeyboardEvent) => {
      if (evento.key === 'Escape') setMenuAberto(false);
    };
    document.addEventListener('mousedown', fecharSeFora);
    document.addEventListener('keydown', fecharComEsc);
    return () => {
      document.removeEventListener('mousedown', fecharSeFora);
      document.removeEventListener('keydown', fecharComEsc);
    };
  }, [menuAberto]);

  function abrir(evento: MouseEvent) {
    evento.preventDefault();
    aoAbrir(fonte.id);
  }

  function comecarARenomear() {
    setMenuAberto(false);
    setNome(fonte.nome);
    setErro('');
    setRenomeando(true);
  }

  async function salvarNome() {
    const limpo = nome.trim();
    if (limpo === fonte.nome) {
      setRenomeando(false);
      return;
    }
    if (!limpo) {
      setErro('Dê um nome para a fonte.');
      return;
    }
    const resultado = await renomearFonte(fonte.id, limpo);
    if (!resultado.ok) {
      setErro(resultado.erro);
      return;
    }
    setRenomeando(false);
    aoMudar();
  }

  function teclas(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'Enter') salvarNome();
    if (evento.key === 'Escape') setRenomeando(false);
  }

  return (
    <article className="card">
      <a className="card-arte" href={`/fontes/${fonte.id}`} tabIndex={-1} aria-hidden="true" onClick={abrir}>
        <Marcas />
        <Amostra fonte={fonte} />
      </a>

      <div className="card-texto">
        {renomeando ? (
          <div className="card-renomear">
            <input
              className="entrada entrada-pequena"
              maxLength={60}
              autoFocus
              onFocus={(evento) => evento.target.select()}
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              onKeyDown={teclas}
              onBlur={() => (nome.trim() ? salvarNome() : setRenomeando(false))}
              aria-label="Novo nome da fonte"
              aria-invalid={Boolean(erro)}
            />
            {erro && <p className="erro-do-campo">{erro}</p>}
          </div>
        ) : (
          <h2 className="card-nome">
            <a href={`/fontes/${fonte.id}`} onClick={abrir}>
              {fonte.nome}
            </a>
          </h2>
        )}
        <p className="card-meta">
          {textoDosGlifos(fonte.glifos)} · {textoDaAlteracao(fonte.atualizadoEm)}
        </p>
      </div>

      <div className="card-menu" ref={menu}>
        <button
          type="button"
          className="botao-icone"
          aria-haspopup="menu"
          aria-expanded={menuAberto}
          aria-label={`Mais ações para ${fonte.nome}`}
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <IconeDeMais />
        </button>
        {menuAberto && (
          <div className="menu" role="menu">
            <button type="button" role="menuitem" onClick={comecarARenomear}>
              Renomear
            </button>
            <button
              type="button"
              role="menuitem"
              className="perigo"
              onClick={() => {
                setMenuAberto(false);
                aoPedirExclusao(fonte);
              }}
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
