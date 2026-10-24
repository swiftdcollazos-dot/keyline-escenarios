import { SUELOS } from './data'
import type { Datos } from './types'

/** De dónde sale un dato (misma leyenda de colores del libro). */
export type Fuente = 'caso' | 'plano' | 'supuesto' | 'nuevo'

export const FUENTES: Record<Fuente, string> = {
  caso: 'Dato del caso',
  plano: 'Medido en el plano',
  supuesto: 'Supuesto didáctico',
  nuevo: 'Nuevo en la app',
}

export interface Campo {
  k: keyof Datos
  label: string
  unidad: string
  fuente: Fuente
  paso: number
  /** Celda de origen en la hoja 1, o «nuevo». */
  nota: string
  opciones?: [string, string][]
  /** Cotas y otras medidas absolutas: la sensibilidad las mueve ±0,5 m en vez de ±10 %. */
  cota?: boolean
  min?: number
  max?: number
}

export interface Grupo {
  id: string
  titulo: string
  capa: string
  campos: Campo[]
}

export const GRUPOS: Grupo[] = [
  {
    id: 'verano',
    titulo: 'Verano y ganado',
    capa: 'Capa 3 · Agua',
    campos: [
      { k: 'Dias_verano', label: 'Duración del verano', unidad: 'días', fuente: 'caso', paso: 5, nota: 'Diap. 44 y notas de la diap. 47', min: 1, max: 365 },
      { k: 'N_reses', label: 'Reses en verano', unidad: 'reses', fuente: 'caso', paso: 5, nota: 'Diap. 44', min: 0 },
      { k: 'Consumo_res', label: 'Consumo por res', unidad: 'L/res/día', fuente: 'caso', paso: 5, nota: 'Ejercicio 6, Clase 6', min: 0 },
      { k: 'Reparto', label: 'Quién abastece al hato', unidad: '', fuente: 'nuevo', paso: 0, nota: 'El libro supone que cada represa sola atiende a todo el hato (el caso más exigente).', opciones: [['cada_una', 'Cada represa, todo el hato'], ['dividido', 'Repartido entre las dos']] },
      { k: 'Parte_occ', label: 'Parte del hato en la occidental', unidad: '0 a 1', fuente: 'nuevo', paso: 0.05, nota: 'Solo cuenta si el hato se reparte.', min: 0, max: 1 },
    ],
  },
  {
    id: 'clima',
    titulo: 'Clima y escorrentía',
    capa: 'Capa 1 · Clima',
    campos: [
      { k: 'Evap_dia', label: 'Evaporación del espejo', unidad: 'mm/día', fuente: 'caso', paso: 0.5, nota: 'Ejercicio 6 y notas de la diap. 47', min: 0 },
      { k: 'Infil_dia', label: 'Infiltración por el fondo', unidad: 'mm/día', fuente: 'caso', paso: 0.5, nota: 'Ejercicio 6', min: 0 },
      { k: 'Lluvia_anual', label: 'Lluvia anual', unidad: 'mm/año', fuente: 'caso', paso: 100, nota: 'Diap. 44', min: 0 },
      { k: 'C_anual', label: 'Escorrentía anual (C)', unidad: '–', fuente: 'caso', paso: 0.05, nota: 'Ejercicio 6', min: 0, max: 1 },
      { k: 'C_tormenta', label: 'Escorrentía del aguacero (C)', unidad: '–', fuente: 'caso', paso: 0.05, nota: 'Ejercicio 6', min: 0, max: 1 },
      { k: 'I_diseno', label: 'Intensidad del aguacero', unidad: 'mm/h', fuente: 'caso', paso: 10, nota: 'Ejercicio 6', min: 0 },
    ],
  },
  {
    id: 'represas',
    titulo: 'Represas de punto clave',
    capa: 'Capa 3 · Agua',
    campos: [
      { k: 'PK_occ', label: 'Punto clave occidental', unidad: 'm', fuente: 'caso', paso: 0.1, nota: 'Diap. 32, solución del ejercicio 7', cota: true },
      { k: 'PK_ori', label: 'Punto clave oriental', unidad: 'm', fuente: 'caso', paso: 0.1, nota: 'Diap. 32, solución del ejercicio 7', cota: true },
      { k: 'Espejo_occ', label: 'Espejo occidental', unidad: 'm²', fuente: 'caso', paso: 100, nota: 'Notas de la diap. 47', min: 1 },
      { k: 'Espejo_ori', label: 'Espejo oriental', unidad: 'm²', fuente: 'caso', paso: 100, nota: 'Notas de la diap. 47', min: 1 },
      { k: 'Hmax_occ', label: 'Profundidad máxima occidental', unidad: 'm', fuente: 'caso', paso: 0.1, nota: 'Notas de la diap. 47', min: 0.1 },
      { k: 'Hmax_ori', label: 'Profundidad máxima oriental', unidad: 'm', fuente: 'caso', paso: 0.1, nota: 'Notas de la diap. 47', min: 0.1 },
      { k: 'Vmod_occ', label: 'Volumen occidental (modelo)', unidad: 'm³', fuente: 'caso', paso: 100, nota: 'Diap. 47 («≈ 7.600 m³»)', min: 1 },
      { k: 'Vmod_ori', label: 'Volumen oriental (modelo)', unidad: 'm³', fuente: 'caso', paso: 100, nota: 'Diap. 47 («≈ 8.000 m³»)', min: 1 },
      { k: 'Cuenca_occ', label: 'Cuenca propia occidental', unidad: 'ha', fuente: 'nuevo', paso: 0.1, nota: 'El caso no la da: mídala en el plano, de la divisoria al muro más lo que intercepta el canal.', min: 0 },
      { k: 'Cuenca_ori', label: 'Cuenca propia oriental', unidad: 'ha', fuente: 'nuevo', paso: 0.1, nota: 'Sin contar la occidental, que le llega por el rebose.', min: 0 },
      { k: 'Int_curvas', label: 'Intervalo de curvas', unidad: 'm', fuente: 'caso', paso: 0.5, nota: 'Diap. 44', min: 0.1 },
      { k: 'k_bolsillo', label: 'Factor de forma de bolsillo', unidad: '–', fuente: 'supuesto', paso: 0.05, nota: 'Redondeo de los factores de la hoja 3', min: 0.05, max: 1 },
    ],
  },
  {
    id: 'muros',
    titulo: 'Muros y vertederos',
    capa: 'Capa 3 · Agua',
    campos: [
      { k: 'Borde_libre', label: 'Borde libre', unidad: 'm', fuente: 'caso', paso: 0.1, nota: 'Diap. 38', min: 0 },
      { k: 'Hmuro_max', label: 'Altura máxima de muro', unidad: 'm', fuente: 'caso', paso: 0.5, nota: 'Reglas de Yeomans, Clase 6', min: 0 },
      { k: 'Corona', label: 'Ancho de la corona', unidad: 'm', fuente: 'supuesto', paso: 0.5, nota: 'Ajústelo a la maquinaria y al uso como camino', min: 0 },
      { k: 'Talud_muro', label: 'Talud del muro', unidad: 'm/m', fuente: 'supuesto', paso: 0.5, nota: 'Igual aguas arriba y aguas abajo', min: 0 },
      { k: 'Lam_vert', label: 'Lámina sobre el vertedero', unidad: 'm', fuente: 'supuesto', paso: 0.05, nota: 'Con 1,7 da 0,28 m³/s por metro', min: 0.01 },
      { k: 'Coef_vert', label: 'Coeficiente de vertedero', unidad: '–', fuente: 'supuesto', paso: 0.1, nota: 'Cresta ancha, sistema métrico', min: 0.1 },
    ],
  },
  {
    id: 'canales',
    titulo: 'Canales de desviación',
    capa: 'Capa 3 · Agua',
    campos: [
      { k: 'Pend_canal', label: 'Pendiente: 1 m de caída cada', unidad: 'm', fuente: 'caso', paso: 10, nota: 'Diap. 38 y 47', min: 10 },
      { k: 'Lcan_occ', label: 'Canal occidental', unidad: 'm', fuente: 'caso', paso: 10, nota: 'Diap. 47 («≈ 220 m»)', min: 1 },
      { k: 'Lcan_ori', label: 'Canal de vertedero a vertedero', unidad: 'm', fuente: 'caso', paso: 10, nota: 'Diap. 47 («≈ 180 m»)', min: 1 },
      { k: 'b_canal', label: 'Ancho de la base', unidad: 'm', fuente: 'caso', paso: 0.05, nota: 'Clase 6, ejemplo de Manning', min: 0.01 },
      { k: 'y_canal', label: 'Profundidad del agua', unidad: 'm', fuente: 'caso', paso: 0.05, nota: 'Clase 6, ejemplo de Manning', min: 0.01 },
      { k: 'z_canal', label: 'Talud del canal', unidad: 'm/m', fuente: 'caso', paso: 0.25, nota: 'Clase 6, ejemplo de Manning', min: 0 },
      { k: 'n_Manning', label: 'Rugosidad de Manning', unidad: '–', fuente: 'caso', paso: 0.005, nota: 'Tierra con pasto', min: 0.005 },
      { k: 'Suelo_canal', label: 'Suelo del canal', unidad: '', fuente: 'supuesto', paso: 0, nota: 'El suelo real de La Esperanza no está definido en el caso.', opciones: Object.keys(SUELOS).map((s) => [s, s]) },
    ],
  },
  {
    id: 'casa',
    titulo: 'Casa y bebederos',
    capa: 'Capas 6 y 7',
    campos: [
      { k: 'Cota_casa', label: 'Cota de la casa nueva', unidad: 'm', fuente: 'caso', paso: 0.5, nota: 'Diap. 47', cota: true },
      { k: 'D_tubo', label: 'Diámetro interno del tubo', unidad: 'mm', fuente: 'supuesto', paso: 1, nota: 'Confírmelo en el catálogo del tubo', min: 5 },
      { k: 'Q_casa', label: 'Caudal de diseño', unidad: 'L/s', fuente: 'supuesto', paso: 0.05, nota: 'Un grifo abierto, aproximadamente', min: 0.01 },
      { k: 'C_HW', label: 'Coeficiente Hazen-Williams', unidad: '–', fuente: 'supuesto', paso: 5, nota: 'PVC o polietileno nuevo', min: 50 },
      { k: 'F_trazado', label: 'Factor de trazado', unidad: '–', fuente: 'supuesto', paso: 0.05, nota: 'Longitud real ÷ línea recta', min: 1 },
      { k: 'Margen_grav', label: 'Carga mínima por gravedad', unidad: 'm', fuente: 'supuesto', paso: 0.5, nota: 'Criterio del ejercicio, no norma', min: 0 },
    ],
  },
  {
    id: 'arboles',
    titulo: 'Árboles, cacao y potreros',
    capa: 'Capas 5 y 7',
    campos: [
      { k: 'Int_franjas', label: 'Intervalo vertical entre franjas', unidad: 'm', fuente: 'caso', paso: 1, nota: 'Diap. 47', min: 1 },
      { k: 'Desn_franja', label: 'Desnivel de una franja', unidad: 'm', fuente: 'supuesto', paso: 1, nota: 'Ejemplo de Yeomans, diap. 40', min: 0 },
      { k: 'Ancho_franja', label: 'Ancho de la franja', unidad: 'm', fuente: 'supuesto', paso: 1, nota: 'Entre 4 y 10 hileras', min: 0 },
      { k: 'Ronda', label: 'Ancho de la ronda del caño', unidad: 'm', fuente: 'caso', paso: 5, nota: 'Hasta 30 m; la delimita la CAR', min: 0 },
      { k: 'Cacao_meta', label: 'Cacao que quiere el dueño', unidad: 'ha', fuente: 'caso', paso: 0.5, nota: 'Diap. 44', min: 0.1 },
      { k: 'Dist_cacao', label: 'Distancia de siembra del cacao', unidad: 'm', fuente: 'supuesto', paso: 0.5, nota: 'En cuadro', min: 0.5 },
      { k: 'Ancho_camino', label: 'Ancho de los caminos', unidad: 'm', fuente: 'supuesto', paso: 0.5, nota: 'Valor para practicar', min: 0 },
      { k: 'Area_constr', label: 'Casa, corrales y bodega', unidad: 'ha', fuente: 'supuesto', paso: 0.05, nota: 'Valor para practicar', min: 0 },
      { k: 'N_potreros', label: 'Potreros', unidad: 'potreros', fuente: 'caso', paso: 1, nota: 'Diap. 44', min: 2 },
      { k: 'Descanso', label: 'Descanso del pasto', unidad: 'días', fuente: 'supuesto', paso: 1, nota: 'Ajústelo al pasto y a la época', min: 1 },
    ],
  },
  {
    id: 'predio',
    titulo: 'Predio, plano y tolerancia',
    capa: 'Capa 2 · Geografía',
    campos: [
      { k: 'Area_predio', label: 'Área del predio', unidad: 'ha', fuente: 'caso', paso: 0.5, nota: 'Diap. 44', min: 0.1 },
      { k: 'Cota_cano', label: 'Cota del caño', unidad: 'm', fuente: 'plano', paso: 1, nota: 'Curva 370 junto al caño', cota: true },
      { k: 'Cota_max', label: 'Cota más alta', unidad: 'm', fuente: 'plano', paso: 1, nota: 'Lectura aproximada del plano', cota: true },
      { k: 'Barra_m', label: 'Barra de escala', unidad: 'm', fuente: 'caso', paso: 10, nota: 'Escala gráfica 0–50–100 m', min: 1 },
      { k: 'Barra_px', label: 'Barra de escala en la imagen', unidad: 'px', fuente: 'plano', paso: 1, nota: 'En A3, mida la barra en mm', min: 1 },
      { k: 'Tolerancia', label: 'Tolerancia para «coincide»', unidad: '0 a 1', fuente: 'supuesto', paso: 0.01, nota: 'Se usa en la verificación', min: 0 },
    ],
  },
]

export const CAMPOS: Campo[] = GRUPOS.flatMap((g) => g.campos)
export const campo = (k: keyof Datos) => CAMPOS.find((c) => c.k === k)!
