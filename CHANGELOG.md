# Cambios

Todos los cambios de `@mimi-ng/cli` y de los componentes que copia. Mimi usa [versionado semántico](https://semver.org/lang/es/): mientras sea `0.x`, la API puede cambiar entre versiones menores (ver [`docs/spec.md`](docs/spec.md), sección 12).

## 0.6.0 (13/11/2026): tema de marca, tamaños y formularios

Detalle y evidencia: `docs/auto/refinamiento-0.6.0-*.md` y `docs/auto/release-0.6.0-2026-11-13.md`.

### Rupturas (qué cambia en algo que ya tenías y qué hacer)

- **El tema por defecto es violeta.** El primario es `#793EEA` en claro y `#A88FFF` en oscuro, con una escala `--mimi-brand-50…950` en OKLCH, `--mimi-brand-text` (el violeta que se puede usar como texto) y `--mimi-brand-gradient`; el anillo de foco (`--mimi-ring`) es violeta; `info` se ajusta (más oscuro en claro, más claro en oscuro) para distinguirse del violeta; en oscuro, las superficies suben (fondo 0,205, tarjeta 0,235, popover 0,26). El neutro anterior sigue disponible: `provideMimiTheme(MIMI_THEME_NEUTRAL)` (archivo nuevo `theme/neutral.ts`). **Si ya tienes tu tema, no cambia nada; si usabas el predeterminado, verás el violeta.** La CLI actualiza `theme-base.css` solo si no lo modificaste; si lo modificaste, lo bloquea con su aviso y no lo toca (compáralo con el nuevo o usa `--overwrite`).
- **`size="default"` se llama ahora `md`** (Button, Input, Avatar, Progress, Pagination…). `default` se sigue aceptando con un aviso en desarrollo y **se quita en la 0.7.0**. También cambia `data-size="default"` → `data-size="md"` para quien lo use en CSS o en pruebas.
- **Sin `size`, un control no escribe `data-size`.** El `md` vive en el tema (`:root`) y cada control hereda el del contenedor `[data-size]` más cercano (un `mimiSize` o cualquier contenedor con el atributo). Si leías `data-size="md"` de un control sin `size`, ya no está.
- **Toast `outline` es de color** (por defecto): el borde y el ícono toman el tono. La tarjeta neutra de la 0.5.0 es `variant="neutral"`.
- **Los Blocks quedan inertes mientras cargan** (`[loading]`): el anfitrión lleva `inert` y `aria-busy`, el foco vuelve al control que lanzó la acción y se anuncia «Loading…» / «Done.» (en inglés, fijo). Instala `utils/busy` con ellos.
- **`separatorAfter` de Input OTP** pasa de `number` a `number | number[]` (varias separaciones). En plantilla, `separatorAfter="3"` sigue igual; cambia solo el tipo si lo lees por código.
- **Select instala también `option-list`** (para `<mimi-option>`): un archivo más en `components/ui/`. No cambia su API.
- **El texto `clear` del Combobox** (`MimiComboboxText`) es **opcional** (si falta, «Clear»); el Combobox gana `clearable`.
- **Las medidas de los componentes salen de la escala** (`--mimi-size-*` y derivadas por `[data-size]`): si sobrescribes un token de medida (`--mimi-btn-height`, `--mimi-input-height`…) **en un contenedor** y no en `:root`, el cambio ya no llega a los controles de dentro (las medidas vienen calculadas desde `:root`). **Cómo cambiarlo:** pon el token en `:root` (todo) o en un contenedor **con `data-size`** (o `mimiSize`), que vuelve a calcular las medidas con el valor de la zona: `<section data-size="md" style="--mimi-btn-height: 2.25rem">`. En `sm` y `lg`, el token con su sufijo (`--mimi-btn-height-sm`). Explicado en la página «Tamaños». Arreglarlo sin `data-size` exigiría declarar las ~60 variables derivadas en cada elemento (`*`): no se hizo.
- **Cambian los estados visuales de los controles** (hover, clic, solo lectura, error, deshabilitado), los grises del tema, la selección del Tree y los colores de selección (`info` → marca). La API no cambia; el aspecto sí. Detalle en «Estados de los controles», abajo.
- **Dialog:** `padding` es un solo valor lateral. **Data Table:** conserva `density` y gana `size` (alto de fila y de cabecera); `comfortable` mantiene su alto fijo.

### Tamaños `sm / md / lg` en todos los componentes (R.1, R.2, R.3, R.4, R.8)

- Una escala común en el tema (`[data-size]`), `size` en cada control y `mimiSize="sm"` en un contenedor (un formulario entero, sin repetirlo). Página nueva: **Tamaños**, con la escala y qué cambia en cada componente.
- Hechos: Button, Input, Avatar, Select, Combobox, Number Input, Password, Input Mask, Tags Input, Date Picker, Date Range, Color Picker, Textarea, Switch, Checkbox (con su página), Toast (`size` por aviso y `provideMimiToast({ size })`), Pagination, Progress, Tabs, Toggle Group, Badge, Dialog, Chip, Slider, Toolbar, Calendar, Dropdown y Context Menu, Command, Tree, Sortable List, Data Table, Tooltip y Popover. **Card** llega con `mimiCard` en la 0.7.0.
- Lo que se pinta en un panel flotante (menús, Popover, Tooltip, el Calendar de un Date Picker) toma el tamaño de su disparador.

### Formularios

- **`readonly`** en Checkbox, Switch, Select, Combobox, Date Picker, Date Range, Slider, Color Picker, File Upload, Toggle Group y Password: el valor se ve y se enfoca, no se cambia (`aria-readonly` donde el rol lo admite; File Upload usa `aria-disabled` porque su zona es un botón).
- **Select y Combobox: `<mimi-option>` es la forma normal.** Todos los ejemplos del sitio, los fragmentos «Con formularios» y el bloque «Uso» usan `<mimi-option>` / `<mimi-optgroup>` (con `@for` y `[value]` enlazado cuando los datos vienen de una señal); `[options]` queda como alternativa para listas generadas por código y sigue ganando si se da. Añadidos, sin rupturas, la misma API en los dos:
  - **`searchMode="client" | "server"`** (por defecto `client`): con `server` el componente muestra las opciones que llegan, sin volver a filtrar; ya no hace falta `[filterWith]="() => true"`. `filterWith` sigue para filtros propios en `client`.
  - **`compareWith="id"`**: además de una función, el nombre de un campo para comparar valores que son objetos (tipo `MimiCompareWith`). En desarrollo avisa si el valor no tiene ese campo.
  - **La X de limpiar** se ve solo con el ratón encima, con el foco dentro o con el panel abierto (en pantallas táctiles, siempre que haya valor); si no, el chevron. Con `clearable`, **Supr y Retroceso** quitan el valor con el foco en el campo.
- **Form Field:** `label`, `description`, `hint` y `required` como atajos (con sus ids en `aria-describedby` y el asterisco oculto a los lectores); `[errors]` en el campo y mensajes que viajan con el validador (`withMessage` en Reactive Forms, `message` en Signal Forms). Prioridad: `<mimi-form-error>` > `message` del validador > `[errors]` > `provideMimiErrorMessages` > predeterminado.
- **`<mimi-option>` y `<mimi-optgroup>`** en Select y Combobox (ver arriba); un solo icono al final (cargando, limpiar o chevron). Combobox con `clearable`.
- **Dialog como servicio:** `size`, `inputs` (validadas contra el componente antes de crear el diálogo), `padding`, `panelClass`, `ref.closed`, `ref.result` y `chrome: 'none'`.
- **Tabs:** atajo `<mimi-tab label>`; sin `value`, el valor sale del texto, del índice o con un sufijo, con un aviso en desarrollo.
- **Input OTP:** la cantidad de dígitos que quepa, `separatorAfter` en lista (grupos: `[3]`, `[4, 8]`) y **separador propio**: un carácter (`separator="·"`) o contenido (`<ng-template mimiInputOtpSeparator>`, con `MimiInputOtpImports`).

### Estados de los controles: un solo juego para todos

Los 18 controles de formulario (y Tree) dibujan igual el hover, el foco, el clic, el deshabilitado, la solo lectura y el error, con un archivo nuevo compartido. **Son cambios visibles: si tienes capturas o pruebas visuales, se moverán.**

- **Hover en Input y Textarea** (no tenían) y en Select; el borde se oscurece al pasar el ratón. **Number Input y Password** usan los mismos bordes y el mismo hover que Input (antes, Password pintaba su caja con clases propias y el borde de Number Input con hover quedaba casi blanco en oscuro); los − y + de Number Input tienen un hover suave.
- **Hover más suave en oscuro:** `--mimi-input-hover` mezcla el 14 % de `foreground` (antes, 30 %; el borde quedaba casi blanco). En claro no cambia.
- **Grises «malva medio»:** fondo, texto, tarjeta, popover, `secondary`, `muted`, `accent`, bordes y campos llevan el tono 292 de la marca con croma 0,014 (0,007 en los casi blancos y casi negros), con la misma luminosidad: el contraste no cambia (AA en claro y oscuro). `MIMI_THEME_NEUTRAL` vuelve al neutro puro.
- **Profundidad al hacer clic: todos se hunden** y les crece el halo (`ring-soft`), como a Button, también los de escribir (Input, Textarea, Combobox, Tags Input, Number Input, Password, Input Mask). En un campo compuesto se hunde la caja entera, también al hacer clic en el texto (Number Input, en la zona del número y no solo en − y +); los botones pequeños de dentro (− y +, el ojo de Password, la X del Combobox) ya no se hunden aparte. Con «reducir movimiento», nada se hunde.
- **Abiertos, con el borde y el anillo de la marca:** Select, Date Picker, Date Range y Color Picker los mantienen mientras su panel está abierto, aunque se haya abierto con el ratón, como Combobox. El botón que abre un Dropdown Menu muestra el contorno del foco mientras el menú está abierto.
- **La X de limpiar de Select y Combobox** ya no se queda visible después de elegir con el ratón: se ve con el ratón encima, con el foco que llegó por teclado o con el panel abierto (en pantallas táctiles, mientras haya valor).
- **Tags Input en solo lectura:** las etiquetas toman el fondo del campo y un borde con contraste de 3:1 o más (token nuevo `--mimi-tags-chip-readonly-border`); antes casi no se distinguían del fondo.
- **Hover en Checkbox, Switch y Toggle Group**, con el ratón sobre todo el control (también la etiqueta): el borde de la casilla se oscurece (marcada, el relleno se intensifica), la pista del interruptor se intensifica y la opción no elegida del grupo toma un fondo suave.
- **Solo lectura con aspecto propio y común:** fondo `--mimi-input-readonly` (nuevo; `inputReadonly` en el preset), sin hover ni clic, y la caja marcada con `data-readonly` o `aria-readonly`. File Upload en solo lectura se titula «Archivos (solo lectura)» (texto nuevo opcional `readonly` de `MimiFileUploadText`; en inglés, «Files (read-only)»).
- **Error unificado:** borde `--mimi-input-error` con el halo solo con el foco. **Switch gana el error** (un filo rojo de 1 px); Checkbox lo marca también cuando está marcada; Input OTP pone el halo solo en la casilla con el foco (antes, en todas).
- **Deshabilitado con el token** `--mimi-disabled-opacity` en todos (antes, `opacity-50` fijo en Button, Checkbox, Switch, Input, Textarea y las opciones de las listas). **Tree deshabilitado entero** ahora se atenúa (antes no se veía distinto).
- **Tree:** el nodo elegido es fondo `primary-subtle` con texto `primary` (antes, `primary` sólido con texto blanco); el anillo, solo con el teclado. `--mimi-tree-selected` y `--mimi-tree-selected-fg` cambian de valor por defecto.
- **Colores de selección con la marca, no con `info`:** el azul queda solo para los avisos. Toolbar (anillo de hover y de la herramienta activa: `--mimi-toolbar-ring` → `ring`; contador `primary`), File Upload con un archivo encima (borde `ring`, fondo `primary-subtle`, halo `ring-soft`; `--mimi-dropzone-active` y `--mimi-dropzone-active-border` cambian de valor), Data Table (fila elegida, filtro activo e insignia de selección), la fila «Crear» del Combobox, el contador de Tabs y **Sortable List** (el hueco donde se suelta y el anillo del elemento levantado: `--mimi-sortable-drop` → `ring`, `--mimi-sortable-drop-bg` → `primary-subtle`). Esos textos violeta usan `text-primary`: con el violeta de fábrica pasan AA (4,70 lo más bajo), pero **con un primario propio claro** (un amarillo, por ejemplo) pueden quedar por debajo de 4,5:1 sobre el fondo; en ese caso, usa en claro un primario más oscuro.
- **CLI:** ítem nuevo **`utils/field-styles`** (`utils/field-styles.ts`) en el registro; lo instalan con ellos Input, Textarea, Select, Combobox, Tags Input, Number Input, Password, Input Mask, Date Picker, Color Picker, Checkbox y Switch. Date Picker y File Upload ya no piden `utils/control-styles`. Los otros ítems internos nuevos están en «CLI», abajo.
- **Si personalizaste** `--mimi-tree-selected(-fg)`, `--mimi-toolbar-ring`, `--mimi-dropzone-active(-border)` o `--mimi-table-row-selected`, tu valor sigue ganando. Si copiaste a mano clases de estado de un componente, vuelve a generarlo con `ng g mimi <componente> --overwrite` o compáralo con el nuevo.

### CLI

- **Ítems internos nuevos** (la CLI los instala sola con quien los usa): **`utils/size`** (`MimiSize`, `mimiSize`, `MIMI_SIZE` e `injectMimiSize`; casi todos los componentes), **`utils/field-styles`** (los estados de los campos, arriba) y **`utils/busy`** (los Blocks con `[loading]`, con `@angular/cdk`). El ítem `theme` gana `theme/neutral.ts`. Select pide también `option-list`.
- Los siete Blocks (`login-01`, `login-02`, `signup-01`, `otp-01`, `settings-01`, `table-01` y `pricing-01`) instalan `utils/busy` con ellos.

### Arreglos

- **Select: el anillo de foco ya no se queda** después de elegir con el ratón (sigue con el teclado).
- **Paneles dentro de un contenedor con scroll propio** (un `overflow: auto` cualquiera): el panel de Select, Combobox, Date Picker, Date Range, Color Picker, Dropdown Menu, Context Menu (abierto con el teclado), Popover y Tooltip sigue a su campo con el scroll y se cierra si el campo sale de la vista. Antes se quedaba fijo mientras el contenido se movía. Lo hace `utils/overlay` (la directiva `MimiOverlayFollow`), que ya instalaban.
- Tabs y Toggle Group en oscuro, y Skeleton; efecto de clic uniforme (`--mimi-press-scale`).
- Los Blocks con `[loading]` devuelven el foco al terminar.
- Select: el chevron y el spinner abren el panel; Combobox `readonly` no deja quitar chips ni vaciar con Escape; Password vuelve a ser editable al quitar `readonly`; Form Field quita de `aria-describedby` lo que ya no existe; el Combobox múltiple mide lo mismo que los demás controles en `sm`.

### Documentación

- Páginas nuevas o ampliadas: **Tamaños**, **Estados** (Fundamentos: cada control de formulario en los siete estados, en claro y oscuro, con Password a la vista en una fila aparte y un ejemplo de paneles en un contenedor con scroll), **Checkbox** (separada de Switch), **Textarea** (separada de Input), pestañas «Con formularios» (Signal Forms, Reactive y plantilla) en 18 páginas, ejemplos de solo lectura y de `<mimi-option>`.
- **Requisito del sitio (no de la librería):** el sitio de documentación usa `@scope` de CSS (Chrome 118, Safari 17.4, Firefox 128). Los componentes que copia la CLI no lo usan.

### No incluido en esta versión

Pasa a la 0.7.0 (`docs/plan/refinamiento/R-0.7.0.md`): el logo y el favicon del sitio (R.25, a la espera de los archivos); la tabla de la escala de tamaños en la spec (R.26; la página «Tamaños» ya la muestra); Confirm con `size` (R.27); ejemplos de tamaño en la página de cada componente (R.28); ejemplos de solo lectura en las páginas que faltan (R.29; el aspecto de solo lectura ya está: ver «Estados de los controles»); más ejemplos de Form Field y su diagrama (R.30); la nota de contraste con un primario propio en la spec y en la página «Tema» (R.31; resumida arriba, en «Colores de selección»); quitar el alias `default` de `size` (R.32, la ruptura anunciada arriba); y M.9 completa (la lista de Select sobre `option-list`; no cambia la API).

### Cómo actualizar desde la 0.5.0

`npm i -D @mimi-ng/cli@0.6.0` y `ng g mimi <los componentes que usas>` (con pnpm, `pnpm add -D @mimi-ng/cli@0.6.0` y `pnpm ng g mimi …`). La CLI dice «actualizado de 0.5.0 a 0.6.0» en cada uno, instala los ítems internos nuevos (`utils/size`, `utils/field-styles`, `utils/busy`) y actualiza `theme-base.css`. Lo que modificaste no se sobrescribe: se bloquea con su aviso (con `--overwrite` sí). Revisa «Rupturas», arriba; en particular, cambia `size="default"` por `size="md"` antes de la 0.7.0.

## 0.5.0 (09/11/2026): datos y páginas

Cuatro componentes de datos nuevos, la pantalla de clientes (`table-01`) y un cambio en cómo `ng g mimi` genera las pantallas (**RUPTURA**, abajo: «Los Blocks de pantalla se generan como páginas tuyas»).

### Documentación

- **Si los componentes salen sin estilos** aunque `ng build` termina bien (README de la CLI y página de Instalación): si el CSS compilado pesa mucho menos de lo normal, puede que el sistema (por ejemplo, el Control de aplicaciones de Windows) bloquee el binario nativo de Tailwind, que entonces usa un respaldo que no escanea los archivos. Las dos páginas explican cómo comprobarlo y qué hacer (permitir el binario o fijar otra versión de Tailwind). No es un cambio de Mimi.

### Grupo 3: datos (cuatro componentes y la pantalla de clientes)

Cuatro componentes nuevos y un Block. Todo es aditivo: no cambia nada de lo publicado en la 0.4.0 (salvo lo que dice «Si ya los tienes», abajo). Se agregan con `ng g mimi <nombre>` y traen lo que necesitan (`@angular/cdk`, `@angular/aria`, otros componentes).

- **Tree** (`ng g mimi tree`): árbol por datos (`nodes`) con selección simple o múltiple (casillas con estado parcial) y carga diferida (`loadChildren`). Teclado de la APG; funciona con `[formField]`, `formControlName` y `ngModel`. Base propia (el `ngTree` de `@angular/aria` no tiene casillas ni carga diferida).
- **Sortable List** (`ng g mimi sortable-list`): lista que se reordena con el puntero o el dedo (`@angular/cdk/drag-drop`) y con el teclado desde el asa (Espacio, flechas, Escape), con anuncios para lectores de pantalla.
- **Command** (`ng g mimi command`): paleta de comandos. `mimi-command` en la página y `mimi-command-dialog` con ⌘K o Ctrl+K; búsqueda sin tildes (y por `keywords`), grupos, íconos con tono, atajos y «sin resultados» con una acción. Usa Dialog y la lista de Combobox.
- **Data Table** (`ng g mimi data-table`): tabla con búsqueda, filtros por columna (chips), orden, paginación (Pagination), selección (Checkbox, con barra de acciones), detalle expandible, acciones por fila, columnas fijas y dos densidades; en el cliente o, con `[total]`, en el servidor. Tabla nativa, no el `grid` de aria.
- **`table-01`** (`ng g mimi table-01`): la pantalla «Clientes» como **página** (se genera en `src/app/pages/table/`, clase `TablePage`, con su `table.routes.ts` y la línea para `app.routes.ts`, como las demás pantallas): resumen y Data Table en escritorio; lista de tarjetas, píldoras de estado y barra de acciones en móvil.
- **Tokens:** las variables `--mimi-tree-*`, `--mimi-sortable-*`, `--mimi-command-*` y `--mimi-table-*` (con su tipo en `provideMimiTheme`: `tree`, `sortable`, `command` y `dataTable`), en las páginas de cada componente.
- **Textos:** cada componente trae `provideMimi<Nombre>Text(MIMI_<NOMBRE>_TEXT_ES)`, como los demás.
- **Si ya los tienes:** `Checkbox` exporta ahora los estilos de su casilla (`MIMI_CHECKBOX_BOX_STYLES`) para el Tree; no cambia su aspecto ni su API. Solo importa si pides el Tree (lo usa): si modificaste `checkbox.ts`, `ng g mimi` no lo reemplaza (te avisa, como siempre) y el Tree no compilará hasta que agregues esa exportación a mano o uses `--overwrite` (que reemplaza tu Checkbox).
- **Arreglos de la revisión de la puerta del grupo** (los componentes son nuevos en esta versión, así que no cambian nada publicado):
  - **Data Table:** la selección se poda al buscar o filtrar (la barra de acciones no cuenta filas ocultas); en modo servidor la página se ajusta si el total baja y el rango nunca muestra «desde» mayor que «hasta»; el `id` del detalle sigue al id de la fila y no al índice de la página; sin `rowId` ni `id` en las filas se identifican por el objeto, sin el error NG0955, y avisa en desarrollo; la sombra de la columna fija va del lado correcto en RTL; la tabla usa propiedades lógicas para RTL (salvo el relleno de la barra y del pie y el margen del botón de orden, que siguen físicos: tarea M.24); las filas ya no llevan `aria-selected`.
  - **Tree:** el teclado no intercepta las teclas de un campo o botón dentro del nodo; `load()` no escribe señales después de destruirse el árbol.
  - **Sortable List:** Escape durante un agarre con teclado no sube al diálogo que la contenga; sin `trackBy` y con elementos repetidos se identifican por su lugar, sin NG0955, y avisa en desarrollo.
- **Cómo actualizar desde la 0.4.0:** `npm i -D @mimi-ng/cli@0.5.0` y `ng g mimi <los componentes que usas>`. Nada que migrar salvo lo de las pantallas (abajo); los componentes nuevos son opcionales.

### Los Blocks de pantalla se generan como páginas tuyas (B.11)

**Cambia lo que hace `ng g mimi` con `login-01`, `login-02`, `signup-01`, `otp-01` y `settings-01` en un proyecto que no los tiene** (RUPTURA respecto de la 0.4.0). Antes copiaba el Block tal cual a `src/app/blocks/login-01/` (clase `Login01`, selector `mimi-login-01`); ahora genera una página tuya:

```
src/app/pages/login/login.ts          ← clase LoginPage, selector app-login-page
src/app/pages/login/login.html
src/app/pages/login/login.routes.ts   ← LOGIN_ROUTES, con la página en carga diferida
```

Al terminar, `ng g mimi` te da la línea exacta para las rutas de `app.routes.ts` (no la edita):

```ts
{ path: 'login', loadChildren: () => import('./pages/login/login.routes').then((m) => m.LOGIN_ROUTES) },
```

- **Páginas y secciones:** el registro marca cada Block como página (`page`) o sección (`section`). Son páginas `login-01`, `login-02`, `signup-01`, `otp-01` y `settings-01`; es una sección `pricing-01`, que sigue copiándose tal cual a `aliases.blocks` para ponerla dentro de una de tus páginas.
- **La carpeta:** `aliases.pages` en `mimi.json` (nuevo; por defecto, la hermana de tu carpeta de componentes: `src/app/pages`). `ng add` lo escribe; en un proyecto anterior, `ng g mimi` lo agrega la primera vez que genera una página. Como los demás alias, tiene que ser una ruta relativa dentro del proyecto (si no, el error claro de siempre, sin cambiar nada).
- **El nombre:** el del Block sin el número (`login-01` y `login-02` → `login`, `signup-01` → `signup`, `otp-01` → `otp`, `settings-01` → `settings`), u otro con `--name` (`ng g mimi login-02 --name sign-in` → `sign-in/sign-in.ts`, `SignInPage`). La clase y el selector no llevan `mimi`; el selector usa el prefijo de tu proyecto (`angular.json`). Los tipos del Block se renombran igual (`Login01Value` → `LoginPageValue`).
- **Si la carpeta ya existe** (por ejemplo, `login-02` cuando ya tienes la página de `login-01` en `pages/login/`), `ng g mimi` no escribe nada y te pide otro nombre con `--name`, también con `--overwrite`.
- **Se actualiza como siempre:** Mimi sigue la página por su nombre del registro (`login-01`), aunque le pongas otro: `mimi.json → blocks.login-01` guarda su versión, su carpeta (`path`) y su nombre (`name`), y sus copias originales van a `.mimi/base/pages/login-01/`. Todo o nada, el aviso si la modificaste, `--overwrite` y el aviso de un componente actualizado que usa tu Block funcionan igual. Si mueves la carpeta, cambia `path` en `mimi.json`.
- **Con `source(none)`**, `ng add` y `ng g mimi` agregan también el `@source` de la carpeta de páginas.

- **El comentario de cabecera** de los cinco Blocks de página describe ahora lo que genera la CLI (la carpeta de `aliases.pages`, `<nombre>.routes.ts` y la línea para `app.routes.ts`), en vez de `{ path: 'login', component: Login01 }`. Solo cambia el comentario: una pantalla de la 0.4.0 sin modificar se actualiza por él («actualizado de 0.4.0 a …»).

- **`pricing-01` ya no ocupa el alto de la pantalla** (se quita `min-h-svh` del anfitrión): es una sección y va dentro de una página, junto a otras partes. Si la tienes sola en una ruta y quieres el alto de antes, pásale `class="min-h-svh"`. Una copia de la 0.4.0 sin modificar se actualiza con el cambio.

**Si ya instalaste una pantalla con la 0.4.0**, no cambia nada: sigue en `src/app/blocks/login-01/` (`Login01`), tus rutas siguen funcionando y `ng g mimi` la sigue actualizando ahí, con las mismas reglas. Para pasarla a página: guarda tus cambios (por ejemplo, en git), borra la carpeta `src/app/blocks/login-01/`, ejecuta `ng g mimi login-01`, pega la línea nueva en `app.routes.ts` y quita la ruta vieja.

## 0.4.0 (07/11/2026): pantallas

### Antes de actualizar

- **Excluye `.mimi/` del escaneo de Tailwind** (si usas Tailwind 4.1 o superior y tu `@import "tailwindcss"` no lleva `source(none)`). `.mimi/` va en git y tiene las copias originales de Mimi: sin excluirla, tu CSS lleva las clases de esas copias aunque ya las hayas cambiado en tus componentes. Agrega a tu CSS global, después de `@import "tailwindcss"` (con `src/styles.css`):

  ```css
  @source not "../.mimi";
  ```

  `ng add` la escribe desde esta versión; en un proyecto de la 0.3.0, `ng g mimi` te avisa con la línea exacta si falta (no toca esa parte de tu CSS). Con Tailwind 4.0 (no entiende `@source not`), actualiza Tailwind primero.

### Blocks: pantallas enteras

Seis pantallas hechas con los componentes de Mimi, que se instalan con el mismo comando y quedan en tu proyecto para que las cambies. **No son componentes:** el menú de `ng g mimi` los lista después de los 36 componentes.

- **login-01** (`ng g mimi login-01`): inicio de sesión centrado con correo, contraseña con mostrar u ocultar, «recordarme» y botones de Google y GitHub.
- **login-02** (`ng g mimi login-02`): inicio de sesión en dos columnas, con tu imagen (`imageSrc`) y un testimonio en vidrio (texto de relleno para que pongas el tuyo).
- **signup-01** (`ng g mimi signup-01`): registro con mensajes al salir de cada campo, el medidor de Password, confirmación y un botón que dice qué falta.
- **otp-01** (`ng g mimi otp-01`): verificación con un código de 6 dígitos (Input OTP), reenvío con cuenta regresiva y reintento del mismo código tras un error.
- **settings-01** (`ng g mimi settings-01`): ajustes de cuenta con navegación lateral (pestañas verticales; píldoras en móvil), perfil, notificaciones, seguridad, facturación y una barra de «cambios sin guardar».
- **pricing-01** (`ng g mimi pricing-01`): tres planes con mensual/anual (el ahorro se calcula con los precios), el destacado con un borde de color estático y los precios con `Intl.NumberFormat`.

**Cómo se instalan:** `ng g mimi login-01` copia la pantalla a `src/app/blocks/login-01/` y los componentes que usa a tu carpeta de componentes, con sus dependencias. La carpeta de los Blocks es `aliases.blocks` en `mimi.json`: `ng add` la escribe desde esta versión y, en un proyecto de la 0.3.0, `ng g mimi` la agrega la primera vez que copias un Block (por defecto, la hermana de `components/`: `src/app/blocks`). Cada Block es un componente de página standalone (`Login01`, selector `mimi-login-01`): ponlo en tus rutas (`{ path: 'login', component: Login01 }`) y conéctalo con sus salidas (`submitted`, `verify`, `saved`…). Textos en inglés, en la plantilla; formularios con Signal Forms; íconos en SVG en línea (sin dependencias). Ningún Block pone `<main>`: va en tu layout.

**Un Block es tuyo desde que se copia.** Es un componente Angular de tu proyecto, no una pieza de la biblioteca: los componentes de Mimi (Button, Input…) tienen una API estable que se cuida entre versiones; un Block es un punto de partida, y sus entradas y salidas pueden cambiar de una versión a otra. Lo normal es editarlo. **La carpeta la eliges tú:** cambia `aliases.blocks` en `mimi.json` (por ejemplo, a `src/app/pages`) antes de agregar el Block; tiene que ser una ruta relativa a la raíz del proyecto. **La CLI no toca tus rutas:** registra la pantalla tú en `app.routes.ts` (el resumen de `ng g mimi` te da la línea).

**Cómo se actualizan:** igual que un componente, todo o nada. Si modificaste tu pantalla (lo normal), `ng g mimi` no la toca y te lo dice sin alarma; `--overwrite` la reemplaza entera. Un Block tampoco se actualiza si se bloquea uno de sus componentes (no compilaría). Sus componentes sí se actualizan aunque el Block quede como estaba, y **`ng g mimi` te avisa** cuando actualiza un componente que usa uno de tus Blocks: «Tu Block login-01 usa button, que se actualizó a 0.4.0; revisa el CHANGELOG…».

**Con `@import "tailwindcss" source(none)`:** Tailwind solo escanea las carpetas que indicas. `ng add` escribe ahora también `@source` de la carpeta de los Blocks, y `ng g mimi <block>` lo agrega si falta (en un proyecto de la 0.3.0 con `source(none)`, sin él, la pantalla quedaba sin sus estilos).

### Cambios en componentes publicados

Sin rupturas. `ng g mimi` los actualiza si no modificaste sus archivos.

- **Tabs: `orientation="horizontal | vertical"`** (por defecto `horizontal`, como antes). En vertical, las pestañas a un lado y el panel al otro, ↑/↓ para moverse, y puede cambiar en vivo (por ejemplo, con el ancho). **Un detalle:** el anfitrión `mimi-tabs` pone ahora su `flex-direction` con un binding (`column` en horizontal, `row` en vertical), así que **un `style="flex-direction: …"` estático que pusieras en `<mimi-tabs>` ya no gana**; usa `orientation`, o una clase con `!` si de verdad necesitas otra dirección.

### CLI

- **Ítems de tipo `block`** en el registro, con su carpeta (`aliases.blocks`), sus bases en `.mimi/base/blocks/` y su clave `blocks` en `mimi.json`. Un Block nuevo agrega al resumen cómo enrutarlo.
- **`ng add` excluye `.mimi/` del escaneo de Tailwind** 4.1+ (`@source not "../.mimi";`) y `ng g mimi` avisa si falta (ver «Antes de actualizar»).
- **Con `source(none)`, el `@source` de la carpeta de los Blocks** (ver arriba).
- **Aviso cuando un componente que se actualiza lo usa uno de tus Blocks** (no bloquea nada).
- **Error claro si `aliases.components` o `aliases.blocks` es una ruta absoluta, tiene `..` o sale del proyecto** (antes, `C:\…` creaba una carpeta «C:» dentro del proyecto). No se escribe nada.
- El error de un nombre desconocido dice ahora «no es un componente ni un Block de Mimi».

### Cómo actualizar desde la 0.3.0

1. Instala la CLI nueva: `npm i -D @mimi-ng/cli@0.4.0` (con pnpm, `pnpm add -D @mimi-ng/cli@0.4.0`).
2. Agrega `@source not "../.mimi";` a tu CSS global (ver «Antes de actualizar»), o sigue el aviso de `ng g mimi`.
3. Vuelve a ejecutar `ng g mimi` con los componentes que usas (por ejemplo, `ng g mimi tabs button`): actualiza lo que no modificaste y lo dice («tabs actualizado de 0.3.0 a 0.4.0»).
4. Para los Blocks, `ng g mimi <nombre>` (por ejemplo, `ng g mimi login-01`). La primera vez escribe `aliases.blocks` en tu `mimi.json` y, con `source(none)`, el `@source` de su carpeta.

### Limitaciones conocidas

- **Diseños pendientes:** el error de credenciales de los inicios de sesión, la imagen de `login-02` (sin `imageSrc`, un degradado neutro provisional) y el estado «válido» de un campo (lo escribe `signup-01`) no tienen diseño todavía.
- **`otp-01`:** si tu app responde a dos envíos seguidos con el mismo `status` sin pasar por `loading`, el segundo no se muestra; pon `loading` mientras compruebas el código.
- Documentación solo en español; los Blocks, en inglés.

## 0.3.0 (06/11/2026): entradas avanzadas

### Antes de actualizar

- **Actualiza `@angular/cdk` y `@angular/aria` a la 22.2.4 o superior.** Los componentes que los usan piden ahora `^22.2.4` (antes `^22.2.0`): con la 22.2.3, Combobox y Select lanzan `NG0950: Input "combobox" is required but no value is available yet` cuando se crean y se destruyen antes de la primera detección de cambios. `ng g mimi` no cambia un cdk o un aria que ya tengas instalados (solo te avisa, ver «CLI»), así que actualízalos tú:

  ```sh
  ng update @angular/cdk @angular/aria
  ```

- **Si modificaste tu tema (`components/ui/theme/theme-base.css`)**, `ng g mimi` no lo actualiza (solo avisa) y te faltarán dos cosas de esta versión:
  1. **La regla de `.cdk-visually-hidden`** (es una corrección, ver «Correcciones»). Copia del `theme-base.css` nuevo, que está en `node_modules/@mimi-ng/cli/dist/templates/theme/theme-base.css` después de instalar la CLI (en `.mimi/base/theme/` queda la versión anterior, la que modificaste, para comparar), el bloque `.cdk-visually-hidden { … }` y el de `[dir='rtl'] .cdk-visually-hidden { … }`, fuera de cualquier `@layer`; **o** agrega a tu CSS global, después del tema:

     ```css
     @import '@angular/cdk/a11y-prebuilt.css';
     ```

  2. **Los tokens globales del Grupo 2** (abajo, «Tema»). No es obligatorio: los componentes nuevos funcionan sin ellos, porque cada uno trae su valor de respaldo; cópialos si quieres cambiarlos desde el tema o usar sus clases (`bg-track`, `bg-chip`…).

### Componentes nuevos

Catorce nuevos en el menú de `ng g mimi` (de 22 a 36): los trece de la lista (Date Picker y Date Range son dos) y el calendario suelto (`calendar`). Todos aceptan `class`, exponen su estado con atributos `data-*` y tienen tokens propios (`--mimi-<componente>-*` y su grupo en `provideMimiTheme({ components })`; Date Picker, Date Range y el calendario comparten `date`). Cada uno tiene su página con la tabla «Variables CSS», salvo el calendario, que se documenta en la del Date Picker. Los que tienen textos propios los traen en inglés, con su versión `_ES` (Toggle Group, Input Mask, Input OTP y Progress no tienen). Los controles de formulario funcionan sin adaptadores con Signal Forms (`[formField]`), Reactive Forms y `ngModel` (`FormValueControl`); dentro de `mimi-form-field` reciben la etiqueta y el error todos salvo Toggle Group, que se nombra con `aria-label` (Password, a través de su `input[mimiInput]`).

- **Toggle Group** (`ng g mimi toggle-group`): control segmentado. Simple (como un grupo de radio, con un indicador que se desliza) o `multiple` (botones que se activan); un solo `[(value)]`, `variant="solid"` y teclado con flechas. Usa el `FocusKeyManager` de `@angular/cdk`.
- **Number Input** (`ng g mimi number-input`): campo numérico con − y +, `min`, `max`, `step` y `format` (las opciones de `Intl.NumberFormat`: moneda, decimales, unidad, porcentaje) en el idioma de la app. Lee «1.250,5» en `es-ES`; vacío es `null`.
- **Password** (`ng g mimi password`): envuelve tu `<input mimiInput type="password">` (el valor y el formulario siguen siendo del input) y le agrega el botón de mostrar u ocultar y, con `meter`, el medidor con reglas configurables (`rules`) o tu propia función (`strength`). Usa `@angular/cdk` (anuncia el nivel).
- **Input Mask** (`ng g mimi input-mask`): da formato mientras se escribe (`mask="(000) 000-0000"`); el valor guarda **solo los dígitos**. Con marcador de lo que falta (`ghost`), prefijo fijo e ícono.
- **Input OTP** (`ng g mimi input-otp`): código de un solo uso en casillas, con un solo input real (pegar y el autocompletado del SMS funcionan), `length`, `separatorAfter`, `alphanumeric` y `success`.
- **Tags Input** (`ng g mimi tags-input`): etiquetas como chips, con separadores, pegado de varias, duplicados, `limit`, `normalize` y `validate`. Instala también el chip (ver «Ítems internos»).
- **Slider** (`ng g mimi slider`): un valor o, con `range`, un rango `[desde, hasta]` con dos pulgares que no se cruzan; marcas, burbuja con el valor (`showValue`), `format` y RTL. Usa `@angular/cdk`.
- **Combobox** (`ng g mimi combobox`): campo donde se escribe para filtrar y elegir, simple o `multiple` con chips; crear opciones nuevas (`creatable` y `(create)`), búsqueda en el servidor (`loading` y `(searchChange)`), filtro propio (`filterWith`) y plantilla por opción. Usa `@angular/aria` y `@angular/cdk`, como Select.
- **Date Picker** (`ng g mimi date-picker`) y **Date Range** (`ng g mimi date-range`): fecha o periodo en un calendario dentro de un Popover, con `min`/`max` (en Date Range, `minDate`/`maxDate`), días deshabilitados, atajos en el rango e idioma con `Intl.DateTimeFormat` (`LOCALE_ID` o `locale`, sin registrar datos). **La fecha es una cadena ISO** (`'2026-09-30'`, tipo `MimiDate`), sin problemas de zona horaria; `toMimiDate()` y `fromMimiDate()` convierten de y a `Date`. El calendario también se instala suelto: **`ng g mimi calendar`** (`mimi-calendar`).
- **Progress** (`ng g mimi progress`): barra o círculo (`shape`), determinado o indeterminado (`value` sin definir), con `tone`. Sin dependencias.
- **File Upload** (`ng g mimi file-upload`): zona para elegir o soltar archivos (`accept`, `maxSize`, `maxFiles`; los rechazados salen por `(rejected)`) y una lista de filas (`mimi-file-list`, `mimi-file-item`) para mostrar el estado de la subida que hace tu app. Mimi no sube nada. Usa `@angular/cdk`.
- **Color Picker** (`ng g mimi color-picker`): panel con área de saturación y brillo, tono, paleta (`swatches`), recientes y campo en HEX u OKLCH (`mimi-color-picker`), y el mismo panel en un disparador con Popover (`mimi-color-input`). El valor es siempre hex en minúsculas.

### Ítems internos nuevos

No salen en el menú de `ng g mimi`; los instalan los componentes que los usan:

- **`chip`** (`components/ui/chip/`): el chip de Tags Input y del Combobox múltiple (`mimi-chip`), con sus anuncios (`injectMimiChipAnnouncer`). Usa `@angular/cdk`.
- **`option-list`** (`components/ui/option-list/`): las utilidades de lista del Combobox (filtro sin tildes ni mayúsculas, resaltado `mimi-highlight` y los tipos `MimiListOption` y `MimiListOptionGroup`). Usa `@angular/aria`. **Select no cambia en esta versión:** sigue con su propia lógica de lista (pasarlo a estas utilidades queda para más adelante).

### Tema

- **Tokens globales nuevos** (claro y oscuro, y con su clase de Tailwind): `--mimi-range` (banda del rango de fechas), `--mimi-track`, `--mimi-track-fill` y `--mimi-thumb` (pistas y pulgares), `--mimi-chip` y `--mimi-chip-foreground`, `--mimi-dropzone`, `--mimi-dropzone-active` y `--mimi-dropzone-active-border`, `--mimi-strength-weak`, `--mimi-strength-medium` y `--mimi-strength-strong` (medidor de Password) y `--mimi-selection`.
- **Animaciones nuevas:** `mimi-caret` (cursor de Input OTP), `mimi-bob` (File Upload al arrastrar), `mimi-shake` (Input OTP con error) y `mimi-indet` (Progress indeterminado). Con movimiento reducido, los componentes no las usan (Progress indeterminado late en su lugar).
- **La regla de `.cdk-visually-hidden`** (ver «Correcciones»).
- **Preset:** grupos nuevos en `components` (`toggleGroup`, `progress`, `numberInput`, `password`, `inputMask`, `inputOtp`, `chip`, `tagsInput`, `slider`, `combobox`, `date`, `fileUpload` y `colorPicker`). Date Picker, Date Range y el calendario comparten el grupo `date` (`--mimi-date-*`).
- **Los componentes nuevos funcionan con un tema de la 0.2.0:** todos los tokens globales nuevos se usan con un valor de respaldo, así que no se rompe nada si tu tema no los tiene.

### Rupturas

Mientras Mimi sea `0.x`, una versión menor puede cambiar algo publicado (spec 12). En esta versión, una:

- **Dependencias: `@angular/cdk` y `@angular/aria` pasan de `^22.2.0` a `^22.2.4`** en todos los ítems que los usan, también los publicados en la 0.2.0 (Popover, Tooltip, Dropdown Menu, Context Menu, Select, Dialog, Toast, Tabs, Toolbar y Pagination, los ítems de menú y `utils/overlay`; Confirm, a través de Dialog). **Por qué:** con la 22.2.3, Combobox y Select lanzan `NG0950` al destruirse antes de su primera detección de cambios (arreglado en aria 22.2.4). **Qué hacer:** `ng update @angular/cdk @angular/aria` (ver «Antes de actualizar»). Si ya tienes la 22.2.4 o posterior, no cambia nada.

### Cambios en componentes de la 0.2.0

Sin cambios de API. `ng g mimi` los actualiza si no modificaste sus archivos.

- **Paneles dentro de la pantalla en móvil** (`utils/overlay`, lo usan Popover, Tooltip, Dropdown Menu, Context Menu y Select). En una pantalla de 360px, algunos menús se salían por un costado. Ahora, si la alineación pedida no cabe, el panel prueba las otras dos alineaciones del mismo lado antes de cambiar de lado, y queda a 8px del borde. Select prueba también las tres alineaciones arriba y abajo (antes, dos posiciones).
- **Popover: al abrir, el foco va al elemento con `autofocus` del panel** si lo hay (así el calendario enfoca el día elegido); si no, al primer elemento enfocable, como antes. Si tu contenido tiene un `autofocus`, ahora el foco empieza ahí.

### CLI

- **`ng g mimi` avisa si tu `@angular/cdk` o tu `@angular/aria` son anteriores a la 22.2.4** (instalados o declarados en un rango que no puede llegar a ella) y te da el `ng update`. Solo avisa: no cambia las versiones de tu proyecto.
- **`--overwrite` reemplaza también con la misma versión.** Antes, con la misma versión de la CLI, un archivo distinto de la plantilla se tomaba como «al día» y no se reemplazaba.

### Correcciones

- **El texto del anuncio para lectores de pantalla se veía al final de la página** (afecta a la 0.2.0). Pagination («Página 4 de 12») y Toast (su texto) anuncian con el `LiveAnnouncer` del CDK, que crea un elemento con la clase `cdk-visually-hidden` pero no carga el CSS que lo oculta (el CDK solo lo carga al abrir un Dialog o una trampa de foco). Sin haber abierto antes un Dialog, el texto quedaba a la vista al final del `body`. El tema trae ahora esa regla, así que lo arregla cualquier `ng g mimi` si no modificaste el tema; **si lo modificaste**, copia la regla o importa `@angular/cdk/a11y-prebuilt.css` (ver «Antes de actualizar»). Los componentes nuevos que anuncian (Password, File Upload, Tags Input y Combobox múltiple) ya lo usan.

### Cómo actualizar desde la 0.2.0

1. Actualiza cdk y aria: `ng update @angular/cdk @angular/aria` (si tienes una versión anterior a la 22.2.4).
2. Instala la CLI nueva: `npm i -D @mimi-ng/cli@0.3.0` (con pnpm, `pnpm add -D @mimi-ng/cli@0.3.0`).
3. Vuelve a ejecutar `ng g mimi` con los componentes que usas (por ejemplo, `ng g mimi button select pagination toast`). Actualiza esos componentes, sus utilidades y el tema, y lo dice: «pagination actualizado de 0.2.0 a 0.3.0». Lo que modificaste no se toca (todo o nada por componente, como en la 0.2.0): el aviso dice qué no se actualizó, y `--overwrite` lo reemplaza (guarda antes tus cambios para aplicarlos de nuevo; `.mimi/base/` tiene la versión que modificaste, para comparar).
4. Si modificaste el tema, copia a mano lo de «Antes de actualizar».
5. Para los componentes nuevos, `ng g mimi <nombre>` (por ejemplo, `ng g mimi combobox date-picker`).

### Limitaciones conocidas

- **Paneles altos en pantallas chicas:** el calendario, el Date Range con atajos y el Color Picker en su disparador miden unos 360–372px; con el disparador en el medio de una pantalla de 360 × 780, no caben ni arriba ni abajo y pueden quedar unos píxeles fuera del margen. En móvil se usan los mismos paneles que en escritorio (sin hoja inferior ni panel modal en esta versión).
- **Date Picker y Date Range:** la fecha se elige en el calendario; todavía no se puede escribir a mano.
- Documentación solo en español.

## 0.2.0 (21/10/2026): overlays y navegación

### Componentes nuevos

- **Popover** (`ng g mimi popover`): panel flotante junto a un botón, con flecha, flip si no cabe, `[(open)]`, Escape y clic fuera, y el foco de vuelta al botón. El panel se nombra con su título (`mimiPopoverTitle`) o con `aria-label` en `<mimi-popover>`. Usa `@angular/cdk` por dentro: si tu proyecto no lo tiene, `ng g mimi popover` lo instala en la versión de tu `@angular/core` y agrega `@import "@angular/cdk/overlay-prebuilt.css";` a tu CSS global.
- **Tooltip** (`ng g mimi tooltip`): `mimiTooltip="Texto"` en cualquier elemento. Se abre con el puntero o con el teclado después de un retraso (`--mimi-tooltip-delay`, 300 ms), se cierra con Escape sin mover el foco, y en una fila de botones los siguientes abren sin esperar. Si su texto ya está en el nombre del elemento (`aria-label` o `aria-labelledby`), el lector no lo repite. En pantallas táctiles no se muestra. Usa `@angular/cdk`, igual que Popover.
- **Dropdown Menu** (`ng g mimi dropdown-menu`): menú desplegable desde un botón, con ítems con ícono y atajo, acciones destructivas (`tone="danger"`; sin `tone`, el color normal), checkbox (`[(checked)]`), grupo radio (`[(value)]`), etiquetas, separadores y submenús. Se maneja con el teclado como pide el patrón de menú: flechas, Inicio y Fin, búsqueda por letra, Enter, Espacio, → y ←, y Escape. Usa `@angular/aria` y `@angular/cdk` por dentro: `ng g mimi dropdown-menu` instala `@angular/aria` en la versión exacta de tu `@angular/cdk` (o los dos en la de tu `@angular/core`) y agrega los estilos del CDK a tu CSS global.
- **Context Menu** (`ng g mimi context-menu`): menú con el clic derecho, en el punto del puntero, con los mismos ítems que el Dropdown Menu. Un solo menú sirve para todas las filas de una lista o una tabla (`[mimiContextMenuTriggerData]` llega al contenido como `let-fila`). Se abre también con Shift+F10 o la tecla de menú, y con la pulsación larga en Android. Con `disabled`, el clic derecho muestra el menú del navegador. Necesita un nombre: `aria-label` en `<mimi-context-menu>`. Los ítems de los dos menús se instalan en `components/ui/menu/`; `ng g mimi context-menu` no instala el Dropdown Menu.
- **Select** (`ng g mimi select`): lista desplegable de una opción, con el alto de Input y Button. Las opciones son datos (`[options]`, con grupos, opciones deshabilitadas y un texto de ayuda), y trae buscador dentro del panel (`search`, sin tildes ni mayúsculas, con contador y resaltado), botón de limpiar (`clearable`), estado de carga (`loading`, con `(searchChange)` para buscar en el servidor) y plantilla propia para cada opción. Funciona sin adaptadores con Signal Forms, Reactive Forms y `ngModel`, y dentro de `mimi-form-field` muestra la etiqueta y el error solo. Se maneja con el teclado como pide el patrón combobox: flechas, Inicio y Fin, búsqueda por letra, Enter, Espacio, Alt+↓, Alt+↑ y Escape. `class` va al disparador y `panelClass` al panel; `side` y `align` (como en Popover) eligen dónde abre el panel, y `matchWidth` si mide lo mismo que el disparador. Los textos propios están en inglés; `provideMimiSelectText(MIMI_SELECT_TEXT_ES)` los pone en español. Usa `@angular/aria` y `@angular/cdk` por dentro, como los menús.
- **Dialog** (`ng g mimi dialog`): ventana modal centrada, con X siempre visible. Se usa en la plantilla (`<mimi-dialog [(open)]>` con un botón y un `ng-template`) o desde el código (`MimiDialogService.open(Componente, { data })`, que devuelve una referencia con `close(resultado)` y `afterClosed()`). Trae encabezado, título, descripción, cuerpo, pie y `mimiDialogClose`. El foco queda dentro y vuelve al botón al cerrar (también si se abrió desde un ítem de menú: vuelve al botón del menú), la página de detrás no se desplaza ni se lee (con dos diálogos, tampoco el de abajo), y el contenido largo tiene scroll interno. Escape y el clic en el fondo se desactivan por separado (`closeOnEscape`, `closeOnBackdropClick`) o juntos (`disableClose`). Textos (la X) con `provideMimiDialogText(MIMI_DIALOG_TEXT_ES)`. Usa `@angular/cdk` por dentro.
- **Confirm** (`ng g mimi confirm`): pide confirmación desde el código. `injectMimiConfirm()` (al declarar la propiedad) devuelve `confirm({ title, description, confirmText, cancelText, tone, icon })`, una promesa con `true` o `false`. `tone`: `primary` o `danger` (el foco empieza en Cancelar con `danger` y en Confirmar con `primary`). Se abre como `alertdialog` sin X; Escape responde `false` y el clic en el fondo no cierra. Usa Dialog por dentro; los textos, con `provideMimiConfirmText(MIMI_CONFIRM_TEXT_ES)`.
- **Toast** (`ng g mimi toast`): avisos desde el código con `injectMimiToast()`: `toast()` (sin tono), `success`, `info`, `warning`, `error` (tono `danger`), `promise` (cargando y después el resultado) y `dismiss`. Variantes `outline` y `solid`, con acción opcional. No hay que poner ningún `<Toaster>`: la pila se crea sola. `provideMimiToast({ position, duration, hotkey })` para la posición (seis) y la duración. Accesible: los lee el lector de pantalla (los de error, con prioridad), F8 lleva el foco a la pila y Escape lo devuelve, el tiempo se detiene con el puntero, el foco o la pestaña oculta, y los que tienen acción no se cierran solos. Textos con `provideMimiToastText(MIMI_TOAST_TEXT_ES)`. Usa `@angular/cdk`.
- **Tabs** (`ng g mimi tabs`): pestañas subrayadas o en píldora (`variant`), con un indicador que se desliza a la elegida. `<mimi-tabs [(value)]>` con cada pestaña en `<ng-template mimiTab="valor" label>`, contador (`[count]`), deshabilitadas (se enfocan pero no se eligen) y etiquetas con ícono (`mimiTabLabel`). El panel se crea al elegirse (`preserveContent` lo conserva). `class` va a la fila de pestañas y `panelClass` a los paneles. Flechas, Inicio y Fin. Usa `@angular/aria` por dentro (la CLI agrega también `@angular/cdk`).
- **Toolbar** (`ng g mimi toolbar`): píldora translúcida con botones de herramienta, horizontal o vertical. Los botones son tuyos: `<button mimiToolbarItem="valor" kind="tool | toggle | action">`, con `[(value)]` para la herramienta activa (el disco), `[(pressed)]` para los interruptores y `(activate)` para todos; separadores (`mimi-toolbar-separator`) y contador (`mimiToolbarCount`). Una sola parada de Tab y flechas según la orientación; un `mimiTooltip` puede ir en el mismo botón. Usa el `FocusKeyManager` de `@angular/cdk` (no `@angular/aria`).
- **Pagination** (`ng g mimi pagination`): píldora compacta `← página / total →`, con el número de página que se puede escribir y, opcional, los registros por página (`pageSizeOptions`). `[(page)]` desde 1, `[(pageSize)]`, `total` (registros) y `(paginate)` una vez por acción. Anuncia «Página 3 de 12» y, en la primera y la última página, ← y → siguen enfocables. El selector de registros (un Select) se carga con `@defer` solo si lo usas. Tamaños `sm` (por defecto) y `default`; `variant="floating"` para la sombra flotante. Textos con `provideMimiPaginationText(MIMI_PAGINATION_TEXT_ES)`.

### Cambios

- **Cómo actualizar desde la 0.1.x:** instala la CLI nueva (`npm i -D @mimi-ng/cli@0.2.0` o `pnpm add -D @mimi-ng/cli@0.2.0`) y vuelve a ejecutar `ng g mimi` con los componentes que usas (por ejemplo, `ng g mimi button input card`).
  - **`ng g mimi` actualiza también el tema** (`components/ui/theme/`) y las utilidades que copió `ng add`, si no los modificaste: los componentes de la 0.2.0 usan tokens nuevos, y con el tema de la 0.1.x algunos estilos no se generaban. Si modificaste el tema, no se toca y un aviso te explica cómo combinarlo.
  - **Todo o nada por componente:** si modificaste un archivo de un componente de la 0.1.x, no se actualiza ninguno de sus archivos ni los componentes que lo necesitan (Confirm usa Button), para no mezclar versiones. El aviso dice cuál no se actualizó y por qué, y ofrece `--overwrite` o combinarlo a mano con `.mimi/base/`. «actualizado» solo aparece cuando se actualizó el componente entero.
- `init` escribe `"style": "mimi"` en `mimi.json`; `"vivid"` se sigue aceptando.
- **`@angular/cdk` y `@angular/aria` desde la 22.2.** Los componentes que los usan piden `^22.2.0`. Si tu proyecto ya tiene `@angular/cdk` 22.0 o 22.1, `ng g mimi` no lo cambia: actualízalo con `ng update @angular/cdk` (y `@angular/aria`, en la misma versión).
- **Avisos en modo desarrollo** con un solo formato: «[Mimi] Componente: …». El único de la 0.1.x cambia de «[mimi] Se ignora --mimi-…» a «[Mimi] Theme: se ignora --mimi-…»; si lo filtrabas en la consola, ajusta el filtro.
- `ng g mimi` agrega al CSS global los `@import` que necesita un componente (por ahora, los estilos del overlay del CDK para Popover, Tooltip, los menús, Select, Dialog, Confirm y Pagination), una sola vez y después del tema.
- **Button y Badge: variante y tono separados.** `variant` es cómo se ve (Button: `solid`, `soft`, `outline`, `ghost`, `link`; Badge: `solid`, `soft`, `outline`) y `tone` de qué color (`primary`, `secondary`, `success`, `warning`, `info`, `danger`). Sin `tone`, `outline` y `ghost` son neutros, como en la 0.1.0. Los atajos de la 0.1.0 siguen funcionando hasta la 1.0: `variant="default"`, `"secondary"` y `"destructive"` (= `solid` + `danger`). Los tipos `ButtonVariant` y `BadgeVariant` también los siguen aceptando (marcados `@deprecated`), así que tu código tipado con `'destructive'` compila; `ButtonStyleVariant` y `BadgeStyleVariant` son las variantes sin los atajos.
- **`data-variant` y `data-tone` muestran los valores resueltos** (puede afectar tu CSS): `variant="destructive"` produce `data-variant="solid" data-tone="danger"`. Si tienes estilos sobre `[data-variant="destructive"]`, cámbialos a `[data-tone="danger"]`; sobre `[data-variant="default"]`, a `[data-variant="solid"][data-tone="primary"]`.
- **Tema: tonos y tokens nuevos.** Tonos `success`, `warning` e `info` (con fondo suave, hover, anillo y sombra de color), `--mimi-glow`, superficies para los componentes nuevos (`tooltip`, `glass`, `overlay-blur`, `shadow-popover`) y tokens compartidos (foco, deshabilitado, íconos). `--mimi-destructive-ring` es ahora el anillo de destructive; **`--mimi-destructive-soft` (y `ring-destructive-soft`) sigue como alias hasta la 1.0**, cuando pasará a ser el fondo suave: cambia `ring-destructive-soft` por `ring-destructive-ring` en tu código. **Si cambiaste el valor de `--mimi-destructive-soft`** en tu CSS, cámbialo en `--mimi-destructive-ring`: el alias sirve para leerlo, pero los componentes ya usan `--mimi-destructive-ring` y no verán tu valor. Variable nueva `--mimi-input-hover` (y la clase `border-input-hover`). Grupo nuevo `effects` en el preset (`overlayBlur`, `glassBlur`). **Valores que cambian** (para seguir el diseño): `--mimi-overlay` pasa de `oklch(0 0 0 / 50%)` a `oklch(0.145 0 0 / 0.38)` en claro y `oklch(0 0 0 / 0.6)` en oscuro, y `--mimi-popover` en oscuro de `oklch(0.175 0 0)` a `oklch(0.205 0 0)`; si usas `bg-overlay` o `bg-popover` en tu código, se verá un poco distinto.
- **Tokens propios** en Avatar, Switch, Checkbox, FormField, Separator, Skeleton, Badge y Textarea (que antes usaba los de Input; los nuevos caen en los de Input, así que no cambia nada si ya personalizaste Input). Tokens nuevos también en los que ya los tenían: Button (`gap`, `pressScale`), Card (`padding`, uno para las tres zonas) e Input (`px`), y los colores de Card, Input y Button (`--mimi-card-bg`, `--mimi-input-border`…) en el CSS. Cada página tiene su tabla «Variables CSS». Nombres de la 0.1.0 que siguen funcionando hasta la 1.0, con un aviso en modo desarrollo: `components.button.paddingX` y `components.input.paddingX` → `px`; `components.input.placeholderColor` → `--mimi-input-placeholder` en el CSS; `radii.badge` → `components.badge.radius`.

### Correcciones

- **`ng g mimi` actualizaba a medias un componente modificado.** Con un archivo cambiado por ti (por ejemplo, `button.ts`), actualizaba los demás archivos del componente, omitía el tuyo y decía «actualizado»: el proyecto podía dejar de compilar. Ahora es todo o nada (ver «Cambios»).
- **Button borraba el `aria-disabled`, el `tabindex` y el `aria-busy` del usuario.** En `<button mimiBtn aria-disabled="true">` (un botón deshabilitado que sigue enfocable) o con `[attr.tabindex]`, Button quitaba el atributo, porque lo manejaba siempre aunque no lo necesitara. Ahora solo los escribe cuando hacen falta (`aria-disabled` y `tabindex="-1"` en un `<a mimiBtn>` deshabilitado, `aria-busy` mientras carga) y después devuelve el valor que había. `disabled` y `<a mimiBtn>` siguen igual. Si no modificaste `button.ts`, `ng g mimi button` lo actualiza (sin `--overwrite`, que reemplazaría también los archivos que sí cambiaste).
- **Accesibilidad: contraste del hover de los botones sólidos en modo claro.** En `success`, `info` y `danger` (`destructive`) el texto es blanco y el hover aclaraba el fondo hasta unos 3,8:1, por debajo de AA (4,5:1). Ahora el hover se aleja del color del texto: oscurece el fondo un 12 % (5,8:1). Cambia `--mimi-destructive-hover`, que ya fallaba en la 0.1.0 (`variant="destructive"` de Button), y los nuevos `--mimi-success-hover` e `--mimi-info-hover`. En modo oscuro no cambia nada.

### Preguntas frecuentes

- **¿Por qué ahora se instalan `@angular/aria` y `@angular/cdk`?** Los componentes nuevos necesitan teclado, foco y posición de paneles que son muy difíciles de hacer bien a mano. Mimi usa por dentro estos dos paquetes oficiales del equipo de Angular: `@angular/cdk` en Popover, Tooltip, Dialog, Confirm, Toast y Toolbar, y además `@angular/aria` en Select, Dropdown Menu, Context Menu, Tabs y Pagination (por su selector de registros, que es un Select). Solo llegan con los componentes que los usan, `ng g mimi` los instala en la versión correcta (aria en la exacta de tu cdk), nunca aparecen en la API de Mimi y sus correcciones te llegan con `ng update`. Los componentes de la 0.1.0 no los usan. Más en [Fundamentos](https://ng.mimiworks.dev/docs/foundations).

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
