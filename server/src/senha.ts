import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt) as (senha: string, sal: Buffer, tamanho: number) => Promise<Buffer>;

const TAMANHO_DO_HASH = 64;

/** Embaralha a senha com scrypt e um sal aleatório. Devolve "sal:hash" em hexadecimal, que é o que vai para o banco. */
export async function gerarHashDeSenha(senha: string): Promise<string> {
  const sal = randomBytes(16);
  const hash = await scryptAsync(senha, sal, TAMANHO_DO_HASH);
  return `${sal.toString('hex')}:${hash.toString('hex')}`;
}

/** Confere a senha digitada contra o "sal:hash" guardado, comparando sempre no mesmo tempo. */
export async function conferirSenha(senha: string, guardado: string): Promise<boolean> {
  const [salHex, hashHex] = guardado.split(':');
  if (!salHex || !hashHex) return false;

  const esperado = Buffer.from(hashHex, 'hex');
  if (esperado.length !== TAMANHO_DO_HASH) return false;

  const hash = await scryptAsync(senha, Buffer.from(salHex, 'hex'), TAMANHO_DO_HASH);
  return timingSafeEqual(hash, esperado);
}
