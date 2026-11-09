# Informe de modo autónomo: plan de refinamiento, rama `auto/plan-refinamiento-2026-11-09`

09/11/2026. Solo planificación: **no se tocó código, ni versión, ni se ejecutó ninguna tarea R.x.** `node -v`: v24.18.0. Rama creada desde `main` actualizado (`e4e967f`, fusión del PR #12; `git fetch` y comparación con `origin/main`). Todo con la herramienta de archivos (y `prettier --write` sobre los `.md`).

## Qué se hizo, un commit por paso

1. **Registro de la 0.5.0** (`docs/historial/plan-grupo-3.md`) con datos de `npm view` y de git, no del usuario: publicada `2026-11-09T16:26:51.620Z` (11:26 en Colombia), `latest` = 0.5.0, 165 archivos, shasum `dbe98091…`, etiqueta anotada `v0.5.0` sobre `e4e967f`. Release de GitHub y despliegue: no constan. El usuario probó la 0.5.0 desde npm y le funcionó (su dato). `plan.md` pasa de «por publicar» a «publicada». Mismo commit: `docs/plan/refinamiento/peticiones-usuario.md` (sin commit del usuario).
2. **El plan:** `docs/plan/refinamiento/plan.md` (principio, reparto, orden, rupturas), `R-0.6.0.md` (R.0 a R.18 y R.24, más la puerta R.P6) y `R-0.7.0.md` (R.19 a R.23 y R.P7). Cada tarea: qué pide, cómo es hoy (con archivo y línea), propuesta, archivos, ruptura, tamaño y pruebas. Índice en `docs/plan.md`; **Grupo 4 → 0.8.0** (`plan.md`, `plan/grupo-4.md`, `plan/grupo-3-blocks.md`, spec); **principio «uso corto por defecto, composición cuando la necesites»** en la spec 1.
3. **Tres decisiones de gusto, sin adoptar por defecto** (`decisiones-usuario.md`, índice en `plan/decisiones.md`): PD-1 Card (A/B/C; recomiendo B), PD-2 Table/Data Table (A/B/C; recomiendo C), PD-3 mensajes de error de Form Field (A/B/C; recomiendo A + B). Cada una con código de uso.
4. **Combobox frente a Select** (`combobox-vs-select.md`): respuesta con evidencia y plan de cambios (M.9 → R.15 → R.16).

## Hallazgos que cambian lo que el usuario cree que falta (verificados en el código)

- **Dialog como servicio ya existe** (`MimiDialogService.open`, `ref.close(resultado)`, `afterClosed()`, `MIMI_DIALOG_DATA`, `maxWidth` adaptado a pantalla, `class`, piezas opcionales, sobre cdk Dialog). R.7 cubre lo que falta (`closed`, `inputs`, `padding`, `chrome`, `panelClass`, página con el servicio primero).
- **OTP ya tiene `length`**; el problema real es que con 10 casillas de 46 px no cabe en un teléfono y los ejemplos usan 4, 5 y 6 (R.18).
- **Toast `outline` ya existe**, pero es la tarjeta neutra con solo el ícono de color (R.5).
- **Switch y Checkbox ya son dos componentes**; lo junto es la página de documentación (R.3).
- **Signal Forms ya acepta el mensaje en el validador** (`required(p, { message })`, hay ejemplo) y Form Field lo muestra; en Reactive Forms el `message` del error se pierde (`field-state.ts:157-163`). Base de PD-3.
- **Clic desigual:** 0,9 a 0,99 con números sueltos en 9 componentes, que además ignoran `prefers-reduced-motion` (R.9).
- **Los Blocks con `loading` solo marcan el botón de enviar;** los campos y los botones sociales siguen editables (R.11).
- **La spec ya dice que SM/MD/LG son globales** para todos los controles; el código lo cumple en Button e Input (R.1).
- **Contrastes de la paleta comprobados con cálculo:** `#793EEA` sobre `#171717` 3,15:1; `#A88FFF` sobre `#FAFAFA` 2,50:1 (ambos como el usuario dijo); `#793EEA` y texto `#FAFAFA` 5,45:1; `#A88FFF` y `#171717` 6,86:1. En OKLCH, `#793EEA` = `oklch(0.540 0.239 292.0)` y `#A88FFF` = `oklch(0.720 0.160 292.2)`: el tono 292 es exacto.

## Alertas

1. **Dos causas de R.10 son hipótesis**, no comprobadas en un navegador (sombra oscura que sale por el borde del contenedor en Tabs y Toggle Group; el Skeleton casi igual al fondo en claro). La tarea empieza con diagnóstico en el navegador.
2. **Valores propuestos sin diseño** (escala de violeta intermedia, tamaños de Toast `sm/lg`, anchos de Dialog `sm/lg`, tamaños de OTP): son punto de partida; se anotarán en `docs/design/correcciones-pendientes.md` al hacerlos.
3. **Decisiones técnicas que tomé en el plan** (revisables): `default` se acepta como alias de `md` durante la 0.6.0 y se quita en la 0.7.0; el tema de marca es el **por defecto** y el neutro actual pasa a un preset `neutral`; `inert` en vez de trampa de foco en la carga a pantalla completa (R.23); `mimi-tab` ansioso, `ng-template` perezoso, y las dos formas conviven (R.17); Select no suma `multiple` (R.16).
4. **R.0 necesita archivos del usuario** (logo y favicon) solo para la parte del sitio.
5. **Dependencia con el Grupo 4:** G4.2 (Sheet) usa los tamaños de R.1, por eso queda después de la 0.7.0.
6. `plan.md` tiene ahora 25 filas nuevas (R.0 a R.24, R.P6, R.P7): el índice crece; `check-plan` (M.10) sigue sin hacerse.

## Pendiente del usuario

1. Contestar PD-1, PD-2 y PD-3 (bloquean R.19, R.20 y R.14).
2. Archivos de logo y favicon para R.0.
3. Revisar y fusionar esta rama; decir si la release de GitHub y el despliegue de la 0.5.0 se hicieron, para anotarlos.
