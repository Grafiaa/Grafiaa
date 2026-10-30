/** Um ponto do contorno: "on" fica na linha; "off" é alça de curva. O y cresce para cima, como nas fontes. */
export interface Ponto {
  x: number;
  y: number;
  t: 'on' | 'off';
}

export interface Contorno {
  closed: boolean;
  pts: Ponto[];
}

/** Caminho SVG de um contorno, igual ao do protótipo: duas alças viram curva; nenhuma vira reta. */
export function caminhoDoContorno(contorno: Contorno): string {
  const pontos = contorno.pts;
  const inicio = pontos.findIndex((p) => p.t !== 'off');
  if (inicio < 0) return '';

  let caminho = `M${pontos[inicio].x} ${-pontos[inicio].y}`;
  let alcas: Ponto[] = [];
  for (let k = 1; k <= pontos.length; k++) {
    if (k === pontos.length && !contorno.closed) break;
    const ponto = pontos[(inicio + k) % pontos.length];
    if (ponto.t === 'off') {
      alcas.push(ponto);
      continue;
    }
    caminho +=
      alcas.length === 2
        ? ` C${alcas[0].x} ${-alcas[0].y} ${alcas[1].x} ${-alcas[1].y} ${ponto.x} ${-ponto.y}`
        : ` L${ponto.x} ${-ponto.y}`;
    alcas = [];
  }
  return contorno.closed ? `${caminho}Z` : caminho;
}

/** Só os contornos fechados vão para o desenho cheio da letra. */
export function caminhoDaLetra(contornos: Contorno[]): string {
  return contornos
    .filter((c) => c.closed)
    .map(caminhoDoContorno)
    .join(' ');
}

const doisDigitos = (n: number) => String(n).padStart(2, '0');

function mesmoDia(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "alterada hoje, 14:32", "alterada ontem, 22:10" ou "alterada em 12/10/2026", como no protótipo. */
export function textoDaAlteracao(iso: string, agora = new Date()): string {
  const data = new Date(iso);
  const hora = `${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}`;
  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);
  if (mesmoDia(data, agora)) return `alterada hoje, ${hora}`;
  if (mesmoDia(data, ontem)) return `alterada ontem, ${hora}`;
  return `alterada em ${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}/${data.getFullYear()}`;
}

export function textoDosGlifos(quantos: number): string {
  return quantos === 1 ? '1 glifo' : `${quantos} glifos`;
}
