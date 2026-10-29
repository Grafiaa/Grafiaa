import { describe, expect, it } from 'vitest';
import { gerarCodigoDeSessao, impressaoDoCodigo, lerCookie } from '../src/sessao.js';

describe('código e impressão da sessão', () => {
  it('sorteia um código diferente a cada vez', () => {
    const primeiro = gerarCodigoDeSessao();
    const segundo = gerarCodigoDeSessao();
    expect(primeiro).not.toBe(segundo);
    expect(primeiro.length).toBeGreaterThanOrEqual(40);
  });

  it('dá sempre a mesma impressão para o mesmo código e segredo', () => {
    expect(impressaoDoCodigo('abc', 'segredo')).toBe(impressaoDoCodigo('abc', 'segredo'));
  });

  it('muda a impressão quando o segredo muda', () => {
    expect(impressaoDoCodigo('abc', 'segredo')).not.toBe(impressaoDoCodigo('abc', 'outro-segredo'));
  });

  it('não guarda o código dentro da impressão', () => {
    const codigo = gerarCodigoDeSessao();
    expect(impressaoDoCodigo(codigo, 'segredo')).not.toContain(codigo);
  });
});

describe('leitura do cookie', () => {
  it('acha o cookie da sessão no meio de outros', () => {
    expect(lerCookie('tema=escuro; grafiaa_sessao=abc123; outro=1', 'grafiaa_sessao')).toBe('abc123');
  });

  it('responde nenhum quando o cookie não veio', () => {
    expect(lerCookie(undefined, 'grafiaa_sessao')).toBeUndefined();
    expect(lerCookie('tema=escuro', 'grafiaa_sessao')).toBeUndefined();
  });
});
