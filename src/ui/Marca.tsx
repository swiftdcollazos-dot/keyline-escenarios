import { COLOR_COL, LETRA } from './fmt'

export function Marca({ i }: { i: number }) {
  return (
    <span className="marca" style={{ background: COLOR_COL[i] }} aria-label={`Escenario ${LETRA[i]}`}>
      {LETRA[i]}
    </span>
  )
}
