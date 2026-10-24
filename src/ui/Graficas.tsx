import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Resultados } from '../engine/calc'
import type { Escenario, Represa } from '../engine/types'
import { COLOR_COL, LETRA, nf } from './fmt'

const eje = { stroke: 'var(--line)', tick: { fill: 'var(--muted)' } }
const tip = { contentStyle: { background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--ink)' } }

function porX<T>(series: { x: number; y: number }[][], nombre: (i: number) => string) {
  const xs = [...new Set(series.flatMap((s) => s.map((p) => p.x)))].sort((a, b) => a - b)
  return xs.map((x) => {
    const fila: Record<string, number> = { x }
    series.forEach((s, i) => {
      const p = s.find((q) => q.x === x)
      if (p) fila[nombre(i)] = p.y
    })
    return fila as T
  })
}

interface Props {
  esc: Escenario[]
  res: Resultados[]
}

function Nivel({ esc, res }: Props) {
  const [rep, setRep] = useState<Represa>('ori')
  const datos = porX<Record<string, number>>(
    res.map((r) => r[rep].serie.map((p) => ({ x: p.dia, y: p.nivel }))),
    (i) => LETRA[i],
  )
  return (
    <section className="card">
      <h2>Nivel del agua en el verano</h2>
      <p className="sub">Hoja 5, día a día, con el espejo que se achica al bajar el agua. Cada escenario simula su propia duración de verano.</p>
      <div className="controls" role="radiogroup" aria-label="Represa">
        <label><input type="radio" name="rep" checked={rep === 'occ'} onChange={() => setRep('occ')} /> Occidental</label>
        <label><input type="radio" name="rep" checked={rep === 'ori'} onChange={() => setRep('ori')} /> Oriental (alimenta la casa)</label>
      </div>
      <div className="chart-box">
        <ResponsiveContainer>
          <LineChart data={datos} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" type="number" domain={[0, 'dataMax']} {...eje} label={{ value: 'día del verano', position: 'insideBottomRight', offset: -2, fill: 'var(--muted)' }} />
            <YAxis domain={['auto', 'auto']} {...eje} tickFormatter={(v) => nf(v, 1)} width={52} />
            <Tooltip {...tip} formatter={(v: number) => `${nf(v, 2)} m`} labelFormatter={(d) => `Día ${d}`} />
            <Legend formatter={(v) => `${v} · ${esc[LETRA.indexOf(v)]?.nombre ?? ''}`} />
            {rep === 'ori' &&
              [...new Set(esc.map((e) => e.datos.Cota_casa))].map((c) => (
                <ReferenceLine key={c} y={c} stroke="var(--bad)" strokeDasharray="4 4" label={{ value: `casa ${nf(c, 1)} m`, fill: 'var(--bad)', position: 'insideTopRight' }} />
              ))}
            {res.map((_, i) => (
              <Line key={i} dataKey={LETRA[i]} stroke={COLOR_COL[i]} strokeWidth={2} dot={false} strokeDasharray={i ? undefined : undefined} isAnimationActive={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function Tubo({ esc, res }: Props) {
  const ds = Array.from({ length: 33 }, (_, i) => 18 + i)
  const datos = ds.map((d) => {
    const fila: Record<string, number> = { x: d }
    res.forEach((r, i) => (fila[LETRA[i]] = r.llaveSegunDiametro(d)))
    return fila
  })
  return (
    <section className="card">
      <h2>Carga en la llave según el diámetro</h2>
      <p className="sub">Hoja 8, al final del verano, con el caudal de diseño. Debajo de cero el agua no llega. El punto es el diámetro de cada escenario.</p>
      <div className="chart-box">
        <ResponsiveContainer>
          <LineChart data={datos} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" type="number" domain={[18, 50]} {...eje} label={{ value: 'diámetro interno (mm)', position: 'insideBottomRight', offset: -2, fill: 'var(--muted)' }} />
            <YAxis domain={[-4, 'auto']} allowDataOverflow {...eje} tickFormatter={(v) => nf(v, 0)} width={40} />
            <Tooltip {...tip} formatter={(v: number) => `${nf(v, 2)} m`} labelFormatter={(d) => `${d} mm`} />
            <ReferenceLine y={0} stroke="var(--muted)" />
            {res.map((_, i) => (
              <Line key={i} dataKey={LETRA[i]} stroke={COLOR_COL[i]} strokeWidth={2} dot={false} isAnimationActive={false} />
            ))}
            {res.map((r, i) => (
              <ReferenceDot key={`d${i}`} x={esc[i].datos.D_tubo} y={Math.max(-4, r.casa.llaveFin)} r={5} fill={COLOR_COL[i]} stroke="var(--surface)" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function Hondo({ esc, res }: Props) {
  const hs = Array.from({ length: 31 }, (_, i) => 1.5 + i * 0.2)
  const datos = hs.map((h) => {
    const fila: Record<string, number> = { x: Math.round(h * 10) / 10 }
    res.forEach((r, i) => (fila[LETRA[i]] = r.hondo(h).pct * 100))
    return fila
  })
  return (
    <section className="card">
      <h2>Más hondo, no más ancho</h2>
      <p className="sub">Hoja 4 D. Parte del volumen occidental que se evapora en el verano si el mismo volumen se guarda con otra profundidad. El punto es la profundidad de cada escenario.</p>
      <div className="chart-box">
        <ResponsiveContainer>
          <LineChart data={datos} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" type="number" domain={[1.5, 7.5]} {...eje} label={{ value: 'profundidad máxima (m)', position: 'insideBottomRight', offset: -2, fill: 'var(--muted)' }} />
            <YAxis {...eje} tickFormatter={(v) => `${nf(v, 0)} %`} width={48} />
            <Tooltip {...tip} formatter={(v: number) => `${nf(v, 0)} %`} labelFormatter={(d) => `${nf(Number(d), 1)} m`} />
            {res.map((_, i) => (
              <Line key={i} dataKey={LETRA[i]} stroke={COLOR_COL[i]} strokeWidth={2} dot={false} isAnimationActive={false} />
            ))}
            {res.map((r, i) => (
              <ReferenceDot key={`d${i}`} x={esc[i].datos.Hmax_occ} y={r.occ.evapPct * 100} r={5} fill={COLOR_COL[i]} stroke="var(--surface)" />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function Vertedero({ esc, res }: Props) {
  const cs = Array.from({ length: 21 }, (_, i) => i * 0.5)
  const datos = cs.map((c) => {
    const fila: Record<string, number> = { x: c }
    res.forEach((r, i) => (fila[LETRA[i]] = r.anchoHa * c))
    return fila
  })
  return (
    <section className="card">
      <h2>Ancho del vertedero según la cuenca</h2>
      <p className="sub">Hoja 6 C, ahora continuo. Los puntos marcan las cuencas que llegan a cada represa: la occidental (círculo) y la oriental, que suma las dos (cuadro).</p>
      <div className="chart-box">
        <ResponsiveContainer>
          <LineChart data={datos} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" type="number" domain={[0, 10]} {...eje} label={{ value: 'cuenca (ha)', position: 'insideBottomRight', offset: -2, fill: 'var(--muted)' }} />
            <YAxis {...eje} tickFormatter={(v) => `${nf(v, 0)} m`} width={44} />
            <Tooltip {...tip} formatter={(v: number) => `${nf(v, 2)} m`} labelFormatter={(d) => `${nf(Number(d), 1)} ha`} />
            {res.map((_, i) => (
              <Line key={i} dataKey={LETRA[i]} stroke={COLOR_COL[i]} strokeWidth={2} dot={false} isAnimationActive={false} />
            ))}
            {res.map((r, i) => (
              <ReferenceDot key={`o${i}`} x={r.occ.cuenca} y={r.occ.vertedero.ancho} r={5} fill={COLOR_COL[i]} stroke="var(--surface)" />
            ))}
            {res.map((r, i) => (
              <ReferenceDot
                key={`r${i}`}
                x={r.ori.cuenca}
                y={r.ori.vertedero.ancho}
                r={5}
                shape={(p: { cx?: number; cy?: number }) => <rect x={(p.cx ?? 0) - 5} y={(p.cy ?? 0) - 5} width={10} height={10} fill={COLOR_COL[i]} stroke="var(--surface)" />}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="key">{esc.map((e, i) => <span key={i}><i style={{ borderColor: COLOR_COL[i] }} />{LETRA[i]} · {e.nombre}</span>)}</div>
    </section>
  )
}

export function Graficas(p: Props) {
  return (
    <>
      <Nivel {...p} />
      <div className="two">
        <Tubo {...p} />
        <Hondo {...p} />
      </div>
      <Vertedero {...p} />
    </>
  )
}

export { Nivel }
