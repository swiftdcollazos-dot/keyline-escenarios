import { useEffect, useMemo, useState } from 'react'
import { calcular } from './engine/calc'
import { useEscenarios } from './state/store'
import { Cifras } from './ui/Cifras'
import { Diapositiva } from './ui/Diapositiva'
import { Graficas } from './ui/Graficas'
import { InputsPanel } from './ui/InputsPanel'
import { Resumen } from './ui/Resumen'
import { ScenarioBar } from './ui/ScenarioBar'
import { Sensibilidad } from './ui/Sensibilidad'

const PESTANAS = [
  ['resumen', 'Verificaciones'],
  ['cifras', 'Cifras clave'],
  ['graficas', 'Gráficas'],
  ['sensibilidad', 'Sensibilidad'],
  ['tablas', 'Diapositiva y tablas'],
] as const
type Pestana = (typeof PESTANAS)[number][0]

const desdeHash = (): Pestana => {
  const h = location.hash.slice(1)
  return (PESTANAS.find(([id]) => id === h)?.[0] ?? 'resumen') as Pestana
}

export default function App() {
  const s = useEscenarios()
  const [tab, setTab] = useState<Pestana>(desdeHash)
  useEffect(() => {
    const f = () => setTab(desdeHash())
    window.addEventListener('hashchange', f)
    return () => window.removeEventListener('hashchange', f)
  }, [])

  const esc = useMemo(() => s.columnas.map(s.porId), [s.columnas, s.porId])
  const res = useMemo(() => esc.map((e) => calcular(e.datos, e.plano)), [esc])
  const activo = s.porId(s.activo)
  const iActivo = s.columnas.indexOf(s.activo)

  return (
    <div className="wrap">
      <header className="top">
        <svg className="contours" viewBox="0 0 520 220" aria-hidden="true" fill="none" stroke="var(--line)" strokeWidth="1.2">
          <path d="M0 200 C80 170 140 190 210 150 S330 120 380 70 S470 30 520 40" />
          <path d="M20 220 C100 185 160 205 230 168 S345 140 395 92 S480 58 520 66" />
          <path d="M60 220 C130 200 185 215 250 186 S360 160 410 116 S490 86 520 92" />
          <path d="M110 220 C170 210 215 222 270 204 S372 182 425 140 S500 114 520 118" />
          <path d="M0 170 C70 140 120 160 190 122 S310 92 360 44 S450 4 520 12" stroke="var(--occ)" strokeDasharray="5 4" />
        </svg>
        <div className="eyebrow">Diseño Keyline · Módulo 2 · Caso La Esperanza</div>
        <h1>Escenarios La Esperanza</h1>
        <p className="lead">
          Las fórmulas del libro «Cálculos del diseño de referencia, paso a paso», con escenarios que se guardan y se comparan lado a lado.
          Elija hasta cuatro escenarios, cambie los datos del que está editando y vea qué verificaciones cambian de color.
        </p>
      </header>

      <ScenarioBar s={s} />

      <div className="grid">
        <InputsPanel s={s} escala={res[iActivo >= 0 ? iActivo : 0].plano.escala} />
        <main>
          <div className="tabs" role="tablist" aria-label="Resultados">
            {PESTANAS.map(([id, t]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => {
                  setTab(id)
                  history.replaceState(null, '', `#${id}`)
                }}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === 'resumen' && <Resumen esc={esc} res={res} />}
          {tab === 'cifras' && <Cifras esc={esc} res={res} />}
          {tab === 'graficas' && <Graficas esc={esc} res={res} />}
          {tab === 'sensibilidad' && <Sensibilidad e={activo} />}
          {tab === 'tablas' && <Diapositiva esc={esc} res={res} />}
        </main>
      </div>

      <footer>
        Caso didáctico del Curso en Diseño Keyline (Keyline Colombia): las cifras de La Esperanza salen del modelo de terreno del caso, no de
        una finca real. Las medidas sobre el plano tienen un error de lectura de 3 a 4 m. Los datos marcados «nuevo» no están en el libro:
        la cuenca de cada represa es un supuesto de 1,5 ha que conviene medir. Sus escenarios se guardan solo en este navegador; use
        «Guardar escenarios» para llevarlos a otro equipo.
      </footer>
    </div>
  )
}
