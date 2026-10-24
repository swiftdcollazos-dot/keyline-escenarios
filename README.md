# Escenarios La Esperanza

App web para explorar los escenarios del diseño keyline de **La Esperanza** (Curso en Diseño Keyline, Módulo 2, clases 7 y 8). Corre en el navegador las mismas fórmulas del libro de Excel *«La Esperanza · Cálculos del diseño de referencia, paso a paso»* y permite guardar escenarios y compararlos lado a lado.

## Qué hace

- **Datos por capa** de la Escala de Permanencia, con la fuente de cada uno (dato del caso, medido en el plano, supuesto didáctico o nuevo en la app) y un botón para volver al valor de referencia.
- **Hasta cuatro escenarios lado a lado.** Trae 9 ejemplos de clase (verano de 150 días, verano caliente, represas más hondas, 80 reses, hato repartido, canal 1:200 en suelo arenoso, manguera de 20 mm, infiltración de la nota…). Editar un ejemplo crea una copia propia.
- **Verificaciones** con semáforo: agua del verano, represa seca, cuenca, muros, canales, casa, bebederos B1–B4 y las tres bandas de potreros, más el mapa de los 12 potreros.
- **Cifras clave** con la diferencia frente al escenario A y, al hacer clic, la fórmula y el porqué de cada paso.
- **Gráficas**: nivel del agua día a día (con la duración del verano de cada escenario), carga en la llave según el diámetro, «más hondo, no más ancho» y ancho del vertedero según la cuenca.
- **Sensibilidad**: qué dato mueve más cualquier resultado (±10 %, cotas ±0,5 m).
- **Diapositiva y tablas**: la verificación de la hoja 11, el volumen por capas y las estacas del canal cada 20 m.
- **Compartir y guardar**: enlace con el escenario, archivo .json para llevarlo a otro equipo y exportación a Excel con datos, cifras, verificaciones y la simulación diaria.

## Diferencias con el libro de Excel

El motor reproduce el libro, con estas diferencias deliberadas:

| Tema | Libro | App |
| --- | --- | --- |
| Simulación del verano (hoja 5) | 121 filas fijas: siempre 120 días | Simula los días de `Dias_verano` |
| Volumen por capas (hoja 3) | 6 filas fijas | Todas las curvas que hagan falta |
| Estacas del canal (hoja 7) | Hasta 220 m | Crece con la longitud del canal |
| Tablas «¿qué pasa si?» (hojas 4, 6 y 8) | Filas fijas | Curvas continuas |
| Cuenca de cada represa | No es un dato | `Cuenca_occ` y `Cuenca_ori` (supuesto de 1,5 ha cada una) |
| Quién abastece al hato | Cada represa sola atiende a todo el hato | Opción de repartirlo |

Una advertencia que la app muestra: el prismoide de la hoja 3 estima el área media con k = V modelo ÷ (A × H), así que su «coincide» en la hoja 11 no es una verificación independiente hasta medir esa área en QGIS.

## Pruebas doradas

`tests/golden.test.ts` compara el motor con el libro de Excel en 11 variantes de los datos (más de 900 comparaciones). Las cifras de Excel se generan recalculando el libro con LibreOffice:

```bash
pip install openpyxl          # y LibreOffice instalado
npm run fixtures              # escribe tests/fixtures/excel_cases.json
npm test
```

## Desarrollo

```bash
npm install
npm run dev       # servidor local
npm test          # pruebas
npm run build     # versión para publicar en dist/
```

Cada push a `main` corre las pruebas y publica la app en GitHub Pages (`.github/workflows/deploy.yml`).

## Estructura

- `src/engine/` — el modelo, sin interfaz: `calc.ts` (hojas 2 a 11), `data.ts` (datos y medidas del plano), `fields.ts`, `metrics.ts`, `checks.ts`, `presets.ts`, `sensitivity.ts`.
- `src/state/` — escenarios guardados en el navegador, enlaces para compartir y exportación.
- `src/ui/` — componentes de React.
- `tools/make_fixtures.py` — genera las cifras de Excel para las pruebas.

Las cifras de La Esperanza son didácticas: salen del modelo de terreno del caso, no de una finca real.
