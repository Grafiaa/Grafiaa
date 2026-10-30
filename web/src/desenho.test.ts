import { describe, expect, it } from 'vitest';
import { caminhoDaLetra, caminhoDoContorno, textoDaAlteracao, textoDosGlifos } from './desenho';

describe('desenho da amostra', () => {
  it('liga pontos na linha com retas e fecha o contorno', () => {
    const quadrado = {
      closed: true,
      pts: [
        { x: 0, y: 0, t: 'on' as const },
        { x: 100, y: 0, t: 'on' as const },
        { x: 100, y: 100, t: 'on' as const },
      ],
    };
    expect(caminhoDoContorno(quadrado)).toBe('M0 0 L100 0 L100 -100 L0 0Z');
  });

  it('faz curva quando há duas alças entre dois pontos', () => {
    const curva = {
      closed: false,
      pts: [
        { x: 0, y: 0, t: 'on' as const },
        { x: 0, y: 50, t: 'off' as const },
        { x: 50, y: 100, t: 'off' as const },
        { x: 100, y: 100, t: 'on' as const },
      ],
    };
    expect(caminhoDoContorno(curva)).toBe('M0 0 C0 -50 50 -100 100 -100');
  });

  it('deixa de fora os contornos abertos no desenho cheio da letra', () => {
    const aberto = { closed: false, pts: [{ x: 0, y: 0, t: 'on' as const }, { x: 10, y: 0, t: 'on' as const }] };
    const fechado = { closed: true, pts: [{ x: 0, y: 0, t: 'on' as const }, { x: 10, y: 0, t: 'on' as const }] };
    expect(caminhoDaLetra([aberto, fechado])).toBe('M0 0 L10 0 L0 0Z');
  });
});

describe('textos do card', () => {
  const agora = new Date(2026, 9, 30, 18, 0);

  it('diz "hoje" com a hora', () => {
    expect(textoDaAlteracao(new Date(2026, 9, 30, 14, 32).toISOString(), agora)).toBe('alterada hoje, 14:32');
  });

  it('diz "ontem" com a hora', () => {
    expect(textoDaAlteracao(new Date(2026, 9, 29, 22, 10).toISOString(), agora)).toBe('alterada ontem, 22:10');
  });

  it('mostra a data quando é mais antiga', () => {
    expect(textoDaAlteracao(new Date(2026, 9, 12, 9, 0).toISOString(), agora)).toBe('alterada em 12/10/2026');
  });

  it('escreve glifo no singular e no plural', () => {
    expect(textoDosGlifos(1)).toBe('1 glifo');
    expect(textoDosGlifos(27)).toBe('27 glifos');
  });
});
