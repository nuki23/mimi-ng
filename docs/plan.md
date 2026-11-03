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
- [ ] M.2 Angular 22.2.4 completo cuando salga core (trae #33974 del combobox). Hoy (21/10/2026) cdk y aria ya están en 22.2.4 y core, cli y build en 22.2.3: se sube todo junto, en la misma versión exacta, con `pnpm dedupe` para que las peers de ui-core no queden en la anterior.
  - Comprobado el 03/11/2026 con `npm view`: `@angular/core` 22.2.4 salió el 29/10/2026 (es la última de core); `@angular/cdk`, `@angular/aria` y `@angular/cli` ya están en 22.2.5.
  - PENDIENTE DE DECIDIR: con core en 22.2.4 y cdk, aria y cli en 22.2.5, «todos en la misma versión exacta» ya no es posible. ¿Se sube core (y los paquetes del framework) a 22.2.4 y cdk, aria, cli y build a 22.2.5 (aria sigue igual a cdk), o se espera a core 22.2.5?
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

Componentes de la spec 4 («Hoja de ruta», tabla del Grupo 2). Orden: G2.0, 5.2, G2.1 a G2.12 (el orden fino dentro del grupo se fija al detallar las tareas), 5.17 y G2.P.

- [ ] G2.0 Catálogo de tokens del Grupo 2 en la spec 13, hecho por Claude Code igual que la T.0: una tabla por componente, sacada de los `.dc.html` (`F3 Archivos Tags Toggle Color`, `F3 Combobox Fechas Hora`, `F3 Slider OTP Numero Mascara`, `Color Picker`, y `F5 Estructura` para Progress) y de `mimi-variables-fase3.css`. El usuario aprueba cada tabla antes de empezar los componentes. Lo que el diseño no tenga va a `docs/design/correcciones-pendientes.md`: no se inventa.
  - Tamaño M · Depende de: — · Bloquea: G2.1, G2.2, G2.3, G2.4, G2.5, G2.6, G2.7, G2.8, G2.9, G2.10, G2.11, G2.12
- [ ] 5.2 Página «Tema» sencilla (después de la 0.2.0; spec 11, «Página "Tema"»). Ruta `/docs/theme`, lazy, en Primeros pasos. Cambia solo variables globales: color principal (unas muestras de color y un `<input type="color">` nativo, sin depender del Color Picker), radio, y claro/oscuro para previsualizar. Vista previa con algunos componentes reales. Botón para copiar el resultado como CSS (`:root` y `.dark`) y como preset de `provideMimiTheme()`. Usa el mismo sistema que el usuario: arma un `MimiThemePreset` y lo aplica con `applyMimiTheme` / `mimiThemeToCss`, sin otro camino ni variables propias. Sin guardar, sin cuentas y sin edición por componente. (Antes «Temas» con personalizador; el editor completo, Theme Studio, es un proyecto aparte: `docs/futuro/theme-studio.md`.)
  - v0.3.0 · Depende de: — (va primera después de G2.0 por decisión del 03/11/2026, no por dependencia) · Bloquea: 5.10
- [ ] G2.1 Toggle Group. Diseño: `F3 Archivos Tags Toggle Color`.
  - Depende de: G2.0
- [ ] G2.2 Number Input. Diseño: `F3 Slider OTP Numero Mascara`.
  - Depende de: G2.0 (spec 4: `utils/control-styles` y `FormValueControl`)
- [ ] G2.3 Password (mostrar/ocultar y medidor de seguridad). Diseño: `F3 Slider OTP Numero Mascara`.
  - Depende de: G2.0, 2.2 (Input, hecha)
- [ ] G2.4 Input Mask. Diseño: `F3 Slider OTP Numero Mascara`.
  - Depende de: G2.0, 2.2 (Input, hecha)
- [ ] G2.5 Input OTP. Diseño: `F3 Slider OTP Numero Mascara`.
  - Depende de: G2.0 (spec 4: `utils/control-styles`) · Bloquea: B.5
- [ ] G2.6 Tags Input. Diseño: `F3 Archivos Tags Toggle Color`.
  - Depende de: G2.0, 2.4 (Badge, hecha), 2.2 (Input, hecha) · Bloquea: G2.8
- [ ] G2.7 Slider (rango doble). Diseño: `F3 Slider OTP Numero Mascara`.
  - Depende de: G2.0, G1.2 (Tooltip, hecha) · Bloquea: G2.12
- [ ] G2.8 Combobox/Autocomplete (múltiple con chips). Diseño: `F3 Combobox Fechas Hora`.
  - Depende de: G2.0, G1.1 (Popover, hecha), G1.5 (lógica de lista de Select, hecha), G2.6 · Bloquea: G3.3
- [ ] G2.9 Date Picker y Date Range. Diseño: `F3 Combobox Fechas Hora`.
  - Depende de: G2.0, G1.1 (Popover, hecha), 2.1 (Button, hecha)
- [ ] G2.10 Progress (barra y circular). Diseño: `F5 Estructura`.
  - Depende de: G2.0 · Bloquea: G2.11, G4.3
- [ ] G2.11 File Upload, con Progress. Diseño: `F3 Archivos Tags Toggle Color`.
  - Depende de: G2.0, 2.1 (Button, hecha), G2.10
- [ ] G2.12 Color Picker. Diseño: `Color Picker` (en `F3 Archivos Tags Toggle Color`).
  - Depende de: G2.0, G1.1 (Popover, hecha), G2.7, 2.2 (Input, hecha)
- [ ] 5.17 Revisión móvil componente por componente, después del Grupo 1: cómo se usa cada uno en pantallas chicas. Por ejemplo, en móvil el Select se abre como un panel flotante tipo modal en la parte superior, con buscador y más opciones visibles. mimi-toolbar (G1.10): una horizontal más ancha que la pantalla no se parte ni se achica; hoy el componente no hace nada y el ejemplo la pone en un contenedor con `overflow-x-auto` (los botones no se encogen).
  - v0.3.0 · Tamaño L · Depende de: G2.1 a G2.12 · Bloquea: G2.P
  - Dato de la G1.5: la API del Select no depende del overlay; un panel tipo hoja o modal se puede hacer después cambiando la estrategia de posición y las clases del panel, sin tocar entradas ni salidas.
  - PENDIENTE DE DECIDIR: ¿qué cambios de API podría exigir la revisión (por ejemplo, el Select como panel modal en móvil), y alguno debe hacerse antes de la 0.3.0?
- [ ] G2.P Puerta del Grupo 2 (v0.3.0): la lista de «Puerta del grupo» de «Cómo usar este plan», más:
  - Revisar la decisión de los Blocks (todos en la v0.4.0, con el Grupo 3; spec 4, «Blocks»).
  - Revisar con la respuesta real de los usuarios a la 0.2.0 si algo del Grupo 5 sube de prioridad.
  - Depende de: G2.0 a G2.12, 5.2, 5.17

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

- [x] 0.1 Instalar Node.js, pnpm y git (fecha no registrada; antes del 22/09/2026).
- [x] 0.2 Diseños de Claude Design en `docs/design/` (22/09/2026).
- [x] 0.3 Estilo del MVP: un solo tema base, Mimi (fecha no registrada).
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
- [x] L.2 `package.json` de la CLI (fecha no registrada; antes del 30/09/2026).
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
