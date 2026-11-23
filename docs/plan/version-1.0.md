# Plan: hasta la versión 1.0.0

[← Índice del plan](../plan.md)

Escrito el 23/11/2026 a partir del inventario de la puerta de la 0.8.0 (`docs/auto/0.8.0-puerta-2026-11-23.md`, sección 4) y de lo que **decidió el usuario ese día**:

- **El Grupo 5 y Mimi Effects pasan a después de la 1.0.0** (versiones menores de la 1.x: agregar un componente después de la 1.0 es compatible). La 1.0 son los 45 componentes y los 9 Blocks de la 0.8.0, estables, documentados y probados.
- **0.9.0:** CI en GitHub Actions (build, test, format:check y Playwright en Chromium, Firefox y WebKit en cada PR), pruebas automáticas de accesibilidad con axe (M.15), revisión completa de la API y de los nombres inconsistentes (**las últimas rupturas**), `density`/`size` de Data Table, las páginas Personalización, Iconos y Migrar desde PrimeNG / NG-ZORRO, y la declaración de accesibilidad.
- **0.9.x:** los arreglos de la M.20 manual del usuario.
- **0.9.9:** la revisión final del usuario.
- **1.0.0:** el lanzamiento; entra en vigor la política de compatibilidad (spec 12: desde la 1.0.0, lo que se quite se marca obsoleto y vive al menos una versión menor).

## Versiones y tandas

| Versión    | Qué cierra                                                         | Tandas del agente | Del usuario                                      |
| ---------- | ------------------------------------------------------------------ | ----------------- | ------------------------------------------------ |
| 0.9.0      | CI, axe, la API congelada (últimas rupturas), páginas, declaración | 4 (abajo)         | la M.20 por bloques, en paralelo; la publicación |
| 0.9.x      | Arreglos de la M.20 y lo menor que quede                           | 1 por publicación | la M.20                                          |
| 0.9.9      | Revisión final del usuario (decisiones por defecto incluidas)      | 1 (sus arreglos)  | la revisión                                      |
| 1.0.0      | Lanzamiento                                                        | 1                 | la publicación                                   |
| Tras 1.0.0 | Grupo 5, Mimi Effects, plataforma (5.1, 5.3, 5.4, 5.6, 5.8…, 5.18) | —                 | qué pedir primero                                |

**Regla de la 0.9.0:** es la última versión con rupturas libres. Todo lo que cambie una API publicada va en la tanda 2 (1.0-6 a 1.0-8), con su «Cómo actualizar» en el CHANGELOG. Desde la 0.9.1, una ruptura solo si un hallazgo de la M.20 la exige (bloqueante de accesibilidad o un error sin otra salida), y la aprueba el usuario.

## 0.9.0

### Tanda 1: CI y pruebas fiables

Primero, porque la CI vigila todo lo demás.

- [x] **M.17** (hecha el 23/11/2026) Pruebas de docs independientes del `localStorage` de Node 26 (en `mantenimiento.md`). Una CI no puede depender de la versión de Node de la máquina.
- [x] **M.12** (hecha el 23/11/2026) Pruebas deterministas con temporizadores y animaciones (en `mantenimiento.md`), y las que caducan con la máquina cargada (`pages.spec.ts` de la CLI, `components-styles.spec.ts`): en la CI la máquina es más lenta y compartida.
- [x] **M.18** (hecha el 23/11/2026) Los guiones de Playwright al repo (en `mantenimiento.md`): el de medición a 360 px y los que hoy viven fuera (scroll del Sheet, líneas del Stepper, estados de los Blocks, escenarios del navegador), en una carpeta de pruebas de extremo a extremo del showcase. Necesita la decisión sobre Playwright de la 1.0-5.
- [~] **1.0-5** CI en GitHub Actions.
  - Estado: rama `auto/0.9.0-tanda1-2026-11-23`, Claude Code (modo autónomo), desde el 23/11/2026. Hecho: `.github/workflows/ci.yml` y `apps/docs/e2e/` (informe `docs/auto/0.9.0-tanda1-2026-11-23.md`, puntos 3 y 4); falta verla en verde en GitHub.
  - Depende de: M.12, M.17, M.18.
  - En cada PR y en cada push a `main`: `pnpm install --frozen-lockfile`, `pnpm build` (sin avisos de presupuesto), `pnpm test`, `pnpm format:check`, y Playwright contra el sitio compilado en **Chromium, Firefox y WebKit**, con los navegadores instalados por Playwright en la CI.
  - **Decidido por el usuario (23/11/2026): Playwright como devDependency.** `@playwright/test` (opción (a), la recomendada) **solo como `devDependency` de la raíz**: no entra en `packages/cli`, ni en el registro, ni en las peers de `ui-core` (comprobado con `npm pack --dry-run` de `packages/cli`: el mismo shasum, `22a84602…`, y los mismos 193 archivos antes y después de instalarlo). En la spec 2. Antes, los guiones de las puertas usaban un `playwright-core` instalado fuera, con el Chrome del sistema.
  - **Pedido del usuario (23/11/2026):** además de los tres motores de escritorio, dos proyectos de móvil emulado (un Android en Chromium y un iPhone en WebKit), que usa la revisión móvil de la tanda 1.
  - Node 24.18.0 (el de `.node-version`); pnpm por `packageManager` (12.5.1).
  - Las capturas de un fallo, como artefacto de la ejecución (nunca en el repo, A10).
  - Lo que falle en Firefox o WebKit y no en Chromium: se arregla en la tanda, o se anota como fallo conocido con su tarea, sin desactivar la prueba en silencio.
  - Criterios de hecho: el flujo pasa en un PR de prueba; un PR con un test roto queda en rojo; el tiempo total, medido (objetivo: menos de 15 minutos).
  - Trampa: el agente no puede cambiar la configuración del repositorio en GitHub (proteger `main`, exigir la CI): lo hace el usuario; el informe dice qué marcar.
- [x] **M.15** (hecha el 23/11/2026) Pruebas de accesibilidad con axe (en `mantenimiento.md`; `axe-core` aprobado como devDependency del repo): todas las páginas del showcase, en claro y oscuro, con los paneles flotantes abiertos donde se pueda; en la CI desde el primer día. Las reglas que no apliquen se desactivan una por una con su motivo escrito.

### Tanda 2: la API que queda fija (últimas rupturas)

- [ ] **1.0-6** Revisión completa de la API pública.
  - Recorrido de los 45 componentes y 9 Blocks, `utils` y el tema: entradas, salidas, `model()`, tipos y funciones exportados, `Mimi*Text`, tokens del tema y variables `--mimi-*`, selectores y atributos `data-*`.
  - Entrega: `docs/spec/api-1.0.md`, la lista de lo que queda fijo en la 1.0, componente por componente, y la lista de cambios (cada uno con su motivo).
  - Criterios: nombres coherentes entre componentes parecidos (`tone`, `size`, `disabled`, `readonly`, textos, `min`/`max`); nada interno exportado sin querer (como el `MimiSelectList` de la 0.7.0); cada tipo público con nombre `Mimi*` o del componente; una prueba que compare los exports del `index.ts` de cada componente con la lista de `api-1.0.md`, para que nada entre ni salga sin pasar por la lista.
  - Las decisiones de nombres que no sean obvias van al usuario en una tabla (opción y recomendación), como en el refinamiento; en modo autónomo, A3.
- [ ] **1.0-7** Nombres inconsistentes (de `docs/auto/decisiones-por-defecto.md`, «Para la revisión de la 0.9.9»; se adelantan a la 0.9.0 porque son rupturas). **RUPTURA.**
  - Depende de: 1.0-6.
  - `success` de Input OTP frente a `tone`; `min`/`max` (Date Picker) frente a `minDate`/`maxDate` (Date Range); el selector `mimi-date-range` y la clase `MimiDateRangePicker`; `MIMI_DATE_PICKER_TEXT`, que vive en `calendar/`; y lo que encuentre la 1.0-6.
  - Cada una, con su «Cómo actualizar» en el CHANGELOG y una prueba.
- [ ] **1.0-8** Data Table: `density` y `size`.
  - Depende de: 1.0-6.
  - Se solapan (decidido conservar los dos el 10/11/2026, «si molesta, se resuelve en la 0.9.9»). Unir en `size` (y `density` desaparece, **RUPTURA**) o documentar los dos ejes con lo que hace cada uno. Recomendación: unir en `size`, como el resto de los componentes; decide el usuario (o A3).
- [ ] **M.24** Data Table: `pr-3`, `pl-4` y `-ml-1.5` físicos (RTL), junto a la 1.0-8 (en `mantenimiento.md`).
- [ ] **M.16** Auditoría de `readonly`, `aria-labelledby` y `aria-describedby` en todos los controles (en `mantenimiento.md`): puede añadir entradas, así que va con la API.
- [ ] **M.21** Switch con `aria-describedby` (en `mantenimiento.md`).
- [ ] **M.8** La CLI y los bloqueos de «todo o nada» (en `mantenimiento.md`): un Block que no se puede instalar no debe dejar sus dependencias copiadas a medias. **Decidido por el usuario (23/11/2026):** va en esta tanda, con la revisión de la API y la CLI (antes, en la 0.9.x).
- [ ] **M.1** Confirm con acción asíncrona; **M.3** rodeos de aria 22.2; **M.6** Select con una letra estando cerrado; **M.14** los dos ejes del área de Color Picker (en `mantenimiento.md`): cambian o añaden API, así que entran antes de congelarla.

### Tanda 3: documentación y declaración de accesibilidad

- [ ] **1.0-9** Página «Personalización» (hoy «pendiente» en el menú): el preset, los tokens y la cascada (`--mimi-control-height` → `--mimi-btn-height`), `class` con `cn()`, el tamaño heredado (`mimiSize`), con ejemplos.
- [ ] **1.0-10** Página «Iconos» (hoy «pendiente»): Lucide por `ng-content`, tamaños con `[&_svg]:size-4`, íconos internos en línea, otros paquetes de íconos.
- [ ] **5.5** Página «Migrar desde PrimeNG / NG-ZORRO» (hoy «pendiente»; en `plataforma.md`).
- [ ] **5.13** Tabla de compatibilidad (Angular, Node, navegadores probados en la CI; en `plataforma.md`), con la política de qué versiones de Angular se soportan (decide el usuario; recomendación en la tarea).
- [ ] **1.0-11** Declaración de accesibilidad (en Fundamentos).
  - Depende de: M.15.
  - Objetivo WCAG 2.2 AA; qué se prueba solo (axe en la CI, las pruebas de teclado y ARIA de cada componente, Playwright en tres motores) y qué a mano (NVDA, VoiceOver, teléfonos reales: la M.20), componente por componente, con lo que falta dicho sin rodeos.
  - En la 0.9.0 sale con lo comprobado hasta entonces; se completa en la 0.9.9 con la M.20.
- [ ] **DP.6** y **DP.P** (plantilla de páginas: Blocks, portada y la puerta; en `docs-paginas/plan.md`).
- [ ] README raíz y de la CLI al día (45 componentes, 9 Blocks, compatibilidad, licencia), dentro de la 1.0-P9.

### Tanda 4: puerta de la 0.9.0

- [ ] **1.0-P9** Puerta de la 0.9.0.
  - Depende de: 1.0-5 a 1.0-11 y lo de la 0.9.0 en «Mantenimiento», «Plataforma» y «Páginas».
  - La lista de «Puerta del grupo» (`/cerrar-grupo`), más: la CI en verde en los tres motores; axe sin fallos (o cada excepción escrita); `docs/spec/api-1.0.md` igual a los exports; todas las rupturas de la 0.9.0 en el CHANGELOG con su «Cómo actualizar»; los escenarios del `.tgz` (npm, pnpm, actualización desde la 0.8.0 real con un componente y una página modificados, `source(none)`); el revisor sobre toda la 0.9.0.
  - Lo publica el usuario.

## 0.9.x: arreglos de la M.20

- [ ] **1.0-12** Arreglos de la M.20.
  - Depende de: M.20 (o el bloque que el usuario haya hecho), 1.0-P9.
  - Cada hallazgo del usuario es una subtarea (1.0-12a, 1.0-12b…) con una prueba que falla antes, si se puede automatizar. Sin rupturas salvo un bloqueante, aprobado por el usuario.
  - Una 0.9.x por tanda de hallazgos (0.9.1, 0.9.2…), con su CHANGELOG.
- También pueden salir en una 0.9.x, sin prisa y sin API nueva: **M.5** (NVDA, la hace el usuario con la M.20), **M.7**, **M.10**, **M.22**, **0.1.1-3** (en `mantenimiento.md`), **5.12** y **5.14** (en `plataforma.md`).

## 0.9.9: revisión final del usuario

- [ ] **1.0-13** Revisión final del usuario y la 0.9.9.
  - Depende de: 1.0-12, M.20.
  - El usuario revisa todas las decisiones por defecto que siguen «pendientes de revisión» (`docs/auto/decisiones-por-defecto.md`; lo pide la M.20, «antes de la 0.9.9»), la API congelada (`docs/spec/api-1.0.md`), el sitio y la declaración de accesibilidad.
  - El agente hace los arreglos que pida (sin rupturas salvo un bloqueante) y la 0.9.9 sale como candidata a 1.0: si después no aparece nada, la 1.0.0 es la 0.9.9 con otra versión.

## 1.0.0: lanzamiento

- [ ] **1.0-14** Lanzamiento de la 1.0.0.
  - Depende de: 1.0-13.
  - Versión 1.0.0; el CHANGELOG con «Compatibilidad desde la 1.0.0» (spec 12); la política visible en el sitio (instalación o una página «Versiones»); `/cerrar-grupo` comprueba desde aquí que no hay rupturas sin obsoleto.
  - El usuario publica (npm, etiqueta, release, despliegue) y decide el anuncio (y si la 5.6, el inglés, va antes).

## Hechas (antes del plan hasta la 1.0)

**Pasan a la M.28 (v0.8.0)** (16/11/2026): con la política de rupturas y obsoletos del usuario (spec 12, «Rupturas y obsoletos»), antes de la 1.0.0 no se mantienen obsoletos, así que las cuatro se hicieron en la M.28 (`docs/plan/mantenimiento.md`) y no esperaron a la 1.0. Los IDs no se reutilizan.

- [x] 1.0-1 (→ M.28, hecha el 16/11/2026) Quitar alias destructive-soft → destructive-ring y renombrar destructive-soft-bg → destructive-soft. Antes, la nota de versión pide buscar `destructive-soft` en el proyecto y cambiarlo a `destructive-ring` (el código copiado con `ring-destructive-soft` seguiría compilando con otro color, sin error); `mimi update` (5.4) avisa si encuentra esa clase.
- [x] 1.0-2 (→ M.28, hecha el 16/11/2026) Quitar los atajos de variante de Button y Badge (`variant="default|secondary|destructive"`): en la nota de versión, `variant="destructive"` → `tone="danger"`, `variant="secondary"` → `tone="secondary"` y `variant="default"` se borra; y los selectores CSS propios sobre `[data-variant="destructive"]` → `[data-tone="danger"]` (spec 12).
- [x] 1.0-3 (→ M.28, hecha el 16/11/2026) Dejar de aceptar `"style": "vivid"` en `mimi.json` como sinónimo de `"mimi"` (la 0.1.0 lo escribe; spec 12). Decidir entonces si la CLI lo corrige al leerlo o si avisa.
- [x] 1.0-4 (→ M.28, hecha el 16/11/2026) Quitar los nombres de tokens de la 0.1.0 (spec 12): `--mimi-btn-padding-x` y `components.button.paddingX`, `--mimi-input-padding-x` y `components.input.paddingX`, `--mimi-input-placeholder-color` y `components.input.placeholderColor`, y `radii.badge` (queda `components.badge.radius`), con sus avisos de `provideMimiTheme`.

## Después de la 1.0.0

- **Grupo 5** (`docs/plan/grupo-5.md`) y **Mimi Effects** (`docs/plan/mimi-effects.md`): decidido por el usuario el 23/11/2026. Sin orden fijo; primero lo que pidan los usuarios.
- **Plataforma** (`docs/plan/plataforma.md`): 5.1 schematic `theme`, 5.3 comando `mimi`, 5.4 `mimi update`, 5.6 inglés y 5.9 su selector, 5.8 buscador ⌘K, 5.10 navegación del header, 5.15 Badge interactivo y 5.18 migraciones con `ng update`.
- Lo que el inventario de la puerta anotó para después y no está en ninguna tarea: rendimiento en ejecución (Data Table y Tree con miles de filas, listas largas en Select y Combobox, Lighthouse) y el menú de desbordamiento de Toolbar. Se crean como tareas cuando se trabajen.
