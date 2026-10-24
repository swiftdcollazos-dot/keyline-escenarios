import { useMemo, useState } from 'react'
import { METRICAS, metrica } from '../engine/metrics'
import { sensibilidad } from '../engine/sensitivity'
import type { Escenario } from '../engine/types'
import { nf } from './fmt'

export function Sensibilidad({ e }: { e: Escenario }) {
  const [id, setId] = useState('llaveFin')
  const m = metrica(id)
  const { base, barras } = useMemo(() => sensibilidad(e.datos, e.plano, m), [e, m])
  const max = Math.max(1e-9, ...barras.flatMap((b) => [Math.abs(b.bajo), Math.abs(b.alto)]))
  const W = 720
  const L = 250
  const mid = L + (W - L - 20) / 2
  const half = (W - L - 20) / 2 - 50
  const X = (v: number) => mid + (v / max) * half
  const fila = 30
  const H = 34 + barras.length * fila
  return (
    <section className="card" aria-labelledby="h-sens">
      <h2 id="h-sens">¿Qué dato mueve más el resultado?</h2>
      <p className="sub">
        Para «{e.nombre}». Cada dato se mueve ±10 % (las cotas ±0,5 m) uno a la vez. La barra azul es el dato hacia arriba y la ocre hacia abajo.
      </p>
      <div className="controls">
        <label htmlFor="sens-met">Resultado</label>
        <select id="sens-met" value={id} onChange={(ev) => setId(ev.target.value)}>
          {[...new Set(METRICAS.map((x) => x.grupo))].map((g) => (
            <optgroup key={g} label={g}>
              {METRICAS.filter((x) => x.grupo === g).map((x) => (
                <option key={x.id} value={x.id}>{x.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <span className="num">valor actual: {nf(base, m.dec)} {m.unidad}</span>
      </div>
      {barras.length === 0 ? (
        <p className="sub">Ningún dato numérico cambia este resultado.</p>
      ) : (
        <div className="tbl">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: W, minWidth: 520, height: 'auto', display: 'block' }} role="img" aria-label={`Sensibilidad de ${m.label}`}>
            <line x1={mid} x2={mid} y1={18} y2={H - 6} stroke="var(--muted)" />
            <text x={mid} y={12} textAnchor="middle" fontSize="11" fill="var(--muted)" fontFamily="var(--f-mono)">sin cambio</text>
            {barras.map((b, i) => {
              const y = 26 + i * fila
              const seg = (v: number, color: string) => (
                <rect x={Math.min(X(0), X(v))} y={y} width={Math.max(1, Math.abs(X(v) - X(0)))} height={fila - 12} fill={color} rx={3} />
              )
              const fin = (v: number) => (
                <text x={X(v) + (v >= 0 ? 6 : -6)} y={y + 13} textAnchor={v >= 0 ? 'start' : 'end'} fontSize="11" fill="var(--muted)" fontFamily="var(--f-mono)">
                  {v >= 0 ? '+' : '−'}{nf(Math.abs(v), Math.max(m.dec, 1))}
                </text>
              )
              const izq = Math.min(b.alto, b.bajo)
              const der = Math.max(b.alto, b.bajo)
              return (
                <g key={b.k}>
                  <text x={L - 10} y={y + 13} textAnchor="end" fontSize="12.5" fill="var(--ink)">{b.label}</text>
                  <text x={L - 10} y={y + 25} textAnchor="end" fontSize="10.5" fill="var(--muted)" fontFamily="var(--f-mono)">{b.cambio}</text>
                  {seg(b.alto, 'var(--occ)')}
                  {seg(b.bajo, 'var(--ori)')}
                  {izq < 0 && fin(izq)}
                  {der > 0 && fin(der)}
                </g>
              )
            })}
          </svg>
        </div>
      )}
    </section>
  )
}
