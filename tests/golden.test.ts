// Pruebas doradas: el motor debe dar las mismas cifras que el libro de Excel,
// recalculado con LibreOffice para cada variante (tools/make_fixtures.py).
import { describe, expect, it } from 'vitest'
import casos from './fixtures/excel_cases.json'
import { calcular } from '../src/engine/calc'
import { DATOS_REFERENCIA, PLANO_REFERENCIA } from '../src/engine/data'
import type { Datos, Estado } from '../src/engine/types'

type R = ReturnType<typeof calcular>

const estadoTexto = (e: Estado, texto: string) =>
  e === 'si' ? texto.startsWith('Sí') : e === 'bajo' ? /^(Carga baja|Marginal)/.test(texto) : texto.startsWith('No')

// Excel → motor. Las de la simulación dependen de 120 filas fijas en Excel.
const NUMEROS: Record<string, (r: R) => number> = {
  Escala: (r) => r.plano.escala,
  Area_plano: (r) => r.plano.area,
  Lmed_occ: (r) => r.plano.Lmed_occ,
  Lmed_ori: (r) => r.plano.Lmed_ori,
  Lmuro_occ: (r) => r.plano.Lmuro_occ,
  Lt_B1: (r) => r.bebederos[0].tubo,
  Lt_B4: (r) => r.bebederos[3].tubo,
  D_franjas: (r) => r.plano.D_franjas,
  Fondo_occ: (r) => r.occ.fondo,
  Fondo_ori: (r) => r.ori.fondo,
  k_occ: (r) => r.occ.k,
  k_ori: (r) => r.ori.k,
  m_occ: (r) => r.occ.m,
  Vpri_occ: (r) => r.occ.Vpri,
  Vpri_ori: (r) => r.ori.Vpri,
  Vcap_occ: (r) => r.occ.Vcap,
  Vcap_ori: (r) => r.ori.Vcap,
  Cons_dia: (r) => r.occ.consDia,
  Cons_ver: (r) => r.occ.consVer,
  Evap_occ: (r) => r.occ.evap,
  Evap_ori: (r) => r.ori.evap,
  Perd_occ: (r) => r.occ.perd,
  Perd_ori: (r) => r.ori.perd,
  Dem_occ: (r) => r.occ.dem,
  Dem_ori: (r) => r.ori.dem,
  '4!E21': (r) => r.occ.margen,
  '4!F22': (r) => r.ori.margenPct,
  '4!E24': (r) => r.occ.perdPorCons,
  Esc_ha: (r) => r.escHa,
  '4!E37': (r) => r.occ.cuencaMin,
  '4!E38': (r) => r.cuencaMinSerie,
  '4!E28': (r) => r.hondo(2).espejo,
  '4!F31': (r) => r.hondo(4).evap,
  '4!G33': (r) => r.hondo(6).pct,
  Vfin_occ: (r) => r.occ.Vfin,
  Vfin_ori: (r) => r.ori.Vfin,
  Nivel_fin_occ: (r) => r.occ.nivelFin,
  Nivel_fin_ori: (r) => r.ori.nivelFin,
  '5!G14': (r) => r.occ.descenso,
  '5!H15': (r) => r.ori.perdSim,
  '6!E11': (r) => r.occ.muro.h,
  '6!F18': (r) => r.ori.muro.base,
  '6!E19': (r) => r.occ.muro.seccion,
  '6!E20': (r) => r.occ.muro.tierra,
  '6!F20': (r) => r.ori.muro.tierra,
  '6!F21': (r) => r.ori.muro.aguaTierra,
  q_vert: (r) => r.q,
  Q_ha: (r) => r.Qha,
  Ancho_ha: (r) => r.anchoHa,
  S_canal: (r) => r.canal.S,
  '7!E12': (r) => r.canal.inicioOcc,
  Llegada_ori: (r) => r.canal.llegadaOri,
  Margen_ori: (r) => r.canal.margenOri,
  '7!F18': (r) => r.canal.pendMax,
  '7!E43': (r) => r.canal.R,
  '7!E44': (r) => r.canal.V,
  '7!E45': (r) => r.canal.Q,
  '7!E47': (r) => r.canal.Vmax,
  '7!F49': (r) => r.canal.horasOri,
  '7!E50': (r) => r.canal.cuencaServida,
  Carga_casa: (r) => r.casa.cargaLlena,
  '8!E11': (r) => r.casa.psi,
  '8!E15': (r) => r.casa.cargaFin,
  '8!E20': (r) => r.casa.Ltubo,
  '8!E24': (r) => r.casa.hf,
  '8!E25': (r) => r.casa.llaveLlena,
  '8!E26': (r) => r.casa.llaveFin,
  '8!G37': (r) => r.bebederos[0].carga,
  '8!G40': (r) => r.bebederos[3].carga,
  Franja2_occ: (r) => r.arboles.franja2Occ,
  Franja2_ori: (r) => r.arboles.franja2Ori,
  '9!E10': (r) => r.arboles.alturaArbol,
  '9!E12': (r) => r.arboles.pendiente,
  Area_cacao: (r) => r.arboles.areaCacao,
  '9!E46': (r) => r.arboles.plantas,
  Area_ronda: (r) => r.arboles.ronda,
  Area_franjas: (r) => r.arboles.franjas,
  '10!E12': (r) => r.potr.usos.caminos,
  Area_pasto: (r) => r.potr.pasto,
  '10!E18': (r) => r.potr.porPotrero,
  '10!E19': (r) => r.potr.carga,
  '10!E21': (r) => r.potr.ocupacion,
  '10!E22': (r) => r.potr.vuelta,
  '10!E23': (r) => r.potr.cargaInstantanea,
  '10!G28': (r) => r.potr.bandas.media.carga,
  '10!G29': (r) => r.potr.bandas.alta.carga,
}
const SIMULACION = new Set(['Vfin_occ', 'Vfin_ori', 'Nivel_fin_occ', 'Nivel_fin_ori', '5!G14', '5!H15', '8!E15', '8!E26'])

describe.each(casos)('Excel: $nombre', ({ nombre, cambios, excel }) => {
  const datos = { ...DATOS_REFERENCIA, ...cambios } as Datos
  const r = calcular(datos, PLANO_REFERENCIA)
  const rx = calcular(datos, PLANO_REFERENCIA, { capasExcel: true })
  const x = excel as Record<string, number | string>

  it.each(Object.keys(NUMEROS))('%s', (clave) => {
    if (nombre === 'verano_150' && SIMULACION.has(clave)) return // ver prueba aparte
    expect(clave in x, `falta ${clave} en el Excel`).toBe(true)
    const esperado = x[clave] as number
    const motor = clave.startsWith('Vcap') ? rx : r
    expect(NUMEROS[clave](motor)).toBeCloseTo(esperado, Math.abs(esperado) > 100 ? 4 : 8)
  })

  it('estados de bebederos, bandas y potreros', () => {
    r.bebederos.forEach((b, i) => expect(estadoTexto(b.estado, x[`8!H${37 + i}`] as string)).toBe(true))
    expect(estadoTexto(r.potr.bandas.baja.estado, x.Banda_baja as string)).toBe(true)
    expect(estadoTexto(r.potr.bandas.media.estado, x.Banda_media as string)).toBe(true)
    expect(estadoTexto(r.potr.bandas.alta.estado, x.Banda_alta as string)).toBe(true)
    r.potr.potreros.forEach((p, i) => {
      const t = x[`10!H${33 + i}`] as string
      if (p.bebedero) expect(t).toContain(`Bebedero ${p.bebedero}`)
      else if (p.estado === 'si') expect(t).toMatch(/^Falta bebedero/)
      else expect(estadoTexto(p.estado, t)).toBe(true)
    })
  })

  it('verificación contra la diapositiva (hoja 11)', () => {
    r.verificacion.forEach((v, i) => {
      if (!(nombre === 'verano_150' && i === 4)) expect(v.calculado).toBeCloseTo(x[`11!E${7 + i}`] as number, 6)
      expect(v.coincide ? 'Coincide' : 'Revisar').toBe(x[`11!G${7 + i}`])
    })
  })
})

it('verano de 150 días: el libro sigue simulando 120 y la app simula 150', () => {
  const caso = casos.find((c) => c.nombre === 'verano_150')!
  const r150 = calcular({ ...DATOS_REFERENCIA, Dias_verano: 150 }, PLANO_REFERENCIA)
  const r120 = calcular(DATOS_REFERENCIA, PLANO_REFERENCIA)
  expect(r150.occ.serie).toHaveLength(151)
  // Excel deja el nivel final del verano de 150 días igual al de 120 días.
  expect(caso.excel.Nivel_fin_ori).toBeCloseTo(r120.ori.nivelFin, 8)
  expect(r150.ori.nivelFin).toBeLessThan(r120.ori.nivelFin)
})

it('curvas cada 0,5 m: el libro se queda sin filas y la app suma todas las capas', () => {
  const d = { ...DATOS_REFERENCIA, Int_curvas: 0.5 }
  const app = calcular(d, PLANO_REFERENCIA)
  const excel = calcular(d, PLANO_REFERENCIA, { capasExcel: true })
  expect(app.occ.curvas.length).toBeGreaterThan(excel.occ.curvas.length)
  // Con más capas el método se acerca al volumen del modelo de terreno.
  expect(Math.abs(app.occ.difCap)).toBeLessThan(Math.abs(excel.occ.difCap))
})
