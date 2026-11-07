# Mimi (@mimi-ng): especificación

## 1. Qué es

Librería de componentes UI para **Angular 22** y **Tailwind CSS 4** que se distribuye como código fuente: una CLI copia cada componente al proyecto del usuario, que desde ese momento es dueño del código. Usa un solo prefijo (`mimi`) y un archivo de tema opcional tipado, al estilo de los presets de PrimeNG. El requisito principal es que sea **muy fácil de usar**.

### Diferenciales (frente a Spartan y shadcn)

1. **Actualizaciones que respetan tus cambios.** La CLI guarda la versión original de cada componente en `.mimi/base/` y `mimi update` combina la versión nueva con las personalizaciones del usuario, mostrando solo los conflictos. (Spartan obliga a actualizar a mano o sobrescribe.)
2. **Un solo modelo mental.** Sin capas Brain/Helm: un prefijo y todo el código en tu proyecto.
3. **Familiar para quien viene de PrimeNG o NG-ZORRO.** Lo que allí es `showSearch` y `allowClear` aquí es `search` y `clearable`; modales por servicio y presets tipados. Página de migración con equivalencias.
4. **Formularios listos.** Errores en rojo y mensajes automáticos.
5. **Un solo tema base, Mimi:** paleta neutra con radio amplio, sombras en capas y micro-animaciones (inspirado en Vuesax), que cada persona adapta (sección 11).
6. **Documentación en español e inglés.**

**Lema (fijo):** _"Los componentes son tuyos. Las actualizaciones también."_ Es el titular de la landing y no se cambia en rediseños.

### Reglas del código que se entrega

- **Solo APIs documentadas de Angular.** El código que la CLI copia queda en el proyecto de cada usuario: si dependiera de un detalle interno de Angular y ese detalle cambiara, tras un `ng update` el componente dejaría de funcionar sin ningún aviso, y la corrección de Mimi no le llegaría sola. Por eso no se usan símbolos `ɵ`, clases internas ni comportamientos no documentados, aunque ahorren código o peso. Ver el costo aceptado en la sección 8 (`field-state` y Signal Forms).

## 2. Stack

| Capa               | Tecnología                                                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Angular 22 (standalone, OnPush, zoneless, signals)                                                                                                                                                        |
| Estilos            | Tailwind CSS 4 (configuración en CSS, sin `tailwind.config.js`)                                                                                                                                           |
| Colores            | OKLCH en variables CSS `--mimi-*`                                                                                                                                                                         |
| Clases             | `clsx` + `tailwind-merge` → `cn()`                                                                                                                                                                        |
| Variantes          | `class-variance-authority` (`cva`)                                                                                                                                                                        |
| Overlays (Grupo 1) | `@angular/aria` (listbox, combobox, menu, tabs) y `@angular/cdk` (`overlay`, `dialog`, `a11y`, `drag-drop`; mimi-toolbar usa `FocusKeyManager` de `a11y`, excepción de la G1.10); decisión 4.3, sección 4 |
| Íconos             | Lucide: SVG en línea dentro de los componentes; `@lucide/angular` en el showcase y como recomendación                                                                                                     |
| CLI                | Angular Schematics + comando `mimi`                                                                                                                                                                       |
| Monorepo           | pnpm workspaces                                                                                                                                                                                           |
| Formato            | Prettier en la raíz (`.prettierrc`, `.prettierignore`); `pnpm format` escribe y `pnpm format:check` solo revisa                                                                                           |
| Showcase           | Angular 22 puro (no AnalogJS), con prerender                                                                                                                                                              |

### Versiones

| Herramienta            | Versión instalada | Requisito                                                                                    |
| ---------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| Node.js                | 24.18.0           | Angular 22 exige `^22.22.3 \|\| ^24.15.0 \|\| ^26.0.0`                                       |
| pnpm                   | 12.5.1            | Fijada en `packageManager` del `package.json` raíz                                           |
| Angular (framework)    | 22.2.4            | `@angular/core`, `common`, `compiler`, `compiler-cli`, `forms`, `platform-browser`, `router` |
| Angular (herramientas) | 22.2.4            | `@angular/cli`, `@angular/build` (se versionan aparte del framework)                         |
| Angular CDK y Aria     | 22.2.4            | `@angular/cdk`, `@angular/aria` (aria exige la misma versión exacta que cdk)                 |
| TypeScript             | 6.0.3             | Angular 22 exige `>=6.0.0 <6.1.0`                                                            |
| Tailwind CSS           | 4.3.3             | Con `@tailwindcss/postcss`                                                                   |
| Vitest                 | 4.1.11            | Pruebas de docs y ui-core con `ng test` (con jsdom)                                          |
| @lucide/angular        | 1.47.0            | Íconos del showcase (peer `@angular/core >=17`); en el `package.json` raíz                   |
| shiki                  | 4.4.3             | Resaltado del showcase (con `@shikijs/langs` y `@shikijs/themes`); en el `package.json` raíz |

El showcase se despliega con wrangler 4 (`npx wrangler@4 deploy`, sin instalarlo como dependencia) y Node 24.18.0 (`.node-version`); ver sección 10, «Despliegue».

pnpm 11+ bloquea los scripts de instalación: los autorizados están en `allowBuilds` de `pnpm-workspace.yaml` (`@parcel/watcher`, `esbuild`, `lmdb`, `msgpackr-extract`).

**Versiones de Angular fijas (M.2, 05/11/2026).** Todos los `@angular/*` del `package.json` raíz van en una versión exacta (sin `^`): la mayor que core, cdk, aria, cli y build tienen en común (`npm view <paquete> version`). Con `^`, `pnpm dedupe` sube cdk, aria, cli y build a su última versión (22.2.6 y 22.2.5 el 05/11/2026) y deja a aria y cdk por delante de core. `@angular-devkit/core`, `@angular-devkit/schematics` y `@schematics/angular` siguen a `@angular/cli` con `overrides` en `pnpm-workspace.yaml`, porque `packages/cli` los declara con `^22.0.0` (el rango que se publica, que no cambia). Al subir Angular se cambian los dos sitios.

## 3. Estructura del monorepo

```
mimi-ng/
├── angular.json               # Workspace de Angular: proyectos "docs" y "ui-core"
├── package.json               # Dependencias de Angular, Tailwind, Vitest y scripts
├── pnpm-workspace.yaml        # apps/* y packages/*; allowBuilds
├── tsconfig.base.json         # compilerOptions comunes y alias @mimi-ng/ui-core
├── apps/docs/                 # Showcase = documentación + entorno de pruebas
│   ├── src/
│   ├── public/
│   ├── .postcssrc.json        # @tailwindcss/postcss
│   └── tsconfig.json, tsconfig.app.json, tsconfig.spec.json
├── packages/
│   ├── ui-core/               # Proyecto "ui-core" (library): solo target test
│   │   ├── tsconfig.json, tsconfig.spec.json
│   │   └── src/lib/
│   │       ├── theme/         # theme-base.css, types.ts, provider.ts
│   │       ├── utils/         # cn.ts, control-styles.ts
│   │       └── components/    # button/, input/, card/…
│   └── cli/                   # @mimi-ng/cli (CommonJS, "type": "commonjs")
│       ├── package.json       # "schematics": "./dist/collection.json", "ng-add": { "save": "devDependencies" }
│       ├── tsconfig.json      # tsc → dist/ (module "nodenext" + package CJS = CommonJS)
│       ├── vitest.config.mts  # pruebas en Node contra dist/
│       ├── scripts/build.mjs  # compila y empaqueta las plantillas
│       └── src/
│           ├── collection.json, registry.json, registry.ts
│           ├── init/  ng-add/  ui/   # schematics
│           ├── utils/         # write-files.ts (escritura con revisión y .mimi/base), project.ts
│           ├── testing/       # ayudantes de las pruebas (no se compilan)
│           └── theme/  bin/mimi.js      # tareas posteriores (theme, 5.3)
├── docs/                      # spec.md, plan.md (índice), plan/ (detalle de las tareas), design/
├── README.md
└── CLAUDE.md
```

Angular CLI se ejecuta siempre desde la raíz. `ui-core` no tiene build propio: su target `test` compila con la configuración de `docs:build:development`. Hay un solo lockfile. Las dependencias de ui-core (`clsx`, `tailwind-merge`, `class-variance-authority`) están en su `package.json` y también en el de la raíz, porque las pruebas las resuelven desde la raíz del workspace (igual que en un proyecto real, donde las instala la app).

Como Angular corre desde la raíz, el `styles.css` del showcase usa `@import 'tailwindcss' source(none)` y declara sus fuentes a mano (`apps/docs/src` y `packages/ui-core/src`, sin los `.spec.ts`); si no, Tailwind escanearía todo el repositorio (`docs/`, `CLAUDE.md`…) y generaría clases de más.

El showcase importa desde `ui-core` con alias de TypeScript, así lo que se ve en la documentación es exactamente lo que entrega la CLI. La versión de Mimi está solo en `packages/cli/package.json` (ui-core no tiene `version`; ver sección 12).

**La CLI (`packages/cli`, tareas 3.1 y 3.2).** Verificado en `@angular-devkit/schematics` 22.1.8:

- **CommonJS.** El runtime de schematics carga cada `factory` con `require()` (`tools/export-ref.js`), y `@schematics/angular` se publica igual. Por eso el paquete declara `"type": "commonjs"` explícito: si alguien lo quitara o pusiera `"module"`, `tsc` con `"module": "nodenext"` emitiría ESM y la CLI se rompería sin avisar.
- **`collection.json`:** `{ "schematics": { "<nombre>": { "factory": "./carpeta/index#fn", "schema", "description", "hidden", "aliases" } } }`.
- **`ng add`:** `@angular/cli` lee del `package.json` el campo `"schematics"` y `"ng-add": { "save": … }`, y ejecuta el schematic `ng-add` (puede ser `hidden`). Mimi usa `"save": "devDependencies"`: la CLI solo se usa al desarrollar.
- **Compilación** (`pnpm build:cli`, incluido en `pnpm build`): `scripts/build.mjs` limpia `dist/`, compila con `tsc`, copia `collection.json`, `registry.json` y los `schema.json`, copia `ui-core/src/lib/{components,utils,theme}` a `dist/templates/` (con `theme-base.css`, sin `*.spec.ts`) y copia `LICENSE` y `THIRD_PARTY_NOTICES.md` de la raíz (ignorados en git; npm solo publica lo que está dentro del paquete). Solo usa APIs de Node (`fs.rm`, `fs.cp`, `path.join`), sin `cp` ni `rm` de shell, para que funcione en Windows.
- **Sin red:** las plantillas viajan dentro del paquete; los schematics las leen con `url('../templates')`.
- **Dependencias:** `@angular-devkit/core`, `@angular-devkit/schematics` y `@schematics/angular`, con el mismo rango que ui-core declara para `@angular/core` (`^22.0.0`). `@schematics/angular` va en `dependencies` porque `init` lo usa en tiempo de ejecución: `readWorkspace` (leer `angular.json`), `addDependency` (agregar e instalar con el gestor del proyecto) y `JSONFile` (editar el tsconfig conservando comentarios).
- **Publicación** (tarea L.5): sin `"private"`. `prepublishOnly` ejecuta `scripts/build.mjs`, así que `npm publish` siempre publica un `dist/` recién compilado (está en `.gitignore`). La publica el dueño del proyecto desde `packages/cli` con `npm publish` y la verificación en dos pasos de npm. No con `pnpm publish`: da 404 aunque `npm whoami` funcione, porque pnpm 12 no usa la sesión de `npm login` (plan, tarea 0.1.1-3). Los pasos: `docs/proceso/release.md`.
- **Pruebas** (`pnpm test:cli`, incluido en `pnpm test`): Vitest en Node, contra `dist/`. `registry.spec.ts` comprueba el registro contra el código real; `init.spec.ts` y `ui.spec.ts` usan `SchematicTestRunner` sobre un workspace creado en memoria con `@schematics/angular` (`workspace` + `application`), no jsdom.

## 4. Catálogo

### Componentes básicos (0.1.0)

| Componente | Selector                                                                                                             | Notas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button     | `button[mimiBtn]`, `a[mimiBtn]`                                                                                      | `variant`: solid, soft, outline, ghost, link; `tone`: primary, secondary, success, warning, info, danger (ver «Variante y tono»; atajos default, secondary y destructive hasta la 1.0). Tamaños: sm, default, lg, icon. Input `loading` con spinner. `disabled` es nativo en `<button>`; en `<a>`, `aria-disabled="true"` y `tabindex="-1"`. Esos dos y `aria-busy` (al cargar) solo los escribe mientras hacen falta y después devuelve el valor del usuario: `<button mimiBtn [attr.aria-disabled]>` (deshabilitado enfocable, como ← y → de Pagination) conserva su atributo (corregido antes de la G1.12) |
| Input      | `input[mimiInput]`                                                                                                   | Error automático                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Textarea   | `textarea[mimiTextarea]`                                                                                             | Error automático                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Badge      | `span[mimiBadge]`                                                                                                    | `variant`: solid, soft, outline (con punto del color del tono); `tone` como Button (atajos default, secondary y destructive hasta la 1.0). Solo `<span>`, sin hover ni foco; íconos a 12px                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Card       | `mimi-card`, `mimi-card-header`, `mimi-card-title`, `mimi-card-description`, `mimi-card-content`, `mimi-card-footer` | Exporta `MimiCardImports`. `mimi-card-title` lleva `role="heading"` y `level` (`aria-level`, 3 por defecto); el pie se alinea a la derecha; contenido y pie suman `pt-6` si son la primera pieza                                                                                                                                                                                                                                                                                                                                                                                                              |
| Separator  | `mimi-separator`                                                                                                     | `orientation`: horizontal / vertical. `decorative` (true por defecto, como shadcn): `role="none"`; en `false`, `role="separator"` con `aria-orientation`. La vertical toma el alto de su fila flex (`self-stretch`)                                                                                                                                                                                                                                                                                                                                                                                           |
| Skeleton   | `mimi-skeleton`                                                                                                      | Pulso `mimi-pulse` (`--mimi-skeleton-duration`, 1,6 s, como el diseño; quieto con `motion-reduce`), fondo `--mimi-skeleton-bg` (→ `muted`), radio `--mimi-skeleton-radius` (→ `--mimi-radius-sm`). Tamaño y forma con `class`. `aria-hidden`; el contenedor lleva `aria-busy`                                                                                                                                                                                                                                                                                                                                 |
| Avatar     | `mimi-avatar`, `img[mimiAvatarImage]`, `mimi-avatar-fallback`                                                        | `size`: sm (32px) / default (40px) / lg (56px). El fallback se ve mientras la imagen carga, si falla o si no hay imagen; estado en `data-state` (`idle                                                                                                                                                                                                                                                                                                                                                                                                                                                        | loading | loaded | error`), también si la imagen ya estaba en caché. La imagen es el `<img>` nativo (`src`es entrada y se reescribe en el elemento;`ngSrc`no está soportado).`label`en el fallback da`role="img"`+`aria-label`. Exporta `MimiAvatarImports` |
| Switch     | `mimi-switch`                                                                                                        | `checked = model(false)`, `role="switch"`, Espacio y Enter. Por dentro es un `<button type="button">` y no un `<input type="checkbox">`: el pulgar y el check del diseño no se pueden dibujar de forma fiable con pseudoelementos sobre un input en todos los navegadores. Implementa `FormCheckboxControl` (spec 8), nunca ControlValueAccessor. El texto de adentro va en un `<label for>`; `id`, `aria-label` y `aria-labelledby` pasan al botón; `class` va al envoltorio                                                                                                                                 |
| Checkbox   | `mimi-checkbox`                                                                                                      | `checked` e `indeterminate` (`model`, `aria-checked="mixed"`), `role="checkbox"`, Espacio (Enter no, patrón WAI). Por dentro es un `<button type="button">` y no un `<input type="checkbox">`: el pulgar y el check del diseño no se pueden dibujar de forma fiable con pseudoelementos sobre un input en todos los navegadores. Implementa `FormCheckboxControl` (spec 8), nunca ControlValueAccessor. El texto de adentro va en un `<label for>`; `id`, `aria-label` y `aria-labelledby` pasan al botón; `class` va al envoltorio                                                                           |
| FormField  | `mimi-form-field`, `mimi-form-error`                                                                                 | Etiqueta + control + mensaje, sin `@if`. `label` dibuja un `<label for>`; un `<label>` propio sin `for` también se enlaza; si el control no tiene `id`, recibe uno. Con error: etiqueta roja y mensaje del primer error (13px, circle-alert de 14px), en el `aria-describedby` del control. `mimi-form-error` es opcional (texto o posición propios) y está siempre en el DOM con `aria-live="polite"` (vacío sin error). Mensajes: `provideMimiErrorMessages`, inglés por defecto, `MIMI_ERROR_MESSAGES_ES`. Exporta `MimiFormFieldImports`                                                                  |

### Grupo 1 (0.2.0)

| Componente    | Selector                                                                                                                                                                                                                                                                                                                  | Notas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Popover       | `mimi-popover`, `[mimiPopoverTrigger]`, `ng-template[mimiPopoverContent]`, `[mimiPopoverTitle]`, `[mimiPopoverDescription]`, `[mimiPopoverClose]`                                                                                                                                                                         | `open = model(false)`; `side` (top, right, bottom por defecto, left) y `align` (start, center por defecto, end), con flip al lado opuesto y después a los otros dos; `arrow` (true; decorativa, `aria-hidden`); `aria-label` (antes de la 0.2.0 se llamaba `label`). `class` y `aria-label` van en `mimi-popover` y se aplican al panel, no al host (Angular no pasa un `class` estático de un `ng-template` a la directiva). Panel `role="dialog"` no modal con `aria-labelledby` (título) y `aria-describedby` (descripción); trigger con `aria-haspopup="dialog"`, `aria-expanded` y, abierto, `aria-controls`. Al abrir, el foco va al primer elemento enfocable (o, desde la G2.9a, al que tenga `autofocus`); Escape, clic fuera y `mimiPopoverClose` cierran y el foco vuelve al trigger (si estaba en el panel o en ningún lado). Animación de entrada y salida con los valores de `--mimi-transition` (0,15 s, escala desde `--mimi-press-scale`), sin animación con movimiento reducido. Medidas del diseño `F2 Overlays`: 300px de ancho, 12px de separación, gap 12px. Por dentro, `CdkConnectedOverlay` (popover nativo `'inline'`) e `InteractivityChecker`; nada del CDK en la API. Exporta `MimiPopoverImports`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Tooltip       | `[mimiTooltip]` (en cualquier elemento)                                                                                                                                                                                                                                                                                   | Solo texto (`mimiTooltip`), sin contenido interactivo: para eso, Popover. `mimiTooltipSide` (top por defecto) y `mimiTooltipAlign`, con el mismo flip que Popover; `mimiTooltipDelay` (ms; sin él, `--mimi-tooltip-delay`, 300ms); `mimiTooltipDisabled`; `mimiTooltipShortcut` (atajo en monoespaciada, como el «⌘C» del diseño); `mimiTooltipArrow` (true); `mimiTooltipClass` (el `class` del elemento es suyo). WCAG 1.4.13: abre con el puntero (no táctil) y con el foco de teclado (`:focus-visible`, no con un clic), después del retraso; un puente invisible de 10px deja pasar el puntero al tooltip sin cerrarlo; Escape lo cierra sin mover el foco; se cierra al quitar el puntero, perder el foco o pulsar el elemento. `role="tooltip"`; mientras se ve, el elemento suma su id a `aria-describedby` (conserva los que tenía), salvo si el texto ya está contenido en su nombre (`aria-labelledby` o `aria-label`, sin distinguir mayúsculas ni espacios de más; G1.10: «Comentarios» no se repite después de «Comentarios, 3 sin leer»). **Salto sin retraso:** si otro tooltip se cerró hace menos de 300 ms (`MIMI_TOOLTIP_SKIP_DELAY`), el nuevo abre enseguida (para filas de botones y mimi-toolbar). **Táctil:** no se muestra (no hay hover y la pulsación larga choca con el sistema). Por dentro, `createOverlayRef` con un `ComponentPortal` (popover nativo `'global'`: no recibe foco y así no cambia los hermanos del elemento). Medidas del diseño `F2 Overlays`: padding 6×10px, 10px de separación, sombra `shadow-neutral`, texto peso 500                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Dropdown Menu | `mimi-dropdown-menu`, `[mimiDropdownMenuTrigger]`, `ng-template[mimiDropdownMenuContent]`; ítems `mimi-menu-item`, `mimi-menu-checkbox-item`, `mimi-menu-radio-group` y `mimi-menu-radio-item`, `mimi-menu-label`, `mimi-menu-separator`, `mimi-menu-sub` con `mimi-menu-sub-trigger` y `ng-template[mimiMenuSubContent]` | `open = model(false)`; `side` (bottom) y `align` (start), con el flip de Popover; `aria-label` (va al panel; si falta, el menú se nombra con el trigger: `aria-labelledby`); `class` va al panel, como en Popover. Ítems con prefijo `mimi-menu-*` (los reutiliza Context Menu): `mimi-menu-item` con `(selected)`, `tone` (`danger`; sin él, el color normal), `shortcut` (solo texto), `disabled`, `textValue` (typeahead) y `class`; el primer `svg` (o `[mimiMenuIcon]`) va a la columna de ícono de 16px. `mimi-menu-checkbox-item` con `[(checked)]` (`role="menuitemcheckbox"`, `aria-checked`, check); `mimi-menu-radio-group` con `[(value)]` y `aria-label`, y `mimi-menu-radio-item` con `value` (`menuitemradio`, punto; **provisional**, no está en el diseño). Estado: `data-state`, `data-disabled`, `data-tone`, y `data-active` de aria en el ítem activo. **Teclado (patrón de menú de APG):** en el trigger, Enter, Espacio o ↓ abren en el primer ítem y ↑ en el último; en el menú, flechas (con vuelta), Inicio/Fin, typeahead, Enter/Espacio; → y ← abren y cierran submenús; Escape cierra el submenú (el foco vuelve a su ítem) o el menú (vuelve al trigger); Tab y clic fuera cierran sin mover el foco. **Elegir cualquier ítem (también checkbox o radio, en cualquier nivel) cierra todo el menú** y devuelve el foco al trigger (como Radix por defecto). Los ítems deshabilitados reciben el foco pero no se eligen. Submenú posicionado con CSS dentro del panel (a 10px del ítem, top −5px, 200px), con volteo a la izquierda si no cabe y desplazamiento hacia arriba si sale por abajo. Por dentro, `@angular/aria/menu` (`ngMenu`, `ngMenuItem`) y `CdkConnectedOverlay` (popover `'inline'`); trigger, cierre y foco inicial son de Mimi (rodeos en la sección 4, «Rodeos de aria»). Desde la G1.4, los ítems y el panel (`MimiMenuPanel`, interno) viven en `components/menu` (ítem `menu` de la CLI), compartidos con Context Menu. Nada de aria ni del CDK en la API. Exporta `MimiDropdownMenuImports`; su índice reexporta los ítems y `MimiMenuItemTone`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Context Menu  | `mimi-context-menu`, `[mimiContextMenuTrigger]` (con `[mimiContextMenuTriggerData]`), `ng-template[mimiContextMenuContent]`; los mismos ítems `mimi-menu-*`                                                                                                                                                               | `open = model(false)` (abierto desde el código, junto al primer trigger); `aria-label` (va al panel; aviso en desarrollo si falta, porque no hay botón que lo nombre); `disabled` (no toca el clic derecho: aparece el menú del navegador; si estaba abierto, se cierra); `class` va al panel. **Triggers:** uno o varios (cada fila de una tabla) con un dato que el contenido recibe como `let-x` (sin tipo); el activo lleva `data-state="open"`; sin ARIA en la zona (no es un botón). **Apertura:** solo por el evento `contextmenu` (clic derecho, Shift+F10, la tecla de menú, la pulsación larga de Android); se cancela el menú del navegador. Con el puntero, en el punto del clic (origen `{x, y}` del CDK, esquina superior izquierda en el punto, volteo a la izquierda o arriba con `MIMI_VIEWPORT_MARGIN`); con el teclado, junto al elemento enfocado (abajo-inicio, 8px). Teclado = `button === -1` (así lo marca Chrome) o Shift+F10/tecla de menú hace menos de 1 s (en Chrome, Shift+F10 dispara `contextmenu` antes del keyup y la tecla de menú después). Otro clic derecho con el menú abierto lo recrea en el nuevo punto (ítem activo y submenús desde cero, dato nuevo). El panel va dentro de `mimi-context-menu` (ubicación `{type: 'parent'}`), después de los triggers: nada dentro de un `tbody` y Tab sigue desde ahí. **Cierre y foco:** como el Dropdown; elegir o Escape devuelven el foco al elemento que lo tenía antes de abrir (con el ratón suele ser la página o un contenedor enfocable) o al trigger si es enfocable. **Scroll:** abierto con el puntero se cierra (estrategia de cierre del CDK); con el teclado, se reposiciona. **Táctil:** sin pulsación larga propia; Android dispara `contextmenu` y abre el menú; iOS no, y conserva la selección de texto. Por dentro, `MimiMenuPanel` (aria) y `CdkConnectedOverlay`. Exporta `MimiContextMenuImports`; su índice reexporta los ítems y `MimiMenuItemTone`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Select        | `mimi-select`; opcionales `ng-template[mimiSelectOption]` y `mimi-select-highlight`                                                                                                                                                                                                                                       | Selección simple (el diseño no trae múltiple ni chips). **Datos:** `options` (`MimiOption` y `MimiOptionGroup`, mezclables) y `value = model<T \| null>(null)`; `compareWith` para objetos (por defecto `Object.is`). **Entradas:** `placeholder`, `search` (buscador dentro del panel: filtra por `label` sin tildes ni mayúsculas, cuenta y resalta), `searchPlaceholder`, `filterWith`, `clearable`, `loading`, `disabled`, `id`, `aria-label`, `aria-labelledby`, `class` (disparador) y `panelClass` (panel); `side` (`top`, `right`, `bottom` por defecto o `left`), `align` (`start` por defecto, `center` o `end`) y `matchWidth` (`true`: el panel mide lo que el disparador), con los nombres de Popover (G1.11); `invalid`, `touched`, `dirty` y `required` los pasa el formulario. **Salidas:** `searchChange` (búsqueda en el servidor; al cerrar se emite vacío) y `touch`. **Plantilla** `mimiSelectOption` (`let-option let-query="query" let-trigger="trigger"`) para el contenido de cada opción, en la lista y en el disparador; `mimi-select-highlight` resalta la coincidencia. Si la opción elegida ya no está en `options`, el disparador conserva su texto. **Estructura:** una caja con el alto de Input (`--mimi-select-height` → `--mimi-control-height`) que contiene un `<button type="button" role="combobox">` (un `<label for>` lo nombra y lo abre), el botón de limpiar, el spinner y el chevron; el host es `display: contents`. Panel a 8px, con el ancho del disparador, debajo o encima; lista de 280px de alto máximo. Estado: `data-state`, `data-invalid`, `data-disabled`, `data-placeholder` en la caja, y `data-active` de aria en la opción activa. **Teclado (combobox de APG):** Enter, Espacio, ↓, ↑ o Alt+↓ abren en la opción elegida; flechas (con vuelta, saltando las deshabilitadas), Inicio/Fin y letra; Enter, Espacio o Alt+↑ eligen; Escape cierra; el foco vuelve al disparador; Tab cierra sin elegir. Con buscador el foco va al input (`role="combobox"` con `aria-activedescendant`) dentro de un panel `role="dialog"`. **Pendiente:** saltar a una opción con una letra estando cerrado (aria no lo ofrece; sección 4, «Rodeos de aria», y plan, M.6). **Formularios:** `FormValueControl` y `MIMI_FIELD_CONTROL` (sección 8); `touch` se emite cuando el foco sale del disparador y del panel. **Textos:** `MIMI_SELECT_TEXT` (sección 8). Por dentro, `@angular/aria` (Combobox + Listbox) y `CdkConnectedOverlay` (popover `'inline'`); rodeos en la sección 4, «Rodeos de aria». Nada de aria ni del CDK en la API. Exporta `MimiSelectImports`                                                                                                                                                                                                                                                                        |
| Dialog        | Servicio `MimiDialogService`; `mimi-dialog`, `[mimiDialogTrigger]`, `ng-template[mimiDialogContent]`; piezas `mimi-dialog-header`, `[mimiDialogTitle]`, `[mimiDialogDescription]`, `mimi-dialog-body`, `mimi-dialog-footer`, `[mimiDialogClose]`                                                                          | **Dos formas de uso sobre el mismo servicio.** Servicio: `open(componente \| TemplateRef, config)` devuelve un `MimiDialogRef` con `close(resultado?)` y `afterClosed()` (Observable que emite una vez, al terminar la animación de salida o enseguida si lo cerró una navegación); `closeAll()`; dentro del contenido, `inject(MIMI_DIALOG_DATA)` e `inject(MimiDialogRef)`. Declarativa: `<mimi-dialog [(open)]>` con un trigger opcional y el contenido en un `ng-template`, para usar los signals y formularios del componente que lo declara; salida `(closed)` con el resultado; las opciones se leen al abrir. **Opciones** (`MimiDialogConfig`, y entradas de `<mimi-dialog>`): `data`, `width`, `maxWidth` (valores CSS, van al panel; el máximo nunca supera `100vw − 32px`), `class` (panel), `closeOnEscape` y `closeOnBackdropClick` (true), `disableClose` (atajo que apaga los dos; la X funciona siempre), `closeButton` (true; ver la excepción abajo), `ariaLabel` (`aria-label` en la plantilla), `autoFocus` (`'first'`, `'dialog'` o un selector CSS), `role` (`dialog` o `alertdialog`) e `injector` (los dos últimos, solo con el servicio). Sin tamaños sm/md/lg: el diseño trae uno. **Piezas** opcionales, todas con `class`: el título va en un `<h2>` y nombra el diálogo; `[mimiDialogClose]="valor"` cierra con ese resultado. **Accesibilidad:** `role`, `aria-modal`, `aria-labelledby` y `aria-describedby` (los ids los registran el título y la descripción; sin título ni `ariaLabel`, aviso en modo desarrollo); el foco va al primer elemento enfocable del contenido (la X va después en el DOM), Tab queda encerrado y al cerrar el foco vuelve al que abrió; el resto de la página queda con `aria-hidden`; el scroll de la página se bloquea sin salto (se conserva la barra). Si `autoFocus` no encuentra nada, el foco va al panel. **Estructura:** Mimi le abre al `Dialog` del CDK un componente interno (`MimiDialogShell`) que es el panel: pinta la X y crea dentro el contenido (un componente queda con `display: contents`, para que encabezado, cuerpo y pie sean hijos del panel). Al CDK se le pasa `disableClose`: Escape y el clic en el fondo los atiende Mimi, para animar la salida antes de cerrar. Animación de `utils/overlay` (0,15 s; sin animación con movimiento reducido); el fondo usa `--mimi-overlay` y `--mimi-overlay-blur` y se desvanece junto con el panel. **Tamaño:** 420px, alto máximo `100dvh − 32px`; el scroll queda en `mimi-dialog-body` (o en el panel, si no se usa). Los popovers de Select y de los menús se abren encima y Escape los cierra primero. **Textos:** `MIMI_DIALOG_TEXT` (la X; inglés por defecto y `MIMI_DIALOG_TEXT_ES`). Un diálogo abierto con el servicio usa los providers de la aplicación, salvo que se pase `injector`. Nada del CDK en la API. Exporta `MimiDialogImports` |

### Grupo 2 (0.3.0)

| Componente   | Selector                                                                                                                                                                                                  | Notas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toggle Group | `mimi-toggle-group`; ítems `button[mimiToggleGroupItem]` (G2.1)                                                                                                                                           | Control segmentado. `<mimi-toggle-group aria-label [(value)] [multiple] [variant] [disabled] class>`: un solo `value` (spec 8), `T \| null` en simple y `T[]` con `multiple`; un valor sin botón se conserva. **Simple:** patrón «Radio Group» de la APG (`radiogroup` y `radio` con `aria-checked`, una sola parada de Tab en el elegido o el primero; →/↓ y ←/↑ mueven el foco y eligen, con vuelta; en RTL ← avanza); volver a pulsar el elegido no lo quita (como una radio, decidido por defecto en la G2.1); indicador que se desliza (columnas iguales, `--mimi-toggle-group-spring`, 0,45 s; sin animación con movimiento reducido). **Múltiple:** `group` con botones `aria-pressed`, cada uno con su parada de Tab, cada elegido con su fondo. `variant="solid"`: el elegido en `primary`. `disabled` deshabilita el grupo entero (botones nativos `disabled`). Formularios: `FormValueControl` (`[formField]`, `formControlName` y `[(ngModel)]`), `touch` cuando el foco sale del grupo, error con `data-invalid` (borde `destructive` de 1px, sin diseño). Foco itinerante con el `FocusKeyManager` del CDK (aria no tiene grupo de radio; excepción como la de mimi-toolbar). Los botones son del usuario: contenido y `aria-label`. Avisos en desarrollo: sin nombre, botón sin nombre, valores repetidos, `value` que no coincide con el modo. Exporta `MimiToggleGroupImports`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Slider       | `mimi-slider` (G2.7)                                                                                                                                                                                      | Un valor o un rango. `<mimi-slider [(value)] [range] [min] [max] [step] [marks] [format] [showValue] [disabled] aria-label aria-labelledby class>`; `value`: `number` o, con `range`, `[desde, hasta]` (un solo `value`, spec 8). **Pulgares propios** con `role="slider"` (patrones «Slider» y «Slider (Multi-Thumb)» de la APG; decidido por defecto en la G2.7: opción (c), como el diseño, porque el spike de los inputs nativos invisibles necesitaba Firefox y Safari). Teclado: flechas un paso (en RTL, ← sube), Re Pág/Av Pág diez, Inicio/Fin los límites. Puntero: el pulgar más cercano va al punto, recibe el foco y se arrastra (`setPointerCapture`, `touch-action: none`). El rango no se cruza (cada pulgar tiene como límite el otro, también en `aria-valuemin`/`-max`); sus nombres, «{etiqueta}, Minimum/Maximum» (`MIMI_SLIDER_TEXT`, `_ES`: Mínimo/Máximo). `format` da `aria-valuetext` y la burbuja (propia, con los tokens de Tooltip, `aria-hidden`; `showValue`: `auto` al arrastrar y con el foco, `always`, `never`). `marks`: números o `{ value, label }`. Un valor fuera de rango se pinta acotado. Formularios: `FormValueControl` (`min`/`max` tienen el tipo del valor, lo exige la interfaz), `MIMI_FIELD_CONTROL` (el primer pulgar), `touch` al soltar o al salir del pulgar; con `[formField]`, los límites salen del esquema (`min()`/`max()`): Signal Forms no deja enlazar `[min]`/`[max]` junto con `[formField]` (NG8022). La distancia mínima entre pulgares es un validador del formulario. Sin vertical en esta versión                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Combobox     | `mimi-combobox` (G2.8a y G2.8b); el chip `mimi-chip` (ítem `chip`) en el múltiple; opcionales `[mimiComboboxStart]` y `ng-template[mimiComboboxOption]`; `mimi-highlight` (ítem compartido `option-list`) | Campo donde se escribe para filtrar y elegir (patrón «Combobox» con lista de la APG, `aria-autocomplete="list"`). `<mimi-combobox [(value)] [options] [creatable] [loading] [filterWith] [compareWith] [placeholder] [disabled] [side] [align] [multiple] [hint] aria-label aria-labelledby id class panelClass (searchChange) (create)>`; `value`: `T \| null` en simple (G2.8a) y `T[]` con `multiple` (G2.8b; un solo `value`, spec 8; en desarrollo avisa si no tiene la forma del modo). **Múltiple** (G2.8b): las elegidas son chips (`mimi-chip` del ítem `chip`) dentro de la caja, que crece como la de Tags Input; la lista es `aria-multiselectable` con una casilla por opción; elegir (Enter o clic) agrega o quita sin cerrar y vacía lo escrito; Backspace con el campo vacío quita el último chip; el botón de cada chip quita y lleva el foco al campo; Escape cerrado solo vacía lo escrito (los chips se quitan uno a uno); al salir, lo escrito se descarta. Cerrado y sin foco, con más de un chip, se ve el primero y «+N» (diseño); con el foco, todos. Ayuda debajo («Enter agrega · Backspace quita el último chip», `hint` la cambia y vacía la quita), en el `aria-describedby` del campo. Anuncios al agregar y quitar con `injectMimiChipAnnouncer` (`MIMI_CHIP_TEXT`). Crear agrega la opción nueva al arreglo. `options` con la forma de las de Select (`MimiListOption`, `MimiListOptionGroup`; mismas propiedades que `MimiOption`). **Lo escrito no es el valor:** filtra (sin tildes ni mayúsculas, con la coincidencia resaltada) y, al salir sin elegir, el campo vuelve al texto de la opción elegida; con el campo vacío al salir, se quita el valor. **Crear** (`creatable`, decidido por defecto en la G2.8): fila «Crear «texto»» al final de la lista cuando lo escrito no coincide con ninguna opción; emite `(create)` con el texto, la app agrega la opción a `options` y el Combobox la elige en cuanto aparece. **Servidor:** `(searchChange)` con lo escrito, `loading` (spinner en el campo; en el panel, «Buscando…» y dos renglones de carga, `aria-busy`) y `filterWith` (con `() => true`, el filtro es del servidor); la opción elegida conserva su texto aunque salga de `options`. **Sin resultados:** región `role="status"` con ícono, «Sin resultados para «texto»» y un detalle; con resultados, la misma región anuncia la cantidad. **Teclado:** escribir abre y activa la primera coincidencia; ↓ abre (aria), ↑ y Alt+↓ abren, Alt+↑ cierra; flechas con vuelta saltando las deshabilitadas; Enter elige (no envía el formulario con el panel abierto); Escape cierra y, cerrado, vacía el campo y quita el valor (APG; decidido por defecto en la G2.8). El foco se queda en el `<input>` (`aria-activedescendant`); un clic en la caja enfoca el campo y abre o cierra. **Estructura:** caja con los estados de Input (`focus-within`), el `<input>` con `role="combobox"`, el spinner y el chevron; panel a 2px con el ancho del campo, lista de 228px de alto máximo. Formularios: `FormValueControl`, `MIMI_FIELD_CONTROL` (el `<input>`), `touch` al salir del campo y del panel. Textos: `MIMI_COMBOBOX_TEXT` (`_ES`). Por dentro, `@angular/aria` (Combobox sobre el `<input>` y el Listbox de `option-list`) y `CdkConnectedOverlay`; los rodeos del Select (sección 4, «Rodeos de aria»). Exporta `MimiComboboxImports`. **`option-list`** (`components/option-list/`, ítem `util` como `menu`): el filtro (`mimiNormalizeText`, `mimiDefaultListFilter`), `mimi-highlight`, los tipos de opción y la lista interna (`MimiOptionList`, con «cargando», «sin resultados» y la fila «Crear»); Select no la usa hasta la M.9                                                                                                                                   |
| Date Picker  | `mimi-date-picker` (G2.9a); el calendario `mimi-calendar` (ítem `calendar`, también suelto)                                                                                                               | Elegir una fecha. `<mimi-date-picker [(value)] [min] [max] [isDateDisabled] [locale] [weekStart] [format] [placeholder] [disabled] aria-label aria-labelledby id class panelClass>`. **La fecha es una cadena ISO** sin hora (`MimiDate`, `'2026-09-30'`; decidido por defecto en la G2.9, opción (b)): por dentro se calcula en UTC, así que ninguna zona horaria corre un día; `toMimiDate(date, timeZone?)` y `fromMimiDate(iso)` convierten de y a `Date`; `MIMI_TODAY` da «hoy» (reemplazable). **Idioma** con `Intl.DateTimeFormat` (`LOCALE_ID` o `locale`, sin datos registrados): nombres de meses y días, formato del botón (`format`, por defecto «30 sept 2026») y primer día de la semana (`Intl.Locale#getWeekInfo` donde existe; si no, por la región; `weekStart` lo fija). **Disparador:** un `<button>` con la caja de Input, ícono `calendar` y la fecha (no se escribe a mano en la 0.3.0); el valor va en su `aria-describedby`. **Panel:** el Popover (`role="dialog"`, «Elegir fecha», sin flecha); al abrir, el foco va al día elegido o a hoy (el Popover enfoca el elemento con `autofocus` del panel, G2.9a); elegir cierra y devuelve el foco. **Calendario:** cuadrícula propia (`role="grid"`, filas, `columnheader` con el nombre largo, `gridcell` con el nombre completo del día; decidido por defecto en la G2.9: la `ngGrid` de aria no da Re Pág/Av Pág ni el paso de mes); una sola parada de Tab; teclado de la APG («Date Picker Dialog»): ← → un día (invertidas en RTL), ↑ ↓ una semana, Inicio/Fin la semana, Re Pág/Av Pág un mes, con Mayús un año, Enter/Espacio eligen; hoy con `aria-current="date"`, punto y borde; los no disponibles con `aria-disabled` (reciben el foco, no se eligen, se anuncian «no disponible», tachados); los de otro mes atenuados; el título (botón) cambia la vista días → meses → años (`aria-pressed`); el cambio se anuncia (`aria-live`); pie con la leyenda «Hoy» e «Ir a hoy». `mode="range"` con `rangeStart`/`rangeEnd` pinta la banda y solo emite `(datePick)` (lo usa el Date Range). **El valor vive en Mimi:** una fecha fuera de `min`/`max` o no disponible que llega del formulario se muestra sin reescribir el modelo. Formularios: `FormValueControl<MimiDate \| null>` (`min`/`max` con el tipo del valor; con `[formField]` no se pueden enlazar, NG8022: los límites van en `isDateDisabled`), `MIMI_FIELD_CONTROL` (el botón), `touch` al cerrar el panel. Textos: `MIMI_DATE_PICKER_TEXT` (`_ES`), compartidos con el calendario y el Date Range. **Date Range** (`mimi-date-range`, clase `MimiDateRangePicker`, G2.9b; ítem `date-range`): `<mimi-date-range [(value)] [minDate] [maxDate] [isDateDisabled] [presets] [locale] [weekStart] [format] [placeholder] [disabled] aria-label id class panelClass>`; `value`: `MimiDateRange` (`{ start, end }`, extremos incluidos) o `null`. Los límites se llaman `minDate`/`maxDate`: `FormValueControl` daría a `min`/`max` el tipo del valor (un periodo). Botón con ícono `calendar-range`, «24 sept 2026 – 30 sept 2026» y la cuenta de días («7 días»; en el `aria-describedby`, separados por una coma). Panel: atajos opcionales (`presets`: `{ label, range }`, solo los del usuario; `aria-pressed` en el que coincide con el valor) y el calendario en modo rango (banda con `--mimi-range` y extremos en `primary`), con la ayuda «Elige el día final.» / «Haz clic en un día para empezar un periodo nuevo.» (`aria-live`). Elección: primer clic el inicio, segundo el fin (intercambiados si es anterior), el siguiente empieza otro; **el modelo cambia solo con los dos extremos** (decidido por defecto en la G2.9); el panel sigue abierto; al cerrar con solo el inicio, se descarta. Formularios: `FormValueControl<MimiDateRange \| null>`, `touch` al cerrar |
| File Upload  | `mimi-file-upload` (G2.11); `mimi-file-list`, `mimi-file-item`, `[mimiFileIcon]`                                                                                                                          | **Dos piezas** (decidido por defecto en la G2.11, opción (b)); Mimi no sube nada. **Zona** `<mimi-file-upload [(value)] [accept] [multiple] [maxSize] [maxFiles] [heading] [hint] [disabled] aria-label aria-labelledby id class (rejected)>`: un `<button>` nativo (decidido por defecto) con ícono `cloud-upload`, título y `hint` (en su `aria-describedby`); **nombre accesible** con `aria-labelledby` hacia el título visible (WCAG 2.5.3; `aria-label` y `aria-labelledby` del usuario van delante, sin reemplazarlo; arreglo del 05/11/2026: la entrada del título se llama `heading` para no tapar el atributo nativo `title`); abre el `<input type="file" hidden>` con clic, Enter o Espacio; arrastrar con `dragenter`/`dragover`/`dragleave`/`drop` (profundidad contada: sin parpadeo con los hijos), «Suelta para subir N archivos» (los nombres no se conocen hasta soltar), escala 1,01, `--mimi-glow-info` y `mimi-bob` (sin escala ni animación con movimiento reducido). Valida `accept` (también lo soltado, por tipo o extensión), `maxSize` y `maxFiles` (contando los que ya están); sin `multiple`, uno nuevo reemplaza. **Los rechazados no entran en el valor** (decidido por defecto): salen por `(rejected)` (`MimiFileRejection`: `file`, `reason` `type`/`size`/`count`, `message`) y se anuncian. El input se vacía después de cada elección. `FormValueControl<File[]>`, `MIMI_FIELD_CONTROL` (el botón), `touch` al elegir o soltar; con error, borde `destructive`. **Lista** `mimi-file-list` (`role="list"`, «Archivos», `[emptyFocus]`) y **fila** `mimi-file-item [file] \| [name] [size] [type] [thumbnailUrl] [status] [progress] [error] [retryable] (remove) (retry)` (`role="listitem"`): miniatura de las imágenes (`URL.createObjectURL`, liberada al cambiar y al destruir) o el ícono de su tipo (imagen `info`, PDF `destructive`, video `warning`, otro `muted`; decidido por defecto: del componente, con `[mimiFileIcon]` para uno propio), nombre, tamaño (`Intl.NumberFormat` con `LOCALE_ID`), y el estado que da la app: `uploading` (Progress de 5px, «Subiendo nombre», porcentaje), `done` («Subido»), `error` (mensaje y «Reintentar» con Button). Quitar (Button `ghost`, «Quitar nombre») deja el foco en el siguiente, el anterior o `emptyFocus`. Anuncia «subido» y «con error» al cambiar el estado. Textos: `MIMI_FILE_UPLOAD_TEXT` (`_ES`). Exporta `MimiFileUploadImports`, `mimiFileMatchesAccept` y `mimiFormatFileSize`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Color Picker | `mimi-color-picker` (el panel) y `mimi-color-input` (el disparador con Popover) (G2.12)                                                                                                                   | **Dos piezas** (decidido por defecto, opción (a)). `<mimi-color-picker [(value)] [swatches] [(recent)] [showRecent] [format] [disabled] class>` y `<mimi-color-input [(value)] [swatches] [(recent)] [showRecent] [format] [placeholder] [disabled] aria-label id class panelClass>`. **El valor es siempre hex** de 6 dígitos en minúsculas (decidido por defecto); se elige en HSV (como el diseño) y se ve y escribe en HEX u OKLCH (`format` es solo el del campo al empezar). **Área** de saturación y brillo: un `role="slider"` (decidido por defecto) con `aria-valuenow` (la saturación) y `aria-valuetext` («Saturación 80%, brillo 90%»); ← → saturación y ↑ ↓ brillo de a 2 %, Inicio/Fin. **Tono:** control propio con `role="slider"` (0–360, flechas de a 3°, Re Pág/Av Pág de a 30°, Inicio/Fin): el Slider de Mimi pinta su pista con un color y no admite el degradado del espectro (decidido por defecto; la spec 4, «Hoja de ruta», ya no dice que dependa del Slider). Arrastre con `setPointerCapture`, `touch-action: none` y el foco al control; al soltar o salir, el color va a los recientes. Volver a escribir el mismo valor no mueve los pulgares, y un gris o un negro conservan el tono. **Formato:** `radiogroup` con flechas. **Campo** (`input[mimiInput]`): hex (`#fff`, `#4f46e5`) u `oklch(L C H)` (L en 0–1 o %); se confirma con Enter o al salir; si no se entiende, `aria-invalid` y el valor no cambia; un OKLCH fuera de sRGB se recorta y se avisa. **Paleta** (`swatches`, solo la del usuario: decidido por defecto) y **recientes** (hasta 8, `[(recent)]`): `aria-pressed`, una parada de Tab por grupo y flechas (decidido por defecto). Los degradados del área y del tono son el espacio de color (en `style`, no del tema); el borde y la sombra de los pulgares y el borde de las muestras son tokens del componente con el valor del diseño (decidido por defecto). El valor vive en Mimi: uno inválido que llega del formulario se muestra en el campo sin reescribirlo. Formularios: `FormValueControl<string>` en las dos piezas, `MIMI_FIELD_CONTROL` (el área o el botón). Textos: `MIMI_COLOR_PICKER_TEXT` (`_ES`). Exporta `MimiColorPickerImports` y las conversiones (`mimiParseColor`, `mimiFormatOklch`, `mimiHexToRgb`…)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Tags Input   | `mimi-tags-input` (G2.6); el chip `mimi-chip` (ítem compartido `chip`)                                                                                                                                    | Etiquetas como chips. `<mimi-tags-input [(value)] [limit] [separators] [allowDuplicates] [normalize] [validate] [hint] [placeholder] [disabled] [readonly] aria-label id class>`; `value`: `string[]`. Agregar: Enter o un separador (`[',']`); al pegar, se separan y se agregan todas (respetando duplicados y límite). Quitar: el botón de cada chip («Remove angular»; el foco vuelve al campo) o Backspace con el campo vacío. Sin flechas entre etiquetas (decidido por defecto en la G2.6, como el diseño). `normalize` por defecto solo quita los espacios de los lados (las minúsculas y el `#` del diseño son del ejemplo). Duplicado: no se agrega, mensaje y chip en rojo; `validate(tag)` devuelve un mensaje. `limit` (no `max`: ese nombre lo escribe Signal Forms): contador «n/limit» y, al llegar, el campo en solo lectura (no `disabled`: no pierde el foco) con borde de aviso. Mensaje debajo (`role="status"`): ayuda, error o límite; describe al campo junto con el contador. Anuncios al agregar y quitar con el `LiveAnnouncer` (`injectMimiChipAnnouncer`). Formularios: `FormValueControl<string[]>`, `MIMI_FIELD_CONTROL`, `touch` al salir de la caja. `class` va a la caja. Textos: `MIMI_TAGS_INPUT_TEXT` (ayuda, duplicado, límite) y `MIMI_CHIP_TEXT` (quitar y anuncios), con `_ES`. **`mimi-chip`** (`components/chip/`, ítem `util` como `menu`): `[removable] [label] [invalid] (remove) class`; lo usa también el Combobox múltiple (G2.8)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Input OTP    | `mimi-input-otp` (G2.5)                                                                                                                                                                                   | Código de un solo uso en casillas. `<mimi-input-otp [(value)] [length] [separatorAfter] [alphanumeric] [success] [autocomplete] [disabled] [readonly] aria-label aria-labelledby aria-describedby id class>`. **Un solo `<input>` real** (decidido por defecto en la G2.5, como el diseño), transparente y encima de las casillas `aria-hidden`: una parada de Tab; escribir, borrar, pegar y el autocompletado del SMS (`autocomplete="one-time-code"`) son nativos. `value`: `string` sin espacios ni guiones (se quitan al pegar), como máximo `length` (6); solo dígitos (`inputmode="numeric"`) o, con `alphanumeric`, letras y dígitos (`inputmode="text"`). `separatorAfter`: el guion después de esa casilla (3 en el diseño; sin él, no hay). La casilla activa (la siguiente a llenar, con el foco) lleva el anillo `ring` y un cursor que parpadea (`mimi-caret`). `success` (el código se verificó, lo decide la app): borde y anillo `success`; el error viene del formulario: borde y anillo `destructive` y la fila se sacude una vez (`mimi-shake`). Con movimiento reducido, sin parpadeo ni sacudida. Formularios: `FormValueControl<string>` y `MIMI_FIELD_CONTROL` (input real); `touch` en el `blur`. `class` va a la fila. El mensaje («Código verificado.») y el temporizador son del usuario                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Input Mask   | `mimi-input-mask` (G2.4a)                                                                                                                                                                                 | Campo que da formato mientras se escribe. **Control propio** (no una directiva sobre el input del usuario; decidido por defecto en la G2.4, opción (b)): `<mimi-input-mask mask [(value)] [inputmode] [autocomplete] [placeholder] [disabled] [readonly] aria-label aria-labelledby aria-describedby id class>`. `mask`: `0` es un dígito, lo demás literales (solo `0` en esta versión). `value` guarda **solo los dígitos** («5512345678»), como el diseño; un valor con o sin literales se pinta con la máscara. Usa `transformedValue()` de Signal Forms: con `[formField]`, una máscara incompleta es un error `mask` del campo; con Reactive Forms y `ngModel` no hay error automático (lo dice la guía: sin contexto de campo no se reportan) y se usa un validador del usuario (`Validators.minLength`). Un literal se escribe solo si le sigue un dígito («(5»). Cursor: después del mismo dígito al escribir o borrar en medio; borrar sobre un literal borra el dígito vecino; pegar con o sin literales; sin reformatear durante la composición (IME). Ctrl+Z, el del navegador. `inputmode` `numeric` por defecto; `maxlength` = largo de la máscara. Formularios: `FormValueControl<string>` y `MIMI_FIELD_CONTROL` (input de dentro); `touch` en el `blur`. **G2.4b:** `ghost` (marcador de lo que falta, `aria-hidden`, con lo escrito transparente y el resto en `--mimi-mask-placeholder`, mismas cifras tabulares), `span[mimiMaskPrefix]` (prefijo fijo, chip `muted`), `[mimiMaskStart]` (ícono al principio) y `[mimiMaskEnd]` (al final: la marca de la tarjeta o un ícono de válido del ejemplo); `MimiInputMaskImports`. El anfitrión es la caja (alto, radio, borde, hover, `focus-within`, error y deshabilitado de Input) con el input sin borde dentro; `class` va a la caja; un clic en la caja enfoca el campo. Exporta `mimiApplyMask`, `mimiUnmask` y `mimiMaskLength`. La marca de tarjeta, Luhn y la validación de fechas son de los ejemplos, no de Mimi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Number Input | `mimi-number-input` (G2.2)                                                                                                                                                                                | Campo numérico con − y +. `<mimi-number-input aria-label [(value)] [min] [max] [step] [format] [locale] [placeholder] [disabled] [readonly] [id] class>`: `value` `number \| null` (vacío es `null`, decidido por defecto en la G2.2); `format` son las opciones de `Intl.NumberFormat` (moneda, decimales, unidad, porcentaje); `locale`, por defecto el `LOCALE_ID` de Angular. Patrón «Spinbutton» de la APG con un `<input type="text">` (`role="spinbutton"`, `inputmode="decimal"`, `aria-valuenow`, `-min`, `-max` y `aria-valuetext` con el número formateado). Con el foco muestra el número sin formato y no se reformatea mientras se escribe; al salir (o con Enter, sin salir) lee el texto con los separadores del idioma (`formatToParts`: «1.250,5» en `es-ES`), redondea al paso desde `min`, acota y formatea; un texto sin cifras se descarta. Teclado: ↑/↓ un paso, Re Pág/Av Pág diez, Inicio/Fin los límites. − y + son para el puntero (`tabindex="-1"`): mantenerlos pulsados repite (400 ms y después cada 80 ms); el clic sin `pointerdown` (un lector) suma uno; en los límites llevan `aria-disabled` (el foco nunca cae a `body`); el puntero no mueve el foco. Sin rueda del mouse. Un valor de fuera de rango se pinta acotado sin cambiar el modelo. Formularios: `FormValueControl<number \| null>` y `MIMI_FIELD_CONTROL` (`mimi-form-field` lo nombra y le pone el error), `touch` al salir de la caja, `min`/`max` del esquema de Signal Forms. Anillo de foco en la caja (`focus-within`), como Select. Textos: `MIMI_NUMBER_INPUT_TEXT` («Decrease/Increase {etiqueta}»; `_ES`: «Disminuir/Aumentar {etiqueta}»), `provideMimiNumberInputText`, en `number-input-texts.ts`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Password     | `mimi-password` (G2.3)                                                                                                                                                                                    | Contenedor que proyecta el `<input mimiInput type="password">` del usuario (el valor, el `autocomplete` y el formulario son del input: regla 6) y le agrega el botón de mostrar u ocultar y, con `meter`, el medidor. `<mimi-password [meter] [rules] [strength] class>`. El botón cambia el `type` del mismo input (no lo reemplaza), con `aria-pressed` y nombre fijo «Show password» (`_ES`: «Mostrar contraseña»; guía APG: un botón de alternar no cambia de nombre; arreglo del 05/11/2026); es una parada de Tab y el foco se queda en él; deshabilitado si el input lo está. Medidor (orientativo, no una medida de seguridad): cuatro barras (`aria-hidden`), el nivel en texto (Débil, Media, Fuerte) y las reglas con ícono; describe al input con `aria-describedby` (sin borrar el del usuario ni el de `mimi-form-field`); el nivel se anuncia solo cuando cambia, con el `LiveAnnouncer` en `polite`. Nivel: la heurística del diseño generalizada (`mimiPasswordLevel`: todas las reglas, fuerte; al menos la mitad, media; menos, débil) o `strength(value)` del usuario; `rules`: por defecto, 8 caracteres, una mayúscula, un número y un símbolo (con los textos del idioma). La caja tiene el anillo de foco (`focus-within`), el error y el deshabilitado del `MimiInput` de dentro; el input va sin su propia caja y sin el ojo de Edge (`::-ms-reveal`). Textos: `MIMI_PASSWORD_TEXT` y `_ES`, `provideMimiPasswordText`, en `password-texts.ts`. Decidido por defecto en la G2.3: contenedor, heurística más función y reglas configurables                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Progress     | `mimi-progress` (G2.10)                                                                                                                                                                                   | Barra o círculo. `<mimi-progress aria-label [value] [max] [tone] [shape] [size] class>`: `value` sin definir o `null` es indeterminado; se acota entre 0 y `max` (100; un `max` no válido cuenta como 100). `tone`: `primary`, `success`, `warning`, `info` o `danger`. `shape`: `bar` (por defecto) o `circle`; `size` (solo el círculo): `default` 76px o `sm` 44px. El círculo muestra el valor dentro («64%»; en `sm`, «64»); el texto de arriba de la barra lo pone el usuario (decidido por defecto en la G2.10). Rol `progressbar` en el propio elemento, con `aria-valuemin`, `aria-valuemax` y, si es determinado, `aria-valuenow`; indeterminado con `aria-busy="true"`. No recibe el foco y **no anuncia** (sin `aria-live` ni `LiveAnnouncer`: el final lo avisa la app). Indeterminado: barra con `mimi-indet` y círculo con `mimi-spin`; con movimiento reducido, los dos laten (`animate-mimi-pulse`). `class` va al elemento con el rol. Aviso en desarrollo sin nombre. Sin dependencias de npm propias                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

**Nombre accesible (0.2.0):** los componentes que necesitan un nombre lo reciben siempre como `aria-label` (Popover, Dropdown Menu, Context Menu, el grupo radio, Dialog, Select, Tabs, Toolbar y Pagination), nunca como `label`; si dibujan un panel, va al panel y no queda en el host. `label` queda para texto visible (FormField, `mimiTab`) o para el nombre de una pieza sin texto (Avatar).

**Regla de `class` (G1.5):** `class` va al elemento visible principal del componente; si además hay un panel aparte, se usa `panelClass`. En las directivas sobre un elemento del usuario, el panel recibe `<nombre>Class`. Así: en Select, `class` va al disparador y `panelClass` al panel; en Popover, Dropdown Menu, Context Menu y Dialog, `class` va al panel, porque es lo único que dibujan (su host no se ve y el disparador es del usuario); el submenú tiene `class` para su panel y otro en su disparador; Tooltip es una directiva y usa `mimiTooltipClass`.

**Nombres y archivos.** Sin sufijo en todos los componentes: la clase es `Mimi<Nombre>` (`MimiButton`, `MimiInput`, `MimiTextarea`, `MimiBadge`, `MimiCard`, `MimiFormField`, `MimiFormError`…) y el archivo `<nombre>.ts` (`button.ts`, `form-field.ts`), sin `.component` ni `.directive`. Las variantes de `cva` van en `<nombre>.variants.ts`. Los servicios conservan su sufijo (`MimiDialogService`).

**Piezas internas fuera del índice (0.2.0):** lo que un componente necesita por dentro y el compilador obliga a exportar (`MimiMenuPanel`, `MimiMenuOutlet`, `MIMI_MENU_HOST`, `MIMI_MENU_PANEL_CLASSES`, `menuItemVariants`, `MimiDialogShell`, `MimiDialogOutlet`, `MimiPopoverOutlet`, `MimiSelectList`, `MimiSelectOutlet`, `MimiTabsOutlet`, `MimiTooltipPanel`) se exporta solo desde su archivo, con `@internal` en el comentario, y **no** desde el `index.ts`: así no forma parte de la API. Esos `index.ts` listan los nombres públicos uno por uno. Otro componente que necesite una pieza interna la importa desde el archivo concreto (`@/components/ui/menu/menu`, como Dropdown Menu y Context Menu con `MimiMenuPanel`). Ningún ejemplo ni página del showcase las usa.

**Avisos en modo desarrollo:** siempre «[Mimi] Componente: …» (`[Mimi] Popover:`, `[Mimi] Theme:`…). Lo comprueba `dev-warnings.spec.ts`.

### Archivos por componente (para `registry.json`, Fase 3)

Rutas relativas a `packages/ui-core/src/lib/`. En el proyecto del usuario, `components/<nombre>/` va a `src/app/components/ui/<nombre>/`, `utils/` a `src/app/components/ui/utils/` y `theme/` a `src/app/components/ui/theme/`.

**Importaciones entre archivos de ui-core:** siempre con el alias y el **archivo concreto** (`@/components/ui/utils/cn`, `@/components/ui/utils/control-styles`, `@/components/ui/utils/field-state`, `@/components/ui/theme/provider`, `@/components/ui/<otro-componente>`). Nunca con el índice de `utils` o `theme`: el de utils reexporta `field-state`, que importa `@angular/forms`, y esbuild no puede descartarlo, así que quien usara solo Button cargaría los formularios completos (unos 97 kB). Tampoco con rutas relativas que salgan de su carpeta (`../../utils/cn`), porque la CLI copia los archivos a otra estructura. Dentro de una misma carpeta sí se usan rutas relativas (`./button.variants`). `packages/ui-core/src/lib/imports.spec.ts` recorre los archivos y falla si no se cumple.

En el monorepo, `tsconfig.base.json` define `@/components/ui/utils/*` y `@/components/ui/theme/*` (y sus índices) antes del comodín `@/components/ui/*` → `components/*`; en el proyecto del usuario basta el comodín. El showcase importa los componentes igual que el usuario (`@/components/ui/button`), no desde `@mimi-ng/ui-core`, para que el monorepo se comporte igual que un proyecto real.

| Componente     | Archivos                                                                                                                                                                                                                                | Dependencias npm                                                                                                                                                            | Otros archivos de ui-core                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button         | `components/button/button.ts`, `components/button/button.variants.ts`, `components/button/index.ts`                                                                                                                                     | `class-variance-authority`, `clsx`, `tailwind-merge`                                                                                                                        | `utils/cn.ts`, `utils/control-styles.ts`; tokens de `theme/theme-base.css` (colores, sombras, `--mimi-control-height*`, `--mimi-radius`, `--mimi-press-scale`, `mimi-transition`, `@keyframes mimi-spin`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Input          | `components/input/input.ts`, `components/input/input.variants.ts`, `components/input/index.ts`                                                                                                                                          | `class-variance-authority`, `clsx`, `tailwind-merge`; peer `@angular/forms`                                                                                                 | `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts`; tokens de `theme/theme-base.css` (`input`, `input-background`, `ring`, `ring-soft`, `destructive`, `destructive-ring`, `muted-foreground`, `--mimi-input-*` (`MimiInputTokens`), `--mimi-control-height*`, `--mimi-radius`, `mimi-transition`)                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Textarea       | `components/textarea/textarea.ts`, `components/textarea/textarea.variants.ts`, `components/textarea/index.ts`                                                                                                                           | `class-variance-authority`, `clsx`, `tailwind-merge`; peer `@angular/forms`                                                                                                 | `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts`; tokens `--mimi-textarea-*` (`MimiTextareaTokens`, T.0b), que caen en los de Input                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Badge          | `components/badge/badge.ts`, `components/badge/badge.variants.ts`, `components/badge/index.ts`                                                                                                                                          | `class-variance-authority`, `clsx`, `tailwind-merge`                                                                                                                        | `utils/cn.ts`; tokens `--mimi-badge-*` (`MimiBadgeTokens`: `height`, `px`, `radius`, `font-size`, `font-weight`) y los colores de cada tono de `theme/theme-base.css` (`<tono>`, `-foreground`, `-soft`, `-soft-foreground`, `foreground`, `border`); íconos a 12px (`[&_svg]:size-3`, `shrink-0`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Card           | `components/card/card.ts`, `components/card/index.ts`                                                                                                                                                                                   | `clsx`, `tailwind-merge` (vía `cn`)                                                                                                                                         | `utils/cn.ts`; tokens `--mimi-card-*` (spec 6.3, `MimiCardTokens`), `--mimi-radius-card`, `--mimi-shadow-card`, `card`, `card-foreground`, `border`, `muted-foreground`. Los ejemplos usan Button e Input, pero Card no depende de ellos                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Separator      | `components/separator/separator.ts`, `components/separator/separator.variants.ts`, `components/separator/index.ts`                                                                                                                      | `class-variance-authority`, `clsx`, `tailwind-merge`                                                                                                                        | `utils/cn.ts`; tokens `--mimi-separator-color` (→ `border`) y `--mimi-separator-size` (`MimiSeparatorTokens`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Skeleton       | `components/skeleton/skeleton.ts`, `components/skeleton/index.ts`                                                                                                                                                                       | `clsx`, `tailwind-merge` (vía `cn`)                                                                                                                                         | `utils/cn.ts`; tokens `--mimi-skeleton-*` (`MimiSkeletonTokens`: `bg` → `muted`, `radius` → `--mimi-radius-sm`, `duration`) y el keyframe `mimi-pulse` de `theme/theme-base.css`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Avatar         | `components/avatar/avatar.ts`, `components/avatar/avatar.variants.ts`, `components/avatar/index.ts`                                                                                                                                     | `class-variance-authority`, `clsx`, `tailwind-merge`                                                                                                                        | `utils/cn.ts`; tokens `--mimi-avatar-*` (`MimiAvatarTokens`: `size`, `size-sm`, `size-lg`, `radius`, `bg`, `fg`) sobre `muted`, `secondary` y `secondary-foreground`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Switch         | `components/switch/switch.ts`, `components/switch/index.ts`                                                                                                                                                                             | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms`                                                                                                                  | `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts` (provee `MIMI_FIELD_CONTROL`); de `theme/theme-base.css`: `switch-off`, `primary`, `primary-foreground`, `background`, `--mimi-shadow-primary`, `--mimi-shadow-thumb`, `--mimi-press-scale-sm`, `--mimi-transition` (con `translate`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Checkbox       | `components/checkbox/checkbox.ts`, `components/checkbox/index.ts`                                                                                                                                                                       | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms`                                                                                                                  | `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts` (provee `MIMI_FIELD_CONTROL`); de `theme/theme-base.css`: `input`, `input-background`, `primary`, `primary-foreground`, `ring`, `destructive`, `--mimi-shadow-primary`, `--mimi-press-scale-sm`, `--radius-sm`. Íconos check y minus de Lucide en línea                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| FormField      | `components/form-field/form-field.ts`, `components/form-field/form-error.ts`, `components/form-field/error-messages.ts`, `components/form-field/index.ts`                                                                               | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms`                                                                                                                  | `utils/cn.ts`, `utils/field-state.ts` (`MIMI_FIELD_CONTROL`, `MimiFieldError`); token `destructive`. No depende de Input, Textarea, Switch ni Checkbox: los encuentra por el token. Ícono circle-alert de Lucide en línea                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Tooltip        | `components/tooltip/tooltip.ts`, `components/tooltip/index.ts`                                                                                                                                                                          | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/cdk`                                                                                                                    | `utils/cn.ts`, `utils/overlay.ts`; CSS global `@angular/cdk/overlay-prebuilt.css` (`cssImports`); tokens `--mimi-tooltip-*` (`MimiTooltipTokens`), `tooltip`, `tooltip-foreground`, `--mimi-shadow-neutral`, `--mimi-press-scale`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Popover        | `components/popover/popover.ts`, `components/popover/index.ts`                                                                                                                                                                          | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/cdk`                                                                                                                    | `utils/cn.ts`, `utils/overlay.ts` (desde la G1.2); CSS global `@angular/cdk/overlay-prebuilt.css` (`cssImports`); tokens `--mimi-popover-*` (`MimiPopoverTokens`), `popover`, `popover-foreground`, `border`, `muted-foreground`, `--mimi-radius`, `--mimi-shadow-popover`, `--mimi-press-scale`. Los ejemplos usan Button, Input y Checkbox, pero Popover no depende de ellos                                                                                                                                                                                                                                                                                                                                                                                               |
| Menú (interno) | `components/menu/menu.ts`, `components/menu/index.ts` (ítem `menu` de tipo `util`: no se pide con `ng g mimi`)                                                                                                                          | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/aria`                                                                                                                   | `utils/cn.ts`, `utils/overlay.ts`; tokens `--mimi-menu-*` (`MimiMenuTokens`), `popover`, `popover-foreground`, `accent`, `muted-foreground`, `foreground`, `border`, `destructive-soft-foreground`, `destructive-soft-bg`, `--mimi-radius`, `--mimi-radius-sm`, `--mimi-shadow-popover`, `--mimi-font-mono`, `--mimi-press-scale`                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Dropdown Menu  | `components/dropdown-menu/dropdown-menu.ts`, `components/dropdown-menu/index.ts`                                                                                                                                                        | peer `@angular/cdk` (aria llega por `menu`)                                                                                                                                 | `menu`, `utils/overlay.ts`; CSS global `@angular/cdk/overlay-prebuilt.css` (`cssImports`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Context Menu   | `components/context-menu/context-menu.ts`, `components/context-menu/index.ts`                                                                                                                                                           | peer `@angular/cdk` (aria llega por `menu`)                                                                                                                                 | `menu`, `utils/overlay.ts`; CSS global `@angular/cdk/overlay-prebuilt.css` (`cssImports`). No copia Dropdown Menu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Select         | `components/select/select.ts`, `components/select/select-texts.ts`, `components/select/index.ts`                                                                                                                                        | `clsx`, `tailwind-merge` (vía `cn`); peers `@angular/aria`, `@angular/cdk` y `@angular/forms`                                                                               | `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts` (provee `MIMI_FIELD_CONTROL`), `utils/overlay.ts`; CSS global `@angular/cdk/overlay-prebuilt.css` (`cssImports`); tokens `--mimi-select-*` (`MimiSelectTokens`), `input`, `input-background`, `ring`, `ring-soft`, `destructive`, `destructive-ring`, `popover`, `popover-foreground`, `border`, `accent`, `muted`, `muted-foreground`, `--mimi-control-height`, `--mimi-radius`, `--mimi-radius-sm`, `--mimi-shadow-popover`, `--mimi-press-scale`, `--mimi-disabled-opacity`, `animate-mimi-pulse` y `@keyframes mimi-spin`. `select-texts.ts` no importa aria, cdk ni forms. No depende de FormField ni de Skeleton. Íconos de Lucide en línea (chevron-down, x, check, loader-circle, search, search-x) |
| Dialog         | `components/dialog/dialog.ts`, `components/dialog/dialog-texts.ts`, `components/dialog/index.ts`                                                                                                                                        | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/cdk`; `rxjs` (`Subject` de `afterClosed()`)                                                                             | `utils/cn.ts`, `utils/control-styles.ts` (foco de la X), `utils/overlay.ts` (animación); CSS global `@angular/cdk/overlay-prebuilt.css` (`cssImports`: fondo, contenedor de overlays y bloqueo del scroll); tokens `--mimi-dialog-*` (`MimiDialogTokens`), `overlay`, `--mimi-overlay-blur`, `popover`, `popover-foreground`, `border`, `accent`, `muted-foreground`, `foreground`, `--mimi-radius-card`, `--mimi-radius-sm`, `--mimi-shadow-popover`, `--mimi-press-scale`. `dialog-texts.ts` no importa el CDK. No depende de Button ni de `@angular/aria`. Ícono x de Lucide en línea                                                                                                                                                                                     |
| Confirm        | `components/confirm/confirm.ts`, `components/confirm/confirm-texts.ts`, `components/confirm/index.ts`                                                                                                                                   | `clsx`, `tailwind-merge` (vía `cn`); el peer `@angular/cdk` y su CSS llegan por `dialog`                                                                                    | `dialog`, `button`, `utils/cn.ts`; tokens `--mimi-confirm-*` (`MimiConfirmTokens`), `info-soft`, `info-soft-foreground`, `destructive-soft-bg`, `destructive-soft-foreground`, `muted-foreground`. `confirm-texts.ts` no importa el CDK. Sin íconos propios: el del círculo lo pone el usuario                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Toast          | `components/toast/toast.ts`, `components/toast/toast-config.ts`, `components/toast/toast-texts.ts`, `components/toast/index.ts`                                                                                                         | `clsx`, `tailwind-merge` (vía `cn`), `class-variance-authority`; peer `@angular/cdk` (`a11y`: `LiveAnnouncer`)                                                              | `button`, `utils/cn.ts`, `utils/control-styles.ts` (foco de la X), `utils/overlay.ts` (`mimiWaitForExit`); sin `cssImports` (no usa el CDK Overlay); tokens `--mimi-toast-*` (`MimiToastTokens`), `popover`, `popover-foreground`, `border`, `muted-foreground`, `accent`, `foreground`, los de cada tono (`<tono>`, `-foreground`, `-soft-foreground`, `--mimi-shadow-<tono>-hover`), `--mimi-radius`, `--mimi-radius-sm`, `--mimi-shadow-popover`, `--mimi-press-scale-sm`, `@keyframes mimi-spin`. `toast-config.ts` y `toast-texts.ts` no importan el componente ni el CDK (para `app.config.ts`). Íconos de Lucide en línea (bell, circle-check, triangle-alert, info, circle-x, loader-circle, x)                                                                      |
| Tabs           | `components/tabs/tabs.ts`, `components/tabs/index.ts`                                                                                                                                                                                   | `clsx`, `tailwind-merge` (vía `cn`), `class-variance-authority`; peer `@angular/aria` (la CLI agrega también `@angular/cdk`, que aria necesita, si el proyecto no lo tiene) | `utils/cn.ts`, `utils/control-styles.ts` (foco); sin `cssImports`; tokens `--mimi-tabs-*` (`MimiTabsTokens`), `border`, `muted`, `card`, `foreground`, `muted-foreground`, `info-soft`, `info-soft-foreground`, `--mimi-radius`, `--mimi-shadow-neutral`, `--mimi-press-scale`, `--mimi-disabled-opacity`, `mimi-transition`. Sin íconos propios                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Toolbar        | `components/toolbar/toolbar.ts`, `components/toolbar/index.ts`                                                                                                                                                                          | `clsx`, `tailwind-merge` (vía `cn`), `class-variance-authority`; peer `@angular/cdk` (`a11y` y `bidi`; sin `@angular/aria`: excepción de la G1.10, sección 4)               | `utils/cn.ts`, `utils/control-styles.ts` (foco); sin `cssImports`; tokens `--mimi-toolbar-*` (`MimiToolbarTokens`), `glass`, `glass-border`, `--mimi-glass-blur`, `--mimi-shadow-popover`, `primary`, `primary-foreground`, `info`, `info-foreground`, `accent`, `background`, `border`, `foreground`, `--mimi-press-scale-sm`, `--mimi-disabled-opacity`. Sin íconos propios                                                                                                                                                                                                                                                                                                                                                                                                |
| Pagination     | `components/pagination/pagination.ts`, `components/pagination/pagination-page-size.ts`, `components/pagination/pagination-texts.ts`, `components/pagination/index.ts`                                                                   | `clsx`, `tailwind-merge` (vía `cn`), `class-variance-authority`; peer `@angular/cdk` (`LiveAnnouncer`); `@angular/aria` y `@angular/forms` llegan con Select e Input        | ítems `button` (sus clases), `input`, `select` (dentro de `@defer`: solo se carga con `pageSizeOptions`) y `utils/cn.ts`; los `cssImports` de Select; tokens `--mimi-pagination-*` (`MimiPaginationTokens`), `glass`, `glass-border`, `--mimi-glass-blur`, `--mimi-shadow-popover`, `shadow-neutral`, `input-hover`, `destructive`, `destructive-ring`, `--mimi-control-height(-sm)`, `--mimi-press-scale-sm`. Íconos en línea (Lucide `chevron-left`, `chevron-right`, `chevron-up`)                                                                                                                                                                                                                                                                                        |
| Toggle Group   | `components/toggle-group/toggle-group.ts`, `components/toggle-group/index.ts`                                                                                                                                                           | `clsx`, `tailwind-merge` (vía `cn`), `class-variance-authority`; peers `@angular/cdk` (`FocusKeyManager`, `Directionality`) y `@angular/forms` (tipo `FormValueControl`)    | `utils/cn.ts`, `utils/control-styles.ts`; tokens `--mimi-toggle-group-*` (`MimiToggleGroupTokens`), `muted`, `muted-foreground`, `foreground`, `card`, `shadow-neutral`, `primary`, `primary-foreground`, `shadow-primary`, `destructive`, `--mimi-radius`, `--mimi-disabled-opacity`, `--mimi-press-scale-sm`. Ítem `toggle-group` del registro                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Chip (interno) | `components/chip/chip.ts`, `components/chip/chip-texts.ts`, `components/chip/index.ts` (ítem `chip` de tipo `util`: no se pide con `ng g mimi`)                                                                                         | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/cdk` (`LiveAnnouncer`)                                                                                                  | `utils/cn.ts`, `utils/control-styles.ts`; tokens `--mimi-chip-*` (`MimiChipTokens`), `--mimi-chip` y `--mimi-chip-foreground` (con respaldo `secondary`), `destructive-soft-bg`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Slider         | `components/slider/slider.ts`, `components/slider/slider-texts.ts`, `components/slider/index.ts`                                                                                                                                        | `clsx`, `tailwind-merge` (vía `cn`); peers `@angular/cdk` (`Directionality`) y `@angular/forms`                                                                             | `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts`; tokens `--mimi-slider-*` (`MimiSliderTokens`), `--mimi-track`, `--mimi-track-fill`, `--mimi-thumb` (con respaldo), `tooltip`, `tooltip-foreground`, `ring`, `ring-soft`, `destructive`. Sin `tooltip` en `registryDependencies`. Ítem `slider` del registro                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Combobox       | `components/combobox/combobox.ts`, `components/combobox/combobox-texts.ts`, `components/combobox/index.ts`; ítem `option-list`: `components/option-list/option-list.ts`, `components/option-list/index.ts`                              | `clsx`, `tailwind-merge` (vía `cn`); peers `@angular/aria`, `@angular/cdk` y `@angular/forms`                                                                               | ítems `option-list` (peer `@angular/aria`), `chip` (el múltiple; trae `LiveAnnouncer` de `@angular/cdk`), `utils/cn.ts`, `utils/field-state.ts`, `utils/overlay.ts`; CSS global `@angular/cdk/overlay-prebuilt.css` (`cssImports`); tokens `--mimi-combobox-*` (`MimiComboboxTokens`), los de Input para la caja, `popover`, `border`, `accent`, `info-soft`, `info-soft-foreground`, `primary`, `muted`, `animate-mimi-pulse` y `@keyframes mimi-spin`. `combobox-texts.ts` no importa aria, cdk ni forms. No depende del ítem `select` (decidido el 03/11/2026). Ítem `combobox` del registro                                                                                                                                                                              |
| Date Picker    | `components/date-picker/date-picker.ts`, `components/date-picker/index.ts`; ítem `calendar`: `components/calendar/calendar.ts`, `components/calendar/calendar-texts.ts`, `components/calendar/dates.ts`, `components/calendar/index.ts` | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms`; `@angular/cdk` llega con el calendario (`Directionality`) y Popover                                             | ítems `calendar` (peer `@angular/cdk`), `popover` (con su `cssImports` del overlay), `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts`; tokens `--mimi-date-*` (`MimiDateTokens`), los de Input para el botón, `--mimi-range` (con respaldo), `primary`, `accent`, `border`, `muted-foreground`. `calendar-texts.ts` y `dates.ts` no importan cdk ni forms. No usa `@angular/aria` ni Button. Ítems `calendar` y `date-picker` del registro. **Date Range:** `components/date-range/date-range.ts` e `index.ts`; ítem `date-range` (peer `@angular/forms`), que depende de `calendar`, `date-picker` (usa sus clases del botón y del panel desde `date-picker.ts`), `popover` y los utils; token `--mimi-date-presets-width`                                  |
| File Upload    | `components/file-upload/file-upload.ts`, `components/file-upload/file-upload-texts.ts`, `components/file-upload/index.ts`                                                                                                               | `clsx`, `tailwind-merge` (vía `cn`); peers `@angular/cdk` (`LiveAnnouncer`) y `@angular/forms`                                                                              | ítems `button` y `progress`, `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts`; tokens `--mimi-upload-*` (`MimiFileUploadTokens`), `--mimi-dropzone*` (con respaldo), `--mimi-glow-info`, `@keyframes mimi-bob`, `card`, `border`, `--mimi-shadow-neutral` y los suaves de `info`, `destructive`, `warning` y `success`. Ítem `file-upload` del registro                                                                                                                                                                                                                                                                                                                                                                                                      |
| Color Picker   | `components/color-picker/color-picker.ts`, `color-picker-texts.ts`, `color.ts`, `index.ts`                                                                                                                                              | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms`; `@angular/cdk` llega con Popover                                                                                | ítems `input` y `popover`, `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts`; tokens `--mimi-color-picker-*` (`MimiColorPickerTokens`), `popover`, `muted`, `foreground`, `background`. Sin Slider. Ítem `color-picker` del registro                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Tags Input     | `components/tags-input/tags-input.ts`, `components/tags-input/tags-input-texts.ts`, `components/tags-input/index.ts`                                                                                                                    | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms`; `@angular/cdk` llega con el chip                                                                                | ítems `chip`, `utils/cn.ts` y `utils/field-state.ts`; tokens `--mimi-tags-*` (`MimiTagsInputTokens`) y los de Input para la caja. Ítem `tags-input` del registro                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Input OTP      | `components/input-otp/input-otp.ts`, `components/input-otp/index.ts`                                                                                                                                                                    | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms` (`field-state` y el tipo `FormValueControl`)                                                                     | `utils/cn.ts` y `utils/field-state.ts`; tokens `--mimi-otp-*` (`MimiInputOtpTokens`), `input`, `input-background`, `ring`, `ring-soft`, `success`, `success-ring`, `destructive`, `destructive-ring`, `border`; keyframes `mimi-caret` y `mimi-shake` (`theme-base.css`; sin ellos, solo no hay animación). Ítem `input-otp` del registro                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Input Mask     | `components/input-mask/input-mask.ts`, `components/input-mask/index.ts`                                                                                                                                                                 | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms` (`transformedValue`, `field-state`)                                                                              | `utils/cn.ts` y `utils/field-state.ts`; tokens `--mimi-mask-*` (`MimiInputMaskTokens`) y los de Input para la caja (`--mimi-input-height`, `--mimi-input-radius`, `--mimi-input-placeholder`). Ítem `input-mask` del registro (sin `input`: desde la G2.4b no usa sus clases)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Number Input   | `components/number-input/number-input.ts`, `components/number-input/number-input-texts.ts`, `components/number-input/index.ts`                                                                                                          | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms` (`field-state` y el tipo `FormValueControl`)                                                                     | `utils/cn.ts`, `utils/field-state.ts`; tokens `--mimi-number-*` (`MimiNumberInputTokens`), `input`, `input-background`, `input-hover`, `ring`, `ring-soft`, `destructive`, `destructive-ring`, `accent`, `--mimi-control-height`, `--mimi-radius(-sm)`, `--mimi-disabled-opacity`, `--mimi-press-scale-sm`. Íconos en línea (Lucide `minus` y `plus`). Ítem `number-input` del registro                                                                                                                                                                                                                                                                                                                                                                                      |
| Password       | `components/password/password.ts`, `components/password/password-texts.ts`, `components/password/index.ts`                                                                                                                              | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/cdk` (`LiveAnnouncer`); `@angular/forms` llega con Input                                                                | ítems `input`, `utils/cn.ts` y `utils/control-styles.ts`; tokens `--mimi-password-*` (`MimiPasswordTokens`), `--mimi-strength-weak`, `-medium` y `-strong` (con respaldo `destructive`, `warning` y `success`), `--mimi-track` (respaldo `--mimi-input`), los de Input para la caja. Íconos en línea (Lucide `eye`, `eye-off`, `circle-check`, `circle`). Ítem `password` del registro                                                                                                                                                                                                                                                                                                                                                                                       |
| Progress       | `components/progress/progress.ts`, `components/progress/index.ts`                                                                                                                                                                       | `clsx`, `tailwind-merge` (vía `cn`)                                                                                                                                         | `utils/cn.ts`; tokens `--mimi-progress-*` (`MimiProgressTokens`), `--mimi-track` (con respaldo `--mimi-input`), `primary`, `success`, `warning`, `info`, `destructive`; keyframes `mimi-indet`, `mimi-spin` y `mimi-pulse` (`theme-base.css`). Ítem `progress` del registro                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### Criterio del catálogo

Mimi solo agrega componentes **funcionales y difíciles de hacer bien a mano**: los que exigen teclado, accesibilidad, overlays o manejo de estados. Card y los demás componentes básicos de la 0.1.0 se mantienen, pero no se agregan más componentes de ese tipo (contenedores o estilos que el usuario resuelve con unas clases de Tailwind).

**No serán componentes de la CLI:** el editor de texto enriquecido, los gráficos y el calendario de eventos. Dependerían de librerías externas grandes; si se hacen, serán recetas en la documentación.

### Variante y tono

Dos ejes separados en todos los componentes con color:

- **Variante** (`variant`): cómo se ve. `solid`, `soft`, `outline`, `ghost`, `link`… (cada componente usa las que tengan sentido).
- **Tono** (`tone`): de qué color. `primary`, `secondary`, `success`, `warning`, `info` y `danger`. El tono `danger` usa los tokens `destructive` (sección 13).

**Sin `tone`, cada variante usa su tono natural:** `solid`, `soft` y `link` usan `primary`; `outline` y `ghost` usan `secondary` (neutros, como en la 0.1.0). `data-variant` y `data-tone` muestran los valores ya resueltos.

`destructive` deja de ser una variante. Para no romper la 0.1.0, los colores que eran variantes siguen funcionando como **atajos**, sin error ni aviso: `variant="default"` = solid + primary, `variant="secondary"` = solid + secondary y `variant="destructive"` = solid + danger (tarea V.1). Si además se pasa `tone`, **gana el atajo** y, en modo desarrollo, sale un `console.warn` una sola vez. En el tipo van marcados `@deprecated`; se quitan en la 1.0 (sección 12).

**Un solo vocabulario de tonos (antes de la 0.2.0):** los valores de `tone` salen siempre de esa lista común o de un subconjunto (Confirm: `primary | danger`; ítems de menú: `danger`; Toast: el tono sale del método, `success | info | warning | danger`). No hay otros nombres: «neutro» o «por defecto» no son valores que se escriban; sin `tone`, el componente usa su color natural (en Toast, `toast()`; en los ítems de menú, el color normal) y no lleva `data-tone`.

Regla para los componentes nuevos: variante y tono desde el principio, sin variantes de color. Los colores de cada combinación salen solo de los tokens del tono (`--mimi-<tono>`, `-foreground`, `-soft`, `-soft-foreground`, `-hover`, `-ring`, `-soft-hover`, `-border`, `-subtle`, `--mimi-shadow-<tono>` y `--mimi-glow-<tono>`). En el código, un mapa legible con una fila por tono y una entrada por variante (`TONE_CLASSES`), que `cva` convierte en `compoundVariants`.

**Button** (variantes `solid`, `soft`, `outline`, `ghost`, `link`) y **Badge** (`solid`, `soft`, `outline`; outline con tono lleva un punto decorativo del color del tono, un `::before` vacío; sin tono, neutro y sin punto) siguen el diseño `Mimi F2 Tokens y Tonos` en solid, soft y outline. El tono `secondary` y las celdas de ghost y link con tono son **provisionales, sin diseño** (sección 13). El glow no forma parte de la V.1: en el diseño es una opción aparte («Glow en todos»).

### Base técnica de los componentes: @angular/aria y @angular/cdk (decisión 4.3)

**Decisión (01/10/2026): una combinación.**

- **`@angular/aria`** para los patrones con semántica, foco y teclado: Listbox + Combobox (Select; después Combobox/Autocomplete y Command), Menu (Dropdown Menu y Context Menu) y Tabs. Toolbar se descartó en la G1.10: mimi-toolbar usa `FocusKeyManager` del CDK (excepción, más abajo). Accordion, Tree y Grid (Data Table) también existen en aria; se confirman en su tarea.
- **`@angular/cdk`** para lo que aria no trae:
  - el posicionamiento de todos los popups, con `@angular/cdk/overlay` (`cdkConnectedOverlay` con `usePopover: 'inline'`, igual que los ejemplos oficiales de aria);
  - Dialog, Confirm y Sheet, con `@angular/cdk/dialog`;
  - Popover y Tooltip: Overlay más su semántica propia (`aria-describedby`, `role="tooltip"`);
  - foco y anuncios, con `@angular/cdk/a11y`;
  - Sortable List, con `@angular/cdk/drag-drop`.
- **Formularios:** aria no trae integración con formularios (ni `ControlValueAccessor` ni `FormValueControl`). Los controles de Mimi implementan `FormValueControl` (sección 8) por fuera y conectan su `value` con el `value` del listbox de aria.
- **No se usan:**
  - `@angular/cdk/menu` ni `@angular/cdk/listbox`: son los patrones anteriores a aria, y `CdkListbox` implementa `ControlValueAccessor`, contra la sección 8;
  - los entry points `private` de aria o cdk, ni símbolos `ɵ` o `_` (sección 1, «Reglas del código que se entrega»). `imports.spec.ts` lo comprueba desde la G1.1 (también rutas internas como `fesm2022/…`).

**Estilos del overlay (G1.1).** La guía oficial del CDK (`overlay.md`, rama 22.x) dice que, si se usa el CDK sin Angular Material, hay que importar `@angular/cdk/overlay-prebuilt.css`. En el código de CDK 22, `createOverlayRef()` y `OverlayContainer` también los cargan solos con un cargador interno (`_CdkPrivateStyleLoader`), pero eso no está documentado. **Seguimos la guía:** la CLI agrega `@import "@angular/cdk/overlay-prebuilt.css";` al CSS global al instalar un ítem con `cssImports` (sección 5), y el showcase lo importa igual. Una prueba de Popover hace de alarma: si el CDK deja de cargarlos solo, falla para revisar esta nota, pero no es lo que garantiza que funcione. Son reglas sin `@layer`, así que ganan a las utilidades de Tailwind sin importar el orden; solo afectan a los contenedores del CDK, no al panel de Mimi.

**Toast y el `aria-hidden` del Dialog (G1.8).** Al abrir un diálogo, el CDK pone `aria-hidden` a los hermanos del contenedor de overlays, pero salta los que tienen `popover` o `aria-live` (en `_hideNonDialogContentFromAssistiveTechnology`, un método privado: es un detalle interno, no API documentada). La pila de Toast (`popover="manual"`) y la región del `LiveAnnouncer` quedan así visibles para los lectores con un diálogo abierto. No llamamos a nada privado; una prueba de Toast hace de alarma: si el CDK cambia ese comportamiento, falla para revisar esta nota.

**El texto del `LiveAnnouncer` se oculta con el tema (06/11/2026; afecta a lo publicado en la 0.2.0).** El `LiveAnnouncer` crea al final del `body` un `div.cdk-live-announcer-element.cdk-visually-hidden`, pero **no carga el CSS de esa clase**: en el CDK 22.2 solo lo inyectan (`_CdkPrivateStyleLoader` con `_VisuallyHiddenLoader`, privado) `CdkAriaLive` y `FocusTrapFactory`, es decir, Dialog y los paneles con trampa de foco. Tampoco está en `overlay-prebuilt.css` (es de `a11y-prebuilt.css`). Sin la regla, el anuncio queda a la vista al final de la página («Página 4 de 12» al cambiar de página, comprobado en Chrome en el sitio y en un proyecto con la 0.2.0 de npm), y solo en las páginas donde antes no se abrió un Dialog. Lo usan Pagination y Toast (0.2.0), y Password, File Upload y el ítem `chip` (Tags Input y Combobox múltiple). **Regla:** `theme-base.css` lleva `.cdk-visually-hidden` (y su variante RTL), con las mismas declaraciones que `a11y-prebuilt.css`, fuera de cualquier `@layer` (como la inyecta el CDK); `theme/visually-hidden.spec.ts` compara las declaraciones con las del cdk instalado (alarma si el CDK las cambia). Va en el tema, y no como `cssImports`, para que llegue a todo proyecto que actualice el tema, aunque no vuelva a pedir esos componentes. No se usa el cargador privado del CDK. Los textos ocultos propios de Mimi usan `sr-only` de Tailwind, que se genera porque Tailwind escanea los componentes copiados (comprobado en el mismo proyecto).

**Popover nativo (G1.1).** En los navegadores con Popover API, el CDK abre los overlays como `popover` nativo (capa superior: sin `z-index` ni recortes por `overflow`). Mimi usa la ubicación `'inline'` (el panel va en el DOM justo después del trigger, así el orden de Tab lo sigue). Sin Popover API, el CDK usa su contenedor de siempre.

**Paneles en pantallas chicas (5.17a, 04/11/2026; decidido por defecto en modo autónomo, pendiente de revisión del usuario).** Los overlays anclados (Popover, Dropdown Menu, Context Menu, Select y, en el Grupo 2, Combobox, Date Picker, Color Picker y la burbuja del Slider) usan en móvil **la misma forma que en escritorio**: un panel anclado al disparador, no una hoja inferior ni un panel modal. Reglas que siguen todos:

- **Dentro de la pantalla:** a 8px del borde como mínimo (`MIMI_VIEWPORT_MARGIN`) y con ancho máximo `100vw − 16px`.
- **Posiciones:** `mimiConnectedPositions` prueba el lado pedido con la alineación pedida y después con las otras dos (`start` → `end` → `center`; `end` → `start` → `center`; `center` → `start` → `end`), luego el lado opuesto igual y por último los costados centrados. Antes de la 5.17a solo probaba la alineación pedida: en 360px, un menú de 240px alineado al inicio de un disparador cercano al borde se salía de la pantalla (medido en Dropdown Menu, Dialog y Confirm). Los paneles de lista (Select y, en el Grupo 2, Combobox y Date Picker) no pasan a los costados: solo las seis posiciones de arriba y abajo.
- **Alto:** el panel tiene un alto máximo propio (Select, 280px; Combobox, `--mimi-combobox-menu-max-height`) y se desplaza por dentro; un panel no debe medir más que la pantalla menos los márgenes.
- **Teclado virtual:** el CDK Overlay no usa `window.visualViewport` (comprobado en `@angular/cdk` 22: ninguna referencia), así que no reposiciona el panel cuando el teclado reduce la parte visible. Es un límite conocido hasta que se compruebe en teléfonos reales (5.17, C4); si hace falta, se agrega en `utils/overlay.ts` y lo heredan todos.
- **Paneles altos (5.17b, 05/11/2026, hallazgo abierto):** el calendario (365px), el Date Range con atajos (360px) y el Color Picker en su disparador (372px) no caben arriba ni abajo de un disparador que está en el medio de una pantalla de 780px de alto; en la medición automática quedan de 2 a 7px fuera del margen de 8px (y hasta 4px por encima del borde). Se probaron `cdkConnectedOverlayPush` y volver a calcular la posición después de pintar el contenido, sin cambio en la medición, y se revirtieron. Decidido por el usuario (05/11/2026): no se intentan más arreglos; es un criterio manual de la G2.P (teléfono real) y, si se confirma, una tarea con un spike de las opciones del overlay (margen de viewport y empuje).
- **Objetivo del Slider (5.17b):** el anfitrión mide 24px de alto y recibe todo el puntero (va el pulgar más cercano), así el objetivo cumple 2.5.8 aunque los pulgares de 20px estén juntos.
- **Hoja o modal en móvil:** fuera de la 0.3.0. La API del Select no depende del overlay (G1.5), así que se puede agregar después sin cambiar entradas ni salidas.

**Evidencia:**

- **Documentación de Angular 22** (MCP de Angular y angular.dev):
  - aria son «directivas headless y accesibles que implementan patrones WAI-ARIA»: Autocomplete, Listbox, Select, Multiselect, Combobox, Menu, Menubar, Toolbar, Accordion, Tabs, Tree y Grid;
  - no trae overlays ni diálogos, y sus ejemplos posicionan con CDK Overlay;
  - el filtrado del autocomplete lo implementa la app (no hay «búsqueda» incorporada en Select).
- **Código instalado (22.2.1):**
  - las declaraciones de aria no tienen marcas `@developerPreview` ni `@experimental`;
  - aria declara `@angular/cdk` **22.2.1 exacto** como peerDependency y `@angular/core ^22 || ^23`;
  - no hay ninguna integración con formularios.
- **Prueba de concepto** (proyecto temporal fuera del repositorio, Angular 22.2, `ng build` de producción, JS total por encima de una app base):

  | Variante                                       | Crudo     | gzip     |
  | ---------------------------------------------- | --------- | -------- |
  | Solo CDK Overlay (un popup vacío)              | +64,9 kB  | +17,1 kB |
  | aria: Select con búsqueda (Combobox + Listbox) | +116,0 kB | +31,5 kB |
  | aria: menú con submenú                         | +109,1 kB | +28,7 kB |
  | aria: los dos                                  | +136,7 kB | +35,8 kB |
  | cdk: Select con búsqueda (a mano)              | +93,9 kB  | +26,4 kB |
  | cdk: menú con submenú (`@angular/cdk/menu`)    | +98,6 kB  | +27,3 kB |
  | cdk: los dos                                   | +125,3 kB | +34,4 kB |

  CDK Overlay es la mitad del costo y lo pagan las dos opciones. Con Select y menú juntos, aria cuesta unos 11 kB crudos (1,4 kB gzip) más que cdk solo. Pero el Select solo con cdk se escribió a mano y con menos comportamiento (sin búsqueda por letra, sin selección múltiple, sin desplazar el activo a la vista): en Mimi ese código viviría en el proyecto del usuario. El costo se paga solo en las rutas que usan estos componentes.

- **Formularios, probado:** un control con `FormValueControl` que usa el Listbox de aria por dentro funciona con `[formField]` (modelo → control, control → modelo, `disabled` del formulario), con `[formControl]` y con `[(ngModel)]`, sin `ControlValueAccessor`. El comportamiento de teclado con overlay no se probó en un navegador real: se prueba en cada componente.

**Por qué aria, en el modelo copy-paste:** el teclado, el foco y los atributos ARIA viven en una dependencia versionada que el usuario actualiza con `ng update`, y el código que la CLI copia queda corto y legible: estructura, estilos y el puente con los formularios. Las APIs usadas son las documentadas de `@angular/aria` y `@angular/cdk`.

**Reglas de uso (obligatorias):**

- **aria y cdk se usan solo dentro de los componentes.** La API pública de Mimi (selectores, entradas, salidas y tipos) es propia y **nunca expone directivas ni tipos de aria o cdk**: ni `hostDirectives` con sus entradas, ni tipos suyos en entradas, salidas o valores exportados. Así se pueden reemplazar en el futuro sin cambiar cómo se usan los componentes.
- **Nunca se usan los entry points `private` de aria** (ni los de cdk, ni símbolos `ɵ`). `imports.spec.ts` lo rechaza desde la tarea G1.1.
- **El valor vive en Mimi; aria solo lo pinta; nunca se toma el valor que aria emite cuando no coincide con una opción existente** (regla general desde la G1.9, después del Select y de Tabs). El componente guarda su propio valor (`model`) y le pasa a aria lo que tiene que mostrar; de lo que aria emite solo toma valores que corresponden a una opción o pestaña existente y elegible. Así un valor que llega antes que sus opciones (datos que cargan después) no se pierde.
- **Revisión después de G1.5 (Select):** antes de usar aria en el resto del Grupo 1, se confirma que funcionó bien (teclado, lectores de pantalla, formularios y bundle). Si no convence, la alternativa es una capa propia de comportamiento, al estilo de las directivas Brain de Spartan, sin cambiar la API de Mimi.

**Resultado de la revisión (G1.5b, 13/10/2026): se sigue con aria** en el resto del Grupo 1 (Tabs, G1.9). mimi-toolbar (G1.10) es la excepción: ver más abajo.

- **Motivos:**
  - **Teclado:** probado en Chrome real en el Dropdown Menu (G1.3), el Context Menu (G1.4) y el Select (G1.5), con el overlay abierto.
  - **Formularios:** el Select funciona con Signal Forms, Reactive Forms y `ngModel`, con pruebas de los tres.
  - **Bundle:** aria y el CDK quedan en las rutas diferidas. El JS inicial solo sumó una vez los 2 kB de `hostDirectives` (G1.3).
  - **Lector de pantalla:** el autor probó con NVDA la página del Select (prueba general) y lee bien los componentes, sin problemas detectados. El árbol de accesibilidad de Chrome se revisó además por CDP (G1.5).
  - **Rodeos:** todos usan API pública de aria (ningún entry point `private` ni símbolo `_`/`ɵ`). El Select necesita más que el menú, casi todos por el buscador dentro del panel. La lista completa, separada en «pegamento» y «choque», está más abajo, en «Rodeos de aria» (antes estaba en el plan, G1.5b).
- **Los tres choques del Select y cómo se contienen:**
  - **Valor (dos choques):** aria desmarca la opción elegida al volver a elegirla (`toggleOne` en la selección simple explícita) y vacía el valor del listbox cuando la opción elegida queda fuera del filtro o la lista está vacía. Mimi no usa el `value` del listbox como valor del Select: es solo lo que se pinta (el check y `aria-selected`), y se le vuelve a escribir cada vez que aria lo cambia. El valor real vive en `MimiSelect` y solo cambia cuando Mimi elige una opción.
  - **Opción activa al buscar (tercero, encontrado en esta revisión por una prueba de alarma):** mientras no se haya usado el teclado en la lista, aria vuelve a activar la opción elegida cada vez que cambian las opciones. Al escribir en el buscador, el diseño pide que quede activa la primera coincidencia; con la elegida todavía en la lista, aria la reponía después del `gotoFirst()` de Mimi (con México elegido, «i» y Enter no cambiaban nada). Mimi lo contiene con una marca en la lista (`keepFirst`): desde que cambia la búsqueda, repone la primera opción habilitada cada vez que cambian las opciones o aria mueve la activa, hasta que el usuario la mueve con las flechas o con el puntero. Usa solo `gotoFirst()` y `activeDescendant`, que son públicos.
- **Los dos choques de Tabs (G1.9) y cómo se contienen:**
  - **aria vacía el modelo** si el valor no coincide con una pestaña (pestañas que llegan después, o la elegida que se quita): el `afterRenderEffect` de `ngTabList` escribe `undefined`. Mimi aplica la regla general: el valor vive en `MimiTabs`, a aria se le pasa la pestaña que se pinta (la del valor, o la primera habilitada mientras llega) y nunca se toma su `undefined`.
  - **El `tabindex="0"` no sigue al valor después de interactuar:** aria fija la pestaña activa solo mientras nadie interactuó (`setDefaultStateEffect` se apaga con `hasBeenInteracted`), y la API pública no permite moverla. Cambiar el valor desde el código dejaba Tab en la pestaña vieja, y quitar la activa dejaba la fila sin entrada con Tab. Mimi recrea el `ngTabList` (no los paneles ni el indicador) cuando el valor cambia desde fuera o cambian las pestañas, sin el foco dentro; aria vuelve a empezar y pone el `tabindex="0"` en la elegida. Mismo recurso que el `ngMenu` del Context Menu (G1.4).
  - Los dos tienen prueba de alarma en `tabs.spec.ts`, con aria directo. Borradores de los issues para angular/components: fuera del repo (los publica el autor).
- **Pendiente:** con el panel cerrado, una letra no salta a la opción (el `<select>` nativo sí). aria no lo ofrece: habría que escribir la búsqueda por letra en Mimi. Una prueba de alarma avisa si aria empieza a hacerlo.
- **Pruebas de alarma:** cada rodeo tiene una prueba que falla si aria cambia ese comportamiento (`dropdown-menu.spec.ts`, `context-menu.spec.ts` y `select.spec.ts`; las que no ejercitaba ninguna otra prueba llevan «alarma» en el nombre).
- **Cuándo se revisa de nuevo:** en cada versión mayor de Angular se leen las notas de `@angular/aria` y se corren las pruebas de alarma (sección 12, «Rutina ante una versión nueva de Angular»). Si un choque crece, o aparece uno nuevo sin solución con API pública, se reabre la decisión. El plan B no cambia: una capa propia de comportamiento, al estilo de las directivas Brain de Spartan, con la misma API de Mimi.

**Excepción: mimi-toolbar usa `FocusKeyManager` de `@angular/cdk/a11y` (G1.10, 20/10/2026).** El spike de `@angular/aria/toolbar` (22.1.7, Chrome real) encontró tres choques nuevos; el tercero, sin solución con API pública, es el caso que esta sección deja para reabrir. Se compararon las dos variantes con la misma API y el mismo guion:

|                                                                                                                | `@angular/aria/toolbar`                                                                                          | `FocusKeyManager`           |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Una parada de Tab, último ítem, flechas por orientación, vuelta, Inicio/Fin, RTL, deshabilitados, ítems nuevos | ✔                                                                                                                | ✔                           |
| Enter y Espacio                                                                                                | aria cancela el `keydown`: el botón no recibe su clic (choque 1)                                                 | nativos                     |
| Clic con el mouse                                                                                              | deja el anillo de foco de teclado: aria cancela el `pointerdown` y enfoca por código (choque 2)                  | sin anillo                  |
| Foco movido por código                                                                                         | aria no se entera: las flechas y Enter siguen desde el ítem anterior (choque 3; misma causa que el issue #33934) | se sincroniza con `focusin` |
| Rodeos                                                                                                         | 4 de pegamento, 3 choques                                                                                        | 6 de pegamento, 0 choques   |
| Líneas de Mimi                                                                                                 | ~80                                                                                                              | ~128                        |
| Chunk lazy de la variante sola (crudo / gzip)                                                                  | 29,70 / 9,12 kB                                                                                                  | 14,82 / 5,34 kB             |

El pegamento del CDK es todo API pública y documentada: el `tabindex` itinerante, la sincronización con `focusin`, la configuración de orientación y RTL (`Directionality`), `role="toolbar"` y `aria-orientation`, los separadores y `aria-pressed`. Tabs, Select y los menús siguen con aria. Sin aria, los botones pueden ser del usuario (no plantillas): el gestor solo necesita objetos con `focus()` y `disabled`.

- **Para los próximos componentes con aria:** empezar con un spike como el del Select y comparar la cuenta de rodeos.

**Costos y riesgos:**

- Dos dependencias más en el proyecto del usuario.
- aria exige **la misma versión exacta** de cdk. La CLI ya alinea toda peerDependency `@angular/*` al rango de `@angular/core` del proyecto (sección 5, «Qué hace `mimi`», punto 7). Como aria y cdk salen juntas, el gestor de paquetes resuelve las dos a la misma versión.
- aria figura como «New» en la documentación. Si cambia, se revisa con la rutina de la sección 12.

#### Rodeos de aria

Lista de los rodeos que hizo falta con `@angular/aria`, separados en «pegamento» (integración normal) y «choque» (Mimi contiene un comportamiento de aria). Estaba en el plan, tarea G1.5b, y se movió aquí el 03/11/2026 con el mismo texto; las citas «plan, G1.5b» del código se refieren a esta lista. Cada rodeo tiene su prueba de alarma (ver «Pruebas de alarma», arriba). La revisión de los rodeos con aria 22.2 es la tarea M.3 del plan.

La decisión pesó los rodeos que hizo falta en el menú (G1.3):

- **Trigger propio:** `ngMenuTrigger` necesita `[menu]` en el botón del usuario, y eso no se puede dar sin `hostDirectives` que expongan aria ni sin el entry point `private`. Mimi pone `aria-haspopup`, `aria-expanded`, `aria-controls` y las teclas del botón.
- **Foco inicial:** ninguna API pública enfoca el primer o el último ítem, así que Mimi envía Home/End al `ngMenu`. Lo cubre una prueba de alarma.
- **Escape en el `ngMenu`:** aria detiene su propagación y el CDK nunca lo ve, así que Mimi lo escucha en el mismo elemento.
- **Cierre y overlay a cargo de Mimi:** el `ngMenu` raíz sin trigger de aria está siempre «visible», no se cierra al elegir ni con Escape o Tab, y no posiciona nada.
- **Contexto:** el contenido del usuario se pinta con el injector de dentro del `ngMenu`, para que los ítems lo encuentren por DI. Cada ítem lleva un `value` interno, porque aria lo exige y Mimi traduce `itemSelected`. aria tampoco maneja `aria-checked`.
- **Reiniciar el menú (G1.4):** no hay API pública para reiniciar el ítem activo y los submenús al volver a abrir. Mimi recrea el `ngMenu` entero en cada apertura del Context Menu.
- **Dato para la decisión (G1.4):** aria no aporta nada propio al menú contextual. La apertura, el punto, las teclas y el táctil son de Mimi y del CDK; aria solo da el teclado dentro del menú, igual que en el Dropdown.

Y los del Select (G1.5), separados en dos tipos. Todos usan API pública de aria.

**Lo que aria hace solo en el Select:** `role="combobox"`, `aria-expanded`, `aria-haspopup`, `aria-controls` y `aria-activedescendant` en el disparador (el foco no se mueve); abrir con ↓, Enter, Espacio y clic; la opción elegida activa al abrir; flechas con vuelta, Inicio/Fin y letra; saltar las deshabilitadas (`softDisabled` en falso); Escape; cerrar cuando el foco sale; `aria-selected`, `aria-disabled` y los grupos; y, con buscador, el input como combobox que maneja la lista sin perder el foco.

**Pegamento** (integración normal):

- **Elegir y cerrar:** el listbox no avisa al combobox. Mimi elige con el clic en una opción habilitada y, desde el teclado, con la opción activa (Enter, Espacio); luego cierra.
- **Foco:** Mimi lo devuelve al disparador al elegir o cerrar, y evita que un clic en el panel lo mueva (`mousedown.preventDefault`); sin eso, aria cierra al hacer clic en una zona no enfocable.
- **Clave interna:** aria compara por identidad. Cada opción lleva su posición en la lista completa y Mimi traduce con `compareWith`.
- **Teclas con el panel cerrado:** aria exige los modificadores exactos, así que ↑, Alt+↓ y Alt+↑ los atiende Mimi escribiendo `expanded`.
- **Espacio durante la búsqueda por letra:** aria lo toma como parte del texto; Mimi lleva la misma cuenta de tiempo para no elegir.
- **Buscador (combobox doble):** un segundo `ngCombobox` dentro del panel (`alwaysExpanded`), como el ejemplo oficial `combobox-dialog`. Mimi lleva el foco al input al abrir, maneja Escape, Enter y Tab en él (Tab devuelve el foco al disparador para que siga desde ahí, porque el panel está fuera del orden del documento) y activa la primera coincidencia al escribir (`gotoFirst()`).
- **El puntero activa la opción** (`gotoIndex()`): aria solo la activa con el teclado.
- **Animación de salida:** `preserveContent` en el combobox, para que aria no destruya el panel al cerrar.
- **Popup por fuera del overlay:** si el `ngComboboxPopup` va dentro, `aria-haspopup` desaparece con el panel cerrado.

**Choque con el comportamiento de aria:**

- **La opción elegida se desmarca** al volver a elegirla (Enter, Espacio o clic): aria usa `toggleOne` en la selección simple explícita y el valor queda vacío.
- **aria vacía el valor al filtrar:** si la opción elegida queda fuera del filtro, o la lista está vacía por «cargando», el listbox emite `[]`.
- En los dos casos Mimi no usa el `value` del listbox como valor: es solo lo que se pinta (el check y `aria-selected`), y se le vuelve a escribir cada vez que aria lo cambia. Lo cubren pruebas.
- **aria vuelve a activar la opción elegida** (también en el Combobox, abajo) cada vez que cambian las opciones, mientras no se haya usado el teclado en la lista. Al escribir en el buscador con la elegida todavía en la lista filtrada, quedaba activa ella y no la primera coincidencia, aunque Mimi llamara a `gotoFirst()` (con México elegido, «i» y Enter no cambiaban nada). Mimi lo contiene con una marca en la lista (`keepFirst`): desde que cambia la búsqueda, repone la primera opción habilitada cada vez que cambian las opciones o aria mueve la activa, hasta que el usuario la mueve con las flechas o con el puntero. Lo cubre la prueba «alarma: al escribir, la primera coincidencia queda activa aunque la elegida siga en la lista (gotoFirst)».

Y los del Combobox (G2.8). Usa los de arriba (elegir con el clic y con la opción activa, clave interna, el valor del listbox solo para pintar, `keepFirst`, el puntero activa, `preserveContent` y el popup por fuera del overlay), en la lista compartida `option-list`; cada uno con su prueba de alarma en `combobox.spec.ts`. Lo propio:

- **Sin segundo combobox:** el `ngCombobox` va en el propio `<input>` (el editable que aria abre al escribir y que reenvía flechas y Enter a la lista); Mimi atiende ↑, Alt+↓, Alt+↑, Enter (elegir) y Escape con el panel cerrado (vaciar).
- **La lista nace al escribir:** la primera letra abre el panel y la lista todavía no existe cuando cambia el texto, así que Mimi activa la primera coincidencia en cuanto la lista aparece (`gotoFirst()` desde un `effect` sobre la lista).
- **El estado de antes de la tecla:** aria cierra con Escape antes de que Mimi vea la tecla; Mimi decide con el estado ya pintado (`state`), como el Select, para no vaciar el campo con el mismo Escape que cerró.
- **#33974 (aria 22.2.4, M.2):** destruir el panel antes de su primera detección de cambios lanzaba `NG0950` en 22.2.3. **Comprobado el 05/11/2026** en un proyecto limpio fuera del repo (Angular 22.2.4, Mimi desde el `.tgz`): con aria y cdk 22.2.3, crear el Combobox **o el Select** (`createComponent` o `ViewContainerRef.createComponent`) y destruirlo sin detección de cambios en medio lanza `NG0950: Input "combobox" is required` (`ComboboxPopup` lee su entrada en `ngOnDestroy`); con 22.2.4 no. Abrir y cerrar en el mismo ciclo, resultados que llegan y se van, y quitar el componente con `@if` no lanzan en ninguna de las dos. Por eso `@angular/aria` y `@angular/cdk` pasan a `^22.2.4` en las peers de `packages/ui-core/package.json` y, con él, en todos los ítems del registro (`registry.spec.ts` exige el mismo rango en los dos lados; un solo rango evita mezclar 22.2.3 y 22.2.4, y aria exige la misma versión exacta que cdk). La CLI no cambia un aria o un cdk ya instalados, pero desde la 0.3.0 avisa si quedan por debajo (spec 5, «Versión mínima de cdk y aria», M.4): quien tenga 22.2.3 actualiza con `ng update @angular/cdk @angular/aria` (CHANGELOG de la 0.3.0).

**Pendiente:** con el panel cerrado, una letra no salta a la opción (el `<select>` nativo sí). aria no lo ofrece: cerrado solo atiende ↓, Enter y Espacio, y la lista no existe. Habría que escribir la búsqueda por letra en Mimi.

**Comparado con el menú:** más rodeos en número, casi todos del buscador dentro del panel; ninguno usa API privada.

Y los de Tabs (G1.9), con la misma separación. Todos usan API pública.

**Pegamento:**

- **Directivas de aria dentro de la plantilla de Mimi:** `ngTab` y `ngTabPanel` buscan a `ngTabs` por DI; exponerlas con `hostDirectives` está prohibido (spec 4).
- **Ocultar los paneles:** aria solo les pone `inert`; Mimi los oculta con `hidden`.
- **Pestaña por defecto:** sin valor aria no elige ninguna; Mimi elige la primera habilitada.
- **Clic, Enter o Espacio en la pestaña que se pinta** mientras se espera otro valor: aria no emite (ya está elegida para él); Mimi toma la elección.

**Choque con el comportamiento de aria:**

- **aria vacía el modelo** si el valor no coincide con una pestaña (pestañas que llegan después, o la elegida que se quita). Mimi aplica la regla general de la spec 4: el valor vive en Mimi y nunca se toma el `undefined` de aria. Alarma: «alarma (choque 1)» en `tabs.spec.ts`.
- **El `tabindex="0"` no sigue al valor después de interactuar**, y quitar la pestaña activa deja la fila sin entrada con Tab. Mimi recrea el `ngTabList` cuando el valor cambia desde fuera o cambian las pestañas, sin el foco dentro. Alarma: «alarma (choque 2)» en `tabs.spec.ts`.

**Comparado con el Select:** menos rodeos (4 y 2 frente a 9 y 3); ninguno usa API privada.

### Hoja de ruta

Cada grupo es una versión menor y va precedido por su tarea de diseño en Claude Design (`docs/plan.md`, D1–D5). Antes del Grupo 1: la tarea 4.3 (`@angular/aria` frente a `@angular/cdk`, que decide la base de overlays, listbox, menús, tabs y toolbar; la toolbar terminó en el CDK, G1.10) y los tokens nuevos (T.1: `success`, `warning`, `info` con sus `-foreground` y sombras de color, y `--mimi-glow` con `color-mix`; valores de D1). El orden de cada tabla es el orden en que conviene hacerlos. Cada componente registra sus tokens (sección 13).

**Grupo 1 → v0.2.0: overlays y navegación**

| Orden | Componente    | Inspiración                             | Depende de                                            |
| ----- | ------------- | --------------------------------------- | ----------------------------------------------------- |
| 1     | Popover       | shadcn/Spartan                          | CDK Overlay (base de los demás overlays)              |
| 2     | Tooltip       | shadcn/Spartan                          | Popover (posicionamiento)                             |
| 3     | Dropdown Menu | shadcn/Spartan                          | Popover                                               |
| 4     | Context Menu  | shadcn/Spartan                          | Ítems de menú (`menu`, compartidos con Dropdown Menu) |
| 5     | Select        | NG-ZORRO (API) y PrimeNG                | Popover, FormField                                    |
| 6     | Dialog        | shadcn y Vuesax                         | `@angular/cdk/dialog`                                 |
| 7     | Confirm       | PrimeNG ConfirmDialog y Vuesax          | Dialog, Button                                        |
| 8     | Toast         | Sonner (shadcn) y Vuesax                | Tokens T.1, Button                                    |
| 9     | Tabs          | HeroUI                                  | `@angular/aria/tabs`                                  |
| 10    | mimi-toolbar  | Vuesax (VsCanvasToolbar)                | Tooltip (separador y contador propios, G1.10)         |
| 11    | Pagination    | Diseño propio (píldora de mimi-toolbar) | Select (con `@defer`), Input, clases de Button        |

- **Select** (`mimi-select`), estilo NG-ZORRO: buscador interno, limpiar, cargando, sin resultados, grupos, opciones deshabilitadas, check en la elegida, teclado (flechas, Enter, Escape, Home/End). Implementa `FormValueControl` (sección 8), nunca `ControlValueAccessor`. Hecho en la G1.5: el detalle está en la tabla del Grupo 1.
  ```ts
  export interface MimiOption<T = unknown> {
    label: string;
    value: T;
    disabled?: boolean;
    /** Texto atenuado a la derecha («Sin cobertura»). */
    hint?: string;
  }

  export interface MimiOptionGroup<T = unknown> {
    label: string;
    options: readonly MimiOption<T>[];
  }
  ```
- **Dialog** (`MimiDialogService`): `dialog.open(MiComponente, { data, width, maxWidth, disableClose, injector })`. Sin header/body/footer obligatorios, con una X arriba a la derecha. Cierra con X, Escape y clic en el fondo (salvo `disableClose`). Datos con `inject(MIMI_DIALOG_DATA)`. **La X se ve siempre, con una excepción (G1.6):** `closeButton: false` la oculta, y es solo para diálogos de confirmación que tienen sus propios botones de salida (Confirm, G1.7). Hecho en la G1.6, también con forma declarativa (`<mimi-dialog>`): el detalle está en la tabla del Grupo 1. **`open()` abre después del render en curso** (después de la G1.7): pedido desde un ítem de menú, el menú ya devolvió el foco a su botón y el diálogo lo devuelve ahí al cerrar. `afterClosed()` funciona desde el primer momento, y un diálogo cerrado antes de abrirse (`close()`, `closeAll()`) no llega a abrirse y emite su resultado. **Apilados:** los diálogos de abajo llevan `aria-hidden` mientras el de arriba está abierto, y solo el de arriba queda para los lectores de pantalla.
- **Confirm** (G1.7): `injectMimiConfirm()` devuelve `confirm(opciones): Promise<boolean>`, para escribir `if (await this.confirm({ … }))`. Se llama al declarar la propiedad (contexto de inyección; dentro de un método falla con NG0203), y así toma el injector del componente: los textos de `provideMimiConfirmText` de su ruta o del propio componente funcionan sin pasar nada. Opciones: `title` (obligatorio, nombre accesible), `description`, `confirmText`, `cancelText`, `tone` (`'primary' | 'danger'`, los nombres de tono de la librería; por defecto `primary`), `icon` (una plantilla con un `<svg>`; sin ella no hay círculo ni ícono por defecto) y `class` (panel; gana también al ancho). Promise y no Observable: es un solo valor que siempre llega (`true` solo si se confirmó; `false` con Cancelar, Escape, una navegación, `closeAll()` o si se destruye el componente que pregunta), y un Observable no dejaría claro cuándo abre. Por dentro abre un Dialog con `role: 'alertdialog'`, `closeButton: false` y el clic en el fondo apagado (como AlertDialog); Escape cancela. Foco inicial: Cancelar con `danger`, Confirmar con `primary`. Como todo Dialog, se abre después del render en curso (ver Dialog). Sin acción asíncrona con «cargando» (pendiente, plan).
- **Toast** (G1.8): estilo Sonner + Vuesax, con los tokens semánticos de la T.1. Sin glow: el diseño no lo usa (los sólidos llevan `--mimi-shadow-<tono>-hover`); esta línea decía `--mimi-glow` antes de construirlo. `injectMimiToast()` devuelve `toast(título, opciones?)` con `success`, `info`, `warning`, `error` (tono `danger`, anunciado con prioridad), `promise(promesa | () => promesa, { loading, success, error })` y `dismiss(id?)`; cada llamada devuelve el id. Opciones: `description`, `action` (`{ label, onClick }`), `duration` (ms; `Infinity` = no se cierra solo), `icon` (plantilla o `false`), `variant` (`'outline' | 'solid'`; sin tono, solid se ve como outline), `id` (reemplaza un toast abierto) y `class`. Sin tono (`toast()`), la tarjeta con la campana del diseño y sin `data-tone` (no hay un tono «neutral» con nombre). Se llama al declarar la propiedad (contexto de inyección). **Sin `<Toaster />`:** la pila se crea sola la primera vez que se muestra un toast, al final de `body`, como popover (`popover="manual"`) para quedar encima de los diálogos; si otro popover se muestra después, la pila se vuelve a mostrar al llegar un toast (salvo con el foco dentro). **Sin posición por toast** (decisión de la G1.8): obligaría a manejar varias pilas a la vez. Una sola pila por aplicación: `provideMimiToast({ position, duration, hotkey })` (archivo `toast-config.ts`, opcional) fija la posición (`bottom-right` por defecto; las otras cinco no están en el diseño), la duración (6000 ms) y la tecla (F8). Los anuncios los hace el `LiveAnnouncer` de `@angular/cdk/a11y` (su región existe desde `injectMimiToast()`; varios seguidos se anuncian juntos). Toasts con acción: sin tiempo (WCAG 2.2.1). F8 lleva el foco al más nuevo y Escape lo devuelve (sin llegar al Dialog de abajo). El tiempo se detiene con el puntero, con el foco dentro y con la pestaña oculta. Pila del diseño: colapsada (12px y 5 % por toast, tres visibles; los demás `inert`), expandida con el puntero o el foco (8px entre toasts), cinco como máximo (sale el más viejo sin acción ni foco). Alto natural con mínimo de 68px. En SSR no muestra nada.
- **Tabs** (G1.9): indicador animado que se desliza a la pestaña activa, estilo HeroUI. `<mimi-tabs [(value)] variant="underline | pill" [preserveContent] aria-label>`; cada pestaña es un `<ng-template mimiTab="valor" label [count] [disabled]>` cuyo contenido es el panel, diferido (no se crea hasta mostrarse; sin `preserveContent` se destruye al ocultarse). `<ng-template mimiTabLabel="valor">` (opcional) para etiquetas con ícono; si no tiene texto visible, `label` es su nombre accesible (aviso en desarrollo si falta). `class` va al contenedor de las pestañas y `panelClass` a los paneles. Sin valor se elige la primera habilitada (y se escribe en el modelo); un valor sin pestaña se conserva. Deshabilitadas enfocables con las flechas pero no elegibles (como APG y el Dropdown Menu). Activación automática. **Sin `tone`:** el diseño no tiene tonos para Tabs y el contador es fijo en `info-soft` (excepción a «Variante y tono», plan D6). **Columnas iguales:** el indicador se posiciona solo con CSS en porcentajes (`--mimi-tabs-count` y `--mimi-tabs-index`), sin medir, y se recoloca solo al cambiar la ventana o la letra; anchos distintos por pestaña, y padding o gap propios en la píldora, no están soportados (D6). Vertical: fuera por ahora (D6). El panel visible lleva el `tabindex="0"` de aria (una parada más si tiene campos).
- **mimi-toolbar** (G1.10): horizontal o vertical. Píldora translúcida, herramienta activa sobre un disco, anillo animado en hover y selección, tooltips, flechas, separadores, contadores y estado presionado. Patrón toolbar de WAI-ARIA (una sola parada de Tab, flechas entre ítems) con el `FocusKeyManager` del CDK, no con aria (excepción de la sección 4). `<mimi-toolbar aria-label [orientation] [(value)] [(pressed)] (activate) [wrap]>` con **botones del usuario** `<button mimiToolbarItem="valor" kind="tool | toggle | action" [disabled]>`: el contenido, el `aria-label` y un `mimiTooltip` van en el mismo botón. `tool` es la herramienta activa (`value`, una a la vez; volver a elegirla no la desmarca; un valor sin botón se conserva), `toggle` un interruptor (`pressed`), `action` (por defecto) solo emite; `activate` sale en cada activación, después de actualizar el estado. `tool` y `toggle` llevan `aria-pressed`, como el diseño (un `radiogroup` con nombre llegará con los grupos, D6). Deshabilitados enfocables (`aria-disabled`, nunca `disabled` nativo, también si se escribe estático); su clic se frena en la fase de captura, antes que el `(click)` del usuario y que `activate`. `<mimi-toolbar-separator />` (perpendicular a la toolbar, la lee por DI) y `<span mimiToolbarCount>` (decorativo, `aria-hidden`: el número va también en el `aria-label`). `class` va a la píldora y la posiciona (sin entrada de posición). Avisos en desarrollo: sin nombre, botón sin nombre (sin contar el contador), valores repetidos o vacíos y contador que no está en el `aria-label`. Límite: los botones tienen que estar escritos dentro de `<mimi-toolbar>` (también en `@if` o en un `div`), no en la plantilla de otro componente. **Pantallas chicas (5.17a):** sin `wrap`, una toolbar horizontal más ancha que la pantalla no se parte ni se achica (los botones no se encogen); se usa `wrap` o un contenedor con `overflow-x-auto`, como el ejemplo del showcase.
- **Pagination** (G1.11): componente independiente, en píldora compacta como mimi-toolbar: `[←] [input de página] / total [→] | registros por página`. La usa Data Table.
  - **API:** `<mimi-pagination [(page)] [(pageSize)] [total] [pageSizeOptions] [size] [variant] [disabled] aria-label (paginate)>`. `total` es el número de **registros** (las páginas salen de `total` y `pageSize`); `page` empieza en 1. `(paginate)` emite `{ page, pageSize }` una vez por acción del usuario (no se llama `change`: el `change` nativo del campo subiría al host). `pageCount` (signal público). `size`: `sm` (por defecto, como el diseño: controles del alto de control `sm`) o `default` (los nombres de tamaño de Button e Input; antes de la 0.2.0 se llamaba `md`). `variant`: `inline` o `floating`, que solo cambia la sombra (la posición va en `class`, como en la toolbar).
  - **Semántica:** `role="navigation"` con nombre (texto del token), paradas de Tab normales (son tres o cuatro controles distintos y el campo necesita sus flechas; un foco itinerante chocaría). ← y → son `<button type="button">` con las clases de Button (sin `mimiBtn`, que pondría `disabled` nativo) y `aria-disabled` en los extremos: el foco no se pierde y Enter o Espacio no hacen nada.
  - **Campo:** `input[mimiInput]`, solo dígitos, «Página, de 12», «/ 12» oculto al lector. Enter aplica; inválido: borde y anillo de error y un globo «Entre 1 y N» (`role="alert"`, enlazado con `aria-describedby`, recreado en cada intento). Salir del campo aplica una página válida o vuelve a la actual sin error; Escape vuelve a la actual; ↑/↓ pasan de página. Al enfocar selecciona el número. Enter no envía el formulario que la contenga.
  - **Registros por página:** con `pageSizeOptions`, un Select (`side="top" align="end" [matchWidth]="false"`) **dentro de `@defer (on immediate)`**: Select, aria y el overlay solo se cargan si hay selector. El marcador mide lo mismo que el Select (sin salto). Al cambiar el tamaño, se mantiene visible el primer registro (como MatPaginator). Un `pageSize` que no está en las opciones se agrega (aviso en desarrollo). Debajo de 640px se oculta (`data-slot="page-size"`).
  - **El valor vive en Mimi:** una `page` fuera de rango que llega de fuera (por ejemplo, `total` en 0 mientras cargan los datos) se pinta acotada sin reescribir el modelo; `pageSize` 0, `NaN` o `total` negativo no rompen nada.
  - **Anuncio:** «Página 3 de 12» con el `LiveAnnouncer` del CDK (`polite`), solo en los cambios del usuario y si la página cambia. `disabled` no saca el foco: los botones quedan `aria-disabled`, el campo `readonly` y una elección en el selector se descarta.
  - **Textos:** `MIMI_PAGINATION_TEXT` (inglés) y `MIMI_PAGINATION_TEXT_ES`, en `pagination-texts.ts`.

**Grupo 2 → v0.3.0: entradas avanzadas**

| Orden | Componente                                 | Inspiración                                | Depende de                                     |
| ----- | ------------------------------------------ | ------------------------------------------ | ---------------------------------------------- |
| 1     | Toggle Group                               | shadcn/Spartan                             | —                                              |
| 2     | Number Input                               | PrimeNG (InputNumber) y HeroUI             | `utils/control-styles`, `FormValueControl`     |
| 3     | Password (mostrar/ocultar y medidor)       | PrimeNG (Password)                         | Input                                          |
| 4     | Input Mask                                 | PrimeNG (InputMask)                        | Input                                          |
| 5     | Input OTP                                  | shadcn                                     | `utils/control-styles`                         |
| 6     | Tags Input                                 | HeroUI y PrimeNG (Chips)                   | Badge, Input                                   |
| 7     | Slider (rango doble)                       | shadcn y HeroUI                            | — (la burbuja usa los tokens de Tooltip; G2.7) |
| 8     | Combobox/Autocomplete (múltiple con chips) | shadcn (Combobox) y PrimeNG (AutoComplete) | Popover, lógica de lista de Select, Tags Input |
| 9     | Date Picker y Date Range                   | shadcn (Calendar) y PrimeNG                | Popover, Button                                |
| 10    | Progress (barra y circular)                | shadcn y HeroUI                            | —                                              |
| 11    | File Upload                                | PrimeNG (FileUpload) y Vuesax              | Button, Progress                               |
| 12    | Color Picker                               | PrimeNG (ColorPicker) y HeroUI             | Popover, Input (el tono es propio: G2.12)      |

**Grupo 3 → v0.5.0: datos** (era la 0.4.0; la 0.4.0 es de los Blocks, ver «Blocks»)

| Orden | Componente                                                          | Inspiración                           | Depende de                                         |
| ----- | ------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------- |
| 1     | Tree                                                                | PrimeNG (Tree)                        | Checkbox                                           |
| 2     | Sortable List                                                       | `@angular/cdk/drag-drop`              | `@angular/cdk/drag-drop`, manejo de teclado propio |
| 3     | Command (⌘K; también el buscador de la documentación, tarea 5.8)    | shadcn (Command)                      | Dialog, lógica de lista de Combobox                |
| 4     | Data Table (ordenar, filtrar, paginar, seleccionar, columnas fijas) | shadcn (Data Table) y PrimeNG (Table) | Checkbox, Dropdown Menu, Pagination, Input         |

**Grupo 4 → v0.6.0: estructura** (era la 0.5.0)

| Orden | Componente   | Inspiración                | Depende de                              |
| ----- | ------------ | -------------------------- | --------------------------------------- |
| 1     | Accordion    | shadcn/Spartan             | `@angular/aria/accordion` (a confirmar) |
| 2     | Sheet/Drawer | shadcn (Sheet y Drawer)    | Dialog                                  |
| 3     | Stepper      | PrimeNG (Stepper) y Vuesax | Button, Progress                        |

- **Sheet/Drawer:** flotante, como el de shadcn: separado de los bordes de la pantalla, con el radio de las tarjetas y, en la versión inferior, una barra de agarre.

**Grupo 5: según lo que pidan los usuarios** (sin orden fijo; revisado en la G2.P: **sigue sin versión** hasta la G4.P, decidido por el usuario el 05/11/2026)

| Componente           | Inspiración              | Depende de                |
| -------------------- | ------------------------ | ------------------------- |
| Sidebar de dashboard | shadcn                   | Sheet (en móvil), Tooltip |
| Time Picker          | PrimeNG y HeroUI         | Popover                   |
| Carousel             | shadcn                   | —                         |
| Image Preview        | PrimeNG (Image) y Vuesax | Dialog                    |
| Timeline             | PrimeNG                  | —                         |
| Resizable            | shadcn                   | —                         |
| Hover Card           | shadcn                   | Popover                   |
| Rating               | PrimeNG y HeroUI         | `FormValueControl`        |

### Tema

En mimi-ng hay una página de tema sencilla (sección 11, «Página "Tema"»; plan, 5.2), sin edición por componente. El Theme Studio completo es un proyecto aparte, construido con Mimi como lo usaría cualquier usuario cuando el catálogo esté completo: `docs/futuro/theme-studio.md`. **Los tokens siguen siendo obligatorios** en cada componente (sección 13, «Reglas»): son el contrato que usará el Studio.

**El color es global en Mimi:** el preset cambia los colores del tema (`colors` y `darkColors`) para todos los componentes; el color de un solo componente se pone en el CSS, con su versión clara y oscura (sección 6.2). Los tamaños SM, MD y LG de control también son globales: los comparten todos los controles (Button, Input, Select…).

### Blocks

Pantallas completas que la CLI copia como cualquier componente (`ng g mimi login-01`), con los componentes que usan. Diseñados (`docs/design/Block <nombre>.dc.html` y el índice `Mimi F6 Blocks.dc.html`): `login-01`, `login-02`, `signup-01`, `otp-01`, `settings-01`, `dashboard-01`, `table-01` y `pricing-01`. **Divididos en tres versiones** (decidido por el usuario el 05/11/2026 en la G2.P, opción (b), con un ajuste por dependencias): la **v0.4.0** son los seis que solo usan componentes ya publicados (`login-01`, `login-02`, `signup-01`, `otp-01`, `settings-01` y `pricing-01`) y el tipo `block` del registro; la **v0.5.0**, el Grupo 3 y `table-01` (usa Data Table); la **v0.6.0**, el Grupo 4 y `dashboard-01`. **Ajuste (pendiente de revisión del usuario):** el diseño de `dashboard-01` tiene, además de la Data Table, una barra lateral fija (`aside` de 232px, como la Sidebar de dashboard del Grupo 5) y, en móvil, un botón «Abrir menú» que pide un cajón (Sheet, G4.2), así que espera al Grupo 4; la barra lateral se escribe dentro del Block, como la dibuja el diseño, sin depender de la Sidebar (el Grupo 5 sigue sin versión). Alternativa: `dashboard-01` en la v0.5.0, con la barra inferior del diseño como única navegación móvil y sin el botón «Abrir menú». Ningún otro Block usa componentes del Grupo 4, del Grupo 5 ni posteriores (revisado en los diseños el 05/11/2026).

### Mimi Effects

Prioridad baja, después del Grupo 3. Inspirados en Magic UI: Animated Theme Toggler, Terminal, Marquee, Bento Grid, Number Ticker, Border Beam / Shine Border, Magic Card, Blur Fade, Text Animate, Animated List, Confetti, Ripple, fondos (Grid y Dot Pattern), marcos Safari/iPhone, File Tree y Code Comparison.

- Todos respetan `prefers-reduced-motion`.
- Sin Globe, Icon Cloud ni partículas 3D: dependencias pesadas.
- Si se porta código de Magic UI (MIT), su aviso va en `THIRD_PARTY_NOTICES.md`.
- El showcase usa el Animated Theme Toggler y la Terminal cuando existan.

## 5. Uso para el desarrollador final

### Comandos

```bash
# Hoy
ng add @mimi-ng/cli                 # instala y ejecuta init
ng g mimi button                    # uno (tras init: schematicCollections)
ng g mimi button input card         # varios
ng g mimi                           # menú para elegir (terminal interactiva)
ng g @mimi-ng/cli:ui button         # forma larga: si Mimi no está en schematicCollections

# Más adelante
pnpm mimi add button                # comando mimi (tarea 5.3)
pnpm mimi list                      # disponibles e instalados (5.3)
pnpm mimi theme                     # crea mimi.preset.ts (5.1 y 5.3)
pnpm mimi update button             # combina tus cambios con la versión nueva (5.4)
ng g @mimi-ng/cli:theme --palette=violet --radius=lg   # (5.1)
```

**Textos del sitio y de los diseños:** los ejemplos de comandos usan solo `ng add @mimi-ng/cli` y `ng g mimi <nombre>` (con la forma larga `ng g @mimi-ng/cli:ui <nombre>` donde se explique), siempre con componentes que ya existan en el registro, y las rutas reales: `src/app/components/ui/<nombre>/<nombre>.ts`, importado como `@/components/ui/<nombre>`. Vale también para los diseños de `docs/design/` cuando sus textos pasan al código.

El sitio solo muestra comandos que funcionan hoy, salvo los marcados como versión futura: una prueba del showcase (`apps/docs/src/app/commands.spec.ts`) falla si aparece `mimi add`, `mimi list` o `mimi theme`, o `mimi update` sin marcarlo como futuro. La misma prueba falla si aparece `ng g ui` (sin el paquete): funciona, pero no se muestra; la forma larga `ng g @mimi-ng/cli:ui` sí. `InstallCommand` muestra `ng g mimi <nombre>` y la forma larga; la pestaña de pnpm vuelve con la tarea 5.3.

**Nombre del schematic: `mimi`, con `ui` como alias** (`collection.json`; el código sigue en `src/ui/`). `ng g ui` no dice de qué librería es y otras (Spartan) también tienen un schematic `ui`. Además, la CLI de Angular (22, `commands/generate`) recorre `schematicCollections` en orden y **descarta los schematics cuyo nombre ya apareció en una colección anterior, con sus alias**, antes de buscar el pedido. Si el schematic se llamara `ui` con alias `mimi` y otra colección con un `ui` fuera antes, `ng g mimi` fallaría. Con el nombre `mimi`, `ng g mimi` funciona siempre que Mimi esté en `schematicCollections`; `ng g ui` va a Mimi solo si ninguna colección anterior tiene un `ui`. Con el paquete explícito (`ng g @mimi-ng/cli:ui`) solo se busca en Mimi y el alias resuelve.

**Cuándo hace falta la forma larga:** si Mimi no está en `schematicCollections` (el usuario editó la lista u otra herramienta la reemplazó). Sin `ng add` no funciona ninguna de las dos: falta `mimi.json` y la CLI pide ejecutar `ng add` primero.

El comando `mimi` es una capa delgada que llama a los schematics. El schematic `mimi` acepta varios nombres (opción `components` de tipo `array` con `"$default": { "$source": "argv", "index": 0 }`: la CLI de Angular la registra como posicional variádica, `mimi [components ..]`) y, sin nombres y con terminal interactiva, muestra un `x-prompt` de selección múltiple (`"type": "list"`, `"multiselect": true`).

### Qué hace `init` (y `ng add`)

`ng add @mimi-ng/cli` ejecuta el schematic `ng-add`, que corre `init` con las mismas opciones. `ng-add` tiene su propio esquema (`ng-add/schema.json`, tarea 0.1.1-1): antes de instalar el paquete, `ng add` no conoce el esquema y pasa `--icons=false` y `--icons=true` como texto, así que ahí `icons` acepta `boolean` o `string` (con la pregunta declarada como `confirmation`) y `ng-add` convierte `"true"`/`"false"` antes de llamar a `init`, cuyo esquema sigue siendo booleano. Opciones: `--project` (si el workspace tiene varias aplicaciones), `--icons` (instala `@lucide/angular`; por defecto no, y con terminal interactiva lo pregunta: _"¿Quieres instalar @lucide/angular para tus íconos? (recomendado)"_) y `--overwrite`.

**Primero verifica, sin modificar nada.** Si algo falla, termina con un mensaje claro y el proyecto queda como estaba:

1. Proyecto: el de `--project`; si no, la única aplicación de `angular.json`; si hay varias, pide `--project`.
2. Angular 22 o superior (`@angular/core` en `package.json`).
3. Tailwind 4: `tailwindcss` con versión mayor ≥ 4, y `@import "tailwindcss"` en el CSS global. El CSS global se busca en `angular.json` (`build` → `options` → `styles`, solo `.css`), no se supone `src/styles.css`. Si falta, explica cómo agregarlo (`ng add tailwindcss` o la guía de Tailwind para Angular); no lo instala.

**Después configura:**

4. Carpeta de componentes: `aliases.components` de `mimi.json` si existe; si no, `<sourceRoot>/app/components/ui` (`src/app/components/ui`).
5. Copia el tema (`theme/theme-base.css`, `types.ts`, `provider.ts`, `index.ts`) y las utilidades base (`utils/cn.ts`, `utils/control-styles.ts`) a esa carpeta. `utils/field-state.ts` llega con los componentes que lo necesitan. No hay `utils/index.ts`: arrastraría `@angular/forms` a quien use solo Button.
6. Agrega `@import "<ruta>/theme/theme-base.css";` justo después del `@import "tailwindcss"`. **No** agrega `@source`: en el proyecto del usuario los componentes están dentro de `src/` y la detección automática de Tailwind 4 ya los escanea (el `@source` solo hace falta en el showcase, donde los componentes viven en `packages/ui-core/src`). Excepción: si el import usa `source(none)`, Tailwind no escanea nada por su cuenta, así que agrega `@source "<ruta a la carpeta>";` y lo avisa.
   6b. **Excluye `.mimi/` del escaneo (M.19, en la versión siguiente a la 0.3.0):** sin `source(none)`, la detección automática de Tailwind escanea todo el workspace salvo lo que ignora git, y `.mimi/` va en git; sin excluirla, el CSS lleva las clases de las copias originales de `.mimi/base/` aunque el usuario ya las haya cambiado o quitado (comprobado con Tailwind 4.3.3: una clase que solo está en `.mimi/base/` entra en el CSS sin la línea y no con ella). Agrega, después del `@import "tailwindcss"` (junto al del tema), `@source not "<ruta del CSS a .mimi>";` (con `src/styles.css`, `@source not "../.mimi";`), si no está ya (con comillas simples o dobles). **Solo con Tailwind 4.1 o superior** (`@source not` llegó en la 4.1): manda la versión de `node_modules/tailwindcss`; sin instalar, el rango de `package.json`, donde solo un rango exacto o con `~` en la 4.0 (`4.0.5`, `~4.0.17`) cuenta como 4.0 (`^4.0.17` instala la última 4.x). Con Tailwind 4.0 no escribe la línea: avisa que hay que agregarla al actualizar Tailwind. Código: `utils/tailwind.ts`. Pruebas: `init.spec.ts`.
7. Agrega el alias `"@/components/ui/*": ["./<carpeta>/*"]` al `tsconfig.json` con `JSONFile` de `@schematics/angular`, que conserva los comentarios (el tsconfig de Angular es JSONC) y los `paths` existentes. Sin `baseUrl` (TypeScript 6 lo depreca). Si el tsconfig del build (`options.tsConfig`, normalmente `tsconfig.app.json`) define su propio `compilerOptions.paths`, ese reemplaza al de la raíz, así que el alias va también ahí. Si el alias ya existe con otro valor, avisa y no lo toca. **Las importaciones no se reescriben:** el alias siempre es `@/components/ui/*`; lo configurable es la carpeta.
8. Agrega `clsx`, `tailwind-merge` y `class-variance-authority` a `dependencies` con las versiones del registro (si ya están, se dejan). `@angular/cli` los instala con el gestor de paquetes del proyecto, que detecta por el lockfile.
9. Crea `mimi.json` si no existe.
10. Muestra qué configuró y el siguiente paso: `ng g mimi button`.

**Reglas comunes:**

- Rutas siempre con "/" en lo que escribe (CSS, tsconfig, `mimi.json`), también en Windows.
- Idempotente: ejecutarlo dos veces no duplica nada ni falla, y no vuelve a instalar.
- Archivos: antes de escribir revisa el árbol, con la misma regla que `mimi` (ver «Qué hace `mimi`», punto 4): «modificado por el usuario» es distinto de su base en `.mimi/base/`, no de la plantilla. Nunca salta el error "merge conflicted".
- Si no cambió nada (archivos, CSS, tsconfig, `angular.json`, `mimi.json` ni dependencias), dice "Mimi ya estaba configurado; no hubo cambios." en lugar de repetir los pasos siguientes.
- **`schematicCollections`** (para `ng g mimi button`, tarea 3.6): `cli.schematicCollections` reemplaza al valor por defecto de la CLI de Angular, así que si no existe se crea con `["@schematics/angular", "@mimi-ng/cli"]`, en ese orden (solo con Mimi, el usuario perdería `ng g component`). Si existe, Mimi se agrega al final sin quitar nada. El de un proyecto gana al del workspace, así que si el proyecto elegido tiene el suyo, también va ahí. La CLI busca el nombre en las colecciones en orden y gana la primera (descartando antes los nombres repetidos, ver «Comandos»): una prueba imita esa búsqueda y comprueba que `mimi` y `ui` resuelven a Mimi, `component` a `@schematics/angular`, que con otra colección con un `ui` antes de Mimi `mimi` sigue yendo a Mimi, y que ningún nombre ni alias de Mimi (`ng-add`, `init`, `mimi`, `ui`) choca con los de `@schematics/angular`, ocultos incluidos.
- `init` también guarda la copia original de los archivos que escribe en `.mimi/base/` (misma regla que `mimi`).

### Qué hace `mimi` (alias `ui`)

`ng g mimi button input form-field` (o `ng g @mimi-ng/cli:ui …`). Opciones: los nombres y `--overwrite`.

**Primero verifica, sin modificar nada:**

1. **Requiere init:** sin `mimi.json`, falla con "Mimi no está configurado en este proyecto (falta mimi.json). Ejecuta primero: ng add @mimi-ng/cli".
2. **Nombres:** sin nombres (y sin terminal para preguntar) explica cómo usarlo. Un nombre desconocido falla con la lista de disponibles y, si se parece a uno (distancia de edición ≤ 2 o prefijo), lo sugiere: "¿Quisiste decir button?". La lista del `x-prompt` va escrita en `ui/schema.json` y la prueba de consistencia exige que sea la de los ítems `component` del registro. No se usa `enum`: con él, la validación del esquema rechazaría el nombre antes de poder sugerir el parecido.
3. **Resolución:** los pedidos y sus `registryDependencies`, de forma transitiva, sin duplicados y con las dependencias primero (`form-field` trae `utils/cn` y `utils/field-state`). **Además, siempre, los ítems que copia init** (`INIT_ITEMS` en `init/items.ts`: el tema, `utils/cn` y `utils/control-styles`) como dependencias implícitas (decisión A de la 0.2.0): si faltan se vuelven a copiar, si están en una versión anterior sin modificar se actualizan (los componentes nuevos usan tokens nuevos del tema) y si están modificados no se tocan.
   3b. **Todo o nada por ítem** (decisión B de la 0.2.0). La unidad es el ítem del registro. Antes de escribir, cada archivo se clasifica: nuevo, igual a la plantilla, formateado (igual a su base de esta versión), viejo (igual a su base de una versión anterior), modificado sobre una versión anterior o modificado sobre esta versión (o sin base). Un ítem con algún archivo **modificado sobre una versión anterior** queda **bloqueado**: no se escribe ninguno de sus archivos, su base y el manifiesto no cambian, y `mimi.json` conserva su versión. También se bloquea todo ítem que lo tenga en sus `registryDependencies` (transitivo), instalado o no: Confirm no se actualiza ni se agrega si Button está bloqueado, porque no compilaría. Los ítems implícitos de init bloqueados no bloquean a los componentes (no están en sus dependencias). Un archivo modificado sobre la versión actual no bloquea: se omite con «Omitido…» y el resto del ítem se escribe. `--overwrite` reemplaza todo lo pedido; el tema solo si está en una versión anterior (un cambio del usuario sobre la versión actual del tema se respeta siempre).

**Después escribe:**

4. **Archivos** en la carpeta de `mimi.json`. Los componentes van sin `components/` (`<carpeta>/button/button.ts`), para que `@/components/ui/button` los encuentre; utils y tema conservan su carpeta. Antes de escribir revisa el árbol. Si el archivo ya existe:
   - igual a la plantilla → al día;
   - igual a su base en `.mimi/base/` → el usuario no lo tocó. Si la base es de esta versión, la diferencia con la plantilla es solo de formato: al día. Si es de una versión anterior, se actualiza y lo dice ("button actualizado de 0.1.0 a 0.2.0");
   - distinto de su base, o sin base → modificado por el usuario: se omite con aviso; `--overwrite` lo reemplaza.
   - **`--overwrite` reemplaza siempre** (M.11, 05/11/2026, decidido por el usuario: era un error), también un archivo «formateado» de la misma versión que es distinto de la plantilla; antes se informaba «sin cambios» y no había forma de reponerlo sin subir la versión. Los ítems implícitos (el tema) siguen sin reemplazarse si el usuario los cambió.

   **Por qué contra la base y no contra la plantilla:** la CLI de Angular pasa el Prettier del proyecto por los archivos que escriben los schematics. Si el Prettier del usuario tiene otro estilo que ui-core, el archivo y su base quedan reformateados igual y distintos de la plantilla; compararlos con la plantilla los haría pasar por modificados en cada ejecución (lo encontró la prueba de la tarea 3.7). Nunca salta "merge conflicted".

5. **`.mimi/base/`** (en la raíz del workspace, con la misma estructura: `.mimi/base/button/button.ts`, `.mimi/base/utils/cn.ts`): la copia original de cada archivo, que usará `mimi update` (tarea 5.4). Se escribe cuando el archivo del proyecto queda igual a la plantilla (creado, actualizado, reemplazado con `--overwrite`, o idéntico y todavía sin base). Si el archivo se omitió por estar modificado, su base **no** cambia. **`.mimi/manifest.json`** guarda con qué versión de Mimi se escribió cada base (`{ "files": { "button/button.ts": "0.1.0", … } }`); con eso se distingue un archivo formateado (misma versión) de uno que hay que actualizar (versión anterior).
6. **`mimi.json` → `components`:** `{ "button": { "version": "0.1.0" } }` para cada componente pedido o traído como dependencia, solo si todos sus archivos quedaron iguales a la plantilla; si alguno se omitió, se conserva lo que había.
7. **Dependencias:** las `dependencies` de los ítems, con la versión del registro, si el proyecto no las tiene. Las `peerDependencies` (como `@angular/forms`) solo si faltan; las de `@angular/*` con el mismo rango que el `@angular/core` del proyecto, para que no queden desalineadas. Se instalan con el gestor de paquetes del proyecto.
8. **CSS global:** los `cssImports` de los ítems (Popover: `@angular/cdk/overlay-prebuilt.css`) se agregan al CSS de `mimi.json` → `tailwind.css`, una sola vez (con comillas simples o dobles cuenta como ya puesto). Van justo después del `@import` del tema o, si no está, del de Tailwind: los `@import` tienen que ir antes que cualquier otra regla, y así quedan junto a los de Mimi. Si no encuentra el archivo o el `@import` de Tailwind, avisa con la línea para agregarla a mano. Los ítems sin `cssImports` no tocan el CSS.
9. **Mensaje final:** qué se agregó o reemplazó, qué se omitió y por qué (con la sugerencia de `--overwrite`), qué dependencias se instalan, y que `.mimi/` debe quedar en git. «actualizado de X a Y» solo si se escribió el ítem entero. Un ítem bloqueado da un aviso con el motivo y la salida: «&lt;ítem&gt; no se actualizó a &lt;v&gt; porque modificaste &lt;rutas&gt;. No se cambió ninguno de sus archivos, para no mezclar versiones. Para actualizarlo: guarda tus cambios (por ejemplo, en git), vuelve a ejecutar el comando con --overwrite y aplícalos de nuevo. La versión de Mimi que modificaste está en .mimi/base/&lt;carpeta&gt;/, para comparar.» (en el tema agrega que los componentes nuevos usan sus tokens); y para los que dependen de él: «confirm no se actualizó a &lt;v&gt;: necesita button &lt;v&gt;, que no se actualizó (ver el aviso de button)» o «confirm no se agregó: …».

**Límites conocidos de la 0.2.0:** las dependencias de npm y los `@import` se calculan antes de decidir los bloqueos (un Confirm bloqueado igual agrega `@angular/cdk` y el `@import` del overlay; es inofensivo). Si el proyecto ya declara `@angular/cdk` en cualquier rango (por ejemplo, 22.1), la CLI no lo cambia, y agrega `@angular/aria` en la versión exacta de ese cdk. En la 0.2.0 tampoco avisaba; desde la 0.3.0 avisa (abajo).

**Versión mínima de cdk y aria (M.4, desde la 0.3.0; decidido por el usuario el 05/11/2026: solo avisar).** `ng g mimi` no cambia un `@angular/cdk` ni un `@angular/aria` que el proyecto ya tenga (se actualizan con `ng update`, junto con el resto de Angular), pero avisa si quedan por debajo del mínimo que pide el registro para los ítems que se agregan: hoy **22.2.4** (el de `^22.2.4`; con 22.2.3, Combobox y Select lanzan `NG0950`, spec 4, «#33974»). El mínimo sale de los rangos del registro, no está escrito en el código; un ítem que pide aria pide también ese cdk. Qué se compara: si el paquete está declarado y en `node_modules`, la versión instalada; si no (declarado sin instalar, o lo que la CLI agrega ahora con el rango de `@angular/core` o la versión exacta del cdk), se avisa solo si el rango **no puede** llegar al mínimo (`22.2.3` fijo, `~22.1.0`, `^21.0.0`; `^22.0.0`, `~22.2.0` y `^23.0.0` no avisan, y lo que no se entiende, como `latest`, tampoco: sin falsas alarmas). El aviso nombra cada paquete con su versión y de dónde sale, y termina con `ng update` de los que el proyecto tenga o la CLI agregue (sin aria, solo `@angular/cdk`; con aria, los dos, porque aria pide el cdk exacto). Un componente sin cdk ni aria no avisa. Pruebas: `ui.spec.ts`, «M.4».

**Aviso si Tailwind escanea `.mimi/` (M.19, en la versión siguiente a la 0.3.0; decidido por el usuario el 06/11/2026: solo avisar).** Los proyectos instalados con la 0.3.0 o antes no tienen la exclusión de `init` (paso 6b). `ng g mimi` **no modifica** esa parte del CSS: si el CSS de `mimi.json` → `tailwind.css` existe, su `@import "tailwindcss"` no usa `source(none)`, falta `@source not` hacia `.mimi` (comillas simples o dobles) y el Tailwind del proyecto es 4.1 o superior (la misma regla que init), avisa al final del resumen, como el de cdk y aria, con la línea exacta: «Tailwind escanea .mimi/base/ (las copias originales de Mimi) y genera CSS de clases que quizá ya no usas. Agrega a &lt;css&gt;, después de @import "tailwindcss": `@source not "../.mimi";`». Con Tailwind 4.0 no avisa (no entiende la directiva; init ya lo explicó). Pruebas: `ui.spec.ts`, «aviso si Tailwind escanea .mimi/».

Idempotente: `ng g mimi button` dos veces no cambia nada ni vuelve a instalar.

**Limitación conocida:** una sola configuración de Mimi por workspace (`mimi.json` y `.mimi/` en la raíz). Varias aplicaciones con carpetas de componentes distintas no están soportadas por ahora: `init --project` configura la aplicación elegida y `mimi` usa la carpeta de `mimi.json`.

### `mimi.json`

```json
{
  "style": "mimi",
  "tailwind": { "css": "src/styles.css" },
  "aliases": {
    "components": "src/app/components/ui",
    "utils": "src/app/components/ui/utils",
    "theme": "src/app/mimi.preset.ts"
  },
  "components": {
    "button": { "version": "0.1.0" }
  }
}
```

`style` es el tema (`"mimi"`). La CLI no lo lee ni lo valida: cualquier valor se conserva tal cual (para la 0.1.0, ver la sección 12).

### `registry.json` (dentro de la CLI)

`packages/cli/src/registry.json`. Un ítem por componente, por util y para el tema. Los utils van por separado (`utils/cn`, `utils/control-styles`, `utils/field-state`): así Button no arrastra `@angular/forms`. El índice `utils/index.ts` no se entrega (el build lo excluye): arrastraría `@angular/forms` a quien use solo Button.

```json
{
  "suggestedDependencies": { "@lucide/angular": "^1.47.0" },
  "items": {
    "utils/cn": {
      "type": "util",
      "files": ["utils/cn.ts"],
      "dependencies": { "clsx": "^2.1.1", "tailwind-merge": "^3.7.0" }
    },
    "utils/field-state": {
      "type": "util",
      "files": ["utils/field-state.ts"],
      "peerDependencies": { "@angular/forms": "^22.0.0" }
    },
    "button": {
      "type": "component",
      "files": [
        "components/button/button.ts",
        "components/button/button.variants.ts",
        "components/button/index.ts"
      ],
      "dependencies": { "class-variance-authority": "^0.7.1" },
      "registryDependencies": ["utils/cn", "utils/control-styles"]
    }
  }
}
```

- **Versión:** el `registry.json` fuente no la tiene. El build la toma del `package.json` de la CLI (única fuente, tarea 3.8) y la escribe en `dist/registry.json`, que es lo que leen los schematics para el manifiesto (`.mimi/manifest.json`) y `mimi.json` → `components`.
- `files`: rutas relativas a las plantillas (`dist/templates`, copia de `ui-core/src/lib`).
- `dependencies` / `peerDependencies`: con la versión exacta del `package.json` de ui-core, nunca escrita a mano.
- **Desde el Grupo 1** (decisión 4.3): cada ítem declara en `peerDependencies` lo que sus archivos importan directamente (lo comprueba `registry.spec.ts`), y lo demás llega por sus `registryDependencies`. Así, `menu` declara `@angular/aria`; Dropdown Menu y Context Menu, `@angular/cdk` (aria les llega por `menu`); `utils/overlay`, Popover y Tooltip, `@angular/cdk`. Select, Tabs y mimi-toolbar seguirán la misma regla. Por ser `@angular/*`, la CLI instala `@angular/cdk` con el rango de `@angular/core` del proyecto. **`@angular/aria` va aparte (G1.3):** pide como peer la versión exacta de `@angular/cdk`, así que la CLI lee `node_modules/@angular/cdk/package.json` (con `tree.read`, que en `ng g` lee el disco) y lo instala en esa versión; si el cdk está en el `package.json` pero no instalado, con su mismo rango; si no hay cdk, los dos con el rango de `@angular/core`. Un cdk que solo llega como dependencia de otro paquete (no está en `node_modules/@angular/cdk` de la raíz, como pasa con pnpm) cuenta como «no hay cdk». ui-core los agrega a sus `peerDependencies` y el `package.json` raíz los instala para el showcase (tarea G1.1).
- `cssImports`: `@import` que el ítem necesita en el CSS global (Popover: `["@angular/cdk/overlay-prebuilt.css"]`, lo que pide la guía del CDK; sección 4, «Base técnica»). Los que usen `@angular/cdk/overlay` (Tooltip, menús, Select, Dialog…) lo declaran igual; con varios a la vez, se agrega una sola vez. Popover, Tooltip, Dropdown Menu y Context Menu traen además el util `utils/overlay` (`registryDependencies`). Un ítem de tipo `util` (como `menu`) puede vivir en `components/`: se copia a `components/ui/menu/` y se importa con `@/components/ui/menu`, pero no aparece en `ng g mimi` ni en `mimi.json → components`.
- `registryDependencies`: otros ítems que se copian con este (se resuelven en orden, dependencias primero).
- `suggestedDependencies` (nivel superior): paquetes opcionales que la CLI ofrece instalar, como `@lucide/angular` en `init`. Se llama así para no confundirlo con `optionalDependencies` de npm; su versión es la del `package.json` de la raíz (la que usa el showcase).

**Prueba de consistencia** (`registry.spec.ts`): lee lo que de verdad se empaqueta (`dist/templates`). Falla si un archivo listado no existe; si un archivo entregado no pertenece a un solo ítem o un archivo listado no se entrega; si el paquete trae pruebas o `utils/index.ts`; si una importación `@/components/ui/<x>` no está en `registryDependencies` o una relativa sale del ítem; si un paquete importado (también con `import type`; `@angular/forms/signals` cuenta como `@angular/forms`) no está declarado, o sobra uno; si una versión no coincide con ui-core; o si una `registryDependency` no existe. `@angular/core`, `@angular/common` y `rxjs` son implícitos (constante `IMPLICIT`); cualquier otro, como `@angular/cdk`, debe declararse. Así el registro no puede quedar desactualizado cuando cambia un componente.

### Uso en código

```ts
import { MimiButton } from '@/components/ui/button';
import { MimiInput } from '@/components/ui/input';
import { MimiCardImports } from '@/components/ui/card';
import { MimiFormFieldImports } from '@/components/ui/form-field';
```

```html
<button mimiBtn variant="outline" size="sm">Cancelar</button>

<mimi-card>
  <mimi-card-header>
    <mimi-card-title>Perfil</mimi-card-title>
  </mimi-card-header>
  <mimi-card-content>…</mimi-card-content>
</mimi-card>
```

## 6. Tema y tokens

### 6.1 Variables base (Tailwind 4)

El tema vive en `packages/ui-core/src/lib/theme/theme-base.css` (valores de `docs/design/tokens-mimi.css`). Contiene, en este orden: `@custom-variant dark`, `:root` (claro), `.dark` (oscuro), el bloque `prefers-reduced-motion` (6.6), `@theme inline`, `@utility mimi-transition`, `@layer base` y los `@keyframes` `mimi-spin` y `mimi-pulse`, y los del Grupo 2 (G2.0b): `mimi-caret` (cursor del Input OTP), `mimi-bob` (ícono de File Upload), `mimi-shake` (error del Input OTP) y `mimi-indet` (barra indeterminada de Progress; sale de `F5 Estructura`). No importa Tailwind ni carga fuentes.

`ui-core` lo publica en `exports` como `./theme.css`. El showcase depende de `@mimi-ng/ui-core` (`workspace:*`) y su `styles.css` queda así:

```css
@import 'tailwindcss' source(none);
@import '@mimi-ng/ui-core/theme.css';
@source '.';
@source '../../../packages/ui-core/src';
@source not '../../../packages/ui-core/src/**/*.spec.ts';
```

**Variables `--mimi-*`** (todas en `:root`; las marcadas con ◐ se redefinen en `.dark`):

| Grupo                     | Variables                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colores ◐                 | `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `input-background`, `ring`; tonos `success`, `warning` e `info`, cada uno con `-foreground` y `-soft-foreground`, y `destructive-soft-foreground`; `soft-mix` (cuánto tono lleva el fondo suave: 12 % en claro, 18 % en oscuro); `tooltip`, `tooltip-foreground`; `glass`, `glass-border` (píldoras translúcidas); `overlay` (fondo detrás de paneles y diálogos: `oklch(0.145 0 0 / 0.38)` en claro, `oklch(0 0 0 / 0.6)` en oscuro) |
| Derivados ◐ (`color-mix`) | `primary-hover`, `secondary-hover`, `destructive-hover` (en claro, hacia `foreground`: ver la nota de contraste abajo), `ring-soft`, `switch-off`; por tono, `<tono>-soft` (fondo suave), `<tono>-hover` y `<tono>-ring` (anillo) para `success`, `warning` e `info`; para las variantes con tono (V.1, fórmulas del diseño `F2 Tokens y Tonos`), `<tono>-soft-hover` (tono 22 % sobre el fondo, hover de soft), `<tono>-border` (tono 55 %, borde de outline) y `<tono>-subtle` (tono 10 %, hover de outline) para `primary`, `success`, `warning`, `info` y `destructive`; `destructive-ring` y `destructive-soft-bg`; `destructive-soft` es un alias de `destructive-ring` hasta la 1.0 (sección 12)                     |
| Sombras ◐                 | `shadow-card`, `shadow-primary`, `shadow-primary-hover`, `shadow-destructive`, `shadow-destructive-hover`, `shadow-neutral`, `shadow-neutral-hover`, `shadow-thumb` (pulgar del Switch, `0 1px 3px oklch(0 0 0 / .2)`, igual en los dos modos), `shadow-success`, `shadow-warning`, `shadow-info` (cada una con `-hover`), `shadow-popover` (menús, diálogos, toasts y píldoras) y el glow: `glow-primary`, `glow-success`, `glow-warning`, `glow-info`, `glow-destructive` y `glow` (= `glow-primary`)                                                                                                                                                                                                                     |
| Entradas avanzadas ◐      | Grupo 2 (G2.0b; valores de `tokens-mimi.css`; solo en el CSS, no en el preset): `range` (banda del rango de fechas), `track` (pista de Slider, Progress y el medidor de Password), `track-fill` (parte llena), `thumb` (pulgar del Slider, `oklch(1 0 0)` y `oklch(0.985 0 0)`), `chip` y `chip-foreground`, `dropzone`, `dropzone-active` y `dropzone-active-border` (File Upload), `strength-weak`, `strength-medium` y `strength-strong` (medidor de Password) y `selection` (sin uso en los componentes; lo usa el Theme Studio). Los componentes los leen con valor de respaldo (`var(--mimi-track, …)`, sección 6.2) para funcionar con un tema anterior a la 0.3.0; lo comprueba `group2-tokens.spec.ts`             |
| Fuentes                   | `font-sans` (`'Outfit', ui-sans-serif, system-ui, sans-serif`), `font-mono` (`'Geist Mono', ui-monospace, monospace`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Forma                     | `radius` (0.75rem), `radius-sm` (`min(radius / 2, 6px)`), `radius-card` (`min(radius + 4px, 24px)`), `badge-radius` (999px)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Compartidos               | alturas `control-height` (2.5rem), `control-height-sm` (2rem), `control-height-lg` (3rem); `focus-ring` (`0 0 0 3px var(--mimi-ring-soft)`), `focus-outline` (`2px solid var(--mimi-ring)`), `focus-offset` (2px), `disabled-opacity` (0.5), `icon-size` (1rem), `icon-size-sm` (0.875rem)                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Movimiento                | `transition`, `press-scale`, `press-scale-sm` (Switch y Checkbox), `lift` (0px, sin uso por ahora). Ver 6.6                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Efectos                   | `overlay-blur` (6px) y `glass-blur` (16px), iguales en los dos modos. Es el grupo de los efectos que no son movimiento ni controles; los de Mimi Effects se sumarán aquí                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

**`@theme inline`** (siempre `inline`: los valores son `var()` y deben resolverse donde se usan, o el modo oscuro falla):

| Tailwind                         | Origen                                                                                                       | Clases                                                                                                                                                                                                                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-*`                      | cada color y derivado de arriba (`--color-destructive-soft` apunta a `--mimi-destructive-ring` hasta la 1.0) | `bg-*`, `text-*`, `border-*`, `ring-*`, `outline-*`, `fill-*`… (`bg-success-soft`, `ring-destructive-ring`, `bg-destructive-soft-bg`, `bg-glass`…)                                                                                                                                                                      |
| `--radius-sm`                    | `--mimi-radius-sm`                                                                                           | `rounded-sm`                                                                                                                                                                                                                                                                                                            |
| `--radius-md`                    | `calc(radius - 2px)`                                                                                         | `rounded-md`                                                                                                                                                                                                                                                                                                            |
| `--radius-lg`                    | `--mimi-radius`                                                                                              | `rounded-lg`                                                                                                                                                                                                                                                                                                            |
| `--radius-xl`                    | `calc(radius + 4px)`                                                                                         | `rounded-xl`                                                                                                                                                                                                                                                                                                            |
| `--radius-card`                  | `--mimi-radius-card`                                                                                         | `rounded-card`                                                                                                                                                                                                                                                                                                          |
| `--radius-badge`                 | `--mimi-badge-radius`                                                                                        | `rounded-badge`                                                                                                                                                                                                                                                                                                         |
| `--shadow-*`                     | cada sombra                                                                                                  | `shadow-card`, `shadow-primary`, `shadow-primary-hover`, `shadow-destructive`, `shadow-destructive-hover`, `shadow-neutral`, `shadow-neutral-hover`, `shadow-thumb`, `shadow-success`, `shadow-warning`, `shadow-info` (y sus `-hover`), `shadow-popover`, `shadow-glow` y `shadow-glow-<tono>`. Registradas en `cn.ts` |
| `--blur-glass`, `--blur-overlay` | `--mimi-glass-blur`, `--mimi-overlay-blur`                                                                   | `backdrop-blur-glass`, `backdrop-blur-overlay`. Registradas en `cn.ts` (grupo `blur`)                                                                                                                                                                                                                                   |
| `--font-sans`, `--font-mono`     | fuentes                                                                                                      | `font-sans` (también la fuente por defecto de la página), `font-mono`                                                                                                                                                                                                                                                   |
| `--animate-mimi-pulse`           | `mimi-pulse 1.6s ease-in-out infinite` (keyframe `mimi-pulse`)                                               | `animate-mimi-pulse` (Skeleton). Registrada en `cn.ts` (grupo `animate`)                                                                                                                                                                                                                                                |

Los compartidos no se exponen: los componentes usan la cascada de 6.2 (`h-(--mimi-control-height)` o `h-[var(--mimi-btn-height,var(--mimi-control-height,2.5rem))]`).

**`@layer base`:** `*, ::before, ::after { border-color: var(--mimi-border) }` (en Tailwind 4 el borde por defecto es `currentColor`) y `body` con `background-color: var(--mimi-background)` y `color: var(--mimi-foreground)`. La fuente no se pone en `body`: Tailwind la toma de `--font-sans`.

**Contraste de los hovers (V.1): «el hover se aleja del color del texto».** En modo claro, `success`, `info` y `destructive` llevan texto blanco: su `-hover` mezcla el tono al 88 % con `foreground` (oscurece), no con `background` como en el diseño, que no pasaba AA (≈3,8:1; con el cambio, ≈5,8:1). En modo oscuro y en `warning` (texto oscuro) el hover sigue yendo hacia el fondo. `primary` y `secondary` no cambian. El diseño (`F2 Tokens y Tonos`) debe actualizar esos hovers (plan, D6). `contrast.spec.ts` comprueba que cada texto pase 4,5:1 sobre su fondo, en reposo y en hover, en claro y oscuro.

**Fuentes:** `ui-core` no carga ninguna. El showcase carga Outfit desde Google Fonts en `index.html`.

**Navegadores sin `color-mix`:** Tailwind (Lightning CSS) agrega un respaldo: deja `var(--mimi-primary)` y pone el valor con `color-mix` dentro de `@supports (color: color-mix(in lab, red, red))`. Es normal ver las dos versiones en el CSS compilado.

### 6.2 Cascada de tokens

Cada propiedad busca primero la variable del componente, luego la compartida y por último un valor fijo:

```css
height: var(--mimi-btn-height, var(--mimi-control-height, 2.5rem));
border-radius: var(--mimi-btn-radius, var(--mimi-radius, 0.75rem));
```

| Si defines…             | Afecta a…                                   |
| ----------------------- | ------------------------------------------- |
| `--mimi-control-height` | Button, Input, Textarea (y Select, Grupo 1) |
| `--mimi-btn-height`     | Solo Button                                 |
| nada                    | Todos usan 2.5rem                           |

Valores de respaldo por tamaño (los mismos que los tokens de `theme-base.css`):

| Tamaño  | Variable compartida        | Respaldo |
| ------- | -------------------------- | -------- |
| sm      | `--mimi-control-height-sm` | 2rem     |
| default | `--mimi-control-height`    | 2.5rem   |
| lg      | `--mimi-control-height-lg` | 3rem     |

**Los colores de los componentes se cambian en el CSS, no en el preset** (T.0b). Los tokens de color (`--mimi-card-bg`, `--mimi-input-border`, `--mimi-switch-track-on`…) existen en la cascada, pero no en `MimiComponentTokens`: el preset escribe los tokens de componente en `:root`, igual en claro y oscuro, y un color fijo rompería el otro modo. Por eso, en Mimi el color es global: el preset cambia los colores del tema (`colors` y `darkColors`), que valen para todos los componentes, y el color propio de un componente se pone en el CSS, con su versión clara y oscura. Se definen en el `styles.css` de la app, después del tema:

```css
/* styles.css */
:root {
  --mimi-card-bg: oklch(0.98 0.01 250);
}
.dark {
  --mimi-card-bg: oklch(0.22 0.02 250);
}
```

Cada página del showcase tiene su tabla «Variables CSS» (nombre, valor por defecto, de qué hereda y si va en el preset), generada desde `apps/docs/src/app/code/component-tokens.ts`; `component-tokens.spec.ts` la compara con el código de ui-core.

### 6.3 Preset tipado (`theme/types.ts`)

El catálogo completo de tokens, en tres niveles y con una tabla por componente, está en la sección 13.

Los tipos siguen a `theme-base.css`, que es la fuente de verdad. Los derivados con `color-mix` (`primary-hover`, `secondary-hover`, `destructive-hover`, `ring-soft`, `switch-off` y los `<tono>-soft`, `<tono>-hover` y `<tono>-ring`, incluidos `destructive-ring` y `destructive-soft-bg`) **no** están en el preset: se recalculan solos a partir de los colores.

```ts
/** Colores. `colors` se aplica en claro y `darkColors` en oscuro. */
export interface MimiColorTokens {
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  popover?: string;
  popoverForeground?: string;
  primary?: string;
  primaryForeground?: string;
  secondary?: string;
  secondaryForeground?: string;
  muted?: string;
  mutedForeground?: string;
  accent?: string;
  accentForeground?: string;
  destructive?: string;
  destructiveForeground?: string;
  border?: string;
  input?: string;
  inputBackground?: string;
  ring?: string;
  /** Fondo que oscurece la página detrás de paneles y diálogos. */
  overlay?: string;
  success?: string;
  successForeground?: string;
  /** Texto sobre el fondo suave de success. */
  successSoftForeground?: string;
  warning?: string;
  warningForeground?: string;
  warningSoftForeground?: string;
  info?: string;
  infoForeground?: string;
  infoSoftForeground?: string;
  destructiveSoftForeground?: string;
  /** Cuánto tono lleva cada fondo suave (-soft), en porcentaje: '12%'. */
  softMix?: string;
  tooltip?: string;
  tooltipForeground?: string;
  /** Fondo translúcido de las píldoras flotantes (mimi-toolbar, Pagination). */
  glass?: string;
  glassBorder?: string;
}

/** Sombras (`box-shadow` completo). `shadows` en claro y `darkShadows` en oscuro. */
export interface MimiShadowTokens {
  card?: string;
  primary?: string;
  primaryHover?: string;
  destructive?: string;
  destructiveHover?: string;
  neutral?: string;
  neutralHover?: string;
  /** Pulgar del Switch. */
  thumb?: string;
  success?: string;
  successHover?: string;
  warning?: string;
  warningHover?: string;
  info?: string;
  infoHover?: string;
  /** Menús, diálogos, toasts y píldoras flotantes. */
  popover?: string;
  /** Glow (opción glow): van a --mimi-glow y --mimi-glow-<tono>, sin el prefijo shadow-. */
  glow?: string;
  glowPrimary?: string;
  glowSuccess?: string;
  glowWarning?: string;
  glowInfo?: string;
  glowDestructive?: string;
}

/** Radios fijos. Si no se definen, sm y card se calculan a partir de `radius`. */
export interface MimiRadiusTokens {
  sm?: string;
  card?: string;
  /** @deprecated Usa components.badge.radius (la misma variable). Sigue hasta la 1.0. */
  badge?: string;
}

export interface MimiFontTokens {
  sans?: string;
  mono?: string;
}

export interface MimiMotionTokens {
  /** Lista de transiciones. Debe animar `scale` y `translate` (pulgar del Switch y `lift`). */
  transition?: string;
  pressScale?: string | number;
  /** Escala al presionar de Switch y Checkbox. */
  pressScaleSm?: string | number;
  lift?: string;
}

/** Alturas compartidas por Button, Input y Textarea (cascada de la spec 6.2). */
export interface MimiControlSizeTokens {
  height?: string;
  heightSm?: string;
  heightLg?: string;
}

/**
 * Tokens compartidos por todos los controles (spec 13, nivel 2). Las alturas van a
 * --mimi-control-height*; el resto, sin prefijo: focusRing → --mimi-focus-ring.
 */
export interface MimiSharedTokens extends MimiControlSizeTokens {
  /** Halo de foco en campos y botones (box-shadow). */
  focusRing?: string;
  /** Contorno de foco con teclado (outline). */
  focusOutline?: string;
  focusOffset?: string;
  disabledOpacity?: string | number;
  iconSize?: string;
  iconSizeSm?: string;
}

/**
 * Efectos que no son movimiento ni controles: desenfoques (y, más adelante, los de Mimi
 * Effects). Iguales en claro y oscuro.
 */
export interface MimiEffectTokens {
  /** Desenfoque del fondo detrás de Dialog y Sheet. */
  overlayBlur?: string;
  /** Desenfoque de las píldoras translúcidas. */
  glassBlur?: string;
}

/** Tokens por componente. Cada componente los lee con la cascada de la spec 6.2. */
export interface MimiControlTokens extends MimiControlSizeTokens {
  radius?: string;
  /** Padding horizontal del tamaño default: --mimi-<prefijo>-px. */
  px?: string;
  /**
   * @deprecated Nombre de la 0.1.0 (--mimi-<prefijo>-padding-x): usa `px`. Sigue funcionando
   * hasta la 1.0 (spec 12).
   */
  paddingX?: string;
  fontSize?: string;
  borderWidth?: string;
  focusRingWidth?: string;
}

/** paddingX y fontSize se aplican al tamaño default; sm y lg usan los valores del diseño. */
export interface MimiButtonTokens extends MimiControlTokens {
  /** Espacio entre ícono y texto del tamaño default. */
  gap?: string;
  /** Escala al presionar; si no, --mimi-press-scale. Con movimiento reducido vale 1. */
  pressScale?: string | number;
  fontWeight?: string | number;
  letterSpacing?: string;
}

export interface MimiInputTokens extends MimiControlTokens {
  /**
   * @deprecated Es un color: cámbialo en el CSS con --mimi-input-placeholder (spec 6.2). Sigue
   * funcionando hasta la 1.0.
   */
  placeholderColor?: string;
  disabledOpacity?: string | number;
}

export interface MimiCardTokens {
  radius?: string;
  borderWidth?: string;
  shadow?: string;
  /** Padding exterior de las partes (1.5rem); los paddingHeader/Content/Footer lo detallan. */
  padding?: string;
  paddingHeader?: string;
  paddingContent?: string;
  paddingFooter?: string;
}

export interface MimiAvatarTokens {
  size?: string;
  sizeSm?: string;
  sizeLg?: string;
  radius?: string;
}

export interface MimiSwitchTokens {
  /** Ancho de la pista. El pulgar se desplaza ancho − alto. */
  width?: string;
  /** Alto de la pista. El pulgar mide alto − 4px. */
  height?: string;
}

export interface MimiCheckboxTokens {
  size?: string;
  radius?: string;
}

/** FormField (prefijo field). */
export interface MimiFieldTokens {
  gap?: string;
  labelSize?: string;
  labelWeight?: string | number;
}

export interface MimiSeparatorTokens {
  /** Grosor de la línea. */
  size?: string;
}

export interface MimiSkeletonTokens {
  radius?: string;
  /** Duración del pulso: '1.6s'. */
  duration?: string;
}

export interface MimiBadgeTokens {
  height?: string;
  px?: string;
  fontSize?: string;
  fontWeight?: string | number;
  /** --mimi-badge-radius (el mismo que radii.badge de la 0.1.0). */
  radius?: string;
}

/** Textarea: si no se definen, usa los de Input y después los compartidos. */
export interface MimiTextareaTokens {
  radius?: string;
  minHeight?: string;
  lineHeight?: string;
  py?: string;
}

/**
 * Tokens por componente (spec 13). Solo los que no dependen del modo: los colores de los
 * componentes (`--mimi-<prefijo>-bg`, `-fg`, `-border`…) se cambian en el CSS (spec 6.2).
 */
export interface MimiComponentTokens {
  button?: MimiButtonTokens;
  input?: MimiInputTokens;
  card?: MimiCardTokens;
  avatar?: MimiAvatarTokens;
  switch?: MimiSwitchTokens;
  checkbox?: MimiCheckboxTokens;
  formField?: MimiFieldTokens;
  separator?: MimiSeparatorTokens;
  skeleton?: MimiSkeletonTokens;
  badge?: MimiBadgeTokens;
  textarea?: MimiTextareaTokens;
  popover?: MimiPopoverTokens;
  tooltip?: MimiTooltipTokens;
  menu?: MimiMenuTokens;
  /** radius, height, optionHeight y optionRadius (G1.5). */
  select?: MimiSelectTokens;
  /** radius, width, padding, closeSize y overlayBlur (G1.6). */
  dialog?: MimiDialogTokens;
}

export interface MimiThemePreset {
  /** Solo informativo: no genera CSS. */
  name?: string;
  /** --mimi-radius */
  radius?: string;
  radii?: MimiRadiusTokens;
  colors?: MimiColorTokens;
  darkColors?: MimiColorTokens;
  shadows?: MimiShadowTokens;
  darkShadows?: MimiShadowTokens;
  fonts?: MimiFontTokens;
  motion?: MimiMotionTokens;
  effects?: MimiEffectTokens;
  controls?: MimiSharedTokens;
  components?: MimiComponentTokens;
}
```

`controls` tiene los compartidos (spec 13, nivel 2): las alturas van a `--mimi-control-height*` y el resto sin prefijo (`focusRing` → `--mimi-focus-ring`). No existen variables `--mimi-control-*` para radio, padding o tamaño de letra: esos tokens son por componente (`--mimi-btn-radius`, etc.). En `shadows`, el glow va a `--mimi-glow*`, sin el prefijo `shadow-` (`glowSuccess` → `--mimi-glow-success`). `effects` va a `:root` (igual en los dos modos).

Ejemplo:

```ts
export const mimiTheme: MimiThemePreset = {
  radius: '0.375rem',
  colors: { primary: 'oklch(0.55 0.22 285)', primaryForeground: 'oklch(0.985 0 0)' },
  darkColors: { primary: 'oklch(0.7 0.18 285)' },
  controls: { height: '2.25rem' },
  components: { button: { fontWeight: 600 } },
};

// app.config.ts
providers: [provideMimiTheme(mimiTheme)]; // opcional
```

### 6.4 `provideMimiTheme()` (`theme/provider.ts`)

| Pieza                              | Qué hace                                                                                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `mimiThemeToCss(preset)`           | Función pura: convierte el preset en texto CSS. Devuelve `''` si no hay nada que aplicar.                                                                                                        |
| `applyMimiTheme(document, preset)` | Crea o reutiliza `<style id="mimi-theme">`, reemplaza su contenido y lo mueve al final del `<head>`. Con un preset vacío o `null` lo elimina. La usa también la página «Tema» (plan, 5.2).       |
| `MIMI_THEME`                       | `InjectionToken<MimiThemePreset>` con el preset registrado.                                                                                                                                      |
| `provideMimiTheme(preset)`         | `makeEnvironmentProviders` con `MIMI_THEME` y un `provideAppInitializer` que llama a `applyMimiTheme(inject(DOCUMENT), inject(MIMI_THEME))`. Opcional: sin él, se usa `theme-base.css` tal cual. |

**Mapa de nombres.** No hay un `if` por token: la clave pasa a kebab-case y cada grupo le pone su prefijo.

| Grupo                     | Selector                     | Variable                                                                                                                                        |
| ------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `radius`                  | `:root`                      | `--mimi-radius`                                                                                                                                 |
| `radii`                   | `:root`                      | `sm` → `--mimi-radius-sm`, `card` → `--mimi-radius-card`, `badge` → `--mimi-badge-radius`                                                       |
| `colors`                  | `:root:not(.dark)`           | `--mimi-` + kebab (`primaryForeground` → `--mimi-primary-foreground`)                                                                           |
| `darkColors`              | `.dark`                      | igual que `colors`                                                                                                                              |
| `shadows` / `darkShadows` | `:root:not(.dark)` / `.dark` | `--mimi-shadow-` + kebab                                                                                                                        |
| `fonts`                   | `:root`                      | `--mimi-font-` + kebab                                                                                                                          |
| `motion`                  | `:root`                      | `--mimi-` + kebab (`pressScale` → `--mimi-press-scale`)                                                                                         |
| `controls`                | `:root`                      | `--mimi-control-` + kebab (`heightSm` → `--mimi-control-height-sm`)                                                                             |
| `components.<c>`          | `:root`                      | `--mimi-<prefijo>-` + kebab, con prefijos `button` → `btn`, `input` → `input`, `card` → `card` (`button.fontWeight` → `--mimi-btn-font-weight`) |

Las propiedades `undefined` o vacías se omiten. Los números se pasan a texto.

**Reglas:**

- **Nada de estilos en línea** (`style.setProperty`): le ganan a `.dark` y rompen el modo oscuro.
- **Orden:** el `<style>` va al final del `<head>`, después del CSS global, para ganarle a `theme-base.css` con la misma especificidad. En producción Angular carga la hoja global con `<link media="print" onload>`, pero la cascada respeta el orden de los elementos en el documento, no el momento en que carga cada uno.
- **`colors` va en `:root:not(.dark)`**, no en `:root`. `:root` y `.dark` tienen la misma especificidad y los dos se aplican a `<html>` en modo oscuro, así que un `:root` posterior le ganaría al `.dark` de la base. Con `:root:not(.dark)`:
  - Si el preset define `colors.primary` pero no `darkColors.primary`, **el modo oscuro conserva el primario oscuro de la base**. Para cambiar los dos modos hay que definir ambos.
  - `:root:not(.dark)` tiene **más especificidad** que un `:root` normal, así que los colores del preset también le ganan a variables redefinidas con `:root { … }` en el `styles.css` del usuario. Para ganarle al preset hay que usar un selector igual o más específico, o cambiar el preset.
- **Derivados:** nunca se emiten. Como `theme-base.css` los define con `var()`, siguen al color nuevo solos (`primary-hover` se recalcula con el `--mimi-primary` del preset).
- **Movimiento reducido:** si el preset define `motion`, su `:root` le ganaría al `@media (prefers-reduced-motion)` de la base, así que el CSS generado agrega su propio bloque con `--mimi-press-scale: 1`, `--mimi-press-scale-sm: 1` y `--mimi-lift: 0`.
- **Valores inseguros:** se ignora cualquier valor con `;`, `{`, `}` o `<`, porque rompería el CSS o cerraría la etiqueta `<style>`. En modo desarrollo (`isDevMode()`) se avisa en consola.
- **SSR/prerender:** usa `inject(DOCUMENT)`, nunca `window` ni `document` globales.

**Pruebas:** jsdom tiene un fallo en la cascada de variables CSS: una regla posterior que no aplica al elemento puede cambiar el valor calculado. Por eso las pruebas comprueban el texto CSS generado y, con `getComputedStyle`, solo el modo claro. El modo oscuro se revisa en el navegador, en `/dev/theme`.

### 6.5 Utilidades (`utils/`)

**El índice `utils/index.ts` solo reexporta utils livianos** (`cn` y `control-styles`). Los que dependen de `@angular/forms`, `@angular/cdk` o `@angular/aria` (`field-state`, `overlay`) se importan siempre con su archivo concreto: si estuvieran en el índice, quien importe cualquier cosa desde él los arrastraría (como pasó con `@angular/forms`). Lo comprueba `imports.spec.ts` (G1.2). El índice del paquete (`packages/ui-core/src/index.ts`) sí los exporta, por separado.

**`overlay.ts`** (G1.2, ítem `utils/overlay` del registro, peer `@angular/cdk`): lo comparten Popover, Tooltip, Dropdown Menu y Context Menu (los menús también usan `MIMI_VIEWPORT_MARGIN` para el volteo del submenú). `mimiPointPositions()` (G1.4): posiciones para abrir en un punto (esquina en el punto; si no cabe, a la izquierda, arriba o ambas). Tipos `MimiOverlaySide` y `MimiOverlayAlign`; `MIMI_VIEWPORT_MARGIN` (8px); `mimiConnectedPositions(side, align, offset)` (la posición pedida, la opuesta y los otros dos lados centrados); `mimiPlacedSide(pair)`; `mimiArrowOffset(trigger, panel, side)` (la flecha apunta al centro del trigger); `MIMI_OVERLAY_ANIMATION` (CSS de entrada y salida con los valores de `--mimi-transition`, para el `styles` del componente; el panel lleva `data-mimi-overlay-panel` y `data-state`) y `mimiWaitForExit(element)`. Las clases de la flecha no se comparten: Tailwind necesita clases literales y las flechas difieren (la de Popover tiene borde).

**`cn.ts`**: `cn(...inputs)` = `twMerge(clsx(inputs))`, con `extendTailwindMerge`. tailwind-merge solo reconoce tallas (`sm`, `md`…) en las escalas `shadow` y `radius`, así que se registran los tokens de Mimi; si no, `shadow-card` se toma como color de sombra y `rounded-card` no se fusiona. Los colores no hace falta registrarlos (la escala de color acepta cualquier nombre).

```ts
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      shadow: [
        'card',
        'primary',
        'primary-hover',
        'destructive',
        'destructive-hover',
        'neutral',
        'neutral-hover',
      ],
      radius: ['card', 'badge'],
    },
    classGroups: { transition: ['mimi-transition'] },
  },
});
```

Si se agrega una sombra, un radio o una utilidad propia a `theme-base.css`, hay que registrarla aquí y agregar una prueba en `cn.spec.ts`.

**`control-styles.ts`**: estilos compartidos de Button, Input y Textarea, tomados de la hoja de componentes. Las alturas, el padding y el tamaño de letra no van aquí: cada componente los define con su propia cascada (`--mimi-btn-*` o `--mimi-input-*` → `--mimi-control-*`, spec 6.2). Por eso se eliminó `controlSizes` en la tarea 2.2.

```ts
// Botones: contorno del color de anillo
export const buttonFocusStyles =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

// Input y Textarea: borde de anillo y halo ring-soft
export const fieldFocusStyles =
  'outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring-soft';

// Sin pointer-events-none en disabled: anularía cursor-not-allowed. a[mimiBtn] sí lo necesita.
export const controlDisabledStyles =
  'disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

// Borde rojo fijo; halo destructive-soft solo al enfocar
export const controlInvalidStyles =
  'aria-invalid:border-destructive aria-invalid:focus-visible:border-destructive aria-invalid:focus-visible:ring-destructive-soft';

// Solo botones. Switch y Checkbox tienen su propia escala.
export const controlPressStyles = 'mimi-transition active:scale-(--mimi-press-scale)';
```

**`outline-none` y el anillo de foco.** En Tailwind 4, `outline-none` pone `--tw-outline-style: none` y `focus-visible:outline-2` toma el estilo de esa variable: si un elemento tiene las dos clases, el anillo de foco no se ve. Pasó en Tabs (fila y paneles, 5.11) y en el toast enfocado con F8 (paso A antes de la G1.10). Por eso:

- Un elemento con `buttonFocusStyles` o `focus-visible:outline-*` no lleva `outline-none`: el navegador solo dibuja su contorno propio con `:focus-visible`, y ahí lo reemplaza el de Mimi.
- `outline-none` solo va en elementos que muestran el foco de otra forma (borde y halo `ring` en Input y Textarea, fondo de la opción activa en Menu y Select, la caja del Select con `has-[[role=combobox]:focus]`) o que reciben el foco por código (paneles de Dialog y Popover, región de los toasts).
- `packages/ui-core/src/lib/focus-styles.spec.ts` lo comprueba: cada `outline-none` está en una lista con el motivo (uno nuevo falla hasta revisarlo), y ninguno comparte bloque (líneas seguidas, una constante, un `cn()` o un `cva()`) con un anillo de contorno.

**`field-state.ts`**: `injectFieldState()` devuelve el estado del campo del elemento actual como signals (`invalid`, `touched`, `dirty`, `disabled`, `showError` = inválido y tocado o modificado, y `errors`: los errores normalizados como `MimiFieldError`, con `kind` en minúsculas, `message` y `params` con los nombres de Reactive Forms). También define el token `MIMI_FIELD_CONTROL`, que proveen Input, Textarea, Switch y Checkbox para `mimi-form-field`, sea cual sea el sistema de formularios (spec, sección 8). Lo usan Input y Textarea, y lo usará `mimi-form-error`.

**Pruebas de ui-core:** corren con `ng test ui-core` (`pnpm test:ui-core`, incluido en `pnpm test`), con TestBed disponible.

### 6.6 Movimiento

Tres variables controlan las micro-animaciones del tema Mimi:

| Variable                | Valor                                                                                                                                                                  | Uso                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `--mimi-transition`     | `background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .25s ease, scale .15s cubic-bezier(.2,.8,.2,1), translate .15s cubic-bezier(.2,.8,.2,1)` | Lista completa de transiciones de los componentes interactivos.                                  |
| `--mimi-press-scale`    | `0.975`                                                                                                                                                                | Escala al hacer clic (`:active`) en botones.                                                     |
| `--mimi-press-scale-sm` | `0.9`                                                                                                                                                                  | Escala al hacer clic en Switch y Checkbox (diseño: `scale(0.9)`). Preset: `motion.pressScaleSm`. |

La transición anima la propiedad `scale`, no `transform`: en Tailwind 4, `scale-*` escribe `scale`. Así funciona `active:scale-(--mimi-press-scale)`. `translate` también está en la lista: mueve el pulgar del Switch (`translate-x-4`) y servirá para `--mimi-lift` (hoy `0px`) con `translate-y-*`. Con movimiento reducido se quita.

Con `prefers-reduced-motion: reduce`, `--mimi-press-scale` y `--mimi-press-scale-sm` pasan a `1` y `--mimi-transition` pierde `scale` y `translate`:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --mimi-press-scale: 1;
    --mimi-press-scale-sm: 1;
    --mimi-transition:
      background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.25s ease;
  }
}
```

La transición se aplica con una utilidad de Tailwind 4, definida en `theme-base.css`:

```css
@utility mimi-transition {
  transition: var(--mimi-transition);
}
```

Uso en un componente: `mimi-transition active:scale-(--mimi-press-scale)`. No usar `active:[transform:scale(...)]`: `--mimi-transition` no anima `transform`. Nunca escribir la lista de transiciones a mano en las clases.

## 7. Personalización (cuatro niveles)

1. **Tema:** `mimi.preset.ts` o variables en CSS. Afecta a toda la app.
2. **Token de componente:** `components.button.radius`. Afecta a un tipo de componente.
3. **Editar el archivo copiado:** agregar variantes, cambiar hover, etc. El código es del usuario.
4. **Una instancia:** `<button mimiBtn class="w-full h-12">`. Todo componente recibe `class` como input y lo mezcla con `cn()`, así la clase del usuario siempre gana. `class` va al elemento visible principal; si hay un panel aparte, se usa `panelClass` (regla completa en la sección 4, después de la tabla del Grupo 1).

Además, cada componente expone `data-variant`, `data-size`, `data-state` y `data-disabled` para estilizar desde CSS o con `data-[state=checked]:…`.

## 8. Formularios

Mimi soporta los tres sistemas de formularios de Angular 22: **Signal Forms** (`[formField]`, estable en v22), **Reactive Forms** (`formControlName`, `[formControl]`) y **template-driven** (`[(ngModel)]`).

### Campos nativos: `input[mimiInput]` y `textarea[mimiTextarea]`

Son directivas de atributo sobre el elemento nativo, así que funcionan con los tres sistemas sin hacer nada: Angular conecta el `<input>` directamente. Para pintar el error:

- Detectan qué sistema usa el campo inyectando de forma opcional `FormField` (de `@angular/forms/signals`) y `NgControl` (de `@angular/forms`).
- **Signal Forms:** leen `formField.state().invalid()` y `touched()` / `dirty()`, que ya son signals.
- **Reactive Forms y ngModel:** los flags del control no son signals, así que el estado se obtiene con `toSignal(control.events)` (nunca con un `computed()` que lea el control directamente, `CLAUDE.md` regla 7).
- **Costo aceptado:** `field-state` inyecta `FormField` de `@angular/forms/signals` para detectar Signal Forms, así que una app que solo usa Reactive Forms o ngModel carga igual unos **10 kB** de `@angular/forms/signals` (medido en la prueba de la tarea 3.7: 10,6 kB). Hay una forma de evitarlo: `FormField` también provee `NgControl` (un `InteropNgControl` cuyos _getters_ leen los signals del campo), y bastaría con `NgControl`. Pero que esos _getters_ sean reactivos es un detalle interno, no API documentada: si Angular lo cambiara, los formularios del usuario dejarían de mostrar errores sin aviso tras un `ng update`. Por la regla de la sección 1 (solo APIs documentadas en el código que se entrega), se paga el costo.
- La detección está en `utils/field-state.ts` (`injectFieldState()`). Con `formControlName` / `[formControl]` el control existe recién después de que esa directiva procesa sus entradas; por eso la suscripción se intenta enseguida y, si todavía no hay control, después del primer render. Con SSR no se pintan errores en el servidor (al cargar, los campos no se tocaron).
- Si el campo es inválido y fue tocado o modificado, agregan `aria-invalid="true"` y se ponen en rojo con `controlInvalidStyles`. Sin formulario, no hacen nada.
- `showError` (`boolean | undefined`) decide a mano: `undefined` (por defecto) deja decidir al formulario, `true` muestra el error y `false` lo oculta aunque el formulario sea inválido.
- Exponen el estado con `exportAs` (`mimiInput`, `mimiTextarea`): `#campo="mimiInput"` → `campo.fieldState.showError()`.
- **Nombres de entrada:** Signal Forms escribe su estado en cualquier entrada llamada `invalid`, `touched`, `dirty`, `disabled`, `errors`, `required`, `name`… de las directivas del mismo elemento. Por eso la entrada es `showError` y no `invalid`. En directivas que conviven con `[formField]` no se usan esos nombres; en controles propios con `FormValueControl` sí, porque es justamente cómo reciben el estado.

### Controles propios: Switch, Checkbox y Select

Implementan **`FormValueControl<T>`** (o `FormCheckboxControl` para un booleano con `checked`) de `@angular/forms/signals`: un `value = model<T>()` (o `checked = model<boolean>()`), un `touch` output y, opcionalmente, los inputs `invalid`, `touched`, `disabled` y `required`, que Angular les pasa solo.

Verificado en Angular 22.1.7 con una prueba real: un control que implementa solo `FormValueControl` funciona sin adaptador con `[formField]`, con `formControlName` / `[formControl]` y con `[(ngModel)]`. En los tres casos se sincroniza el valor, `touch` marca el control como tocado y los inputs `invalid`, `touched` y `disabled` reciben el estado del formulario. Internamente, `NgModel`, `FormControlName` y `FormControlDirective` detectan el contrato de controles propios cuando no hay un `ControlValueAccessor`.

- **Select (G1.5):** `FormValueControl<T | null>` con `value = model<T | null>(null)`; sin valor es `null`. Comprobado con los tres sistemas (valor, `touch`, `invalid`, `required` y `disabled`). `touch` no se emite en el `blur` del botón, sino cuando el foco sale del Select entero (disparador, botón de limpiar y panel): con buscador, el foco pasa al panel al abrir y eso no cuenta como tocarlo. Los valores de tipo objeto se comparan con `compareWith`.
- **Toggle Group (G2.1):** `FormValueControl<T | null | T[]>` (spec 8, «Valor simple o múltiple»); `touch` cuando el foco sale del grupo; sin `MIMI_FIELD_CONTROL` (un grupo se nombra con `aria-label`, no con `<label for>`).
- **Number Input (G2.2):** `FormValueControl<number | null>` y `MIMI_FIELD_CONTROL` (el `controlElement` es el input de dentro); `touch` al salir de la caja (input y botones); los `min` y `max` que escribe Signal Forms desde el esquema son las mismas entradas del componente (las usan ↑/↓, Inicio/Fin y el acotado). Comprobado con los tres sistemas, con `mimi-form-field` (etiqueta y mensaje).
- **Input Mask (G2.4a):** `FormValueControl<string>` con `transformedValue()` (`@angular/forms/signals`): el modelo guarda los dígitos y el input muestra la máscara. Es un control propio, no una directiva sobre el input del usuario: la regla 6 de `CLAUDE.md` pide directivas para los nativos que escribe el usuario, y un control con `FormValueControl` no rompe `formControlName` ni `ngModel` (se ponen en el control, como Select). Los errores de lectura de `transformedValue()` (máscara incompleta, `kind: 'mask'`) solo llegan a un campo de Signal Forms; con Reactive Forms y `ngModel` no hay error automático y se usa un validador (comprobado en la G2.4a con los tres sistemas).
- **Valor simple o múltiple (decidido por el usuario el 03/11/2026, para el Grupo 2):** un componente con dos modos tiene **un solo `value`**, cuyo tipo cambia con el modo (una unión o un genérico según el modo): Toggle Group `T | null` o `T[]` con `multiple`; Slider `number` o un rango; Combobox `T | null` o `T[]` con `multiple`. El modo múltiple se llama `multiple` (booleano). Al empezar la G2.1, un spike de Signal Forms comprueba que `[formField]` acepta, contra el mismo componente, un campo de tipo `T` y otro de tipo `T[]`; si TypeScript no acepta la unión, la convención pasa a **dos selectores** por modo (opción (c) del plan), con el código compartido por dentro. El nombre del modo de rango del Slider se propone al empezar la G2.7, dentro de esta convención. Vale para G2.1, G2.7 y G2.8; el resultado del spike se anota aquí.
  - **Resultado del spike (G2.1, 04/11/2026): opción (a), un solo `value`.** Un componente de prueba `FormValueControl<T | null | T[]>` con `value = model<T | null | T[]>(null)` compiló con `[formField]` enlazado a un campo `string`, a uno `string[]` y a uno `string | null` (`ng build`, Angular 22.2.3, `strictTemplates` activo por defecto); la misma compilación rechazó un control `number` contra un campo `string` (TS2322), así que la comprobación está activa. En ejecución, las pruebas de Toggle Group sincronizan en los dos sentidos un campo `T` y otro `T[]` contra el mismo componente, con los tres sistemas de formularios. **Límite:** la comprobación va del campo al control, así que un `multiple` enlazado a un campo `T` (o uno simple a `T[]`) compila igual; el componente lo avisa en modo desarrollo («[Mimi] Toggle Group: con multiple, value tiene que ser un arreglo»). G2.7 y G2.8 siguen esta forma.
- **Textos de Select:** igual que los mensajes de error. `MIMI_SELECT_TEXT_EN` (por defecto) y `MIMI_SELECT_TEXT_ES`, el token `MIMI_SELECT_TEXT` y `provideMimiSelectText(parcial)`; lo que no se define queda en inglés. Claves: `search`, `results(n)`, `noResults`, `noResultsFor(q)`, `loading` y `clear`. Viven en `select-texts.ts`, sin aria ni cdk, para poder proveerlos en `app.config.ts` sin llevar el Select al JS inicial. El showcase los provee en la página de Select.
- **No** implementar `ControlValueAccessor` en los componentes de Mimi. Angular advierte que no hay que implementar a la vez `ControlValueAccessor` y `FormValueControl` / `FormCheckboxControl`.
- Para migrar de a poco existen `compatForm` y `SignalFormControl` (`@angular/forms/signals/compat`); Mimi no los necesita.

### Mensajes de error

- `mimi-form-field` agrupa etiqueta, control y mensaje, y muestra el mensaje del primer error sin escribir nada: `<mimi-form-field label="Correo">…</mimi-form-field>`. Encuentra el control por el token `MIMI_FIELD_CONTROL` (`utils/field-state.ts`), que proveen Input, Textarea, Switch, Checkbox y Select.
- `label` dibuja un `<label for>`. Un `<label>` propio (hijo directo) sin `for` también se enlaza. Si el control no tiene `id`, recibe uno. El mensaje se agrega al `aria-describedby` del control sin borrar el que tenga.
- `mimi-form-error` es opcional: con contenido propio muestra ese texto; sin contenido, el automático. Sirve también para moverlo (por ejemplo, `class="col-start-2"` en una grilla). Si está, reemplaza al automático.
- El mensaje está siempre en el DOM con `aria-live="polite"`: sin error queda vacío y fuera del flujo (`sr-only`); solo cambia su contenido.
- **Texto del error:** primero el `message` que trae el error (Signal Forms, desde el esquema); luego el mapa de mensajes por clave (`required`, `email`, `minlength`, `maxlength`, `min`, `max`, `pattern` y `default`). Los datos usan los nombres de Reactive Forms en los tres sistemas (Signal Forms `minLength` → `requiredLength`).
- **Idioma:** los mensajes predeterminados están en inglés (`MIMI_ERROR_MESSAGES_EN`). `MIMI_ERROR_MESSAGES_ES` trae el español, y el showcase lo usa. Lo que no se define queda en inglés; las claves se normalizan a minúsculas.
  ```ts
  provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES);
  provideMimiErrorMessages({
    ...MIMI_ERROR_MESSAGES_ES,
    required: 'Completa este campo.',
    minlength: (e) => `Mínimo ${e.requiredLength} caracteres.`,
  });
  ```

```html
<!-- Reactive Forms -->
<form [formGroup]="form" (ngSubmit)="onSubmit()" class="max-w-md space-y-4">
  <mimi-form-field label="Correo">
    <input mimiInput type="email" formControlName="email" />
  </mimi-form-field>
  <button mimiBtn type="submit">Guardar</button>
</form>

<!-- Signal Forms -->
<mimi-form-field label="Correo">
  <input mimiInput type="email" [formField]="profileForm.email" />
</mimi-form-field>

<!-- Texto propio -->
<mimi-form-field label="Usuario">
  <input mimiInput [formField]="profileForm.user" />
  <mimi-form-error>Ese nombre de usuario ya existe.</mimi-form-error>
</mimi-form-field>
<mimi-switch [formField]="profileForm.newsletter">Recibir novedades</mimi-switch>
```

## 9. Íconos

- Los componentes traen sus íconos internos como SVG en línea con trazos de Lucide (licencia ISC; avisos en `THIRD_PARTY_NOTICES.md`, junto con el Octicon de GitHub del header). Fase 2: spinner, check, minus. Grupo 1: chevron-down, x, search.
- Los íconos del usuario van por `ng-content` y se dimensionan solos: `[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none`.
- Recomendado para el usuario y usado en el showcase: `@lucide/angular` (standalone, signals, un componente por ícono):
  ```html
  <button mimiBtn><svg lucideSave></svg> Guardar</button>
  ```

## 10. Showcase (`apps/docs`)

El diseño visual sale de `docs/design/Mimi Sitio.dc.html`. Los botones del layout (header, panel móvil, copiar, inicio, 404 y páginas `/dev`) usan `mimiBtn` desde la tarea 2.1; las pestañas de CodePreview e InstallCommand usan `<mimi-tabs>` desde la tarea 5.11.

### Layout (tarea 1.6)

```
apps/docs/src/app/
├── app.ts / app.html        # Shell: «Saltar al contenido», header, panel móvil, <main id="contenido">
├── site.ts                  # SITE = { version, githubUrl }: única fuente
├── core/theme.service.ts    # Modo claro/oscuro
├── code/                    # CodePreview, CodeBlock, InstallCommand, CopyButton, Shiki (tarea 1.7)
├── layout/
│   ├── site-header.*        # Header fijo
│   ├── docs-nav.ts          # Configuración de la sidebar (DOCS_NAV)
│   ├── docs-sidebar.*       # Sidebar generada desde DOCS_NAV
│   ├── docs-layout.*        # Grilla: sidebar + migas + contenido + TOC
│   ├── docs-toc.*           # TOC automática
│   └── mobile-nav.*         # Panel lateral (< lg) y su servicio
├── pages/                   # home-page, not-found-page, docs/*-page
└── dev/                     # /dev/tokens, /dev/theme y /dev/code (internas, fuera del menú)
```

- **Header:** fijo (`sticky`), 60px de alto, fondo `bg-background/78` con desenfoque de 14px y borde inferior. Contiene el botón de menú (solo bajo `lg`), el logo (enlace a `/`), la versión, el enlace a GitHub y el botón claro/oscuro. Sin nav superior, buscador ⌘K ni selector ES/EN: quedan para las tareas 5.10, 5.8 y 5.9.
  - **Versión:** `SITE.version`, que lee `packages/cli/package.json` (única fuente de la versión de Mimi, tarea 3.8) con el alias `@mimi-ng/cli/package.json` de `tsconfig.base.json` (y `resolveJsonModule`). Tiene que ser un alias y no una importación de paquete: `ng serve` deja los paquetes de `node_modules` fuera del bundle y Vite los busca desde la raíz del workspace, donde `@mimi-ng/cli` no está instalado. La prueba `site.spec.ts` lo comprueba.
  - **GitHub:** `SITE.githubUrl` (`https://github.com/nuki23/mimi-ng`). Lucide ya no tiene logos de marcas, así que el ícono es el SVG oficial de GitHub (Octicon mark-github, MIT) en línea, con `fill="currentColor"` y `aria-hidden`; el enlace lleva `aria-label="Repositorio de Mimi en GitHub"`.
- **Grilla de la documentación:** `max-w-[1440px]`, `px-6`; columnas `240px | contenido | 200px`; separación de 28px (48px desde 1100px). Contenido con `max-w-[900px]`, 40px arriba y 120px abajo, y migas (sección › página) sacadas de `DOCS_NAV`.
- **Responsive:** desde `lg` (1024px) la sidebar es una columna fija; bajo `lg` se abre en el panel móvil. Desde `xl` (1280px) se muestra la TOC; bajo `xl` se oculta.

### Rutas

| Ruta                                                            | Página                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                             | Landing (tarea 2.12)                                                                                                                                                                                                                                                                                                                                                                            |
| `/docs`                                                         | Redirige a `/docs/introduction`                                                                                                                                                                                                                                                                                                                                                                 |
| `/docs/introduction`, `/docs/installation`, `/docs/foundations` | Páginas de Primeros pasos, dentro del layout de documentación. Fundamentos (G1.12): qué copia la CLI, cómo se importa, la regla de `class`, variante y tono, personalizar, textos, formularios, accesibilidad, base técnica, peso y compatibilidad; su prueba compara la tabla de paquetes con el registro de la CLI y los textos con ui-core                                                   |
| `/docs/theme`                                                   | Página «Tema» (plan 5.2; sección 11), en Primeros pasos: color principal, radio y densidad, vista previa y exportar. Lazy, con su `title`                                                                                                                                                                                                                                                       |
| `/docs/components/<nombre>`                                     | Páginas de componentes (Fase 2)                                                                                                                                                                                                                                                                                                                                                                 |
| `/dev/tokens`, `/dev/theme`, `/dev/code`                        | Páginas internas, sin sidebar y fuera del menú. **Solo en desarrollo:** sus rutas están en `app/dev/dev.routes.ts`, que la configuración `production` reemplaza por una lista vacía (`fileReplacements` en `angular.json`), y el build de producción usa `styles.prod.css` (importa `styles.css` y agrega `@source not './app/dev'`), así que sus clases no llegan al CSS del sitio (tarea 4.4) |
| `**`                                                            | 404                                                                                                                                                                                                                                                                                                                                                                                             |

Las rutas y los archivos están en inglés; los títulos visibles, en español. El idioma se separará con un prefijo en la ruta (tarea 5.9).

El router usa `withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })` y `ViewportScroller.setOffset([0, 76])` (60px del header + 16px), para que los anclas no queden debajo del header.

### Sidebar (`docs-nav.ts`)

La sidebar, las migas y una prueba de rutas salen de `DOCS_NAV`: una lista de secciones con ítems `{ title, path, status }`. No se escriben enlaces de la documentación a mano en el HTML.

| `status`  | Cómo se ve                                                                               |
| --------- | ---------------------------------------------------------------------------------------- |
| `ready`   | Enlace con `routerLinkActive`; el activo tiene `aria-current="page"` y fondo `secondary` |
| `pending` | La página todavía no existe: atenuado, `aria-disabled`, sin enlace                       |
| `soon`    | Llega en una fase posterior: atenuado, sin enlace, con la etiqueta «Próximamente»        |

Al crear una página, se agrega su ruta y se cambia su ítem a `ready`. Una prueba falla si un ítem `ready` no tiene ruta.

### TOC

Lee los `h2[id]` y `h3[id]` del contenido de la página con un `MutationObserver` (así funciona con rutas lazy y al cambiar de ruta) y resalta la sección visible con un `IntersectionObserver` (`aria-current="location"`). Los enlaces usan `routerLink` + `fragment`, porque un `href="#id"` con `<base href="/">` navegaría a la raíz. Si la página no tiene encabezados, no se muestra. Cada encabezado que deba aparecer necesita un `id`.

### Modo claro/oscuro

- `ThemeService` (signals): si el usuario no eligió, sigue `prefers-color-scheme` (y sus cambios); `toggle()` guarda la elección en `localStorage` (`mimi-docs-theme`, con try/catch) y pone o quita `.dark` en `<html>`.
- Un script pequeño en el `<head>` de `index.html` aplica `.dark` antes de que cargue Angular, con la misma clave, para evitar el parpadeo de claro a oscuro al recargar.
- `/dev/tokens` y `/dev/theme` usan el mismo servicio.

### Panel móvil

`<dialog>` nativo abierto con `showModal()`: el resto de la página queda inerte, así que el foco no sale del panel, y al cerrar el foco vuelve al botón de menú. Se cierra con Escape, con un clic en el fondo (`bg-overlay`), con el botón de cerrar, al navegar y al llegar a `lg`. Mientras está abierto, `<html>` tiene `overflow: hidden`, y al cerrar se restaura el valor anterior. El botón de menú tiene `aria-expanded` y `aria-controls`.

### Accesibilidad

- «Saltar al contenido» es el primer elemento enfocable y enfoca `<main id="contenido">` por código.
- `<nav aria-label="Documentación">` en la sidebar y `<nav aria-label="En esta página">` en la TOC.
- Foco visible en botones y enlaces (`focus-visible:outline-ring`).

### Código: CodePreview, CodeBlock e InstallCommand (tarea 1.7)

Están en `apps/docs/src/app/code/`. Las medidas salen de la página de Input de `Mimi Sitio.dc.html`.

| Pieza                | Qué hace                                                                                                                                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CodePreview`        | Tarjeta con `<mimi-tabs variant="pill">` (Preview con ícono de ojo, Código con ícono de código) y un botón «Copiar». El lienzo tiene 260px de alto mínimo, borde punteado, `bg-background`, contenido centrado y tres puntos decorativos. El ejemplo va por `ng-content`; `code` es el texto de su archivo. `lang` vale `angular-ts` por defecto. |
| `CodeBlock`          | Bloque de código con botón copiar. Entradas: `code`, `lang`, `prompt` (`$` delante de un comando, que no se copia), `bordered`, `copyable` y `roomy` (la variante holgada del panel Código).                                                                                                                                                      |
| `InstallCommand`     | `<mimi-tabs>` subrayadas `Angular CLI` (`ng g mimi <nombre>`) y `Forma larga` (`ng g @mimi-ng/cli:ui <nombre>`), cada una con un `CodeBlock`. La de pnpm (`pnpm mimi add`) vuelve con la tarea 5.3.                                                                                                                                               |
| `CopyButton`         | `navigator.clipboard.writeText` con try/catch. Muestra un check durante 2 s y anuncia «Copiado» en una región `aria-live`. Tiene una variante solo ícono (32px) y otra con texto.                                                                                                                                                                 |
| `HighlighterService` | Shiki (ver abajo).                                                                                                                                                                                                                                                                                                                                |

**El código mostrado es el código real.** Cada ejemplo es un componente en su propio archivo, por ejemplo `pages/docs/components/button/examples/button-variants.example.ts`. La pestaña Código muestra ese mismo archivo, importado como texto con el atributo de importación del builder de Angular:

```ts
import { ButtonVariantsExample } from './examples/button-variants.example';
// @ts-expect-error TypeScript todavía no tipa los import attributes (spec, sección 10).
import buttonVariantsSource from './examples/button-variants.example' with { loader: 'text' };
```

```html
<app-code-preview [code]="buttonVariantsSource">
  <app-button-variants-example />
</app-code-preview>
```

- El atributo tiene prioridad sobre el cargador de TypeScript: el mismo archivo se importa como componente y como texto. Funciona con `ng build`, `ng serve` y `ng test`, y con `module: preserve`.
- TypeScript no admite tipos según el atributo, y un `.d.ts` con comodín no sirve para un `.ts`. Por eso cada una de esas importaciones lleva `@ts-expect-error`.
- Nunca se escribe el código de un ejemplo dos veces.
- Los ejemplos importan los componentes igual que en el proyecto del usuario (`import { MimiButton } from '@/components/ui/button'`). En el monorepo lo resuelve el alias `@/components/ui/*` → `packages/ui-core/src/lib/components/*` de `tsconfig.base.json`.

**Resaltado con Shiki** (`shiki` 4.4.3, `@shikijs/langs` y `@shikijs/themes`):

- Se usa solo el núcleo (`shiki/core`) con el motor de expresiones regulares en JavaScript (`shiki/engine/javascript`, sin WebAssembly). Los lenguajes son `angular-html`, `angular-ts`, `html`, `typescript`, `css`, `bash` y `json`, y los temas `github-light` y `github-dark`.
- Se carga con `import()` dinámico la primera vez que se pide, y todas las llamadas comparten una sola instancia. No entra en el bundle inicial: cada lenguaje, tema, el núcleo y el motor quedan en chunks diferidos.
- Usa el modo dual (`defaultColor: false`): los colores quedan en `--shiki-light` y `--shiki-dark`, y `styles.css` elige según `.dark`. Cambiar de modo no vuelve a resaltar.
- Con `structure: 'inline'` Shiki devuelve solo los `<span>`: el `<pre>` es nuestro y usa `bg-muted`, como el diseño, en lugar del fondo del tema.
- Mientras Shiki carga, se muestra el código sin colores con la misma fuente e interlineado, así la página no salta.
- Lo resaltado se guarda en el servicio (por lenguaje y código) y `peek()` lo devuelve sin esperar. CodePreview resalta su código por adelantado cuando el navegador está libre (`requestIdleCallback`, o `setTimeout` donde no existe), y `CodeBlock` empieza con `peek()`: al abrir la pestaña Código, el código sale con colores desde el primer pintado.
- Shiki pone los colores en atributos `style`, que el sanitizador de Angular eliminaría. `DomSanitizer.bypassSecurityTrustHtml` se usa **solo** para su salida, en `HighlighterService`: el contenido es código fuente propio y estático, nunca texto del usuario.

**Pestañas (tarea 5.11).** CodePreview e InstallCommand usan `<mimi-tabs preserveContent>`, el mismo componente que copia el usuario: roles, `aria-selected`, `aria-controls`, `aria-labelledby`, foco itinerante, flechas con vuelta, Inicio y Fin vienen de Tabs.

- CodePreview: píldora de `w-52` (las columnas son iguales) y el botón Copiar en posición absoluta a la derecha, pero **antes** de las pestañas en el DOM: el orden de Tab es Copiar → pestaña elegida → panel. La línea de la barra es el `border-t` de los paneles, y su anillo de foco va hacia dentro (`focus-visible:-outline-offset-2`) porque la tarjeta recorta (`overflow-hidden`).
- InstallCommand: subrayado de `w-64`, indicador en `foreground` (el de Tabs) y la línea a todo el ancho con el `border-t` del panel.
- `mimi-tabs` lleva `style="gap: 0"`: el estilo estático de la plantilla gana al del anfitrión (`gap: 14px`).
- El contenido es diferido: el panel Código se crea al elegirlo (una página con muchos ejemplos ya no resalta todos al cargar; el resaltado por adelantado corre en tiempo libre) y `preserveContent` conserva la vista previa, con su estado, al ir y volver.
- El panel visible es enfocable (`tabindex="0"`, de aria): en Código hay dos paradas, el panel y el `<pre>`. Se decidió dejarlo así.
- Pruebas: `code/code-preview.testing.ts` tiene `settle()` (Tabs crea los paneles en un `afterRenderEffect`, así que un solo `whenStable` no alcanza) y `examples()`, que devuelve el lienzo de cada ejemplo y su `code()`. Las pruebas de páginas leen el código con `examples()`; que el panel Código lo muestre lo prueban `code-preview.spec.ts` y `dev/code-page.spec.ts`.

**Accesibilidad.** El `<pre>` tiene `tabindex="0"` y un `aria-label`, para recorrer el scroll horizontal con el teclado.

**Presupuestos separados (G1.1, paso A).** Tailwind genera en el CSS global las clases de todos los componentes de ui-core, aunque sus páginas sean lazy, así que el CSS inicial crece con cada componente. El presupuesto `initial` mezcla JS y CSS, y su objetivo era detectar JS que se cuele al bundle inicial (como pasó con `@angular/forms`). Por eso se separan:

| Qué mide                                  | Dónde                                    | Aviso  | Error  | Al separarlos (crudo / gzip) |
| ----------------------------------------- | ---------------------------------------- | ------ | ------ | ---------------------------- |
| JS inicial completo                       | `apps/docs/scripts/check-initial-js.mjs` | 345 kB | 360 kB | 318.11 / 100.24 kB           |
| `main` (JS de la app)                     | `angular.json`, budget `bundle` `main`   | 140 kB | 145 kB | 135.68 kB                    |
| CSS global                                | `angular.json`, budget `bundle` `styles` | 160 kB | 175 kB | 80.77 / 12.24 kB             |
| Todo lo inicial (JS inicial + CSS global) | `angular.json`, budget `initial`         | 505 kB | 535 kB | 398.88 kB                    |

**Regla del `initial`:** es la suma de los avisos y la suma de los errores del JS inicial y del CSS global (aviso 345 + 160 = 505 kB; error 360 + 175 = 535 kB). Si cambia uno de los dos, el `initial` se actualiza con la misma fórmula.

- **Por qué un script para el JS inicial.** Ningún tipo de budget de Angular lo mide solo: `initial` suma el CSS, `bundle` solo encuentra archivos con nombre y el chunk compartido inicial (donde está `@angular/core` y donde cae lo que se cuela) no lo tiene, y `anyScript` mide cada archivo por separado. El script suma lo que `index.html` carga al inicio (el `<script type="module">` y los `<link rel="modulepreload">`) y corre después de `ng build docs` en `pnpm build:docs`, así que también en `pnpm build` (al cerrar cada tarea) y en el build de Cloudflare. Lo prueba `apps/docs/src/app/initial-js.spec.ts`.
- **El CSS tiene margen para el Grupo 1:** 80.77 kB, más 2.13 kB de `@angular/cdk/overlay-prebuilt.css`, más unos 12 componentes a 1–1.5 kB cada uno, da unos 98–101 kB. En gzip crece muy poco.
- **Cómo se informa:** el script da crudo, gzip y brotli del JS inicial y del CSS global. Los umbrales son sobre el crudo, como los budgets. La columna «Estimated transfer size» del build de Angular es **brotli**, no gzip: las cifras «gzip» de las tareas anteriores (98.96 kB, etc.) eran en realidad brotli. Al separarlos, el inicial era 98.97 kB en brotli y el JS inicial 100.24 kB en gzip.
- No se sube ninguno sin decidirlo. Si el JS inicial crece, primero se investiga (`ng build docs --stats-json`).
- **JS inicial: de 325/335 a 335/350 kB (antes de la G1.2, decidido por el usuario).** esbuild mueve al chunk inicial funciones pequeñas compartidas (de rxjs y de `@angular/core`) cuando una ruta lazy las usa: con Popover fueron +4.0 kB (ver abajo, «JS inicial con el primer componente de `@angular/cdk`»). No son fugas. El límite está para detectar fugas grandes, de 10 kB o más, como fue `@angular/forms`. El techo de `initial` (430/450 kB) no cambió: se fijó como 325 + 105 kB y hoy suma 408 kB.
- **CSS global: de 105/115 a 120/135 kB (después de la G1.6, decidido por el usuario).** El CSS global crece con cada componente del catálogo, unos 2–4 kB crudos y unos 0,4 kB gzip por componente, porque Tailwind genera las clases de todos aunque sus páginas sean lazy (la estimación de arriba, 1–1.5 kB, quedó corta). Con Dialog llegó a 101.28 kB crudo (15.28 kB gzip) y quedan 5 componentes del Grupo 1. Se revisa al empezar cada grupo nuevo; el control estricto sigue siendo el del JS inicial. En el mismo cambio, el `initial` pasó de 430/450 a 455/485 kB con la regla de arriba (venía de 325 + 105 y no se había actualizado al subir el JS inicial); hoy suma 426.61 kB.
- **Al cerrar el Grupo 1 (después de la G1.11, decidido por el usuario):** JS inicial de 335/350 a **345/360 kB**, por el runtime de `@defer` (unos 6,5 kB crudos, una sola vez; lo trajo el selector diferido de Pagination) y el crecimiento normal del grupo; el límite sigue sirviendo para detectar fugas de 10 kB o más. CSS global de 120/135 a **130/145 kB**, por el catálogo; se revisa de nuevo al empezar el Grupo 2. `initial` de 455/485 a **475/505 kB** con la regla de arriba. Al subirlos: JS inicial 333.76 / 105.13 kB y CSS global 119.99 / 17.66 kB (crudo / gzip).
- **Grupo 2: medir primero (decidido por el usuario el 03/11/2026).** Ningún presupuesto se sube ahora. El **aviso** (CSS global 130 kB, `initial` 475 kB) no rompe el build: solo lo marca; el **error** (CSS global 145 kB, `initial` 505 kB) lo rompe. (Es lo que hacen los budgets de Angular con `maximumWarning` y `maximumError`; se comprueba en el build real la primera vez que salte un aviso, sin provocarlo.) Cada tarea del grupo informa el CSS global y el JS inicial, crudo y gzip, antes y después, y la G2.P lleva la tabla acumulada (CSS global e `initial`, crudo y gzip, por componente). Cuando un componente deje el CSS global cerca del error, el usuario decide con esa tabla y el gzip real. Estos presupuestos son del sitio de documentación: un proyecto que usa Mimi solo genera el CSS de los componentes que copia. Ningún presupuesto se sube sin la decisión del usuario.
- **Un aviso no rompe el build** (comprobado en la G2.10 con el budget `main`; la medición, en `docs/historial/plan-grupo-2.md`). Desde la M.13, una página nueva ya no suma a `main`: su ruta va en `pages/docs/docs.routes.ts` (diferido con `loadChildren`) y su entrada de `DOCS_NAV` solo la cargan el layout de docs y el menú móvil al abrirse.
- **`main` y el optimizador de chunks (M.13).** El build pasa los chunks de esbuild por rolldown, con `main` como única entrada (`chunk-optimizer` de `@angular/build`, desde 3 chunks diferidos). Según cómo `main` importe los chunks diferidos, rolldown puede juntar el chunk compartido del framework (unos 194 kB: `@angular/core`, el router, rxjs) dentro de `main`: el JS inicial no crece, pero el budget de `main` (que mide solo ese archivo) se rompe. Medido con un `@defer` en el menú móvil del shell: `main` pasó de 142,64 a 329,95 kB. Antes de diferir algo que esté en el shell, comprobar `main` y el reparto de los chunks iniciales, no solo el JS inicial.
- **Grupo 2: CSS global de 130/145 a 160/175 kB (decidido por el usuario el 05/11/2026), solo en el sitio de documentación.** Con la G2.7 Slider, el CSS global llegó a 140,98 / 20,50 kB (crudo / gzip), a 4,02 kB del error, con cuatro componentes del grupo por delante (unos 2 kB crudos y 0,3 kB gzip cada uno). El `initial` pasó de 475/505 a **505/535 kB** con la regla de arriba (los mismos +30 kB, porque incluye el CSS). El JS inicial (345/360 kB) y `main` (140/145 kB) no cambian. Cada informe da también el peso de `theme-base.css` solo (lo que recibe un proyecto que usa Mimi) y cuánto del CSS global del showcase viene de los ejemplos.
- **Trampas de tamaño encontradas en la G2.1:**
  - **JS inicial:** esbuild quita de `@angular/core` las instrucciones que nadie usa en todo el bundle, y `@angular/core` vive en un chunk inicial. Si un componente lazy usa una instrucción de plantilla que ninguna otra parte usa, esa instrucción entra en el JS inicial aunque el componente no. Medido: un `[style]="objeto"` (`ɵɵstyleMap`) en Toggle Group sumó 0,96 kB al chunk inicial; con bindings `[style.x]` sueltas (ya usadas) volvió a 0. Antes de usar una sintaxis de plantilla nueva en un componente, comprobar el JS inicial.
  - **CSS global:** las variantes encadenadas (`data-[state=on]:data-[multiple]:data-[variant=solid]:…`) y los `calc()` largos en valores arbitrarios generan selectores muy largos. En Toggle Group, elegir las clases de cada estado en TypeScript y llevar la geometría del indicador a `style` bajó su aporte de +6,66 kB a +3,24 kB crudo, con el mismo aspecto.
- **Al cerrar cada tarea:** si el JS inicial crece más de 1 kB, se informa qué módulos entraron y por qué (comparando el `metafile` de `ng build docs --stats-json` con y sin el cambio, como en la G1.1).

Historia del presupuesto único `initial` (hasta la G1.1): aviso a partir de 400 kB y error a partir de 420 kB. Después de la tarea 2.2 medía 353.3 kB (95 kB en brotli); después de la 2.11, 364.7 kB (96.9 kB); después de la T.1, 388.31 kB (98.96 kB).

**Por qué subió el aviso (tarea T.1, de 380 a 400 kB; el error sigue en 420 kB).** La T.1 sumó unos 20 kB de CSS (52.14 → 72.51 kB; JS 315.60 → 315.80 kB): las variables nuevas del tema (tonos, sombras de color y glow, de tres capas con `color-mix`, en claro y oscuro) y los respaldos `@supports` que Tailwind (Lightning CSS) agrega a todo lo que usa `color-mix` (13.5 kB del archivo), más las muestras de `/dev/tokens` y `/dev/theme` (6.4 kB). En gzip fue solo +1.3 kB (97.65 → 98.96 kB). No se sube otra vez sin decidirlo: los componentes con `@angular/cdk` y `@angular/aria` llegan solo en rutas diferidas (tarea G1.1).

**Por qué subió el presupuesto (tarea 2.11, de 370/410 a 380/420 kB).** Entre las tareas 2.2 y 2.11 el bundle inicial creció 11.2 kB (medido con el `metafile` de esbuild, `ng build docs --stats-json`):

- **CSS: +7.5 kB** (42.8 → 50.3 kB). Las clases de los componentes nuevos (Card, Separator, Skeleton, Avatar, Switch, Checkbox, FormField) y de sus páginas. Es esperado: Tailwind escanea todo `ui-core` (`@source`) y las páginas, aunque estas sean diferidas, y todo el CSS va en `styles.css`.
- **JS: +3.7 kB** (310.6 → 314.4 kB), todo justificado:
  - Mensajes de error en español (`form-field/error-messages.ts`, 1.2 kB): el showcase registra `provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)` en `app.config.ts`. Se importa el archivo concreto, así `@angular/forms` no entra.
  - Rutas nuevas (`app.routes.ts`, 1.1 kB): una por página, todas diferidas.
  - APIs de `@angular/core` (unos 2 kB): `model`, `contentChild`, `booleanAttribute`, `numberAttribute`, `afterRenderEffect`, `untracked`… Las usan solo componentes diferidos, pero esbuild no parte un módulo de Angular entre chunks: van en el chunk de `@angular/core`, que es inicial. No se puede evitar desde el showcase.

Si el crecimiento es CSS de componentes o APIs de Angular, se sube el límite con el mismo margen; si aparece JS de una página o de una dependencia diferida, primero se investiga.

**JS inicial con el primer componente de `@angular/cdk` (G1.1, Popover): +4.0 kB** (318.11 → 322.18 kB). Ningún módulo de cdk ni de Popover está en el bundle inicial (comprobado con `--stats-json`: todo el CDK va en el chunk de la página). Lo que entra es código compartido que esbuild asigna por archivo, no por lo que de verdad usa cada entrada: un archivo al que también llega el bundle inicial (por el índice de `rxjs`, que usa el router, o por el de `@angular/core`) va al chunk inicial en cuanto una ruta diferida lo usa. Pasa igual con el paso de optimización de chunks de Angular desactivado (`NG_BUILD_OPTIMIZE_CHUNKS=false`, solo para diagnosticar):

- **rxjs, unos 3.5 kB:** `auditTime`, `timer`, `takeWhile` y los schedulers, que el CDK usa por dentro (ScrollDispatcher y CdkConnectedOverlay). No se puede evitar desde Mimi; le pasará igual a cualquier app con el router y el CDK.
- **`@angular/core`, unos 1.2 kB:** APIs que solo usa Popover (`afterNextRender`, `ViewContainerRef`…).
- **Evitado:** `NgTemplateOutlet` traía 1.6 kB de `@angular/common` (su módulo entero). Popover usa en su lugar una directiva interna de tres líneas (`MimiPopoverOutlet`) y `DOCUMENT` de `@angular/core`. Regla para los próximos componentes: no importar de `@angular/common` lo que `@angular/core` ya trae.

**JS inicial con el primer componente de `@angular/aria` (G1.3, Dropdown Menu): +2.0 kB** (322.45 → 324.38 kB crudo; 101.56 → 102.08 kB gzip). Ningún módulo de aria, del CDK ni del menú está en el bundle inicial (`--stats-json`, con y sin la ruta). Lo que entra:

- **`@angular/core`, 2.1 kB:** el soporte de `hostDirectives` (`ɵɵHostDirectivesFeature`). Lo pide el `ngMenu` de aria, que trae `DeferredContentAware` como host directive. Vive en el mismo archivo de core que el resto del runtime, así que va al chunk inicial. Se paga una sola vez: los próximos componentes con aria (Select, Tabs) no lo vuelven a sumar. mimi-toolbar no usa aria (G1.10).
- **La ruta nueva**, 0.2 kB (`app.routes.ts` y el router).
- Se probó quitar la herencia de directivas de los ítems: no cambia nada (`@angular/core` ya la incluía).

**Dialog (G1.6): +0.40 kB de JS inicial** (324.93 → 325.33 kB crudo; 102.22 → 102.33 kB gzip): la ruta nueva. El Dialog y `@angular/cdk/dialog` quedan en el chunk de su página. **CSS global: +2.97 kB** (98.31 → 101.28 kB crudo; 14.90 → 15.28 kB gzip); el aviso del CSS está en 105 kB.

**Select (G1.5): +0.13 kB de JS inicial** (324.80 → 324.93 kB crudo; 102.20 → 102.22 kB gzip), la ruta nueva. El Select, aria y el CDK quedan en el chunk de su página. Los textos en español se proveen en la página y no en `app.config.ts`. **CSS global: +4.47 kB** (93.84 → 98.31 kB crudo; 14.33 → 14.90 kB gzip): las clases del Select (las de `has-[[role=combobox]:focus]` son largas) y las de sus nueve ejemplos.

**Íconos del layout en línea:** los íconos del header y del panel móvil (menú, cerrar, sol, luna y GitHub) son SVG en línea con los trazos de Lucide, no `@lucide/angular`. Si el layout usara el paquete, esbuild pondría en el chunk compartido con el bundle inicial todos los íconos de las páginas diferidas (llegó a 60 kB). Las páginas y los ejemplos sí usan `@lucide/angular`. Si un cambio lo acerca al aviso, hay que averiguar por qué antes de subir el límite: así se detectó que `@angular/forms` entraba en el bundle inicial por el índice de utils.

**Bundle inicial** en la tarea 1.7 (producción): pasó de 313.5 kB (79.7 kB en transferencia) a 336.3 kB (84.3 kB). Shiki no está en el bundle inicial. La diferencia se reparte así:

- 14.8 kB de `@lucide/angular`: esbuild pone en un chunk compartido el código que usan a la vez el bundle inicial y los chunks diferidos, y ahí caen los íconos de copiar, check, código y ojo.
- 6.3 kB de `@angular/core`: partes del framework que usan los componentes nuevos, como `effect` y `viewChildren`.
- 1.4 kB de `platform-browser`.

### Despliegue

El showcase se publica en **https://ng.mimiworks.dev** con **Cloudflare Workers** (solo archivos estáticos, sin script). Se eligió Workers y no Pages porque Cloudflare recomienda Workers para proyectos nuevos; la configuración queda en el repositorio.

- **`wrangler.jsonc`** (raíz): sirve `dist/docs/browser` con `not_found_handling: "single-page-application"`. Sin `*.workers.dev` ni URLs de vista previa (`workers_dev: false`, `preview_urls: false`): solo el dominio propio.
- **Build (Workers Builds, desde GitHub):** `pnpm build:docs` (`ng build docs`, sin la CLI), que antes ejecuta `apps/docs/scripts/check-public.mjs`: falla si `apps/docs/public` tiene archivos que no sean `.svg`, `.png`, `.ico`, `.webp` o `_headers`. Todo lo que está en `public/` se publica tal cual, y como Cloudflare compila desde GitHub, esa verificación es la última barrera para que un documento que cayó ahí por error no llegue al sitio (la prueba `public-files.spec.ts` ejecuta el mismo script). Un tipo nuevo se agrega a propósito en el script. Despliegue: `npx wrangler@4 deploy`. Wrangler no es dependencia del repositorio; la versión mayor se fija en el comando y se revisa según la sección 12.
- PENDIENTE: el usuario comprueba en Cloudflare, Settings → Builds, si hay un repositorio conectado; si lo hay, cada push a main publica el sitio. Cuando lo confirme, se corrige esta sección (y la sección 2) con el dato.
- **Versiones del build:** Node en `.node-version` (24.18.0, dentro del rango de Angular 22); pnpm con la variable `PNPM_VERSION` del panel, igual a `packageManager` (12.5.1).
- **Rutas:** una ruta sin archivo entrega `index.html` con estado 200 y la resuelve Angular. Recargar `/docs/components/button` funciona, y una ruta inexistente muestra la 404 del showcase, pero con estado **200** (soft 404). Por eso la 404 agrega `<meta name="robots" content="noindex">` mientras se muestra. El estado 404 real llega con el prerender (tarea 5.14).
- **Caché:** `apps/docs/public/_headers` (Angular lo copia a la salida) marca `main-*`, `chunk-*`, `polyfills-*` y `styles-*` como `public, max-age=31536000, immutable`: llevan hash (`outputHashing: all`). `index.html`, `favicon.ico` y `avatars/` quedan con la caché por defecto de Cloudflare (`max-age=0, must-revalidate` con ETag). Si se agrega un archivo sin hash con esos prefijos, hay que sacarlo de `_headers`.
- **Dominio:** Custom Domain del Worker (Cloudflare crea el registro DNS y el certificado); el subdominio no debe tener un CNAME previo.

### Pendiente

- **Páginas:** Personalización, Tema (`/docs/theme`, sección 11 y plan 5.2), Iconos, Migrar desde PrimeNG / NG-ZORRO y una página por componente. Select y Dialog tienen su página desde la G1.5 y la G1.6.
- **Página de componente:** título, descripción, `InstallCommand`, un `CodePreview` por estado (cada ejemplo en su archivo `examples/*.example.ts`), ejemplo con `class` y tabla de API.
- Prerender para generar páginas estáticas y responder 404 con estado real (tarea 5.14).

**Landing (`/`, tarea 2.12)** según `docs/design/Mimi Sitio.dc.html`: hero (badge con la versión, «v0.1.0 · Vista previa» mientras sea 0.x, titular, subtítulo, `ng add @mimi-ng/cli` con `CodeBlock` y botones «Empezar» → `/docs/installation` y «Componentes» → `/docs/components/button`), cuatro diferenciales y la vitrina «Hecho con Mimi» (`pages/home/`: un formulario real con Reactive Forms y una lista de equipo). Reglas:

- **Honestidad:** lo que todavía no existe (`mimi update`, la guía de migración) lleva «Próximamente» y no enlaza. Ningún enlace lleva a una página deshabilitada o a un 404: una prueba compara los `href` con las rutas `ready` de `DOCS_NAV`. Los textos públicos no mencionan las fases del plan.
- **Bundle:** la ruta es lazy; los componentes de la vitrina y `@lucide/angular` no entran al bundle inicial (comprobado con el `metafile`).
- **Título y descripción:** la ruta tiene `title` y `index.html` trae el mismo `<title>` y un `<meta name="description">`: sin SSR, es lo que leen los buscadores y las vistas previas.
- **Tamaños que el diseño no define:** el titular baja de 60px a 40px bajo `md`, el padding del hero de 96/72 a 64/48px, y la vitrina se apila bajo `lg`.

## 11. Tema

- Mimi tiene **un solo tema base: Mimi**. Cada persona lo adapta: de fábrica se llama «Mimi»; cuando el usuario cambia algo (con el preset o con la página «Tema»), es «Mi tema». No hay temas ni estilos alternativos, ni variantes propias en `mimi.preset.ts`.
- **Página «Tema» (`/docs/theme`, plan 5.2):** página sencilla del showcase, lazy, en Primeros pasos. Cambia solo variables globales: el color principal (unas muestras de color y un `<input type="color">` nativo, sin depender del Color Picker), el radio, y claro u oscuro para previsualizar. Muestra una vista previa con componentes reales y copia el resultado como CSS (`:root` y `.dark`; la salida de `mimiThemeToCss` usa `:root:not(.dark)` para el claro, por la razón de la sección 6.4) y como preset de `provideMimiTheme()`. Usa el mismo sistema que el usuario: arma un `MimiThemePreset` y lo aplica con `applyMimiTheme` / `mimiThemeToCss` (el CSS copiado es la salida de `mimiThemeToCss`), sin otro camino ni variables propias. Sin guardar, sin cuentas y sin edición por componente. El editor completo (Theme Studio) es un proyecto aparte: `docs/futuro/theme-studio.md`.
  - **Implementada en la 5.2 (04/11/2026).** Controles (valores del diseño `Sitio`, vista «Temas»): color principal con las muestras Neutro, Violeta, Esmeralda, Azul y Naranja (oklch) en un Toggle Group (`radiogroup`) y un `<input type="color">` («Otro color», hex); **radio** 0, 4, 8, 12 (de fábrica) y «Total» (9999px); **densidad** (el alto de control): Compacta 36px, Normal 40px (de fábrica) y Cómoda 44px. **Preset:** solo globales, con los nombres de `theme/types.ts`: `radius`, `colors` y `darkColors` (el mismo `primary`, `primaryForeground` y `ring` en los dos modos) y `controls.height`; de fábrica es un preset vacío. **Texto sobre el principal:** se calcula (el claro `oklch(0.99 0 0)` del diseño o el oscuro `oklch(0.145 0 0)`, el que más contraste); si ninguno llega a 4,5:1, la sección «Exportar» muestra el aviso antes de los botones de copiar. **Vista previa:** Card, Input, Badge, Switch, Checkbox, Toggle Group y Button reales; el modo oscuro de la vista previa pone `.dark` solo en su contenedor (decidido por defecto en la 5.2: no cambia el modo del sitio). Límite: con el sitio en oscuro, la vista previa también lo está (los valores claros del tema viven en `:root`), y la página lo explica. **Exportar:** el preset como código para `app.config.ts` (`provideMimiTheme` y `MimiThemePreset`, importados de `@/components/ui/theme`) y el CSS (la salida de `mimiThemeToCss`), cada uno con su botón de copiar. Se aplica con `applyMimiTheme` y, al salir de la página (otra ruta o el componente destruido), vuelve el preset de la app (`MIMI_THEME`) o ninguno. Nada va a `localStorage` ni a la URL.
- **El tema Mimi:** paleta neutra (primario casi negro en claro, casi blanco en oscuro), radio 12px, sombras en capas (las de primary y destructive teñidas de su color), fuente Outfit y micro-animaciones (escala al hacer clic, transiciones suaves de color y sombra). Inspirado en Vuesax sin copiarlo.
- Los tokens están en `docs/design/tokens-mimi.css` (catálogo completo en la sección 13). El primario se cambia con el preset.
- **`mimi.json`:** guarda `"style": "mimi"` (para la 0.1.0, ver la sección 12).

## 12. Política de versiones

### Versionado de Mimi

Mimi usa versionado semántico propio, independiente del de Angular: `0.x` mientras está en desarrollo y `1.0` cuando la API sea estable.

- **Mayor:** cambios que rompen. Por ejemplo, renombrar una entrada de un componente o subir la versión mínima de Angular.
- **Menor:** componentes o funciones nuevas.
- **Parche:** correcciones.

La versión está en un solo lugar: `packages/cli/package.json`. De ahí la toman el showcase (`SITE.version`), el build de la CLI (que la escribe en `dist/registry.json`) y, a través del registro, `.mimi/manifest.json` y `mimi.json` en los proyectos. ui-core no tiene versión: se entrega dentro de la CLI. Las pruebas `registry.spec.ts` (CLI) y `site.spec.ts` (showcase) fallan si alguna quedara distinta.

### Versiones de Angular soportadas

Mimi soporta las versiones de Angular con soporte oficial (activo o LTS). Cuando Angular retira una, Mimi sube su mínimo en una versión **mayor** y actualiza:

- la verificación de `init` (`MIN_ANGULAR` en `packages/cli/src/init/index.ts`);
- el rango de la CLI (`@angular-devkit/*` y `@schematics/angular` en `packages/cli/package.json`) y las `peerDependencies` de ui-core;
- la tabla de compatibilidad.

### El código copiado es del usuario

Lo que la CLI copia al proyecto es código del usuario: se actualiza con `ng update` junto al resto de su proyecto y no depende de una versión de Mimi instalada. `@mimi-ng/cli` solo se necesita para agregar componentes o actualizarlos con `mimi update` (tarea 5.4).

### Compatibilidad que se quita en la 1.0

- **`destructive-soft` → `destructive-ring`** (tarea T.1). En la 0.1.0, `--mimi-destructive-soft` (y la clase `ring-destructive-soft`) era el anillo de destructive. Desde la T.1 se siguen la convención `<tono>-soft` = fondo suave y `<tono>-ring` = anillo: el anillo es `--mimi-destructive-ring` y el fondo suave, `--mimi-destructive-soft-bg`. Hasta la 1.0, `--mimi-destructive-soft` y `--color-destructive-soft` quedan como **alias** del anillo (`theme-base.css`, con un comentario), así que el código copiado de la 0.1.0 que use `ring-destructive-soft` sigue igual. Lo comprueban `provider.spec.ts` y `cn.spec.ts`.
- **En la 1.0, `destructive-soft` cambia de significado:** deja de ser el color del anillo y pasa a ser el fondo suave (y `destructive-soft-bg` desaparece). El código copiado que use `ring-destructive-soft` **seguirá compilando, pero con otro color, sin ningún error**. Por eso:
  - antes de la 1.0, la nota de versión debe pedir buscar `destructive-soft` en el proyecto y cambiarlo a `destructive-ring`;
  - cuando exista `mimi update` (tarea 5.4), que avise si encuentra esa clase.

- **`style` de `mimi.json`:** la 0.1.0 escribe `"vivid"`; se acepta como sinónimo de `"mimi"` y se deja de aceptar en la 1.0. (tarea V.2)
- **Nombres de tokens de la 0.1.0** (tarea T.0b). Siguen funcionando hasta la 1.0, como respaldo dentro de la cascada, y en modo desarrollo `provideMimiTheme` avisa una sola vez por cada uno que use el preset:
  - `components.button.paddingX` (`--mimi-btn-padding-x`) → `components.button.px` (`--mimi-btn-px`): `var(--mimi-btn-px, var(--mimi-btn-padding-x, 1rem))`.
  - `components.input.paddingX` (`--mimi-input-padding-x`) → `components.input.px` (`--mimi-input-px`), igual.
  - `components.input.placeholderColor` (`--mimi-input-placeholder-color`) → `--mimi-input-placeholder` en el CSS (es un color: no va en el preset).
  - `radii.badge` → `components.badge.radius`. Las dos generan la misma variable, `--mimi-badge-radius`.
  - Textarea usaba los tokens de Input; ahora tiene los suyos (`--mimi-textarea-*`), que caen en los de Input: no cambia nada para quien ya personalizó Input.
- **Atajos de variante de Button y Badge** (tarea V.1): `variant="default"`, `"secondary"` y `"destructive"` siguen funcionando como atajos de solid + primary / secondary / danger hasta la 1.0, sin error ni aviso (con `tone` a la vez, gana el atajo y avisa en modo desarrollo). En la 1.0 se quitan: `variant="destructive"` pasa a `tone="danger"`, `variant="secondary"` a `tone="secondary"` y `variant="default"` se borra.
- **`data-variant` y `data-tone` muestran los valores resueltos** desde la V.1: `variant="destructive"` produce `data-variant="solid" data-tone="danger"`. Quien tenga CSS propio sobre los atributos de la 0.1.0 debe cambiarlo, por ejemplo `[data-variant="destructive"]` pasa a `[data-tone="danger"]` y `[data-variant="default"]` pasa a `[data-variant="solid"][data-tone="primary"]`.

### Tabla de compatibilidad

| Mimi | Angular | Tailwind CSS |
| ---- | ------- | ------------ |
| 0.x  | 22+     | 4            |

### Rutina ante una versión nueva de Angular

1. Probar la versión candidata (RC) en una rama con `ng update`.
2. Correr todas las pruebas (`pnpm test`: showcase, ui-core y CLI) y `pnpm build`.
3. Revisar las novedades que afecten a Mimi: APIs de signals y formularios (`FormValueControl`, `FormCheckboxControl`), control de flujo, cambios en `@angular/cli` y `@schematics/angular` (`ng add`, `schematicCollections`, utilidades que usan `init` y `ui`).
4. Probar la CLI en un proyecto limpio creado con esa versión (`ng new` + `ng add @mimi-ng/cli` + `ng g mimi …` + `ng build`).
5. Publicar declarando el soporte: actualizar rangos y la tabla de compatibilidad.

Con cada versión nueva de Angular, leer también las notas de `@angular/aria` (es reciente y la usan Select, los menús y Tabs; mimi-toolbar usa el `FocusKeyManager` del CDK) y de `@angular/cdk`, y correr las pruebas de esos componentes.

Lo mismo para Tailwind CSS: probar la versión nueva en una rama, correr las pruebas, revisar el CSS generado (tokens, `@theme inline`, `@source`, variantes) y probar la CLI en un proyecto limpio.

### Herramientas fijadas por versión mayor

- **wrangler** (despliegue del showcase): el comando de despliegue de Workers Builds es `npx wrangler@4 deploy`. Cuando salga una versión mayor nueva (`npm view wrangler version`), revisar sus cambios que rompen en `wrangler.jsonc` (`assets`, `not_found_handling`, `workers_dev`, `preview_urls`) y en `_headers`, cambiar la mayor en el comando del panel de Cloudflare y en esta spec (secciones 2 y 10), y comprobar en el sitio que recargar una ruta, la 404 y los encabezados de caché sigan funcionando.
- **Node y pnpm del build:** `.node-version` y la variable `PNPM_VERSION` del panel se actualizan junto con la sección 2 (`packageManager` y el rango de Node que exige Angular).

## 13. Tokens

Catálogo de los tokens del tema Mimi en tres niveles (tarea T.0). Va al final para no renumerar las secciones que citan el código y los documentos; amplía las secciones 6.1 a 6.3.

**Fuentes** (en `docs/design/`): `mimi-tokens-data.js`, la hoja de tokens en datos (se ve en `Mimi Tokens.dc.html`); `tokens-mimi.css`, con los globales y los compartidos en claro y oscuro; y `mimi-variables-componentes.css`, con los tokens por componente. Ningún valor de esta sección se inventa: lo que la hoja no defina, se pregunta.

**Cobertura:** la hoja cubre 21 componentes: los 11 de la 0.1.0 y los del Grupo 1. Los 12 del Grupo 2 (y el chip compartido) tienen su tabla desde la G2.0 (04/11/2026), sacada de los diseños de la Fase 3 y de `F5 Estructura` (la hoja no los tiene): 33 componentes en total. Los Grupos 3 a 5 agregan sus tokens (y su tabla aquí) con cada tanda de diseño, antes de construirlos.

### Niveles

1. **Globales:** colores, derivados, forma, profundidad, movimiento y tipografía de todo Mimi. En el preset, `colors`, `radii`, `shadows`, `fonts` y `motion`.
2. **Compartidos:** los que comparte una familia de componentes para quedar alineados (alturas de control, foco, deshabilitado, íconos). En el preset, `controls`.
3. **Por componente:** `--mimi-<prefijo>-<propiedad>` (`--mimi-btn-px`). Heredan de un compartido o de un global con la cascada de la sección 6.2 y se configuran con `components.<nombre>` del preset.

### Nivel 1: globales

#### Colores

Cada color de superficie o de acción tiene su pareja de texto (`-foreground`): quien cambie uno cambia también el otro, y la pareja pasa 4,5:1 (AA; lo comprueba `contrast.spec.ts` con los valores de fábrica).

| Variable                        | Qué controla             | Claro                       | Oscuro                      | Texto encima                    |
| ------------------------------- | ------------------------ | --------------------------- | --------------------------- | ------------------------------- |
| `--mimi-background`             | Fondo de la página       | `oklch(1 0 0)`              | `oklch(0.145 0 0)`          | `--mimi-foreground`             |
| `--mimi-foreground`             | Texto principal          | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`          | —                               |
| `--mimi-card`                   | Superficie de tarjetas   | `oklch(1 0 0)`              | `oklch(0.175 0 0)`          | `--mimi-card-foreground`        |
| `--mimi-card-foreground`        | Texto sobre tarjetas     | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`          | —                               |
| `--mimi-popover`                | Menús, diálogos y toasts | `oklch(1 0 0)`              | `oklch(0.205 0 0)`          | `--mimi-popover-foreground`     |
| `--mimi-popover-foreground`     | Texto sobre popover      | `oklch(0.145 0 0)`          | `oklch(0.985 0 0)`          | —                               |
| `--mimi-primary`                | Acción principal         | `oklch(0.205 0 0)`          | `oklch(0.922 0 0)`          | `--mimi-primary-foreground`     |
| `--mimi-primary-foreground`     | Texto sobre primary      | `oklch(0.985 0 0)`          | `oklch(0.205 0 0)`          | —                               |
| `--mimi-secondary`              | Acción secundaria        | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | `--mimi-secondary-foreground`   |
| `--mimi-secondary-foreground`   | Texto sobre secondary    | `oklch(0.205 0 0)`          | `oklch(0.985 0 0)`          | —                               |
| `--mimi-muted`                  | Fondos apagados          | `oklch(0.97 0 0)`           | `oklch(0.225 0 0)`          | `--mimi-muted-foreground`       |
| `--mimi-muted-foreground`       | Texto secundario         | `oklch(0.54 0 0)`           | `oklch(0.708 0 0)`          | —                               |
| `--mimi-accent`                 | Hover de ítems           | `oklch(0.97 0 0)`           | `oklch(0.269 0 0)`          | `--mimi-accent-foreground`      |
| `--mimi-accent-foreground`      | Texto sobre accent       | `oklch(0.205 0 0)`          | `oklch(0.985 0 0)`          | —                               |
| `--mimi-destructive`            | Acciones peligrosas      | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | `--mimi-destructive-foreground` |
| `--mimi-destructive-foreground` | Texto sobre destructive  | `oklch(0.985 0 0)`          | `oklch(0.2 0.04 25)`        | —                               |
| `--mimi-success`                | Éxito                    | `oklch(0.527 0.137 150)`    | `oklch(0.72 0.15 150)`      | `--mimi-success-foreground`     |
| `--mimi-success-foreground`     | Texto sobre success      | `oklch(0.985 0 0)`          | `oklch(0.2 0.05 150)`       | —                               |
| `--mimi-warning`                | Advertencia              | `oklch(0.795 0.162 75)`     | `oklch(0.81 0.15 78)`       | `--mimi-warning-foreground`     |
| `--mimi-warning-foreground`     | Texto sobre warning      | `oklch(0.28 0.07 55)`       | `oklch(0.22 0.05 60)`       | —                               |
| `--mimi-info`                   | Información              | `oklch(0.546 0.19 255)`     | `oklch(0.72 0.14 250)`      | `--mimi-info-foreground`        |
| `--mimi-info-foreground`        | Texto sobre info         | `oklch(0.985 0 0)`          | `oklch(0.2 0.05 250)`       | —                               |
| `--mimi-border`                 | Bordes y separadores     | `oklch(0.922 0 0)`          | `oklch(1 0 0 / 10%)`        | —                               |
| `--mimi-input`                  | Borde de campos          | `oklch(0.88 0 0)`           | `oklch(1 0 0 / 15%)`        | —                               |
| `--mimi-ring`                   | Anillo de foco           | `oklch(0.708 0 0)`          | `oklch(0.556 0 0)`          | —                               |

#### Derivados

Se calculan con `color-mix` a partir de los colores, así que siguen al tema sin definirse a mano. Convención: `<tono>-soft` es el fondo suave, `<tono>-hover` el color en hover y `<tono>-ring` el anillo. Valores completos en `tokens-mimi.css`.

| Variable                                                            | Cómo se calcula                                                                                                                |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `--mimi-primary-hover`                                              | color-mix(in oklch, primary 88%, background)                                                                                   |
| `--mimi-secondary-hover`                                            | color-mix(in oklch, secondary 80%, foreground 6%)                                                                              |
| `--mimi-destructive-hover`                                          | color-mix(in oklch, destructive 88%, background) en oscuro; en claro, 88% con foreground (corrección de contraste, ver arriba) |
| `--mimi-ring-soft`                                                  | color-mix(in oklch, ring 32%, transparent)                                                                                     |
| `--mimi-success-soft`                                               | color-mix(in oklab, success 12%, background)                                                                                   |
| `--mimi-warning-soft`                                               | color-mix(in oklab, warning 12%, background)                                                                                   |
| `--mimi-info-soft`                                                  | color-mix(in oklab, info 12%, background)                                                                                      |
| `--mimi-shadow-primary`                                             | sombra en capas a partir de primary                                                                                            |
| `--mimi-shadow-success`                                             | sombra teñida con success                                                                                                      |
| `--mimi-glow`                                                       | brillo con primary al 22 %, 30 % y 16 %                                                                                        |
| `--mimi-destructive-soft-bg`                                        | color-mix(in oklab, destructive 12 %, background) (fondo suave de destructive)                                                 |
| `--mimi-success-ring`, `--mimi-warning-ring`, `--mimi-info-ring`    | color-mix(in oklch, <tono> 30–34 %, transparent)                                                                               |
| `--mimi-success-hover`, `--mimi-warning-hover`, `--mimi-info-hover` | color-mix(in oklab, <tono> 88 %, background)                                                                                   |

#### Forma, profundidad, movimiento y tipografía

| Variable                                          | Qué controla        | Valor por defecto                                                           |
| ------------------------------------------------- | ------------------- | --------------------------------------------------------------------------- |
| `--mimi-radius`                                   | Radio base          | `12px`                                                                      |
| `--mimi-radius-sm`                                | Radio pequeño       | `min(radius / 2, 6px)`                                                      |
| `--mimi-radius-card`                              | Radio de tarjetas   | `min(radius + 4px, 24px)`                                                   |
| `--mimi-badge-radius`                             | Radio de badges     | `999px`                                                                     |
| `--mimi-shadow-card`                              | Tarjetas            | en `tokens-mimi.css` (claro y oscuro)                                       |
| `--mimi-shadow-neutral`                           | Botones neutros     | en `tokens-mimi.css` (claro y oscuro)                                       |
| `--mimi-shadow-neutral-hover`                     | Hover neutro        | en `tokens-mimi.css` (claro y oscuro)                                       |
| `--mimi-shadow-primary`                           | Botón primary       | en `tokens-mimi.css` (claro y oscuro)                                       |
| `--mimi-shadow-primary-hover`                     | Hover primary       | en `tokens-mimi.css` (claro y oscuro)                                       |
| `--mimi-shadow-destructive`                       | Botón destructive   | en `tokens-mimi.css` (claro y oscuro)                                       |
| `--mimi-shadow-popover`                           | Menús y diálogos    | en `tokens-mimi.css` (claro y oscuro)                                       |
| `--mimi-glow`                                     | Opción glow         | en `tokens-mimi.css` (claro y oscuro)                                       |
| `--mimi-glow-primary` … `--mimi-glow-destructive` | Glow por tono       | en `tokens-mimi.css`                                                        |
| `--mimi-transition`                               | Transición base     | colores .2s, sombra .25s, `scale` .15s (Mimi anima `scale`, no `transform`) |
| `--mimi-press-scale`                              | Escala al presionar | `0.975`                                                                     |
| `--mimi-lift`                                     | Elevación en hover  | `0px`                                                                       |
| `--mimi-font-sans`                                | Texto               | `"Outfit", ui-sans-serif, system-ui`                                        |
| `--mimi-font-mono`                                | Código              | `"Geist Mono", ui-monospace`                                                |

### Nivel 2: compartidos

Los usan varios componentes para quedar alineados. Los tamaños (SM, MD y LG) los comparten todos los controles (Button, Input, Select…) y solo se cambian desde el modo Tema global.

| Variable                   | Qué controla                     | Hereda de               | Valor por defecto                 |
| -------------------------- | -------------------------------- | ----------------------- | --------------------------------- |
| `--mimi-control-height`    | Altura de controles · default    | —                       | `2.5rem` (40px)                   |
| `--mimi-control-height-sm` | Altura · sm                      | `--mimi-control-height` | `2rem` (control-height − 8px)     |
| `--mimi-control-height-lg` | Altura · lg                      | `--mimi-control-height` | `3rem` (control-height + 8px)     |
| `--mimi-focus-ring`        | Halo de foco en campos y botones | `--mimi-ring-soft`      | `0 0 0 3px var(--mimi-ring-soft)` |
| `--mimi-focus-outline`     | Contorno de foco con teclado     | `--mimi-ring`           | `2px solid var(--mimi-ring)`      |
| `--mimi-focus-offset`      | Separación del contorno          | —                       | `2px`                             |
| `--mimi-disabled-opacity`  | Opacidad deshabilitado           | —                       | `0.5`                             |
| `--mimi-icon-size`         | Ícono dentro de controles        | —                       | `1rem` (16px)                     |
| `--mimi-icon-size-sm`      | Ícono pequeño                    | —                       | `0.875rem` (14px)                 |

### Nivel 3: por componente

Una tabla por componente (21: los de la 0.1.0 y los del Grupo 1; más las del Grupo 2, propuestas en la G2.0). «Hereda de» indica el token del que toma su valor; si está vacío, el valor por defecto es propio. Los valores en px se pasan a rem al llevarlos a ui-core (16px = 1rem), como en `tokens-mimi.css`. Los Grupos 2 a 5 agregan sus tablas con cada tanda de diseño.

#### Button (`btn`)

| Variable                  | Qué controla          | Hereda de                     | Valor por defecto |
| ------------------------- | --------------------- | ----------------------------- | ----------------- |
| `--mimi-btn-bg`           | Fondo                 | `--mimi-primary`              | —                 |
| `--mimi-btn-fg`           | Texto e ícono         | `--mimi-primary-foreground`   | —                 |
| `--mimi-btn-bg-hover`     | Fondo en hover        | `--mimi-primary-hover`        | —                 |
| `--mimi-btn-border`       | Borde                 | —                             | `transparent`     |
| `--mimi-btn-radius`       | Radio                 | `--mimi-radius`               | —                 |
| `--mimi-btn-height`       | Altura                | `--mimi-control-height`       | —                 |
| `--mimi-btn-px`           | Relleno horizontal    | —                             | `16px`            |
| `--mimi-btn-gap`          | Espacio ícono y texto | —                             | `8px`             |
| `--mimi-btn-font-size`    | Tamaño de texto       | —                             | `14px`            |
| `--mimi-btn-font-weight`  | Peso                  | —                             | `500`             |
| `--mimi-btn-shadow`       | Sombra                | `--mimi-shadow-primary`       | —                 |
| `--mimi-btn-shadow-hover` | Sombra en hover       | `--mimi-shadow-primary-hover` | —                 |
| `--mimi-btn-ring`         | Halo al presionar     | `--mimi-focus-ring`           | —                 |
| `--mimi-btn-press-scale`  | Escala al presionar   | `--mimi-press-scale`          | —                 |

#### Input (`input`)

| Variable                    | Qué controla       | Hereda de                 | Valor por defecto |
| --------------------------- | ------------------ | ------------------------- | ----------------- |
| `--mimi-input-bg`           | Fondo              | `--mimi-input-background` | —                 |
| `--mimi-input-fg`           | Texto              | `--mimi-foreground`       | —                 |
| `--mimi-input-border`       | Borde              | `--mimi-input`            | —                 |
| `--mimi-input-border-hover` | Borde en hover     | `--mimi-input-hover`      | —                 |
| `--mimi-input-border-focus` | Borde con foco     | `--mimi-ring`             | —                 |
| `--mimi-input-ring`         | Halo con foco      | `--mimi-focus-ring`       | —                 |
| `--mimi-input-radius`       | Radio              | `--mimi-radius`           | —                 |
| `--mimi-input-height`       | Altura             | `--mimi-control-height`   | —                 |
| `--mimi-input-px`           | Relleno horizontal | —                         | `12px`            |
| `--mimi-input-placeholder`  | Placeholder        | `--mimi-muted-foreground` | —                 |
| `--mimi-input-error`        | Borde con error    | `--mimi-destructive`      | —                 |

#### Textarea (`textarea`)

| Variable                      | Qué controla     | Hereda de                 | Valor por defecto                               |
| ----------------------------- | ---------------- | ------------------------- | ----------------------------------------------- |
| `--mimi-textarea-bg`          | Fondo            | `--mimi-input-background` | —                                               |
| `--mimi-textarea-border`      | Borde            | `--mimi-input`            | —                                               |
| `--mimi-textarea-radius`      | Radio            | `--mimi-radius`           | —                                               |
| `--mimi-textarea-min-height`  | Alto mínimo      | `--mimi-control-height`   | —                                               |
| `--mimi-textarea-line-height` | Interlineado     | —                         | `20px`                                          |
| `--mimi-textarea-py`          | Relleno vertical | —                         | `calc((var(--mimi-control-height) - 22px) / 2)` |

#### Badge (`badge`)

| Variable                   | Qué controla       | Hereda de                   | Valor por defecto |
| -------------------------- | ------------------ | --------------------------- | ----------------- |
| `--mimi-badge-bg`          | Fondo              | `--mimi-primary`            | —                 |
| `--mimi-badge-fg`          | Texto              | `--mimi-primary-foreground` | —                 |
| `--mimi-badge-radius`      | Radio              | — (ver nota)                | `999px`           |
| `--mimi-badge-height`      | Altura             | —                           | `22px`            |
| `--mimi-badge-px`          | Relleno horizontal | —                           | `10px`            |
| `--mimi-badge-font-size`   | Tamaño de texto    | —                           | `12px`            |
| `--mimi-badge-font-weight` | Peso               | —                           | `600`             |

> **Nota:** el token de componente `--mimi-badge-radius` se llama igual que el global de 0.1.0, y el diseño lo declaraba como `var(--mimi-badge-radius)` (una referencia a sí misma, que invalida la variable). Valor: `999px`. En T.0b se decide si el global se renombra.

#### Card (`card`)

| Variable              | Qué controla | Hereda de                | Valor por defecto |
| --------------------- | ------------ | ------------------------ | ----------------- |
| `--mimi-card-bg`      | Fondo        | `--mimi-card`            | —                 |
| `--mimi-card-fg`      | Texto        | `--mimi-card-foreground` | —                 |
| `--mimi-card-border`  | Borde        | `--mimi-border`          | —                 |
| `--mimi-card-radius`  | Radio        | `--mimi-radius-card`     | —                 |
| `--mimi-card-shadow`  | Sombra       | `--mimi-shadow-card`     | —                 |
| `--mimi-card-padding` | Relleno      | —                        | `24px`            |

#### Avatar (`avatar`)

| Variable                | Qué controla       | Hereda de                     | Valor por defecto |
| ----------------------- | ------------------ | ----------------------------- | ----------------- |
| `--mimi-avatar-size`    | Tamaño default     | —                             | `40px`            |
| `--mimi-avatar-size-sm` | Tamaño sm          | —                             | `32px`            |
| `--mimi-avatar-size-lg` | Tamaño lg          | —                             | `56px`            |
| `--mimi-avatar-bg`      | Fondo de iniciales | `--mimi-secondary`            | —                 |
| `--mimi-avatar-fg`      | Iniciales          | `--mimi-secondary-foreground` | —                 |
| `--mimi-avatar-radius`  | Radio              | —                             | `999px`           |

#### Switch (`switch`)

| Variable                  | Qué controla    | Hereda de           | Valor por defecto |
| ------------------------- | --------------- | ------------------- | ----------------- |
| `--mimi-switch-track-on`  | Pista encendida | `--mimi-primary`    | —                 |
| `--mimi-switch-track-off` | Pista apagada   | `--mimi-switch-off` | —                 |
| `--mimi-switch-thumb`     | Botón           | `--mimi-background` | —                 |
| `--mimi-switch-width`     | Ancho           | —                   | `36px`            |
| `--mimi-switch-height`    | Alto            | —                   | `20px`            |

#### Checkbox (`checkbox`)

| Variable                     | Qué controla  | Hereda de                   | Valor por defecto |
| ---------------------------- | ------------- | --------------------------- | ----------------- |
| `--mimi-checkbox-size`       | Tamaño        | —                           | `16px`            |
| `--mimi-checkbox-radius`     | Radio         | `--mimi-radius-sm`          | —                 |
| `--mimi-checkbox-border`     | Borde         | `--mimi-input`              | —                 |
| `--mimi-checkbox-checked-bg` | Fondo marcado | `--mimi-primary`            | —                 |
| `--mimi-checkbox-check`      | Marca         | `--mimi-primary-foreground` | —                 |

#### FormField (`field`)

| Variable                    | Qué controla         | Hereda de                            | Valor por defecto |
| --------------------------- | -------------------- | ------------------------------------ | ----------------- |
| `--mimi-field-gap`          | Espacio entre partes | —                                    | `6px`             |
| `--mimi-field-label-size`   | Tamaño de etiqueta   | —                                    | `14px`            |
| `--mimi-field-label-weight` | Peso de etiqueta     | —                                    | `500`             |
| `--mimi-field-hint`         | Texto de ayuda       | `--mimi-muted-foreground`            | —                 |
| `--mimi-field-error`        | Mensaje de error     | `--mimi-destructive-soft-foreground` | —                 |

#### Separator (`separator`)

| Variable                 | Qué controla | Hereda de       | Valor por defecto |
| ------------------------ | ------------ | --------------- | ----------------- |
| `--mimi-separator-color` | Color        | `--mimi-border` | —                 |
| `--mimi-separator-size`  | Grosor       | —               | `1px`             |

#### Skeleton (`skeleton`)

| Variable                   | Qué controla       | Hereda de          | Valor por defecto |
| -------------------------- | ------------------ | ------------------ | ----------------- |
| `--mimi-skeleton-bg`       | Fondo              | `--mimi-muted`     | —                 |
| `--mimi-skeleton-radius`   | Radio              | `--mimi-radius-sm` | —                 |
| `--mimi-skeleton-duration` | Duración del pulso | —                  | `1.6s`            |

#### Select (`select`)

| Variable                      | Qué controla         | Hereda de                 | Valor por defecto |
| ----------------------------- | -------------------- | ------------------------- | ----------------- |
| `--mimi-select-trigger-bg`    | Fondo del disparador | `--mimi-input-background` | —                 |
| `--mimi-select-border`        | Borde                | `--mimi-input`            | —                 |
| `--mimi-select-radius`        | Radio                | `--mimi-radius`           | —                 |
| `--mimi-select-height`        | Altura               | `--mimi-control-height`   | —                 |
| `--mimi-select-menu-bg`       | Fondo de la lista    | `--mimi-popover`          | —                 |
| `--mimi-select-menu-shadow`   | Sombra de la lista   | `--mimi-shadow-popover`   | —                 |
| `--mimi-select-option-height` | Alto de opción       | —                         | `34px`            |
| `--mimi-select-option-hover`  | Opción activa        | `--mimi-accent`           | —                 |
| `--mimi-select-option-radius` | Radio de opción      | `--mimi-radius-sm`        | —                 |

Implementado en la G1.5. En el preset (`MimiSelectTokens`): `radius`, `height`, `optionHeight` y `optionRadius`; los demás son colores o sombras y van en el CSS. `--mimi-select-radius` es el radio del disparador y del panel; `--mimi-select-border`, el color del borde del disparador (el del panel es `--mimi-border`). Foco, error y deshabilitado usan los mismos valores que Input (`ring`, `ring-soft`, `destructive`, `destructive-ring`, `--mimi-disabled-opacity`): la caja los lee con `has-[[role=combobox]:focus]` y `data-*`, porque el foco y `aria-invalid` están en el botón de dentro. **No están en el diseño** (plan, D6): el alto máximo de la lista (280px, sin token), el panel sin buscador y el estado vacío sin búsqueda. **Distinto del diseño:** el anillo de foco y el de error se ven solo con el foco en el disparador, como en Input; el diseño muestra el de error siempre y el de foco mientras el panel está abierto.

#### Dialog (`dialog`)

| Variable                     | Qué controla         | Hereda de               | Valor por defecto |
| ---------------------------- | -------------------- | ----------------------- | ----------------- |
| `--mimi-dialog-overlay`      | Fondo oscurecido     | `--mimi-overlay`        | —                 |
| `--mimi-dialog-overlay-blur` | Desenfoque del fondo | `--mimi-overlay-blur`   | —                 |
| `--mimi-dialog-bg`           | Fondo del panel      | `--mimi-popover`        | —                 |
| `--mimi-dialog-radius`       | Radio                | `--mimi-radius-card`    | —                 |
| `--mimi-dialog-shadow`       | Sombra               | `--mimi-shadow-popover` | —                 |
| `--mimi-dialog-width`        | Ancho                | —                       | `420px`           |
| `--mimi-dialog-padding`      | Relleno              | —                       | `24px`            |
| `--mimi-dialog-close-size`   | Tamaño de la X       | —                       | `32px`            |

Implementado en la G1.6. En el preset (`MimiDialogTokens`): `radius`, `width`, `padding`, `closeSize` y `overlayBlur`; `overlay`, `bg` y `shadow` van en el CSS. `--mimi-dialog-padding` es el relleno a los lados del encabezado, el cuerpo y el pie; el relleno derecho del encabezado es `padding + close-size` (los 56px del diseño) cuando hay X. El borde del panel es `--mimi-border`, sin token propio. **No están en el diseño** (plan, D6): la animación, el alto máximo (`100dvh − 32px`), el margen de 16px a los bordes en pantallas chicas y el scroll interno del cuerpo.

#### Confirm (`confirm`)

| Variable                 | Qué controla    | Hereda de                            | Valor por defecto |
| ------------------------ | --------------- | ------------------------------------ | ----------------- |
| `--mimi-confirm-width`   | Ancho           | —                                    | `380px`           |
| `--mimi-confirm-icon-bg` | Fondo del ícono | `--mimi-destructive-soft-bg`         | —                 |
| `--mimi-confirm-icon-fg` | Ícono           | `--mimi-destructive-soft-foreground` | —                 |

Implementado en la G1.7. En el preset (`MimiConfirmTokens`): `width`; los colores del círculo van en el CSS. El ancho va como clase del panel (`w-[var(--mimi-confirm-width,380px)]`), no con `width`, para que la `class` del usuario lo pueda cambiar. `--mimi-confirm-icon-bg` y `-icon-fg` son del círculo del tono `danger`; el del tono `primary` usa `info-soft` e `info-soft-foreground` sin token propio, como el diseño (su variante «Neutral»). **Quitado:** `--mimi-confirm-action-bg` (botón de acción). El botón es un Button con tono: su hover, su sombra y su anillo salen del tono, y un token que solo cambia el fondo los dejaría descoordinados. Su color se cambia con `--mimi-destructive` o el tema. **Distinto del diseño o fuera de él** (plan, D6): los 380px salen de esta hoja (el diseño dibuja el panel fluido en su recuadro); los botones de 36px no son un tamaño de Button (se fuerzan con `h-9 px-3.5`); el hover del botón de acción es el de Button (`-hover`, corregido por contraste en la V.1), no el `color-mix` del diseño; el diseño siempre muestra un ícono, y Mimi no pone uno por defecto.

#### Toast (`toast`)

| Variable                 | Qué controla         | Hereda de               | Valor por defecto |
| ------------------------ | -------------------- | ----------------------- | ----------------- |
| `--mimi-toast-bg`        | Fondo                | `--mimi-popover`        | —                 |
| `--mimi-toast-border`    | Borde                | `--mimi-border`         | —                 |
| `--mimi-toast-radius`    | Radio                | `--mimi-radius`         | —                 |
| `--mimi-toast-shadow`    | Sombra               | `--mimi-shadow-popover` | —                 |
| `--mimi-toast-width`     | Ancho                | —                       | `340px`           |
| `--mimi-toast-offset`    | Separación del borde | —                       | `16px`            |
| `--mimi-toast-stack-gap` | Separación apilada   | —                       | `12px`            |

Implementado en la G1.8. En el preset (`MimiToastTokens`): `radius`, `width`, `offset` y `stackGap`; `bg`, `border` y `shadow` van en el CSS. `--mimi-toast-stack-gap` es cuánto asoma cada toast de atrás con la pila colapsada (los 12px del diseño); expandida, la separación es de 8px, sin token. Ancho: `min(--mimi-toast-width, 100vw − 2 × offset)`. Relleno vertical de 12px (no los 14px de la galería): con una línea de descripción, el toast mide los 68px de la pila del diseño. **Distinto del diseño o fuera de él** (plan, D6): los toasts con acción no se cierran solos; la pila no es región viva (anuncia el `LiveAnnouncer`); el resultado de una promesa dura 6000 ms (el diseño, 4700); alto natural en vez de 68px fijos con elipsis; sólido sin tono y sólido con acción; las posiciones distintas de `bottom-right`, el móvil, la entrada y la salida.

#### Tooltip (`tooltip`)

| Variable                   | Qué controla    | Hereda de                   | Valor por defecto |
| -------------------------- | --------------- | --------------------------- | ----------------- |
| `--mimi-tooltip-bg`        | Fondo           | `--mimi-tooltip`            | —                 |
| `--mimi-tooltip-fg`        | Texto           | `--mimi-tooltip-foreground` | —                 |
| `--mimi-tooltip-radius`    | Radio           | —                           | `8px`             |
| `--mimi-tooltip-font-size` | Tamaño de texto | —                           | `12.5px`          |
| `--mimi-tooltip-arrow`     | Flecha          | —                           | `8px`             |
| `--mimi-tooltip-delay`     | Retraso         | —                           | `300ms`           |

**En ui-core desde la G1.2.** En el preset (`components.tooltip`, `MimiTooltipTokens`): `radius`, `fontSize`, `arrow` y `delay`. `bg` y `fg` solo en el CSS. El retraso se lee del CSS al abrir (`getComputedStyle`), así un preset o tu `styles.css` lo cambian para toda la app; `mimiTooltipDelay` lo cambia en uno. `--mimi-tooltip-arrow-offset` es interna (posición de la flecha), no un token. **Valores que no están en el diseño:** el margen de 8px al borde de la pantalla (`MIMI_VIEWPORT_MARGIN`, igual que Popover), el ancho máximo (`100vw − 16px`; el texto corto queda en una línea, como el diseño, y el largo se parte) y el margen de 300 ms del «salto sin retraso» (`MIMI_TOOLTIP_SKIP_DELAY`, el mismo valor que el retraso). A revisar en el diseño (plan, D6).

#### Popover (`popover`)

| Variable                 | Qué controla | Hereda de               | Valor por defecto |
| ------------------------ | ------------ | ----------------------- | ----------------- |
| `--mimi-popover-bg`      | Fondo        | `--mimi-popover`        | —                 |
| `--mimi-popover-border`  | Borde        | `--mimi-border`         | —                 |
| `--mimi-popover-radius`  | Radio        | `--mimi-radius`         | —                 |
| `--mimi-popover-shadow`  | Sombra       | `--mimi-shadow-popover` | —                 |
| `--mimi-popover-padding` | Relleno      | —                       | `16px`            |
| `--mimi-popover-arrow`   | Flecha       | —                       | `10px`            |

**En ui-core desde la G1.1.** En el preset (`components.popover`, `MimiPopoverTokens`): `radius`, `padding` y `arrow`. `bg`, `border` y `shadow` solo en el CSS (cambian entre claro y oscuro, sección 6.2). El texto usa el global `--mimi-popover-foreground` (la hoja no define `--mimi-popover-fg`). `--mimi-popover-arrow-offset` es interna: la escribe el componente para que la flecha apunte al centro del trigger; no es un token.

**Valor que no está en el diseño:** el margen mínimo del panel al borde de la pantalla, 8px (`MIMI_VIEWPORT_MARGIN` en `utils/overlay.ts` desde la G1.2; el ancho máximo del panel es `100vw − 16px` por lo mismo). A revisar en el diseño (plan, D6).

#### Dropdown y Context Menu (`menu`)

| Variable                   | Qué controla      | Hereda de                            | Valor por defecto |
| -------------------------- | ----------------- | ------------------------------------ | ----------------- |
| `--mimi-menu-bg`           | Fondo             | `--mimi-popover`                     | —                 |
| `--mimi-menu-border`       | Borde             | `--mimi-border`                      | —                 |
| `--mimi-menu-radius`       | Radio             | `--mimi-radius`                      | —                 |
| `--mimi-menu-shadow`       | Sombra            | `--mimi-shadow-popover`              | —                 |
| `--mimi-menu-width`        | Ancho             | —                                    | `240px`           |
| `--mimi-menu-item-height`  | Alto de ítem      | —                                    | `32px`            |
| `--mimi-menu-item-radius`  | Radio de ítem     | `--mimi-radius-sm`                   | —                 |
| `--mimi-menu-item-hover`   | Ítem activo       | `--mimi-accent`                      | —                 |
| `--mimi-menu-shortcut`     | Atajo de teclado  | `--mimi-muted-foreground`            | —                 |
| `--mimi-menu-danger`       | Ítem destructivo  | `--mimi-destructive-soft-foreground` | —                 |
| `--mimi-menu-danger-hover` | Hover destructivo | `--mimi-destructive-soft-bg`         | —                 |

**En ui-core desde la G1.3 (Dropdown Menu; Context Menu los comparte).** En el preset (`components.menu`, `MimiMenuTokens`): `radius`, `width`, `itemHeight` e `itemRadius`. Los colores (`bg`, `border`, `shadow`, `item-hover`, `shortcut`, `danger`, `danger-hover`) solo en el CSS. `--mimi-menu-item-hover` también marca el ítem cuyo submenú está abierto. Un ítem deshabilitado no se resalta con el puntero, pero sí con el foco de teclado (si no, no se vería dónde está el foco; el diseño lo deja transparente).

**Valores que no están en el diseño o no coinciden:** el ancho del Dropdown en el diseño es 260px y el token dice 240px (el del Context Menu): se usa el token. El submenú mide 200px sin token propio (valor literal del diseño). El grupo radio (`mimi-menu-radio-group`) no está en el diseño: punto de 8px en la columna del ícono, provisional. A revisar en el diseño (plan, D6). **Mantener el menú abierto al marcar** un checkbox o radio: opción futura si se pide (hoy cierra, como Radix por defecto).

**Context Menu (G1.4):** los mismos tokens, en `components/menu` (el ancho de 240px coincide con su diseño). **No está en el diseño o difiere:** el diseño mantiene el menú a 8px del borde sin voltearlo; Mimi lo voltea a la izquierda o hacia arriba del punto (como los menús del sistema), con el mismo margen de 8px. Con el teclado, la separación de 8px con el elemento enfocado es la del Dropdown (el diseño no muestra la apertura con teclado). A revisar en el diseño (plan, D6).

#### Tabs (`tabs`)

| Variable                  | Qué controla        | Hereda de                 | Valor por defecto               |
| ------------------------- | ------------------- | ------------------------- | ------------------------------- |
| `--mimi-tabs-fg`          | Pestaña inactiva    | `--mimi-muted-foreground` | —                               |
| `--mimi-tabs-active-fg`   | Pestaña activa      | `--mimi-foreground`       | —                               |
| `--mimi-tabs-indicator`   | Subrayado           | `--mimi-foreground`       | —                               |
| `--mimi-tabs-pill-bg`     | Fondo de píldora    | `--mimi-muted`            | —                               |
| `--mimi-tabs-pill-active` | Píldora activa      | `--mimi-card`             | —                               |
| `--mimi-tabs-height`      | Altura              | —                         | `44px`                          |
| `--mimi-tabs-spring`      | Curva del indicador | —                         | `cubic-bezier(.3, 1.35, .5, 1)` |

Implementado en la G1.9. En el preset (`MimiTabsTokens`): `height` y `spring`; los colores van en el CSS. `--mimi-tabs-height` es el alto de la subrayada (44px); la píldora usa 34px, sin token. El indicador dura 0,45 s (el diseño), sin token. **Distinto del diseño o fuera de él** (plan, D6): la presión usa `--mimi-press-scale` (el diseño, 0,96 y 0,95); las deshabilitadas, vertical, anchos distintos y Tabs sin `tone` no están en el diseño.

#### Toolbar (`toolbar`)

| Variable                    | Qué controla           | Hereda de                   | Valor por defecto |
| --------------------------- | ---------------------- | --------------------------- | ----------------- |
| `--mimi-toolbar-bg`         | Fondo translúcido      | `--mimi-glass`              | —                 |
| `--mimi-toolbar-border`     | Borde                  | `--mimi-glass-border`       | —                 |
| `--mimi-toolbar-blur`       | Desenfoque             | `--mimi-glass-blur`         | —                 |
| `--mimi-toolbar-shadow`     | Sombra                 | `--mimi-shadow-popover`     | —                 |
| `--mimi-toolbar-item-size`  | Tamaño de ítem         | —                           | `40px`            |
| `--mimi-toolbar-active-bg`  | Disco activo           | `--mimi-primary`            | —                 |
| `--mimi-toolbar-active-fg`  | Ícono activo           | `--mimi-primary-foreground` | —                 |
| `--mimi-toolbar-ring`       | Anillo de selección    | `--mimi-info`               | —                 |
| `--mimi-toolbar-pressed-bg` | Interruptor presionado | `--mimi-accent`             | —                 |

Implementado en la G1.10. En el preset (`MimiToolbarTokens`): `itemSize` y `blur`; los colores y la sombra van en el CSS. Medidas del diseño: píldora con 6px de relleno y de separación, botones de 40px con íconos de 18px, separador de 22×1px con 2px de margen, contador de 18px a −3px (10,5px/700, `info`, anillo de 2px del fondo); transiciones del diseño (fondo y color 0,2 s, anillo 0,35 s, escala 0,15 s; con movimiento reducido solo los colores). **Distinto del diseño o fuera de él** (plan, D6): la presión usa `--mimi-press-scale-sm` (0,9; el diseño, 0,88); el foco de teclado es el contorno `ring` a 4px (el diseño solo muestra el anillo del hover, que no basta como foco visible); el contador va dentro del botón (en el diseño es hermano y no escala al pulsar); el tooltip queda a 10px del botón (el diseño, 14px: 10px desde el anillo); el deshabilitado y los grupos con nombre no están en el diseño.

#### Pagination (`pagination`)

| Variable                        | Qué controla        | Hereda de                                                | Valor por defecto                |
| ------------------------------- | ------------------- | -------------------------------------------------------- | -------------------------------- |
| `--mimi-pagination-bg`          | Fondo translúcido   | `--mimi-glass`                                           | —                                |
| `--mimi-pagination-border`      | Borde               | `--mimi-glass-border`                                    | —                                |
| `--mimi-pagination-blur`        | Desenfoque          | `--mimi-glass-blur`                                      | —                                |
| `--mimi-pagination-shadow`      | Sombra flotante     | `--mimi-shadow-popover`                                  | —                                |
| `--mimi-pagination-item-size`   | Tamaño de botón     | `--mimi-control-height-sm` (md: `--mimi-control-height`) | —                                |
| `--mimi-pagination-input-width` | Ancho del campo     | —                                                        | `44px` (md: `52px`)              |
| `--mimi-pagination-error`       | Error de página     | `--mimi-destructive`                                     | —                                |
| `--mimi-pagination-offset`      | Separación inferior | —                                                        | `16px` (no la usa el componente) |

Implementado en la G1.11. La hoja decía `40px`, `56px` y `20px`; el diseño final (`Mimi Pagination.dc.html`) usa el alto de control (32px en `sm`, 40px en `default`), un campo de 44/52px y 16px sobre el borde: manda el diseño final (corrección pendiente en `mimi-variables-componentes.css`, plan D6). `--mimi-pagination-offset` no lo usa el componente: la variante flotante solo pone la sombra y la posición va en `class` (decidido en la G1.11). En el preset (`MimiPaginationTokens`): `itemSize`, `inputWidth` y `blur`; los colores y la sombra van en el CSS. **Distinto del diseño o fuera de él** (plan, D6): escala al pulsar 0,9 (`--mimi-press-scale-sm`; el diseño, 0,88), deshabilitados con 0,5 de opacidad y sin cursor de no permitido (el diseño, 0,35 y `not-allowed`), anillo de foco del campo (el diseño no lo define), y al cambiar el tamaño se mantiene visible el primer registro (el diseño vuelve a la página 1).

#### Grupo 2 (propuestas de la G2.0)

Tablas escritas en la G2.0 (04/11/2026, modo autónomo) a partir del diseño: **cada tabla está pendiente de la aprobación del usuario** (plan, G2.0) y la cierra su componente al implementarlo, como las del Grupo 1. Diseños: `F3 Archivos Tags Toggle Color` (§9 File Upload, §10 Tags Input, §11 Toggle Group, §12 Color Picker), `Color Picker`, `F3 Slider OTP Numero Mascara` (§4 Slider, §5 Input OTP, §6 Number Input, §7 Input Mask, §8 Password), `F3 Combobox Fechas Hora` (§1 Combobox, §2 Date Picker y Date Range) y `F5 Estructura` (§4 Progress). Reglas comunes:

- **Campos** (Number Input, Password, Input Mask, Tags Input, Combobox, el disparador del Date Picker): el diseño usa los mismos estados que Input: fondo `--mimi-input-background`, borde `--mimi-input`, hover `--mimi-input-hover`, foco `--mimi-ring` con `0 0 0 3px var(--mimi-ring-soft)`, error `--mimi-destructive` con el anillo de error y deshabilitado con `--mimi-disabled-opacity`. No se repiten en cada tabla: los colores de borde y fondo heredan de los tokens de Input cuando el componente es una directiva sobre `input[mimiInput]`, y de los globales cuando es un control propio.
- **Anillo de error:** el diseño lo escribe `--mimi-destructive-soft`; en Mimi es `--mimi-destructive-ring` (`--mimi-destructive-soft` es el alias de la 0.1.0 que se quita en la 1.0).
- **Preset:** los tamaños van en `components.<nombre>`; los colores y las sombras, solo en el CSS (sección 6.2). La columna «Preset» de cada tabla es la propuesta.
- **Prefijos** comprobados con grep el 04/11/2026: ninguno es un global ni el de otro componente. `chip` convive con los globales `--mimi-chip` y `--mimi-chip-foreground` como `card` con `--mimi-card` (los tokens del componente terminan en `-bg`, `-fg`, `-height`…, nunca en `-foreground`). No se usan `track`, `range`, `thumb` ni `input` como prefijo (son globales, o el de Input).

##### Toggle Group (`toggle-group`)

Diseño: `F3 Archivos Tags Toggle Color`, §11.

| Variable                               | Qué controla                    | Hereda de                 | Valor por defecto               | Preset |
| -------------------------------------- | ------------------------------- | ------------------------- | ------------------------------- | ------ |
| `--mimi-toggle-group-bg`               | Fondo del grupo                 | `--mimi-muted`            | —                               | No     |
| `--mimi-toggle-group-fg`               | Ítem sin elegir                 | `--mimi-muted-foreground` | —                               | No     |
| `--mimi-toggle-group-active-fg`        | Ítem elegido y hover            | `--mimi-foreground`       | —                               | No     |
| `--mimi-toggle-group-indicator`        | Indicador (simple) y presionado | `--mimi-card`             | —                               | No     |
| `--mimi-toggle-group-indicator-shadow` | Sombra del indicador            | `--mimi-shadow-neutral`   | —                               | No     |
| `--mimi-toggle-group-radius`           | Radio del ítem                  | `--mimi-radius`           | —                               | Sí     |
| `--mimi-toggle-group-padding`          | Relleno del grupo               | —                         | `3px`                           | Sí     |
| `--mimi-toggle-group-gap`              | Separación entre ítems          | —                         | `2px`                           | Sí     |
| `--mimi-toggle-group-item-height`      | Alto del ítem                   | —                         | `32px`                          | Sí     |
| `--mimi-toggle-group-item-px`          | Relleno horizontal del ítem     | —                         | `12px`                          | Sí     |
| `--mimi-toggle-group-icon-width`       | Ancho del ítem solo con ícono   | —                         | `44px`                          | Sí     |
| `--mimi-toggle-group-font-size`        | Tamaño de texto                 | —                         | `13.5px`                        | Sí     |
| `--mimi-toggle-group-spring`           | Curva del indicador             | —                         | `cubic-bezier(.3, 1.35, .5, 1)` | Sí     |

El radio del grupo es `radio + padding` (el diseño, `calc(var(--mimi-radius) + 3px)`), sin token propio. El indicador se desliza en 0,45 s (como Tabs, sin token). Peso 500 sin elegir y 600 elegido; íconos de 16px; separación ícono-texto 6px. La variante con el elegido en `primary` (el grupo «Texto e ícono · múltiple») usa `--mimi-primary`, `--mimi-primary-foreground` y `--mimi-shadow-primary` sin token propio, como los tonos de Button: es `variant="solid"`. **Implementado en la G2.1** (04/11/2026), con esta tabla tal cual. En el preset (`components.toggleGroup`, `MimiToggleGroupTokens`): `radius`, `padding`, `gap`, `itemHeight`, `itemPx`, `iconWidth`, `fontSize` y `spring`; los colores y la sombra van en el CSS. `--mimi-toggle-group-icon-width` es el ancho mínimo de todo botón (así los de solo ícono miden los 44px del diseño). `--mimi-toggle-group-count` y `-index` son internas (las escribe el grupo para el indicador). **Distinto del diseño o fuera de él** (D6): la presión es `--mimi-press-scale-sm` (0,9; el diseño, 0,93); en múltiple no hay indicador (cada elegido tiene su fondo, como el diseño) y las columnas son del ancho de cada botón; `solid` en simple (el diseño solo la muestra en múltiple) pinta el indicador en `primary`; el error del formulario (borde `destructive` de 1px) no está en el diseño.

##### Number Input (`number`)

Diseño: `F3 Slider OTP Numero Mascara`, §6.

| Variable                      | Qué controla            | Hereda de               | Valor por defecto | Preset |
| ----------------------------- | ----------------------- | ----------------------- | ----------------- | ------ |
| `--mimi-number-height`        | Altura                  | `--mimi-control-height` | —                 | Sí     |
| `--mimi-number-radius`        | Radio                   | `--mimi-radius`         | —                 | Sí     |
| `--mimi-number-px`            | Relleno horizontal      | —                       | `4px`             | Sí     |
| `--mimi-number-button-size`   | Botones − y +           | —                       | `30px`            | Sí     |
| `--mimi-number-button-radius` | Radio de los botones    | `--mimi-radius-sm`      | —                 | Sí     |
| `--mimi-number-button-hover`  | Fondo del botón (hover) | `--mimi-accent`         | —                 | No     |

Texto de 14px, peso 500, cifras tabulares y centrado; íconos de 15px (el diseño; los controles usan `--mimi-icon-size`, 16px: lo decide la G2.2). Botón deshabilitado en el mínimo o el máximo; presión 0,88 en el diseño. Campo y estados: los de Input (ver arriba). **Implementado en la G2.2** (04/11/2026), con esta tabla. En el preset (`components.numberInput`, prefijo `number`, `MimiNumberInputTokens`): `height`, `radius`, `px`, `buttonSize` y `buttonRadius`; `button-hover` va en el CSS. Íconos de 15px como el diseño. Botones en el límite con `aria-disabled` y `--mimi-disabled-opacity` (el diseño, 0,35 y `disabled` nativo: D6); presión `--mimi-press-scale-sm` (0,9; el diseño, 0,88).

##### Password (`password`)

Diseño: `F3 Slider OTP Numero Mascara`, §8.

| Variable                        | Qué controla                      | Hereda de          | Valor por defecto | Preset |
| ------------------------------- | --------------------------------- | ------------------ | ----------------- | ------ |
| `--mimi-password-toggle-size`   | Botón de mostrar u ocultar        | —                  | `32px`            | Sí     |
| `--mimi-password-toggle-radius` | Radio del botón                   | `--mimi-radius-sm` | —                 | Sí     |
| `--mimi-password-toggle-hover`  | Fondo del botón (hover)           | `--mimi-accent`    | —                 | No     |
| `--mimi-password-meter-height`  | Alto de cada segmento del medidor | —                  | `6px`             | Sí     |
| `--mimi-password-meter-gap`     | Separación entre segmentos        | —                  | `4px`             | Sí     |
| `--mimi-password-meter-track`   | Segmento vacío                    | `--mimi-track`     | —                 | No     |

Campo: relleno `0 4px 0 12px` (el de Input a la izquierda, 4px a la derecha para el botón) y separación de 6px. El medidor tiene 4 segmentos con los globales `--mimi-strength-weak`, `-medium` y `-strong` (sin token propio), la etiqueta del nivel en `<tono>-soft-foreground` (13px, 600, 48px de ancho mínimo) y la lista de reglas en dos columnas (12,5px, ícono de 14px, `success-soft-foreground` cuando se cumple). La galería de la derecha usa campos de 36px y segmentos de 5px: son miniaturas, no un tamaño. **Implementado en la G2.3** (04/11/2026), con esta tabla. En el preset (`components.password`, `MimiPasswordTokens`): `toggleSize`, `toggleRadius`, `meterHeight` y `meterGap`; `toggle-hover` y `meter-track` van en el CSS. La caja usa los tokens de Input para alto y radio (`--mimi-input-height`, `--mimi-input-radius`), así queda alineada con Input. Los niveles leen `var(--mimi-strength-weak, var(--mimi-destructive))` (y `medium`/`warning`, `strong`/`success`) y la barra vacía `var(--mimi-password-meter-track, var(--mimi-track, var(--mimi-input)))` (G2.0b).

##### Input Mask (`mask`)

Diseño: `F3 Slider OTP Numero Mascara`, §7.

| Variable                    | Qué controla                     | Hereda de                  | Valor por defecto | Preset |
| --------------------------- | -------------------------------- | -------------------------- | ----------------- | ------ |
| `--mimi-mask-placeholder`   | Parte de la máscara sin escribir | `--mimi-input-placeholder` | —                 | No     |
| `--mimi-mask-gap`           | Separación con prefijo e ícono   | —                          | `8px`             | Sí     |
| `--mimi-mask-prefix-bg`     | Fondo del prefijo                | `--mimi-muted`             | —                 | No     |
| `--mimi-mask-prefix-height` | Alto del prefijo                 | —                          | `26px`            | Sí     |
| `--mimi-mask-prefix-radius` | Radio del prefijo                | `--mimi-radius-sm`         | —                 | Sí     |

Campo: el de Input (relleno de 12px; texto de 14px con cifras tabulares y `letter-spacing: .02em`). Prefijo con `margin-left: -6px`, relleno de 8px y texto de 13px/600; ícono de 16px en `muted-foreground`; marca de tarjeta de 22px con radio fijo de 5px (fuera de los tokens: D6); ícono de válido en `success-soft-foreground`. **Implementado en la G2.4b** (04/11/2026), con esta tabla. En el preset (`components.inputMask`, prefijo `mask`, `MimiInputMaskTokens`): `gap`, `prefixHeight` y `prefixRadius`; `placeholder` y `prefix-bg` van en el CSS. La marca de la tarjeta y el ícono de válido son del ejemplo (en `[mimiMaskEnd]`), no del componente.

##### Input OTP (`otp`)

Diseño: `F3 Slider OTP Numero Mascara`, §5.

| Variable               | Qué controla                | Hereda de                 | Valor por defecto | Preset |
| ---------------------- | --------------------------- | ------------------------- | ----------------- | ------ |
| `--mimi-otp-width`     | Ancho de la casilla         | —                         | `46px`            | Sí     |
| `--mimi-otp-height`    | Alto de la casilla          | —                         | `54px`            | Sí     |
| `--mimi-otp-gap`       | Separación                  | —                         | `8px`             | Sí     |
| `--mimi-otp-radius`    | Radio                       | `--mimi-radius`           | —                 | Sí     |
| `--mimi-otp-font-size` | Tamaño del carácter         | —                         | `22px`            | Sí     |
| `--mimi-otp-bg`        | Fondo de la casilla         | `--mimi-input-background` | —                 | No     |
| `--mimi-otp-border`    | Borde                       | `--mimi-input`            | —                 | No     |
| `--mimi-otp-separator` | Guion separador             | `--mimi-border`           | —                 | No     |
| `--mimi-otp-caret`     | Cursor de la casilla activa | `--mimi-foreground`       | —                 | No     |

Carácter de peso 600 con cifras tabulares. Separador de 12×2px. Cursor de 2×22px con `mimi-caret 1s steps(1) infinite`. Completo: borde `--mimi-success` con anillo `--mimi-success-ring`; error: borde y anillo de error y `mimi-shake` en la fila. La galería de estados usa casillas de 38×46px (19px, separación de 6px): miniaturas, no un tamaño. **Implementado en la G2.5** (05/11/2026), con esta tabla. En el preset (`components.inputOtp`, prefijo `otp`, `MimiInputOtpTokens`): `width`, `height`, `gap`, `radius` y `fontSize`; `bg`, `border`, `separator` y `caret` van en el CSS. «Completo» del diseño es `success` (lo pone la app al verificar), no solo las casillas llenas.

##### Tags Input (`tags`) y chip (`chip`)

Diseño: `F3 Archivos Tags Toggle Color`, §10 (el chip, también en `F3 Combobox Fechas Hora`, §1, múltiple). El chip es el ítem compartido `chip` de la CLI (decidido el 03/11/2026): lo usan Tags Input y el Combobox múltiple.

| Variable                      | Qué controla                    | Hereda de | Valor por defecto                                                 | Preset |
| ----------------------------- | ------------------------------- | --------- | ----------------------------------------------------------------- | ------ |
| `--mimi-tags-gap`             | Separación entre chips          | —         | `6px`                                                             | Sí     |
| `--mimi-tags-padding`         | Relleno de la caja              | —         | `5px 10px 5px 6px`                                                | Sí     |
| `--mimi-tags-input-min-width` | Ancho mínimo del campo de texto | —         | `120px`                                                           | Sí     |
| `--mimi-tags-full-border`     | Borde con el límite alcanzado   | —         | `color-mix(in oklab, var(--mimi-warning) 70%, var(--mimi-input))` | No     |

| Variable                  | Qué controla    | Hereda de                | Valor por defecto | Preset |
| ------------------------- | --------------- | ------------------------ | ----------------- | ------ |
| `--mimi-chip-bg`          | Fondo           | `--mimi-chip`            | —                 | No     |
| `--mimi-chip-fg`          | Texto           | `--mimi-chip-foreground` | —                 | No     |
| `--mimi-chip-height`      | Alto            | —                        | `26px`            | Sí     |
| `--mimi-chip-radius`      | Radio           | `--mimi-badge-radius`    | —                 | Sí     |
| `--mimi-chip-font-size`   | Tamaño de texto | —                        | `13px`            | Sí     |
| `--mimi-chip-remove-size` | Botón de quitar | —                        | `18px`            | Sí     |

Caja: alto mínimo `--mimi-control-height`, campo de texto de 28px. Chip: relleno `0 4px 0 10px`, peso 500, separación de 4px; botón de quitar redondo con ícono de 12px, opacidad 0,7 (1 en hover) y fondo `color-mix(in oklab, var(--mimi-foreground) 12%, transparent)` en hover (en el Combobox, `muted-foreground` → `foreground` en vez de la opacidad: D6 elige uno). Chip con error: `--mimi-destructive-soft` / `-soft-foreground` (es decir, `destructive-soft-bg` en Mimi). Contador en `muted-foreground` y en `warning-soft-foreground` con el límite. **Implementado en la G2.6** (05/11/2026), con estas tablas. En el preset: `components.chip` (`height`, `radius`, `fontSize`, `removeSize`) y `components.tagsInput` (prefijo `tags`: `gap`, `padding`, `inputMinWidth`); los colores y `full-border` van en el CSS. El botón de quitar baja la opacidad (como Tags Input) también en el Combobox. El contador va debajo, a la derecha del mensaje (en el diseño, arriba junto a la etiqueta, que es del usuario).

##### Slider (`slider`)

Diseño: `F3 Slider OTP Numero Mascara`, §4.

| Variable                     | Qué controla                   | Hereda de               | Valor por defecto | Preset |
| ---------------------------- | ------------------------------ | ----------------------- | ----------------- | ------ |
| `--mimi-slider-track`        | Pista                          | `--mimi-track`          | —                 | No     |
| `--mimi-slider-fill`         | Parte llena y borde del pulgar | `--mimi-track-fill`     | —                 | No     |
| `--mimi-slider-thumb`        | Fondo del pulgar               | `--mimi-thumb`          | —                 | No     |
| `--mimi-slider-thumb-shadow` | Sombra del pulgar              | `--mimi-shadow-neutral` | —                 | No     |
| `--mimi-slider-height`       | Grosor de la pista             | —                       | `6px`             | Sí     |
| `--mimi-slider-thumb-size`   | Tamaño del pulgar              | —                       | `20px`            | Sí     |

Área táctil de 20px de alto; borde del pulgar de 2px con el color de la parte llena (`--mimi-destructive` con error). Hover: `0 0 0 6px var(--mimi-ring-soft)`; arrastre: 8px y escala 1,12; foco: `0 0 0 2px var(--mimi-background), 0 0 0 4px var(--mimi-ring)`. Marcas: puntos de 6px (`primary-foreground` dentro del rango, `foreground` al 30 % fuera) y etiquetas de 12px a 26px de la pista. Burbuja del valor: colores de Tooltip, radio fijo de 7px (Tooltip usa 8px: D6), relleno `4px 8px`, 12px/600, flecha de 7px y 10px sobre el pulgar. **Implementado en la G2.7** (05/11/2026), con esta tabla. En el preset (`components.slider`, `MimiSliderTokens`): `height` y `thumbSize`; `track`, `fill`, `thumb` y `thumb-shadow` van en el CSS (respaldos: `--mimi-input`, `primary` y `background`). El foco de teclado es el contorno `ring` de los botones (2px separado 2px), no el `box-shadow` del diseño, para que `focus-styles.spec.ts` lo vea.

##### Combobox (`combobox`)

Diseño: `F3 Combobox Fechas Hora`, §1.

| Variable                          | Qué controla                | Hereda de               | Valor por defecto | Preset |
| --------------------------------- | --------------------------- | ----------------------- | ----------------- | ------ |
| `--mimi-combobox-height`          | Altura del campo            | `--mimi-control-height` | —                 | Sí     |
| `--mimi-combobox-radius`          | Radio del campo y del panel | `--mimi-radius`         | —                 | Sí     |
| `--mimi-combobox-menu-bg`         | Fondo del panel             | `--mimi-popover`        | —                 | No     |
| `--mimi-combobox-menu-shadow`     | Sombra del panel            | `--mimi-shadow-popover` | —                 | No     |
| `--mimi-combobox-menu-max-height` | Alto máximo del panel       | —                       | `228px`           | Sí     |
| `--mimi-combobox-option-height`   | Alto mínimo de opción       | —                       | `34px`            | Sí     |
| `--mimi-combobox-option-radius`   | Radio de opción             | `--mimi-radius-sm`      | —                 | Sí     |
| `--mimi-combobox-option-hover`    | Opción activa               | `--mimi-accent`         | —                 | No     |

Campo con relleno `0 10px 0 12px`, separación de 8px e íconos de 16px en `muted-foreground` (el chevron gira en 0,2 s). Panel a 2px del campo, relleno de 4px, separación de 1px y borde `--mimi-border`. Coincidencia: peso 700 y subrayado a 3px. «Crear…»: `info-soft-foreground`, hover `info-soft`, línea superior `--mimi-border`. Múltiple: la caja de Tags Input con chips (`chip`) y una casilla de 16px por opción (borde `--mimi-input`, marcada `--mimi-primary`). Cargando: `mimi-spin` 0,8 s y dos líneas de esqueleto de 26px. Sin resultados: ícono de 20px, título 14px/600 y texto 13px.

**Implementada en la G2.8a y la G2.8b (05/11/2026), sin cambios en la tabla.** El múltiple usa los tokens del chip (`--mimi-chip-*`) y, para la caja, los mismos tamaños que la simple (`--mimi-combobox-height` como alto mínimo). En el preset (`MimiComboboxTokens`): `height`, `radius`, `menuMaxHeight`, `optionHeight` y `optionRadius`; los colores y la sombra, en el CSS. La caja usa los tokens globales de Input (`input`, `input-background`, `input-hover`, `ring`, `ring-soft`, `destructive`, `destructive-ring`), como Tags Input.

##### Date Picker y Date Range (`date`)

Diseño: `F3 Combobox Fechas Hora`, §2. **Una sola tabla para el calendario, el Date Picker y el Date Range** (decidido por defecto en la G2.9, 05/11/2026, pendiente de revisión: el calendario compartido pinta los días y la banda; solo `--mimi-date-presets-width` es propio del rango). Implementada en la G2.9a y la G2.9b (`MimiDateTokens`: `cellSize`, `cellRadius`, `padding` y `presetsWidth`; los colores, en el CSS). La banda usa `var(--mimi-date-range,var(--mimi-range,var(--mimi-accent)))`.

| Variable                    | Qué controla              | Hereda de                   | Valor por defecto | Preset |
| --------------------------- | ------------------------- | --------------------------- | ----------------- | ------ |
| `--mimi-date-cell-size`     | Tamaño del día            | —                           | `36px`            | Sí     |
| `--mimi-date-cell-radius`   | Radio del día             | `--mimi-radius-sm`          | —                 | Sí     |
| `--mimi-date-cell-hover`    | Día en hover              | `--mimi-accent`             | —                 | No     |
| `--mimi-date-selected-bg`   | Día elegido               | `--mimi-primary`            | —                 | No     |
| `--mimi-date-selected-fg`   | Texto del día elegido     | `--mimi-primary-foreground` | —                 | No     |
| `--mimi-date-range`         | Banda del rango           | `--mimi-range`              | —                 | No     |
| `--mimi-date-today-ring`    | Borde del día de hoy      | `--mimi-border`             | —                 | No     |
| `--mimi-date-menu-bg`       | Fondo del panel           | `--mimi-popover`            | —                 | No     |
| `--mimi-date-menu-shadow`   | Sombra del panel          | `--mimi-shadow-popover`     | —                 | No     |
| `--mimi-date-padding`       | Relleno del panel         | —                           | `12px`            | Sí     |
| `--mimi-date-presets-width` | Columna de atajos (rango) | —                           | `130px`           | Sí     |

Día de 13,5px con cifras tabulares (600 si está elegido o es hoy); hoy lleva además un punto de 4px. Fuera del mes: opacidad 0,55 y `muted-foreground`; deshabilitado: 0,38 y tachado (el diseño no usa `--mimi-disabled-opacity`: D6). Encabezado de días de 28px (12px/500, `muted-foreground`); filas separadas 2px. Botones de mes anterior y siguiente de 30px con borde; título 14px/600. Vista de meses y años: 3 columnas de 44px de alto (252px de ancho). Pie con «Ir a hoy» de 28px. Rango: atajos de 32px (13px, elegido en `accent`) y la banda con el radio del día en sus extremos.

##### Progress (`progress`)

Diseño: `F5 Estructura`, §4.

| Variable                       | Qué controla               | Hereda de        | Valor por defecto | Preset |
| ------------------------------ | -------------------------- | ---------------- | ----------------- | ------ |
| `--mimi-progress-track`        | Pista                      | `--mimi-track`   | —                 | No     |
| `--mimi-progress-fill`         | Parte llena                | `--mimi-primary` | —                 | No     |
| `--mimi-progress-height`       | Grosor de la barra         | —                | `8px`             | Sí     |
| `--mimi-progress-circle-size`  | Tamaño del círculo         | —                | `76px`            | Sí     |
| `--mimi-progress-circle-width` | Grosor del círculo (de 36) | —                | `3`               | Sí     |

Barra redonda (999px). El llenado anima el ancho en 0,35 s con `cubic-bezier(.2,.8,.2,1)`; el círculo, el trazo en 0,4 s con la misma curva. Indeterminada: un tramo del 40 % con `mimi-indet 1.4s cubic-bezier(.4,0,.2,1) infinite` («con reducir movimiento late en vez de desplazarse», dice el diseño); círculo indeterminado: tramo de 28/100 con `mimi-spin 1s linear infinite`. Con tono, el llenado es `--mimi-<tono>` y el número `<tono>-soft-foreground`. Tamaños del diseño: barra de 8px y de 6px (la de tonos); círculo de 76px (trazo 3, texto 16px) y de 44px (trazo 4, texto 11px), texto 700. La parte llena usa `primary` como el diseño, no `--mimi-track-fill` (que hoy vale lo mismo). **Implementado en la G2.10** (04/11/2026), con esta tabla. En el preset (`components.progress`, `MimiProgressTokens`): `height`, `circleSize` y `circleWidth`; `track` y `fill` van en el CSS. `--mimi-progress-fill` solo cambia el tono `primary` (los otros usan su global). El círculo `sm` (44px, trazo 4, texto 11px) no tiene token. La pista lee `var(--mimi-progress-track, var(--mimi-track, var(--mimi-input)))`: el respaldo para un tema anterior a la 0.3.0 es `--mimi-input` (casi el mismo gris que `--mimi-track` en los dos modos) y no la fórmula con `color-mix`, que Lightning CSS duplica en el CSS global. Con movimiento reducido, la barra indeterminada pasa a ancho completo y late, y el círculo deja de girar y late (`animate-mimi-pulse`; el diseño solo lo dice de la barra: D6).

##### File Upload (`upload`)

Diseño: `F3 Archivos Tags Toggle Color`, §9.

| Variable                      | Qué controla                | Hereda de                       | Valor por defecto | Preset |
| ----------------------------- | --------------------------- | ------------------------------- | ----------------- | ------ |
| `--mimi-upload-bg`            | Fondo de la zona            | `--mimi-dropzone`               | —                 | No     |
| `--mimi-upload-border`        | Borde discontinuo           | `--mimi-input`                  | —                 | No     |
| `--mimi-upload-active-bg`     | Fondo con archivo encima    | `--mimi-dropzone-active`        | —                 | No     |
| `--mimi-upload-active-border` | Borde con archivo encima    | `--mimi-dropzone-active-border` | —                 | No     |
| `--mimi-upload-radius`        | Radio de la zona            | `--mimi-radius-card`            | —                 | Sí     |
| `--mimi-upload-height`        | Alto de la zona             | —                               | `176px`           | Sí     |
| `--mimi-upload-icon-size`     | Círculo del ícono           | —                               | `44px`            | Sí     |
| `--mimi-upload-item-radius`   | Radio de la fila de archivo | `--mimi-radius`                 | —                 | Sí     |
| `--mimi-upload-thumb-size`    | Miniatura de la fila        | —                               | `44px`            | Sí     |

Zona: borde de 2px (discontinuo; continuo con archivo encima), relleno 16px, separación 8px, hover `--mimi-input-hover`, presión 0,985; con archivo encima, `--mimi-glow-info`, escala 1,01 y el ícono (22px, círculo `--mimi-info` / `info-foreground`; en reposo `--mimi-muted` / `foreground`) con `mimi-bob 1s ease-in-out infinite`. Título 14px/600 y texto 12,5px. Fila: `--mimi-card`, borde `--mimi-border` (error: `color-mix(in oklab, var(--mimi-destructive) 45%, var(--mimi-border))`), `--mimi-shadow-neutral`, relleno 10px, separación 12px; filas separadas 8px. Progreso de 5px (el de Progress con otro grosor). Botones de 30px: quitar (hover `destructive-soft-bg`) y reintentar (borde, hover `accent`).

**Implementada en la G2.11 (05/11/2026), sin cambios en la tabla.** En el preset (`MimiFileUploadTokens`): `radius`, `height`, `iconSize`, `itemRadius` y `thumbSize`. Los globales del Grupo 2 con respaldo (`var(--mimi-dropzone,var(--mimi-muted))`, `var(--mimi-dropzone-active,var(--mimi-accent))`, `var(--mimi-dropzone-active-border,var(--mimi-info))`). El error de una fila usa `destructive-soft-foreground` (no es un error de campo).

##### Color Picker (`color-picker`)

Diseño: `Color Picker` (y `F3 Archivos Tags Toggle Color`, §12).

| Variable                            | Qué controla                   | Hereda de               | Valor por defecto                                           | Preset |
| ----------------------------------- | ------------------------------ | ----------------------- | ----------------------------------------------------------- | ------ |
| `--mimi-color-picker-bg`            | Fondo del panel                | `--mimi-popover`        | —                                                           | No     |
| `--mimi-color-picker-shadow`        | Sombra del panel               | `--mimi-shadow-popover` | —                                                           | No     |
| `--mimi-color-picker-radius`        | Radio del panel                | `--mimi-radius`         | —                                                           | Sí     |
| `--mimi-color-picker-width`         | Ancho del panel                | —                       | `280px`                                                     | Sí     |
| `--mimi-color-picker-padding`       | Relleno y separación           | —                       | `12px`                                                      | Sí     |
| `--mimi-color-picker-area-height`   | Alto del área de saturación    | —                       | `150px`                                                     | Sí     |
| `--mimi-color-picker-area-radius`   | Radio del área                 | `--mimi-radius-sm`      | —                                                           | Sí     |
| `--mimi-color-picker-hue-height`    | Alto de la barra de tono       | —                       | `12px`                                                      | Sí     |
| `--mimi-color-picker-swatch-gap`    | Separación de las muestras     | —                       | `6px`                                                       | Sí     |
| `--mimi-color-picker-thumb-border`  | Borde de los pulgares          | —                       | `oklch(1 0 0)`                                              | No     |
| `--mimi-color-picker-thumb-shadow`  | Sombra de los pulgares         | —                       | `0 0 0 1px oklch(0 0 0 / .25), 0 2px 4px oklch(0 0 0 / .3)` | No     |
| `--mimi-color-picker-swatch-border` | Borde interior de las muestras | —                       | `oklch(0 0 0 / .1)`                                         | No     |

**Implementada en la G2.12 (05/11/2026).** Las tres últimas filas son nuevas (decidido por defecto: tokens del componente con el valor del diseño, para que el borde y la sombra de los pulgares, que tienen que verse sobre cualquier color, no sean colores fijos en las clases). `bg` y `shadow` se aplican al panel del disparador; el panel suelto no trae fondo (lo pone la app). En el preset (`MimiColorPickerTokens`): `radius`, `width`, `padding`, `areaHeight`, `areaRadius`, `hueHeight` y `swatchGap`.

Pulgares de 14px (área) y 16px (tono) con borde blanco de 2px y sombras (`oklch(0 0 0 / .25)` y `/ .3`), en los tokens de arriba. Muestra actual de 28px; selector de formato con ítems de 28px (11,5px) sobre `--mimi-muted`; campo de texto de 32px en `--mimi-font-mono` 12px. Paleta y recientes en 8 columnas: muestras redondas (recientes con `--mimi-radius-sm`), hover 1,12, presión 0,9; la elegida con `0 0 0 2px var(--mimi-popover), 0 0 0 4px var(--mimi-foreground)`. Títulos de 11px/600 en mayúsculas.

**En ui-core desde la T.1:** los tonos con sus derivados, sombras y glow, `destructive-ring`, `destructive-soft-bg` y `destructive-soft-foreground`, `tooltip`, `glass`, `overlay-blur`, `glass-blur`, `soft-mix`, `shadow-popover` y los compartidos (foco, deshabilitado, íconos); `overlay` y `popover` en oscuro con los valores del diseño. Lo demás de `tokens-mimi.css` (rango, pista, chips, zona de arrastre, fuerza, selección, `corner-shape`, `input-hover` y los keyframes de la Fase 3 y de Effects) entra con su componente, salvo los globales del Grupo 2: rango, pista, pulgar, chips, zona de arrastre, fuerza, selección y los keyframes `mimi-caret`, `mimi-bob`, `mimi-shake` y `mimi-indet` están en `theme-base.css` desde la G2.0b (04/11/2026), en claro y oscuro, expuestos con `@theme inline` y sin claves en el preset. `corner-shape` y los keyframes de Effects siguen fuera. `--mimi-input-hover` entró con Pagination (G1.11), con el valor de `tokens-mimi.css` y el color `input-hover` en `@theme inline`.

**Hovers corregidos por contraste (V.1):** en claro, `--mimi-success-hover`, `--mimi-info-hover` y `--mimi-destructive-hover` mezclan el tono al 88 % con `foreground` (el diseño los mezcla con `background` y no pasaban AA). Corrección de Mimi pendiente de pasar al diseño (plan, D6); también en `tokens-mimi.css`. La prueba `contrast.spec.ts` (ui-core) lee `theme-base.css` y falla si un texto queda por debajo de 4,5:1 sobre su fondo, en reposo o en hover, en claro u oscuro.

**Variantes con tono (V.1):** `--mimi-<tono>-soft-hover`, `--mimi-<tono>-border` y `--mimi-<tono>-subtle` para `primary`, `success`, `warning`, `info` y `destructive` son derivados con las fórmulas en línea del diseño `F2 Tokens y Tonos` (`color-mix` del tono al 22 % sobre el fondo, al 55 % y al 10 % sobre transparente). Están en `theme-base.css` y en `tokens-mimi.css`, no en el preset: se recalculan solos.

**Provisional, sin diseño (V.1):** en Button, el tono `secondary` en todas sus variantes (solid = el secondary de la 0.1.0; soft = `muted` con hover `accent`; outline y ghost = los de la 0.1.0; link = `foreground`) y ghost y link con tono (ghost: texto `<tono>-soft-foreground`, hover `<tono>-soft`; link: texto `<tono>-soft-foreground`); en Badge, `secondary` soft (`muted`). Se diseñan en Claude Design (plan, D6).

**En ui-core desde la T.0b:** los tokens de las tablas de arriba para Avatar, Switch, Checkbox, FormField, Separator, Skeleton, Badge, Textarea, y los nuevos de Button (`px`, `gap`, `press-scale`), Input (`px`, `bg`, `fg`, `border`, `border-focus`, `error`, `placeholder`) y Card (`padding`, `bg`, `fg`, `border`), con los valores de la 0.1.0 como respaldo (el aspecto no cambia). Los colores van solo en el CSS (sección 6.2). Diferencias con la hoja:

- **Button y Badge no tienen tokens de color** (`bg`, `fg`, `bg-hover`, `border` color, `shadow`, `shadow-hover`, `ring`): los ponen los tokens del tono (V.1).
- **`--mimi-field-error`** vale `destructive` (el color de la 0.1.0); la hoja dice `destructive-soft-foreground`. A revisar en el diseño (plan, D6).
- **No se agregaron:** `--mimi-field-hint` (FormField no tiene texto de ayuda), `--mimi-input-border-hover` (Input no tiene hover y `input-hover` no está en ui-core: cambiaría el aspecto) ni `--mimi-input-ring` (en la hoja es una sombra completa; hoy el halo es `ring-3` con un color en utilidades compartidas).
- **Avatar:** el radio por defecto es el de `rounded-full` (`calc(infinity * 1px)`); la hoja dice `999px`, que se ve igual.
- **Switch:** el pulgar mide alto − 4px y se desplaza ancho − alto, así que cambiar `--mimi-switch-width` o `-height` mantiene la proporción. `--mimi-switch-off` sigue siendo global; `--mimi-switch-track-off` cae en él.

### Otros globales del diseño

Están en `tokens-mimi.css` (valores en claro y oscuro) y no tienen fila propia en la hoja:

- **Texto sobre fondos suaves:** `--mimi-success-soft-foreground`, `--mimi-warning-soft-foreground`, `--mimi-info-soft-foreground` y `--mimi-destructive-soft-foreground`.
- **Superficies:** `--mimi-tooltip` y `--mimi-tooltip-foreground`; `--mimi-overlay` y `--mimi-overlay-blur` (fondo de Dialog y Sheet); `--mimi-glass`, `--mimi-glass-border` y `--mimi-glass-blur` (píldoras translúcidas de mimi-toolbar y Pagination); `--mimi-soft-mix` (cuánto tono lleva el fondo suave: 12 % en claro, 18 % en oscuro).
- **Campos:** `--mimi-input-background`, `--mimi-input-hover`, `--mimi-ring-soft` y `--mimi-switch-off`.
- **Entradas avanzadas:** `--mimi-range`, `--mimi-track`, `--mimi-track-fill`, `--mimi-thumb`, `--mimi-chip`, `--mimi-chip-foreground`, `--mimi-dropzone`, `--mimi-dropzone-active`, `--mimi-dropzone-active-border`, `--mimi-strength-weak`, `--mimi-strength-medium`, `--mimi-strength-strong`, `--mimi-selection` y `--mimi-corner-shape` (sin uso en Mimi; el radio «Squircle» es del Theme Studio, `docs/futuro/theme-studio.md`).
- **Keyframes:** `mimi-spin`, `mimi-pulse`, `mimi-caret`, `mimi-bob`, `mimi-shake` y los de Mimi Effects (`mimi-beam`, `mimi-marquee`, `mimi-typing-*`, `mimi-blurfade-*`, `mimi-reveal`). `mimi-indet` (la barra indeterminada de Progress) está en `F5 Estructura`, no en `tokens-mimi.css`; también es global (decidido por el usuario el 03/11/2026): está en `theme-base.css` con `mimi-caret`, `mimi-bob` y `mimi-shake` desde la G2.0b. Los globales de «Entradas avanzadas» (menos `corner-shape`) también están en `theme-base.css` desde la G2.0b (sección 6.1).

### Reglas

- **Obligatorio en cada componente nuevo:** registrar sus tokens en `MimiComponentTokens` (`theme/types.ts`) y su prefijo en `COMPONENT_PREFIX` (`theme/provider.ts`), con prueba en `provider.spec.ts`; tener su tabla en esta sección; y agregarlo a `apps/docs/src/app/code/component-tokens.ts`, la única lista de variables por componente (de ahí sale la tabla «Variables CSS» de su página, y `component-tokens.spec.ts` la compara con el código). Es un paso del comando `/componente`. **Motivo:** este sistema (los tres niveles, la cascada de la sección 6.2, el preset y `component-tokens.ts`) es el contrato que usará el Theme Studio, un proyecto aparte (`docs/futuro/theme-studio.md`). El Studio no define variables propias: edita las que Mimi expone. Un componente sin tokens registrados no se podrá personalizar ni con el preset ni con el Studio.
- **Prefijos:** los de la hoja son `btn`, `input`, `textarea`, `badge`, `card`, `avatar`, `switch`, `checkbox`, `field` (FormField), `separator`, `skeleton`, `select`, `dialog`, `confirm`, `toast`, `tooltip`, `popover`, `menu` (Dropdown y Context Menu comparten), `tabs`, `toolbar` y `pagination`. Los del Grupo 2 (G2.0): `toggle-group`, `number` (Number Input), `password`, `mask` (Input Mask), `otp`, `tags`, `chip` (compartido por Tags Input y Combobox), `slider`, `combobox`, `date` (Date Picker y Date Range, provisional), `progress`, `upload` (File Upload) y `color-picker`. En el código de la 0.1.0 solo están registrados `btn`, `input` y `card`.
- **Nombres de los derivados:** `<tono>-soft` es el fondo suave, `<tono>-ring` el anillo y `<tono>-hover` el hover. El `--mimi-destructive-soft` de ui-core (un anillo, anterior a la convención) pasa a `--mimi-destructive-ring` en la tarea T.1; el fondo suave de destructive es `--mimi-destructive-soft-bg`.
- **Diferencias entre el código de la 0.1.0 y la hoja** (se resuelven en T.0b, cuidando los presets que ya usan los nombres viejos):
  - Button: el código usa `--mimi-btn-padding-x`, `--mimi-btn-border-width`, `--mimi-btn-letter-spacing`, `--mimi-btn-focus-ring-width` y `--mimi-btn-height-sm`/`-lg`; la hoja usa `px`, `border` (color), `gap`, `bg`, `fg`, `bg-hover`, `shadow`, `shadow-hover`, `ring` y `press-scale`.
  - Input: el código usa `--mimi-input-padding-x`, `--mimi-input-placeholder-color`, `--mimi-input-disabled-opacity`, `--mimi-input-border-width`, `--mimi-input-focus-ring-width`, `--mimi-input-font-size` y `--mimi-input-height-sm`/`-lg`; la hoja usa `px`, `placeholder`, `bg`, `fg`, `border`, `border-hover`, `border-focus`, `ring` y `error`.
  - Textarea: en el código usa los tokens de Input; la hoja le da los suyos (`--mimi-textarea-*`).
  - Card: el código usa `--mimi-card-padding-header`, `-content` y `-footer` y `--mimi-card-border-width`; la hoja usa un solo `--mimi-card-padding` y `bg`, `fg` y `border` (color).
  - Badge: el token de componente `--mimi-badge-radius` se llama igual que el global (ver la nota de su tabla).

### Correcciones pendientes del diseño

Textos de los diseños que contradicen la spec. Se corrigen cuando ese texto pase al código; la spec manda.

- `Mimi Sitio.dc.html`: `pnpm add lucide-angular` → `@lucide/angular` (o `ng add @mimi-ng/cli --icons`).
- `Mimi Sitio.dc.html`: `import { definePreset } from '@mimi-ng/theme'` no existe → `provideMimiTheme(preset)` con un `MimiThemePreset` (`colors` y `darkColors`, sección 6.3). (`Mimi Theme Studio.dc.html` tiene el mismo error: ver `docs/futuro/theme-studio.md`.)
- `Mimi Sitio.dc.html`: `import { MimiInput } from '@/app/components/ui/input/input'` → `@/components/ui/input`.
- `mimi-variables-componentes.css`: `--mimi-badge-radius: var(--mimi-badge-radius)` (referencia a sí misma). **Corregido** en `docs/design/` con `999px`.
