// Pruebas de lo que la app agrega al libro: escenarios de ejemplo, verificaciones y sensibilidad.
import { describe, expect, it } from 'vitest'
import { calcular } from '../src/engine/calc'
import { VERIFICACIONES } from '../src/engine/checks'
import { DATOS_REFERENCIA, PLANO_REFERENCIA } from '../src/engine/data'
import { METRICAS, metrica } from '../src/engine/metrics'
import { EJEMPLOS } from '../src/engine/presets'
import { sensibilidad } from '../src/engine/sensitivity'

const estado = (id: string, ejemplo: string) => {
  const e = EJEMPLOS.find((x) => x.id === ejemplo)!
  return VERIFICACIONES.find((v) => v.id === id)!.evaluar(calcular(e.datos, e.plano), e.datos).estado
}

describe('escenarios de ejemplo', () => {
  it('cada ejemplo calcula sin cifras inválidas', () => {
    for (const e of EJEMPLOS) {
      const r = calcular(e.datos, e.plano)
      for (const m of METRICAS) expect(Number.isFinite(m.valor(r, e.datos)), `${e.id}/${m.id}`).toBe(true)
    }
  })
  it('la referencia reproduce los semáforos del libro', () => {
    expect(estado('alcanza_occ', 'ref')).toBe('si')
    expect(estado('llave', 'ref')).toBe('si')
    expect(estado('bebedero_0', 'ref')).toBe('no') // B1 queda 1,3 m por encima del agua
    expect(estado('banda_media', 'ref')).toBe('bajo')
    expect(estado('banda_alta', 'ref')).toBe('no')
  })
  it('cada ejemplo cambia lo que dice cambiar', () => {
    expect(estado('llave', 'manguera20')).toBe('no')
    expect(estado('velocidad', 'arenoso')).toBe('no')
    expect(estado('vaso', 'hondas')).toBe('bajo')
    expect(estado('llave', 'verano150')).toBe('bajo') // 0,9 m: menos que la carga mínima
  })
  it('repartir el hato reduce la demanda de cada represa', () => {
    const rep = EJEMPLOS.find((e) => e.id === 'repartido')!
    const r = calcular(rep.datos, rep.plano)
    const ref = calcular(DATOS_REFERENCIA, PLANO_REFERENCIA)
    expect(r.occ.consVer + r.ori.consVer).toBeCloseTo(ref.occ.consVer, 9)
    expect(r.occ.dem).toBeLessThan(ref.occ.dem)
  })
})

describe('simulación', () => {
  it('detecta el día en que se seca una represa', () => {
    const d = { ...DATOS_REFERENCIA, N_reses: 400, Dias_verano: 200 }
    const r = calcular(d, PLANO_REFERENCIA)
    expect(r.occ.diaVacia).not.toBeNull()
    expect(r.occ.serie.at(-1)!.V).toBe(0)
  })
})

describe('sensibilidad', () => {
  it('el diámetro del tubo es lo que más mueve la carga en la llave', () => {
    const s = sensibilidad(DATOS_REFERENCIA, PLANO_REFERENCIA, metrica('llaveFin'))
    expect(s.barras[0].k).toBe('D_tubo')
    expect(s.base).toBeCloseTo(1.1304257176669, 9)
  })
})
