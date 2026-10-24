// Motor de cálculo: réplica de las hojas 2 a 11 del libro «La Esperanza · Cálculos
// del diseño de referencia, paso a paso». Cada bloque cita la hoja y el paso.
// Lo que en Excel son tablas de tamaño fijo (simulación de 120 filas, 6 capas,
// 12 estacas) aquí crece con los datos.

import { DIAPOSITIVA, POTREROS, SUELOS } from './data'
import type { Datos, Estado, Plano, Punto, Represa } from './types'

const largo = (pts: Punto[]) =>
  pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0)

/** Hazen-Williams en unidades métricas (paso 8.16): L en m, Q en L/s, D en mm. */
export function hazenWilliams(L: number, Q_ls: number, D_mm: number, C: number) {
  const Q = Q_ls / 1000
  const D = D_mm / 1000
  return (10.67 * L * Q ** 1.852) / (C ** 1.852 * D ** 4.87)
}

/** Hoja 2 · medir en el plano. */
function medir(d: Datos, p: Plano) {
  const escala = d.Barra_m / d.Barra_px
  const ancho = p.ancho_px * escala
  const alto = p.alto_px * escala
  const area = (ancho * alto) / 10000
  const Lmed_occ = largo(p.canal_occ) * escala
  const Lmed_ori = largo(p.canal_ori) * escala
  return {
    escala,
    ancho,
    alto,
    area,
    areaDif: (area - d.Area_predio) / d.Area_predio,
    Lmed_occ,
    Lmed_ori,
    Lmed_occDif: (Lmed_occ - d.Lcan_occ) / d.Lcan_occ,
    Lmed_oriDif: (Lmed_ori - d.Lcan_ori) / d.Lcan_ori,
    Lmuro_occ: p.muro_occ_px * escala,
    Lmuro_ori: p.muro_ori_px * escala,
    L_cano: p.cano_px * escala,
    Ronda_dib: p.ronda_dib_px * escala,
    D_franjas: p.franjas_sep_px * escala,
    L_casa: p.casa_px * escala,
    Lc: [p.camino_principal_px, p.camino_lomo_px, p.camino_trabajo_px].map((x) => x * escala),
    L_franjas: p.franjas_px * escala,
  }
}

/** Hoja 3 · volumen de una represa por tres métodos. */
function volumen(d: Datos, s: Represa, maxCapas = Infinity) {
  const PK = s === 'occ' ? d.PK_occ : d.PK_ori
  const A = s === 'occ' ? d.Espejo_occ : d.Espejo_ori
  const H = s === 'occ' ? d.Hmax_occ : d.Hmax_ori
  const V = s === 'occ' ? d.Vmod_occ : d.Vmod_ori
  const fondo = PK - H
  const cajon = A * H
  const k = V / cajon
  const m = 1 / k
  const areaA = (z: number) => (z <= fondo ? 0 : A * ((z - fondo) / H) ** (m - 1))
  // Método A · regla de bolsillo
  const Vbolsillo = d.k_bolsillo * cajon
  // Método B · prismoide con el área media estimada por el modelo del vaso
  const Amedia = A * 0.5 ** (m - 1)
  const Vpri = (H / 6) * (A + 4 * Amedia + 0)
  // Método C · capas entre curvas de nivel enteras
  const curvas: { cota: number; area: number; espesor: number; volumen: number }[] = [
    { cota: PK, area: areaA(PK), espesor: 0, volumen: 0 },
  ]
  let z = Math.max(Math.floor(PK), fondo)
  for (let i = 0; i < 1000; i++) {
    const prev = curvas[curvas.length - 1]
    const espesor = prev.cota - z
    const area = areaA(z)
    curvas.push({ cota: z, area, espesor, volumen: (espesor * (prev.area + area)) / 2 })
    if (z <= fondo) break
    // El libro tiene 6 filas: la última es siempre el fondo y se lleva el resto.
    z = curvas.length === maxCapas ? fondo : Math.max(z - d.Int_curvas, fondo)
  }
  const Vcap = curvas.reduce((acc, c) => acc + c.volumen, 0)
  return {
    PK, A, H, V, fondo, cajon, k, m, Vbolsillo, Amedia, Vpri, curvas, Vcap,
    difBolsillo: (Vbolsillo - V) / V,
    difPri: (Vpri - V) / V,
    difCap: (Vcap - V) / V,
  }
}

type Vol = ReturnType<typeof volumen>

/** Hojas 4 y 5 · balance conservador y simulación día a día. */
function balance(d: Datos, v: Vol, parte: number) {
  const consDia = ((d.N_reses * d.Consumo_res) / 1000) * parte
  const consVer = consDia * d.Dias_verano
  const laminaEvap = (d.Evap_dia * d.Dias_verano) / 1000
  const evap = laminaEvap * v.A
  const laminaInfil = (d.Infil_dia * d.Dias_verano) / 1000
  const infil = laminaInfil * v.A
  const perd = evap + infil
  const dem = consVer + perd
  const margen = v.V - dem
  const serie: { dia: number; V: number; prof: number; espejo: number; perd: number; cons: number; nivel: number }[] = []
  let V = v.V
  for (let dia = 0; dia <= d.Dias_verano; dia++) {
    const f = V / v.V
    const prof = v.H * f ** (1 / v.m)
    const espejo = v.A * f ** ((v.m - 1) / v.m)
    const perdDia = ((d.Evap_dia + d.Infil_dia) / 1000) * espejo
    const cons = V > 0 ? consDia : 0
    serie.push({ dia, V, prof, espejo, perd: perdDia, cons, nivel: v.fondo + prof })
    V = Math.max(0, V - perdDia - cons)
  }
  const fin = serie[serie.length - 1]
  const perdSim = serie.slice(0, -1).reduce((s, x) => s + x.perd, 0)
  const vacia = serie.find((x) => x.V <= 0)
  return {
    consDia, consVer, laminaEvap, evap, laminaInfil, infil, perd, dem, margen,
    margenPct: margen / v.V,
    evapPct: evap / v.V,
    alcanza: margen >= 0,
    perdPorCons: consVer > 0 ? perd / consVer : Infinity,
    serie,
    Vfin: fin.V,
    nivelFin: fin.nivel,
    descenso: serie[0].nivel - fin.nivel,
    perdSim,
    difConservador: (perd - perdSim) / perdSim,
    diaVacia: vacia ? vacia.dia : null,
  }
}

/** Hoja 6 · muro de una represa. */
function muro(d: Datos, v: Vol, L: number) {
  const corona = v.PK + d.Borde_libre
  const h = corona - v.fondo
  const base = d.Corona + 2 * d.Talud_muro * h
  const seccion = h * (d.Corona + d.Talud_muro * h)
  const tierra = L * ((d.Corona * h) / 2 + (d.Talud_muro * h * h) / 3)
  return { corona, h, ok: h <= d.Hmuro_max, L, base, seccion, tierra, aguaTierra: v.V / tierra }
}

const estadoCarga = (carga: number, margen: number, estricto = false): Estado =>
  (estricto ? carga > margen : carga >= margen) ? 'si' : carga > 0 ? 'bajo' : 'no'

export interface Opciones {
  /** Imitar las 6 capas fijas de la hoja 3 (solo para comparar con Excel). */
  capasExcel?: boolean
}

export function calcular(d: Datos, p: Plano, opciones: Opciones = {}) {
  const plano = medir(d, p)
  const maxCapas = opciones.capasExcel ? 6 : Infinity
  const occ = volumen(d, 'occ', maxCapas)
  const ori = volumen(d, 'ori', maxCapas)

  // Hoja 4 · el libro supone que cada represa sola atiende a todo el hato
  const parteOcc = d.Reparto === 'dividido' ? d.Parte_occ : 1
  const parteOri = d.Reparto === 'dividido' ? 1 - d.Parte_occ : 1
  const bOcc = balance(d, occ, parteOcc)
  const bOri = balance(d, ori, parteOri)

  // Hoja 4 D · más hondo, no más ancho: mismo volumen occidental, otra profundidad
  const hondo = (H: number) => {
    const espejo = d.Vmod_occ / (occ.k * H)
    const evap = (espejo * d.Evap_dia * d.Dias_verano) / 1000
    return { H, espejo, evap, pct: evap / d.Vmod_occ }
  }

  // Hoja 4 E · cuenca
  const escHa = (d.Lluvia_anual / 1000) * d.C_anual * 10000
  const cuencaMinOcc = d.Vmod_occ / escHa
  const cuencaMinOri = d.Vmod_ori / escHa
  const cuencaMinSerie = (d.Vmod_occ + d.Vmod_ori) / escHa
  // La oriental recibe su cuenca más el rebose de la occidental (hoja 6, nota 6.18)
  const cuencaOcc = d.Cuenca_occ
  const cuencaOri = d.Cuenca_occ + d.Cuenca_ori

  // Hoja 6 · muros y vertederos
  const mOcc = muro(d, occ, plano.Lmuro_occ)
  const mOri = muro(d, ori, plano.Lmuro_ori)
  const q = d.Coef_vert * d.Lam_vert ** 1.5
  const Qha = (d.C_tormenta * d.I_diseno * 1) / 360
  const anchoHa = Qha / q
  const vertedero = (cuenca: number) => ({ cuenca, Q: Qha * cuenca, ancho: (Qha * cuenca) / q })

  // Hoja 7 · canales a 1:300
  const S = 1 / d.Pend_canal
  const caidaOcc = d.Lcan_occ * S
  const caidaOri = d.Lcan_ori * S
  const inicioOcc = d.PK_occ + caidaOcc
  const llegadaOcc = d.PK_occ
  const inicioOri = d.PK_occ
  const llegadaOri = inicioOri - caidaOri
  const margenOcc = llegadaOcc - d.PK_occ
  const margenOri = llegadaOri - d.PK_ori
  const desnivel = d.PK_occ - d.PK_ori
  const estacas: { dist: number; occ: number | null; ori: number | null }[] = []
  for (let dist = 0; dist <= Math.max(d.Lcan_occ, d.Lcan_ori) + 0.001; dist += 20) {
    estacas.push({
      dist,
      occ: dist > d.Lcan_occ + 0.001 ? null : inicioOcc - dist * S,
      ori: dist > d.Lcan_ori + 0.001 ? null : inicioOri - dist * S,
    })
  }
  const Am = (d.b_canal + d.z_canal * d.y_canal) * d.y_canal
  const Pm = d.b_canal + 2 * d.y_canal * Math.sqrt(1 + d.z_canal ** 2)
  const R = Am / Pm
  const Vcanal = (1 / d.n_Manning) * R ** (2 / 3) * S ** 0.5
  const Qcanal = Vcanal * Am * 1000
  const Vmax = SUELOS[d.Suelo_canal]
  const canal = {
    S, pct: S * 100, caidaOcc, caidaOri, inicioOcc, llegadaOcc, inicioOri, llegadaOri, margenOcc, margenOri,
    desnivel, pendMax: d.Lcan_ori / desnivel, estacaCm: 20 * S * 100, estacas,
    Am, Pm, R, V: Vcanal, Q: Qcanal, Vmax, seguro: Vcanal <= Vmax,
    horasOcc: d.Vmod_occ / (Qcanal / 1000) / 3600,
    horasOri: d.Vmod_ori / (Qcanal / 1000) / 3600,
    cuencaServida: Qcanal / 1000 / Qha,
  }

  // Hoja 8 · casa y bebederos
  const Ltubo = plano.L_casa * d.F_trazado
  const hf = hazenWilliams(Ltubo, d.Q_casa, d.D_tubo, d.C_HW)
  const cargaLlena = d.PK_ori - d.Cota_casa
  const cargaFin = bOri.nivelFin - d.Cota_casa
  const casa = {
    cargaLlena,
    kPa: cargaLlena * 9.81,
    psi: cargaLlena * 9.81 * 0.145,
    fondoSobreCasa: ori.fondo > d.Cota_casa,
    cargaFin,
    Ltubo,
    hf,
    llaveLlena: cargaLlena - hf,
    llaveFin: cargaFin - hf,
    llega: cargaFin - hf > 0,
  }
  const llaveSegunDiametro = (D_mm: number) => cargaFin - hazenWilliams(Ltubo, d.Q_casa, D_mm, d.C_HW)
  const bebederos = p.bebederos.map((b) => {
    const nivel = b.represa === 'occ' ? d.PK_occ : d.PK_ori
    const carga = nivel - b.cota
    return { ...b, nivel, carga, estado: estadoCarga(carga, d.Margen_grav), tubo: b.tubo_px * plano.escala }
  })

  // Hoja 9 · franjas, cacao, ronda
  const franja2Occ = d.PK_occ + d.Int_franjas
  const franja2Ori = d.PK_ori + d.Int_franjas
  const [x0, y0] = p.cacao_origen
  const xy = p.cacao.map(([x, y]) => [(x - x0) * plano.escala, (y0 - y) * plano.escala] as Punto)
  const cruz = xy.reduce((s, [x, y], i) => {
    const [xn, yn] = xy[(i + 1) % xy.length]
    return s + (x * yn - xn * y)
  }, 0)
  const areaCacao = Math.abs(cruz) / 2 / 10000
  const plantasHa = 10000 / d.Dist_cacao ** 2
  const arboles = {
    franja2Occ, franja2Ori,
    alturaArbol: d.Int_franjas - d.Desn_franja,
    pendiente: d.Int_franjas / plano.D_franjas,
    separacion: (pend: number) => d.Int_franjas / pend,
    areaCacao,
    metaCacao: areaCacao / d.Cacao_meta,
    plantasHa,
    plantas: areaCacao * plantasHa,
    ronda: (plano.L_cano * d.Ronda) / 10000,
    franjas: (plano.L_franjas * d.Ancho_franja) / 10000,
  }

  // Hoja 10 · potreros
  const usos = {
    espejos: (d.Espejo_occ + d.Espejo_ori) / 10000,
    cacao: areaCacao,
    ronda: arboles.ronda,
    franjas: arboles.franjas,
    caminos: (plano.Lc.reduce((a, b) => a + b, 0) * d.Ancho_camino) / 10000,
    construcciones: d.Area_constr,
  }
  const pasto = d.Area_predio - Object.values(usos).reduce((a, b) => a + b, 0)
  const porPotrero = pasto / d.N_potreros
  const ocupacion = d.Descanso / (d.N_potreros - 1)
  const alto = Math.max(d.PK_occ, d.PK_ori)
  // El libro usa «> margen» en las bandas y «≥ margen» en los bebederos (hoja 8).
  const banda = (cotaBaja: number, cotaAlta: number) => {
    const carga = alto - cotaBaja
    return { cotaBaja, cotaAlta, carga, estado: estadoCarga(carga, d.Margen_grav, true) }
  }
  const bandas = {
    baja: banda(d.Cota_cano, alto),
    media: banda(Math.min(d.PK_occ, d.PK_ori), Math.max(franja2Occ, franja2Ori)),
    alta: banda(Math.min(franja2Occ, franja2Ori), d.Cota_max),
  }
  const potreros = POTREROS.map((pt) => {
    const beb = bebederos.find((b) => b.potrero === pt.id)
    const bd = bandas[pt.banda]
    return { ...pt, bebedero: beb?.id ?? null, estado: beb ? beb.estado : bd.estado, carga: beb ? beb.carga : bd.carga }
  })
  const potr = {
    usos, pasto, porPotrero,
    carga: d.N_reses / pasto,
    ocupacion,
    vuelta: ocupacion * d.N_potreros,
    cargaInstantanea: d.N_reses / porPotrero,
    bandas,
    potreros,
  }

  // Hoja 11 · verificación contra la diapositiva
  const fila = (concepto: string, diapositiva: number, calculado: number, unidad: string) => {
    const dif = (calculado - diapositiva) / diapositiva
    return { concepto, diapositiva, calculado, unidad, dif, coincide: Math.abs(dif) <= d.Tolerancia }
  }
  const verificacion = [
    fila('Volumen de la represa occidental', DIAPOSITIVA.Vol_occ, occ.Vpri, 'm³'),
    fila('Volumen de la represa oriental', DIAPOSITIVA.Vol_ori, ori.Vpri, 'm³'),
    fila('Evaporación de cada espejo en el verano', DIAPOSITIVA.Evap, bOcc.evap, 'm³'),
    fila('Consumo de las reses en el verano', DIAPOSITIVA.Consumo, bOcc.consVer, 'm³'),
    fila('Evaporación + infiltración del espejo', DIAPOSITIVA.Perdidas, bOcc.perd, 'm³'),
    fila('Canal occidental', DIAPOSITIVA.Canal_occ, plano.Lmed_occ, 'm'),
    fila('Canal de vertedero a vertedero', DIAPOSITIVA.Canal_ori, plano.Lmed_ori, 'm'),
    fila('Desnivel entre el agua oriental y la casa', DIAPOSITIVA.Carga_casa, cargaLlena, 'm'),
    fila('Cacao con sombrío', DIAPOSITIVA.Cacao, areaCacao, 'ha'),
    fila('Área del predio', DIAPOSITIVA.Predio, plano.area, 'ha'),
  ]

  return {
    plano,
    occ: {
      ...occ, ...bOcc, muro: mOcc,
      cuenca: cuencaOcc, cuencaMin: cuencaMinOcc, llena: cuencaOcc >= cuencaMinOcc,
      vertedero: vertedero(cuencaOcc),
    },
    ori: {
      ...ori, ...bOri, muro: mOri,
      cuenca: cuencaOri, cuencaMin: cuencaMinOri, llena: cuencaOri >= cuencaMinOri,
      vertedero: vertedero(cuencaOri),
    },
    hondo,
    escHa, cuencaMinSerie,
    q, Qha, anchoHa,
    canal,
    casa, llaveSegunDiametro, bebederos,
    arboles,
    potr,
    verificacion,
  }
}

export type Resultados = ReturnType<typeof calcular>
