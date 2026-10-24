// Estado de la app: escenarios propios (en el navegador), qué escenarios se
// comparan y cuál se edita. Los ejemplos son fijos: editarlos crea una copia.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { DATOS_REFERENCIA, PLANO_REFERENCIA } from '../engine/data'
import { EJEMPLOS } from '../engine/presets'
import type { Datos, Escenario, Plano } from '../engine/types'

const CLAVE = 'keyline-escenarios.v1'
const MAX_COLUMNAS = 4

interface Guardado {
  propios: Escenario[]
  columnas: string[]
  activo: string
}

const leer = (): Guardado | null => {
  try {
    const raw = localStorage.getItem(CLAVE)
    return raw ? (JSON.parse(raw) as Guardado) : null
  } catch {
    return null
  }
}

/** Completa con la referencia lo que falte (escenarios guardados con versiones viejas). */
const normalizar = (e: Escenario): Escenario => ({
  ...e,
  fijo: false,
  datos: { ...DATOS_REFERENCIA, ...e.datos },
  plano: { ...structuredClone(PLANO_REFERENCIA), ...e.plano },
})

export const nuevoId = () => 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

/** Un escenario compartido viaja en el enlace como #e=<base64 de JSON>. */
export function escenarioDelEnlace(): Escenario | null {
  const m = location.hash.match(/^#e=(.+)$/)
  if (!m) return null
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(m[1]))))
    const e = JSON.parse(json) as Pick<Escenario, 'nombre' | 'nota' | 'datos' | 'plano'>
    return normalizar({ ...e, id: nuevoId(), fijo: false })
  } catch {
    return null
  }
}

export function enlaceDe(e: Escenario) {
  const json = JSON.stringify({ nombre: e.nombre, nota: e.nota, datos: e.datos, plano: e.plano })
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return `${location.origin}${location.pathname}#e=${encodeURIComponent(b64)}`
}

export function useEscenarios() {
  const inicial = useMemo(() => {
    const g = leer()
    const propios = (g?.propios ?? []).map(normalizar)
    let columnas = g?.columnas ?? ['ref', 'verano150']
    let activo = g?.activo ?? 'verano150'
    const compartido = escenarioDelEnlace()
    if (compartido) {
      propios.push({ ...compartido, nombre: compartido.nombre + ' (compartido)' })
      columnas = ['ref', compartido.id]
      activo = compartido.id
      history.replaceState(null, '', location.pathname)
    }
    return { propios, columnas, activo }
  }, [])

  const [propios, setPropios] = useState<Escenario[]>(inicial.propios)
  const [columnas, setColumnas] = useState<string[]>(inicial.columnas)
  const [activo, setActivoCrudo] = useState<string>(inicial.activo)
  // «vista» cambia cuando el usuario cambia de escenario, no cuando una edición crea la copia
  // de un ejemplo: así el panel de datos no pierde el foco mientras se escribe.
  const [vista, setVista] = useState(0)
  const setActivo = useCallback((id: string) => {
    setActivoCrudo(id)
    setVista((v) => v + 1)
  }, [])

  const todos = useMemo(() => [...EJEMPLOS, ...propios], [propios])
  const porId = useCallback((id: string) => todos.find((e) => e.id === id) ?? EJEMPLOS[0], [todos])

  // Quita columnas que ya no existen (por ejemplo, un escenario borrado).
  const columnasValidas = useMemo(() => {
    const cols = columnas.filter((id) => todos.some((e) => e.id === id))
    return cols.length ? cols : ['ref']
  }, [columnas, todos])
  const activoValido = columnasValidas.includes(activo) ? activo : columnasValidas[columnasValidas.length - 1]

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ propios, columnas: columnasValidas, activo: activoValido }))
    } catch {
      /* sin almacenamiento: la app sigue funcionando */
    }
  }, [propios, columnasValidas, activoValido])

  const crear = useCallback((desde: Escenario, nombre: string) => {
    const e: Escenario = {
      id: nuevoId(),
      nombre,
      nota: `Copia de «${desde.nombre}».`,
      fijo: false,
      datos: { ...desde.datos },
      plano: structuredClone(desde.plano),
    }
    setPropios((p) => [...p, e])
    return e
  }, [])

  /** Devuelve el id editable del escenario activo: si es un ejemplo, crea una copia y la pone en su columna. */
  const editable = useCallback(
    (cambiar: (e: Escenario) => Escenario) => {
      const actual = porId(activoValido)
      if (!actual.fijo) {
        setPropios((p) => p.map((e) => (e.id === actual.id ? cambiar(e) : e)))
        return
      }
      const copia = cambiar({
        id: nuevoId(),
        nombre: actual.id === 'ref' ? 'Mi escenario' : `${actual.nombre} (mío)`,
        nota: `Copia editable de «${actual.nombre}».`,
        fijo: false,
        datos: { ...actual.datos },
        plano: structuredClone(actual.plano),
      })
      setPropios((p) => [...p, copia])
      setColumnas(columnasValidas.map((id) => (id === actual.id ? copia.id : id)))
      setActivoCrudo(copia.id)
    },
    [porId, activoValido, columnasValidas],
  )

  const setDato = useCallback(
    <K extends keyof Datos>(k: K, v: Datos[K]) => editable((e) => ({ ...e, datos: { ...e.datos, [k]: v } })),
    [editable],
  )
  const setPlano = useCallback((f: (p: Plano) => Plano) => editable((e) => ({ ...e, plano: f(structuredClone(e.plano)) })), [editable])

  const renombrar = (id: string, nombre: string) => setPropios((p) => p.map((e) => (e.id === id ? { ...e, nombre } : e)))
  const anotar = (id: string, nota: string) => setPropios((p) => p.map((e) => (e.id === id ? { ...e, nota } : e)))
  const borrar = (id: string) => {
    setPropios((p) => p.filter((e) => e.id !== id))
    setColumnas((c) => c.filter((x) => x !== id))
  }
  const importar = (lista: Escenario[]) => {
    const nuevos = lista.map((e) => normalizar({ ...e, id: nuevoId() }))
    setPropios((p) => [...p, ...nuevos])
    return nuevos
  }

  const ponerEnColumna = (i: number, id: string) => {
    setColumnas(columnasValidas.map((x, j) => (j === i ? id : x)))
    setVista((v) => v + 1)
  }
  const agregarColumna = (id: string) => {
    if (columnasValidas.length < MAX_COLUMNAS) setColumnas([...columnasValidas, id])
    setActivo(id)
  }
  const quitarColumna = (i: number) => setColumnas(columnasValidas.filter((_, j) => j !== i))

  return {
    todos,
    propios,
    porId,
    columnas: columnasValidas,
    activo: activoValido,
    vista,
    setActivo,
    setDato,
    setPlano,
    crear,
    renombrar,
    anotar,
    borrar,
    importar,
    ponerEnColumna,
    agregarColumna,
    quitarColumna,
    puedeAgregar: columnasValidas.length < MAX_COLUMNAS,
  }
}

export type Store = ReturnType<typeof useEscenarios>
