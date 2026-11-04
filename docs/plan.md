# Plan de desarrollo de Mimi

## Cómo usar este plan

Este plan es la lista de trabajo. Lo que es verdad del producto (API, tokens, reglas) está en `docs/spec.md`; cómo se trabaja, en `CLAUDE.md`. Lo terminado está resumido al final («Terminado») y con su texto completo en `docs/historial/`.

**Reglas**

1. Una tarea por vez. Antes de escribir código, se propone un plan breve y se espera la aprobación (`CLAUDE.md`, «Forma de trabajar»).
2. Antes de empezar, se leen de la tarea: «Leer antes», «Depende de», «Trampas conocidas» y «Criterios de hecho». Si una dependencia no está hecha, no se empieza.
3. «PENDIENTE DE DECIDIR: …» significa que falta una decisión del usuario: se pregunta, no se supone.
4. Los IDs no se renumeran ni se reutilizan: el código y la spec los citan (por ejemplo, «plan, G1.5b» o «tarea 5.3»). Tampoco se reutilizan los de Theme Studio (T.2 a T.5, en `docs/futuro/theme-studio.md`). Una tarea nueva toma el siguiente número libre de su grupo; el mantenimiento sin grupo usa `M.<n>`; la puerta de cada grupo es `G<n>.P`.
5. «Depende de» cita IDs. Para los componentes, la fuente de las dependencias es la tabla de su grupo en la spec 4, «Hoja de ruta»: si el plan y la spec no coinciden, se avisa al usuario en vez de elegir.
6. «Diseño:» indica el archivo de `docs/design/` sin el prefijo `Mimi ` ni la extensión `.dc.html` (los Blocks se llaman `Block <nombre>`).
7. Lo que un componente haga distinto del diseño, o sin diseño, se anota en `docs/design/correcciones-pendientes.md` (tarea D6). Una decisión que sigue vigente va a la spec, no solo al plan.

**Estados**

- `[ ]` pendiente.
- `[~]` en curso: además, una fila en «En curso».
- `[x]` hecha: solo cuando se cumplen **todos** sus «Criterios de hecho». Al cerrarla, su texto completo pasa a `docs/historial/plan-grupo-<n>.md` (o al archivo del historial que corresponda) y aquí queda una línea en «Terminado».

**Tamaños:** S, menos de una sesión; M, una sesión; L, más de una sesión o con un spike previo.

**Plantilla de tarea** (la usa cada tarea pendiente que se detalla; los campos que no aplican dicen «No aplica»):

```markdown
- [ ] ID Nombre
  - Versión · Tamaño (S/M/L) · Depende de: IDs · Bloquea: IDs
  - Estado: (solo mientras está en curso: rama, quién, desde)
  - Leer antes: secciones de la spec y tareas hechas de referencia.
  - Diseño: archivo(s) de docs/design/ y la sección dentro del archivo.
  - Objetivo: 1 o 2 frases.
  - Alcance: incluye / NO incluye (lo que se deja fuera a propósito).
  - Base técnica: @angular/aria, @angular/cdk o ninguna, y por qué (spec 4, «Base técnica»). Patrón WAI-ARIA. Si hace falta un spike, dilo.
  - API pública propuesta: selector, inputs, outputs, model, contenido proyectado; class / panelClass según la regla de la spec 4.
  - Formularios: FormValueControl / FormCheckboxControl o campo nativo con directiva (spec 8); prueba con [formField], formControlName y ngModel.
  - Tokens: tabla en la spec 13 (existen / faltan); qué registrar en theme/types.ts, COMPONENT_PREFIX y component-tokens.ts.
  - Teclado y accesibilidad: teclas, foco, roles, lector de pantalla; qué se prueba en test y qué a mano.
  - Ejemplos del showcase: la lista de estados que muestra la página.
  - CLI: dependencias de npm, otros archivos de ui-core, @import de CSS, entrada de registry.json.
  - Textos: si lleva textos propios, provideMimi…Text con su versión _ES.
  - Trampas conocidas: de tareas parecidas ya hechas y de la spec.
  - Criterios de hecho: lista verificable.
  - Preguntas abiertas: PENDIENTE DE DECIDIR.
```

**Puerta del grupo** (`G<n>.P`, la última tarea de cada grupo; la recorre `/cerrar-grupo` cuando exista):

1. La spec al día: sección 4 (catálogo y archivos), 13 (tokens), 2 (versiones), 12 (compatibilidad).
2. `CHANGELOG.md` con la sección de la versión y, si cambia algo de lo publicado, cómo actualizar desde la anterior.
3. Showcase: Fundamentos (`FOUNDATION_PACKAGES` y la tabla de paquetes), `INTRODUCTION_COMPONENTS` de Introducción, la landing y el README de la CLI (lista de componentes); `x-prompt` de `packages/cli/src/ui/schema.json`.
4. `registry.json` y las pruebas de la CLI.
5. Prueba real con el `.tgz` en 4 escenarios: npm nuevo, pnpm nuevo, actualización desde la versión anterior sin cambios y con un archivo modificado. En Windows, los proyectos de prueba en una ruta corta (el límite de 260 caracteres rompió `ng serve` con pnpm en la 0.2.0).
6. Presupuestos de bundle (spec 10): JS inicial y CSS global, crudo y gzip, antes y después.
7. `docs/design/correcciones-pendientes.md` (D6) al día con lo del grupo.
8. Mover el texto de las tareas hechas del grupo a `docs/historial/`.
9. Checklist de release, que ejecuta el usuario: `npm publish`, etiqueta, release de GitHub, despliegue y prueba desde npm.

**Historial:** `docs/historial/plan-fase-0-3.md`, `plan-0.1.x.md`, `plan-grupo-1.md` (incluye la Fase 4 y la publicación de la 0.2.0), `plan-plataforma.md` y `decisiones.md`.

## En curso

Nada en curso. Formato de cada fila: `- ID · rama · quién · desde (DD/MM/AAAA)`.

## Mantenimiento

Pendientes sin grupo. No tienen versión propia: salen en la siguiente versión que se publique después de terminarlos.

- [ ] M.1 Confirm con acción asíncrona (`onConfirm` que devuelve una promesa): «cargando» en Confirmar, sin cerrar hasta que termine y sin doble envío. El diseño no lo muestra (decidido en la G1.7). Trampas que encontró la revisión del plan:
  - **Doble clic en zoneless:** el `disabled` de `loading` llega en el render siguiente, no en el mismo evento; dos clics rápidos o Enter con autorrepetición llaman dos veces. Hace falta una marca `pending` que se revise antes de llamar.
  - **Foco a `body`:** al deshabilitarse el botón enfocado, el foco cae a `body`. Moverlo antes al contenedor del diálogo (`tabindex="-1"`), devolverlo a Confirmar si falla y poner `aria-busy` en el panel.
  - **`closeAll()` y navegación durante la acción:** cierran y resuelven `false` aunque la acción siga y quizá termine bien. Documentarlo o hacer que `closeAll()` respete el bloqueo.
  - **Cambio que exige en Dialog:** poder bloquear Escape y el fondo con el diálogo abierto. Propuesta: `disableClose` como signal en `MimiDialogRef`, leído en el momento en que llega Escape o el clic (hoy se calcula al abrir). Es API pública nueva de Dialog: spec 4, página de Dialog y pruebas.
  - Depende de: G1.6, G1.7 (hechas).
- [ ] M.2 Alinear Angular en la 22.2.x (trae #33974 del combobox, que salió en cdk y aria 22.2.4). **Regla:** todos los `@angular/*` del repo (core y el resto del framework, cdk, aria, cli y build) en la mayor versión que core, cdk, aria, cli y build tengan en común, verificada con `npm view <paquete> version` el día de la tarea. Así aria queda siempre igual a cdk (spec 2 y 4). Después, `pnpm dedupe`, para que las peers de ui-core no queden en la versión anterior (lo que pasó al subir a la 22.2.3, el 21/10/2026).
  - Bloquea: G2.8 (provisional: el arreglo #33974 podría hacer falta en el Combobox; el spike del primer paso de G2.8 lo comprueba y, si no se reproduce, se quita este «Bloquea»; ver G2.8, «Base técnica»).
  - Dato del 03/11/2026 (`npm view`): `@angular/core` en 22.2.4 (salió el 29/10/2026); `@angular/cdk`, `@angular/aria` y `@angular/cli` en 22.2.5. Versión común: **22.2.4**. Cuando core llegue a la 22.2.5, se vuelve a alinear con la misma regla.
  - Criterios de hecho: `pnpm-lock.yaml` con una sola versión de cada `@angular/*`; `pnpm build`, `pnpm test` (incluidas las pruebas de alarma de aria) y `pnpm format:check` en verde; tabla de versiones de la spec 2 al día; bundle crudo y gzip antes y después.
- [ ] M.3 Revisar rodeos con aria 22.2: MenuItem value opcional (#33715) y tokens exportados (#33607); quitar los que ya no hagan falta, con las pruebas de alarma.
  - Leer antes: spec 4, «Base técnica», subsección «Rodeos de aria» (la lista que antes estaba en la G1.5b).
  - Depende de: M.2.
- [ ] M.4 Aviso de la CLI si el `@angular/cdk` instalado es anterior a `^22.2.0`. Hoy, si el proyecto ya declara `@angular/cdk` en cualquier rango (por ejemplo, 22.1), `ng g mimi` no lo cambia ni avisa aunque el registro pida `^22.2.0`, y agrega `@angular/aria` en la versión exacta de ese cdk (spec 5, «Límites conocidos de la 0.2.0»). El CHANGELOG de la 0.2.0 pide `ng update @angular/cdk`.
  - PENDIENTE DE DECIDIR: ¿solo avisar, o también actualizar el rango?
- [ ] M.5 Pasada con NVDA por los componentes con overlays. Select verificado con NVDA por el usuario (fecha aproximada: octubre de 2026). Pendiente: menús, Dialog, Tabs y Toast. Quién: usuario (prueba manual). Origen: G1.5 («Pendiente: la prueba con NVDA») y G1.12 («se amplía si hay una pasada con NVDA antes de publicar»). Al terminar, actualizar la sección de accesibilidad de Fundamentos con lo verificado.
- [ ] M.6 Select: saltar a una opción con una letra estando cerrado. Con el panel cerrado, una letra no salta a la opción (el `<select>` nativo sí). aria no lo ofrece: cerrado solo atiende ↓, Enter y Espacio, y la lista no existe. Habría que escribir la búsqueda por letra en Mimi. Origen: G1.5 y G1.5b; spec 4, «Rodeos de aria». Una prueba de alarma avisa si aria empieza a hacerlo.
- [ ] M.7 Revisar la división de los íconos de Lucide en los chunks del showcase. Origen: G1.10: todos los íconos que usa cualquier página lazy van en un solo chunk (141.66/9.35 → 191.22/11.63 kB crudo/gzip en la G1.10, por los íconos de los ejemplos). No afecta a quien usa Mimi; revisar si sigue creciendo.
- [ ] M.8 La CLI calcula las dependencias de npm y los `@import` antes de decidir los bloqueos de «todo o nada»: un Confirm bloqueado igual agrega `@angular/cdk` y el `@import` del overlay (inofensivo). Origen: spec 5, «Límites conocidos de la 0.2.0».
- [ ] M.9 Migrar Select a las utilidades de lista del Combobox (filtro sin tildes, resaltado y lista con «cargando» y «sin resultados»), para quitar el código repetido. Origen: G2.8 (decidido el 03/11/2026: los archivos de Select no se tocan en la 0.3.0).
  - Depende de: G2.8 · Bloquea: —
  - Alcance: Select usa las utilidades nuevas en lugar de su `normalize()`, `MimiSelectHighlight` y `MimiSelectList`; la API pública de Select no cambia (si algún tipo o export público cambia de sitio, Select lo sigue reexportando).
  - Trampas: el ítem `select` de la CLI pasa a depender del ítem de las utilidades; quien ya tiene Select copiado recibe el cambio solo si no lo modificó (todo o nada, spec 5). Las pruebas de alarma de aria del Select (G1.5b) tienen que seguir pasando sin cambios.
  - Criterios de hecho: pruebas de Select sin cambios y en verde; `registry.json` y pruebas de la CLI al día; `ng g mimi select` probado en un proyecto limpio y sobre un Select 0.3.0 sin modificar; nota en el CHANGELOG de la versión en que salga (qué cambió por dentro y que la API sigue igual); bundle: JS inicial y CSS global, crudo y gzip, antes y después.
- [ ] 0.1.1-3 `pnpm publish` da 404 aunque `npm whoami` funciona (pnpm 12 no usa la sesión de `npm login`). Mientras se resuelve, publicar con `npm publish` desde `packages/cli`. Investigar cómo autentica pnpm 12.

## Diseño

- [ ] D6 Correcciones de diseño pendientes (Claude Design). La lista está en `docs/design/correcciones-pendientes.md`: cada componente nuevo agrega ahí lo que hizo distinto del diseño o sin diseño, y se resuelve en Claude Design cuando se decida, sin bloquear ningún grupo. Quién: el usuario resuelve en Claude Design; Claude Code anota.

## Grupo 2 → v0.3.0: entradas avanzadas

Componentes de la spec 4 («Hoja de ruta», tabla del Grupo 2). Orden recomendado (respeta las dependencias): G2.0 → G2.0b → G2.1 → 5.2 → G2.10 → G2.2 → G2.3 → G2.4a → G2.4b → G2.5 → G2.6 → G2.7 → G2.8 → G2.9 → G2.11 → G2.12 → 5.17 → G2.P. Con las dependencias cumplidas, el orden entre G2.2 a G2.5 se puede cambiar.

- [ ] G2.0 Catálogo de tokens del Grupo 2 en la spec 13
  - v0.3.0 · Tamaño M · Depende de: — · Bloquea: G2.0b, G2.1, G2.2, G2.3, G2.4a, G2.4b, G2.5, G2.6, G2.7, G2.8, G2.9, G2.10, G2.11, G2.12
  - Estado: —
  - Leer antes: spec 13 completa («Niveles», «Nivel 3: por componente» —sobre todo las tablas de Select, Tabs, Toolbar y Pagination, las más recientes—, «Otros globales del diseño», «Reglas» y «Correcciones pendientes del diseño»); spec 6.2 (cascada; los colores de componente van en el CSS, no en el preset); spec 4, tabla del Grupo 2; la T.0 y la T.0b en `docs/historial/plan-grupo-1.md` (el precedente de esta tarea).
  - Diseño: `F3 Archivos Tags Toggle Color` (secciones «11 · Toggle Group · control segmentado» y «12 · Color Picker»; File Upload y Tags Input, por su nombre), `Color Picker`, `F3 Combobox Fechas Hora`, `F3 Slider OTP Numero Mascara`, `F5 Estructura` (sección «4 · Progress») y `mimi-variables-fase3.css`. Cada sección se ubica con grep por el nombre del componente; no se cargan los archivos completos.
  - Objetivo: escribir en la spec 13 una tabla de tokens por cada componente del Grupo 2, sacada del diseño, para que los componentes no inventen valores. Es una tarea de spec, hecha por Claude Code como la T.0.
  - Alcance: incluye una tabla por componente (Toggle Group, Number Input, Password, Input Mask, Input OTP, Tags Input, Slider, Combobox, Date Picker y Date Range, Progress, File Upload, Color Picker), con el prefijo propuesto, cada token con su valor y de qué hereda (spec 6.2), y si va en el preset o solo en el CSS; la lista de globales del Grupo 2 que usa cada uno (los de «Otros globales del diseño»: `--mimi-range`, `--mimi-track`, `--mimi-track-fill`, `--mimi-thumb`, `--mimi-chip`, `--mimi-chip-foreground`, `--mimi-dropzone*`, `--mimi-strength-*`, `--mimi-selection`, y los keyframes). NO incluye código: ni `theme-base.css`, ni `theme/types.ts`, ni `COMPONENT_PREFIX` (eso lo hace cada componente, o la tarea de la pregunta abierta).
  - Base técnica: No aplica.
  - API pública propuesta: No aplica.
  - Formularios: No aplica.
  - Tokens: es el objeto de la tarea. Dato comprobado (03/11/2026): los globales del Grupo 2 están en `docs/design/tokens-mimi.css` y listados en la spec 13, pero **no** en `packages/ui-core/src/lib/theme/theme-base.css`. El keyframe `mimi-indet` (barra indeterminada) solo está en `F5 Estructura`, no en `tokens-mimi.css` ni en la lista de keyframes de la spec 13.
  - Teclado y accesibilidad: No aplica.
  - Ejemplos del showcase: No aplica.
  - CLI: No aplica.
  - Textos: No aplica.
  - Trampas conocidas:
    - Prefijos que chocan con un global (T.0b: `--mimi-badge-radius` era a la vez global y de Badge). Antes de proponer un prefijo, buscar `--mimi-<prefijo>-` en `theme-base.css` y en la spec 13; por ejemplo, `track` ya es un global.
    - La hoja de variables y el diseño final pueden no coincidir (Pagination, G1.11: `mimi-variables-componentes.css` decía 40/56/20px y el diseño final usaba 32-40/44-52/16px). Manda el `.dc.html`; la diferencia va a `docs/design/correcciones-pendientes.md`.
    - Un color fijo en el preset rompe el otro modo (spec 6.2): los colores de componente solo en el CSS.
    - El diseño escribe tonos como `destructive`; en Mimi el tono es `danger` (spec 4, «Variante y tono»).
  - Criterios de hecho:
    - Una tabla por cada uno de los 12 componentes en la spec 13, «Nivel 3», con el mismo formato que las existentes, y cada valor con su archivo y sección de diseño.
    - Ningún valor inventado: lo que el diseño no tenga va a `docs/design/correcciones-pendientes.md`, en un apartado «Grupo 2 (G2.0)».
    - Prefijos sin choques con globales ni con otros componentes (comprobado con grep).
    - «Cobertura» de la spec 13 al día (hoy dice 21 componentes).
    - **Cada tabla la aprueba el usuario antes de empezar su componente**; la tarea anota la fecha de cada aprobación.
    - `pnpm format:check` en verde.
  - Preguntas abiertas:
    - Decidido (03/11/2026): los globales del Grupo 2 los lleva al tema la tarea G2.0b.
    - PENDIENTE DE DECIDIR: el keyframe `mimi-indet` del diseño de Progress, ¿se agrega al catálogo de la spec 13 como global o queda dentro de Progress?
    - PENDIENTE DE DECIDIR: Date Picker y Date Range, ¿una tabla o dos?
- [ ] G2.0b Tokens globales del Grupo 2 en el tema
  - v0.3.0 · Tamaño M · Depende de: G2.0 · Bloquea: G2.1, G2.2, G2.3, G2.4a, G2.4b, G2.5, G2.6, G2.7, G2.8, G2.9, G2.10, G2.11, G2.12, 5.2
  - Estado: —
  - Leer antes: la T.1 en `docs/historial/plan-grupo-1.md` (el precedente: tokens nuevos de `tokens-mimi.css` llevados a ui-core, con `types.ts`, `mimiThemeToCss` y `cn.ts`); spec 6.1 a 6.4 (variables, `@theme inline`, cascada, preset y `provideMimiTheme`); spec 11 (tema); spec 13, «Otros globales del diseño», «Derivados» y «Reglas»; spec 5 («Qué hace `mimi`»: el tema se actualiza solo si el usuario no lo modificó; si lo modificó, solo avisa); `contrast.spec.ts` (ui-core).
  - Diseño: `docs/design/tokens-mimi.css` (`:root` y `.dark`) y `mimi-variables-fase3.css`.
  - Objetivo: llevar a `packages/ui-core/src/lib/theme/theme-base.css` los globales del Grupo 2 que hoy solo están en el diseño y en la spec 13, para que los componentes del grupo no inventen ni repitan valores.
  - Alcance: incluye, con sus valores en claro y oscuro (comprobado el 03/11/2026 en `tokens-mimi.css`): `--mimi-range`, `--mimi-track`, `--mimi-track-fill`, `--mimi-thumb`, `--mimi-chip`, `--mimi-chip-foreground`, `--mimi-dropzone`, `--mimi-dropzone-active`, `--mimi-dropzone-active-border`, `--mimi-strength-weak`, `--mimi-strength-medium`, `--mimi-strength-strong`, `--mimi-selection`; los keyframes `mimi-caret`, `mimi-bob` y `mimi-shake` (están en `tokens-mimi.css` y no en `theme-base.css`); y los que encuentre la G2.0 al hacer las tablas. Su exposición a Tailwind con `@theme inline` (spec 6.1), `MimiThemePreset` y `mimiThemeToCss` si alguno va por preset (spec 6.3 y 11). NO incluye: `--mimi-corner-shape` (es del Theme Studio, `docs/futuro/theme-studio.md`); `--mimi-input-hover`, que ya llegó en la G1.11.
  - Base técnica: No aplica (CSS y tipos del tema).
  - API pública propuesta: las variables `--mimi-*` nuevas y, si van por preset, sus claves en `MimiThemePreset` (spec 6.3).
  - Formularios: No aplica.
  - Tokens: es el objeto de la tarea.
  - Teclado y accesibilidad: contraste. Los pares de texto sobre fondo nuevos (por ejemplo, `--mimi-chip-foreground` sobre `--mimi-chip`) entran en `contrast.spec.ts` (4,5:1, claro y oscuro).
  - Ejemplos del showcase: los globales nuevos en la página interna `/dev/tokens`, si es donde están los demás.
  - CLI: la CLI copia `theme-base.css` al proyecto del usuario y, si el usuario lo modificó, no lo actualiza: solo avisa (spec 5). Ver «Compatibilidad».
  - Textos: No aplica.
  - Compatibilidad con proyectos existentes:
    - Todo componente del Grupo 2 usa estos globales con valor de respaldo, `var(--mimi-track, <valor>)` (spec 6.2), para funcionar con un tema que no los tenga. Es un criterio de hecho de cada G2.x.
    - Esta tarea incluye una prueba que renderiza un componente con el tema **sin** los tokens nuevos y comprueba que no queda transparente ni invisible.
    - El CHANGELOG de la 0.3.0 lo explica (anotado en G2.P).
  - Trampas conocidas:
    - Colores fijos: prohibidos (CLAUDE.md, reglas de estilos 1); los valores van con `color-mix` sobre otros tokens, como en el diseño.
    - Una variable global con el mismo nombre que un token de componente tapa la cascada (T.0b, `--mimi-badge-radius`).
    - Lo que se agrega a `@theme inline` genera clases y crece el CSS global (la G1.x lo vio en cada componente).
    - Los derivados con `color-mix` no van en el preset (spec 6.3): se recalculan solos.
  - Criterios de hecho:
    - Valores iguales a los de `tokens-mimi.css` en claro y oscuro (prueba que los compara, como la de T.1).
    - Sin colores fijos (revisión del CSS generado, como pide `/componente`).
    - `contrast.spec.ts` con los pares nuevos que apliquen.
    - Prueba de un componente con el tema sin los tokens nuevos: no queda transparente ni invisible.
    - Spec 6.1, 6.3 y 13 al día.
    - Presupuesto del CSS global y del `initial`, crudo y gzip, antes y después. Techos (`angular.json`): CSS global (budget `bundle` `styles`) aviso 130 kB y error 145 kB; `initial` aviso 475 kB y error 505 kB. Medición del 03/11/2026 (`pnpm build:docs`, igual que la del 21/10/2026 en el CSS): CSS global 120,08 kB crudo y 17,67 kB gzip; JS inicial 333,94 kB crudo y 105,24 kB gzip; `initial` 454,02 kB crudo. Quedan 9,92 kB hasta el aviso del CSS y 20,98 kB hasta el aviso del `initial`.
  - Estimación del CSS global del Grupo 2 (03/11/2026, para la decisión pendiente «CSS global por encima del aviso»):
    - Lo que sumó el Grupo 1, según `docs/historial/plan-grupo-1.md` y `plan-plataforma.md`: los componentes con medición propia sumaron +4,47 kB (G1.5), +2,97 (G1.6), +0,69 (G1.7), +4,21 (G1.8), +3,30 (G1.9) y +6,39 (G1.10, de 108,84 a 115,23 kB crudo y de 16,39 a 17,13 kB gzip): 22,03 kB entre seis, **3,67 kB crudo de media por componente**. De punta a punta, el CSS global pasó de 73,99 kB (después de la 4.4) a 120,08 kB al cierre del grupo (+46,09 kB, que incluye también los tokens de la T.0b y las tareas sin medición propia). El dato de 89,22 kB en la G1.2 no está en el historial ni en la spec (no lo pude comprobar).
    - Estimación para los 12 componentes del Grupo 2 (la G2.4 cuenta como uno): unos **+44 kB crudo** (12 × 3,67), con un rango de +8 a +77 kB si cada uno sumara como el menor (G1.7) o el mayor (G1.10). En gzip, con la proporción de la G1.10 (+0,74 kB gzip por +6,39 kB crudo), unos **+5 kB**. Sin contar lo que agregue la G2.0b.
    - Resultado en el CSS global: unos 164 kB crudo (rango 128 a 197 kB) y unos 22,7 kB gzip al cerrar el grupo, por encima del aviso (130 kB) y del error (145 kB).
    - Resultado en el `initial`: el budget `initial` de `angular.json` **suma el JS inicial y el CSS global** (comprobado en la spec 10, «Regla del `initial`»: aviso 345 + 130 = 475 kB, error 360 + 145 = 505 kB; y en `angular.json`, que lo tiene como un budget aparte de `main` y de `styles`). Con el JS inicial sin cambios (los componentes son lazy) y los +44 kB de CSS: unos 498 kB (rango 462 a 531 kB), por encima del aviso (475 kB) y cerca del error (505 kB). Si el CSS sube, el `initial` sube lo mismo.
    - A quién afecta: los presupuestos son del sitio de documentación (`apps/docs`), no de los usuarios de Mimi. El CSS global del showcase incluye las clases de todas las páginas de componentes (`@source` a ui-core), y las páginas internas (`/dev/tokens`, `/dev/theme`). El proyecto de un usuario solo genera las clases de los componentes que copia.
    - `pnpm build`, `pnpm test` y `pnpm format:check` en verde.
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: ¿algún global nuevo va por preset (`MimiThemePreset`) o todos solo en el CSS? Recomendación: solo en el CSS (son colores; spec 6.2: el color propio va en el CSS, con claro y oscuro), salvo que la G2.0 encuentre tamaños globales.
- [ ] G2.1 Toggle Group. Diseño: `F3 Archivos Tags Toggle Color`.
  - v0.3.0 · Tamaño M · Depende de: G2.0, G2.0b · Bloquea: 5.2
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración shadcn/Spartan, sin dependencias; «Variante y tono»; «Base técnica» y la excepción de mimi-toolbar con `FocusKeyManager`; regla de `class`; «El valor vive en Mimi»); spec 8 (`FormValueControl`); spec 13 (su tabla, de la G2.0; la de Tabs y la de Toolbar como referencia); G1.9 Tabs y G1.10 mimi-toolbar en `docs/historial/plan-grupo-1.md` (indicador que se desliza, foco itinerante, botones del usuario); `docs/design/correcciones-pendientes.md`, apartados Tabs y mimi-toolbar.
  - Diseño: `F3 Archivos Tags Toggle Color`, sección «11 · Toggle Group · control segmentado» (marcado y la función `group()` del script). Lo que muestra:
    - Cinco ejemplos: «Texto · selección simple», «Íconos · selección simple», «Íconos · selección múltiple», «Texto e ícono · múltiple» (con el elegido en `primary`, opción `solid`) y «Deshabilitado».
    - Simple: `role="radiogroup"` con botones `role="radio"` y `aria-checked`; foco itinerante (`tabindex` 0 en el elegido y −1 en los demás); flechas → y ↓ al siguiente, ← y ↑ al anterior, con vuelta, y la flecha también elige; indicador que se desliza (fondo `card`, `shadow-neutral`, `transform .45s cubic-bezier(.3,1.35,.5,1)`).
    - Múltiple: `role="group"` con botones `aria-pressed`, cada uno con su parada de Tab, sin flechas ni indicador; elegido con fondo `card` (o `primary` con `primary-foreground` en la opción `solid`).
    - Medidas: contenedor con relleno de 3px, separación de 2px, radio `calc(var(--mimi-radius) + 3px)` y fondo `muted`; ítems de 32px de alto, relleno horizontal de 12px, radio `var(--mimi-radius)`, letra de 13,5px, íconos de 16px; columnas `1fr` (texto) o `44px` (íconos); hover con texto `foreground`; escala 0,93 al pulsar; deshabilitado con opacidad 0,5 y cursor de no permitido.
  - Objetivo: un control segmentado para elegir una opción (como una radio) o varias (botones de alternancia), con el indicador animado del diseño y que funcione en los tres sistemas de formularios.
  - Alcance: incluye selección simple y múltiple, ítems con texto, ícono o los dos, la opción con el elegido en `primary` del diseño, deshabilitado del grupo, formularios. NO incluye (no está en el diseño): orientación vertical, ítems deshabilitados de a uno, tamaños, tonos, columnas de ancho propio con indicador (Tabs tiene la misma limitación).
  - Base técnica: `@angular/aria` 22.2.3 (comprobado en `node_modules/@angular/aria`: exporta `accordion`, `combobox`, `grid`, `listbox`, `menu`, `tabs`, `toolbar` y `tree`) no tiene un patrón de grupo de radio ni de grupo de alternancia propio. Lo más cercano: `ngToolbarWidgetGroup` con `role="radiogroup"`, que solo funciona dentro de un `ngToolbar` (angular.dev, guide/aria/toolbar, «Widget groups»), y el `ngListbox` horizontal, que da `role="listbox"`/`option` (no lo que muestra el diseño). Patrones de la APG: «Radio Group» (simple) y «Button» con `aria-pressed` (múltiple).
    - PENDIENTE DE DECIDIR (base técnica). Opciones: (a) `FocusKeyManager` del CDK (`@angular/cdk/a11y`) para el foco itinerante de la selección simple, como mimi-toolbar (G1.10), y botones nativos en la múltiple; (b) `ngToolbarWidgetGroup` de aria dentro de un `ngToolbar` interno: arrastra los tres choques de aria/toolbar que encontró el spike de la G1.10 (Enter y Espacio sin clic, anillo de foco con el mouse, foco movido por código); (c) `ngListbox` de aria, que cambia los roles del diseño. Recomendación: (a), implementación propia siguiendo el patrón «Radio Group» de la APG, con el `FocusKeyManager` del CDK (API pública, ya usada en la G1.10). Nunca entry points `private` ni símbolos `_`/`ɵ`.
    - Nota: la comprobación de aria se hizo con `@angular/aria` 22.2.3 (la del repo el 03/11/2026). Si M.2 sube la versión antes de esta tarea, volver a comprobar qué exporta aria.
  - API pública propuesta:
    - `<mimi-toggle-group [(value)] [multiple] [disabled] aria-label class>`. El modo múltiple se llama `multiple` (booleano), igual que en el Combobox (G2.8) (decidido el 03/11/2026). Cómo se tipa `value` en los dos modos: «Convención de valor simple/múltiple» (plan, «Decisiones pendientes»).
    - Ítems del usuario: `<button mimiToggleGroupItem="valor" aria-label>` con texto o ícono por contenido proyectado (como `mimiToolbarItem`, G1.10).
    - `class` va al contenedor (la píldora), según la regla de la spec 4.
    - Estado: `data-state="on|off"` en cada ítem, `data-disabled`, `data-orientation` no (solo horizontal).
  - Formularios: control propio con `FormValueControl` (spec 8), nunca `ControlValueAccessor`; prueba con `[formField]`, `formControlName` y `[(ngModel)]` en simple y en múltiple; `touch` cuando el foco sale del grupo entero (como el Select, G1.5); `disabled` del formulario deshabilita el grupo.
  - Tokens: tabla en la spec 13 (tarea G2.0). Registrar los que vayan al preset en `theme/types.ts` y el prefijo en `COMPONENT_PREFIX`, con prueba, y la tabla en `component-tokens.ts`. La curva del indicador del diseño es la misma que `--mimi-tabs-spring` (spec 13, Tabs): ver si se comparte.
  - Teclado y accesibilidad:
    - Simple (APG Radio Group): una parada de Tab (el elegido, o el primero si no hay); flechas con vuelta que mueven el foco y eligen; Espacio elige el enfocado; en RTL, ← y → se invierten.
    - Múltiple: cada botón es una parada de Tab; Enter y Espacio nativos alternan `aria-pressed`.
    - Nombre: `aria-label` en el grupo; aviso en desarrollo («[Mimi] Toggle Group: …», spec 4) si falta, o si un ítem sin texto no tiene `aria-label`.
    - En test: roles, `aria-checked`/`aria-pressed`, `tabindex`, cada tecla, RTL y deshabilitado. A mano: NVDA (lee «botón de opción, 2 de 4, seleccionado»), foco visible en claro y oscuro.
  - Ejemplos del showcase: los cinco del diseño, más formularios (los tres sistemas), con `class`, claro y oscuro, y deshabilitado.
  - CLI: ítem `toggle-group` en `registry.json`, con `utils/cn` y `utils/control-styles`; peer `@angular/cdk` si se usa la opción (a); sin `cssImports` (no hay overlay); lista del `x-prompt` de `ui/schema.json` y README de la CLI.
  - Textos: No aplica (sin textos propios; el nombre lo da el usuario).
  - Trampas conocidas:
    - `outline-none` anula `focus-visible:outline-2` en Tailwind 4 (5.11 y Tabs); lo comprueba `focus-styles.spec.ts`.
    - El indicador por porcentajes solo funciona con columnas iguales (Tabs, G1.9; `correcciones-pendientes.md`, Tabs). El diseño usa columnas iguales en la selección simple (`1fr` o `44px`), así que alcanza.
    - El valor vive en Mimi: un valor sin ítem se conserva y no se reemplaza por `null` (spec 4; choque 1 de Tabs).
    - El foco movido por código tiene que sincronizarse con el gestor (`focusin`), como en la G1.10.
    - Los atributos ARIA del usuario en sus botones (por ejemplo, su `aria-label`) no se pisan con un binding de host que valga `null` (el arreglo de Button antes de la G1.12).
  - Criterios de hecho:
    - Simple y múltiple funcionan con `[formField]`, `formControlName` y `[(ngModel)]`, con pruebas.
    - Teclado completo según el patrón (simple y múltiple, con RTL); foco visible; estados claro, oscuro, deshabilitado y error (si el formulario lo marca).
    - Indicador alineado al elegido después de clic, teclado y cambio de valor desde fuera; sin transición con movimiento reducido.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 (catálogo y archivos) y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi toggle-group` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después; el componente es lazy, así que el JS inicial solo suma la ruta y la sidebar (si crece más, explicar por qué).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: la base técnica (ver arriba).
    - PENDIENTE DE DECIDIR: en simple, ¿se puede dejar sin elección volviendo a pulsar la elegida? El diseño no lo muestra (al pulsar la elegida no cambia). Recomendación: no, como una radio.
    - Cómo se tipa `[(value)]` en simple y en múltiple: es la decisión compartida «Convención de valor simple/múltiple» (plan, «Decisiones pendientes»), que vale también para G2.7 y G2.8.
    - PENDIENTE DE DECIDIR: el nombre de la opción con el elegido en `primary` (el diseño la llama `solid`). Recomendación: `variant="solid"` (spec 4, «Variante y tono»), sin `tone` en esta versión.
    - PENDIENTE DE DECIDIR: ¿Toggle Group se puede usar dentro de mimi-toolbar? La toolbar ya tiene `kind="tool"` (una herramienta activa con `aria-pressed`) y la D6 anota que «un grupo de radio con nombre llegaría con los grupos». Recomendación: no en esta versión; anotarlo para la toolbar.
- [ ] 5.2 Página «Tema» sencilla (después de la 0.2.0; spec 11, «Página "Tema"»). Ruta `/docs/theme`, lazy, en Primeros pasos. Cambia solo variables globales: color principal (unas muestras de color y un `<input type="color">` nativo, sin depender del Color Picker), radio, y claro/oscuro para previsualizar. Vista previa con algunos componentes reales. Botón para copiar el resultado como CSS (`:root` y `.dark`) y como preset de `provideMimiTheme()`. Usa el mismo sistema que el usuario: arma un `MimiThemePreset` y lo aplica con `applyMimiTheme` / `mimiThemeToCss`, sin otro camino ni variables propias. Sin guardar, sin cuentas y sin edición por componente. (Antes «Temas» con personalizador; el editor completo, Theme Studio, es un proyecto aparte: `docs/futuro/theme-studio.md`.)
  - v0.3.0 · Tamaño M · Depende de: G2.1, G2.0b · Bloquea: 5.10
  - Estado: —
  - Leer antes: spec 11 («Página "Tema"»); spec 6.3 (preset tipado: `radius`, `colors` y `darkColors`, con `primary`, `primaryForeground` y `ring` en `theme/types.ts`, y `controls` para el alto de control); spec 6.4 (`mimiThemeToCss`, `applyMimiTheme`, `provideMimiTheme`); spec 13 («Colores»: cada color con su texto a 4,5:1; «Correcciones pendientes del diseño»: `definePreset` de `@mimi-ng/theme` no existe); spec 10 (layout, rutas lazy, sidebar `DOCS_NAV`, presupuestos); `apps/docs/src/app/dev/theme-page.ts` (la página interna `/dev/theme`, que ya aplica presets con `applyMimiTheme`); la G1.12 en `docs/historial/plan-grupo-1.md` (la última página de documentación nueva); la G2.1 (Toggle Group, que usan los segmentos).
  - Diseño: `Sitio`, vista «Temas»: secciones `#personalizar` (color primario como `radiogroup` de muestras; «Radio» y «Densidad» como controles segmentados), `#vista-previa` y `#exportar`; datos `SWATCHES` (Neutro y cuatro colores en oklch), `RADII` (0, 4, 8, 12 y `full` = 9999px) y `HEIGHTS` (36, 40 y 44px), y la función `preset()`.
  - Objetivo: una página del showcase donde el usuario cambia el color principal, el radio y la densidad, ve el resultado en componentes reales y copia el CSS o el preset para su proyecto.
  - Alcance: incluye el color principal (las muestras del diseño y un `<input type="color">` nativo), el radio y la densidad con el Toggle Group (G2.1; los valores del diseño), claro/oscuro para previsualizar, la vista previa con componentes reales de Mimi y dos botones de copiar: el CSS (la salida de `mimiThemeToCss`) y el preset para `provideMimiTheme()`. NO incluye: guardar, cuentas, edición por componente ni el Color Picker (spec 11); el `definePreset` del diseño (spec 13).
  - Base técnica: ninguna (página del showcase con signals); los segmentos son `mimi-toggle-group` en modo simple.
  - API pública propuesta: No aplica (página, no componente). Ruta `/docs/theme` («Tema», como dice la spec 11), lazy, con `title`.
    - La sidebar tiene hoy «Temas» en `/docs/themes` con `status: 'pending'`: es un marcador sin ruta (comprobado el 03/11/2026: no hay ruta `themes` en `app.routes.ts`, y la sidebar dibuja los `pending` sin enlace). Se reemplaza por «Tema» → `/docs/theme` en `DOCS_NAV`, con estado `ready`; no hace falta redirección. `docs-sidebar.spec.ts` tiene su propia copia de la lista: actualizarla si la prueba la compara.
  - Formularios: No aplica (estado local con signals).
  - Tokens: no crea ninguno. Escribe un `MimiThemePreset` con `radius`, `colors.primary`, `colors.primaryForeground`, `colors.ring`, sus pares en `darkColors` y el alto de control en `controls` (con los nombres de `theme/types.ts`).
  - Teclado y accesibilidad: las muestras como `radiogroup` (flechas y Tab, como el diseño), el `<input type="color">` con su `<label>`, los segmentos con el teclado del Toggle Group, los botones de copiar con su aviso accesible (el `CopyButton` del showcase), la vista previa usable con el teclado (son componentes reales). Se prueba en test: el preset y el CSS generados para cada elección. A mano: teclado, lector de pantalla en los segmentos y contraste de la vista previa.
  - Ejemplos del showcase: es la página; muestra el estado inicial (tema de fábrica), cada muestra, un color propio, cada radio, cada densidad, y claro y oscuro.
  - CLI: No aplica.
  - Textos: No aplica (la página es del showcase, en español).
  - Trampas conocidas:
    - `applyMimiTheme` escribe un `<style id="mimi-theme">` global (spec 6.4): cambia todo el sitio, no solo la vista previa. Hay que guardar el estado anterior y devolverlo al salir de la página, como `/dev/theme`.
    - Contraste: el diseño fija `primaryForeground` en `oklch(0.99 0 0)` para cualquier color; un color claro elegido con el `<input type="color">` puede dejar el texto por debajo de 4,5:1 (spec 13, «Colores»; `contrast.spec.ts` solo prueba los valores de fábrica).
    - El `<input type="color">` da un hex sRGB y los tokens de fábrica están en oklch: el CSS copiado mezcla formatos (no rompe nada, pero el usuario lo ve).
    - El código del diseño usa `definePreset` y las claves `light`/`dark`: en Mimi son `provideMimiTheme` y `colors`/`darkColors` (spec 13).
    - Ruta lazy: el JS inicial solo debería sumar la entrada de la ruta y de la sidebar (en el Grupo 1, de 0,19 a 0,29 kB por página).
  - Criterios de hecho:
    - La ruta `/docs/theme` abre la página desde la sidebar («Tema», `ready` en `DOCS_NAV`) y tiene `title`.
    - Elegir una muestra, un color propio, un radio o una densidad cambia la vista previa al instante, en claro y en oscuro.
    - Al salir de la página se restaura el tema anterior: al navegar a otra ruta y al destruirse el componente. Con prueba.
    - Nada se guarda en `localStorage` ni en la URL. Con prueba.
    - El color de texto sobre el principal (`primaryForeground`) se calcula; si ni el claro ni el oscuro llegan a 4,5:1, la página lo avisa con un texto visible, y no se puede exportar sin que ese aviso esté a la vista. Con prueba.
    - «Exportar preset» genera código con solo API documentada (`provideMimiTheme` y `MimiThemePreset`, spec 6.3 y 6.4) y solo tokens que existen en la spec 13; el preset copiado compila (prueba). El CSS copiado es exactamente la salida de `mimiThemeToCss` para el preset elegido.
    - La página no cambia nada que no sea global (spec 11: sin tokens de componente).
    - Teclado completo y foco visible en todos los controles.
    - Spec 10 y 11 actualizadas (ruta, contenido y la densidad, que la spec 11 todavía no nombra).
    - `pnpm build`, `pnpm test`, `pnpm format:check` en verde; bundle (JS inicial y CSS global, crudo y gzip, antes y después).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: el modo claro/oscuro de la vista previa, ¿cambia todo el sitio (el `ThemeService` del showcase) o solo el contenedor de la vista previa (clase `dark` en el contenedor)? Recomendación: solo el contenedor, para no cambiar el modo que eligió el usuario.
- [ ] G2.2 Number Input. Diseño: `F3 Slider OTP Numero Mascara`.
  - v0.3.0 · Tamaño M · Depende de: G2.0, G2.0b (spec 4: `utils/control-styles` y `FormValueControl`) · Bloquea: —
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración PrimeNG InputNumber y HeroUI; «El valor vive en Mimi»); spec 8 (`FormValueControl`, `MIMI_FIELD_CONTROL`, `touch`, mensajes de error); spec 13 (su tabla, de la G2.0; la de Input como referencia de alturas); la 2.2 Input en `docs/historial/plan-fase-0-3.md` y la G1.5 Select en `docs/historial/plan-grupo-1.md` (control propio con `FormValueControl` y anillo en la caja); la G1.11 Pagination (botones con `aria-disabled` en los extremos y campo numérico con ↑/↓); angular.dev, guide/forms/signals/custom-controls, «Value transformation» (`transformedValue()`: su ejemplo es justamente un `NumberInput` con `parse` y `format`, y los errores de lectura llegan a los `errors()` del campo).
  - Diseño: `F3 Slider OTP Numero Mascara`, sección «6 · Number Input» (marcado y la función `num()` del script). Lo que muestra:
    - Caja con botón −, un `<input>` con `role="spinbutton"`, `inputmode="decimal"`, `aria-valuemin`, `aria-valuemax` y `aria-valuenow`, y botón +. Botones de 30px, radio `--mimi-radius-sm`, íconos de 15px, `aria-label` «Disminuir <etiqueta>» y «Aumentar <etiqueta>», escala 0,88 al pulsar; en el límite, deshabilitados (opacidad 0,35 y cursor de no permitido).
    - Texto centrado, 14px, peso 500, `tabular-nums`. Con el foco muestra el número sin formato; sin el foco, formateado con `Intl.NumberFormat` (ejemplos `es-MX`: decimal con 2 decimales y moneda MXN).
    - Al salir del campo: lee el texto, redondea al paso y acota a `min`/`max`. ↑ y ↓ suman o restan un paso; Enter sale del campo.
    - Ejemplos: «Cantidad» (0 a 10, paso 1), «Peso» (0 a 50, paso 0,25, sufijo «kg»), «Precio» (0 a 100000, paso 50, moneda MXN).
    - Estados: normal, hover (`--mimi-input-hover`), foco (anillo `ring` y `ring-soft` de 3px), deshabilitado (0,5), con error (`destructive` y su anillo; mensaje «Máximo 10.»).
  - Objetivo: un campo numérico con botones − y +, formato según el idioma y límites, que funcione en los tres sistemas de formularios.
  - Alcance: incluye `min`, `max`, `step`, formato con `Intl.NumberFormat` (opciones del usuario: moneda, decimales, unidad), ↑/↓, botones, redondeo al paso y acotado al salir del campo, estados del diseño. Propuestas tuyas que el diseño **no** muestra (marcadas así, para decidir): rueda del mouse, mantener pulsado para repetir, Re Pág/Av Pág e Inicio/Fin (los tiene el Slider del mismo archivo), valor vacío distinto de 0. NO incluye: notación científica, números muy grandes (`bigint`).
  - Base técnica: ninguna. `@angular/aria` 22.2.3 no tiene un patrón de spinbutton (exporta `accordion`, `combobox`, `grid`, `listbox`, `menu`, `tabs`, `toolbar` y `tree`); la APG tiene el patrón «Spinbutton».
    - PENDIENTE DE DECIDIR: implementación propia siguiendo el patrón «Spinbutton» de la APG. Opciones: (a) `<input type="text">` con `role="spinbutton"` y `inputmode="decimal"`, como el diseño (permite el formato con `Intl.NumberFormat`); (b) `<input type="number">` nativo, que no admite el texto formateado (moneda, separadores) y cambia con la rueda sin que se pida. Recomendación: (a).
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres): `<mimi-number-input [(value)] [min] [max] [step] [format] [locale] [disabled] [readonly] aria-label class>`. `value`: `number | null`. `format`: las opciones de `Intl.NumberFormat`. `locale`: por defecto, el `LOCALE_ID` de Angular. `class` va a la caja. Estado: `data-state`, `data-invalid`, `data-disabled`.
  - Formularios: control propio con `FormValueControl<number | null>` (spec 4 y 8), nunca `ControlValueAccessor`. `MIMI_FIELD_CONTROL` para que `mimi-form-field` lo nombre y le ponga el error (como el Select). `touch` cuando el foco sale de la caja entera (input y botones). Pruebas con `[formField]`, `formControlName` y `[(ngModel)]`; validadores `min`/`max` del formulario y los del componente, sin duplicar el mensaje.
  - Tokens: tabla en la spec 13 (tarea G2.0). Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts`. Alto de control con la cascada de la spec 6.2, alineado con Input y Button. Los globales nuevos, con valor de respaldo (G2.0b).
  - Teclado y accesibilidad (APG «Spinbutton»): ↑ y ↓ un paso (diseño); Re Pág/Av Pág e Inicio/Fin (propuesta, no en el diseño); Enter confirma (diseño); el texto se escribe libre y se interpreta al salir. `aria-valuenow` con el número y `aria-valuetext` con el texto formateado (para que el lector diga «$1.250,00» y no «1250»). Los botones − y + no son una parada de Tab extra (patrón APG: el foco está en el campo; los botones son para el puntero) — PENDIENTE DE DECIDIR en preguntas. En test: cada tecla, límites, redondeo, formato y lectura con dos idiomas. A mano: NVDA en el campo.
  - Ejemplos del showcase: los tres del diseño (cantidad, peso con decimales y unidad, precio en moneda), los estados (deshabilitado, solo lectura, con error y su mensaje), formularios (los tres sistemas), con `class`, claro y oscuro.
  - CLI: ítem `number-input` en `registry.json`, con `utils/cn`, `utils/control-styles` y `utils/field-state`; sin dependencias de npm (`Intl` es del navegador); peer `@angular/forms` si usa `field-state`; `x-prompt` y README de la CLI.
  - Textos: sí. «Disminuir {etiqueta}» y «Aumentar {etiqueta}» → `MIMI_NUMBER_INPUT_TEXT` (inglés) y `MIMI_NUMBER_INPUT_TEXT_ES`, con `provideMimiNumberInputText`, en un archivo de textos aparte (como Select, G1.5).
  - Trampas conocidas:
    - Un botón enfocado que pasa a `disabled` deja caer el foco a `body` (M.1, y la G1.11 lo evitó con `aria-disabled` en ← y →). En el límite, los botones −/+ usan `aria-disabled`, no `disabled` nativo.
    - Doble clic en zoneless (M.1): el estado deshabilitado llega en el render siguiente; dos clics rápidos en + pueden pasar el máximo si no se acota al aplicar.
    - El diseño interpreta el texto quitando todo lo que no es dígito, punto o signo (`parseFloat`): con un idioma que usa coma decimal (por ejemplo, `es-ES`), «1.250,5» se lee mal. La lectura tiene que usar los separadores del idioma (`Intl.NumberFormat#formatToParts`).
    - `outline-none` en el input anula el anillo de foco (5.11); el anillo va en la caja (`focus-within`), como el Select.
    - El anillo de error del diseño usa `--mimi-destructive-soft` (nombre viejo): en Mimi es `--mimi-destructive-ring` (T.1).
    - El valor vive en Mimi (spec 4): un valor que llega del formulario fuera de rango se pinta acotado sin reescribir el modelo (como Pagination, G1.11).
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, con pruebas (valor, `touch`, `disabled`, errores).
    - Teclado completo según el patrón decidido; foco visible en la caja.
    - Estados claro, oscuro, deshabilitado, error y solo lectura.
    - Idioma: `LOCALE_ID` de Angular por defecto y una entrada `locale` para cambiarlo, con prueba.
    - Lectura con los separadores del idioma: en `es-ES`, «1.250,5» se interpreta como 1250,5 (prueba); también en `en-US` y `es-MX`.
    - Se formatea al salir del campo, no mientras se escribe (para no mover el cursor), con prueba.
    - `aria-valuenow`, `aria-valuemin`, `aria-valuemax` y `aria-valuetext` con el número formateado, con prueba.
    - En los límites, − y + con `aria-disabled` (como Pagination, G1.11), sin `disabled` nativo: el foco no cae a `body` al llegar al límite con el teclado o el puntero (prueba).
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Textos con `provideMimiNumberInputText` y su versión `_ES`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi number-input` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después (componente lazy: el JS inicial solo suma la ruta y la sidebar; si crece, explicar por qué).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: la base técnica (ver arriba).
    - PENDIENTE DE DECIDIR: valor vacío. El diseño siempre tiene un número; ¿el campo vacío es `null` (y el formulario decide si es requerido) o se vuelve a `min`/0? Recomendación: `null`.
    - PENDIENTE DE DECIDIR: rueda del mouse, mantener pulsado para repetir, Re Pág/Av Pág e Inicio/Fin (propuestas, no en el diseño). Recomendación: Inicio/Fin y Re Pág/Av Pág sí (APG); mantener pulsado sí; rueda no (cambia valores sin querer al hacer scroll), y anotar las tres en `correcciones-pendientes.md`.
    - PENDIENTE DE DECIDIR: ¿los botones −/+ son paradas de Tab? Recomendación: no (`tabindex="-1"`): el teclado ya tiene ↑/↓ en el campo.
- [ ] G2.3 Password (mostrar/ocultar y medidor de seguridad). Diseño: `F3 Slider OTP Numero Mascara`.
  - v0.3.0 · Tamaño M · Depende de: G2.0, G2.0b, 2.2 (Input, hecha) · Bloquea: —
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración PrimeNG Password, depende de Input); spec 8 (campos nativos con directiva: detectan `FormField` o `NgControl`; no envolver un `<input>` de forma que rompa `formControlName` o `ngModel`, CLAUDE.md regla 6); spec 13 (su tabla, de la G2.0; los globales `--mimi-strength-weak`, `-medium` y `-strong`, que trae la G2.0b); la 2.2 Input y la 2.11 FormField en `docs/historial/plan-fase-0-3.md` (directiva sobre el input nativo y proyección en un contenedor); el arreglo de Button antes de la G1.12 (no pisar los atributos del usuario).
  - Diseño: `F3 Slider OTP Numero Mascara`, sección «8 · Password» (marcado, `strength()`, `LEVELS`, `bars()` y el objeto `pw` del script). Lo que muestra:
    - Caja con el `<input>` (`autocomplete="new-password"`, `aria-describedby` al bloque del medidor) y un botón de ojo (`aria-label` «Mostrar contraseña» u «Ocultar contraseña», `aria-pressed`, ícono `eye`/`eye-off` de 16px, escala 0,88 al pulsar). El botón cambia el `type` entre `password` y `text`.
    - Medidor: cuatro barras de 6px (radio 999px, separación 4px, `aria-hidden`) con los colores `--mimi-strength-weak`, `-medium` y `-strong` sobre `--mimi-track`; el nivel en texto visible («Débil», «Media», «Fuerte», 13px, peso 600, en `<tono>-soft-foreground`); y cuatro reglas con ícono (`circle-check` o `circle`): «8 caracteres o más», «Una mayúscula», «Un número», «Un símbolo».
    - Heurística del diseño (`strength()`): cuenta las cuatro reglas; nivel 1 con 0–1, 2 con 2–3, 3 con las 4.
    - Estados: normal, hover, foco, deshabilitado y con error («No coinciden.»).
  - Objetivo: un campo de contraseña con mostrar/ocultar y un medidor orientativo, sin dependencias nuevas y sin romper el autocompletado de los gestores de contraseñas.
  - Alcance: incluye el botón de mostrar/ocultar, el medidor con nivel y reglas, los estados del diseño, formularios. NO incluye: una medida real de seguridad (nada de `zxcvbn` ni otra dependencia: CLAUDE.md, «No agregues dependencias»), confirmación de contraseña (es un validador del formulario: el «No coinciden.» del diseño lo pone el usuario).
  - Base técnica: ninguna (campo nativo y un botón). No hay patrón de aria ni de la APG para esto; el botón es un «Button» con `aria-pressed` de la APG.
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres): un contenedor que proyecta el input del usuario, para no romper los formularios (CLAUDE.md, regla 6): `<mimi-password [strength] [rules] class><input mimiInput type="password" autocomplete="new-password" formControlName="…" /></mimi-password>`. El contenedor agrega el botón y, si se pide, el medidor. `class` va a la caja.
  - Formularios: el valor es del `<input>` nativo (directiva de Input, spec 8): funciona con `[formField]`, `formControlName` y `[(ngModel)]` sin que el contenedor sea un control. El medidor lee el valor del input (evento `input`), no del formulario.
  - Tokens: tabla en la spec 13 (tarea G2.0); los globales `--mimi-strength-*` con valor de respaldo (G2.0b). Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts`.
  - Teclado y accesibilidad:
    - El botón de mostrar/ocultar es una parada de Tab después del input, con `aria-pressed`, y su nombre cambia con el estado. Pulsarlo no mueve el foco al input ni lo saca del botón (propuesta tuya; el diseño solo cambia el `type`).
    - El medidor se asocia al input con `aria-describedby` (como el diseño); el nivel es texto visible, y las barras, `aria-hidden`.
    - **Anuncios (decidido el 03/11/2026):** el medidor no anuncia cada pulsación. Anuncia solo cuando **cambia el nivel** (por ejemplo, de «Débil» a «Media»), una vez, con el `LiveAnnouncer` del CDK en modo `polite` (API documentada, la misma que usa Toast, G1.8): al escribir una contraseña completa son como mucho tres anuncios. El nivel y las reglas también quedan en `aria-describedby`, y el lector los lee al llegar al campo. Se documenta en la página.
    - En test: `type`, `aria-pressed`, nombre del botón, `aria-describedby`, niveles. A mano: NVDA y el autocompletado de un gestor de contraseñas (Chrome y uno externo).
  - Ejemplos del showcase: contraseña nueva con medidor (como el diseño), contraseña de inicio de sesión sin medidor (`autocomplete="current-password"`), los tres ejemplos del diseño (débil, media, fuerte), los estados (deshabilitado, con error «No coinciden.» con un validador), formularios, con `class`, claro y oscuro.
  - CLI: ítem `password` en `registry.json`, con `input` (registryDependencies), `utils/cn` y `utils/control-styles`; sin dependencias de npm; `x-prompt` y README de la CLI.
  - Textos: sí. «Mostrar contraseña», «Ocultar contraseña», los niveles y las cuatro reglas → `MIMI_PASSWORD_TEXT` (inglés) y `MIMI_PASSWORD_TEXT_ES`, con `provideMimiPasswordText`, en un archivo de textos aparte.
  - Trampas conocidas:
    - Cambiar el `type` es lo que hace el diseño y es lo habitual; lo que no hay que hacer es reemplazar el input (crear otro elemento): el gestor de contraseñas y los formularios pierden la referencia.
    - El `autocomplete` lo decide el usuario (`new-password` o `current-password`); el contenedor no lo pisa con un binding que valga `null` (el arreglo de Button antes de la G1.12).
    - Edge muestra su propio botón de revelar (`::-ms-reveal`): dos ojos. Ocultarlo en el CSS del componente.
    - El medidor es orientativo, no una medida de seguridad: la página y la API lo dicen.
    - `outline-none` en el input anula el anillo de foco (5.11): el anillo va en la caja (`focus-within`).
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, con pruebas (el valor sigue llegando al formulario al mostrar y ocultar).
    - Mostrar/ocultar con el teclado y el puntero; `aria-pressed` correcto y el nombre accesible del botón cambia con el estado («Mostrar contraseña» / «Ocultar contraseña»); el foco no se mueve; foco visible. Con pruebas.
    - `::-ms-reveal` oculto en el CSS del componente (un solo ojo en Edge).
    - Anuncios: solo cuando cambia el nivel, con el `LiveAnnouncer` en `polite` (prueba que no anuncia en cada pulsación).
    - Estados claro, oscuro, deshabilitado, error y solo lectura.
    - Medidor con la heurística por defecto, documentada como orientativa, y con la función propia del usuario; prueba de los tres niveles del diseño.
    - Prueba **manual** con un gestor de contraseñas real (el de Chrome y uno externo): guardar y rellenar, con el campo oculto y mostrado.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Textos con `provideMimiPasswordText` y su versión `_ES`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi password` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después (componente lazy).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: cómo se calcula el medidor. Opciones: (a) la heurística del diseño por defecto (las cuatro reglas) y una función del usuario como entrada (`[strength]="miFuncion"`) que devuelve el nivel; (b) solo la función del usuario, sin heurística; (c) una biblioteca (descartada: dependencia nueva). Recomendación: (a), documentada como orientativa y no como medida de seguridad.
    - PENDIENTE DE DECIDIR: ¿las reglas («8 caracteres o más»…) se configuran (cuáles y su texto) o son fijas? Recomendación: configurables, con las cuatro del diseño por defecto.
    - Decidido (03/11/2026): el nivel se anuncia solo cuando cambia (ver «Teclado y accesibilidad»).
    - PENDIENTE DE DECIDIR: la API (contenedor que proyecta el input, o una directiva `input[mimiPassword]` que inserta el botón al lado). Recomendación: el contenedor, como `mimi-form-field`.
- [ ] G2.4 Input Mask. Diseño: `F3 Slider OTP Numero Mascara`.
  - v0.3.0 · Tarea paraguas (decidido el 03/11/2026: se divide en G2.4a y G2.4b, que tienen su propio tamaño y criterios). Se marca hecha cuando G2.4a y G2.4b lo estén. Lo que sigue (diseño, base técnica, trampas, preguntas) vale para las dos.
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración PrimeNG InputMask, depende de Input); spec 8 (campos nativos con directiva; Signal Forms y Reactive Forms; no envolver el `<input>`, CLAUDE.md regla 6; regla 7: el estado de Reactive Forms no es un signal); spec 13 (su tabla, de la G2.0); la 2.2 Input y la 2.11 FormField en `docs/historial/plan-fase-0-3.md`; angular.dev, guide/forms/signals/custom-controls, «Value transformation» (`transformedValue()`).
  - Diseño: `F3 Slider OTP Numero Mascara`, sección «7 · Input Mask» (marcado, `mask()` y `applyMask` del script). Lo que muestra:
    - Sintaxis: `0` es un dígito; el resto, literales (`(00) 0000 0000`, `00/00/0000`, `0000 0000 0000 0000`).
    - Un marcador de lo que falta (`ghost`, por ejemplo `DD/MM/AAAA`) dibujado debajo del texto, `aria-hidden`; `inputmode="numeric"`; `autocomplete` por campo (`tel-national`, `cc-number`).
    - Extras de los ejemplos: prefijo fijo (`+52`), ícono, marca de la tarjeta (VISA, MASTERCARD, AMEX), ícono de válido (`circle-check`), validación al completar (fecha que no existe, número de tarjeta con Luhn), mensaje en `aria-describedby`.
    - En el estado del diseño, el campo guarda **solo los dígitos** (`mask[key]`) y la máscara se aplica al mostrar.
    - Estados: normal, hover, foco, deshabilitado y con error («31/02 no existe.»).
  - Objetivo: un campo de texto que da formato mientras se escribe (teléfono, fecha, tarjeta), sin perder el cursor y sin romper los formularios.
  - Alcance: incluye la sintaxis de dígitos del diseño, literales, el marcador de lo que falta, `inputmode` y `autocomplete` del usuario, formularios. Propuestas tuyas que el diseño **no** muestra (marcadas así): posición del cursor al escribir y borrar en medio, pegado, deshacer, composición de texto (IME). NO incluye en el componente: la marca de la tarjeta, Luhn ni la validación de fechas (son de la demo; ver preguntas).
  - Base técnica: ninguna. No hay patrón de aria ni de la APG: es un campo de texto nativo con una directiva (spec 8).
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres, y depende de la pregunta del valor): con la opción (a), `<input mimiInput [mimiMask]="'(00) 0000 0000'" [mimiMaskPlaceholder]="'(55) 0000 0000'" inputmode="numeric" autocomplete="tel-national" formControlName="…" />`, directiva sobre el input nativo, compatible con `mimiInput`; con la opción (b), `<mimi-input-mask [mask] [placeholder] [inputmode] [autocomplete] formControlName="…" />`, control propio.
  - Formularios: campo nativo con directiva (spec 8). Pruebas con `[formField]`, `formControlName` y `[(ngModel)]`, escribiendo, pegando y con un valor que llega del formulario (con o sin máscara). Cómo convive con cada uno depende de la pregunta del valor (ver «Preguntas abiertas»).
  - Tokens: tabla en la spec 13 (tarea G2.0); probablemente solo el color del marcador (`muted-foreground`). Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts` lo que vaya al preset.
  - Teclado y accesibilidad: el teclado es el del campo nativo; la máscara no lo cambia. El marcador es `aria-hidden`: el formato esperado se dice con texto (`aria-describedby` al mensaje de ayuda, como el diseño). En test: escribir, borrar en medio, pegar, deshacer, IME (eventos `compositionstart`/`compositionend`). A mano: NVDA (que lea el valor, no el marcador) y un teclado de Android (envía `beforeinput`/`input`, no siempre `keydown` con la tecla).
  - Ejemplos del showcase: los tres del diseño (teléfono con prefijo, fecha con ícono y validación, tarjeta con marca), los estados (deshabilitado, con error), formularios (los tres sistemas), con `class`, claro y oscuro. La validación de fecha y la marca de tarjeta, como validadores del ejemplo.
  - CLI: ítem `input-mask` en `registry.json`, con `input` (registryDependencies) y `utils/cn`; sin dependencias de npm; `x-prompt` y README de la CLI.
  - Textos: No aplica (el mensaje de ayuda es del usuario).
  - Trampas conocidas:
    - Reescribir `value` por código manda el cursor al final y borra la pila de deshacer del navegador: hay que reponer la selección y decidir qué pasa con Ctrl+Z.
    - Durante la composición (IME) no se reformatea hasta `compositionend`.
    - Con `[formField]`, Signal Forms escribe el valor en el input: la directiva tiene que formatear también lo que llega del formulario, no solo lo que se escribe.
    - CLAUDE.md, regla 7: para reaccionar al estado de Reactive Forms, `toSignal(control.events)`, nunca un `computed()` sobre el control.
    - El anillo de error del diseño usa `--mimi-destructive-soft` (nombre viejo): en Mimi es `--mimi-destructive-ring` (T.1).
  - Criterios de hecho: los de G2.4a y G2.4b.
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: ¿el modelo guarda el valor con máscara («(55) 1234 5678») o sin ella («5512345678»)? El diseño guarda solo los dígitos en su estado (anotado en `correcciones-pendientes.md`). Opciones:
      - (a) Con máscara: directiva sobre el input nativo y una función exportada para quitarla (`mimiUnmask`). Reactive Forms y `ngModel` leen lo que hay en el campo (con máscara); guardar sin máscara así obligaría a reemplazar su `ControlValueAccessor` (prohibido, spec 8).
      - (b) Sin máscara: control propio con `FormValueControl<string>` y un `<input>` interno.
      - (c) Con máscara por defecto y una salida (`(rawChange)`) con los dígitos.
      - Comprobación (a), 03/11/2026: Signal Forms **sí** trae una forma documentada de transformar el valor al leer y al escribir: `transformedValue()` de `@angular/forms/signals` (angular.dev, guide/forms/signals/custom-controls, «Value transformation»; existe en `@angular/forms` 22.2.3, comprobado en `types/signals.d.ts`). Recibe el `value` (model) del control y las funciones `parse` y `format`, y devuelve el valor crudo que se pinta; `parse` puede devolver un error (`{error}`), que llega a los `errors()` del campo y lo deja inválido. Es para **controles propios** (`FormValueControl`), no para una directiva sobre un input nativo. La guía dice también que un control propio de Signal Forms se usa con Reactive Forms y con formularios de plantilla «sin código de compatibilidad extra».
      - Comprobación (b), qué se gana y qué se pierde frente al input nativo:
        - Se gana: el modelo con los dígitos (lo que suele querer un backend, y lo que hace el diseño); `transformedValue()` documentado para separar lo que se pinta de lo que se guarda; una máscara incompleta puede ser un error de lectura del campo (`parse`), que bloquea el envío; el mismo mecanismo que usará Number Input (G2.2), que también pinta distinto de lo que guarda.
        - Se pierde: el usuario ya no pone sus atributos en su propio `<input>`. `name` llega por `FormUiControl` (la interfaz que extiende `FormValueControl` tiene `name`, comprobado en `types/signals.d.ts`); `autocomplete`, `inputmode`, `aria-*` e `id` hay que reenviarlos al input interno como entradas (con la trampa de no pisar los del usuario, como el arreglo de Button antes de la G1.12). La validación nativa del navegador (`required`, `pattern`) deja de ser la del input del usuario: la reglas van en el esquema del formulario, como pide la guía. Y la dependencia «Input» de la spec 4 se cumple usando Input dentro, no sobre el input del usuario.
        - Regla 6 de CLAUDE.md: prohíbe envolver un `<input>` nativo «de forma que rompa `formControlName` o `[(ngModel)]`». Un control propio con `FormValueControl` no los rompe (se ponen en el control, como el Select o el Number Input); la regla pide directivas para los elementos nativos que el usuario escribe, así que (b) es un control propio, no una directiva, y hay que decirlo en la spec 4 y en la spec 8.
      - Recomendación (cambia respecto de la Tanda B, por la comprobación): (b). La guía de Angular trae el mecanismo para exactamente este caso, el modelo queda como lo muestra el diseño y Number Input usa el mismo camino. Si se prefiere que el usuario siga escribiendo su propio `<input>`, (a).
      - **Condición de la recomendación (b):** solo vale si el control propio con `transformedValue()` funciona también con Reactive Forms (`formControlName`) y con `[(ngModel)]`, no solo con `[formField]`. La guía lo afirma para los controles propios en general, pero no lo dice de `transformedValue()` ni de sus errores de lectura (`parse`), que van a los `errors()` del campo de Signal Forms; con Reactive Forms y `ngModel` no está comprobado a dónde llegan (por ejemplo, si el `FormControl` queda inválido con una máscara incompleta). Lo comprueba la primera prueba de G2.4a; si falla, la recomendación vuelve a (a) y se lleva la decisión al usuario antes de seguir.
    - PENDIENTE DE DECIDIR: ¿más símbolos que `0` (letras, alfanumérico)? El diseño solo usa `0`. Recomendación: solo `0` en esta versión.
    - PENDIENTE DE DECIDIR: Ctrl+Z después de un reformateo: ¿se acepta que deshaga solo hasta el último cambio de Mimi, o se lleva una pila propia? Recomendación: aceptar el comportamiento del navegador y documentarlo.
    - PENDIENTE DE DECIDIR: marca de tarjeta, Luhn y validación de fecha: ¿parte de Mimi (validadores exportados) o solo en los ejemplos? Recomendación: solo en los ejemplos.
- [ ] G2.4a Input Mask: máscara de dígitos (directiva o control según la pregunta del valor de G2.4, cursor, pegado, IME y formularios)
  - v0.3.0 · Tamaño M · Depende de: G2.0, G2.0b, 2.2 (Input, hecha) · Bloquea: G2.4b
  - Estado: —
  - Leer antes, Diseño, Base técnica, Formularios, Tokens, Teclado y accesibilidad, CLI y Trampas: los de G2.4.
  - Objetivo: el formato mientras se escribe, sin perder el cursor y sin romper los formularios.
  - Alcance: incluye la sintaxis `0`, los literales, `inputmode` y `autocomplete`, el cursor al escribir y al borrar en medio, el pegado con y sin literales, la composición de texto (IME) y los tres sistemas de formularios. NO incluye: el marcador de lo que falta, el prefijo ni el ícono (G2.4b).
  - Ejemplos del showcase: teléfono, fecha y tarjeta sin marcador ni prefijo; estados; formularios.
  - Primer paso (si se eligió la opción (b) de G2.4): una prueba con el control propio y `transformedValue()` en los tres sistemas (`[formField]`, `formControlName` y `[(ngModel)]`): el modelo recibe solo los dígitos, un valor que llega del formulario se pinta con la máscara y una máscara incompleta deja el control inválido en los tres (o se documenta en cuál no). Si no funciona con Reactive Forms o con `ngModel`, se detiene la tarea y se lleva la decisión al usuario (G2.4, «Condición de la recomendación (b)»).
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, con pruebas (escribir, pegar, valor desde el formulario, `disabled`, errores), según lo que se decida del valor.
    - Con la opción (b): la prueba del primer paso queda en la suite (modelo sin máscara, formato al recibir el valor y validez con máscara incompleta, en los tres sistemas).
    - Cursor correcto al escribir y al borrar en medio; pegado con y sin literales; IME sin reformatear a mitad; deshacer según lo que se decida. Con pruebas.
    - Teclado nativo intacto; foco visible; estados claro, oscuro, deshabilitado, error y solo lectura.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX` si los hay, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Página del showcase con los estados de esta parte y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi input-mask` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después.
  - Preguntas abiertas: las de G2.4.
- [ ] G2.4b Input Mask: marcador de lo que falta, prefijo e ícono del diseño
  - v0.3.0 · Tamaño S · Depende de: G2.4a · Bloquea: —
  - Estado: —
  - Leer antes, Diseño y Trampas: los de G2.4.
  - Objetivo: lo que el diseño agrega alrededor de la máscara.
  - Alcance: incluye el marcador de lo que falta (`aria-hidden`, color `muted-foreground`), el prefijo fijo (`+52`) y el ícono al principio. NO incluye la marca de la tarjeta ni el ícono de válido (son de los ejemplos; ver preguntas de G2.4).
  - Teclado y accesibilidad: el marcador y el ícono son decorativos (`aria-hidden`); el prefijo, si cambia el significado del número, se dice en el nombre o en la ayuda (no solo visible).
  - Ejemplos del showcase: los tres del diseño completos (teléfono con prefijo, fecha con ícono y validación, tarjeta con marca), con `class`, claro y oscuro.
  - Criterios de hecho:
    - El marcador sigue al texto escrito (el resto, en `muted-foreground`) sin desalinearse con letras de distinto ancho (`tabular-nums` o la fuente del diseño) y no lo lee el lector.
    - Prefijo e ícono en su lugar en claro y oscuro, deshabilitado y error.
    - Página del showcase con los tres ejemplos del diseño.
    - Spec 4 al día.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después.
  - Preguntas abiertas: las de G2.4.
- [ ] G2.5 Input OTP. Diseño: `F3 Slider OTP Numero Mascara`.
  - v0.3.0 · Tamaño M · Depende de: G2.0, G2.0b (spec 4: `utils/control-styles`) · Bloquea: B.5
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración shadcn, depende de `utils/control-styles`); spec 6.6 (movimiento reducido); spec 8 (`FormValueControl` o campo nativo; `MIMI_FIELD_CONTROL`); spec 13 (su tabla, de la G2.0; keyframes `mimi-caret` y `mimi-shake`, que trae la G2.0b); la 2.2 Input en `docs/historial/plan-fase-0-3.md`; la G1.5 Select en `docs/historial/plan-grupo-1.md` (control propio con anillo en la caja).
  - Diseño: `F3 Slider OTP Numero Mascara`, sección «5 · Input OTP» (marcado, `otpBoxes()`, el objeto `otp` y `otpStates` del script). Lo que muestra:
    - **Un solo `<input>` real** (transparente, encima de las casillas) con `inputmode="numeric"`, `autocomplete="one-time-code"`, `maxLength="6"`, `aria-invalid` y `aria-describedby` al mensaje; seis casillas visuales `aria-hidden`, con un separador de 12px después de la tercera.
    - Casilla de 46×54px, radio `var(--mimi-radius)`, fondo `--mimi-input-background`, texto de 22px, peso 600, `tabular-nums`; la activa con anillo `ring` y `ring-soft` de 3px y un cursor que parpadea (`mimi-caret 1s steps(1) infinite`).
    - Al escribir, solo dígitos y como máximo 6 (`replace(/\D/g, '').slice(0, 6)`).
    - Estados: vacío con el foco en la primera, escribiendo, completo (borde `success` y anillo `success-ring`, mensaje «Código verificado.»), con error (borde `destructive`, sacudida `mimi-shake .4s`, mensaje «Código incorrecto.»), deshabilitado (0,5, mensaje con reloj «Espera 0:42 para pedir otro.»).
    - Mensaje en un elemento con `role="status"` (13px), del color del estado.
  - Objetivo: pedir un código de un solo uso con casillas visuales, que el sistema pueda autocompletar desde el SMS y que se pueda pegar entero.
  - Alcance: incluye longitud configurable (6 en el diseño), separador opcional, solo dígitos, estados del diseño, formularios. Propuestas tuyas, confirmadas por el diseño: pegado del código entero y `autocomplete="one-time-code"` (el input único los resuelve), `inputmode` (el diseño usa `numeric`), borrar hacia atrás (comportamiento nativo del input único). NO incluye: el mensaje (es del usuario, aunque el ejemplo lo muestra), la verificación del código ni el temporizador de reenvío.
  - Base técnica: ninguna. No hay patrón de aria ni de la APG para OTP. La decisión es cuántos inputs reales hay (ver «Preguntas abiertas»).
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres): `<mimi-input-otp [(value)] [length] [separatorAfter] [disabled] aria-label class>`; `value`: `string` (solo dígitos). Estado: `data-state="empty|partial|complete"`, `data-invalid`.
  - Formularios: control propio con `FormValueControl<string>` (spec 8) y `MIMI_FIELD_CONTROL`, con el `<input>` real dentro; pruebas con `[formField]`, `formControlName` y `[(ngModel)]` (escribir, pegar, valor desde el formulario, `disabled`, error). `touch` al salir el foco.
  - Tokens: tabla en la spec 13 (tarea G2.0); keyframes `mimi-caret` y `mimi-shake` de la G2.0b, con respaldo. Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts`.
  - Teclado y accesibilidad: una sola parada de Tab (el input real); escribir, borrar, pegar y las flechas son los del campo nativo. El lector lee el input como un campo de texto con su nombre, el valor escrito y el mensaje (`aria-describedby`). Movimiento reducido: sin parpadeo del cursor ni sacudida (spec 6.6). En test: solo dígitos, máximo de longitud, pegado con espacios o guiones, `aria-invalid`. A mano: NVDA y el autocompletado de un SMS en un móvil (iOS y Android).
  - Ejemplos del showcase: los cinco estados del diseño, longitud distinta (4), sin separador, formularios, con `class`, claro y oscuro, y movimiento reducido.
  - CLI: ítem `input-otp` en `registry.json`, con `utils/cn`, `utils/control-styles` y `utils/field-state`; peer `@angular/forms` si usa `field-state`; sin dependencias de npm; `x-prompt` y README de la CLI. Lo usa el Block `otp-01` (B.5).
  - Textos: No aplica (el nombre y el mensaje son del usuario).
  - Trampas conocidas:
    - El input real transparente tiene que seguir siendo enfocable y legible para el lector (nada de `display: none`, `visibility: hidden` ni `aria-hidden`); lo que se oculta son las casillas.
    - `outline-none` en el input anula el anillo de foco (5.11): el anillo va en la casilla activa, como el diseño.
    - El anillo de error del diseño usa `--mimi-destructive-soft` (nombre viejo): en Mimi es `--mimi-destructive-ring` (T.1).
    - El pegado puede traer espacios o guiones («246 810»): se quitan los que no son dígitos, como el diseño.
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, con pruebas.
    - Pegado del código entero, borrar hacia atrás y escribir en el orden; `autocomplete="one-time-code"` e `inputmode="numeric"` en el input real.
    - Teclado completo (nativo) y foco visible en la casilla activa; movimiento reducido sin animaciones.
    - Estados claro, oscuro, deshabilitado, completo y error.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; keyframes con respaldo.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi input-otp` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después (componente lazy).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: un solo input real con casillas visuales (lo que muestra el diseño) o un input por casilla. Con un input, el lector lee un campo con el código entero, y el pegado, el borrado y el autocompletado del SMS funcionan sin código extra. Con varios inputs, el lector anuncia cada casilla como un campo aparte (cada una necesita su nombre, por ejemplo «Dígito 1 de 6»), y el pegado, el borrado hacia atrás y el autocompletado del SMS hay que reprogramarlos. Recomendación: un solo input real, como el diseño.
    - PENDIENTE DE DECIDIR: ¿solo dígitos o también letras (algunos códigos son alfanuméricos)? El diseño solo usa dígitos. Recomendación: dígitos por defecto y una opción para alfanumérico, con `inputmode` acorde.
- [ ] G2.6 Tags Input. Diseño: `F3 Archivos Tags Toggle Color`.
  - v0.3.0 · Tamaño M · Depende de: G2.0, G2.0b, 2.4 (Badge, hecha), 2.2 (Input, hecha) · Bloquea: G2.8
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración HeroUI y PrimeNG Chips, depende de Badge e Input; «El valor vive en Mimi»); spec 8 (`FormValueControl`, `MIMI_FIELD_CONTROL`, `touch`); spec 13 (su tabla, de la G2.0; los globales `--mimi-chip` y `--mimi-chip-foreground`, que trae la G2.0b; la tabla de Badge); la 2.4 Badge y la 2.2 Input en `docs/historial/plan-fase-0-3.md`; la G1.8 Toast en `docs/historial/plan-grupo-1.md` (anuncios con el `LiveAnnouncer` del CDK).
  - Diseño: `F3 Archivos Tags Toggle Color`, sección «10 · Tags Input» (marcado, `tags()`, `MAX_TAGS` y `tagStates` del script). Lo que muestra:
    - Una caja con las etiquetas como chips («#angular», fondo `--mimi-chip`, texto `--mimi-chip-foreground`) y un botón de quitar en cada una (ícono `x` de 12px, `aria-label` «Quitar <etiqueta>», escala 0,85 al pulsar), y un `<input>` al final; un clic en la caja enfoca el input.
    - Arriba a la derecha, el contador «3/5» (`tabular-nums`; en `warning-soft-foreground` al llegar al máximo).
    - Agregar: Enter o una coma al final del texto. La etiqueta se normaliza: sin espacios a los lados, en minúsculas, sin `#` al principio ni la coma del final.
    - Duplicado: no se agrega y el mensaje dice «"<etiqueta>" ya está en la lista.» (borde y anillo de error, `aria-invalid`).
    - Máximo de 5: el input se deshabilita, el placeholder pasa a «Límite alcanzado», el borde va mezclado con `warning` y el mensaje dice «Llegaste al límite de 5 etiquetas. Quita una para agregar otra.».
    - Backspace con el input vacío quita la última.
    - Debajo, un mensaje en un elemento con `role="status"`: la ayuda («Enter o coma para agregar · Backspace quita la última»), el error o el aviso del límite.
    - Estados: normal, hover, foco, deshabilitado, con error y límite alcanzado.
  - Objetivo: escribir varias etiquetas en un campo, verlas como chips y quitarlas, con el teclado y en los tres sistemas de formularios.
  - Alcance: incluye agregar con Enter y coma, quitar con el botón y con Backspace, duplicados, máximo con contador, normalización, estados del diseño y formularios. Propuestas tuyas, marcadas así: pegado de varias etiquetas a la vez (no está en el diseño), validación por etiqueta con su mensaje (el diseño solo muestra la de duplicados), navegación con flechas entre etiquetas (no está en el diseño), anuncio al agregar y quitar con el `LiveAnnouncer` (el diseño solo tiene la región `role="status"` del mensaje). NO incluye: sugerencias o autocompletado (eso es el Combobox múltiple, G2.8), etiquetas de colores.
  - Base técnica: ninguna. `@angular/aria` 22.2.3 no tiene un patrón de etiquetas (exporta `accordion`, `combobox`, `grid`, `listbox`, `menu`, `tabs`, `toolbar` y `tree`) y la APG tampoco tiene uno exacto. Anuncios: el `LiveAnnouncer` de `@angular/cdk/a11y` (API documentada, la misma que usan Toast y Pagination).
    - PENDIENTE DE DECIDIR: navegación con el teclado entre etiquetas. Opciones: (a) sin flechas: cada botón de quitar es una parada de Tab y Backspace quita la última (lo que muestra el diseño); (b) ← con el cursor al principio del input lleva el foco a la última etiqueta, ←/→ se mueven entre etiquetas (`FocusKeyManager` del CDK, como la G1.10) y Supr o Backspace quita la enfocada; (c) la lista de etiquetas como un `ngGrid` de aria. Recomendación: (a) en esta versión (es lo del diseño y no agrega un patrón propio), con (b) anotado para cuando lo pidan.
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres): `<mimi-tags-input [(value)] [max] [separators] [allowDuplicates] [normalize] [validate] [disabled] [readonly] placeholder aria-label class>`. `value`: `string[]`. `normalize`: función; por defecto, la del diseño. `validate`: función que devuelve un mensaje o nada. `class` va a la caja. Estado: `data-state`, `data-invalid`, `data-full`.
  - Formularios: control propio con `FormValueControl<string[]>` (spec 8) y `MIMI_FIELD_CONTROL`; pruebas con `[formField]`, `formControlName` y `[(ngModel)]` (agregar, quitar, valor desde el formulario, `disabled`, validadores del formulario como «al menos una»). `touch` al salir el foco de la caja. Lo que se escribe y no se agregó no es parte del valor.
  - Tokens: tabla en la spec 13 (tarea G2.0); los globales `--mimi-chip` y `--mimi-chip-foreground` con valor de respaldo (G2.0b). Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts`.
  - Teclado y accesibilidad: Enter y coma agregan; Backspace con el input vacío quita la última; Tab recorre el input y los botones de quitar (según la pregunta de la navegación). Cada botón con su nombre («Quitar angular»). El contador y el mensaje asociados al input con `aria-describedby`. Anuncios: al agregar y al quitar, con el `LiveAnnouncer` en `polite` («angular agregada», «angular quitada»); los errores y el límite, en la región `role="status"` del diseño. Al quitar con el botón, el foco va al input (no a `body`). En test: cada tecla, duplicado, máximo, anuncios, foco después de quitar. A mano: NVDA.
  - Ejemplos del showcase: el del diseño (proyecto, máximo 5), los estados (deshabilitado, con error, límite alcanzado), formularios (los tres sistemas, con un validador «al menos una»), con `class`, claro y oscuro.
  - CLI: ítem `tags-input` en `registry.json`, con `utils/cn`, `utils/control-styles` y `utils/field-state`; peer `@angular/cdk` (por el `LiveAnnouncer`) y `@angular/forms` si usa `field-state`; `x-prompt` y README de la CLI.
  - Textos: sí. «Quitar {etiqueta}», «{etiqueta} ya está en la lista.», el aviso del límite, la ayuda y los anuncios → `MIMI_TAGS_INPUT_TEXT` (inglés) y `MIMI_TAGS_INPUT_TEXT_ES`, con `provideMimiTagsInputText`.
  - Trampas conocidas:
    - Un botón enfocado que desaparece (la etiqueta quitada) deja el foco en `body` (como el botón que se deshabilita, M.1): hay que mover el foco antes.
    - Con el máximo alcanzado, el diseño deshabilita el input: si tenía el foco, el foco se pierde. Mejor `readonly` o `aria-disabled` en el input que `disabled` nativo.
    - La coma del final se procesa en el evento `input` (el diseño lo hace con un `setTimeout`, que en zoneless no hace falta: el estado es de signals).
    - El anillo de error del diseño usa `--mimi-destructive-soft` (nombre viejo): en Mimi es `--mimi-destructive-ring` (T.1).
    - `outline-none` en el input anula el anillo de foco (5.11): el anillo va en la caja (`focus-within`).
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, con pruebas.
    - Teclado completo según lo decidido; foco visible; el foco no cae a `body` al quitar una etiqueta (prueba).
    - Estados claro, oscuro, deshabilitado, error, solo lectura y límite alcanzado.
    - Duplicados, máximo, normalización y validación por etiqueta, con pruebas.
    - Anuncios al agregar y quitar con el `LiveAnnouncer` (prueba con un `LiveAnnouncer` simulado).
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Textos con `provideMimiTagsInputText` y su versión `_ES`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi tags-input` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después.
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: navegación con el teclado entre etiquetas (ver «Base técnica»).
    - PENDIENTE DE DECIDIR: la normalización del diseño (minúsculas y sin `#`) ¿es la de Mimi por defecto o solo la del ejemplo? Recomendación: por defecto solo quitar espacios a los lados; minúsculas y `#` en el ejemplo, con `normalize`.
    - PENDIENTE DE DECIDIR: pegado de varias etiquetas (por ejemplo, «angular, diseño, ventas»): ¿se separan por los separadores y se agregan todas? Recomendación: sí, respetando duplicados y máximo, y anotarlo en `correcciones-pendientes.md`.
    - PENDIENTE DE DECIDIR: ¿el chip es una pieza compartida con el Combobox múltiple (G2.8), por ejemplo un ítem `chip` de la CLI como el ítem `menu` de la G1.4? Recomendación: sí, extraerlo en esta tarea si la G2.8 lo va a usar (ver G2.8).
- [ ] G2.7 Slider (rango doble). Diseño: `F3 Slider OTP Numero Mascara`.
  - v0.3.0 · Tamaño L (propuesta de división en «Preguntas abiertas») · Depende de: G2.0, G2.0b, G1.2 (Tooltip, hecha: solo sus tokens `--mimi-tooltip`, para la burbuja) · Bloquea: G2.12
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración shadcn y HeroUI; dice «depende de Tooltip», que se corrige en esta tarea; «El valor vive en Mimi»); spec 8 (`FormValueControl`); spec 13 (su tabla, de la G2.0; los globales `--mimi-track`, `--mimi-track-fill` y `--mimi-thumb` de la G2.0b; la tabla de Tooltip); la G1.2 Tooltip y la G1.10 mimi-toolbar en `docs/historial/plan-grupo-1.md` (cuándo abre el tooltip; foco por código); la decisión compartida «Convención de valor simple/múltiple» («Decisiones pendientes»).
  - Diseño: `F3 Slider OTP Numero Mascara`, sección «4 · Slider» (marcado y la función `sl()` del script). Lo que muestra:
    - Pulgares propios con `role="slider"` (no `<input type="range">`), `tabindex` 0 (−1 deshabilitado), `aria-labelledby` a la etiqueta, `aria-label` «Mínimo» y «Máximo» en el rango, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` (el valor formateado, por ejemplo «$300» o «3 personas»), `aria-disabled` y `aria-invalid`.
    - Teclado: ← y ↓ restan un paso, → y ↑ suman uno; Re Pág y Av Pág, diez pasos; Inicio y Fin, mínimo y máximo.
    - Puntero: `pointerdown` en la pista mueve el pulgar más cercano y lo arrastra con `setPointerCapture`; `touch-action: none` en la pista.
    - Rango: dos pulgares que no se cruzan (el de abajo no pasa al de arriba y viceversa).
    - Medidas: pista de 6px (`--mimi-track`, radio 999px), relleno `--mimi-track-fill` (`destructive` con error), pulgar de 20px con fondo `--mimi-thumb` y borde de 2px del color del relleno; foco con anillo de 2px del fondo y 4px de `ring`; al arrastrar, escala 1,12 y anillo `ring-soft` de 8px; marcas de 6px con su texto de 12px debajo.
    - Burbuja con el valor: un `span` dentro del pulgar (no el componente Tooltip), con los colores `--mimi-tooltip`, que se ve al arrastrar, con el foco o siempre (ejemplo «tooltip fijo»).
    - Ejemplos: «Volumen», «Precio por noche» (rango), «Tamaño del equipo» (con marcas), «Opacidad · tooltip fijo», hover, foco, deshabilitado y «Rango de edad» con error («El rango debe abarcar al menos 5 años.»).
  - Objetivo: elegir un valor o un rango arrastrando o con el teclado, con marcas y el valor visible, en los tres sistemas de formularios.
  - Alcance: incluye un valor y rango doble, `min`, `max`, `step`, marcas con texto, formato del valor, la burbuja, estados del diseño y formularios. Propuestas, no están en el diseño: orientación vertical, derecha a izquierda (RTL), distancia mínima entre pulgares (el ejemplo de error la pide como validación). NO incluye: más de dos pulgares, pasos no uniformes.
  - Base técnica: `@angular/aria` 22.2.3 no tiene un patrón de slider (exporta `accordion`, `combobox`, `grid`, `listbox`, `menu`, `tabs`, `toolbar` y `tree`). Patrones de la APG: «Slider» y «Slider (Multi-Thumb)».
    - PENDIENTE DE DECIDIR (la decisión central de la tarea). Opciones:
      - (a) Un `<input type="range">` nativo: accesibilidad, teclado, RTL y táctil del navegador sin código; el paso nativo; marcas con `<datalist>` (casi sin estilo); el pulgar y la pista solo se estilan con pseudoelementos por navegador (`::-webkit-slider-thumb`, `::-moz-range-thumb`), así que la burbuja y el anillo del diseño son difíciles; **no sirve para el rango doble** (un input es un valor).
      - (b) Dos `<input type="range">` nativos superpuestos para el rango: cada pulgar sigue siendo nativo y accesible; el cruce hay que impedirlo por código; el input de arriba recibe todos los clics, así que hace falta `pointer-events: none` en la pista y `auto` solo en los pulgares (con pseudoelementos, frágil entre navegadores); los mismos límites de estilo que (a).
      - (c) Pulgares propios con `role="slider"` (lo que hace el diseño): estilo completo (burbuja, anillos, marcas); el teclado (flechas, Re Pág/Av Pág, Inicio/Fin), el RTL, la orientación vertical, el paso y el arrastre táctil (eventos de puntero y `touch-action: none`) los programa Mimi; el rango doble sale natural (dos pulgares y la regla de no cruzarse); más código y más pruebas.
      - (d) Un `<input type="range">` nativo **invisible por pulgar**, encima de una pista y unos pulgares que dibuja Mimi (el enfoque de Angular Material). Comprobado el 03/11/2026 en su documentación (`src/material/slider/slider.md` en GitHub, angular/components): «`MatSlider` uses an internal `<input type="range">` to provide an accessible experience»; el rango se hace con dos pulgares (`matSliderStartThumb` y `matSliderEndThumb`), y «the `matSliderStartThumb` cannot have a value greater than that of the `matSliderEndThumb`»; las flechas se invierten en RTL; es compatible con `FormField`, `FormsModule` y `ReactiveFormsModule`; el valor sobre el pulgar es opcional (`discrete`). En su CSS (`slider.scss`), el input tiene `opacity: 0` y `position: absolute`, la pista y el pulgar dibujados tienen `pointer-events: none`, y una clase (`mat-mdc-slider-input-no-pointer-events`) quita los eventos de puntero a un input en el rango. La documentación no menciona la orientación vertical.
      - Comparación de (d) con (c):
        - Teclado: (d) lo da el navegador (flechas, Re Pág/Av Pág e Inicio/Fin; cuánto salta Re Pág/Av Pág lo decide cada navegador y no está comprobado que sean los diez pasos del diseño: el spike lo mide); (c) lo programa Mimi, igual en todos los navegadores y como el diseño (diez pasos).
        - RTL: (d) lo da el navegador en el input; Mimi tiene que dibujar la pista y el pulgar en el mismo sentido. (c): Mimi invierte flechas y posición.
        - Arrastre táctil: (d) lo da el input nativo (el dedo mueve el input invisible y Mimi pinta su posición). (c): eventos de puntero, `setPointerCapture` y `touch-action: none`, programados y probados por Mimi.
        - Rango doble y cruce: (d): dos inputs del ancho de la pista que se tapan; hay que decidir cuál recibe el puntero (Material lo hace quitando los eventos de puntero a uno, con código) e impedir el cruce por código. (c): un solo manejador de puntero elige el pulgar más cercano (como el diseño) y el cruce se impide en el mismo cálculo.
        - Formularios: igual en las dos: un control propio con `FormValueControl` (spec 8) que contiene los inputs; con (d), los inputs internos no llevan `formControlName` ni `ngModel` (el valor vive en Mimi).
        - Estilado entre navegadores: (d) no estila el input (es invisible), así que no hay pseudoelementos por navegador; lo que se ve lo dibuja Mimi, como en (c). Hay que mantener alineados el input invisible y el pulgar dibujado (el ancho del pulgar cambia dónde cae cada valor en el input nativo).
        - Accesibilidad: (d): el lector anuncia un control de rango nativo, con `aria-valuetext` puesto en el input; (c): `role="slider"` con todos los `aria-value*` puestos por Mimi.
      - Recomendación: (d) si el spike del primer día muestra que el cruce de pulgares y la elección del pulgar con el puntero funcionan en Chrome, Firefox y Safari (táctil incluido); si no, (c), la de la Tanda C. (a) y (b) quedan descartadas por el estilo (pseudoelementos) y porque (a) no hace el rango doble. Cambia respecto de la Tanda C: (d) da teclado, RTL y táctil nativos sin el problema de estilado de (a) y (b).
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres): `<mimi-slider [(value)] [min] [max] [step] [marks] [format] [showValue] [disabled] aria-label class>`. El tipo de `value` (un número o un rango) y el nombre del modo de rango: «Convención de valor simple/múltiple» («Decisiones pendientes»). `format`: función que da el texto del valor (`aria-valuetext` y burbuja). `showValue`: cuándo se ve la burbuja (al arrastrar y con el foco, o siempre). `class` va al contenedor.
  - Formularios: control propio con `FormValueControl` (spec 8; el tipo según la convención) y `MIMI_FIELD_CONTROL`; pruebas con `[formField]`, `formControlName` y `[(ngModel)]` (teclado, arrastre, valor desde el formulario fuera de rango, `disabled`, error de rango como validador del formulario). `touch` al soltar o al salir el foco.
  - Tokens: tabla en la spec 13 (tarea G2.0); los globales `--mimi-track`, `--mimi-track-fill` y `--mimi-thumb` con valor de respaldo (G2.0b); la burbuja con los de Tooltip (`--mimi-tooltip`, decidido). Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts`.
  - Teclado y accesibilidad (APG «Slider» y «Slider (Multi-Thumb)»): las teclas del diseño; en RTL, ← y → se invierten (propuesta); en vertical, ↑ suma (propuesta). Cada pulgar es una parada de Tab. Nombre: `aria-labelledby` a la etiqueta y, en el rango, «Mínimo» y «Máximo» (textos). `aria-valuetext` con el valor formateado. La burbuja no se anuncia (el valor ya está en `aria-valuetext`). En test: cada tecla, que los pulgares no se crucen, paso y límites, arrastre simulado con eventos de puntero, RTL. A mano: NVDA (lee nombre y valor), táctil en un móvil.
  - Ejemplos del showcase: los del diseño (volumen, precio por noche con rango, tamaño del equipo con marcas, opacidad con burbuja fija, deshabilitado, rango de edad con error), formularios, con `class`, claro y oscuro.
  - CLI: ítem `slider` en `registry.json`, con `utils/cn`, `utils/control-styles` y `utils/field-state`; sin `tooltip` en `registryDependencies` (la burbuja es propia); `x-prompt` y README de la CLI.
  - Textos: sí. «Mínimo» y «Máximo» (los nombres de los pulgares del rango) → `MIMI_SLIDER_TEXT` (inglés) y `MIMI_SLIDER_TEXT_ES`, con `provideMimiSliderText`.
  - Trampas conocidas:
    - El pulgar del diseño tiene `outline: none` y marca el foco con `box-shadow`; en Tailwind 4, `outline-none` anula `focus-visible:outline-2` (5.11, `focus-styles.spec.ts`): el foco visible tiene que quedar con una de las dos, comprobado.
    - El foco movido por código y el arrastre: al empezar a arrastrar, el pulgar tiene que recibir el foco (el diseño no lo hace: solo marca el arrastre), para que el teclado siga desde ahí (lección del foco movido por código, G1.10).
    - El valor vive en Mimi (spec 4): un valor fuera de rango que llega del formulario se pinta acotado sin reescribir el modelo (Pagination, G1.11).
    - Mimi Tooltip (G1.2) abre con el puntero encima o con el foco de teclado, después de un retraso, no se muestra en táctil y no tiene un modo «siempre visible»: no hace lo que muestra la burbuja del diseño. Por eso la burbuja es propia (decidido).
    - Con la opción (d): el input invisible tiene que medir lo mismo que la pista dibujada y el pulgar dibujado tiene que caer donde el navegador pone el valor (el ancho del pulgar nativo cambia el recorrido); si se desalinean, el clic no cae en el valor que se ve.
    - Deshabilitado: el diseño pone `tabindex="-1"` y `aria-disabled`; el foco no puede quedar en un pulgar que se deshabilita (M.1).
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, en un valor y en rango, con pruebas.
    - Teclado completo según los patrones de la APG (flechas, Re Pág/Av Pág, Inicio/Fin), con RTL si se decide; foco visible en cada pulgar.
    - Los pulgares del rango no se cruzan; el valor respeta `step`, `min` y `max`, con pruebas.
    - Arrastre con el puntero y táctil (`touch-action: none`), con prueba de eventos de puntero y prueba manual en un móvil.
    - `aria-valuenow`, `aria-valuemin`, `aria-valuemax` y `aria-valuetext` con el valor formateado; nombres «Mínimo» y «Máximo» en el rango.
    - Estados claro, oscuro, deshabilitado y error.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Textos con `provideMimiSliderText` y su versión `_ES`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - Spec 4 corregida: el Slider ya no depende de Tooltip (tabla del Grupo 2); la burbuja usa los tokens `--mimi-tooltip` (decidido el 03/11/2026).
    - `registry.json`, pruebas de la CLI y `ng g mimi slider` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después.
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: la base técnica (ver arriba).
    - Decidido (03/11/2026, el usuario): la burbuja del valor es propia, con los tokens de Tooltip (`--mimi-tooltip`), no el componente Tooltip. La spec 4 todavía dice que el Slider depende de Tooltip: se corrige en esta tarea (criterio de hecho), no antes.
    - PENDIENTE DE DECIDIR: orientación vertical y RTL (no están en el diseño). Recomendación: RTL sí (es corregir el sentido de las flechas y de la posición); vertical, más adelante.
    - PENDIENTE DE DECIDIR: la distancia mínima entre pulgares del ejemplo de error, ¿es una entrada del Slider (`minRange`) o un validador del formulario? Recomendación: un validador del formulario (el diseño la muestra como error, no como límite del arrastre).
    - PENDIENTE DE DECIDIR (tamaño L): dividir en G2.7a «Slider de un valor (teclado, arrastre, marcas, burbuja y formularios)» y G2.7b «Rango doble (dos pulgares sin cruce)», con G2.7b dependiendo de G2.7a; el Color Picker (G2.12) dependería solo de G2.7a. Recomendación: dividir.
- [ ] G2.8 Combobox/Autocomplete (múltiple con chips). Diseño: `F3 Combobox Fechas Hora`.
  - v0.3.0 · Tamaño L (propuesta de división en «Preguntas abiertas») · Depende de: G2.0, G2.0b, G1.1 (Popover, hecha), G1.5 (lógica de lista de Select, hecha), G2.6, M.2 (provisional: se quita si el spike del primer paso no reproduce #33974) · Bloquea: G3.3, M.9
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración shadcn Combobox y PrimeNG AutoComplete; depende de Popover, la lógica de lista de Select y Tags Input; «Base técnica»; «Rodeos de aria»: los del Select valen aquí); spec 8 (`FormValueControl`); spec 13 (su tabla, de la G2.0; la de Select); la G1.5 Select y la G1.5b en `docs/historial/plan-grupo-1.md`; la G2.6 Tags Input (los chips); la decisión compartida «Convención de valor simple/múltiple» («Decisiones pendientes»); angular.dev, guide/aria/combobox («Autocomplete») y guide/aria/multiselect.
  - Diseño: `F3 Combobox Fechas Hora`, sección «1 · Combobox / Autocomplete». Lo que muestra:
    - Simple («Ciudad»): input con `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` y `autocomplete="off"`, con ícono al principio y chevron; lista `role="listbox"` con opciones (`role="option"`, `aria-selected`) con la coincidencia resaltada (`<mark>`), un texto secundario y el check en la elegida; una opción «Crear "<texto>"» al final; «Sin coincidencias.».
    - Múltiple («Tecnologías»): chips dentro del campo con botón de quitar, input con `role="combobox"`, lista con `aria-multiselectable="true"` y una casilla de check en cada opción; «Crear "<texto>"»; ayuda «Enter agrega · Backspace quita el último chip».
    - Cargando: spinner en el campo y la lista con `aria-busy="true"`, «Buscando ciudades…» y renglones de carga.
    - Sin resultados: bloque con `role="status"`, ícono, «Sin resultados para "Tokio"» y «Revisa la ortografía o crea la ciudad.».
    - Estados: normal, hover, foco, deshabilitado y con error («Elige al menos una más.»); el múltiple cerrado muestra el primero y «+2».
  - Objetivo: un campo donde se escribe para filtrar una lista y elegir una opción o varias (con chips), con opción de crear valores nuevos y búsqueda en el servidor.
  - Alcance: incluye simple y múltiple, filtrado sin tildes ni mayúsculas (como Select), resaltado, crear un valor nuevo, carga asíncrona (`loading` y una salida con lo que se escribe), sin resultados, chips en el múltiple, el resumen «+N» cerrado, estados del diseño y formularios. Modo «lista» (`aria-autocomplete="list"`, el del diseño); el modo de autocompletar dentro del texto (`inline`) no está en el diseño (propuesta tuya). NO incluye: grupos de opciones (Select los tiene; el diseño no los muestra aquí), arrastrar chips.
  - Base técnica: `@angular/aria` 22.2.3: Combobox + Listbox, como el Select (spec 4, «Base técnica»). Comprobado en `node_modules/@angular/aria`: el listbox tiene la entrada `multi` (selección múltiple), y angular.dev documenta el ejemplo «Autocomplete» del combobox y la guía «Multiselect». Sin entry points `private` ni símbolos `_`/`ɵ`.
    - **Arreglo #33974 (comprobado el 03/11/2026 en GitHub, angular/components):** `ComboboxPopup` leía su entrada requerida `combobox` en `ngOnDestroy`, así que destruir el panel antes de su primera detección de cambios lanzaba `NG0950`. Se fusionó el 20/10/2026 y llega en aria 22.2.4; el repo tiene 22.2.3. El Select no lo sufre porque su panel no se destruye antes de tiempo (`preserveContent` y el popup por fuera del overlay, spec 4). El Combobox podría: un panel que se crea y se destruye en el mismo ciclo (resultados asíncronos, «Crear», cerrar muy rápido, pruebas). Esto es un razonamiento, no algo reproducido; por eso la dependencia de M.2 es provisional.
    - **Primer paso de la tarea: spike de #33974.** Con aria 22.2.3 (la del repo), una prueba que destruya el `ngComboboxPopup` antes de su primera detección de cambios en los casos del Combobox (panel condicional con `@if`, resultados asíncronos que llegan y se van, cerrar enseguida de abrir) y compruebe si lanza `NG0950`. Después, la misma prueba con aria 22.2.4 (en una rama o un proyecto aparte, sin cambiar el repo) para ver si se arregla.
      - Si se reproduce en 22.2.3 y se arregla en 22.2.4: la dependencia de M.2 se queda, y M.2 se hace antes de seguir.
      - Si **no** se reproduce: se quita M.2 de «Depende de» de esta tarea y G2.8 del «Bloquea» de M.2, y se anota aquí el resultado del spike con la fecha.
      - Si se reproduce y 22.2.4 no lo arregla: se detiene la tarea y se lleva al usuario (un rodeo nuevo en «Rodeos de aria» de la spec 4).
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres): `<mimi-combobox [(value)] [options] [multiple] [creatable] [loading] [filterWith] placeholder [disabled] aria-label class panelClass (searchChange) (create)>`. `multiple` (booleano; decidido el 03/11/2026, el mismo nombre que G2.1). El tipo de `value`: «Convención de valor simple/múltiple». `options` como en Select (`MimiOption` y `MimiOptionGroup`). `class` va al campo y `panelClass` al panel (regla de la spec 4, como Select).
  - Formularios: control propio con `FormValueControl` (spec 8) y `MIMI_FIELD_CONTROL`; pruebas con `[formField]`, `formControlName` y `[(ngModel)]` en simple y en múltiple (elegir, quitar chip, crear, valor desde el formulario, `disabled`, error). Lo que se escribe en el campo no es el valor hasta que se elige o se crea. `touch` al salir el foco del campo y del panel (como Select).
  - Tokens: tabla en la spec 13 (tarea G2.0); los de Select donde coincidan; los chips, los de la G2.6 (`--mimi-chip`). Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts`.
  - Teclado y accesibilidad (APG «Combobox» con lista): ↓ abre y baja, ↑ sube, Enter elige (en múltiple, alterna y no cierra), Escape cierra (o borra lo escrito si está cerrado; ver preguntas), Alt+↓ y Alt+↑ como en Select; Backspace con el campo vacío quita el último chip (diseño); «Crear» se elige como una opción más. Anuncios: cantidad de resultados y «Sin resultados» con la región `role="status"` del diseño (o el `LiveAnnouncer`); al agregar y quitar un chip, como Tags Input. En test: cada tecla, filtrado, crear, carga, chips. A mano: NVDA (activa con `aria-activedescendant`, resultados anunciados).
  - Ejemplos del showcase: ciudad (simple, con ícono y texto secundario), tecnologías (múltiple con chips), crear, carga desde un servidor simulado, sin resultados, los estados (deshabilitado, con error), formularios, con `class` y `panelClass`, claro y oscuro.
  - CLI: ítem `combobox` en `registry.json`, con peers `@angular/aria` y `@angular/cdk` (la CLI instala aria en la versión exacta del cdk, spec 5), `cssImports` del overlay del CDK, `utils/overlay`, `utils/cn`, `utils/control-styles`, `utils/field-state`, las utilidades nuevas de lista (ver «Preguntas abiertas»: filtro, resaltado y lista) y lo que se decida compartir con Tags Input; sin depender del ítem `select`; `x-prompt` y README de la CLI.
  - Textos: sí. «Crear "{texto}"», «Sin resultados para "{texto}"», la ayuda, «Cargando…» y los anuncios → `MIMI_COMBOBOX_TEXT` (inglés) y `MIMI_COMBOBOX_TEXT_ES`, con `provideMimiComboboxText` (los de Select no se tocan en la 0.3.0).
  - Trampas conocidas:
    - Todos los rodeos de aria del Select valen aquí (spec 4, «Rodeos de aria»): el listbox no avisa al combobox al elegir; aria desmarca la opción elegida al volver a elegirla y vacía el valor al filtrar o con «cargando» (el valor vive en Mimi); aria vuelve a activar la opción elegida cuando cambian las opciones (`keepFirst`); el puntero no activa la opción; `preserveContent` para la animación de salida; el `ngComboboxPopup` por fuera del overlay. Cada uno con su prueba de alarma.
    - #33974 (`NG0950` al destruir el panel antes de tiempo): el spike del primer paso dice si hace falta M.2.
    - No tocar los archivos de Select en la 0.3.0 (decidido el 03/11/2026): el Combobox usa utilidades nuevas, y la migración del Select es la M.9.
    - El clic en el panel no tiene que mover el foco (`mousedown.preventDefault`, rodeo del Select); el diseño ya usa `onMouseDown` en las opciones.
    - El anillo de error del diseño usa `--mimi-destructive-soft` (nombre viejo): en Mimi es `--mimi-destructive-ring` (T.1).
    - Un chip que se quita con el foco encima deja el foco en `body` (ver G2.6).
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, en simple y en múltiple, con pruebas.
    - Teclado completo según el patrón Combobox de la APG; foco visible; el foco no cae a `body` al quitar un chip.
    - Estados claro, oscuro, deshabilitado, error, cargando y sin resultados.
    - Crear un valor nuevo; búsqueda en el servidor con `loading`; filtrado sin tildes ni mayúsculas; resaltado. Con pruebas.
    - Pruebas de alarma de aria para cada rodeo que use (como el Select, G1.5b).
    - El resultado del spike de #33974 anotado en «Base técnica», y la dependencia de M.2 quitada o confirmada.
    - Ningún archivo de `packages/ui-core/src/lib/components/select/` cambiado (`git diff` vacío en esa carpeta); las utilidades nuevas, con sus pruebas.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Textos con `provideMimiComboboxText` y su versión `_ES`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 (también «Rodeos de aria» si aparecen nuevos) y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi combobox` probado en un proyecto limpio (aria y cdk en la misma versión, `@import` del overlay una sola vez).
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después (componente lazy: aria y el CDK no pueden entrar al JS inicial).
  - Preguntas abiertas:
    - Decidido (03/11/2026, el usuario): **los archivos de Select no se tocan en la 0.3.0.** El Combobox usa utilidades nuevas (filtro sin tildes, resaltado de la coincidencia y lista con «cargando» y «sin resultados»), hechas a partir de lo que hoy está en `select.ts` (`normalize()`, `MimiSelectHighlight`, `MimiSelectList`). Una tarea aparte, la M.9, migra el Select a esas utilidades después, con nota en el CHANGELOG. Hasta la M.9, el código queda repetido en Select y en las utilidades nuevas.
    - PENDIENTE DE DECIDIR: dónde viven las utilidades nuevas y qué incluyen. Opciones: (a) un ítem compartido de la CLI (como el ítem `menu` que se sacó en la G1.4 para los dos menús), con el filtro, el resaltado, la lista y los tipos de opción (`MimiOption`, `MimiOptionGroup`, hoy en Select), que el Select adopta en la M.9; (b) archivos dentro de `utils/`. Recomendación: (a), con nombres que no choquen con los de Select (que sigue exportando los suyos hasta la M.9).
    - PENDIENTE DE DECIDIR: qué se comparte con Tags Input (G2.6): el chip con su botón de quitar, Backspace para quitar el último y los anuncios. Recomendación: el chip como pieza compartida (ver la última pregunta de G2.6), sin reutilizar Tags Input entero (Tags Input no tiene lista).
    - PENDIENTE DE DECIDIR: ¿crear un valor nuevo es parte de Mimi (`creatable` y una salida `(create)` con el texto, que el usuario agrega a `options`) o lo hace el usuario? Recomendación: `creatable` con `(create)`; Mimi no inventa la opción, la agrega el usuario.
    - PENDIENTE DE DECIDIR: Escape con el panel cerrado, ¿borra lo escrito (APG) o no hace nada? Recomendación: borrar lo escrito, como la APG.
    - PENDIENTE DE DECIDIR (tamaño L): dividir en G2.8a «Combobox simple (filtrado, crear, carga asíncrona y formularios)» y G2.8b «Combobox múltiple con chips», con G2.8b dependiendo de G2.8a y de G2.6. Recomendación: dividir.
- [ ] G2.9 Date Picker y Date Range. Diseño: `F3 Combobox Fechas Hora`.
  - v0.3.0 · Tamaño L (propuesta de división en «Preguntas abiertas») · Depende de: G2.0, G2.0b, G1.1 (Popover, hecha), 2.1 (Button, hecha) · Bloquea: —
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración shadcn Calendar y PrimeNG; depende de Popover y Button; «El valor vive en Mimi»); spec 8 (`FormValueControl`); spec 13 (su tabla o sus tablas, de la G2.0: ver su pregunta «¿una tabla o dos?»; el global `--mimi-range` de la G2.0b; la tabla de Popover); la G1.1 Popover en `docs/historial/plan-grupo-1.md` (foco al abrir y al cerrar, `role="dialog"`, ubicación `'inline'`); la G2.2 Number Input (`LOCALE_ID` y entrada `locale`); APG, patrón «Date Picker Dialog»; angular.dev, guide/aria/grid y el ejemplo «Datepicker grid» de guide/aria/combobox (lo encontró el MCP de Angular el 03/11/2026; no pude leer su contenido: leerlo al empezar).
  - Diseño: `F3 Combobox Fechas Hora`, sección «2 · Date Picker y Date Range» (marcado y las funciones `cells()`, `datePicker()` y `dateRange()` del script). Lo que muestra:
    - Date Picker («Fecha de entrega · solo días hábiles»): un **botón** disparador (no un campo para escribir) con `aria-haspopup="dialog"` y `aria-expanded`, ícono `calendar` y la fecha con formato «30 sep 2026»; un panel `role="dialog"` («Elegir fecha») con «Anterior», el título del mes («Septiembre 2026», un botón que cambia la vista: días → meses → años), «Siguiente», la cuadrícula `role="grid"` de 7 columnas × 6 filas que empieza el lunes («L M X J V S D»), y un pie con «Hoy» e «Ir a hoy».
    - Cada día es un botón de 36px con `aria-label` («30 de septiembre de 2026», con «, no disponible» si está deshabilitado), `aria-selected`, `aria-current="date"` en hoy (con un punto debajo y un borde fino), `disabled` en los no disponibles (opacidad 0,38 y tachado), los días de otro mes en `muted-foreground` con opacidad 0,55.
    - Vistas de meses (12 en 3 columnas) y de años (12 por página), con `aria-pressed` en el elegido.
    - Date Range («Periodo del informe · sin fechas futuras»): campo con ícono `calendar-range`, «24 sep 2026 – 30 sep 2026» y el número de días («7 días»); panel con una columna de atajos (Hoy, Ayer, Últimos 7 días, Últimos 30 días, Este mes, Mes pasado; `aria-pressed`) y un mes con la banda del rango en `--mimi-range` y los extremos en `primary`; ayuda «Elige el día final.» / «Haz clic en un día para empezar un periodo nuevo.».
    - Elección del rango: el primer clic marca el inicio; el segundo, el fin (si es anterior al inicio, se intercambian); un tercero empieza otro rango.
    - Estados: normal, hover, foco, deshabilitado y con error («Debe ser un día hábil.»).
    - Las fechas del estado del diseño son cadenas ISO (`'2026-09-30'`), y los textos (meses, días de la semana) están escritos en español en el script.
    - El diseño no maneja el teclado dentro de la cuadrícula (los días son botones con Tab).
  - Objetivo: elegir una fecha o un periodo con un calendario en un panel, en el idioma de la app, con fechas no disponibles y en los tres sistemas de formularios.
  - Alcance: incluye el calendario (días, meses y años), el Date Picker con disparador y panel, el Date Range con atajos y banda, `min`, `max` y una función de fechas no disponibles, el idioma (nombres, formato y primer día de la semana), «Ir a hoy», estados y formularios. Propuestas, no están en el diseño: el teclado de la APG en la cuadrícula, el calendario suelto (sin panel), escribir la fecha a mano. NO incluye: la hora (es G5.2 Time Picker), dos meses a la vez en el rango, calendarios no gregorianos.
  - Base técnica: `@angular/aria` 22.2.3 exporta `grid` (`ngGrid`, `ngGridRow`, `ngGridCell` y `ngGridCellWidget`), con entradas de selección (`enableSelection`, `selectionMode`, `multi`, `selected`), celdas deshabilitadas (`disabled`, `softDisabled`), ajuste de filas y columnas (`rowWrap`, `colWrap`) y modo de foco (`focusMode`), comprobado en `node_modules/@angular/aria/types/grid.d.ts`. El panel, con Popover (G1.1, `role="dialog"`, ya mueve el foco al abrir y lo devuelve al cerrar). Patrón de la APG: «Date Picker Dialog».
    - PENDIENTE DE DECIDIR: la cuadrícula. Opciones: (a) `ngGrid` de aria (el ejemplo «Datepicker grid» de angular.dev lo usa con un combobox; hay que comprobar si da Re Pág/Av Pág para cambiar de mes o si Mimi los agrega); (b) propia con `FocusKeyManager` del CDK o un índice activo (como mimi-toolbar, G1.10). Recomendación: (a), con un spike corto al empezar que lea el ejemplo de angular.dev y pruebe las teclas de la APG; si aria no las da y agregarlas choca con su manejo de teclado, (b). Sin entry points `private` ni símbolos `_`/`ɵ`.
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres): `<mimi-date-picker [(value)] [min] [max] [isDateDisabled] [locale] [format] placeholder [disabled] aria-label class>` y `<mimi-date-range [(value)] [min] [max] [isDateDisabled] [presets] [locale] [disabled] aria-label class>`; quizá `<mimi-calendar>` suelto (ver preguntas). El tipo de la fecha: ver la pregunta «Cómo se guarda la fecha». `isDateDisabled`: función que recibe una fecha y devuelve si no se puede elegir. `presets`: lista de atajos del usuario (texto y rango). `class` va al disparador.
  - Formularios: control propio con `FormValueControl` (spec 8) y `MIMI_FIELD_CONTROL`; pruebas con `[formField]`, `formControlName` y `[(ngModel)]` (elegir, valor desde el formulario, valor fuera de `min`/`max` o no disponible que llega del formulario, `disabled`, error). En el rango, el valor con solo el inicio elegido: ver preguntas. `touch` al cerrar el panel.
  - Tokens: tabla o tablas en la spec 13 (tarea G2.0); `--mimi-range` (G2.0b) con valor de respaldo para la banda; los de Popover para el panel. Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts`.
  - Teclado y accesibilidad (APG «Date Picker Dialog»; propuesta, el diseño no lo hace): en la cuadrícula, ← y → un día, ↑ y ↓ una semana, Inicio y Fin principio y fin de la semana, Re Pág y Av Pág un mes, Mayús + Re Pág/Av Pág un año, Enter o Espacio eligen; Escape cierra y devuelve el foco al disparador (Popover). Al abrir, el foco va al día elegido o a hoy (no al primer botón del panel, que es lo que hace hoy Popover: ver «Trampas»). Una sola parada de Tab en la cuadrícula. Los días con su `aria-label` completo; hoy con `aria-current="date"`; los no disponibles se anuncian como tales. El cambio de mes se anuncia (el título del mes como región viva o con el `LiveAnnouncer`). En test: cada tecla, cambio de mes y de año en los bordes, fechas deshabilitadas, el rango. A mano: NVDA (modo de foco dentro de la cuadrícula).
  - Ejemplos del showcase: los del diseño (fecha de entrega con solo días hábiles, periodo del informe con atajos y sin fechas futuras), los estados (deshabilitado, con error), `min` y `max`, otro idioma (por ejemplo, inglés con la semana desde el domingo), formularios, con `class`, claro y oscuro.
  - CLI: ítems `date-picker` (y `date-range` si va aparte) en `registry.json`, con `popover` y `button` (registryDependencies), peers `@angular/cdk` y, si se usa `ngGrid`, `@angular/aria` (la CLI instala aria en la versión exacta del cdk, spec 5), `utils/cn`, `utils/control-styles` y `utils/field-state`; `x-prompt` y README de la CLI.
  - Textos: sí. «Elegir fecha», «Elegir periodo», «Anterior», «Siguiente», «Cambiar vista», «Hoy», «Ir a hoy», «no disponible», la ayuda del rango, «{n} días» y los atajos por defecto (si los hay) → `MIMI_DATE_PICKER_TEXT` (inglés) y `MIMI_DATE_PICKER_TEXT_ES`, con `provideMimiDatePickerText`. Los nombres de meses y días **no** van en los textos: salen de `Intl.DateTimeFormat` con el idioma.
  - Trampas conocidas:
    - Zonas horarias: un `Date` a medianoche local pasado por `toISOString()` cambia de día en las zonas al oeste de UTC; comparar fechas con `Date` compara también la hora. Por eso importa cómo se guarda la fecha (ver preguntas).
    - El idioma: el diseño escribe en español los meses y los días y empieza la semana el lunes; en Mimi salen del idioma (`LOCALE_ID` por defecto y la entrada `locale`, como la G2.2). Cómo se obtiene el primer día de la semana de un idioma: comprobarlo al empezar (qué ofrecen `Intl` y `@angular/common` en Angular 22, con el MCP de Angular); si no hay una fuente fiable en todos los navegadores, una entrada `weekStart`.
    - Popover (G1.1) enfoca el primer elemento enfocable del panel al abrir; el Date Picker necesita enfocar el día elegido o hoy.
    - El valor vive en Mimi (spec 4): una fecha no disponible o fuera de rango que llega del formulario se muestra sin reescribir el modelo (Pagination, G1.11), y el formulario decide si es error.
    - El foco no puede quedar en un día que se deshabilita ni caer a `body` al cambiar de mes (lección de la G1.11).
    - El anillo de error del diseño usa `--mimi-destructive-soft` (nombre viejo): en Mimi es `--mimi-destructive-ring` (T.1). El mensaje de error del diseño usa `--mimi-destructive-soft-foreground`; Mimi usa `--mimi-field-error` (ver D6).
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, en fecha y en rango, con pruebas.
    - Teclado de la APG en la cuadrícula; foco al día elegido o a hoy al abrir y de vuelta al disparador al cerrar; foco visible; el foco no cae a `body`.
    - Idioma: nombres, formato y primer día de la semana con dos idiomas (`es` y `en-US`), con pruebas.
    - `min`, `max` y fechas no disponibles; rango con inicio y fin intercambiados si el segundo es anterior; atajos. Con pruebas.
    - Sin errores de un día en zonas al oeste y al este de UTC (prueba con una zona horaria fija o con fechas que crucen el cambio de día).
    - Estados claro, oscuro, deshabilitado y error.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Textos con `provideMimiDatePickerText` y su versión `_ES`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md` (teclado de la APG, idioma, lo que se decida de escribir la fecha).
    - `registry.json`, pruebas de la CLI y `ng g mimi date-picker` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después.
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: **cómo se guarda la fecha** (el tipo del valor). Opciones:
      - (a) `Date`: lo que más se conoce y lo que usa `DatePipe`; problemas: zona horaria (una fecha sin hora guardada como medianoche local), objetos que se pueden mutar y comparar con la hora incluida.
      - (b) Cadena ISO de fecha (`'2026-09-30'`), como el estado del diseño: sin zona horaria, se compara como texto, va directo a JSON y a un backend, es el formato del `value` de `<input type="date">`; para calcular, Mimi la convierte por dentro, y el usuario necesita convertirla si quiere un `Date`.
      - (c) `Temporal.PlainDate`: el tipo exacto para «una fecha sin hora»; pero Temporal **no es Baseline** (MDN, comprobado el 03/11/2026: «Limited availability… does not work in some of the most widely-used browsers») y no existe en el Node 24.15 del repo (comprobado: `typeof Temporal` es `undefined`), así que haría falta un polyfill (dependencia nueva: CLAUDE.md, preguntar antes).
      - (d) Un adaptador configurable (como el `DateAdapter` de Angular Material): cualquier tipo, a costa de más API.
      - Recomendación: (b), con dos funciones exportadas para convertir de y a `Date` (por ejemplo, `toMimiDate` y `fromMimiDate`), y revisar (c) cuando Temporal sea Baseline. El rango: `{ start, end }` con el mismo tipo.
    - PENDIENTE DE DECIDIR: **cómo se localiza**. Opciones: (a) `Intl.DateTimeFormat` con el idioma de `LOCALE_ID` y una entrada `locale` (como la G2.2) para los nombres de meses y días y el formato del disparador, con `format` (opciones de `Intl.DateTimeFormat`); (b) `DatePipe` / `formatDate` de `@angular/common`, que necesitan registrar los datos del idioma con `registerLocaleData`. Recomendación: (a), sin datos de idioma registrados, igual que el Number Input; el primer día de la semana según la trampa de arriba.
    - PENDIENTE DE DECIDIR: la cuadrícula (ver «Base técnica»).
    - PENDIENTE DE DECIDIR: ¿Date Range es un componente aparte (`mimi-date-range`) o un modo del Date Picker? Si es un modo, entra en la «Convención de valor simple/múltiple» («Decisiones pendientes»). Recomendación: componente aparte (el diseño los muestra distintos: el rango tiene atajos y la cuenta de días), compartiendo el calendario por dentro.
    - PENDIENTE DE DECIDIR: ¿un `mimi-calendar` suelto (el calendario sin panel, como shadcn Calendar)? Recomendación: sí, es la pieza que usan los dos y no cuesta más API.
    - PENDIENTE DE DECIDIR: ¿se puede escribir la fecha a mano? El diseño usa un botón. Opciones: (a) solo el botón, como el diseño; (b) un campo para escribir con el calendario al lado (podría usar Input Mask, G2.4). Recomendación: (a) en la 0.3.0, y anotar (b) para más adelante.
    - PENDIENTE DE DECIDIR: en el rango, el valor mientras solo está elegido el inicio: ¿`{ start, end: null }` en el modelo (el formulario lo ve incompleto) o el modelo no cambia hasta tener los dos? Recomendación: no cambiar el modelo hasta tener los dos extremos (lo que se ve en el panel vive en Mimi).
    - PENDIENTE DE DECIDIR: ¿atajos por defecto en el rango (los seis del diseño) o solo los del usuario? Recomendación: solo los del usuario, con los del diseño en el ejemplo (dependen de qué es «hoy» y del negocio).
    - PENDIENTE DE DECIDIR (tamaño L): dividir en G2.9a «Calendario y Date Picker (una fecha: cuadrícula, teclado, idioma, vistas de meses y años, formularios)» y G2.9b «Date Range (rango, banda, atajos y cuenta de días)», con G2.9b dependiendo de G2.9a. Recomendación: dividir.
- [ ] G2.10 Progress (barra y circular). Diseño: `F5 Estructura`.
  - v0.3.0 · Tamaño M · Depende de: G2.0, G2.0b · Bloquea: G2.11, G4.3
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración shadcn y HeroUI, sin dependencias; «Variante y tono»; regla de `class`); spec 6.6 (movimiento y `prefers-reduced-motion`); spec 13 (su tabla, de la G2.0; los globales `--mimi-track` y `--mimi-track-fill`; la tabla de Skeleton, el otro componente con animación propia); la 2.7 Skeleton (`animate-mimi-pulse` registrada en `cn.ts`) en `docs/historial/plan-fase-0-3.md`; el ejemplo de barra de progreso de angular.dev (best-practices/a11y, «Case study: Building a custom progress bar»).
  - Diseño: `F5 Estructura`, sección «4 · Progress» (marcado y los datos `toneBars` y `rings` del script). Lo que muestra:
    - Barra determinada: 8px de alto, radio 999px, pista `--mimi-track`, relleno `primary`, ancho con `transition: width .35s cubic-bezier(.2,.8,.2,1)`; arriba, el texto y el valor en `tabular-nums` (13,5px).
    - Barra indeterminada: `aria-busy="true"`, un tramo del 40 % con `animation: mimi-indet 1.4s cubic-bezier(.4,0,.2,1) infinite` (keyframe `mimi-indet` definido en el propio archivo); nota del diseño: «con "reducir movimiento" late en lugar de desplazarse».
    - Tonos: barras de 6px en `warning`, `success`, `info` y `destructive`, con el valor en `<tono>-soft-foreground`.
    - Circular: SVG de `viewBox 0 0 36 36` (radio 15.915, `stroke-linecap: round`), pista `--mimi-track`, transición de `stroke-dasharray` de .4s; tamaños de 76px (trazo 3, texto de 16px) y 44px (trazo 4, texto de 11px); indeterminado con `mimi-spin 1s linear infinite` y un arco de 28 sobre 100.
    - Todas con `role="progressbar"`, `aria-label`, `aria-valuemin="0"`, `aria-valuemax="100"` y `aria-valuenow` (sin `aria-valuenow` en las indeterminadas).
  - Objetivo: mostrar el avance de una tarea, determinado o indeterminado, en barra o en círculo, con los tonos de la lista común.
  - Alcance: incluye barra y círculo, determinado e indeterminado, los tonos del diseño, los dos tamaños del círculo y el valor dentro del círculo. NO incluye: el texto y el valor de arriba de la barra (en el diseño son parte de la demo; ver preguntas), barra con buffer, pasos ni etiquetas por tramo.
  - Base técnica: ninguna. `@angular/aria` 22.2.3 no tiene un patrón de progreso (exporta `accordion`, `combobox`, `grid`, `listbox`, `menu`, `tabs`, `toolbar` y `tree`), y la APG no tiene un patrón propio: es el rol `progressbar` de WAI-ARIA.
    - PENDIENTE DE DECIDIR: implementación propia con el rol `progressbar`. Opciones: (a) un `div` con `role="progressbar"` y los `aria-value*` (como el diseño y el ejemplo de angular.dev); (b) el `<progress>` nativo, que no permite el círculo ni el estilo del diseño sin trucos. Recomendación: (a).
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres): `<mimi-progress [value] [max] [tone] [shape] [size] aria-label class>`. `value` `null` = indeterminado; `max` por defecto 100; `tone`: `primary` (por defecto), `success`, `warning`, `info` o `danger` (lista común de la spec 4; el diseño escribe `destructive`); `shape`: barra o círculo; `size` solo para el círculo (76px y 44px del diseño). `class` va al elemento con el rol. Estado: `data-state="determinate|indeterminate"`, `data-tone`.
  - Formularios: No aplica (no es un control).
  - Tokens: tabla en la spec 13 (tarea G2.0). Usa los globales `--mimi-track` y `--mimi-track-fill`, que hoy no están en `theme-base.css` (ver la pregunta de la G2.0). Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts`; si la animación se registra como utilidad (como `animate-mimi-pulse` de Skeleton), también en `cn.ts` con su prueba.
  - Teclado y accesibilidad: no recibe el foco (no es interactivo). `aria-label` o `aria-labelledby` obligatorio, con aviso en desarrollo «[Mimi] Progress: …» si falta. `aria-valuenow` solo si es determinado; `aria-busy="true"` si es indeterminado (como el diseño). Movimiento reducido: la barra indeterminada «late» (la nota del diseño) y el círculo deja de girar (ver preguntas). **Anuncios (decidido el 03/11/2026):** Progress no anuncia nada por su cuenta: sin `aria-live` y sin `LiveAnnouncer`, ni en cada cambio de valor ni al llegar al 100 %. El valor se lee cuando el lector llega a la barra (`aria-valuenow`); el final de la tarea lo comunica la aplicación (por ejemplo, con un Toast, que sí anuncia, G1.8). Así una barra que avanza muchas veces por segundo no satura al lector. Se documenta en la página. En test: roles, atributos y el cambio a indeterminado. A mano: NVDA lee el nombre y el porcentaje.
  - Ejemplos del showcase: barra determinada (con botones − y +, como el diseño), barra indeterminada, los cuatro tonos, los círculos del diseño (determinado, `success`, `warning`, pequeño e indeterminado), con `class`, claro y oscuro, y movimiento reducido.
  - CLI: ítem `progress` en `registry.json`, con `utils/cn`; sin dependencias de npm ni `cssImports`; `x-prompt` de `ui/schema.json` y README de la CLI.
  - Textos: No aplica (el nombre lo da el usuario).
  - Trampas conocidas:
    - En valores arbitrarios con `var()`, el tipo siempre (`bg-[color:var(…)]`, `stroke-[color:var(…)]`…; CLAUDE.md, reglas de estilos 8).
    - Animación propia: Skeleton registró `animate-mimi-pulse` en `cn.ts` (grupo `animate`) para que `class` del usuario la reemplace bien.
    - `--mimi-track` es un global (spec 13): el prefijo del componente no puede llamarse `track`.
    - El diseño usa `destructive` como tono; en Mimi es `danger`.
  - Criterios de hecho:
    - Barra y círculo, determinados e indeterminados, en los tonos y tamaños del diseño; `value` fuera de rango se acota sin romper nada; `max` distinto de 100 funciona.
    - Determinado: `role="progressbar"` con `aria-valuenow`, `aria-valuemin` y `aria-valuemax`. Indeterminado: sin `aria-valuenow` (y con `aria-busy="true"`). Con pruebas.
    - Nombre accesible obligatorio (`aria-label` o `aria-labelledby`), con aviso en modo desarrollo en el formato «[Mimi] Progress: …» (lo comprueba `dev-warnings.spec.ts`).
    - El indeterminado respeta `prefers-reduced-motion` (la barra late en vez de desplazarse; el círculo, según la pregunta abierta), con prueba de las clases.
    - No anuncia cambios de valor: sin `aria-live` ni llamadas al `LiveAnnouncer` (prueba), y la página lo explica.
    - Estados claro y oscuro.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi progress` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después (componente lazy: el JS inicial solo suma la ruta y la sidebar).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: la base técnica (ver arriba).
    - PENDIENTE DE DECIDIR: un componente con `shape` o dos (`mimi-progress` y `mimi-progress-circle`). Recomendación: uno, con `shape`.
    - PENDIENTE DE DECIDIR: ¿el texto y el valor de arriba de la barra son parte del componente (por ejemplo, `label` y `showValue`) o los pone el usuario? Recomendación: los pone el usuario, y el círculo muestra el valor dentro (como el diseño).
    - PENDIENTE DE DECIDIR: con movimiento reducido, ¿el círculo indeterminado deja de girar o «late» como la barra? El diseño solo lo dice de la barra. Recomendación: que lata, como la barra; anotarlo en `correcciones-pendientes.md`.
- [ ] G2.11 File Upload, con Progress. Diseño: `F3 Archivos Tags Toggle Color`.
  - v0.3.0 · Tamaño M · Depende de: G2.0, G2.0b, 2.1 (Button, hecha), G2.10 (Progress) · Bloquea: —
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración PrimeNG FileUpload y Vuesax; depende de Button y Progress); spec 8 (`FormValueControl`); spec 13 (su tabla, de la G2.0; los globales `--mimi-dropzone`, `--mimi-dropzone-active`, `--mimi-dropzone-active-border` y el keyframe `mimi-bob` de la G2.0b); la G2.10 Progress; la G1.8 Toast en `docs/historial/plan-grupo-1.md` (anuncios con el `LiveAnnouncer`).
  - Diseño: `F3 Archivos Tags Toggle Color`, sección «9 · File Upload» (marcado y las funciones `upload()` y `addFiles()` del script). Lo que muestra:
    - Zona de soltar de 176px: un `div` con `role="button"`, `tabindex="0"` y `aria-label="Subir archivos"`, que abre el selector de archivos con clic, Enter o Espacio; un `<input type="file" multiple>` oculto (`display:none`, `aria-hidden`); ícono `cloud-upload` en un círculo, «Arrastra archivos o haz clic» (el título) y «PNG, JPG o PDF · hasta 10 MB». Borde de 2px discontinuo `--mimi-input`, fondo `--mimi-dropzone`, radio `--mimi-radius-card`.
    - Con un archivo encima: borde sólido `--mimi-dropzone-active-border`, fondo `--mimi-dropzone-active`, `--mimi-glow-info`, escala 1,01, el ícono en `info` con la animación `mimi-bob`, «Suelta para subir 3 archivos» y los nombres («portada.jpg, contrato.pdf y 1 más»).
    - Lista de archivos (`<ul aria-label="Archivos">`): cada uno con miniatura (imágenes, con `URL.createObjectURL`) o un ícono por tipo (imagen, PDF, video, otro; con su color suave), nombre cortado con puntos suspensivos, tamaño («2.4 MB»), y uno de tres estados: subiendo (barra `role="progressbar"` con `aria-label` «Subiendo <nombre>» y el porcentaje), subido («Subido» con `circle-check` en `success-soft-foreground`) o error (el mensaje, por ejemplo «Supera el máximo de 10 MB.», en `destructive-soft-foreground`, y un botón «Reintentar»). Un botón de quitar (`trash-2`, `aria-label` con el nombre) en cada uno.
    - El diseño valida el tamaño al agregar (más de 10 MB entra como error) y simula la subida con un temporizador.
  - Objetivo: elegir archivos con un clic, el teclado o arrastrando, validarlos y mostrar su lista con el progreso y el estado que da la app, sin que Mimi suba nada.
  - Alcance: incluye la zona de soltar (clic, teclado y arrastrar), `accept`, `multiple`, tamaño máximo y cantidad máxima, la lista con miniatura o ícono, tamaño, progreso (con Progress, G2.10), subido, error con «Reintentar» y quitar, los estados del diseño y formularios. **NO incluye la subida al servidor**: Mimi no hace peticiones HTTP; la app sube los archivos y le pasa a Mimi el progreso y el estado de cada uno (el ejemplo del showcase simula la subida, como el diseño). Tampoco: pegar archivos desde el portapapeles, carpetas, recortar imágenes.
  - Base técnica: ninguna de aria ni de la APG (no hay patrón de «zona de soltar»). El selector es el `<input type="file">` nativo; arrastrar y soltar, con los eventos nativos (`dragenter`, `dragover`, `dragleave`, `drop`). La barra, con `mimi-progress` (G2.10). Los botones, con Button.
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres y en la forma; ver preguntas): `<mimi-file-upload [(value)] [accept] [multiple] [maxSize] [maxFiles] [disabled] aria-label class (rejected)>` para elegir y validar, y la lista con el estado que da la app, por ejemplo `[status]` por archivo (`uploading` con progreso, `done`, `error` con mensaje) y salidas `(retry)` y `(remove)`. `value`: `File[]`.
  - Formularios: control propio con `FormValueControl<File[]>` (spec 8) y `MIMI_FIELD_CONTROL`; pruebas con `[formField]`, `formControlName` y `[(ngModel)]` (agregar, quitar, rechazados por tipo, tamaño o cantidad, `disabled`, requerido). Un archivo rechazado no entra en el valor (ver preguntas). El valor no puede reponerse en el `<input type="file">` nativo (el navegador no lo permite): el input se vacía después de cada elección y la lista vive en Mimi.
  - Tokens: tabla en la spec 13 (tarea G2.0); los globales `--mimi-dropzone*` y `mimi-bob` (G2.0b) con valor de respaldo; Progress para la barra. Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts`.
  - Teclado y accesibilidad: la zona de soltar se usa sin arrastrar (arrastrar no es accesible con teclado): es un botón (`role="button"` con Enter y Espacio, como el diseño, o un `<button>` nativo; ver preguntas) que abre el selector. Nombre del botón con lo que se acepta (el texto «PNG, JPG o PDF · hasta 10 MB» como descripción, `aria-describedby`). Anuncios con el `LiveAnnouncer` (`polite`): archivos agregados, rechazados (con el motivo), subido y error; no se anuncia cada cambio de porcentaje (la barra ya tiene sus `aria-value*`). Quitar un archivo con el foco en su botón deja el foco en el siguiente, el anterior o la zona de soltar, nunca en `body`. Movimiento reducido: sin `mimi-bob` ni escala. En test: clic, Enter y Espacio, soltar (eventos simulados con `DataTransfer`), validaciones, anuncios, quitar con el foco. A mano: NVDA, y arrastrar desde el explorador de archivos en Chrome, Firefox y Safari.
  - Ejemplos del showcase: el del diseño (imágenes y PDF hasta 10 MB, con la subida simulada: subiendo, subido, error y reintentar), un solo archivo, cantidad máxima, deshabilitado, con error de formulario (requerido), formularios, con `class`, claro y oscuro.
  - CLI: ítem `file-upload` en `registry.json`, con `button` y `progress` (registryDependencies), `utils/cn` y `utils/field-state`; si se usa el `LiveAnnouncer`, peer `@angular/cdk`; `x-prompt` y README de la CLI.
  - Textos: sí. «Subir archivos», «Arrastra archivos o haz clic», «Suelta para subir {n} archivos», «{a}, {b} y {n} más», «Subiendo {nombre}», «Subido», «Reintentar», «Quitar {nombre}», los motivos de rechazo («Supera el máximo de {tamaño}.», tipo no permitido, demasiados archivos) y los anuncios → `MIMI_FILE_UPLOAD_TEXT` (inglés) y `MIMI_FILE_UPLOAD_TEXT_ES`, con `provideMimiFileUploadText`. El tamaño con `Intl.NumberFormat` y el idioma (el diseño escribe «2.4 MB» con punto).
  - Trampas conocidas:
    - `URL.createObjectURL` para las miniaturas: hay que liberar cada URL (`URL.revokeObjectURL`) al quitar el archivo y al destruir el componente, o se pierde memoria.
    - `dragleave` salta al pasar sobre un hijo de la zona: el estado «encima» parpadea si no se cuenta la profundidad (o se usa `relatedTarget`).
    - `accept` del input nativo no se aplica a lo que se suelta: la validación de tipo la hace Mimi también al soltar. El tipo que da el navegador (`File.type`) puede venir vacío: validar también por extensión.
    - Elegir el mismo archivo dos veces seguidas no dispara `change` si el input no se vacía (el diseño lo vacía: `e.target.value = ''`).
    - Con `display:none` el input no recibe el foco ni sale en el árbol de accesibilidad (bien), pero los formularios no lo ven: el valor es el de Mimi, no el del input.
    - El texto del error del diseño usa `--mimi-destructive-soft-foreground`; Mimi usa `--mimi-field-error` para los errores de campo (ver D6). El error de un archivo de la lista no es un error de campo: decidir el token en la G2.0.
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, con pruebas.
    - Se elige con clic, con Enter y Espacio, y soltando; `accept`, `maxSize` y `maxFiles` validan también lo que se suelta, con pruebas.
    - El estado y el progreso de cada archivo vienen de la app; Mimi no hace peticiones (prueba sin `HttpClient`).
    - Miniaturas liberadas al quitar y al destruir (prueba con un espía de `URL.revokeObjectURL`).
    - Anuncios de agregados, rechazados, subido y error; foco fuera de `body` al quitar.
    - Estados claro, oscuro, encima, deshabilitado y error; movimiento reducido sin animaciones.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Textos con `provideMimiFileUploadText` y su versión `_ES`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi file-upload` probado en un proyecto limpio (trae Button y Progress).
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después.
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: **hasta dónde llega Mimi y cómo recibe el estado de la subida**. Opciones: (a) un solo componente con `[(value)]` de `File[]` y una entrada con el estado de cada archivo (por ejemplo, un `Map<File, estado>` o una función `statusOf(file)`), con salidas `(retry)` y `(remove)`; (b) dos piezas: la zona de soltar como control de formulario (`FormValueControl<File[]>`) y un `mimi-file-list` / `mimi-file-item` de presentación al que la app le pasa nombre, tamaño, progreso y estado (la app arma la lista con sus propios datos, también archivos ya subidos antes); (c) Mimi recibe una función `upload(file)` que devuelve el progreso (un `Observable`) y maneja la lista sola. Recomendación: (b): Mimi no sube nada (lo pide el alcance), la lista sirve para archivos que ya estaban en el servidor, y la app controla los reintentos. (c) acerca a Mimi a la subida.
    - PENDIENTE DE DECIDIR: un archivo rechazado (tipo, tamaño o cantidad), ¿entra en el valor marcado como error (lo que muestra el diseño: el video de 48 MB está en la lista con su error) o queda fuera del valor y se avisa con la salida `(rejected)` y el anuncio? Recomendación: fuera del valor (el formulario no tiene que filtrar), y la app lo muestra en la lista si quiere, como el diseño.
    - PENDIENTE DE DECIDIR: la zona de soltar, ¿`div` con `role="button"` (como el diseño) o un `<button>` nativo? Recomendación: `<button>` nativo (Enter y Espacio sin código, `disabled` nativo), con el contenido del diseño adentro.
    - PENDIENTE DE DECIDIR: el ícono por tipo de archivo y su color (imagen `info`, PDF `destructive`, video `warning`, otro `muted`): ¿parte del componente o del ejemplo? Recomendación: parte del componente para los cuatro tipos del diseño, con una forma de que la app ponga el suyo.
- [ ] G2.12 Color Picker. Diseño: `Color Picker` (en `F3 Archivos Tags Toggle Color`).
  - v0.3.0 · Tamaño M · Depende de: G2.0, G2.0b, G1.1 (Popover, hecha), G2.7 (Slider; solo G2.7a si se divide), 2.2 (Input, hecha) · Bloquea: —
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración PrimeNG ColorPicker y HeroUI; depende de Popover, Slider e Input); spec 6.2 y CLAUDE.md, reglas de estilos 1 (cero colores fijos: ver «Trampas»); spec 8 (`FormValueControl`); spec 13 (su tabla, de la G2.0); la G2.7 Slider (su base técnica decidida); la G1.1 Popover en `docs/historial/plan-grupo-1.md`; `contrast.spec.ts` (ui-core; el cálculo de contraste del ejemplo).
  - Diseño: `Mimi Color Picker.dc.html` (el panel), usado en `F3 Archivos Tags Toggle Color`, sección «12 · Color Picker» (con una vista previa al lado). Lo que muestra:
    - Un panel de 280px con fondo `--mimi-popover`, borde, `--mimi-radius` y `--mimi-shadow-popover`. En la página del Grupo 2 está **suelto** (sin disparador ni Popover).
    - Área de saturación y brillo (150px): un `div` con `role="slider"`, `aria-label="Saturación y brillo"`, `aria-valuetext` («Saturación 80%, brillo 90%»), sin `aria-valuenow`; flechas de a 2 %; arrastre con `setPointerCapture` y `touch-action: none`; un pulgar de 14px con borde blanco.
    - Barra de tono: `role="slider"`, `aria-label="Tono"`, `aria-valuemin="0"`, `aria-valuemax="360"`, `aria-valuenow`; flechas de a 3°; degradado del espectro; pulgar de 16px. Al lado, un círculo de 28px con el color actual.
    - Formato: un `radiogroup` («Formato») con HEX y OKLCH, y un campo `aria-label="Valor del color"` que muestra el valor en el formato elegido, acepta hex (`#4f46e5`, `#fff`) u `oklch(…)`, confirma con Enter o al salir y marca `aria-invalid` si no se entiende.
    - «Paleta»: 16 colores fijos (botones redondos con `aria-label` = el hex y `aria-pressed` en el elegido). «Recientes»: hasta 8 colores elegidos, con «Los colores que elijas aparecerán aquí.» si no hay.
    - El estado interno es HSV; el valor que sale (`onChange`) es **hex** en minúsculas (`#4f46e5`). OKLCH se calcula desde sRGB y, al escribir un OKLCH fuera de sRGB, se recorta a sRGB.
    - La vista previa de la página (botón, badge y el contraste con el texto) es del ejemplo, no del panel.
  - Objetivo: elegir un color con el área, el tono, un valor escrito o una paleta, en un panel suelto o en un Popover, y en los tres sistemas de formularios.
  - Alcance: incluye el área de saturación y brillo, el tono, el campo con HEX y OKLCH, la paleta del usuario, los recientes, un disparador con Popover (propuesta: el diseño no lo dibuja), estados y formularios. NO incluye: transparencia (alfa; el diseño no la tiene), cuentagotas (`EyeDropper`, no está en todos los navegadores), otros formatos (RGB, HSL), colores fuera de sRGB, el cálculo de contraste (es del ejemplo).
  - Base técnica: ninguna de aria (no hay slider). APG: «Slider» para el tono; para el área de dos dimensiones no hay patrón (ver preguntas). El tono, con el Slider de Mimi (G2.7) si su base técnica permite una pista con el degradado del espectro (ver preguntas). El campo, con `input[mimiInput]` (2.2). El panel, con Popover (G1.1).
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres): `<mimi-color-picker [(value)] [swatches] [(recent)] [disabled] aria-label class>` (el panel) y un disparador, por ejemplo `<mimi-color-input [(value)] …>` (muestra del color y el valor, abre el panel en un Popover). El tipo y el formato de `value`: ver la pregunta del formato. `swatches`: la paleta del usuario. `recent`: los recientes (un `model`, para que la app los guarde si quiere).
  - Formularios: control propio con `FormValueControl<string>` (spec 8) y `MIMI_FIELD_CONTROL`, en el panel y en el disparador; pruebas con `[formField]`, `formControlName` y `[(ngModel)]` (arrastrar, teclado, escribir hex y OKLCH, paleta, valor desde el formulario en otro formato o inválido, `disabled`). Lo que se escribe en el campo es el valor solo al confirmarlo (Enter o salir), como el diseño. El valor vive en Mimi (spec 4): un valor inválido que llega del formulario se muestra sin reescribirlo.
  - Tokens: tabla en la spec 13 (tarea G2.0). Registrar en `theme/types.ts`, `COMPONENT_PREFIX` y `component-tokens.ts`.
  - Teclado y accesibilidad: tono con las teclas del Slider (las del diseño: flechas de a 3°; Re Pág/Av Pág e Inicio/Fin, propuesta de la APG); área con las flechas (← → saturación, ↑ ↓ brillo, de a 2 %, como el diseño); paleta y recientes como botones (Tab) o con flechas (ver preguntas); el formato como grupo de radio (podría ser Toggle Group, G2.1). Nombres: el de cada control como el diseño; el de cada muestra, el hex (el diseño) o un nombre del usuario. Se anuncia el valor del área con `aria-valuetext`. En test: teclas del área y del tono, arrastre simulado, escribir y confirmar, valor inválido, paleta, recientes. A mano: NVDA (lee tono, saturación y brillo), táctil en un móvil.
  - Ejemplos del showcase: el panel suelto con la vista previa del diseño (botón, badge y contraste), el disparador con Popover, con paleta y sin paleta, deshabilitado, formularios, con `class`, claro y oscuro.
  - CLI: ítem `color-picker` en `registry.json`, con `popover`, `input` y `slider` si se usa (registryDependencies), peer `@angular/cdk` (Popover), `utils/cn` y `utils/field-state`; `x-prompt` y README de la CLI.
  - Textos: sí. «Saturación y brillo», «Saturación {s} %, brillo {v} %», «Tono», «Formato», «Valor del color», «Paleta», «Recientes», «Los colores que elijas aparecerán aquí.» y el nombre del disparador → `MIMI_COLOR_PICKER_TEXT` (inglés) y `MIMI_COLOR_PICKER_TEXT_ES`, con `provideMimiColorPickerText`.
  - Trampas conocidas:
    - **Colores fijos** (CLAUDE.md, reglas de estilos 1): el diseño usa `#fff` en el borde de los pulgares, `oklch(0 0 0 / .25)` y `/ .3` en sus sombras, `oklch(0 0 0 / .1)` y `/ .12` en el borde de las muestras, y degradados con `#000`, `#fff` y los seis colores del espectro. Los degradados son el espacio de color (no son del tema) y el color elegido es un dato; el borde y las sombras de los pulgares sí son estilo (ver preguntas).
    - Conversión de ida y vuelta: HSV ↔ RGB ↔ hex redondea; volver a escribir el mismo hex no tiene que mover el pulgar (el diseño guarda `lastHex` para no recalcular). Un gris (saturación 0) pierde el tono: el pulgar del tono no tiene que saltar.
    - OKLCH fuera de sRGB se recorta: el valor escrito y el que se guarda no coinciden. Hay que decir cuándo pasa (por ejemplo, el campo muestra el valor recortado al confirmar).
    - `aria-valuenow`: el área del diseño no lo tiene; según ARIA 1.2, `slider` lo pide (comprobarlo al empezar). Ver preguntas.
    - El foco movido por código y el arrastre (lección de la G1.10): al empezar a arrastrar, el control recibe el foco.
    - Con el panel en un Popover: el clic y el arrastre dentro del panel no lo cierran; soltar el puntero fuera del panel después de arrastrar tampoco.
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, en el panel y en el disparador, con pruebas.
    - Teclado en el área, el tono, el formato, la paleta y los recientes; foco visible en cada uno.
    - Arrastre con el puntero y táctil (`touch-action: none`), con prueba de eventos de puntero y prueba manual en un móvil.
    - Hex y OKLCH: lectura, escritura, valor inválido y recorte a sRGB, con pruebas; sin saltos al volver a escribir el mismo valor.
    - Sin colores fijos fuera de las excepciones que se decidan (revisión del CSS generado, como pide `/componente`), anotadas en la spec 4.
    - Estados claro, oscuro y deshabilitado.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Textos con `provideMimiColorPickerText` y su versión `_ES`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md` (el disparador, los colores fijos, `aria-valuenow`).
    - `registry.json`, pruebas de la CLI y `ng g mimi color-picker` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS global, crudo y gzip, antes y después.
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: **el formato del valor**. Opciones: (a) siempre hex de 6 dígitos en minúsculas (`#4f46e5`), como el diseño; el selector HEX/OKLCH solo cambia lo que se muestra en el campo; (b) una cadena en el formato elegido (`#4f46e5` u `oklch(0.511 0.230 276.9)`), así que el valor cambia de forma con el selector; (c) un objeto (`{ h, s, v }` o `{ l, c, h }`). Con (a) el valor es estable y sirve directo para CSS y para un backend; OKLCH es solo una forma de ver y escribir. Recomendación: (a), con una entrada para elegir el formato que se muestra por defecto.
    - PENDIENTE DE DECIDIR: **los espacios de color**. El diseño usa HSV para el área y el tono, y muestra OKLCH. Opciones: (a) como el diseño (HSV para elegir, hex para guardar, OKLCH para ver y escribir, recortado a sRGB); (b) elegir en OKLCH (área de croma y luminosidad, tono de OKLCH), más coherente con el tema de Mimi (que está en OKLCH) pero con zonas fuera de sRGB que no se pueden mostrar. Recomendación: (a), como el diseño.
    - PENDIENTE DE DECIDIR: el disparador. El diseño solo dibuja el panel; la spec 4 dice que depende de Popover. Opciones: (a) dos piezas: el panel suelto y un disparador con Popover; (b) solo el disparador con Popover; (c) solo el panel, y el usuario lo pone en un Popover. Recomendación: (a); el disparador (la muestra y el valor) no está diseñado: anotarlo en `correcciones-pendientes.md`.
    - PENDIENTE DE DECIDIR: ¿el tono usa el Slider de Mimi (G2.7) o un control propio como el del diseño? Depende de la base técnica de la G2.7 (la pista con el degradado y el pulgar de 16px del diseño). Recomendación: el Slider de Mimi si permite cambiar la pista por `class` o un token; si no, propio, y corregir la spec 4 (como se hace con Tooltip en la G2.7).
    - PENDIENTE DE DECIDIR: el área de dos dimensiones: (a) un solo `role="slider"` como el diseño (con `aria-valuenow` para una de las dos y `aria-valuetext` con las dos); (b) dos sliders (saturación y brillo) para el lector, sobre la misma área. Recomendación: (a), comprobando con NVDA que lee el `aria-valuetext`.
    - PENDIENTE DE DECIDIR: el borde blanco y las sombras de los pulgares y las muestras (colores fijos del diseño): ¿excepción documentada en la spec 4 (tienen que verse sobre cualquier color, también en oscuro) o tokens nuevos (por ejemplo, `--mimi-color-picker-thumb-border`)? Recomendación: tokens del componente con el valor del diseño, para cumplir la regla 1 sin excepciones.
    - PENDIENTE DE DECIDIR: ¿paleta por defecto (los 16 colores del diseño) o solo la del usuario (`swatches`)? Recomendación: solo la del usuario, con los del diseño en el ejemplo (una paleta por defecto serían colores fijos en el componente).
    - PENDIENTE DE DECIDIR: la paleta y los recientes, ¿cada muestra es una parada de Tab (el diseño) o un grupo con flechas (una parada)? Recomendación: un grupo con flechas (`FocusKeyManager`, como la G1.10): con 16 + 8 muestras, Tab pasaría por 24 botones.
- [ ] 5.17 Revisión móvil componente por componente, después del Grupo 1: cómo se usa cada uno en pantallas chicas. Por ejemplo, en móvil el Select se abre como un panel flotante tipo modal en la parte superior, con buscador y más opciones visibles. mimi-toolbar (G1.10): una horizontal más ancha que la pantalla no se parte ni se achica; hoy el componente no hace nada y el ejemplo la pone en un contenedor con `overflow-x-auto` (los botones no se encogen).
  - v0.3.0 · Tamaño L · Depende de: G2.1 a G2.12 (con G2.4a y G2.4b) · Bloquea: G2.P
  - Dato de la G1.5: la API del Select no depende del overlay; un panel tipo hoja o modal se puede hacer después cambiando la estrategia de posición y las clases del panel, sin tocar entradas ni salidas.
  - PENDIENTE DE DECIDIR: ¿qué cambios de API podría exigir la revisión (por ejemplo, el Select como panel modal en móvil), y alguno debe hacerse antes de la 0.3.0?
- [ ] G2.P Puerta del Grupo 2 (v0.3.0): la lista de «Puerta del grupo» de «Cómo usar este plan», más:
  - CHANGELOG de la 0.3.0: explicar los tokens globales nuevos del Grupo 2 (G2.0b), que los componentes funcionan con un tema que no los tenga (usan valor de respaldo) y que, si el usuario modificó su tema, la CLI no lo actualiza y solo avisa.
  - Revisar la decisión de los Blocks (todos en la v0.4.0, con el Grupo 3; spec 4, «Blocks»).
  - Revisar con la respuesta real de los usuarios a la 0.2.0 si algo del Grupo 5 sube de prioridad.
  - Depende de: G2.0, G2.0b, G2.1 a G2.12 (con G2.4a y G2.4b), 5.2, 5.17

## Grupo 3 y Blocks → v0.4.0: datos y pantallas

Componentes de la spec 4 (tabla del Grupo 3) y Blocks (spec 4, «Blocks»). Los Blocks salen todos en la v0.4.0, junto con el Grupo 3 (decidido el 03/11/2026, revisable en G2.P): B.1 a B.7 se pueden trabajar apenas termine el Grupo 2; B.8 y B.9 esperan a la G3.4.

- [ ] G3.1 Tree. Diseño: `F4 Command Tree Sortable`.
  - Depende de: G2.P, 2.10 (Checkbox, hecha)
- [ ] G3.2 Sortable List, con `@angular/cdk/drag-drop` y accesible con teclado. Diseño: `F4 Command Tree Sortable`.
  - Depende de: G2.P (spec 4: `@angular/cdk/drag-drop`, manejo de teclado propio)
- [ ] G3.3 Command (⌘K). Después, la tarea 5.8 (buscador de la documentación). Diseño: `F4 Command Tree Sortable`.
  - Depende de: G2.P, G1.6 (Dialog, hecha), G2.8 (lógica de lista de Combobox) · Bloquea: 5.8
- [ ] G3.4 Data Table (ordenar, filtrar, paginar, seleccionar, columnas fijas). Usa Checkbox, Dropdown Menu y Pagination. Diseño: `Data Table` (en `F4 Data Table y Pagination`).
  - Depende de: G2.P, 2.10 (Checkbox), G1.3 (Dropdown Menu), G1.11 (Pagination), 2.2 (Input); todas hechas · Bloquea: B.8, B.9
- [ ] B.1 Ítems de tipo `block` en el registro: `ng g mimi login-01` copia la pantalla y los componentes que usa.
  - Depende de: G2.P · Bloquea: B.2 a B.9
- [ ] B.2 `login-01`. Diseño: `Block login-01`.
  - Depende de: B.1
- [ ] B.3 `login-02`. Diseño: `Block login-02`.
  - Depende de: B.1
- [ ] B.4 `signup-01` (registro). Diseño: `Block signup-01`.
  - Depende de: B.1
- [ ] B.5 `otp-01` (código de verificación; usa Input OTP). Diseño: `Block otp-01`.
  - Depende de: B.1, G2.5
- [ ] B.6 `settings-01` (configuración). Diseño: `Block settings-01`.
  - Depende de: B.1
- [ ] B.7 `pricing-01` (precios). Diseño: `Block pricing-01`.
  - Depende de: B.1
- [ ] B.8 `dashboard-01` (usa Data Table: después del Grupo 3). Diseño: `Block dashboard-01`.
  - Depende de: B.1, G3.4
- [ ] B.9 `table-01` (tabla con filtros; usa Data Table: después del Grupo 3). Diseño: `Block table-01`.
  - Depende de: B.1, G3.4
- [ ] G3.P Puerta del Grupo 3 y Blocks (v0.4.0): la lista de «Puerta del grupo».
  - Depende de: G3.1 a G3.4, B.1 a B.9

## Grupo 4 → v0.5.0: estructura

Componentes de la spec 4 (tabla del Grupo 4).

- [ ] G4.1 Accordion. Diseño: `F5 Estructura`.
  - Depende de: G3.P (spec 4: `@angular/aria/accordion`, a confirmar)
- [ ] G4.2 Sheet/Drawer, flotante como el de shadcn (separado de los bordes, radio de tarjeta y barra de agarre en la versión inferior). Diseño: `F5 Estructura`.
  - Depende de: G3.P, G1.6 (Dialog, hecha) · Bloquea: G5.1
- [ ] G4.3 Stepper. Diseño: `F5 Estructura`.
  - Depende de: G3.P, 2.1 (Button, hecha), G2.10
- [ ] G4.P Puerta del Grupo 4 (v0.5.0): la lista de «Puerta del grupo», más decidir la versión de Mimi Effects y del Grupo 5.
  - Depende de: G4.1 a G4.3

## Mimi Effects (sin versión asignada)

Prioridad baja, después del Grupo 3 (spec 4, «Mimi Effects»). La versión se decide en la G4.P.

Inspirados en Magic UI. Todos respetan `prefers-reduced-motion`. Sin Globe, Icon Cloud ni partículas 3D (dependencias pesadas). Si se porta código de Magic UI (MIT), su aviso va en `THIRD_PARTY_NOTICES.md`. Diseño de todos: `F5 Effects` (keyframes en `mimi-effects.css`, también en `tokens-mimi.css`).

- [ ] E.1 Animated Theme Toggler.
- [ ] E.2 Terminal.
- [ ] E.3 Usar el Animated Theme Toggler y la Terminal en el showcase.
  - Depende de: E.1, E.2
- [ ] E.4 Marquee.
- [ ] E.5 Bento Grid.
- [ ] E.6 Number Ticker.
- [ ] E.7 Border Beam / Shine Border.
- [ ] E.8 Magic Card.
- [ ] E.9 Blur Fade.
- [ ] E.10 Text Animate.
- [ ] E.11 Animated List.
- [ ] E.12 Confetti.
- [ ] E.13 Ripple.
- [ ] E.14 Fondos: Grid y Dot Pattern.
- [ ] E.15 Marcos Safari e iPhone.
- [ ] E.16 File Tree.
- [ ] E.17 Code Comparison.

## Grupo 5: según lo que pidan los usuarios (sin versión asignada)

Prioridad según lo que pidan los usuarios después de la 0.2.0. Sin orden fijo. El criterio sigue abierto (ver «Decisiones pendientes»); se revisa en la G2.P y la versión se decide en la G4.P. Dependencias de la spec 4 (tabla del Grupo 5).

- [ ] G5.1 Sidebar de dashboard. Diseño: `F5 Dashboard y Media`.
  - Depende de: G4.2 (Sheet, en móvil), G1.2 (Tooltip, hecha)
- [ ] G5.2 Time Picker. Diseño: `F3 Combobox Fechas Hora`.
  - Depende de: G1.1 (Popover, hecha)
- [ ] G5.3 Carousel. Diseño: `F5 Dashboard y Media`.
- [ ] G5.4 Image Preview (lightbox con zoom). Diseño: `F5 Dashboard y Media`.
  - Depende de: G1.6 (Dialog, hecha)
- [ ] G5.5 Timeline. Diseño: `F5 Dashboard y Media`.
- [ ] G5.6 Resizable. Diseño: `F5 Dashboard y Media`.
- [ ] G5.7 Hover Card. Diseño: `F5 Dashboard y Media`.
  - Depende de: G1.1 (Popover, hecha)
- [ ] G5.8 Rating. Diseño: `F5 Dashboard y Media`.
  - Depende de: — (spec 4: `FormValueControl`)

## Plataforma y experiencia

Las tareas que eran la Fase 5. Conservan sus números porque el código y la spec los citan. La 5.2 y la 5.17 están en el Grupo 2; la 5.7 y la 5.11, en «Terminado».

- [ ] 5.1 Schematic `theme` (preguntas + opciones `--palette`, `--radius`).
- [ ] 5.3 Comando `mimi` (`pnpm mimi add button`, `mimi list`, `mimi theme`). Al hacerlo: volver a agregar la pestaña de pnpm en `InstallCommand` (hoy muestra `ng g mimi` y la forma larga) y actualizar la prueba de comandos prohibidos (`apps/docs/src/app/commands.spec.ts`) para permitir los que ya existan.
- [ ] 5.4 `mimi update`: combina la versión nueva con los cambios del usuario usando `.mimi/base/`. La base queda formateada con el Prettier del usuario (la CLI de Angular formatea lo que escriben los schematics), así que antes de combinar hay que formatear la plantilla nueva con el Prettier del proyecto; si no, las diferencias de formato se mezclarán con los cambios reales.
- [ ] 5.5 Página "Migrar desde PrimeNG / NG-ZORRO".
- [ ] 5.6 Documentación en español e inglés. Cuando exista la documentación en inglés, los READMEs (raíz y `packages/cli`) pasan a ser bilingües; hoy tienen solo una línea en inglés arriba.
- [ ] 5.8 Buscador ⌘K en el header del showcase, con Command (G3.3).
  - Depende de: G3.3
- [ ] 5.9 Selector ES/EN en el header (el idioma va como prefijo en la ruta).
- [ ] 5.10 Navegación superior del header (Documentación · Componentes · Temas), como en el diseño. Revisado en la 2.12: todavía no aporta. Documentación y Componentes ya están a un clic (botones de la landing y sidebar), y «Temas» apuntaría a una página que no existe. Hacerla cuando exista la página «Tema» (5.2), junto con el buscador ⌘K, que ocupa el mismo lugar del header; «Documentación» y «Componentes» viven bajo `/docs` y necesitan una regla propia para el estado activo, y en móvil irían en el panel.
  - Depende de: 5.2, 5.8
- [ ] 5.12 GitHub Actions: pruebas de la CLI en proyectos limpios con cada versión de Angular soportada.
- [ ] 5.13 Tabla de compatibilidad en la documentación.
- [ ] 5.14 Prerender del showcase: páginas estáticas y 404 con estado real (hoy el modo SPA de Cloudflare responde 200 y la 404 lleva `noindex`). Revisar `not_found_handling` en `wrangler.jsonc` (pasaría a `404-page` con un `404.html`).
- [ ] 5.15 Badge interactivo: variante de Badge sobre `a[mimiBadge]` o `button[mimiBadge]`, con hover y foco (mejora de un componente existente, no un componente nuevo).
- [ ] 5.16 Landing v2: rediseño de la landing según `Landing v2` (`docs/design/Mimi Landing v2.dc.html`), manteniendo el lema «Los componentes son tuyos. Las actualizaciones también.» como titular (spec, sección 1). Usa Mimi Effects (Marquee, Terminal…) cuando existan; textos según la regla de la spec, sección 5.
  - Depende de: E.2, E.4 (si se usan; «cuando existan»)

## Versión 1.0

Cambios que rompen, acumulados para la 1.0 (spec, sección 12, «Compatibilidad que se quita en la 1.0»).

- [ ] 1.0-1 Quitar alias destructive-soft → destructive-ring y renombrar destructive-soft-bg → destructive-soft. Antes, la nota de versión pide buscar `destructive-soft` en el proyecto y cambiarlo a `destructive-ring` (el código copiado con `ring-destructive-soft` seguiría compilando con otro color, sin error); `mimi update` (5.4) avisa si encuentra esa clase.
- [ ] 1.0-2 Quitar los atajos de variante de Button y Badge (`variant="default|secondary|destructive"`): en la nota de versión, `variant="destructive"` → `tone="danger"`, `variant="secondary"` → `tone="secondary"` y `variant="default"` se borra; y los selectores CSS propios sobre `[data-variant="destructive"]` → `[data-tone="danger"]` (spec 12).
- [ ] 1.0-3 Dejar de aceptar `"style": "vivid"` en `mimi.json` como sinónimo de `"mimi"` (la 0.1.0 lo escribe; spec 12). Decidir entonces si la CLI lo corrige al leerlo o si avisa.
- [ ] 1.0-4 Quitar los nombres de tokens de la 0.1.0 (spec 12): `--mimi-btn-padding-x` y `components.button.paddingX`, `--mimi-input-padding-x` y `components.input.paddingX`, `--mimi-input-placeholder-color` y `components.input.placeholderColor`, y `radii.badge` (queda `components.badge.radius`), con sus avisos de `provideMimiTheme`.

## Decisiones pendientes

Solo las abiertas. Las ya tomadas están en `docs/historial/decisiones.md` y en la spec.

- [ ] Grupo 5: el criterio «según lo que pidan los usuarios» sigue abierto (antes, «se prioriza después de la 0.2.0»). Se revisa en la G2.P; la versión se decide en la G4.P.
- [ ] Blocks: todos en la v0.4.0, con el Grupo 3 (decidido el 03/11/2026). Se revisa en la G2.P.
- [ ] Versión de Mimi Effects: se decide en la G4.P.
- [ ] CLI y cdk anterior a `^22.2.0`: avisar o actualizar (ver M.4).
- [ ] Cambios de API que pueda exigir la revisión móvil (ver 5.17).
- [ ] **Convención de valor simple/múltiple** (afecta a G2.1 Toggle Group, G2.7 Slider y G2.8 Combobox; se decide antes de empezar G2.1). PENDIENTE DE DECIDIR: cómo se tipa `[(value)]` cuando un componente tiene dos modos: Toggle Group simple (`T | null`) o múltiple (`T[]`); Slider de un valor (`number`) o de rango (`[number, number]`); Combobox simple (`T | null`) o múltiple (`T[]`). Datos comprobados: según la spec 8 y angular.dev (guide/forms/signals/custom-controls), un control propio implementa `FormValueControl` y `[formField]` enlaza su `value` (model); la misma guía dice que esos controles funcionan con Reactive Forms y formularios de plantilla sin código extra. El modo múltiple se llama `multiple` (decidido el 03/11/2026, G2.1 y G2.8); en el Slider, el nombre del modo de rango es parte de esta decisión.
  - (a) Un solo `value` cuyo tipo cambia con el modo (unión, o genérico según `multiple`/rango). Signal Forms: `[formField]` enlaza `value` en los dos modos; hay que comprobar con un spike si TypeScript acepta un campo `Field<T>` o `Field<T[]>` contra una unión, o si exige el tipo exacto. `ngModel` y `formControlName`: funcionan (la plantilla no comprueba el tipo). Riesgo: en múltiple, un valor que no es arreglo (por ejemplo, `null`) hay que tratarlo como `[]`.
  - (b) Dos modelos: `value` (simple) y `values` (múltiple o rango). Signal Forms: `[formField]` solo enlaza `value`, así que el modo múltiple quedaría fuera; `ngModel` y `formControlName`: igual. Descartada en la práctica.
  - (c) Dos selectores o componentes por modo (por ejemplo, `mimi-toggle-group` y `mimi-toggle-group[multiple]` como directivas distintas, o `mimi-slider` y `mimi-range-slider`), con el código compartido por dentro. Signal Forms, `ngModel` y `formControlName`: cada uno con su tipo exacto, sin uniones. Costo: más API y dos tablas en cada página.
  - (d) Siempre arreglo (`T[]` también en simple; `[number]` en el Slider de un valor). Signal Forms y los demás: un solo tipo exacto. Costo: incómodo para el caso más común (el usuario quiere `T`, no `[T]`), y distinto de Select (G1.5, `T | null`).
  - Recomendación: (a), con un spike corto de Signal Forms al empezar G2.1 (un campo `T` y otro `T[]` contra el mismo componente); si TypeScript no acepta la unión con `[formField]`, (c). Lo que se decida vale para las tres tareas.
- [ ] **CSS global e `initial` por encima del aviso** (afecta a todo el Grupo 2; se decide antes de empezar el grupo). La estimación de la G2.0b da unos 164 kB crudo de CSS global y unos 498 kB de `initial` al cerrar el grupo, por encima de los avisos (130 kB y 475 kB) de la spec 10. El budget `initial` suma el JS inicial y el CSS global (spec 10, «Regla del `initial`»), así que el CSS lo arrastra. Los presupuestos son del **sitio de documentación**, no de los usuarios de Mimi: un proyecto que copia componentes solo genera el CSS de esos componentes.
  - Política propuesta por el usuario (03/11/2026), PENDIENTE DE DECIDIR los números: se mide el **gzip real** del CSS global en cada tarea. Si se mantiene bajo un límite de gzip (a definir con las mediciones; el usuario dio como ejemplo «menos de 30 kB»), se suben los techos del CSS global **y** del `initial` (con la misma regla de la spec 10: el `initial` es la suma de los techos del JS inicial y del CSS global), con la justificación escrita en la spec 10. Si el gzip pasa ese límite, se reduce el CSS antes de subir nada (por ejemplo, revisar clases repetidas o valores arbitrarios que generan una regla cada uno, o separar el CSS de las páginas internas del showcase).
  - Los números (límite de gzip y techos nuevos) los decide el usuario con las mediciones; el plan no los propone (CLAUDE.md: «Ningún presupuesto se sube sin que lo decida el usuario»).
  - Cómo se mide: el informe de `pnpm build:docs` de cada tarea (`check-initial-js.mjs` da el JS inicial y el CSS global, crudo y gzip; el `initial` es su suma en crudo), una tabla acumulada en la G2.P y, si un aviso salta, la lista de las reglas que más pesan en el CSS generado. Medición de partida (03/11/2026): CSS global 120,08 / 17,67 kB, JS inicial 333,94 / 105,24 kB (crudo / gzip), `initial` 454,02 kB.

### Índice de lo que está «PENDIENTE DE DECIDIR»

Una línea por pregunta, con la tarea donde está escrita completa (opciones y recomendación). Se actualiza al terminar cada tanda del plan y cada vez que se decide algo (la línea se borra y la decisión queda en su tarea con la fecha). Al 03/11/2026 (tanda D): 74 preguntas (51 de la tanda C, menos la contradicción del Slider con Tooltip, ya decidida, más 10 de G2.9, 5 de G2.11 y 9 de G2.12; la pregunta del Combobox sobre Select se decidió y la reemplaza otra sobre dónde viven las utilidades nuevas). No cuenta las referencias «la base técnica (ver arriba)» ni «PENDIENTE DE DECIDIR en preguntas», que remiten a otra de la lista.

**(a) Compartidas: se deciden antes de empezar el grupo o la primera tarea que las usa.**

- Decisiones pendientes: convención de valor simple/múltiple: cómo se tipa `[(value)]` con dos modos (G2.1, G2.7, G2.8; antes de G2.1).
- Decisiones pendientes: los números de la política del presupuesto (límite de gzip del CSS global y techos nuevos del CSS global y del `initial`), con las mediciones (antes del Grupo 2).
- G2.0b: ¿algún global nuevo va por preset (`MimiThemePreset`) o todos solo en el CSS?
- G2.0: ¿el keyframe `mimi-indet` de Progress es global (spec 13) o queda dentro de Progress?
- G2.0: Date Picker y Date Range, ¿una tabla de tokens o dos?
- G2.6 (y G2.8): ¿el chip es una pieza compartida (ítem de la CLI) entre Tags Input y el Combobox múltiple?
- G2.8: qué se comparte con Tags Input (chip, Backspace y anuncios).

**(b) Se deciden al empezar su tarea.**

- M.4: con un cdk anterior a `^22.2.0`, ¿la CLI solo avisa o también actualiza el rango?
- G2.1: base técnica del foco itinerante (`FocusKeyManager` del CDK o `ngToolbarWidgetGroup` de aria).
- G2.1: en simple, ¿se puede dejar sin elección pulsando la elegida?
- G2.1: nombre de la variante con el elegido en `primary` (`variant="solid"`).
- 5.2: el modo claro/oscuro de la vista previa, ¿cambia todo el sitio o solo el contenedor?
- G2.2: base técnica (`input type="text"` con `role="spinbutton"` o `type="number"` nativo).
- G2.2: nombres de la API.
- G2.2: el campo vacío, ¿es `null` o vuelve a `min`/0?
- G2.2: rueda del mouse, mantener pulsado, Re Pág/Av Pág e Inicio/Fin.
- G2.2: ¿los botones −/+ son paradas de Tab?
- G2.3: nombres de la API.
- G2.3: cómo se calcula el medidor (heurística del diseño y función del usuario, solo función, o biblioteca).
- G2.3: ¿las reglas del medidor se configuran o son fijas?
- G2.3: la API (contenedor que proyecta el input o directiva `input[mimiPassword]`).
- G2.4: ¿el modelo guarda el valor con máscara o sin ella? (decide si G2.4a es directiva o control propio).
- G2.4: nombres de la API (dependen de la pregunta anterior).
- G2.4: ¿más símbolos que `0` (letras, alfanumérico)?
- G2.4: Ctrl+Z después de un reformateo: comportamiento del navegador o pila propia.
- G2.4: marca de tarjeta, Luhn y fecha: ¿validadores de Mimi o solo ejemplos?
- G2.5: nombres de la API.
- G2.5: un input real con casillas visuales o un input por casilla.
- G2.5: ¿solo dígitos o también letras?
- G2.6: navegación con el teclado entre etiquetas (sin flechas, flechas con `FocusKeyManager`, u otra).
- G2.6: nombres de la API.
- G2.6: ¿la normalización del diseño (minúsculas y sin `#`) es la de Mimi por defecto?
- G2.6: pegado de varias etiquetas, ¿se separan y se agregan todas?
- G2.7: base técnica (`input type="range"` nativo, dos nativos superpuestos, pulgares propios con `role="slider"` o un nativo invisible por pulgar como Angular Material).
- G2.7: nombres de la API.
- G2.7: orientación vertical y RTL.
- G2.7: ¿dividir en G2.7a (un valor) y G2.7b (rango doble)?
- G2.8: dónde viven las utilidades nuevas de lista (ítem compartido de la CLI o `utils/`) y qué incluyen.
- G2.8: nombres de la API.
- G2.8: crear un valor nuevo, ¿`creatable` con `(create)` o lo hace el usuario?
- G2.8: Escape con el panel cerrado, ¿borra lo escrito o no hace nada?
- G2.8: ¿dividir en G2.8a (simple) y G2.8b (múltiple con chips)?
- G2.9: la cuadrícula (`ngGrid` de aria o propia con `FocusKeyManager`).
- G2.9: nombres de la API.
- G2.9: cómo se guarda la fecha (`Date`, cadena ISO, `Temporal.PlainDate` o un adaptador).
- G2.9: cómo se localiza (`Intl.DateTimeFormat` con `LOCALE_ID` y `locale`, o `DatePipe` con datos registrados).
- G2.9: ¿Date Range es un componente aparte o un modo del Date Picker?
- G2.9: ¿un `mimi-calendar` suelto?
- G2.9: ¿se puede escribir la fecha a mano?
- G2.9: en el rango, ¿el modelo cambia con solo el inicio elegido?
- G2.9: ¿atajos por defecto en el rango o solo los del usuario?
- G2.9: ¿dividir en G2.9a (calendario y una fecha) y G2.9b (rango)?
- G2.10: base técnica (`div` con `role="progressbar"` o `<progress>` nativo).
- G2.10: nombres de la API.
- G2.10: ¿un componente con `shape` o dos?
- G2.10: ¿el texto y el valor de arriba de la barra son parte del componente?
- G2.10: con movimiento reducido, ¿el círculo indeterminado deja de girar o «late»?
- G2.11: nombres y forma de la API.
- G2.11: hasta dónde llega Mimi y cómo recibe el estado de la subida (un componente, dos piezas o una función `upload`).
- G2.11: un archivo rechazado, ¿entra en el valor marcado como error o queda fuera?
- G2.11: la zona de soltar, ¿`div` con `role="button"` o `<button>` nativo?
- G2.11: ¿el ícono y el color por tipo de archivo son del componente o del ejemplo?
- G2.12: nombres de la API.
- G2.12: el formato del valor (siempre hex, el formato elegido o un objeto).
- G2.12: los espacios de color (HSV como el diseño u OKLCH).
- G2.12: el disparador (panel y disparador, solo disparador o solo panel).
- G2.12: ¿el tono usa el Slider de Mimi o un control propio?
- G2.12: el área de dos dimensiones, ¿un `role="slider"` o dos?
- G2.12: el borde y las sombras fijos de los pulgares: ¿excepción documentada o tokens del componente?
- G2.12: ¿paleta por defecto o solo la del usuario?
- G2.12: la paleta y los recientes, ¿una parada de Tab por muestra o un grupo con flechas?

**(c) Se deciden solo si se llega a esa parte.**

- G2.1: ¿Toggle Group dentro de mimi-toolbar? (solo si la toolbar llega a tener grupos con nombre).
- G2.7: distancia mínima entre pulgares, ¿entrada `minRange` o validador del formulario? (solo con el rango doble).
- 5.17: ¿qué cambios de API exige la revisión móvil y alguno va antes de la 0.3.0? (solo si la revisión los encuentra).

## Terminado

Una línea por tarea. La fecha es la del «Hecho» del plan cuando la tenía y, si no, la del commit de la tarea. El texto completo está en `docs/historial/`.

**Fases 0 a 3** (`docs/historial/plan-fase-0-3.md`)

- [x] 0.1 Instalar Node.js, pnpm y git (sin fecha registrada).
- [x] 0.2 Diseños de Claude Design en `docs/design/` (22/09/2026).
- [x] 0.3 Estilo del MVP: un solo tema base, Mimi (sin fecha registrada).
- [x] 0.4 `git init` y primer commit (22/09/2026).
- [x] 1.1 Monorepo (22/09/2026).
- [x] 1.2 `apps/docs` y `packages/ui-core` (22/09/2026).
- [x] 1.3 Tokens en `theme-base.css` (22/09/2026).
- [x] 1.4 Utils `cn.ts` y `control-styles.ts` (22/09/2026).
- [x] 1.4b Workspace de Angular en la raíz (23/09/2026).
- [x] 1.5 Tema: `types.ts` y `provideMimiTheme()` (23/09/2026).
- [x] 1.6 Layout del showcase (23/09/2026).
- [x] 1.7 `CodePreview` (23/09/2026).
- [x] 2.1 Button (24/09/2026).
- [x] 2.2 Input (24/09/2026).
- [x] 2.3 Textarea (24/09/2026).
- [x] 2.4 Badge (24/09/2026).
- [x] 2.5 Card (24/09/2026).
- [x] 2.6 Separator (25/09/2026).
- [x] 2.7 Skeleton (25/09/2026).
- [x] 2.8 Avatar (28/09/2026).
- [x] 2.9 Switch (28/09/2026).
- [x] 2.10 Checkbox (28/09/2026).
- [x] 2.11 FormField y FormError (29/09/2026).
- [x] 2.12 Landing del showcase (29/09/2026).
- [x] 3.1 `packages/cli` y `registry.json` (29/09/2026).
- [x] 3.2 Build de las plantillas de la CLI (29/09/2026).
- [x] 3.3 Schematic `init` (29/09/2026).
- [x] 3.4 Schematic `ng-add` (29/09/2026).
- [x] 3.5 Schematic `ui` (29/09/2026).
- [x] 3.6 `schematicCollections` (29/09/2026).
- [x] 3.7 Prueba de la CLI en proyectos limpios (29/09/2026).
- [x] 3.8 Versión del showcase desde `@mimi-ng/cli` (29/09/2026).
- [x] 3.9 Instalación revisada contra la CLI real (29/09/2026).

**Versiones 0.1.0 y 0.1.1** (`docs/historial/plan-0.1.x.md`)

- [x] L.1 READMEs (29/09/2026).
- [x] L.2 `package.json` de la CLI (sin fecha registrada).
- [x] L.3 Documentación en Cloudflare Workers (30/09/2026).
- [x] L.3b Comando `ng g mimi` (30/09/2026).
- [x] L.4 Dry-run del paquete (30/09/2026).
- [x] L.5 Quitar `"private": true` (30/09/2026).
- [x] L.6 Después de publicar la 0.1.0 (30/09/2026).
- [x] 0.1.1-1 `ng add --icons=false` (04/10/2026).
- [x] 0.1.1-2 `minimumReleaseAge` de pnpm (04/10/2026).

**Fase 4 y Grupo 1, v0.2.0** (`docs/historial/plan-grupo-1.md`; publicada el 21/10/2026)

- [x] D1 Diseño de tokens, Grupo 1 y mimi-toolbar (01/10/2026).
- [x] 4.3 Evaluar `@angular/aria` frente a `@angular/cdk` (01/10/2026).
- [x] 4.4 Páginas /dev fuera del build de producción (04/10/2026).
- [x] T.0 Catálogo de tokens en la spec 13 (01/10/2026).
- [x] T.0b Tokens propios de los componentes existentes (06/10/2026).
- [x] T.1 Tokens nuevos de `tokens-mimi.css` (01/10/2026).
- [x] V.1 Variante y tono en Button y Badge (01/10/2026).
- [x] V.2 Quitar el nombre «Vivid» del código (04/10/2026).
- [x] G1.1 Popover (06/10/2026).
- [x] G1.2 Tooltip (07/10/2026).
- [x] G1.3 Dropdown Menu (12/10/2026).
- [x] G1.4 Context Menu (13/10/2026).
- [x] G1.5 Select (13/10/2026).
- [x] G1.5b Revisión de aria después del Select (13/10/2026). La lista de rodeos de aria está ahora en la spec 4, «Base técnica», subsección «Rodeos de aria»; el resto, en el historial.
- [x] G1.6 Dialog (13/10/2026).
- [x] G1.7 Confirm (14/10/2026).
- [x] G1.8 Toast (14/10/2026).
- [x] G1.9 Tabs (15/10/2026).
- [x] G1.10 mimi-toolbar (20/10/2026).
- [x] G1.11 Pagination (20/10/2026). PENDIENTE: el informe de cierre de la G1.11 («Comprobado en Chrome real: ver el informe de cierre») no está en el repo; lo tiene el usuario en el chat.
- [x] G1.12 Página «Fundamentos» (20/10/2026).

**Tandas de diseño** (texto completo en la línea)

- [x] D2 Diseño: Grupo 2 y Theme Studio. Archivos: `F3 Archivos Tags Toggle Color` (con `Color Picker`), `F3 Combobox Fechas Hora`, `F3 Slider OTP Numero Mascara` y `Theme Studio`; variables en `mimi-variables-fase3.css` (en `tokens-mimi.css`). La hoja de tokens todavía no tiene tablas para estos componentes: se agregan antes de construirlos. (Theme Studio pasó a ser un proyecto aparte: `docs/futuro/theme-studio.md`.)
- [x] D3 Diseño: Grupo 3. Archivos: `F4 Command Tree Sortable`, `F4 Data Table y Pagination` (con `Data Table`) y `F4 Panel admin` (composición de referencia).
- [x] D4 Diseño: Grupo 4, Grupo 5 y Mimi Effects. Archivos: `F5 Estructura`, `F5 Dashboard y Media` y `F5 Effects`.
- [x] D5 Diseño: Blocks. Archivos: `F6 Blocks` (índice) y `Block <nombre>` de cada uno.

**Plataforma** (`docs/historial/plan-plataforma.md`)

- [x] 5.7 Publicar `@mimi-ng/cli` en npm (30/09/2026, en la 0.1.0).
- [x] 5.11 CodePreview e InstallCommand con `<mimi-tabs>` (20/10/2026).
