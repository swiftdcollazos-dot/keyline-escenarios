// Sensibilidad «uno a la vez»: mueve cada dato numérico un poco hacia arriba y
// hacia abajo y mide cuánto cambia la cifra elegida.

import { calcular } from './calc'
import { CAMPOS } from './fields'
import type { Metrica } from './metrics'
import type { Datos, Plano } from './types'

export interface Barra {
  k: keyof Datos
  label: string
  cambio: string
  bajo: number
  alto: number
}

export function sensibilidad(d: Datos, p: Plano, m: Metrica, rel = 0.1, top = 12): { base: number; barras: Barra[] } {
  const base = m.valor(calcular(d, p), d)
  const barras: Barra[] = []
  for (const c of CAMPOS) {
    const v = d[c.k]
    if (typeof v !== 'number' || v === 0 || c.k === 'Tolerancia') continue
    if (c.k === 'Parte_occ' && d.Reparto !== 'dividido') continue
    const delta = c.cota ? 0.5 : Math.abs(v) * rel
    const mover = (x: number) => {
      const val = c.min !== undefined ? Math.max(c.min, x) : x
      const nd = { ...d, [c.k]: c.max !== undefined ? Math.min(c.max, val) : val }
      const res = m.valor(calcular(nd, p), nd)
      return Number.isFinite(res) ? res - base : 0
    }
    const bajo = mover(v - delta)
    const alto = mover(v + delta)
    if (Math.abs(bajo) < 1e-9 && Math.abs(alto) < 1e-9) continue
    barras.push({ k: c.k, label: c.label, cambio: c.cota ? '±0,5 m' : `±${Math.round(rel * 100)} %`, bajo, alto })
  }
  barras.sort((a, b) => Math.max(Math.abs(b.bajo), Math.abs(b.alto)) - Math.max(Math.abs(a.bajo), Math.abs(a.alto)))
  return { base, barras: barras.slice(0, top) }
}
