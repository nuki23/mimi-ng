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
6. Presupuestos de bundle (spec 10): JS inicial y CSS, crudo y gzip, antes y después.
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
- [ ] 0.1.1-3 `pnpm publish` da 404 aunque `npm whoami` funciona (pnpm 12 no usa la sesión de `npm login`). Mientras se resuelve, publicar con `npm publish` desde `packages/cli`. Investigar cómo autentica pnpm 12.

## Diseño

- [ ] D6 Correcciones de diseño pendientes (Claude Design). La lista está en `docs/design/correcciones-pendientes.md`: cada componente nuevo agrega ahí lo que hizo distinto del diseño o sin diseño, y se resuelve en Claude Design cuando se decida, sin bloquear ningún grupo. Quién: el usuario resuelve en Claude Design; Claude Code anota.

## Grupo 2 → v0.3.0: entradas avanzadas

Componentes de la spec 4 («Hoja de ruta», tabla del Grupo 2). Orden recomendado (respeta las dependencias): G2.0 → G2.0b → G2.1 → 5.2 → G2.10 → G2.2 → G2.3 → G2.4 → G2.5 → G2.6 → G2.7 → G2.8 → G2.9 → G2.11 → G2.12 → 5.17 → G2.P. Con las dependencias cumplidas, el orden entre G2.2 a G2.5 se puede cambiar.

- [ ] G2.0 Catálogo de tokens del Grupo 2 en la spec 13
  - v0.3.0 · Tamaño M · Depende de: — · Bloquea: G2.0b, G2.1, G2.2, G2.3, G2.4, G2.5, G2.6, G2.7, G2.8, G2.9, G2.10, G2.11, G2.12
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
  - v0.3.0 · Tamaño M · Depende de: G2.0 · Bloquea: G2.1, G2.2, G2.3, G2.4, G2.5, G2.6, G2.7, G2.8, G2.9, G2.10, G2.11, G2.12, 5.2
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
    - Presupuesto del CSS global, crudo y gzip, antes y después. Techo: aviso en 130 kB y error en 145 kB; la última medición (21/10/2026) fue 120,08 kB crudo y 17,67 kB gzip, así que quedan 9,92 kB hasta el aviso y 24,92 kB hasta el error.
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
    - `<mimi-toggle-group [(value)] [multiple] [disabled] aria-label class>`. El modo múltiple se llama `multiple` (booleano), igual que en el Combobox (G2.8) (decidido el 03/11/2026). Cómo se tipa `value` en los dos modos: ver «Preguntas abiertas».
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
    - Bundle: JS inicial y CSS, crudo y gzip, antes y después; el componente es lazy, así que el JS inicial solo suma la ruta y la sidebar (si crece más, explicar por qué).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: la base técnica (ver arriba).
    - PENDIENTE DE DECIDIR: en simple, ¿se puede dejar sin elección volviendo a pulsar la elegida? El diseño no lo muestra (al pulsar la elegida no cambia). Recomendación: no, como una radio.
    - PENDIENTE DE DECIDIR: cómo se tipa `[(value)]` en los dos modos (la misma decisión vale para el Combobox, G2.8). Según la spec 8, un control propio se enlaza a los formularios por su `value` (`FormValueControl`).
      - (a) Un solo `value`, `T | null` en simple y `T[]` en múltiple (tipo unión, o genérico según `multiple`). Signal Forms: `[formField]` funciona en los dos modos porque enlaza `value`, pero hay que comprobar con un spike si TypeScript acepta un campo `Field<T>` o `Field<T[]>` contra una unión, o si exige el mismo tipo exacto. `ngModel` y `formControlName`: funcionan (no comprueban el tipo en la plantilla). Riesgo: en múltiple, un valor que no es un arreglo (por ejemplo, `null` desde el formulario) hay que tratarlo como `[]`.
      - (b) `value` (simple) y `values` (múltiple) separados. Signal Forms: `[formField]` solo enlaza `value`, así que el modo múltiple quedaría fuera de Signal Forms. `ngModel` y `formControlName`: igual, solo `value`. Descartada en la práctica.
      - (c) Dos selectores sobre el mismo código (por ejemplo, `mimi-toggle-group` y `mimi-toggle-group[multiple]` como directivas distintas, o dos componentes). Signal Forms, `ngModel` y `formControlName`: cada uno con su tipo exacto (`T | null` y `T[]`), sin uniones. Costo: más API y dos tablas en la página.
      - Recomendación: (a), con un spike corto de Signal Forms al empezar G2.1; si TypeScript no acepta la unión con `[formField]`, pasar a (c). Lo que salga se anota también en G2.8.
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
    - `pnpm build`, `pnpm test`, `pnpm format:check` en verde; bundle (JS inicial y CSS, crudo y gzip, antes y después).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: el modo claro/oscuro de la vista previa, ¿cambia todo el sitio (el `ThemeService` del showcase) o solo el contenedor de la vista previa (clase `dark` en el contenedor)? Recomendación: solo el contenedor, para no cambiar el modo que eligió el usuario.
- [ ] G2.2 Number Input. Diseño: `F3 Slider OTP Numero Mascara`.
  - v0.3.0 · Tamaño M · Depende de: G2.0, G2.0b (spec 4: `utils/control-styles` y `FormValueControl`) · Bloquea: —
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración PrimeNG InputNumber y HeroUI; «El valor vive en Mimi»); spec 8 (`FormValueControl`, `MIMI_FIELD_CONTROL`, `touch`, mensajes de error); spec 13 (su tabla, de la G2.0; la de Input como referencia de alturas); la 2.2 Input en `docs/historial/plan-fase-0-3.md` y la G1.5 Select en `docs/historial/plan-grupo-1.md` (control propio con `FormValueControl` y anillo en la caja); la G1.11 Pagination (botones con `aria-disabled` en los extremos y campo numérico con ↑/↓).
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
    - Formato y lectura correctos en al menos `en-US`, `es-MX` y `es-ES` (prueba con coma decimal); `aria-valuetext` con el texto formateado.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Textos con `provideMimiNumberInputText` y su versión `_ES`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi number-input` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS, crudo y gzip, antes y después (componente lazy: el JS inicial solo suma la ruta y la sidebar; si crece, explicar por qué).
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
    - Anuncios: PENDIENTE DE DECIDIR en preguntas (anunciar el nivel en cada tecla satura al lector).
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
    - Mostrar/ocultar con el teclado y el puntero; `aria-pressed` y nombre del botón correctos; el foco no se mueve; foco visible.
    - Estados claro, oscuro, deshabilitado, error y solo lectura.
    - Medidor con la heurística por defecto, documentada como orientativa, y con la función propia del usuario; prueba de los tres niveles del diseño.
    - Probado a mano con el autocompletado de Chrome (guardar y rellenar).
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX`, con prueba; tabla en `component-tokens.ts`; globales con valor de respaldo.
    - Textos con `provideMimiPasswordText` y su versión `_ES`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi password` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS, crudo y gzip, antes y después (componente lazy).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: cómo se calcula el medidor. Opciones: (a) la heurística del diseño por defecto (las cuatro reglas) y una función del usuario como entrada (`[strength]="miFuncion"`) que devuelve el nivel; (b) solo la función del usuario, sin heurística; (c) una biblioteca (descartada: dependencia nueva). Recomendación: (a), documentada como orientativa y no como medida de seguridad.
    - PENDIENTE DE DECIDIR: ¿las reglas («8 caracteres o más»…) se configuran (cuáles y su texto) o son fijas? Recomendación: configurables, con las cuatro del diseño por defecto.
    - PENDIENTE DE DECIDIR: ¿se anuncia el nivel al escribir? Recomendación: no en cada tecla; el nivel queda en `aria-describedby` y el lector lo lee al llegar al campo.
    - PENDIENTE DE DECIDIR: la API (contenedor que proyecta el input, o una directiva `input[mimiPassword]` que inserta el botón al lado). Recomendación: el contenedor, como `mimi-form-field`.
- [ ] G2.4 Input Mask. Diseño: `F3 Slider OTP Numero Mascara`.
  - v0.3.0 · Tamaño L (propuesta de división en «Preguntas abiertas») · Depende de: G2.0, G2.0b, 2.2 (Input, hecha) · Bloquea: —
  - Estado: —
  - Leer antes: spec 4 (tabla del Grupo 2: inspiración PrimeNG InputMask, depende de Input); spec 8 (campos nativos con directiva; Signal Forms y Reactive Forms; no envolver el `<input>`, CLAUDE.md regla 6; regla 7: el estado de Reactive Forms no es un signal); spec 13 (su tabla, de la G2.0); la 2.2 Input y la 2.11 FormField en `docs/historial/plan-fase-0-3.md`.
  - Diseño: `F3 Slider OTP Numero Mascara`, sección «7 · Input Mask» (marcado, `mask()` y `applyMask` del script). Lo que muestra:
    - Sintaxis: `0` es un dígito; el resto, literales (`(00) 0000 0000`, `00/00/0000`, `0000 0000 0000 0000`).
    - Un marcador de lo que falta (`ghost`, por ejemplo `DD/MM/AAAA`) dibujado debajo del texto, `aria-hidden`; `inputmode="numeric"`; `autocomplete` por campo (`tel-national`, `cc-number`).
    - Extras de los ejemplos: prefijo fijo (`+52`), ícono, marca de la tarjeta (VISA, MASTERCARD, AMEX), ícono de válido (`circle-check`), validación al completar (fecha que no existe, número de tarjeta con Luhn), mensaje en `aria-describedby`.
    - En el estado del diseño, el campo guarda **solo los dígitos** (`mask[key]`) y la máscara se aplica al mostrar.
    - Estados: normal, hover, foco, deshabilitado y con error («31/02 no existe.»).
  - Objetivo: un campo de texto que da formato mientras se escribe (teléfono, fecha, tarjeta), sin perder el cursor y sin romper los formularios.
  - Alcance: incluye la sintaxis de dígitos del diseño, literales, el marcador de lo que falta, `inputmode` y `autocomplete` del usuario, formularios. Propuestas tuyas que el diseño **no** muestra (marcadas así): posición del cursor al escribir y borrar en medio, pegado, deshacer, composición de texto (IME). NO incluye en el componente: la marca de la tarjeta, Luhn ni la validación de fechas (son de la demo; ver preguntas).
  - Base técnica: ninguna. No hay patrón de aria ni de la APG: es un campo de texto nativo con una directiva (spec 8).
  - API pública propuesta (PENDIENTE DE DECIDIR en los nombres): `<input mimiInput [mimiMask]="'(00) 0000 0000'" [mimiMaskPlaceholder]="'(55) 0000 0000'" inputmode="numeric" autocomplete="tel-national" formControlName="…" />`, directiva sobre el input nativo, compatible con `mimiInput`.
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
  - Criterios de hecho:
    - Funciona con `[formField]`, `formControlName` y `[(ngModel)]`, con pruebas (escribir, pegar, valor desde el formulario, `disabled`, errores).
    - Cursor correcto al escribir y al borrar en medio; pegado con y sin literales; IME sin reformatear a mitad; deshacer según lo que se decida. Con pruebas.
    - Teclado nativo intacto; foco visible; estados claro, oscuro, deshabilitado, error y solo lectura.
    - Tokens registrados en `theme/types.ts` y `COMPONENT_PREFIX` si los hay, con prueba; tabla en `component-tokens.ts`.
    - Página del showcase con todos los estados y la tabla de API.
    - Spec 4 y 13 al día; diferencias con el diseño en `correcciones-pendientes.md`.
    - `registry.json`, pruebas de la CLI y `ng g mimi input-mask` probado en un proyecto limpio.
    - Bundle: JS inicial y CSS, crudo y gzip, antes y después (directiva lazy en el showcase).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: ¿el modelo guarda el valor con máscara («(55) 1234 5678») o sin ella («5512345678»)? Con una directiva sobre el input nativo, Reactive Forms y `ngModel` leen lo que hay en el campo (con máscara); guardar sin máscara obligaría a reemplazar su `ControlValueAccessor` (prohibido, spec 8) o a hacer un control propio con `FormValueControl` que envuelva el input (va contra la regla 6 de CLAUDE.md y contra la dependencia «Input» de la spec 4). Opciones: (a) con máscara, y una función exportada para quitarla (`mimiUnmask`); (b) sin máscara, con un control propio; (c) con máscara por defecto y una salida (`(rawChange)`) con los dígitos. Recomendación: (a), por las reglas citadas; el diseño guarda solo dígitos en su estado, así que la diferencia va a `correcciones-pendientes.md`.
    - PENDIENTE DE DECIDIR: ¿más símbolos que `0` (letras, alfanumérico)? El diseño solo usa `0`. Recomendación: solo `0` en esta versión.
    - PENDIENTE DE DECIDIR: Ctrl+Z después de un reformateo: ¿se acepta que deshaga solo hasta el último cambio de Mimi, o se lleva una pila propia? Recomendación: aceptar el comportamiento del navegador y documentarlo.
    - PENDIENTE DE DECIDIR: marca de tarjeta, Luhn y validación de fecha: ¿parte de Mimi (validadores exportados) o solo en los ejemplos? Recomendación: solo en los ejemplos.
    - PENDIENTE DE DECIDIR (tamaño L): dividir en G2.4a «Máscara de dígitos: directiva, cursor, pegado, IME y formularios» y G2.4b «Marcador de lo que falta, prefijo e ícono del diseño», con G2.4b dependiendo de G2.4a. Recomendación: dividir.
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
    - Bundle: JS inicial y CSS, crudo y gzip, antes y después (componente lazy).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: un solo input real con casillas visuales (lo que muestra el diseño) o un input por casilla. Con un input, el lector lee un campo con el código entero, y el pegado, el borrado y el autocompletado del SMS funcionan sin código extra. Con varios inputs, el lector anuncia cada casilla como un campo aparte (cada una necesita su nombre, por ejemplo «Dígito 1 de 6»), y el pegado, el borrado hacia atrás y el autocompletado del SMS hay que reprogramarlos. Recomendación: un solo input real, como el diseño.
    - PENDIENTE DE DECIDIR: ¿solo dígitos o también letras (algunos códigos son alfanuméricos)? El diseño solo usa dígitos. Recomendación: dígitos por defecto y una opción para alfanumérico, con `inputmode` acorde.
- [ ] G2.6 Tags Input. Diseño: `F3 Archivos Tags Toggle Color`.
  - Depende de: G2.0, G2.0b, 2.4 (Badge, hecha), 2.2 (Input, hecha) · Bloquea: G2.8
- [ ] G2.7 Slider (rango doble). Diseño: `F3 Slider OTP Numero Mascara`.
  - Depende de: G2.0, G2.0b, G1.2 (Tooltip, hecha) · Bloquea: G2.12
- [ ] G2.8 Combobox/Autocomplete (múltiple con chips). Diseño: `F3 Combobox Fechas Hora`.
  - Depende de: G2.0, G2.0b, G1.1 (Popover, hecha), G1.5 (lógica de lista de Select, hecha), G2.6 · Bloquea: G3.3
- [ ] G2.9 Date Picker y Date Range. Diseño: `F3 Combobox Fechas Hora`.
  - Depende de: G2.0, G2.0b, G1.1 (Popover, hecha), 2.1 (Button, hecha)
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
    - Bundle: JS inicial y CSS, crudo y gzip, antes y después (componente lazy: el JS inicial solo suma la ruta y la sidebar).
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR: la base técnica (ver arriba).
    - PENDIENTE DE DECIDIR: un componente con `shape` o dos (`mimi-progress` y `mimi-progress-circle`). Recomendación: uno, con `shape`.
    - PENDIENTE DE DECIDIR: ¿el texto y el valor de arriba de la barra son parte del componente (por ejemplo, `label` y `showValue`) o los pone el usuario? Recomendación: los pone el usuario, y el círculo muestra el valor dentro (como el diseño).
    - PENDIENTE DE DECIDIR: con movimiento reducido, ¿el círculo indeterminado deja de girar o «late» como la barra? El diseño solo lo dice de la barra. Recomendación: que lata, como la barra; anotarlo en `correcciones-pendientes.md`.
- [ ] G2.11 File Upload, con Progress. Diseño: `F3 Archivos Tags Toggle Color`.
  - Depende de: G2.0, G2.0b, 2.1 (Button, hecha), G2.10
- [ ] G2.12 Color Picker. Diseño: `Color Picker` (en `F3 Archivos Tags Toggle Color`).
  - Depende de: G2.0, G2.0b, G1.1 (Popover, hecha), G2.7, 2.2 (Input, hecha)
- [ ] 5.17 Revisión móvil componente por componente, después del Grupo 1: cómo se usa cada uno en pantallas chicas. Por ejemplo, en móvil el Select se abre como un panel flotante tipo modal en la parte superior, con buscador y más opciones visibles. mimi-toolbar (G1.10): una horizontal más ancha que la pantalla no se parte ni se achica; hoy el componente no hace nada y el ejemplo la pone en un contenedor con `overflow-x-auto` (los botones no se encogen).
  - v0.3.0 · Tamaño L · Depende de: G2.1 a G2.12 · Bloquea: G2.P
  - Dato de la G1.5: la API del Select no depende del overlay; un panel tipo hoja o modal se puede hacer después cambiando la estrategia de posición y las clases del panel, sin tocar entradas ni salidas.
  - PENDIENTE DE DECIDIR: ¿qué cambios de API podría exigir la revisión (por ejemplo, el Select como panel modal en móvil), y alguno debe hacerse antes de la 0.3.0?
- [ ] G2.P Puerta del Grupo 2 (v0.3.0): la lista de «Puerta del grupo» de «Cómo usar este plan», más:
  - CHANGELOG de la 0.3.0: explicar los tokens globales nuevos del Grupo 2 (G2.0b), que los componentes funcionan con un tema que no los tenga (usan valor de respaldo) y que, si el usuario modificó su tema, la CLI no lo actualiza y solo avisa.
  - Revisar la decisión de los Blocks (todos en la v0.4.0, con el Grupo 3; spec 4, «Blocks»).
  - Revisar con la respuesta real de los usuarios a la 0.2.0 si algo del Grupo 5 sube de prioridad.
  - Depende de: G2.0, G2.0b, G2.1 a G2.12, 5.2, 5.17

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
- [ ] Angular 22.2.x: alineación de versiones (ver M.2).
- [ ] CLI y cdk anterior a `^22.2.0`: avisar o actualizar (ver M.4).
- [ ] Cambios de API que pueda exigir la revisión móvil (ver 5.17).

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
