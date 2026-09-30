# Mimi (@mimi-ng): especificación

## 1. Qué es

Librería de componentes UI para **Angular 22** y **Tailwind CSS 4** que se distribuye como código fuente: una CLI copia cada componente al proyecto del usuario, que desde ese momento es dueño del código. Usa un solo prefijo (`mimi`) y un archivo de tema opcional tipado, al estilo de los presets de PrimeNG. El requisito principal es que sea **muy fácil de usar**.

### Diferenciales (frente a Spartan y shadcn)

1. **Actualizaciones que respetan tus cambios.** La CLI guarda la versión original de cada componente en `.mimi/base/` y `mimi update` combina la versión nueva con las personalizaciones del usuario, mostrando solo los conflictos. (Spartan obliga a actualizar a mano o sobrescribe.)
2. **Un solo modelo mental.** Sin capas Brain/Helm: un prefijo y todo el código en tu proyecto.
3. **Familiar para quien viene de PrimeNG o NG-ZORRO.** APIs como `showSearch` y `allowClear`, modales por servicio y presets tipados. Página de migración con equivalencias.
4. **Formularios listos.** Errores en rojo y mensajes automáticos.
5. **Estilo Vivid:** paleta neutra con radio amplio, sombras en capas y micro-animaciones (inspirado en Vuesax).
6. **Documentación en español e inglés.**

Frase principal: _"Los componentes son tuyos. Las actualizaciones también."_

### Reglas del código que se entrega

- **Solo APIs documentadas de Angular.** El código que la CLI copia queda en el proyecto de cada usuario: si dependiera de un detalle interno de Angular y ese detalle cambiara, tras un `ng update` el componente dejaría de funcionar sin ningún aviso, y la corrección de Mimi no le llegaría sola. Por eso no se usan símbolos `ɵ`, clases internas ni comportamientos no documentados, aunque ahorren código o peso. Ver el costo aceptado en la sección 8 (`field-state` y Signal Forms).

## 2. Stack

| Capa              | Tecnología                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------- |
| Framework         | Angular 22 (standalone, OnPush, zoneless, signals)                                                              |
| Estilos           | Tailwind CSS 4 (configuración en CSS, sin `tailwind.config.js`)                                                 |
| Colores           | OKLCH en variables CSS `--mimi-*`                                                                               |
| Clases            | `clsx` + `tailwind-merge` → `cn()`                                                                              |
| Variantes         | `class-variance-authority` (`cva`)                                                                              |
| Overlays (Fase 4) | `@angular/cdk` (`overlay`, `dialog`, `a11y`)                                                                    |
| Íconos            | Lucide: SVG en línea dentro de los componentes; `@lucide/angular` en el showcase y como recomendación           |
| CLI               | Angular Schematics + comando `mimi`                                                                             |
| Monorepo          | pnpm workspaces                                                                                                 |
| Formato           | Prettier en la raíz (`.prettierrc`, `.prettierignore`); `pnpm format` escribe y `pnpm format:check` solo revisa |
| Showcase          | Angular 22 puro (no AnalogJS), con prerender                                                                    |

### Versiones

| Herramienta            | Versión instalada | Requisito                                                                                    |
| ---------------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| Node.js                | 24.15.0           | Angular 22 exige `^22.22.3 \|\| ^24.15.0 \|\| ^26.0.0`                                       |
| pnpm                   | 12.5.1            | Fijada en `packageManager` del `package.json` raíz                                           |
| Angular (framework)    | 22.1.7            | `@angular/core`, `common`, `compiler`, `compiler-cli`, `forms`, `platform-browser`, `router` |
| Angular (herramientas) | 22.1.8            | `@angular/cli`, `@angular/build` (se versionan aparte del framework)                         |
| TypeScript             | 6.0.3             | Angular 22 exige `>=6.0.0 <6.1.0`                                                            |
| Tailwind CSS           | 4.3.3             | Con `@tailwindcss/postcss`                                                                   |
| Vitest                 | 4.1.11            | Pruebas de docs y ui-core con `ng test` (con jsdom)                                          |
| @lucide/angular        | 1.47.0            | Íconos del showcase (peer `@angular/core >=17`); en el `package.json` raíz                   |
| shiki                  | 4.4.3             | Resaltado del showcase (con `@shikijs/langs` y `@shikijs/themes`); en el `package.json` raíz |

El showcase se despliega con wrangler 4 (`npx wrangler@4 deploy`, sin instalarlo como dependencia) y Node 24.18.0 (`.node-version`); ver sección 10, «Despliegue».

pnpm 11+ bloquea los scripts de instalación: los autorizados están en `allowBuilds` de `pnpm-workspace.yaml` (`@parcel/watcher`, `esbuild`, `lmdb`, `msgpackr-extract`).

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
├── docs/                      # spec.md, plan.md, design/
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
- **Publicación** (tarea L.5): sin `"private"`. `prepublishOnly` ejecuta `scripts/build.mjs`, así que `pnpm publish` siempre publica un `dist/` recién compilado (está en `.gitignore`). La publica el dueño del proyecto desde `packages/cli` con `pnpm publish` y la verificación en dos pasos de npm.
- **Pruebas** (`pnpm test:cli`, incluido en `pnpm test`): Vitest en Node, contra `dist/`. `registry.spec.ts` comprueba el registro contra el código real; `init.spec.ts` y `ui.spec.ts` usan `SchematicTestRunner` sobre un workspace creado en memoria con `@schematics/angular` (`workspace` + `application`), no jsdom.

## 4. Catálogo

### Fase 2 del plan: componentes básicos (MVP)

| Componente | Selector                                                                                                             | Notas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button     | `button[mimiBtn]`, `a[mimiBtn]`                                                                                      | Variantes: default, secondary, destructive, outline, ghost, link. Tamaños: sm, default, lg, icon. Input `loading` con spinner                                                                                                                                                                                                                                                                                                                                                                                                                |
| Input      | `input[mimiInput]`                                                                                                   | Error automático                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Textarea   | `textarea[mimiTextarea]`                                                                                             | Error automático                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Badge      | `span[mimiBadge]`                                                                                                    | default, secondary, outline, destructive. Solo `<span>`, sin hover ni foco; íconos a 12px                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Card       | `mimi-card`, `mimi-card-header`, `mimi-card-title`, `mimi-card-description`, `mimi-card-content`, `mimi-card-footer` | Exporta `MimiCardImports`. `mimi-card-title` lleva `role="heading"` y `level` (`aria-level`, 3 por defecto); el pie se alinea a la derecha; contenido y pie suman `pt-6` si son la primera pieza                                                                                                                                                                                                                                                                                                                                             |
| Separator  | `mimi-separator`                                                                                                     | `orientation`: horizontal / vertical. `decorative` (true por defecto, como shadcn): `role="none"`; en `false`, `role="separator"` con `aria-orientation`. La vertical toma el alto de su fila flex (`self-stretch`)                                                                                                                                                                                                                                                                                                                          |
| Skeleton   | `mimi-skeleton`                                                                                                      | `animate-mimi-pulse` (1,6 s, como el diseño; quieto con `motion-reduce`), `bg-muted`, `rounded-sm`. Tamaño y forma con `class`. `aria-hidden`; el contenedor lleva `aria-busy`                                                                                                                                                                                                                                                                                                                                                               |
| Avatar     | `mimi-avatar`, `img[mimiAvatarImage]`, `mimi-avatar-fallback`                                                        | `size`: sm (32px) / default (40px) / lg (56px). El fallback se ve mientras la imagen carga, si falla o si no hay imagen; estado en `data-state` (`idle                                                                                                                                                                                                                                                                                                                                                                                       | loading | loaded | error`), también si la imagen ya estaba en caché. La imagen es el `<img>` nativo (`src`es entrada y se reescribe en el elemento;`ngSrc`no está soportado).`label`en el fallback da`role="img"`+`aria-label`. Exporta `MimiAvatarImports` |
| Switch     | `mimi-switch`                                                                                                        | `checked = model(false)`, `role="switch"`, Espacio y Enter. Por dentro es un `<button type="button">` y no un `<input type="checkbox">`: el pulgar y el check del diseño no se pueden dibujar de forma fiable con pseudoelementos sobre un input en todos los navegadores. Implementa `FormCheckboxControl` (spec 8), nunca ControlValueAccessor. El texto de adentro va en un `<label for>`; `id`, `aria-label` y `aria-labelledby` pasan al botón; `class` va al envoltorio                                                                |
| Checkbox   | `mimi-checkbox`                                                                                                      | `checked` e `indeterminate` (`model`, `aria-checked="mixed"`), `role="checkbox"`, Espacio (Enter no, patrón WAI). Por dentro es un `<button type="button">` y no un `<input type="checkbox">`: el pulgar y el check del diseño no se pueden dibujar de forma fiable con pseudoelementos sobre un input en todos los navegadores. Implementa `FormCheckboxControl` (spec 8), nunca ControlValueAccessor. El texto de adentro va en un `<label for>`; `id`, `aria-label` y `aria-labelledby` pasan al botón; `class` va al envoltorio          |
| FormField  | `mimi-form-field`, `mimi-form-error`                                                                                 | Etiqueta + control + mensaje, sin `@if`. `label` dibuja un `<label for>`; un `<label>` propio sin `for` también se enlaza; si el control no tiene `id`, recibe uno. Con error: etiqueta roja y mensaje del primer error (13px, circle-alert de 14px), en el `aria-describedby` del control. `mimi-form-error` es opcional (texto o posición propios) y está siempre en el DOM con `aria-live="polite"` (vacío sin error). Mensajes: `provideMimiErrorMessages`, inglés por defecto, `MIMI_ERROR_MESSAGES_ES`. Exporta `MimiFormFieldImports` |

**Nombres y archivos.** Sin sufijo en todos los componentes: la clase es `Mimi<Nombre>` (`MimiButton`, `MimiInput`, `MimiTextarea`, `MimiBadge`, `MimiCard`, `MimiFormField`, `MimiFormError`…) y el archivo `<nombre>.ts` (`button.ts`, `form-field.ts`), sin `.component` ni `.directive`. Las variantes de `cva` van en `<nombre>.variants.ts`. Los servicios conservan su sufijo (`MimiDialogService`).

### Archivos por componente (para `registry.json`, Fase 3)

Rutas relativas a `packages/ui-core/src/lib/`. En el proyecto del usuario, `components/<nombre>/` va a `src/app/components/ui/<nombre>/`, `utils/` a `src/app/components/ui/utils/` y `theme/` a `src/app/components/ui/theme/`.

**Importaciones entre archivos de ui-core:** siempre con el alias y el **archivo concreto** (`@/components/ui/utils/cn`, `@/components/ui/utils/control-styles`, `@/components/ui/utils/field-state`, `@/components/ui/theme/provider`, `@/components/ui/<otro-componente>`). Nunca con el índice de `utils` o `theme`: el de utils reexporta `field-state`, que importa `@angular/forms`, y esbuild no puede descartarlo, así que quien usara solo Button cargaría los formularios completos (unos 97 kB). Tampoco con rutas relativas que salgan de su carpeta (`../../utils/cn`), porque la CLI copia los archivos a otra estructura. Dentro de una misma carpeta sí se usan rutas relativas (`./button.variants`). `packages/ui-core/src/lib/imports.spec.ts` recorre los archivos y falla si no se cumple.

En el monorepo, `tsconfig.base.json` define `@/components/ui/utils/*` y `@/components/ui/theme/*` (y sus índices) antes del comodín `@/components/ui/*` → `components/*`; en el proyecto del usuario basta el comodín. El showcase importa los componentes igual que el usuario (`@/components/ui/button`), no desde `@mimi-ng/ui-core`, para que el monorepo se comporte igual que un proyecto real.

| Componente | Archivos                                                                                                                                                  | Dependencias npm                                                            | Otros archivos de ui-core                                                                                                                                                                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Button     | `components/button/button.ts`, `components/button/button.variants.ts`, `components/button/index.ts`                                                       | `class-variance-authority`, `clsx`, `tailwind-merge`                        | `utils/cn.ts`, `utils/control-styles.ts`; tokens de `theme/theme-base.css` (colores, sombras, `--mimi-control-height*`, `--mimi-radius`, `--mimi-press-scale`, `mimi-transition`, `@keyframes mimi-spin`)                                                                                                                |
| Input      | `components/input/input.ts`, `components/input/input.variants.ts`, `components/input/index.ts`                                                            | `class-variance-authority`, `clsx`, `tailwind-merge`; peer `@angular/forms` | `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts`; tokens de `theme/theme-base.css` (`input`, `input-background`, `ring`, `ring-soft`, `destructive`, `destructive-soft`, `muted-foreground`, `--mimi-control-height*`, `--mimi-radius`, `mimi-transition`)                                               |
| Textarea   | `components/textarea/textarea.ts`, `components/textarea/textarea.variants.ts`, `components/textarea/index.ts`                                             | `class-variance-authority`, `clsx`, `tailwind-merge`; peer `@angular/forms` | `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts`; los mismos tokens que Input (usa `--mimi-input-*`)                                                                                                                                                                                                     |
| Badge      | `components/badge/badge.ts`, `components/badge/badge.variants.ts`, `components/badge/index.ts`                                                            | `class-variance-authority`, `clsx`, `tailwind-merge`                        | `utils/cn.ts`; tokens de `theme/theme-base.css` (`primary`, `secondary`, `destructive` y sus `-foreground`, `foreground`, `border`, `--mimi-badge-radius`). Sin variables propias; íconos a 12px (`[&_svg]:size-3`, `shrink-0`)                                                                                          |
| Card       | `components/card/card.ts`, `components/card/index.ts`                                                                                                     | `clsx`, `tailwind-merge` (vía `cn`)                                         | `utils/cn.ts`; tokens `--mimi-card-*` (spec 6.3, `MimiCardTokens`), `--mimi-radius-card`, `--mimi-shadow-card`, `card`, `card-foreground`, `border`, `muted-foreground`. Los ejemplos usan Button e Input, pero Card no depende de ellos                                                                                 |
| Separator  | `components/separator/separator.ts`, `components/separator/separator.variants.ts`, `components/separator/index.ts`                                        | `class-variance-authority`, `clsx`, `tailwind-merge`                        | `utils/cn.ts`; token `border` de `theme/theme-base.css`. Sin variables propias                                                                                                                                                                                                                                           |
| Skeleton   | `components/skeleton/skeleton.ts`, `components/skeleton/index.ts`                                                                                         | `clsx`, `tailwind-merge` (vía `cn`)                                         | `utils/cn.ts` (registra `animate-mimi-pulse`); de `theme/theme-base.css`: `muted`, `--radius-sm`, `--animate-mimi-pulse` y el keyframe `mimi-pulse`. Sin variables propias                                                                                                                                               |
| Avatar     | `components/avatar/avatar.ts`, `components/avatar/avatar.variants.ts`, `components/avatar/index.ts`                                                       | `class-variance-authority`, `clsx`, `tailwind-merge`                        | `utils/cn.ts`; tokens `muted`, `secondary`, `secondary-foreground` de `theme/theme-base.css`. Sin variables propias                                                                                                                                                                                                      |
| Switch     | `components/switch/switch.ts`, `components/switch/index.ts`                                                                                               | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms`                  | `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts` (provee `MIMI_FIELD_CONTROL`); de `theme/theme-base.css`: `switch-off`, `primary`, `primary-foreground`, `background`, `--mimi-shadow-primary`, `--mimi-shadow-thumb`, `--mimi-press-scale-sm`, `--mimi-transition` (con `translate`)                   |
| Checkbox   | `components/checkbox/checkbox.ts`, `components/checkbox/index.ts`                                                                                         | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms`                  | `utils/cn.ts`, `utils/control-styles.ts`, `utils/field-state.ts` (provee `MIMI_FIELD_CONTROL`); de `theme/theme-base.css`: `input`, `input-background`, `primary`, `primary-foreground`, `ring`, `destructive`, `--mimi-shadow-primary`, `--mimi-press-scale-sm`, `--radius-sm`. Íconos check y minus de Lucide en línea |
| FormField  | `components/form-field/form-field.ts`, `components/form-field/form-error.ts`, `components/form-field/error-messages.ts`, `components/form-field/index.ts` | `clsx`, `tailwind-merge` (vía `cn`); peer `@angular/forms`                  | `utils/cn.ts`, `utils/field-state.ts` (`MIMI_FIELD_CONTROL`, `MimiFieldError`); token `destructive`. No depende de Input, Textarea, Switch ni Checkbox: los encuentra por el token. Ícono circle-alert de Lucide en línea                                                                                                |

### Fase 4 del plan: overlays

- **Select** (`mimi-select`), estilo NG-ZORRO: buscador interno, limpiar, cargando, sin resultados, opciones deshabilitadas, check en la activa, teclado (flechas, Enter, Escape, Home/End), ControlValueAccessor.
  ```ts
  export interface MimiOption<T = unknown> {
    label: string;
    value: T;
    disabled?: boolean;
  }
  ```
- **Dialog** (`MimiDialogService`): `dialog.open(MiComponente, { data, width, maxWidth, disableClose, injector })`. Sin header/body/footer obligatorios, **siempre** con una X arriba a la derecha. Cierra con X, Escape y clic en el fondo (salvo `disableClose`). Datos con `inject(MIMI_DIALOG_DATA)`.

### Después

DropdownMenu, Tooltip, Tabs, Popover, Combobox múltiple, DatePicker, Toast, Table. Badge interactivo (`a[mimiBadge]` o `button[mimiBadge]`, con hover y foco).

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

El sitio solo muestra comandos que funcionan hoy, salvo los marcados como versión futura: una prueba del showcase (`apps/docs/src/app/commands.spec.ts`) falla si aparece `mimi add`, `mimi list` o `mimi theme`, o `mimi update` sin marcarlo como futuro. La misma prueba falla si aparece `ng g ui` (sin el paquete): funciona, pero no se muestra; la forma larga `ng g @mimi-ng/cli:ui` sí. `InstallCommand` muestra `ng g mimi <nombre>` y la forma larga; la pestaña de pnpm vuelve con la tarea 5.3.

**Nombre del schematic: `mimi`, con `ui` como alias** (`collection.json`; el código sigue en `src/ui/`). `ng g ui` no dice de qué librería es y otras (Spartan) también tienen un schematic `ui`. Además, la CLI de Angular (22, `commands/generate`) recorre `schematicCollections` en orden y **descarta los schematics cuyo nombre ya apareció en una colección anterior, con sus alias**, antes de buscar el pedido. Si el schematic se llamara `ui` con alias `mimi` y otra colección con un `ui` fuera antes, `ng g mimi` fallaría. Con el nombre `mimi`, `ng g mimi` funciona siempre que Mimi esté en `schematicCollections`; `ng g ui` va a Mimi solo si ninguna colección anterior tiene un `ui`. Con el paquete explícito (`ng g @mimi-ng/cli:ui`) solo se busca en Mimi y el alias resuelve.

**Cuándo hace falta la forma larga:** si Mimi no está en `schematicCollections` (el usuario editó la lista u otra herramienta la reemplazó). Sin `ng add` no funciona ninguna de las dos: falta `mimi.json` y la CLI pide ejecutar `ng add` primero.

El comando `mimi` es una capa delgada que llama a los schematics. El schematic `mimi` acepta varios nombres (opción `components` de tipo `array` con `"$default": { "$source": "argv", "index": 0 }`: la CLI de Angular la registra como posicional variádica, `mimi [components ..]`) y, sin nombres y con terminal interactiva, muestra un `x-prompt` de selección múltiple (`"type": "list"`, `"multiselect": true`).

### Qué hace `init` (y `ng add`)

`ng add @mimi-ng/cli` ejecuta el schematic `ng-add`, que corre `init` con las mismas opciones. Opciones: `--project` (si el workspace tiene varias aplicaciones), `--icons` (instala `@lucide/angular`; por defecto no, y con terminal interactiva lo pregunta: _"¿Quieres instalar @lucide/angular para tus íconos? (recomendado)"_) y `--overwrite`.

**Primero verifica, sin modificar nada.** Si algo falla, termina con un mensaje claro y el proyecto queda como estaba:

1. Proyecto: el de `--project`; si no, la única aplicación de `angular.json`; si hay varias, pide `--project`.
2. Angular 22 o superior (`@angular/core` en `package.json`).
3. Tailwind 4: `tailwindcss` con versión mayor ≥ 4, y `@import "tailwindcss"` en el CSS global. El CSS global se busca en `angular.json` (`build` → `options` → `styles`, solo `.css`), no se supone `src/styles.css`. Si falta, explica cómo agregarlo (`ng add tailwindcss` o la guía de Tailwind para Angular); no lo instala.

**Después configura:**

4. Carpeta de componentes: `aliases.components` de `mimi.json` si existe; si no, `<sourceRoot>/app/components/ui` (`src/app/components/ui`).
5. Copia el tema (`theme/theme-base.css`, `types.ts`, `provider.ts`, `index.ts`) y las utilidades base (`utils/cn.ts`, `utils/control-styles.ts`) a esa carpeta. `utils/field-state.ts` llega con los componentes que lo necesitan. No hay `utils/index.ts`: arrastraría `@angular/forms` a quien use solo Button.
6. Agrega `@import "<ruta>/theme/theme-base.css";` justo después del `@import "tailwindcss"`. **No** agrega `@source`: en el proyecto del usuario los componentes están dentro de `src/` y la detección automática de Tailwind 4 ya los escanea (el `@source` solo hace falta en el showcase, donde los componentes viven en `packages/ui-core/src`). Excepción: si el import usa `source(none)`, Tailwind no escanea nada por su cuenta, así que agrega `@source "<ruta a la carpeta>";` y lo avisa.
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
3. **Resolución:** los pedidos y sus `registryDependencies`, de forma transitiva, sin duplicados y con las dependencias primero (`form-field` trae `utils/cn` y `utils/field-state`). Si falta un archivo de init (por ejemplo, el usuario borró `utils/cn.ts`), se vuelve a copiar.

**Después escribe:**

4. **Archivos** en la carpeta de `mimi.json`. Los componentes van sin `components/` (`<carpeta>/button/button.ts`), para que `@/components/ui/button` los encuentre; utils y tema conservan su carpeta. Antes de escribir revisa el árbol. Si el archivo ya existe:
   - igual a la plantilla → al día;
   - igual a su base en `.mimi/base/` → el usuario no lo tocó. Si la base es de esta versión, la diferencia con la plantilla es solo de formato: al día. Si es de una versión anterior, se actualiza y lo dice ("button actualizado de 0.1.0 a 0.2.0");
   - distinto de su base, o sin base → modificado por el usuario: se omite con aviso; `--overwrite` lo reemplaza.

   **Por qué contra la base y no contra la plantilla:** la CLI de Angular pasa el Prettier del proyecto por los archivos que escriben los schematics. Si el Prettier del usuario tiene otro estilo que ui-core, el archivo y su base quedan reformateados igual y distintos de la plantilla; compararlos con la plantilla los haría pasar por modificados en cada ejecución (lo encontró la prueba de la tarea 3.7). Nunca salta "merge conflicted".

5. **`.mimi/base/`** (en la raíz del workspace, con la misma estructura: `.mimi/base/button/button.ts`, `.mimi/base/utils/cn.ts`): la copia original de cada archivo, que usará `mimi update` (Fase 5). Se escribe cuando el archivo del proyecto queda igual a la plantilla (creado, actualizado, reemplazado con `--overwrite`, o idéntico y todavía sin base). Si el archivo se omitió por estar modificado, su base **no** cambia. **`.mimi/manifest.json`** guarda con qué versión de Mimi se escribió cada base (`{ "files": { "button/button.ts": "0.1.0", … } }`); con eso se distingue un archivo formateado (misma versión) de uno que hay que actualizar (versión anterior).
6. **`mimi.json` → `components`:** `{ "button": { "version": "0.1.0" } }` para cada componente pedido o traído como dependencia, solo si todos sus archivos quedaron iguales a la plantilla; si alguno se omitió, se conserva lo que había.
7. **Dependencias:** las `dependencies` de los ítems, con la versión del registro, si el proyecto no las tiene. Las `peerDependencies` (como `@angular/forms`) solo si faltan; las de `@angular/*` con el mismo rango que el `@angular/core` del proyecto, para que no queden desalineadas. Se instalan con el gestor de paquetes del proyecto.
8. **Mensaje final:** qué se agregó o reemplazó, qué se omitió y por qué (con la sugerencia de `--overwrite`), qué dependencias se instalan, y que `.mimi/` debe quedar en git.

Idempotente: `ng g mimi button` dos veces no cambia nada ni vuelve a instalar.

**Limitación conocida:** una sola configuración de Mimi por workspace (`mimi.json` y `.mimi/` en la raíz). Varias aplicaciones con carpetas de componentes distintas no están soportadas por ahora: `init --project` configura la aplicación elegida y `mimi` usa la carpeta de `mimi.json`.

### `mimi.json`

```json
{
  "style": "vivid",
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

El tema vive en `packages/ui-core/src/lib/theme/theme-base.css` (valores de `docs/design/tokens-vivid.css`). Contiene, en este orden: `@custom-variant dark`, `:root` (claro), `.dark` (oscuro), el bloque `prefers-reduced-motion` (6.6), `@theme inline`, `@utility mimi-transition`, `@layer base` y los `@keyframes` `mimi-spin` y `mimi-pulse`. No importa Tailwind ni carga fuentes.

`ui-core` lo publica en `exports` como `./theme.css`. El showcase depende de `@mimi-ng/ui-core` (`workspace:*`) y su `styles.css` queda así:

```css
@import 'tailwindcss' source(none);
@import '@mimi-ng/ui-core/theme.css';
@source '.';
@source '../../../packages/ui-core/src';
@source not '../../../packages/ui-core/src/**/*.spec.ts';
```

**Variables `--mimi-*`** (todas en `:root`; las marcadas con ◐ se redefinen en `.dark`):

| Grupo                     | Variables                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Colores ◐                 | `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `destructive-foreground`, `border`, `input`, `input-background`, `ring`, `overlay` (fondo detrás de paneles y diálogos: `oklch(0 0 0 / 50%)` en los dos modos) |
| Derivados ◐ (`color-mix`) | `primary-hover`, `secondary-hover`, `destructive-hover`, `ring-soft`, `destructive-soft`, `switch-off`                                                                                                                                                                                                                                                                                                  |
| Sombras ◐                 | `shadow-card`, `shadow-primary`, `shadow-primary-hover`, `shadow-destructive`, `shadow-destructive-hover`, `shadow-neutral`, `shadow-neutral-hover`, `shadow-thumb` (pulgar del Switch, `0 1px 3px oklch(0 0 0 / .2)`, igual en los dos modos)                                                                                                                                                          |
| Fuentes                   | `font-sans` (`'Outfit', ui-sans-serif, system-ui, sans-serif`), `font-mono` (`'Geist Mono', ui-monospace, monospace`)                                                                                                                                                                                                                                                                                   |
| Forma                     | `radius` (0.75rem), `radius-sm` (`min(radius / 2, 6px)`), `radius-card` (`min(radius + 4px, 24px)`), `badge-radius` (999px)                                                                                                                                                                                                                                                                             |
| Alturas                   | `control-height` (2.5rem), `control-height-sm` (2rem), `control-height-lg` (3rem)                                                                                                                                                                                                                                                                                                                       |
| Movimiento                | `transition`, `press-scale`, `press-scale-sm` (Switch y Checkbox), `lift` (0px, sin uso por ahora). Ver 6.6                                                                                                                                                                                                                                                                                             |

**`@theme inline`** (siempre `inline`: los valores son `var()` y deben resolverse donde se usan, o el modo oscuro falla):

| Tailwind                     | Origen                                                         | Clases                                                                                                                                                              |
| ---------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-*`                  | cada color y derivado de arriba                                | `bg-*`, `text-*`, `border-*`, `ring-*`, `outline-*`, `fill-*`…                                                                                                      |
| `--radius-sm`                | `--mimi-radius-sm`                                             | `rounded-sm`                                                                                                                                                        |
| `--radius-md`                | `calc(radius - 2px)`                                           | `rounded-md`                                                                                                                                                        |
| `--radius-lg`                | `--mimi-radius`                                                | `rounded-lg`                                                                                                                                                        |
| `--radius-xl`                | `calc(radius + 4px)`                                           | `rounded-xl`                                                                                                                                                        |
| `--radius-card`              | `--mimi-radius-card`                                           | `rounded-card`                                                                                                                                                      |
| `--radius-badge`             | `--mimi-badge-radius`                                          | `rounded-badge`                                                                                                                                                     |
| `--shadow-*`                 | cada sombra                                                    | `shadow-card`, `shadow-primary`, `shadow-primary-hover`, `shadow-destructive`, `shadow-destructive-hover`, `shadow-neutral`, `shadow-neutral-hover`, `shadow-thumb` |
| `--font-sans`, `--font-mono` | fuentes                                                        | `font-sans` (también la fuente por defecto de la página), `font-mono`                                                                                               |
| `--animate-mimi-pulse`       | `mimi-pulse 1.6s ease-in-out infinite` (keyframe `mimi-pulse`) | `animate-mimi-pulse` (Skeleton). Registrada en `cn.ts` (grupo `animate`)                                                                                            |

Las alturas no se exponen: los componentes usan la cascada de 6.2 (`h-(--mimi-control-height)` o `h-[var(--mimi-btn-height,var(--mimi-control-height,2.5rem))]`).

**`@layer base`:** `*, ::before, ::after { border-color: var(--mimi-border) }` (en Tailwind 4 el borde por defecto es `currentColor`) y `body` con `background-color: var(--mimi-background)` y `color: var(--mimi-foreground)`. La fuente no se pone en `body`: Tailwind la toma de `--font-sans`.

**Fuentes:** `ui-core` no carga ninguna. El showcase carga Outfit desde Google Fonts en `index.html`.

**Navegadores sin `color-mix`:** Tailwind (Lightning CSS) agrega un respaldo: deja `var(--mimi-primary)` y pone el valor con `color-mix` dentro de `@supports (color: color-mix(in lab, red, red))`. Es normal ver las dos versiones en el CSS compilado.

### 6.2 Cascada de tokens

Cada propiedad busca primero la variable del componente, luego la compartida y por último un valor fijo:

```css
height: var(--mimi-btn-height, var(--mimi-control-height, 2.5rem));
border-radius: var(--mimi-btn-radius, var(--mimi-radius, 0.75rem));
```

| Si defines…             | Afecta a…                                    |
| ----------------------- | -------------------------------------------- |
| `--mimi-control-height` | Button, Input, Textarea (y Select en Fase 4) |
| `--mimi-btn-height`     | Solo Button                                  |
| nada                    | Todos usan 2.5rem                            |

Valores de respaldo por tamaño (los mismos que los tokens de `theme-base.css`):

| Tamaño  | Variable compartida        | Respaldo |
| ------- | -------------------------- | -------- |
| sm      | `--mimi-control-height-sm` | 2rem     |
| default | `--mimi-control-height`    | 2.5rem   |
| lg      | `--mimi-control-height-lg` | 3rem     |

### 6.3 Preset tipado (`theme/types.ts`)

Los tipos siguen a `theme-base.css`, que es la fuente de verdad. Los derivados con `color-mix` (`primary-hover`, `secondary-hover`, `destructive-hover`, `ring-soft`, `destructive-soft`, `switch-off`) **no** están en el preset: se recalculan solos a partir de los colores.

```ts
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
  overlay?: string; // fondo detrás de paneles y diálogos
}

export interface MimiShadowTokens {
  card?: string;
  primary?: string;
  primaryHover?: string;
  destructive?: string;
  destructiveHover?: string;
  neutral?: string;
  neutralHover?: string;
}

export interface MimiRadiusTokens {
  sm?: string;
  card?: string;
  badge?: string;
}

export interface MimiFontTokens {
  sans?: string;
  mono?: string;
}

export interface MimiMotionTokens {
  transition?: string; // debe animar `scale` (y `translate` si se usa `lift`)
  pressScale?: string | number;
  lift?: string;
}

export interface MimiControlSizeTokens {
  height?: string;
  heightSm?: string;
  heightLg?: string;
}

// Tokens por componente: contrato para la Fase 2 (cada componente los lee con la cascada de 6.2)
export interface MimiControlTokens extends MimiControlSizeTokens {
  radius?: string;
  paddingX?: string;
  fontSize?: string;
  borderWidth?: string;
  focusRingWidth?: string;
}
// paddingX y fontSize se aplican al tamaño default; sm y lg usan los valores del diseño.
// Sin transitionDuration: el movimiento lo controla --mimi-transition (spec 6.6).
export interface MimiButtonTokens extends MimiControlTokens {
  fontWeight?: string | number;
  letterSpacing?: string;
}
export interface MimiInputTokens extends MimiControlTokens {
  placeholderColor?: string;
  disabledOpacity?: string | number;
}
export interface MimiCardTokens {
  radius?: string;
  borderWidth?: string;
  shadow?: string;
  paddingHeader?: string;
  paddingContent?: string;
  paddingFooter?: string;
}
export interface MimiComponentTokens {
  button?: MimiButtonTokens;
  input?: MimiInputTokens;
  card?: MimiCardTokens;
  // select y dialog se agregan en la Fase 4
}

export interface MimiThemePreset {
  name?: string; // informativo, no genera CSS
  radius?: string; // --mimi-radius
  radii?: MimiRadiusTokens;
  colors?: MimiColorTokens; // modo claro
  darkColors?: MimiColorTokens; // modo oscuro
  shadows?: MimiShadowTokens;
  darkShadows?: MimiShadowTokens;
  fonts?: MimiFontTokens;
  motion?: MimiMotionTokens;
  controls?: MimiControlSizeTokens;
  components?: MimiComponentTokens;
}
```

`controls` solo tiene alturas: no existen variables `--mimi-control-*` para radio, padding o tamaño de letra. Esos tokens son por componente (`--mimi-btn-radius`, etc.).

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
| `applyMimiTheme(document, preset)` | Crea o reutiliza `<style id="mimi-theme">`, reemplaza su contenido y lo mueve al final del `<head>`. Con un preset vacío o `null` lo elimina. La usa también el personalizador de la Fase 5.     |
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

**`field-state.ts`**: `injectFieldState()` devuelve el estado del campo del elemento actual como signals (`invalid`, `touched`, `dirty`, `disabled`, `showError` = inválido y tocado o modificado, y `errors`: los errores normalizados como `MimiFieldError`, con `kind` en minúsculas, `message` y `params` con los nombres de Reactive Forms). También define el token `MIMI_FIELD_CONTROL`, que proveen Input, Textarea, Switch y Checkbox para `mimi-form-field`, sea cual sea el sistema de formularios (spec, sección 8). Lo usan Input y Textarea, y lo usará `mimi-form-error`.

**Pruebas de ui-core:** corren con `ng test ui-core` (`pnpm test:ui-core`, incluido en `pnpm test`), con TestBed disponible.

### 6.6 Movimiento

Tres variables controlan las micro-animaciones del estilo Vivid:

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
4. **Una instancia:** `<button mimiBtn class="w-full h-12">`. Todo componente recibe `class` como input y lo mezcla con `cn()`, así la clase del usuario siempre gana.

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

- **No** implementar `ControlValueAccessor` en los componentes de Mimi. Angular advierte que no hay que implementar a la vez `ControlValueAccessor` y `FormValueControl` / `FormCheckboxControl`.
- Para migrar de a poco existen `compatForm` y `SignalFormControl` (`@angular/forms/signals/compat`); Mimi no los necesita.

### Mensajes de error

- `mimi-form-field` agrupa etiqueta, control y mensaje, y muestra el mensaje del primer error sin escribir nada: `<mimi-form-field label="Correo">…</mimi-form-field>`. Encuentra el control por el token `MIMI_FIELD_CONTROL` (`utils/field-state.ts`), que proveen Input, Textarea, Switch y Checkbox.
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

- Los componentes traen sus íconos internos como SVG en línea con trazos de Lucide (licencia ISC; avisos en `THIRD_PARTY_NOTICES.md`, junto con el Octicon de GitHub del header). Fase 2: spinner, check, minus. Fase 4: chevron-down, x, search.
- Los íconos del usuario van por `ng-content` y se dimensionan solos: `[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none`.
- Recomendado para el usuario y usado en el showcase: `@lucide/angular` (standalone, signals, un componente por ícono):
  ```html
  <button mimiBtn><svg lucideSave></svg> Guardar</button>
  ```

## 10. Showcase (`apps/docs`)

El diseño visual sale de `docs/design/Mimi Sitio.dc.html`. Los botones del layout (header, panel móvil, copiar, inicio, 404 y páginas `/dev`) usan `mimiBtn` desde la tarea 2.1; las pestañas siguen hechas a mano hasta que exista Tabs.

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

- **Header:** fijo (`sticky`), 60px de alto, fondo `bg-background/78` con desenfoque de 14px y borde inferior. Contiene el botón de menú (solo bajo `lg`), el logo (enlace a `/`), la versión, el enlace a GitHub y el botón claro/oscuro. Sin nav superior, buscador ⌘K ni selector ES/EN: quedan en la Fase 5.
  - **Versión:** `SITE.version`, que lee `packages/cli/package.json` (única fuente de la versión de Mimi, tarea 3.8) con el alias `@mimi-ng/cli/package.json` de `tsconfig.base.json` (y `resolveJsonModule`). Tiene que ser un alias y no una importación de paquete: `ng serve` deja los paquetes de `node_modules` fuera del bundle y Vite los busca desde la raíz del workspace, donde `@mimi-ng/cli` no está instalado. La prueba `site.spec.ts` lo comprueba.
  - **GitHub:** `SITE.githubUrl` (`https://github.com/nuki23/mimi-ng`). Lucide ya no tiene logos de marcas, así que el ícono es el SVG oficial de GitHub (Octicon mark-github, MIT) en línea, con `fill="currentColor"` y `aria-hidden`; el enlace lleva `aria-label="Repositorio de Mimi en GitHub"`.
- **Grilla de la documentación:** `max-w-[1440px]`, `px-6`; columnas `240px | contenido | 200px`; separación de 28px (48px desde 1100px). Contenido con `max-w-[900px]`, 40px arriba y 120px abajo, y migas (sección › página) sacadas de `DOCS_NAV`.
- **Responsive:** desde `lg` (1024px) la sidebar es una columna fija; bajo `lg` se abre en el panel móvil. Desde `xl` (1280px) se muestra la TOC; bajo `xl` se oculta.

### Rutas

| Ruta                                       | Página                                                        |
| ------------------------------------------ | ------------------------------------------------------------- |
| `/`                                        | Landing (tarea 2.12)                                          |
| `/docs`                                    | Redirige a `/docs/introduction`                               |
| `/docs/introduction`, `/docs/installation` | Páginas de Primeros pasos, dentro del layout de documentación |
| `/docs/components/<nombre>`                | Páginas de componentes (Fase 2)                               |
| `/dev/tokens`, `/dev/theme`, `/dev/code`   | Páginas internas, sin sidebar y fuera del menú                |
| `**`                                       | 404                                                           |

Las rutas y los archivos están en inglés; los títulos visibles, en español. En la Fase 5 el idioma se separará con un prefijo en la ruta.

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

| Pieza                | Qué hace                                                                                                                                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CodePreview`        | Tarjeta con pestañas tipo segmento (Preview con ícono de ojo, Código con ícono de código) y un botón «Copiar». El lienzo tiene 260px de alto mínimo, borde punteado, `bg-background`, contenido centrado y tres puntos decorativos. El ejemplo va por `ng-content`; `code` es el texto de su archivo. `lang` vale `angular-ts` por defecto. |
| `CodeBlock`          | Bloque de código con botón copiar. Entradas: `code`, `lang`, `prompt` (`$` delante de un comando, que no se copia), `bordered`, `copyable` y `roomy` (la variante holgada del panel Código).                                                                                                                                                |
| `InstallCommand`     | Pestañas subrayadas `Angular CLI` (`ng g mimi <nombre>`) y `Forma larga` (`ng g @mimi-ng/cli:ui <nombre>`), cada una con un `CodeBlock`. La de pnpm (`pnpm mimi add`) vuelve con la tarea 5.3.                                                                                                                                              |
| `CopyButton`         | `navigator.clipboard.writeText` con try/catch. Muestra un check durante 2 s y anuncia «Copiado» en una región `aria-live`. Tiene una variante solo ícono (32px) y otra con texto.                                                                                                                                                           |
| `HighlighterService` | Shiki (ver abajo).                                                                                                                                                                                                                                                                                                                          |

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
- Shiki pone los colores en atributos `style`, que el sanitizador de Angular eliminaría. `DomSanitizer.bypassSecurityTrustHtml` se usa **solo** para su salida, en `HighlighterService`: el contenido es código fuente propio y estático, nunca texto del usuario.

**Pestañas.** Están hechas a mano hasta que exista el componente Tabs: `role="tablist"`, `tab` y `tabpanel`, `aria-selected`, `aria-controls` y `aria-labelledby`. Solo la pestaña activa recibe foco con Tab. Las flechas izquierda/derecha (circulares), Inicio y Fin cambian de pestaña y mueven el foco.

**Accesibilidad.** El `<pre>` tiene `tabindex="0"` y un `aria-label`, para recorrer el scroll horizontal con el teclado.

**Presupuesto del bundle inicial** (`angular.json`, configuración de producción): aviso a partir de 380 kB y error a partir de 420 kB (unos 15 y 55 kB por encima del tamaño actual). Después de la tarea 2.2 medía 353.3 kB (95 kB en transferencia); después de la 2.11, 364.7 kB (96.9 kB).

**Por qué subió el presupuesto (tarea 2.11, de 370/410 a 380/420 kB).** Entre las tareas 2.2 y 2.11 el bundle inicial creció 11.2 kB (medido con el `metafile` de esbuild, `ng build docs --stats-json`):

- **CSS: +7.5 kB** (42.8 → 50.3 kB). Las clases de los componentes nuevos (Card, Separator, Skeleton, Avatar, Switch, Checkbox, FormField) y de sus páginas. Es esperado: Tailwind escanea todo `ui-core` (`@source`) y las páginas, aunque estas sean diferidas, y todo el CSS va en `styles.css`.
- **JS: +3.7 kB** (310.6 → 314.4 kB), todo justificado:
  - Mensajes de error en español (`form-field/error-messages.ts`, 1.2 kB): el showcase registra `provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)` en `app.config.ts`. Se importa el archivo concreto, así `@angular/forms` no entra.
  - Rutas nuevas (`app.routes.ts`, 1.1 kB): una por página, todas diferidas.
  - APIs de `@angular/core` (unos 2 kB): `model`, `contentChild`, `booleanAttribute`, `numberAttribute`, `afterRenderEffect`, `untracked`… Las usan solo componentes diferidos, pero esbuild no parte un módulo de Angular entre chunks: van en el chunk de `@angular/core`, que es inicial. No se puede evitar desde el showcase.

Si el crecimiento es CSS de componentes o APIs de Angular, se sube el límite con el mismo margen; si aparece JS de una página o de una dependencia diferida, primero se investiga.

**Íconos del layout en línea:** los íconos del header y del panel móvil (menú, cerrar, sol, luna y GitHub) son SVG en línea con los trazos de Lucide, no `@lucide/angular`. Si el layout usara el paquete, esbuild pondría en el chunk compartido con el bundle inicial todos los íconos de las páginas diferidas (llegó a 60 kB). Las páginas y los ejemplos sí usan `@lucide/angular`. Si un cambio lo acerca al aviso, hay que averiguar por qué antes de subir el límite: así se detectó que `@angular/forms` entraba en el bundle inicial por el índice de utils.

**Bundle inicial** en la tarea 1.7 (producción): pasó de 313.5 kB (79.7 kB en transferencia) a 336.3 kB (84.3 kB). Shiki no está en el bundle inicial. La diferencia se reparte así:

- 14.8 kB de `@lucide/angular`: esbuild pone en un chunk compartido el código que usan a la vez el bundle inicial y los chunks diferidos, y ahí caen los íconos de copiar, check, código y ojo.
- 6.3 kB de `@angular/core`: partes del framework que usan los componentes nuevos, como `effect` y `viewChildren`.
- 1.4 kB de `platform-browser`.

### Despliegue

El showcase se publica en **https://ng.mimiworks.dev** con **Cloudflare Workers** (solo archivos estáticos, sin script). Se eligió Workers y no Pages porque Cloudflare recomienda Workers para proyectos nuevos; la configuración queda en el repositorio.

- **`wrangler.jsonc`** (raíz): sirve `dist/docs/browser` con `not_found_handling: "single-page-application"`. Sin `*.workers.dev` ni URLs de vista previa (`workers_dev: false`, `preview_urls: false`): solo el dominio propio.
- **Build (Workers Builds, desde GitHub):** `pnpm build:docs` (`ng build docs`, sin la CLI), que antes ejecuta `apps/docs/scripts/check-public.mjs`: falla si `apps/docs/public` tiene archivos que no sean `.svg`, `.png`, `.ico`, `.webp` o `_headers`. Todo lo que está en `public/` se publica tal cual, y como Cloudflare compila desde GitHub, esa verificación es la última barrera para que un documento que cayó ahí por error no llegue al sitio (la prueba `public-files.spec.ts` ejecuta el mismo script). Un tipo nuevo se agrega a propósito en el script. Despliegue: `npx wrangler@4 deploy`. Wrangler no es dependencia del repositorio; la versión mayor se fija en el comando y se revisa según la sección 12.
- **Versiones del build:** Node en `.node-version` (24.18.0, dentro del rango de Angular 22); pnpm con la variable `PNPM_VERSION` del panel, igual a `packageManager` (12.5.1).
- **Rutas:** una ruta sin archivo entrega `index.html` con estado 200 y la resuelve Angular. Recargar `/docs/components/button` funciona, y una ruta inexistente muestra la 404 del showcase, pero con estado **200** (soft 404). Por eso la 404 agrega `<meta name="robots" content="noindex">` mientras se muestra. El estado 404 real llega con el prerender (Fase 5).
- **Caché:** `apps/docs/public/_headers` (Angular lo copia a la salida) marca `main-*`, `chunk-*`, `polyfills-*` y `styles-*` como `public, max-age=31536000, immutable`: llevan hash (`outputHashing: all`). `index.html`, `favicon.ico` y `avatars/` quedan con la caché por defecto de Cloudflare (`max-age=0, must-revalidate` con ETag). Si se agrega un archivo sin hash con esos prefijos, hay que sacarlo de `_headers`.
- **Dominio:** Custom Domain del Worker (Cloudflare crea el registro DNS y el certificado); el subdominio no debe tener un CNAME previo.

### Pendiente

- **Páginas:** Personalización, Temas (personalizador en vivo y exportar `mimi.preset.ts`), Iconos, Migrar desde PrimeNG / NG-ZORRO y una página por componente. Select y Dialog aparecen como «Próximamente» hasta la Fase 4.
- **Página de componente:** título, descripción, `InstallCommand`, un `CodePreview` por estado (cada ejemplo en su archivo `examples/*.example.ts`), ejemplo con `class` y tabla de API.
- Prerender para generar páginas estáticas y responder 404 con estado real (Fase 5).

**Landing (`/`, tarea 2.12)** según `docs/design/Mimi Sitio.dc.html`: hero (badge con la versión, titular, subtítulo, `ng add @mimi-ng/cli` con `CodeBlock` y botones «Empezar» → `/docs/installation` y «Componentes» → `/docs/components/button`), cuatro diferenciales y la vitrina «Hecho con Mimi» (`pages/home/`: un formulario real con Reactive Forms y una lista de equipo). Reglas:

- **Honestidad:** lo que todavía no existe (`mimi update`, la guía de migración) lleva «Próximamente» y no enlaza. Ningún enlace lleva a una página deshabilitada o a un 404: una prueba compara los `href` con las rutas `ready` de `DOCS_NAV`. Los textos públicos no mencionan las fases del plan.
- **Bundle:** la ruta es lazy; los componentes de la vitrina y `@lucide/angular` no entran al bundle inicial (comprobado con el `metafile`).
- **Título y descripción:** la ruta tiene `title` y `index.html` trae el mismo `<title>` y un `<meta name="description">`: sin SSR, es lo que leen los buscadores y las vistas previas.
- **Tamaños que el diseño no define:** el titular baja de 60px a 40px bajo `md`, el padding del hero de 96/72 a 64/48px, y la vitrina se apila bajo `lg`.

## 11. Estilos visuales

- Mimi tiene un solo estilo: **Vivid**, que es el estilo por defecto. No hay estilo Default.
- **Vivid:** paleta neutra (primario casi negro en claro, casi blanco en oscuro), radio 12px, sombras en capas (solo la de destructive va teñida de su color), fuente Outfit y micro-animaciones (escala al hacer clic, transiciones suaves de color y sombra). Inspirado en Vuesax sin copiarlo.
- Los tokens están en `docs/design/tokens-vivid.css`. El primario se cambia con el preset (el personalizador del diseño trae violeta, esmeralda, azul y naranja).
- `mimi.json` guarda `"style": "vivid"`; el campo queda para poder sumar estilos más adelante.

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

Lo que la CLI copia al proyecto es código del usuario: se actualiza con `ng update` junto al resto de su proyecto y no depende de una versión de Mimi instalada. `@mimi-ng/cli` solo se necesita para agregar componentes o actualizarlos con `mimi update` (Fase 5).

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

Lo mismo para Tailwind CSS: probar la versión nueva en una rama, correr las pruebas, revisar el CSS generado (tokens, `@theme inline`, `@source`, variantes) y probar la CLI en un proyecto limpio.

### Herramientas fijadas por versión mayor

- **wrangler** (despliegue del showcase): el comando de despliegue de Workers Builds es `npx wrangler@4 deploy`. Cuando salga una versión mayor nueva (`npm view wrangler version`), revisar sus cambios que rompen en `wrangler.jsonc` (`assets`, `not_found_handling`, `workers_dev`, `preview_urls`) y en `_headers`, cambiar la mayor en el comando del panel de Cloudflare y en esta spec (secciones 2 y 10), y comprobar en el sitio que recargar una ruta, la 404 y los encabezados de caché sigan funcionando.
- **Node y pnpm del build:** `.node-version` y la variable `PNPM_VERSION` del panel se actualizan junto con la sección 2 (`packageManager` y el rango de Node que exige Angular).
