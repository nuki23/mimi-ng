# Cambios

Todos los cambios de `@mimi-ng/cli` y de los componentes que copia. Mimi usa [versionado semántico](https://semver.org/lang/es/): mientras sea `0.x`, la API puede cambiar entre versiones menores (ver [`docs/spec.md`](docs/spec.md), sección 12).

## Sin publicar

### Componentes nuevos

- **Popover** (`ng g mimi popover`): panel flotante junto a un botón, con flecha, flip si no cabe, `[(open)]`, Escape y clic fuera, y el foco de vuelta al botón. Usa `@angular/cdk` por dentro: si tu proyecto no lo tiene, `ng g mimi popover` lo instala en la versión de tu `@angular/core` y agrega `@import "@angular/cdk/overlay-prebuilt.css";` a tu CSS global.
- **Tooltip** (`ng g mimi tooltip`): `mimiTooltip="Texto"` en cualquier elemento. Se abre con el puntero o con el teclado después de un retraso (`--mimi-tooltip-delay`, 300 ms), se cierra con Escape sin mover el foco, y en una fila de botones los siguientes abren sin esperar. Si su texto ya está en el nombre del elemento (`aria-label` o `aria-labelledby`), el lector no lo repite. En pantallas táctiles no se muestra. Usa `@angular/cdk`, igual que Popover.
- **Dropdown Menu** (`ng g mimi dropdown-menu`): menú desplegable desde un botón, con ítems con ícono y atajo, acciones destructivas (`tone="danger"`), checkbox (`[(checked)]`), grupo radio (`[(value)]`), etiquetas, separadores y submenús. Se maneja con el teclado como pide el patrón de menú: flechas, Inicio y Fin, búsqueda por letra, Enter, Espacio, → y ←, y Escape. Usa `@angular/aria` y `@angular/cdk` por dentro: `ng g mimi dropdown-menu` instala `@angular/aria` en la versión exacta de tu `@angular/cdk` (o los dos en la de tu `@angular/core`) y agrega los estilos del CDK a tu CSS global.
- **Context Menu** (`ng g mimi context-menu`): menú con el clic derecho, en el punto del puntero, con los mismos ítems que el Dropdown Menu. Un solo menú sirve para todas las filas de una lista o una tabla (`[mimiContextMenuTriggerData]` llega al contenido como `let-fila`). Se abre también con Shift+F10 o la tecla de menú, y con la pulsación larga en Android. Con `disabled`, el clic derecho muestra el menú del navegador. Los ítems de los dos menús se instalan en `components/ui/menu/`; `ng g mimi context-menu` no instala el Dropdown Menu.
- **Select** (`ng g mimi select`): lista desplegable de una opción, con el alto de Input y Button. Las opciones son datos (`[options]`, con grupos, opciones deshabilitadas y un texto de ayuda), y trae buscador dentro del panel (`search`, sin tildes ni mayúsculas, con contador y resaltado), botón de limpiar (`clearable`), estado de carga (`loading`, con `(searchChange)` para buscar en el servidor) y plantilla propia para cada opción. Funciona sin adaptadores con Signal Forms, Reactive Forms y `ngModel`, y dentro de `mimi-form-field` muestra la etiqueta y el error solo. Se maneja con el teclado como pide el patrón combobox: flechas, Inicio y Fin, búsqueda por letra, Enter, Espacio, Alt+↓, Alt+↑ y Escape. `class` va al disparador y `panelClass` al panel; `side`, `align` y `matchWidth` (como en Popover) eligen dónde abre el panel y si mide lo mismo que el disparador. Los textos propios están en inglés; `provideMimiSelectText(MIMI_SELECT_TEXT_ES)` los pone en español. Usa `@angular/aria` y `@angular/cdk` por dentro, como los menús.
- **Dialog** (`ng g mimi dialog`): ventana modal centrada, con X siempre visible. Se usa en la plantilla (`<mimi-dialog [(open)]>` con un botón y un `ng-template`) o desde el código (`MimiDialogService.open(Componente, { data })`, que devuelve una referencia con `close(resultado)` y `afterClosed()`). Trae encabezado, título, descripción, cuerpo, pie y `mimiDialogClose`. El foco queda dentro y vuelve al botón al cerrar (también si se abrió desde un ítem de menú: vuelve al botón del menú), la página de detrás no se desplaza ni se lee (con dos diálogos, tampoco el de abajo), y el contenido largo tiene scroll interno. Escape y el clic en el fondo se desactivan por separado (`closeOnEscape`, `closeOnBackdropClick`) o juntos (`disableClose`). Usa `@angular/cdk` por dentro.
- **Confirm** (`ng g mimi confirm`): pide confirmación desde el código. `injectMimiConfirm()` (al declarar la propiedad) devuelve `confirm({ title, description, confirmText, cancelText, tone, icon })`, una promesa con `true` o `false`. `tone`: `primary` o `danger` (el foco empieza en Cancelar con `danger` y en Confirmar con `primary`). Se abre como `alertdialog` sin X; Escape responde `false` y el clic en el fondo no cierra. Usa Dialog por dentro; los textos, con `provideMimiConfirmText(MIMI_CONFIRM_TEXT_ES)`.
- **Toast** (`ng g mimi toast`): avisos desde el código con `injectMimiToast()`: `toast()`, `success`, `info`, `warning`, `error`, `promise` (cargando y después el resultado) y `dismiss`. Variantes `outline` y `solid`, con acción opcional. No hay que poner ningún `<Toaster>`: la pila se crea sola. `provideMimiToast({ position, duration, hotkey })` para la posición (seis) y la duración. Accesible: los lee el lector de pantalla (los de error, con prioridad), F8 lleva el foco a la pila y Escape lo devuelve, el tiempo se detiene con el puntero, el foco o la pestaña oculta, y los que tienen acción no se cierran solos. Usa `@angular/cdk`.
- **Tabs** (`ng g mimi tabs`): pestañas subrayadas o en píldora (`variant`), con un indicador que se desliza a la elegida. `<mimi-tabs [(value)]>` con cada pestaña en `<ng-template mimiTab="valor" label>`, contador (`[count]`), deshabilitadas (se enfocan pero no se eligen) y etiquetas con ícono (`mimiTabLabel`). El panel se crea al elegirse (`preserveContent` lo conserva). Flechas, Inicio y Fin. Usa `@angular/aria` por dentro (la CLI agrega también `@angular/cdk`).
- **Toolbar** (`ng g mimi toolbar`): píldora translúcida con botones de herramienta, horizontal o vertical. Los botones son tuyos: `<button mimiToolbarItem="valor" kind="tool | toggle | action">`, con `[(value)]` para la herramienta activa (el disco), `[(pressed)]` para los interruptores y `(activate)` para todos; separadores (`mimi-toolbar-separator`) y contador (`mimiToolbarCount`). Una sola parada de Tab y flechas según la orientación; un `mimiTooltip` puede ir en el mismo botón. Usa el `FocusKeyManager` de `@angular/cdk` (no `@angular/aria`).
- **Pagination** (`ng g mimi pagination`): píldora compacta `← página / total →`, con el número de página que se puede escribir y, opcional, los registros por página (`pageSizeOptions`). `[(page)]` desde 1, `[(pageSize)]`, `total` (registros) y `(paginate)` una vez por acción. Anuncia «Página 3 de 12» y, en la primera y la última página, ← y → siguen enfocables. El selector de registros (un Select) se carga con `@defer` solo si lo usas. Tamaños `sm` y `md`; `variant="floating"` para la sombra flotante. Textos con `provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES)`.

### Cambios

- `init` escribe `"style": "mimi"` en `mimi.json`; `"vivid"` se sigue aceptando.
- `ng g mimi` agrega al CSS global los `@import` que necesita un componente (por ahora, los estilos del overlay del CDK para Popover, Tooltip, los menús, Select, Dialog, Confirm y Pagination), una sola vez y después del tema.
- **Button y Badge: variante y tono separados.** `variant` es cómo se ve (Button: `solid`, `soft`, `outline`, `ghost`, `link`; Badge: `solid`, `soft`, `outline`) y `tone` de qué color (`primary`, `secondary`, `success`, `warning`, `info`, `danger`). Sin `tone`, `outline` y `ghost` son neutros, como en la 0.1.0. Los atajos de la 0.1.0 siguen funcionando hasta la 1.0: `variant="default"`, `"secondary"` y `"destructive"` (= `solid` + `danger`).
- **`data-variant` y `data-tone` muestran los valores resueltos** (puede afectar tu CSS): `variant="destructive"` produce `data-variant="solid" data-tone="danger"`. Si tienes estilos sobre `[data-variant="destructive"]`, cámbialos a `[data-tone="danger"]`; sobre `[data-variant="default"]`, a `[data-variant="solid"][data-tone="primary"]`.
- **Tema: tonos y tokens nuevos.** Tonos `success`, `warning` e `info` (con fondo suave, hover, anillo y sombra de color), `--mimi-glow`, superficies para los componentes nuevos (`tooltip`, `glass`, `overlay-blur`, `shadow-popover`) y tokens compartidos (foco, deshabilitado, íconos). `--mimi-destructive-ring` es ahora el anillo de destructive; **`--mimi-destructive-soft` (y `ring-destructive-soft`) sigue como alias hasta la 1.0**, cuando pasará a ser el fondo suave: cambia `ring-destructive-soft` por `ring-destructive-ring` en tu código. Variable nueva `--mimi-input-hover` (y la clase `border-input-hover`).
- **Tokens propios** en Avatar, Switch, Checkbox, FormField, Separator, Skeleton, Badge y Textarea (que antes usaba los de Input; los nuevos caen en los de Input, así que no cambia nada si ya personalizaste Input). Cada página tiene su tabla «Variables CSS». Nombres de la 0.1.0 que siguen funcionando hasta la 1.0, con un aviso en modo desarrollo: `components.button.paddingX` y `components.input.paddingX` → `px`; `components.input.placeholderColor` → `--mimi-input-placeholder` en el CSS; `radii.badge` → `components.badge.radius`.

### Correcciones

- **Button borraba el `aria-disabled`, el `tabindex` y el `aria-busy` del usuario.** En `<button mimiBtn aria-disabled="true">` (un botón deshabilitado que sigue enfocable) o con `[attr.tabindex]`, Button quitaba el atributo, porque lo manejaba siempre aunque no lo necesitara. Ahora solo los escribe cuando hacen falta (`aria-disabled` y `tabindex="-1"` en un `<a mimiBtn>` deshabilitado, `aria-busy` mientras carga) y después devuelve el valor que había. `disabled` y `<a mimiBtn>` siguen igual. Actualiza `button.ts` con `ng g mimi button --overwrite` si no lo modificaste.
- **Accesibilidad: contraste del hover de los botones sólidos en modo claro.** En `success`, `info` y `danger` (`destructive`) el texto es blanco y el hover aclaraba el fondo hasta unos 3,8:1, por debajo de AA (4,5:1). Ahora el hover se aleja del color del texto: oscurece el fondo un 12 % (5,8:1). Cambia `--mimi-destructive-hover`, que ya fallaba en la 0.1.0 (`variant="destructive"` de Button), y los nuevos `--mimi-success-hover` e `--mimi-info-hover`. En modo oscuro no cambia nada.

### Preguntas frecuentes

- **¿Por qué ahora se instalan `@angular/aria` y `@angular/cdk`?** Los componentes nuevos necesitan teclado, foco y posición de paneles que son muy difíciles de hacer bien a mano. Mimi usa por dentro estos dos paquetes oficiales del equipo de Angular: `@angular/cdk` en Popover, Tooltip, Dialog, Confirm, Toast, Toolbar y Pagination, y además `@angular/aria` en Select, Dropdown Menu, Context Menu y Tabs. Solo llegan con los componentes que los usan, `ng g mimi` los instala en la versión correcta (aria en la exacta de tu cdk), nunca aparecen en la API de Mimi y sus correcciones te llegan con `ng update`. Los componentes de la 0.1.0 no los usan. Más en [Fundamentos](https://ng.mimiworks.dev/docs/foundations).

## 0.1.1: corrección

### Correcciones

- **`ng add @mimi-ng/cli --icons=false` fallaba** con "Data path "/icons" must be boolean". Antes de instalar el paquete, `ng add` no conoce su esquema y pasa `--icons=false` (y `--icons=true`) como texto. El esquema de `ng-add` ahora acepta también `"true"` y `"false"`, y los convierte antes de configurar el proyecto. `--icons`, `--no-icons` y la pregunta interactiva siguen igual.

## 0.1.0 (30/09/2026): vista previa

Primera versión publicada en npm.

### Componentes

Once componentes para Angular 22 o superior y Tailwind CSS 4, standalone, `OnPush` y sin Zone.js. Todos aceptan `class` (se mezcla con `cn()`) y exponen su estado con atributos `data-*`.

- **Avatar**: imagen con un respaldo (por ejemplo, iniciales) que se ve mientras carga o si falla.
- **Badge**: etiquetas con variantes.
- **Button**: `button[mimiBtn]` y `a[mimiBtn]`, con variantes y tamaños.
- **Card**: tarjeta con encabezado, título, descripción, contenido y pie.
- **Checkbox** y **Switch**: controles propios con `FormCheckboxControl` (Signal Forms, Reactive Forms y `ngModel`).
- **FormField**: etiqueta y errores automáticos a partir de los validadores (`MimiFormError`), con mensajes en inglés por defecto y en español con `provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)`.
- **Input** y **Textarea**: directivas sobre los elementos nativos (`input[mimiInput]`, `textarea[mimiTextarea]`), compatibles con `[formField]`, `formControlName` y `[(ngModel)]`.
- **Separator** y **Skeleton**.

Tema: variables CSS `--mimi-*` expuestas a Tailwind 4 con `@theme inline` (`theme-base.css`), modo claro y oscuro, estilo Vivid, y preset tipado opcional con `provideMimiTheme()`. Íconos internos en SVG con los trazos de Lucide, sin dependencias.

### CLI (`@mimi-ng/cli`)

- **`ng add @mimi-ng/cli`**: verifica Angular 22+ y Tailwind 4 sin tocar nada si falta algo; después importa el tema en el CSS global, agrega el alias `@/components/ui/*` al tsconfig (conserva comentarios), registra la colección en `schematicCollections`, instala `clsx`, `tailwind-merge` y `class-variance-authority` con el gestor de paquetes del proyecto, y crea `mimi.json` y `.mimi/`. Opciones: `--icons` (instala `@lucide/angular`), `--project` y `--overwrite`.
- **`ng g mimi <nombre>`**: copia uno o varios componentes con sus dependencias (`ng g mimi button input card`); sin nombres muestra un menú. Sugiere el nombre parecido si hay un error de tipeo. Forma larga: `ng g @mimi-ng/cli:ui <nombre>`, para cuando Mimi no está en `schematicCollections`.
- **Tus cambios se respetan:** `.mimi/base/` guarda la copia original de cada archivo y `.mimi/manifest.json` su versión. Los componentes que modificaste se omiten con un aviso (`--overwrite` los reemplaza); los que no tocaste se actualizan con una versión nueva de la CLI. El formato que les dé tu Prettier no cuenta como modificación.

### Limitaciones conocidas

- Una sola configuración de Mimi por workspace (`mimi.json` y `.mimi/` en la raíz).
- `ng add @mimi-ng/cli --icons=false` falla ("Data path "/icons" must be boolean"): `ng add` pasa el valor como texto. Sin `--icons` el resultado es el mismo (no instala íconos; en una terminal interactiva, lo pregunta).
- Con pnpm 10 o superior, los scripts de instalación de las dependencias de Angular pueden quedar bloqueados (`ERR_PNPM_IGNORED_BUILDS`); se aprueban con `pnpm approve-builds`. Con pnpm 12, en las primeras horas tras publicar una versión, pnpm puede agregar una excepción `minimumReleaseAgeExclude` en un `pnpm-workspace.yaml` del proyecto.
- `mimi update` (combinar tus cambios con la versión nueva) todavía no existe: llegará en una versión futura.
- Documentación solo en español.
- Select y Dialog llegarán en una versión próxima.
