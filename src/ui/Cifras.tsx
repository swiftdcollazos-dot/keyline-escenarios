import { Fragment, useState } from 'react'
import type { Resultados } from '../engine/calc'
import { METRICAS } from '../engine/metrics'
import type { Escenario } from '../engine/types'
import { Marca } from './Marca'
import { nf } from './fmt'

export function Cifras({ esc, res }: { esc: Escenario[]; res: Resultados[] }) {
  const [abierta, setAbierta] = useState<string | null>(null)
  const grupos = [...new Set(METRICAS.map((m) => m.grupo))]
  const base = 0
  return (
    <section className="card" aria-labelledby="h-cif">
      <h2 id="h-cif">Cifras clave</h2>
      <p className="sub">
        Las diferencias se miden contra <Marca i={0} />. Verde es mejor y rojo es peor, cuando la cifra tiene un sentido claro. Haga clic en una cifra para ver cómo se calcula.
      </p>
      <div className="tbl">
        <table className="t">
          <thead>
            <tr>
              <th>Resultado</th>
              <th className="ref">Paso</th>
              {esc.map((_, i) => (
                <th key={i} className="r"><Marca i={i} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grupos.map((g) => (
              <Fragment key={g}>
                <tr className="grp"><td colSpan={2 + esc.length}>{g}</td></tr>
                {METRICAS.filter((m) => m.grupo === g).map((m) => {
                  const vals = res.map((r, i) => m.valor(r, esc[i].datos))
                  const eps = 10 ** -m.dec / 2
                  const distinto = vals.some((v) => Math.abs(v - vals[base]) >= eps)
                  return (
                    <Fragment key={m.id}>
                      <tr className={distinto ? 'diff' : ''}>
                        <td>
                          <button type="button" className="linkbtn" aria-expanded={abierta === m.id} onClick={() => setAbierta(abierta === m.id ? null : m.id)}>
                            {m.label}
                          </button>
                        </td>
                        <td className="ref">{m.paso}</td>
                        {vals.map((v, i) => {
                          const dv = v - vals[base]
                          const igual = Math.abs(dv) < eps
                          const cls = igual || m.mejor === 0 ? 'flat' : dv * m.mejor > 0 ? 'up' : 'down'
                          return (
                            <td key={i} className="r">
                              <span className="num">{nf(v, m.dec)}</span> <span className="u">{m.unidad}</span>
                              {i > 0 && !igual && (
                                <div className={`delta ${cls}`}>{dv > 0 ? '+' : '−'}{nf(Math.abs(dv), m.dec)}</div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                      {abierta === m.id && (
                        <tr className="how">
                          <td colSpan={2 + esc.length}>
                            <div><code>{m.formula}</code></div>
                            <div style={{ marginTop: 4 }}>{m.porque}</div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
