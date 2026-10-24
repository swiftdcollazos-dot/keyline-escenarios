export const nf = (v: number, dec = 0) =>
  Number.isFinite(v) ? v.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : '—'

export const COLOR_COL = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)']
export const LETRA = ['A', 'B', 'C', 'D']

export const ESTADO_TXT = { si: 'Sí', bajo: 'Marginal', no: 'No' } as const
