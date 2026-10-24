import { DATOS_REFERENCIA, PLANO_REFERENCIA } from './data'
import type { Datos, Escenario } from './types'

const ejemplo = (id: string, nombre: string, nota: string, cambios: Partial<Datos>): Escenario => ({
  id,
  nombre,
  nota,
  fijo: true,
  datos: { ...DATOS_REFERENCIA, ...cambios },
  plano: structuredClone(PLANO_REFERENCIA),
})

/** Escenarios de clase: cada uno cambia una idea del diseño de referencia. */
export const EJEMPLOS: Escenario[] = [
  ejemplo('ref', 'Diseño de referencia', 'Las cifras del libro, sin cambios.', {}),
  ejemplo('verano150', 'Verano de 150 días', 'Un verano un mes más largo. El libro sigue simulando 120 días; la app simula los 150.', { Dias_verano: 150 }),
  ejemplo('caliente', 'Verano caliente', 'Evaporación de 7 mm/día en vez de 5.', { Evap_dia: 7 }),
  ejemplo('hondas', 'Represas más hondas', 'El mismo volumen con 5 m de agua: el espejo baja a unos 3.800 m² y se evapora menos. El fondo oriental queda por debajo de la casa.', { Hmax_occ: 5, Hmax_ori: 5, Espejo_occ: 3760, Espejo_ori: 4100 }),
  ejemplo('reses80', '80 reses', 'El doble de ganado con la misma agua y los mismos potreros.', { N_reses: 80 }),
  ejemplo('repartido', 'Hato repartido', 'Cada represa atiende a la mitad de las reses en vez de a todas.', { Reparto: 'dividido', Parte_occ: 0.5 }),
  ejemplo('arenoso', 'Canal 1:200 en suelo arenoso', 'Más pendiente sobre franco arenoso: el agua corre más rápido de lo que el suelo aguanta.', { Pend_canal: 200, Suelo_canal: 'Franco arenoso' }),
  ejemplo('manguera20', 'Manguera de 20 mm', 'Tubería a la casa más delgada: la fricción se come la carga.', { D_tubo: 20 }),
  ejemplo('infiltracion', 'Infiltración de la nota', 'Con 1,5 mm/día de infiltración la pérdida cuadra con los 4.400 m³ de la nota de la diap. 47.', { Infil_dia: 1.5 }),
]
