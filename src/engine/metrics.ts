// Cifras clave que la app compara entre escenarios. Cada una dice en qué paso
// del libro está, cómo se calcula y por qué importa («¿cómo se calcula?»).

import type { Resultados } from './calc'
import type { Datos } from './types'

export interface Metrica {
  id: string
  grupo: string
  label: string
  paso: string
  unidad: string
  dec: number
  /** 1 = más es mejor, −1 = menos es mejor, 0 = neutro. */
  mejor: 1 | -1 | 0
  valor: (r: Resultados, d: Datos) => number
  formula: string
  porque: string
}

export const METRICAS: Metrica[] = [
  // Agua
  { id: 'margenOcc', grupo: 'Agua', label: 'Margen al final del verano, occidental', paso: '4.12', unidad: '%', dec: 0, mejor: 1, valor: (r) => r.occ.margenPct * 100, formula: '(volumen − consumo − evaporación − infiltración) ÷ volumen', porque: 'La meta del ejercicio 6 es un margen de 20 a 30 %. Cálculo conservador: espejo lleno todo el verano.' },
  { id: 'margenOri', grupo: 'Agua', label: 'Margen al final del verano, oriental', paso: '4.12', unidad: '%', dec: 0, mejor: 1, valor: (r) => r.ori.margenPct * 100, formula: '(volumen − consumo − evaporación − infiltración) ÷ volumen', porque: 'Igual que la occidental, con su volumen de 8.000 m³.' },
  { id: 'demOcc', grupo: 'Agua', label: 'Demanda del verano, occidental', paso: '4.9', unidad: 'm³', dec: 0, mejor: -1, valor: (r) => r.occ.dem, formula: 'reses × L/día × días ÷ 1.000 + (evaporación + infiltración) × días ÷ 1.000 × espejo', porque: 'Lo que la represa debe entregar o perder durante el verano.' },
  { id: 'evapOcc', grupo: 'Agua', label: 'Evaporación del verano, occidental', paso: '4.4', unidad: 'm³', dec: 0, mejor: -1, valor: (r) => r.occ.evap, formula: 'mm/día × días ÷ 1.000 × área del espejo', porque: 'La evaporación es una lámina: depende del área expuesta, no de cuánta agua hay. Por eso conviene más hondo y no más ancho.' },
  { id: 'perdPorCons', grupo: 'Agua', label: 'Pérdidas por cada m³ que toma el ganado', paso: '4.14', unidad: 'veces', dec: 1, mejor: -1, valor: (r) => r.occ.perdPorCons, formula: 'pérdidas del espejo ÷ consumo del hato', porque: 'Casi toda el agua que sale de la represa en verano se la lleva el aire, no el ganado.' },
  { id: 'vfinOcc', grupo: 'Agua', label: 'Volumen al final, occidental (simulado)', paso: 'Hoja 5', unidad: 'm³', dec: 0, mejor: 1, valor: (r) => r.occ.Vfin, formula: 'Día a día: volumen de ayer − pérdidas del espejo de ayer − consumo de ayer; el espejo se achica como A × (V ÷ V lleno)^((m − 1) ÷ m)', porque: 'Más realista que la hoja 4: el espejo se achica al bajar el nivel. La app simula los días que dure el verano.' },
  { id: 'vfinOri', grupo: 'Agua', label: 'Volumen al final, oriental (simulado)', paso: 'Hoja 5', unidad: 'm³', dec: 0, mejor: 1, valor: (r) => r.ori.Vfin, formula: 'La misma simulación con la represa oriental.', porque: 'De esta represa sale el agua de la casa.' },
  { id: 'descensoOri', grupo: 'Agua', label: 'Descenso del nivel, oriental', paso: 'Hoja 5', unidad: 'm', dec: 2, mejor: -1, valor: (r) => r.ori.descenso, formula: 'nivel lleno − nivel al final del verano', porque: 'Cuánto pierde de carga la casa entre diciembre y marzo.' },
  { id: 'vpriOcc', grupo: 'Agua', label: 'Volumen por prismoide, occidental', paso: '3.14', unidad: 'm³', dec: 0, mejor: 0, valor: (r) => r.occ.Vpri, formula: 'H ÷ 6 × (A arriba + 4 × A media + A fondo); A media ≈ A × 0,5^(m − 1)', porque: 'Ojo: el área media se estima con k = V modelo ÷ (A × H), así que el prismoide repite casi por construcción el volumen del modelo. Mida el área media en QGIS para una verificación independiente.' },
  { id: 'cuencaMinOcc', grupo: 'Agua', label: 'Cuenca mínima para llenar la occidental', paso: '4.16', unidad: 'ha', dec: 2, mejor: 0, valor: (r) => r.occ.cuencaMin, formula: 'volumen ÷ (lluvia ÷ 1.000 × C anual × 10.000)', porque: 'Si la cuenca real es mayor, sobra agua y manda el vertedero.' },
  // Muros
  { id: 'hMuroOcc', grupo: 'Muros y vertederos', label: 'Altura del muro occidental', paso: '6.5', unidad: 'm', dec: 2, mejor: -1, valor: (r) => r.occ.muro.h, formula: 'cota del vertedero + borde libre − cota del fondo', porque: 'Yeomans recomienda no pasar de 8 m.' },
  { id: 'hMuroOri', grupo: 'Muros y vertederos', label: 'Altura del muro oriental', paso: '6.5', unidad: 'm', dec: 2, mejor: -1, valor: (r) => r.ori.muro.h, formula: 'cota del vertedero + borde libre − cota del fondo', porque: 'Yeomans recomienda no pasar de 8 m.' },
  { id: 'tierraOcc', grupo: 'Muros y vertederos', label: 'Tierra del muro occidental', paso: '6.12', unidad: 'm³', dec: 0, mejor: -1, valor: (r) => r.occ.muro.tierra, formula: 'L × (corona × h ÷ 2 + talud × h² ÷ 3)', porque: 'Valle en V: el muro crece de 0 en los extremos a h en el centro. Es la base del costo de maquinaria.' },
  { id: 'tierraOri', grupo: 'Muros y vertederos', label: 'Tierra del muro oriental', paso: '6.12', unidad: 'm³', dec: 0, mejor: -1, valor: (r) => r.ori.muro.tierra, formula: 'L × (corona × h ÷ 2 + talud × h² ÷ 3)', porque: 'Valle en V: el muro crece de 0 en los extremos a h en el centro.' },
  { id: 'aguaTierraOcc', grupo: 'Muros y vertederos', label: 'Agua por m³ de tierra, occidental', paso: '6.13', unidad: 'm³/m³', dec: 2, mejor: 1, valor: (r) => r.occ.muro.aguaTierra, formula: 'volumen de agua ÷ volumen de tierra del muro', porque: 'Sirve para comparar sitios y el costo de cada represa.' },
  { id: 'vertOcc', grupo: 'Muros y vertederos', label: 'Ancho del vertedero occidental', paso: '6.18', unidad: 'm', dec: 2, mejor: 0, valor: (r) => r.occ.vertedero.ancho, formula: '(C × i × cuenca ÷ 360) ÷ (coef. × lámina^1,5)', porque: 'Ancho para pasar el aguacero de diseño con la lámina supuesta. Depende de la cuenca, que el caso no da.' },
  { id: 'vertOri', grupo: 'Muros y vertederos', label: 'Ancho del vertedero oriental', paso: '6.18', unidad: 'm', dec: 2, mejor: 0, valor: (r) => r.ori.vertedero.ancho, formula: 'Igual, con la suma de las dos cuencas', porque: 'La oriental recibe también el rebose de la occidental.' },
  // Canales
  { id: 'vCanal', grupo: 'Canales', label: 'Velocidad del canal lleno', paso: '7.21', unidad: 'm/s', dec: 2, mejor: 0, valor: (r) => r.canal.V, formula: 'V = (1 ÷ n) × R^(2/3) × S^(1/2)', porque: 'Debe quedar por debajo de la velocidad máxima del suelo para no erosionar.' },
  { id: 'qCanal', grupo: 'Canales', label: 'Caudal del canal lleno', paso: '7.22', unidad: 'L/s', dec: 0, mejor: 1, valor: (r) => r.canal.Q, formula: 'V × área mojada × 1.000', porque: 'Lo que el canal puede llevar en un aguacero.' },
  { id: 'llegadaOri', grupo: 'Canales', label: 'Llegada del canal a la oriental', paso: '7.7', unidad: 'm', dec: 2, mejor: 0, valor: (r) => r.canal.llegadaOri, formula: 'cresta del vertedero occidental − longitud ÷ pendiente', porque: 'Debe quedar por encima del agua de la represa que recibe.' },
  { id: 'horasOcc', grupo: 'Canales', label: 'Horas de canal lleno para llenar la occidental', paso: '7.26', unidad: 'h', dec: 1, mejor: -1, valor: (r) => r.canal.horasOcc, formula: 'volumen ÷ caudal ÷ 3.600', porque: 'Da una idea de cuántos aguaceros hacen falta.' },
  // Casa
  { id: 'cargaCasa', grupo: 'Casa', label: 'Carga en la casa con la represa llena', paso: '8.3', unidad: 'm', dec: 1, mejor: 1, valor: (r) => r.casa.cargaLlena, formula: 'punto clave oriental − cota de la casa', porque: 'La nota de la diap. 47 dice 3,4 m; con el agua en la línea clave da 3,7 m.' },
  { id: 'hf', grupo: 'Casa', label: 'Pérdida por fricción en la tubería', paso: '8.16', unidad: 'm', dec: 2, mejor: -1, valor: (r) => r.casa.hf, formula: 'hf = 10,67 × L × Q^1,852 ÷ (C^1,852 × D^4,87)', porque: 'Con poca carga, el diámetro decide si el agua llega.' },
  { id: 'llaveFin', grupo: 'Casa', label: 'Carga en la llave al final del verano', paso: '8.18', unidad: 'm', dec: 2, mejor: 1, valor: (r) => r.casa.llaveFin, formula: 'nivel oriental al final del verano − cota de la casa − hf', porque: 'Es la peor condición: el agua llega con menos presión en marzo.' },
  // Árboles y potreros
  { id: 'franja2', grupo: 'Árboles y potreros', label: 'Segunda franja, valle occidental', paso: '9.3', unidad: 'm', dec: 1, mejor: 0, valor: (r) => r.arboles.franja2Occ, formula: 'línea clave + intervalo vertical', porque: 'Con 3 m de franja, el intervalo de 12 m sirve para árboles de unos 9 m.' },
  { id: 'plantas', grupo: 'Árboles y potreros', label: 'Plantas de cacao', paso: '9.10', unidad: 'plantas', dec: 0, mejor: 0, valor: (r) => r.arboles.plantas, formula: 'área del polígono × 10.000 ÷ distancia²', porque: 'Sume entre 5 y 10 % para resiembra.' },
  { id: 'pasto', grupo: 'Árboles y potreros', label: 'Área de pastoreo', paso: '10.8', unidad: 'ha', dec: 2, mejor: 1, valor: (r) => r.potr.pasto, formula: 'predio − espejos − cacao − ronda − franjas − caminos − construcciones', porque: 'Balance de primer orden; en QGIS cada potrero tendrá su área exacta.' },
  { id: 'porPotrero', grupo: 'Árboles y potreros', label: 'Área media por potrero', paso: '10.9', unidad: 'ha', dec: 2, mejor: 0, valor: (r) => r.potr.porPotrero, formula: 'área de pastoreo ÷ potreros', porque: 'Los de las columnas de los extremos son más angostos.' },
  { id: 'carga', grupo: 'Árboles y potreros', label: 'Carga animal promedio', paso: '10.10', unidad: 'reses/ha', dec: 2, mejor: 0, valor: (r) => r.potr.carga, formula: 'reses ÷ área de pastoreo', porque: 'Para comparar con lo que el pasto aguanta.' },
  { id: 'ocupacion', grupo: 'Árboles y potreros', label: 'Días de ocupación por potrero', paso: '10.12', unidad: 'días', dec: 1, mejor: 0, valor: (r) => r.potr.ocupacion, formula: 'descanso ÷ (potreros − 1)', porque: 'Mientras uno se pastorea, los demás descansan.' },
]

export const metrica = (id: string) => METRICAS.find((m) => m.id === id)!
