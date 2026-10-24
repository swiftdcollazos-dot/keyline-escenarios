// Tipos del modelo. Los nombres de los datos son los mismos del libro de Excel
// (hoja 1 «Datos»), para que cualquier cifra se pueda rastrear hasta su celda.

export type Represa = 'occ' | 'ori'

export type Reparto = 'cada_una' | 'dividido'

export type SueloCanal =
  | 'Arena fina'
  | 'Franco arenoso'
  | 'Franco limoso'
  | 'Franco firme'
  | 'Arcilla firme'
  | 'Grava gruesa'
  | 'Pasto bien establecido'

/** Hoja 1: datos del caso, supuestos didácticos y los datos nuevos de la app. */
export interface Datos {
  Area_predio: number
  Int_curvas: number
  Lluvia_anual: number
  Dias_verano: number
  N_reses: number
  Cacao_meta: number
  N_potreros: number
  Consumo_res: number
  Evap_dia: number
  Infil_dia: number
  C_anual: number
  C_tormenta: number
  I_diseno: number
  PK_occ: number
  PK_ori: number
  Espejo_occ: number
  Espejo_ori: number
  Hmax_occ: number
  Hmax_ori: number
  Vmod_occ: number
  Vmod_ori: number
  Borde_libre: number
  Hmuro_max: number
  Pend_canal: number
  Lcan_occ: number
  Lcan_ori: number
  n_Manning: number
  b_canal: number
  y_canal: number
  z_canal: number
  Suelo_canal: SueloCanal
  Int_franjas: number
  Ronda: number
  Cota_casa: number
  Cota_cano: number
  Cota_max: number
  Barra_m: number
  Barra_px: number
  k_bolsillo: number
  Corona: number
  Talud_muro: number
  Lam_vert: number
  Coef_vert: number
  Desn_franja: number
  Ancho_franja: number
  Ancho_camino: number
  Area_constr: number
  Descanso: number
  Margen_grav: number
  Q_casa: number
  D_tubo: number
  C_HW: number
  F_trazado: number
  Dist_cacao: number
  Tolerancia: number
  /** Nuevo: quién abastece al hato en verano. El libro supone «cada_una». */
  Reparto: Reparto
  /** Nuevo: parte del hato que bebe en la represa occidental cuando se reparte. */
  Parte_occ: number
  /** Nuevo: cuenca propia de cada represa (ha). El caso no la da. */
  Cuenca_occ: number
  Cuenca_ori: number
}

export type Punto = [x: number, y: number]

export interface Bebedero {
  id: string
  potrero: string
  ubicacion: string
  represa: Represa
  cota: number
  /** Tubería medida en el plano (px). */
  tubo_px: number
}

/** Hoja 2 y hoja 9: todo lo que se mide sobre la imagen del plano, en píxeles. */
export interface Plano {
  ancho_px: number
  alto_px: number
  canal_occ: Punto[]
  canal_ori: Punto[]
  muro_occ_px: number
  muro_ori_px: number
  cano_px: number
  ronda_dib_px: number
  franjas_sep_px: number
  casa_px: number
  camino_principal_px: number
  camino_lomo_px: number
  camino_trabajo_px: number
  franjas_px: number
  cacao_origen: Punto
  cacao: Punto[]
  bebederos: Bebedero[]
}

export interface Escenario {
  id: string
  nombre: string
  nota: string
  fijo: boolean
  datos: Datos
  plano: Plano
}

export type Estado = 'si' | 'bajo' | 'no'
