import type { RepositorioDeContas } from '../src/contas.js';
import type { RepositorioDeFontes, ResumoDeFonte } from '../src/fontes.js';

/** Contas e sessões em memória, com o mesmo jeito do banco de verdade. */
export function contasDeMentira() {
  const usuarios: { id: number; email: string; senhaHash: string }[] = [];
  const sessoes: { usuarioId: number; impressao: string; expiraEm: Date }[] = [];
  const repositorio: RepositorioDeContas = {
    async criarUsuario(email, senhaHash) {
      if (usuarios.some((u) => u.email === email)) return null;
      const usuario = { id: usuarios.length + 1, email, senhaHash };
      usuarios.push(usuario);
      return { id: usuario.id, email };
    },
    async contaPorEmail(email) {
      return usuarios.find((u) => u.email === email) ?? null;
    },
    async criarSessao(usuarioId, impressao, expiraEm) {
      sessoes.push({ usuarioId, impressao, expiraEm });
    },
    async usuarioDaSessao(impressao) {
      const sessao = sessoes.find((s) => s.impressao === impressao && s.expiraEm > new Date());
      const usuario = sessao && usuarios.find((u) => u.id === sessao.usuarioId);
      return usuario ? { id: usuario.id, email: usuario.email } : null;
    },
    async apagarSessao(impressao) {
      const posicao = sessoes.findIndex((s) => s.impressao === impressao);
      if (posicao !== -1) sessoes.splice(posicao, 1);
    },
  };
  return { repositorio, usuarios, sessoes };
}

/** Fontes em memória. Cada uma guarda o id de quem é dona. */
export function fontesDeMentira() {
  const fontes: (ResumoDeFonte & { usuarioId: number })[] = [];
  const semDono = ({ usuarioId: _, ...resumo }: ResumoDeFonte & { usuarioId: number }) => resumo;
  const repositorio: RepositorioDeFontes = {
    async fontesDoUsuario(usuarioId) {
      return fontes
        .filter((f) => f.usuarioId === usuarioId)
        .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm))
        .map(semDono);
    },
    async fonteDoUsuario(usuarioId, fonteId) {
      const fonte = fontes.find((f) => f.id === fonteId && f.usuarioId === usuarioId);
      return fonte ? semDono(fonte) : null;
    },
    async criarFonteEmBranco(usuarioId, nome, limite) {
      if (fontes.filter((f) => f.usuarioId === usuarioId).length >= limite) return null;
      return semDono(criar(usuarioId, nome, { atualizadoEm: new Date().toISOString() }));
    },
    async renomearFonte(usuarioId, fonteId, nome) {
      const fonte = fontes.find((f) => f.id === fonteId && f.usuarioId === usuarioId);
      if (!fonte) return null;
      fonte.nome = nome;
      fonte.atualizadoEm = new Date().toISOString();
      return semDono(fonte);
    },
    async excluirFonte(usuarioId, fonteId) {
      const posicao = fontes.findIndex((f) => f.id === fonteId && f.usuarioId === usuarioId);
      if (posicao === -1) return false;
      fontes.splice(posicao, 1);
      return true;
    },
  };
  /** Põe uma fonte pronta na "mesa", como se já tivesse sido criada. */
  function criar(usuarioId: number, nome: string, extra: Partial<ResumoDeFonte> = {}) {
    const fonte = {
      id: (fontes.at(-1)?.id ?? 0) + 1,
      usuarioId,
      nome,
      criadoEm: '2026-10-29T12:00:00.000Z',
      atualizadoEm: '2026-10-29T12:00:00.000Z',
      glifos: 1,
      amostra: [],
      ...extra,
    };
    fontes.push(fonte);
    return fonte;
  }
  return { repositorio, criar, fontes };
}
