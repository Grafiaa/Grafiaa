import { describe, expect, it } from 'vitest';
import { conferirSenha, gerarHashDeSenha } from '../src/senha.js';

describe('senha guardada', () => {
  it('não guarda a senha nem um pedaço dela', async () => {
    const guardado = await gerarHashDeSenha('letras123');
    expect(guardado).not.toContain('letras123');
    expect(guardado).toMatch(/^[0-9a-f]{32}:[0-9a-f]{128}$/);
  });

  it('confere a senha certa', async () => {
    const guardado = await gerarHashDeSenha('letras123');
    expect(await conferirSenha('letras123', guardado)).toBe(true);
  });

  it('recusa uma senha errada', async () => {
    const guardado = await gerarHashDeSenha('letras123');
    expect(await conferirSenha('errada123', guardado)).toBe(false);
  });

  it('guarda a mesma senha de jeitos diferentes, por causa do sal', async () => {
    const primeiro = await gerarHashDeSenha('letras123');
    const segundo = await gerarHashDeSenha('letras123');
    expect(primeiro).not.toBe(segundo);
  });

  it('recusa um valor guardado estragado em vez de travar', async () => {
    expect(await conferirSenha('letras123', 'nada-a-ver')).toBe(false);
    expect(await conferirSenha('letras123', 'abc:123')).toBe(false);
  });
});
