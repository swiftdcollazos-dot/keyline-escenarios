import { useState } from 'react'
import { DATOS_REFERENCIA, PLANO_REFERENCIA } from '../engine/data'
import { FUENTES, GRUPOS, type Campo } from '../engine/fields'
import type { Datos, Plano, Punto } from '../engine/types'
import type { Store } from '../state/store'

function Campo({ c, valor, onChange }: { c: Campo; valor: Datos[keyof Datos]; onChange: (v: Datos[keyof Datos]) => void }) {
  const ref = DATOS_REFERENCIA[c.k]
  const cambiado = valor !== ref
  const id = `in-${c.k}`
  const [texto, setTexto] = useState<string | null>(null)
  return (
    <div className={`field${cambiado ? ' cambiado' : ''}`}>
      <label className="lbl" htmlFor={id} title={`${FUENTES[c.fuente]} · ${c.nota}`}>
        <span className={`src ${c.fuente}`} />
        {c.label}
        <small>
          {c.unidad}
          {cambiado ? ` · referencia ${typeof ref === 'number' ? ref.toLocaleString('es-CO') : ref}` : ''}
        </small>
      </label>
      {c.opciones ? (
        <select id={id} value={String(valor)} onChange={(e) => onChange(e.target.value as Datos[keyof Datos])}>
          {c.opciones.map(([v, t]) => (
            <option key={v} value={v}>{t}</option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={c.paso}
          min={c.min}
          max={c.max}
          value={texto ?? String(valor)}
          onChange={(e) => {
            setTexto(e.target.value)
            const v = parseFloat(e.target.value)
            if (Number.isFinite(v) && (c.min === undefined || v >= c.min) && (c.max === undefined || v <= c.max)) onChange(v)
          }}
          onBlur={() => setTexto(null)}
        />
      )}
      <button className="reset" type="button" title="Volver al valor de referencia" aria-label={`Volver ${c.label} a la referencia`} onClick={() => { setTexto(null); onChange(ref) }}>
        ↺
      </button>
    </div>
  )
}

const aTexto = (pts: Punto[]) => pts.map(([x, y]) => `${x}, ${y}`).join('\n')
const deTexto = (t: string): Punto[] | null => {
  const pts = t
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split(/[,;\s]+/).map(Number))
  return pts.length >= 2 && pts.every((p) => p.length === 2 && p.every(Number.isFinite)) ? (pts as Punto[]) : null
}

function Poligono({ titulo, valor, onChange, min }: { titulo: string; valor: Punto[]; onChange: (p: Punto[]) => void; min: number }) {
  const [texto, setTexto] = useState(aTexto(valor))
  const [error, setError] = useState(false)
  const id = `poly-${titulo.replace(/\W+/g, '-')}`
  return (
    <div>
      <label htmlFor={id} className="sub" style={{ display: 'block', margin: '6px 0 2px' }}>{titulo} (x, y en px, un vértice por línea)</label>
      <textarea
        id={id}
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          const p = deTexto(e.target.value)
          setError(!p || p.length < min)
          if (p && p.length >= min) onChange(p)
        }}
      />
      {error && <div className="err">Escriba al menos {min} vértices como «x, y».</div>}
    </div>
  )
}

const MEDIDAS: [keyof Plano, string][] = [
  ['ancho_px', 'Ancho del predio'],
  ['alto_px', 'Alto del predio'],
  ['muro_occ_px', 'Corona del muro occidental'],
  ['muro_ori_px', 'Corona del muro oriental'],
  ['cano_px', 'Caño dentro del predio'],
  ['ronda_dib_px', 'Ronda tal como está dibujada'],
  ['franjas_sep_px', 'Separación de franjas en el lomo central'],
  ['casa_px', 'Casa → muro oriental'],
  ['camino_principal_px', 'Camino principal'],
  ['camino_lomo_px', 'Camino del lomo primario'],
  ['camino_trabajo_px', 'Camino de trabajo'],
  ['franjas_px', 'Franjas de árboles (las dos)'],
]

function PlanoPanel({ plano, setPlano, escala }: { plano: Plano; setPlano: Store['setPlano']; escala: number }) {
  const cambiados = MEDIDAS.filter(([k]) => plano[k] !== PLANO_REFERENCIA[k]).length
  return (
    <details className="grupo">
      <summary>
        Medidas en el plano <span className="capa">Hojas 2, 8 y 9</span>
        <span className="cnt">{cambiados ? `${cambiados} cambiadas` : ''}</span>
      </summary>
      <div className="plano-body">
        <p>Medidas tomadas sobre la imagen de la diapositiva 47, en píxeles. Cada px vale {escala.toLocaleString('es-CO', { maximumFractionDigits: 3 })} m con la escala actual.</p>
        <table className="mini">
          <tbody>
            {MEDIDAS.map(([k, t]) => (
              <tr key={k}>
                <td><label htmlFor={`pl-${k}`}>{t}</label></td>
                <td style={{ width: 96 }}>
                  <input
                    id={`pl-${k}`}
                    type="number"
                    step={1}
                    value={plano[k] as number}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value)
                      if (Number.isFinite(v) && v > 0) setPlano((p) => ({ ...p, [k]: v }))
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Bebederos</h3>
        <table className="mini">
          <thead>
            <tr><th>Código</th><th>Represa</th><th>Cota (m)</th><th>Tubo (px)</th></tr>
          </thead>
          <tbody>
            {plano.bebederos.map((b, i) => (
              <tr key={b.id} title={b.ubicacion}>
                <td>{b.id} · {b.potrero}</td>
                <td>
                  <select
                    id={`beb-rep-${i}`}
                    aria-label={`Represa del bebedero ${b.id}`}
                    value={b.represa}
                    onChange={(e) => setPlano((p) => { p.bebederos[i].represa = e.target.value as 'occ' | 'ori'; return p })}
                  >
                    <option value="occ">Occidental</option>
                    <option value="ori">Oriental</option>
                  </select>
                </td>
                <td>
                  <input id={`beb-cota-${i}`} aria-label={`Cota del bebedero ${b.id}`} type="number" step={0.5} value={b.cota}
                    onChange={(e) => { const v = parseFloat(e.target.value); if (Number.isFinite(v)) setPlano((p) => { p.bebederos[i].cota = v; return p }) }} />
                </td>
                <td>
                  <input id={`beb-tubo-${i}`} aria-label={`Tubería del bebedero ${b.id}`} type="number" step={1} value={b.tubo_px}
                    onChange={(e) => { const v = parseFloat(e.target.value); if (Number.isFinite(v) && v >= 0) setPlano((p) => { p.bebederos[i].tubo_px = v; return p }) }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Las cotas de los bebederos son lecturas sobre las curvas (±1 m). Confírmelas en QGIS.</p>
        <Poligono titulo="Canal occidental" min={2} valor={plano.canal_occ} onChange={(pts) => setPlano((p) => ({ ...p, canal_occ: pts }))} />
        <Poligono titulo="Canal de vertedero a vertedero" min={2} valor={plano.canal_ori} onChange={(pts) => setPlano((p) => ({ ...p, canal_ori: pts }))} />
        <Poligono titulo="Polígono del cacao" min={3} valor={plano.cacao} onChange={(pts) => setPlano((p) => ({ ...p, cacao: pts }))} />
      </div>
    </details>
  )
}

export function InputsPanel({ s, escala }: { s: Store; escala: number }) {
  const e = s.porId(s.activo)
  const d = e.datos
  return (
    <aside className="datos" aria-label={`Datos de «${e.nombre}»`}>
      <div className="aside-head">
        <b>Datos de «{e.nombre}»</b>
        <p>
          {e.fijo
            ? 'Es un ejemplo fijo: al cambiar un dato se crea una copia suya.'
            : 'Escenario propio: los cambios se guardan en este navegador.'}{' '}
          Los datos cambiados frente al libro quedan resaltados.
        </p>
      </div>
      {GRUPOS.map((g, gi) => {
        const n = g.campos.filter((c) => d[c.k] !== DATOS_REFERENCIA[c.k]).length
        return (
          <details key={g.id} className="grupo" open={gi < 3}>
            <summary>
              {g.titulo} <span className="capa">{g.capa}</span>
              <span className="cnt">{n ? `${n} cambiado${n > 1 ? 's' : ''}` : ''}</span>
            </summary>
            {g.campos
              .filter((c) => c.k !== 'Parte_occ' || d.Reparto === 'dividido')
              .map((c) => (
                <Campo key={c.k} c={c} valor={d[c.k]} onChange={(v) => s.setDato(c.k, v)} />
              ))}
          </details>
        )
      })}
      <PlanoPanel key={s.vista} plano={e.plano} setPlano={s.setPlano} escala={escala} />
      <div className="legend">
        {Object.entries(FUENTES).map(([k, t]) => (
          <span key={k}><span className={`src ${k}`} />{t}</span>
        ))}
      </div>
    </aside>
  )
}
