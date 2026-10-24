import { Fragment } from 'react'
import type { Resultados } from '../engine/calc'
import type { Escenario } from '../engine/types'
import { Marca } from './Marca'
import { nf } from './fmt'

export function Diapositiva({ esc, res }: { esc: Escenario[]; res: Resultados[] }) {
  return (
    <>
      <section className="card" aria-labelledby="h-dia">
        <h2 id="h-dia">¿Cuadran las cifras con la diapositiva 47?</h2>
        <p className="sub">
          Hoja 11. Cada cifra de las diapositivas 44 y 47 frente a lo calculado, con la tolerancia de cada escenario. Los volúmenes salen del prismoide, que usa un área media estimada con el mismo volumen del modelo: su «coincide» no es una verificación independiente hasta medir esa área en QGIS.
        </p>
        <div className="tbl">
          <table className="t">
            <thead>
              <tr>
                <th>Concepto</th>
                <th className="r">Diapositiva</th>
                {esc.map((_, i) => <th key={i} className="r"><Marca i={i} /></th>)}
              </tr>
            </thead>
            <tbody>
              {res[0].verificacion.map((v, j) => (
                <tr key={v.concepto}>
                  <td>{v.concepto}</td>
                  <td className="r num">{nf(v.diapositiva, v.unidad === 'ha' || v.unidad === 'm' && v.diapositiva < 10 ? 1 : 0)} <span className="u">{v.unidad}</span></td>
                  {res.map((r, i) => {
                    const x = r.verificacion[j]
                    return (
                      <td key={i} className="r">
                        <span className="num">{nf(x.calculado, x.unidad === 'ha' || x.calculado < 10 ? 2 : 0)}</span>{' '}
                        <span className={`pill ${x.coincide ? 'si' : 'bajo'}`}>
                          {x.coincide ? 'Coincide' : 'Revisar'} <span className="num">{x.dif >= 0 ? '+' : '−'}{nf(Math.abs(x.dif) * 100, 1)} %</span>
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card" aria-labelledby="h-cap">
        <h2 id="h-cap">Volumen por capas entre curvas</h2>
        <p className="sub">Hoja 3, método C. El libro tiene seis filas fijas; aquí se generan todas las curvas que hagan falta, así que con curvas cada 0,5 m el resultado cambia.</p>
        <div className="two">
          {esc.map((e, i) => (
            <div key={i} className="tbl">
              <h3><Marca i={i} /> {e.nombre}</h3>
              <table className="t">
                <thead>
                  <tr><th>Represa</th><th className="r">Cota</th><th className="r">Área (m²)</th><th className="r">Volumen (m³)</th></tr>
                </thead>
                <tbody>
                  {(['occ', 'ori'] as const).map((s) => (
                    <Fragment key={s}>
                      {res[i][s].curvas.map((c, k) => (
                        <tr key={k}>
                          <td>{k === 0 ? (s === 'occ' ? 'Occidental' : 'Oriental') : ''}</td>
                          <td className="r num">{nf(c.cota, 2)}</td>
                          <td className="r num">{nf(c.area, 0)}</td>
                          <td className="r num">{k === 0 ? '' : nf(c.volumen, 0)}</td>
                        </tr>
                      ))}
                      <tr className="grp">
                        <td colSpan={3}>Total {s === 'occ' ? 'occidental' : 'oriental'} ({res[i][s].difCap >= 0 ? '+' : '−'}{nf(Math.abs(res[i][s].difCap) * 100, 1)} % frente al modelo)</td>
                        <td className="r num">{nf(res[i][s].Vcap, 0)}</td>
                      </tr>
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="h-est">
        <h2 id="h-est">Estacas del canal cada 20 m</h2>
        <p className="sub">Hoja 7 B, para replanteo en campo con el nivel. La tabla crece con la longitud de cada canal.</p>
        <div className="two">
          {esc.map((e, i) => (
            <div key={i} className="tbl">
              <h3><Marca i={i} /> {e.nombre} · {nf(res[i].canal.estacaCm, 1)} cm por estaca</h3>
              <table className="t">
                <thead>
                  <tr><th>Estaca</th><th className="r">Distancia</th><th className="r">Canal occidental</th><th className="r">Vertedero → oriental</th></tr>
                </thead>
                <tbody>
                  {res[i].canal.estacas.map((x, k) => (
                    <tr key={k}>
                      <td className="num">E{k}</td>
                      <td className="r num">{x.dist} m</td>
                      <td className="r num">{x.occ === null ? '' : nf(x.occ, 3)}</td>
                      <td className="r num">{x.ori === null ? '' : nf(x.ori, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
