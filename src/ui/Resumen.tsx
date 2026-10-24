import type { Resultados } from '../engine/calc'
import { VERIFICACIONES, preguntaDe } from '../engine/checks'
import type { Escenario } from '../engine/types'
import { Marca } from './Marca'
import { Pill } from './Pill'
import { nf } from './fmt'

interface Props {
  esc: Escenario[]
  res: Resultados[]
}

export function Resumen({ esc, res }: Props) {
  const evals = VERIFICACIONES.map((v) => res.map((r, i) => v.evaluar(r, esc[i].datos)))
  const grupos = [...new Set(VERIFICACIONES.map((v) => v.grupo))]
  return (
    <>
      <section className="card" aria-labelledby="h-sem">
        <h2 id="h-sem">Verificaciones</h2>
        <p className="sub">Cada «¿cumple?» del libro y las preguntas de «Control con números» (diap. 46). Pase el cursor por una pregunta para ver la regla.</p>
        <div className="tiles" style={{ marginBottom: 12 }}>
          {esc.map((e, i) => {
            const c = (s: string) => evals.filter((x) => x[i].estado === s).length
            return (
              <div className="tile" key={i}>
                <div className="k"><Marca i={i} /> {e.nombre}</div>
                <div className="counts">
                  <span><i className="dot" style={{ background: 'var(--good)' }} />{c('si')} cumplen</span>
                  <span><i className="dot" style={{ background: 'var(--warn)' }} />{c('bajo')}</span>
                  <span><i className="dot" style={{ background: 'var(--bad)' }} />{c('no')}</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="tbl">
          <table className="t">
            <thead>
              <tr>
                <th>Pregunta</th>
                <th className="ref">Paso</th>
                {esc.map((_, i) => <th key={i}><Marca i={i} /></th>)}
              </tr>
            </thead>
            <tbody>
              {grupos.map((g) => [
                <tr key={g} className="grp"><td colSpan={2 + esc.length}>{g}</td></tr>,
                ...VERIFICACIONES.map((v, vi) => {
                  if (v.grupo !== g) return null
                  const fila = evals[vi]
                  const distinto = fila.some((o) => o.estado !== fila[0].estado)
                  return (
                    <tr key={v.id} className={distinto ? 'diff' : ''}>
                      <td title={v.regla}>{preguntaDe(v, res[0])}</td>
                      <td className="ref">{v.paso}</td>
                      {fila.map((o, i) => <td key={i}><Pill o={o} /></td>)}
                    </tr>
                  )
                }),
              ])}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="h-pot">
        <h2 id="h-pot">Agua por gravedad en los 12 potreros</h2>
        <p className="sub">Hoja 10. Tres bandas (debajo de la línea clave, entre franjas y arriba) por cuatro columnas de oeste a este. Un potrero con bebedero muestra su carga; los demás, la de su banda.</p>
        <div className="two">
          {esc.map((e, i) => (
            <div key={i}>
              <h3><Marca i={i} /> {e.nombre}</h3>
              {(['alta', 'media', 'baja'] as const).map((b) => (
                <div key={b}>
                  <div className="banda-lbl">
                    Banda {b} · desde {nf(res[i].potr.bandas[b].cotaBaja, 1)} m
                  </div>
                  <div className="potreros">
                    {res[i].potr.potreros.filter((p) => p.banda === b).map((p) => (
                      <div key={p.id} className={`potrero ${p.estado}`} title={p.bebedero ? `Bebedero ${p.bebedero}` : 'Sin bebedero en el plano'}>
                        <b>{p.id}</b>
                        <small>{p.bebedero ? `${p.bebedero}: ` : ''}{nf(p.carga, 1)} m</small>
                        {!p.bebedero && p.estado === 'si' && <small>falta bebedero</small>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
