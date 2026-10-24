import { useRef, useState } from 'react'
import { EJEMPLOS } from '../engine/presets'
import type { Escenario } from '../engine/types'
import { enlaceDe, type Store } from '../state/store'
import { Marca } from './Marca'

function Opciones({ s }: { s: Store }) {
  return (
    <>
      <optgroup label="Ejemplos de clase">
        {EJEMPLOS.map((e) => (
          <option key={e.id} value={e.id}>{e.nombre}</option>
        ))}
      </optgroup>
      {s.propios.length > 0 && (
        <optgroup label="Mis escenarios">
          {s.propios.map((e) => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </optgroup>
      )}
    </>
  )
}

export function ScenarioBar({ s }: { s: Store }) {
  const [aviso, setAviso] = useState('')
  const [borrando, setBorrando] = useState(false)
  const archivo = useRef<HTMLInputElement>(null)
  const activo = s.porId(s.activo)
  const enColumnas = s.columnas.map(s.porId)

  const avisar = (t: string) => {
    setAviso(t)
    setTimeout(() => setAviso(''), 3500)
  }

  const duplicar = () => {
    const e = s.crear(activo, `${activo.nombre} (copia)`)
    if (s.puedeAgregar) s.agregarColumna(e.id)
    else {
      s.ponerEnColumna(s.columnas.indexOf(s.activo), e.id)
      s.setActivo(e.id)
    }
  }

  const compartir = async (e: Escenario) => {
    const url = enlaceDe(e)
    try {
      await navigator.clipboard.writeText(url)
      avisar('Enlace copiado. Quien lo abra recibe una copia de este escenario.')
    } catch {
      window.prompt('Copie este enlace:', url)
    }
  }

  // El módulo de exportación trae la librería de Excel: se carga solo cuando se usa.
  const exportar = () => import('../state/exportar')

  const importar = async (f: File | undefined) => {
    if (!f) return
    try {
      const { leerJSON } = await exportar()
      const nuevos = s.importar(await leerJSON(f))
      if (nuevos[0]) s.agregarColumna(nuevos[0].id)
      avisar(`Importados ${nuevos.length} escenario${nuevos.length === 1 ? '' : 's'}.`)
    } catch (err) {
      avisar(err instanceof Error ? err.message : 'No se pudo leer el archivo.')
    }
    if (archivo.current) archivo.current.value = ''
  }

  return (
    <>
      <div className="cols" role="group" aria-label="Escenarios comparados">
        {s.columnas.map((id, i) => {
          const e = s.porId(id)
          const esActivo = id === s.activo
          return (
            <div key={i} className={`col${esActivo ? ' activo' : ''}`}>
              <div className="row">
                <Marca i={i} />
                <select
                  id={`col-${i}`}
                  aria-label={`Escenario de la columna ${i + 1}`}
                  value={id}
                  onChange={(ev) => {
                    s.ponerEnColumna(i, ev.target.value)
                    if (esActivo) s.setActivo(ev.target.value)
                  }}
                >
                  <Opciones s={s} />
                </select>
                {s.columnas.length > 1 && (
                  <button className="ghost" type="button" title="Quitar de la comparación" aria-label="Quitar de la comparación" onClick={() => s.quitarColumna(i)}>
                    ×
                  </button>
                )}
              </div>
              {esActivo && !e.fijo ? (
                <>
                  <input id={`nombre-${i}`} type="text" aria-label="Nombre del escenario" value={e.nombre} maxLength={50} onChange={(ev) => s.renombrar(e.id, ev.target.value)} />
                  <input id={`nota-${i}`} type="text" aria-label="Nota del escenario" placeholder="Nota: qué prueba este escenario" value={e.nota} maxLength={160} onChange={(ev) => s.anotar(e.id, ev.target.value)} />
                </>
              ) : (
                <div className="nota">{e.nota}</div>
              )}
              <label className="editar">
                <input type="radio" name="activo" checked={esActivo} onChange={() => s.setActivo(id)} />
                {esActivo ? (e.fijo ? 'Se edita a la izquierda (crea una copia)' : 'Se edita a la izquierda') : 'Editar este'}
              </label>
            </div>
          )
        })}
        {s.puedeAgregar && (
          <button type="button" className="col add" onClick={() => s.agregarColumna((EJEMPLOS.find((e) => !s.columnas.includes(e.id)) ?? EJEMPLOS[0]).id)}>
            + Comparar otro escenario
          </button>
        )}
      </div>
      <div className="toolbar">
        <button type="button" onClick={duplicar}>Duplicar «{activo.nombre}»</button>
        {!activo.fijo &&
          (borrando ? (
            <>
              <span className="sub" style={{ margin: 0 }}>¿Borrar «{activo.nombre}»?</span>
              <button type="button" className="danger" onClick={() => { s.borrar(activo.id); setBorrando(false) }}>Sí, borrar</button>
              <button type="button" onClick={() => setBorrando(false)}>Cancelar</button>
            </>
          ) : (
            <button type="button" className="danger" onClick={() => setBorrando(true)}>Borrar</button>
          ))}
        <button type="button" onClick={() => compartir(activo)}>Copiar enlace para compartir</button>
        <span className="toast" role="status">{aviso}</span>
        <span className="sep" />
        <button type="button" onClick={async () => (await exportar()).exportarExcel(enColumnas)}>Exportar a Excel</button>
        <button type="button" onClick={async () => (await exportar()).exportarJSON(s.propios.length ? s.propios : enColumnas)} title="Guarda sus escenarios en un archivo para llevarlos a otro equipo">
          Guardar escenarios (.json)
        </button>
        <button type="button" onClick={() => archivo.current?.click()}>Abrir .json</button>
        <input ref={archivo} id="importar" type="file" accept="application/json,.json" hidden onChange={(ev) => importar(ev.target.files?.[0])} />
      </div>
    </>
  )
}
