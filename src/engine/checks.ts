// Verificaciones: cada pregunta de «Control con números» (diap. 46) y cada
// «¿cumple?» del libro, como un semáforo.

import type { Resultados } from './calc'
import type { Datos, Estado } from './types'

export interface Resultado {
  estado: Estado
  texto: string
}

export interface Verificacion {
  id: string
  grupo: string
  pregunta: string
  paso: string
  regla: string
  evaluar: (r: Resultados, d: Datos) => Resultado
}

const n = (v: number, dec = 1) =>
  Number.isFinite(v) ? v.toLocaleString('es-CO', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : '—'

const porRepresa = (f: (s: 'occ' | 'ori', nombre: string) => Verificacion): Verificacion[] => [f('occ', 'occidental'), f('ori', 'oriental')]

export const VERIFICACIONES: Verificacion[] = [
  ...porRepresa((s, nombre) => ({
    id: `alcanza_${s}`,
    grupo: 'Agua',
    pregunta: `¿Alcanza el agua del verano en la represa ${nombre}?`,
    paso: '4.13',
    regla: 'Sí con margen de 20 % o más (meta del ejercicio 6); marginal entre 0 y 20 %; no si la demanda supera el volumen.',
    evaluar: (r) => {
      const b = r[s]
      return { estado: b.margen < 0 ? 'no' : b.margenPct < 0.2 ? 'bajo' : 'si', texto: `margen ${n(b.margenPct * 100, 0)} %` }
    },
  })),
  ...porRepresa((s, nombre) => ({
    id: `seca_${s}`,
    grupo: 'Agua',
    pregunta: `¿La represa ${nombre} llega con agua al final del verano?`,
    paso: 'Hoja 5',
    regla: 'Simulación día a día con el espejo que se achica. No si se seca antes de terminar el verano.',
    evaluar: (r) => {
      const b = r[s]
      return b.diaVacia !== null
        ? { estado: 'no', texto: `seca el día ${b.diaVacia}` }
        : { estado: 'si', texto: `${n(b.Vfin, 0)} m³ al final` }
    },
  })),
  ...porRepresa((s, nombre) => ({
    id: `cuenca_${s}`,
    grupo: 'Agua',
    pregunta: `¿La cuenca llena la represa ${nombre} cada año?`,
    paso: '4.16 · nuevo',
    regla: 'Cuenca que llega a la represa ≥ volumen ÷ escorrentía por hectárea. La oriental suma la cuenca occidental por el rebose.',
    evaluar: (r) => {
      const b = r[s]
      return { estado: b.llena ? 'si' : 'no', texto: `${n(b.cuenca, 1)} de ${n(b.cuencaMin, 2)} ha` }
    },
  })),
  ...porRepresa((s, nombre) => ({
    id: `muro_${s}`,
    grupo: 'Muros y canales',
    pregunta: `¿El muro ${nombre} queda por debajo de la altura máxima?`,
    paso: '6.6',
    regla: 'Altura del muro ≤ altura máxima de Yeomans (8 m).',
    evaluar: (r, d) => ({ estado: r[s].muro.ok ? 'si' : 'no', texto: `${n(r[s].muro.h, 1)} de ${n(d.Hmuro_max, 0)} m` }),
  })),
  {
    id: 'entrega',
    grupo: 'Muros y canales',
    pregunta: '¿El canal de vertedero a vertedero entrega por encima del agua?',
    paso: '7.10',
    regla: 'Cota de llegada − nivel del agua de la oriental ≥ 0.',
    evaluar: (r) => ({ estado: r.canal.margenOri >= 0 ? 'si' : 'no', texto: `${n(r.canal.margenOri, 2)} m` }),
  },
  {
    id: 'velocidad',
    grupo: 'Muros y canales',
    pregunta: '¿El canal corre sin erosionar el suelo?',
    paso: '7.25',
    regla: 'Velocidad de Manning ≤ velocidad máxima del suelo elegido (tabla de Fortier y Scobey).',
    evaluar: (r) => ({ estado: r.canal.seguro ? 'si' : 'no', texto: `${n(r.canal.V, 2)} de ${n(r.canal.Vmax, 2)} m/s` }),
  },
  {
    id: 'capacidad',
    grupo: 'Muros y canales',
    pregunta: '¿El canal lleno alcanza para la cuenca occidental en el aguacero?',
    paso: '7.27 · nuevo',
    regla: 'Cuenca que el canal sirve ≥ cuenca occidental. Si no, agrande la sección o ponga aliviaderos.',
    evaluar: (r, d) => ({ estado: r.canal.cuencaServida >= d.Cuenca_occ ? 'si' : 'bajo', texto: `sirve ${n(r.canal.cuencaServida, 2)} ha` }),
  },
  {
    id: 'vaso',
    grupo: 'Casa y bebederos',
    pregunta: '¿Todo el vaso oriental queda por encima de la casa?',
    paso: '8.7',
    regla: 'Fondo de la represa > cota de la casa. Si no, el agua por debajo de la casa no sale sola.',
    evaluar: (r) => ({ estado: r.casa.fondoSobreCasa ? 'si' : 'bajo', texto: `fondo ${n(r.ori.fondo, 1)} m` }),
  },
  {
    id: 'llave',
    grupo: 'Casa y bebederos',
    pregunta: '¿Llega agua a la llave de la casa al final del verano?',
    paso: '8.19',
    regla: 'Carga que queda en la llave > 0 con el caudal de diseño. Marginal si queda menos que la carga mínima.',
    evaluar: (r, d) => ({ estado: r.casa.llaveFin <= 0 ? 'no' : r.casa.llaveFin < d.Margen_grav ? 'bajo' : 'si', texto: `${n(r.casa.llaveFin, 1)} m` }),
  },
  ...[0, 1, 2, 3].map((i): Verificacion => ({
    id: `bebedero_${i}`,
    grupo: 'Casa y bebederos',
    pregunta: '',
    paso: '8.C',
    regla: 'Carga = nivel del agua de su represa − cota del bebedero. Sí si ≥ carga mínima; marginal si es positiva pero menor.',
    evaluar: (r: Resultados) => {
      const b = r.bebederos[i]
      return { estado: b.estado, texto: `${n(b.carga, 1)} m` }
    },
  })),
  ...(['baja', 'media', 'alta'] as const).map((b, i): Verificacion => ({
    id: `banda_${b}`,
    grupo: 'Potreros',
    pregunta: `¿La banda ${b} (${['P1–P4', 'P5–P8', 'P9–P12'][i]}) queda bajo el agua?`,
    paso: '10.C',
    regla: 'Carga máxima = nivel del agua más alto − cota más baja de la banda. Como en el libro: sí si supera la carga mínima.',
    evaluar: (r: Resultados) => ({ estado: r.potr.bandas[b].estado, texto: `${n(r.potr.bandas[b].carga, 1)} m` }),
  })),
]

/** La pregunta de cada bebedero depende del plano del escenario. */
export function preguntaDe(v: Verificacion, r: Resultados) {
  if (!v.id.startsWith('bebedero_')) return v.pregunta
  const b = r.bebederos[Number(v.id.split('_')[1])]
  return b ? `¿Bebedero ${b.id} (${b.potrero}) por gravedad?` : ''
}
