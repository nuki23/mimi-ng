# Historial del plan: refinamiento de la 0.6.0

Texto de las tareas de la 0.6.0 (R.0 a R.18, R.24 y la puerta R.P6) al cerrar la puerta (13/11/2026, rama `auto/release-0.6.0-2026-11-13`; `main` anterior: `1910149`, la fusión del PR #15). No se edita: lo vigente está en `docs/plan.md` y en `docs/spec.md`.

**Dónde está el texto.** Las tareas vivían en `docs/plan/refinamiento/R-0.6.0.md`. Ese archivo se movió con `git mv` a [`refinamiento/R-0.6.0.md`](refinamiento/R-0.6.0.md), con su texto completo y el estado del cierre. Los documentos de apoyo del refinamiento (`plan.md`, `peticiones-usuario.md`, `decisiones-usuario.md`, `combobox-vs-select.md`, `uso-corto.md`) siguen en `docs/plan/refinamiento/`, porque la 0.7.0 también los usa (PD-1 y PD-2).

- R.0 Tema de marca (el color; el logo pasa a la R.25)
- R.1 Escala común de tamaños (la tabla de la spec pasa a la R.26 y quitar el alias `default`, a la R.32)
- R.2 Tamaños en los controles de formulario
- R.3 Switch y Checkbox: páginas separadas y tamaños
- R.4 Toast: tamaños
- R.5 Toast: variante `outline` con el color del tono
- R.6 Dialog: tamaños
- R.7 Dialog como servicio (Confirm con `size` pasa a la R.27)
- R.8 Tamaños en el resto de componentes (los ejemplos por componente y los Blocks a ojo pasan a la R.28)
- R.9 Efecto de clic uniforme
- R.10 Errores visuales: Tabs y Toggle Group en oscuro, Skeleton
- R.11 Blocks en carga: todo deshabilitado
- R.12 `readonly` en todos los componentes de formulario (los ejemplos pasan a la R.29)
- R.13 Ejemplos de formularios
- R.14 Form Field: atajos y mensajes de error (los ejemplos con más elementos y el diagrama pasan a la R.30)
- R.15 Select con `mimi-option` (M.9 completa pasa a la 0.7.0)
- R.16 Combobox con la misma API que Select
- R.17 Tabs: atajo `<mimi-tab label>`
- R.18 Input OTP: cantidad de dígitos
- R.24 Auditoría de «uso corto»
- R.P6 Puerta de la 0.6.0

**Cómo se cerraron las tareas a medias.** R.0, R.1, R.7, R.8, R.12, R.14 y R.15 estaban `[~]` («hechas en parte»). Se cierran `[x]` con lo que salió en la 0.6.0, y lo que les faltaba es una tarea nueva de la 0.7.0 (R.25 a R.30 y R.32, más M.9 con versión 0.7.0), en `docs/plan/refinamiento/R-0.7.0.md`. La R.31 (la nota de contraste con un primario propio claro) es nueva: sale de una alerta del informe de la parte 9. Así ninguna tarea de la 0.7.0 depende de una de la 0.6.0 sin cerrar.

**Además del plan, en la 0.6.0** (pedidos sueltos del usuario durante el refinamiento, en los informes de abajo): la unificación de los estados de los campos (`utils/field-styles.ts`), la página `/docs/states`, el texto violeta de la selección, los grises malva (suave el 12/11, medio el 13/11; el informe de la parte 11 dice 14/11, pero el commit es del 13/11 a las 22:12, hora de Colombia), la profundidad B, los controles con panel abiertos con el borde de la marca, la X de Select y Combobox, Tags Input en solo lectura, el hover de los de elegir, los paneles que siguen el scroll de su contenedor y se cierran al salir de la vista (`utils/overlay`), e Input y Textarea en páginas separadas.

Informes del modo autónomo: `docs/auto/plan-refinamiento-2026-11-09.md` (el plan), `docs/auto/refinamiento-0.6.0-2026-11-09.md` y las partes 2 a 11 (`docs/auto/refinamiento-0.6.0-parte<n>-*.md`; la parte 4 recorre la puerta R.P6), y `docs/auto/release-0.6.0-2026-11-13.md` (el cierre y la preparación de la versión). Decisiones por defecto: `docs/auto/decisiones-por-defecto.md`.

**Lo que queda abierto** (no es parte del historial; sigue en `docs/plan.md`): lo que faltaba de las tareas, en la 0.7.0 (arriba); la comprobación manual (navegador real, lector de pantalla, teléfono), en la M.20, puntos 14 a 18.

## Publicación de la 0.6.0 (registro)

Pendiente: la hace el usuario (`docs/proceso/release.md`). Se anota aquí con los datos de npm y git cuando esté publicada.
