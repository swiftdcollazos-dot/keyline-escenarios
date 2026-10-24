// Exportar escenarios a Excel (.xlsx) y a JSON, e importarlos de vuelta.

import * as XLSX from 'xlsx'
import { calcular } from '../engine/calc'
import { VERIFICACIONES, preguntaDe } from '../engine/checks'
import { CAMPOS } from '../engine/fields'
import { METRICAS } from '../engine/metrics'
import type { Escenario } from '../engine/types'

const ESTADO = { si: 'Sí', bajo: 'Marginal', no: 'No' }

export function exportarExcel(escenarios: Escenario[]) {
  const res = escenarios.map((e) => calcular(e.datos, e.plano))
  const libro = XLSX.utils.book_new()

  const datos = [
    ['Nombre', 'Dato', 'Unidad', ...escenarios.map((e) => e.nombre)],
    ...CAMPOS.map((c) => [c.k, c.label, c.unidad, ...escenarios.map((e) => e.datos[c.k])]),
  ]
  XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet(datos), 'Datos')

  const cifras = [
    ['Grupo', 'Resultado', 'Paso del libro', 'Unidad', ...escenarios.map((e) => e.nombre)],
    ...METRICAS.map((m) => [m.grupo, m.label, m.paso, m.unidad, ...res.map((r, i) => m.valor(r, escenarios[i].datos))]),
  ]
  XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet(cifras), 'Cifras clave')

  const ver = [
    ['Pregunta', 'Paso', ...escenarios.flatMap((e) => [e.nombre, ''])],
    ...VERIFICACIONES.map((v) => [
      preguntaDe(v, res[0]),
      v.paso,
      ...res.flatMap((r, i) => {
        const o = v.evaluar(r, escenarios[i].datos)
        return [ESTADO[o.estado], o.texto]
      }),
    ]),
  ]
  XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet(ver), 'Verificaciones')

  escenarios.forEach((e, i) => {
    const r = res[i]
    const filas = [
      ['Día', 'Vol. occidental (m³)', 'Nivel occidental (m)', 'Espejo occidental (m²)', 'Vol. oriental (m³)', 'Nivel oriental (m)', 'Espejo oriental (m²)'],
      ...r.occ.serie.map((x, j) => [x.dia, x.V, x.nivel, x.espejo, r.ori.serie[j].V, r.ori.serie[j].nivel, r.ori.serie[j].espejo]),
    ]
    const nombre = `Sim ${i + 1} ${e.nombre}`.replace(/[\\/?*[\]:]/g, '').slice(0, 31)
    XLSX.utils.book_append_sheet(libro, XLSX.utils.aoa_to_sheet(filas), nombre)
  })

  XLSX.writeFile(libro, 'La_Esperanza_escenarios.xlsx')
}

export function exportarJSON(escenarios: Escenario[]) {
  const blob = new Blob([JSON.stringify({ version: 1, escenarios }, null, 1)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'La_Esperanza_escenarios.json'
  a.click()
  URL.revokeObjectURL(a.href)
}

export async function leerJSON(archivo: File): Promise<Escenario[]> {
  const texto = await archivo.text()
  const obj = JSON.parse(texto)
  const lista = Array.isArray(obj) ? obj : obj.escenarios
  if (!Array.isArray(lista) || !lista.every((e) => e && typeof e === 'object' && 'datos' in e)) {
    throw new Error('El archivo no tiene escenarios de esta app.')
  }
  return lista as Escenario[]
}
