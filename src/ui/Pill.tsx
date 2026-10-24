import type { Resultado } from '../engine/checks'
import { ESTADO_TXT } from './fmt'

export function Pill({ o }: { o: Resultado }) {
  return (
    <span className={`pill ${o.estado}`}>
      {ESTADO_TXT[o.estado]} <span className="num">{o.texto}</span>
    </span>
  )
}
