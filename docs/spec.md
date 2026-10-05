# Mimi (@mimi-ng): especificación

## 1. Qué es

Librería de componentes UI para **Angular 22** y **Tailwind CSS 4** que se distribuye como código fuente: una CLI copia cada componente al proyecto del usuario, que desde ese momento es dueño del código. Usa un solo prefijo (`mimi`) y un archivo de tema opcional tipado, al estilo de los presets de PrimeNG. El requisito principal es que sea **muy fácil de usar**.

### Diferenciales (frente a Spartan y shadcn)

1. **Actualizaciones que respetan tus cambios.** La CLI guarda la versión original de cada componente en `.mimi/base/` y `mimi update` combina la versión nueva con las personalizaciones del usuario, mostrando solo los conflictos. (Spartan obliga a actualizar a mano o sobrescribe.)
2. **Un solo modelo mental.** Sin capas Brain/Helm: un prefijo y todo el código en tu proyecto.
3. **Familiar para quien viene de PrimeNG o NG-ZORRO.** APIs como `showSearch` y `allowClear`, modales por servicio y presets tipados. Página de migración con equivalencias.
4. **Formularios listos.** Errores en rojo y mensajes automáticos.
5. **Un solo tema base, Mimi:** paleta neutra con radio amplio, sombras en capas y micro-animaciones (inspirado en Vuesax), que cada persona adapta (sección 11).
6. **Documentación en español e inglés.**

**Lema (fijo):** _"Los componentes son tuyos. Las actualizaciones también."_ Es el titular de la landing y no se cambia en rediseños.

### Reglas del código que se entrega

- **Solo APIs documentadas de Angular.** El código que la CLI copia queda en el proyecto de cada usuario: si dependiera de un detalle interno de Angular y ese detalle cambiara, tras un `ng update` el componente dejaría de funcionar sin ningún aviso, y la corrección de Mimi no le llegaría sola. Por eso no se usan símbolos `ɵ`, clases internas ni comportamientos no documentados, aunque ahorren código o peso. Ver el costo aceptado en la sección 8 (`field-state` y Signal Forms).

## 2. Stack

| Capa               | Tecnología                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework          | Angular 22 (standalone, OnPush, zoneless, signals)                                                                                            |
| Estilos            | Tailwind CSS 4 (configuración en CSS, sin `tailwind.config.js`)                                                                               |
| Colores            | OKLCH en variables CSS `--mimi-*`                                                                                                             |
| Clases             | `clsx` + `tailwind-merge` → `cn()`                                                                                                            |
| Variantes          | `class-variance-authority` (`cva`)                                                                                                            |
| Overlays (Grupo 1) | `@angular/aria` (listbox, combobox, menu, tabs, toolbar) y `@angular/cdk` (`overlay`, `dialog`, `a11y`, `drag-drop`); decisión 4.3, sección 4 |
| Íconos             | Lucide: SVG en línea dentro de los componentes; `@lucide/angular` en el showcase y como recomendación                                         |
| CLI                | Angular Schematics + comando `mimi`                                                                                                           |
| Monorepo           | pnpm workspaces                                                                                                                               |
| Formato            | Prettier en la raíz (`.prettierrc`, `.prettierignore`); `pnpm format` escribe y `pnpm format:check` solo revisa                               |
| Showcase           | Angular 22 puro (no AnalogJS), con prerender                                                                                                  |

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

### Componentes básicos (0.1.0)

| Componente | Selector                                                                                                             | Notas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button     | `button[mimiBtn]`, `a[mimiBtn]`                                                                                      | `variant`: solid, soft, outline, ghost, link; `tone`: primary, secondary, success, warning, info, danger (ver «Variante y tono»; atajos default, secondary y destructive hasta la 1.0). Tamaños: sm, default, lg, icon. Input `loading` con spinner                                                                                                                                                                                                                                                                                          |
| Input      | `input[mimiInput]`                                                                                                   | Error automático                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Textarea   | `textarea[mimiTextarea]`                                                                                             | Error automático                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Badge      | `span[mimiBadge]`                                                                                                    | `variant`: solid, soft, outline (con punto del color del tono); `tone` como Button (atajos default, secondary y destructive hasta la 1.0). Solo `<span>`, sin hover ni foco; íconos a 12px                                                                                                                                                                                                                                                                                                                                                   |
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

### Criterio del catálogo

Mimi solo agrega componentes **funcionales y difíciles de hacer bien a mano**: los que exigen teclado, accesibilidad, overlays o manejo de estados. Card y los demás componentes básicos de la 0.1.0 se mantienen, pero no se agregan más componentes de ese tipo (contenedores o estilos que el usuario resuelve con unas clases de Tailwind).

**No serán componentes de la CLI:** el editor de texto enriquecido, los gráficos y el calendario de eventos. Dependerían de librerías externas grandes; si se hacen, serán recetas en la documentación.

### Variante y tono

Dos ejes separados en todos los componentes con color:

- **Variante** (`variant`): cómo se ve. `solid`, `soft`, `outline`, `ghost`, `link`… (cada componente usa las que tengan sentido).
- **Tono** (`tone`): de qué color. `primary`, `secondary`, `success`, `warning`, `info` y `danger`. El tono `danger` usa los tokens `destructive` (sección 13).

**Sin `tone`, cada variante usa su tono natural:** `solid`, `soft` y `link` usan `primary`; `outline` y `ghost` usan `secondary` (neutros, como en la 0.1.0). `data-variant` y `data-tone` muestran los valores ya resueltos.

`destructive` deja de ser una variante. Para no romper la 0.1.0, los colores que eran variantes siguen funcionando como **atajos**, sin error ni aviso: `variant="default"` = solid + primary, `variant="secondary"` = solid + secondary y `variant="destructive"` = solid + danger (tarea V.1). Si además se pasa `tone`, **gana el atajo** y, en modo desarrollo, sale un `console.warn` una sola vez. En el tipo van marcados `@deprecated`; se quitan en la 1.0 (sección 12).

Regla para los componentes nuevos: variante y tono desde el principio, sin variantes de color. Los colores de cada combinación salen solo de los tokens del tono (`--mimi-<tono>`, `-foreground`, `-soft`, `-soft-foreground`, `-hover`, `-ring`, `-soft-hover`, `-border`, `-subtle`, `--mimi-shadow-<tono>` y `--mimi-glow-<tono>`). En el código, un mapa legible con una fila por tono y una entrada por variante (`TONE_CLASSES`), que `cva` convierte en `compoundVariants`.

**Button** (variantes `solid`, `soft`, `outline`, `ghost`, `link`) y **Badge** (`solid`, `soft`, `outline`; outline con tono lleva un punto decorativo del color del tono, un `::before` vacío; sin tono, neutro y sin punto) siguen el diseño `Mimi F2 Tokens y Tonos` en solid, soft y outline. El tono `secondary` y las celdas de ghost y link con tono son **provisionales, sin diseño** (sección 13). El glow no forma parte de la V.1: en el diseño es una opción aparte («Glow en todos»).

### Base técnica de los componentes: @angular/aria y @angular/cdk (decisión 4.3)

**Decisión (01/10/2026): una combinación.**

- **`@angular/aria`** para los patrones con semántica, foco y teclado: Listbox + Combobox (Select; después Combobox/Autocomplete y Command), Menu (Dropdown Menu y Context Menu), Tabs y Toolbar (mimi-toolbar). Accordion, Tree y Grid (Data Table) también existen en aria; se confirman en su tarea.
- **`@angular/cdk`** para lo que aria no trae:
  - el posicionamiento de todos los popups, con `@angular/cdk/overlay` (`cdkConnectedOverlay` con `usePopover: 'inline'`, igual que los ejemplos oficiales de aria);
  - Dialog, Confirm y Sheet, con `@angular/cdk/dialog`;
  - Popover y Tooltip: Overlay más su semántica propia (`aria-describedby`, `role="tooltip"`);
  - foco y anuncios, con `@angular/cdk/a11y`;
  - Sortable List, con `@angular/cdk/drag-drop`.
- **Formularios:** aria no trae integración con formularios (ni `ControlValueAccessor` ni `FormValueControl`). Los controles de Mimi implementan `FormValueControl` (sección 8) por fuera y conectan su `value` con el `value` del listbox de aria.
- **No se usan:**
  - `@angular/cdk/menu` ni `@angular/cdk/listbox`: son los patrones anteriores a aria, y `CdkListbox` implementa `ControlValueAccessor`, contra la sección 8;
  - los entry points `private` de aria o cdk, ni símbolos `ɵ` (sección 1, «Reglas del código que se entrega»). La prueba `imports.spec.ts` debe comprobarlo (tarea G1.1).

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
- **Revisión después de G1.5 (Select):** antes de usar aria en el resto del Grupo 1, se confirma que funcionó bien (teclado, lectores de pantalla, formularios y bundle). Si no convence, la alternativa es una capa propia de comportamiento, al estilo de las directivas Brain de Spartan, sin cambiar la API de Mimi.

**Costos y riesgos:**

- Dos dependencias más en el proyecto del usuario.
- aria exige **la misma versión exacta** de cdk. La CLI ya alinea toda peerDependency `@angular/*` al rango de `@angular/core` del proyecto (sección 5, «Qué hace `mimi`», punto 7). Como aria y cdk salen juntas, el gestor de paquetes resuelve las dos a la misma versión.
- aria figura como «New» en la documentación. Si cambia, se revisa con la rutina de la sección 12.

### Hoja de ruta

Cada grupo es una versión menor y va precedido por su tarea de diseño en Claude Design (`docs/plan.md`, D1–D5). Antes del Grupo 1: la tarea 4.3 (`@angular/aria` frente a `@angular/cdk`, que decide la base de overlays, listbox, menús, tabs y toolbar) y los tokens nuevos (T.1: `success`, `warning`, `info` con sus `-foreground` y sombras de color, y `--mimi-glow` con `color-mix`; valores de D1). El orden de cada tabla es el orden en que conviene hacerlos. Cada componente registra sus tokens (sección 13).

**Grupo 1 → v0.2.0: overlays y navegación**

| Orden | Componente    | Inspiración                             | Depende de                                   |
| ----- | ------------- | --------------------------------------- | -------------------------------------------- |
| 1     | Popover       | shadcn/Spartan                          | CDK Overlay (base de los demás overlays)     |
| 2     | Tooltip       | shadcn/Spartan                          | Popover (posicionamiento)                    |
| 3     | Dropdown Menu | shadcn/Spartan                          | Popover                                      |
| 4     | Context Menu  | shadcn/Spartan                          | Dropdown Menu                                |
| 5     | Select        | NG-ZORRO (API) y PrimeNG                | Popover, FormField                           |
| 6     | Dialog        | shadcn y Vuesax                         | `@angular/cdk/dialog`, Button                |
| 7     | Confirm       | PrimeNG ConfirmDialog y Vuesax          | Dialog, Button                               |
| 8     | Toast         | Sonner (shadcn) y Vuesax                | Tokens T.1, Button                           |
| 9     | Tabs          | HeroUI                                  | `@angular/aria/tabs`                         |
| 10    | mimi-toolbar  | Vuesax (VsCanvasToolbar)                | Tooltip, Separator, Badge (contadores)       |
| 11    | Pagination    | Diseño propio (píldora de mimi-toolbar) | Select, Input, Button, mimi-toolbar (estilo) |

- **Select** (`mimi-select`), estilo NG-ZORRO: buscador interno, limpiar, cargando, sin resultados, opciones deshabilitadas, check en la activa, teclado (flechas, Enter, Escape, Home/End). Implementa `FormValueControl` (sección 8), nunca `ControlValueAccessor`.
  ```ts
  export interface MimiOption<T = unknown> {
    label: string;
    value: T;
    disabled?: boolean;
  }
  ```
- **Dialog** (`MimiDialogService`): `dialog.open(MiComponente, { data, width, maxWidth, disableClose, injector })`. Sin header/body/footer obligatorios, **siempre** con una X arriba a la derecha. Cierra con X, Escape y clic en el fondo (salvo `disableClose`). Datos con `inject(MIMI_DIALOG_DATA)`.
- **Confirm:** `mimi.confirm()`, construido sobre Dialog. La API se define en su tarea (G1.7).
- **Toast:** estilo Sonner + Vuesax; usa los tokens semánticos y `--mimi-glow` (T.1). El detalle sale de D1.
- **Tabs:** indicador animado que se desliza a la pestaña activa, estilo HeroUI.
- **mimi-toolbar:** horizontal o vertical. Píldora translúcida, ítem activo sobre un disco, anillo animado en hover y selección, tooltips, flechas, separadores, contadores, estado presionado y herramientas propias del usuario. Patrón toolbar de WAI-ARIA (una sola parada de Tab, flechas entre ítems).
- **Pagination:** componente independiente, en píldora flotante compacta como mimi-toolbar: `[←] [input de página] / total [→] | registros por página`. Tamaño SM por defecto (hereda la altura global de control SM) y MD opcional. Variantes flotante y en línea. En móvil, sin el selector de registros. La usa Data Table.

**Grupo 2 → v0.3.0: entradas avanzadas**

| Orden | Componente                                 | Inspiración                                | Depende de                                     |
| ----- | ------------------------------------------ | ------------------------------------------ | ---------------------------------------------- |
| 1     | Toggle Group                               | shadcn/Spartan                             | —                                              |
| 2     | Number Input                               | PrimeNG (InputNumber) y HeroUI             | `utils/control-styles`, `FormValueControl`     |
| 3     | Password (mostrar/ocultar y medidor)       | PrimeNG (Password)                         | Input                                          |
| 4     | Input Mask                                 | PrimeNG (InputMask)                        | Input                                          |
| 5     | Input OTP                                  | shadcn                                     | `utils/control-styles`                         |
| 6     | Tags Input                                 | HeroUI y PrimeNG (Chips)                   | Badge, Input                                   |
| 7     | Slider (rango doble)                       | shadcn y HeroUI                            | Tooltip                                        |
| 8     | Combobox/Autocomplete (múltiple con chips) | shadcn (Combobox) y PrimeNG (AutoComplete) | Popover, lógica de lista de Select, Tags Input |
| 9     | Date Picker y Date Range                   | shadcn (Calendar) y PrimeNG                | Popover, Button                                |
| 10    | Progress (barra y circular)                | shadcn y HeroUI                            | —                                              |
| 11    | File Upload                                | PrimeNG (FileUpload) y Vuesax              | Button, Progress                               |
| 12    | Color Picker                               | PrimeNG (ColorPicker) y HeroUI             | Popover, Slider, Input                         |

**Grupo 3 → v0.4.0: datos**

| Orden | Componente                                                          | Inspiración                           | Depende de                                         |
| ----- | ------------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------- |
| 1     | Tree                                                                | PrimeNG (Tree)                        | Checkbox                                           |
| 2     | Sortable List                                                       | `@angular/cdk/drag-drop`              | `@angular/cdk/drag-drop`, manejo de teclado propio |
| 3     | Command (⌘K; también el buscador de la documentación, tarea 5.8)    | shadcn (Command)                      | Dialog, lógica de lista de Combobox                |
| 4     | Data Table (ordenar, filtrar, paginar, seleccionar, columnas fijas) | shadcn (Data Table) y PrimeNG (Table) | Checkbox, Dropdown Menu, Pagination, Input         |

**Grupo 4 → v0.5.0: estructura**

| Orden | Componente   | Inspiración                | Depende de                              |
| ----- | ------------ | -------------------------- | --------------------------------------- |
| 1     | Accordion    | shadcn/Spartan             | `@angular/aria/accordion` (a confirmar) |
| 2     | Sheet/Drawer | shadcn (Sheet y Drawer)    | Dialog                                  |
| 3     | Stepper      | PrimeNG (Stepper) y Vuesax | Button, Progress                        |

- **Sheet/Drawer:** flotante, como el de shadcn: separado de los bordes de la pantalla, con el radio de las tarjetas y, en la versión inferior, una barra de agarre.

**Grupo 5: según lo que pidan los usuarios** (prioridad decidida después de la 0.2.0; sin orden fijo)

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

### Theme Studio

Reemplaza a la página «Temas» (tarea 5.2). Va después del Grupo 2 y se construye **solo con componentes de Mimi** (mimi-toolbar, Toggle Group, Select, Color Picker, Switch, Input…); si necesita uno que no está en el plan, se agrega al plan. Diseño: `docs/design/Mimi Theme Studio.dc.html` (con las correcciones de la sección 13).

**Para qué sirve:** solo para **editar los componentes de Mimi tal como existen**. No hay presets guardados, ni «Mis variantes», ni tonos propios: Mimi tiene un solo tema base, «Mimi» de fábrica, que pasa a ser «Mi tema» cuando el usuario cambia algo (sección 11). Lo que el usuario cambia se exporta como `mimi.preset.ts` para `provideMimiTheme()`. Todo valor cambiado por el usuario se etiqueta **«Mío»**.

**El color y los tamaños son globales:** el color y los tamaños SM, MD y LG se editan solo en el modo Tema global. Los tamaños los comparten todos los controles (Button, Input, Select…).

**Modo Componente** (estructura de Vuesax):

- A la izquierda, la lista de componentes.
- Arriba, una barra flotante (mimi-toolbar) con: Volver, Móvil / Tablet / Escritorio, Claro / Oscuro, fondo del lienzo, «Uno | Ver todos», «Código» y «Copiar prompt».
- En el lienzo, un solo componente; «Ver todos» muestra la matriz tonos × variantes.
- Abajo, la tira de variantes del componente.
- A la derecha, el panel:
  - **Vista previa** (no se guarda): tono, estado, tamaño y texto.
  - **Estilo del componente** (se guarda): radio (Rounded, Squircle, Pill o un valor propio), borde y efectos (sombra, glow y escala al presionar).
  - Cada propiedad muestra su origen: heredado de qué token, o «Mío».
  - Pestaña **«Variables»**: todas las variables del componente con su cadena de herencia (sección 13).

**Modo Tema global:**

- **Simple:** color principal, radio, densidad y fuente.
- **Avanzado:** Marca, Estados, Superficies, Texto, Bordes, Forma, Profundidad, Movimiento y Tipografía.
- Los colores van en parejas con su texto (`-foreground`), con indicador de contraste AA, y la vista previa se actualiza en vivo.

**Radio «Squircle»:** verificar el soporte actual de `corner-shape` (token `--mimi-corner-shape`) y usarlo como mejora progresiva, con respaldo a `border-radius`.

### Blocks

Pantallas completas que la CLI copia como cualquier componente (`ng g mimi login-01`), con los componentes que usan. Diseñados (`docs/design/Block <nombre>.dc.html` y el índice `Mimi F6 Blocks.dc.html`): `login-01`, `login-02`, `signup-01`, `otp-01`, `settings-01`, `dashboard-01`, `table-01` y `pricing-01`. Después del Grupo 2; los que usan Data Table (`dashboard-01` y `table-01`) esperan al Grupo 3.

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

5. **`.mimi/base/`** (en la raíz del workspace, con la misma estructura: `.mimi/base/button/button.ts`, `.mimi/base/utils/cn.ts`): la copia original de cada archivo, que usará `mimi update` (tarea 5.4). Se escribe cuando el archivo del proyecto queda igual a la plantilla (creado, actualizado, reemplazado con `--overwrite`, o idéntico y todavía sin base). Si el archivo se omitió por estar modificado, su base **no** cambia. **`.mimi/manifest.json`** guarda con qué versión de Mimi se escribió cada base (`{ "files": { "button/button.ts": "0.1.0", … } }`); con eso se distingue un archivo formateado (misma versión) de uno que hay que actualizar (versión anterior).
6. **`mimi.json` → `components`:** `{ "button": { "version": "0.1.0" } }` para cada componente pedido o traído como dependencia, solo si todos sus archivos quedaron iguales a la plantilla; si alguno se omitió, se conserva lo que había.
7. **Dependencias:** las `dependencies` de los ítems, con la versión del registro, si el proyecto no las tiene. Las `peerDependencies` (como `@angular/forms`) solo si faltan; las de `@angular/*` con el mismo rango que el `@angular/core` del proyecto, para que no queden desalineadas. Se instalan con el gestor de paquetes del proyecto.
8. **Mensaje final:** qué se agregó o reemplazó, qué se omitió y por qué (con la sugerencia de `--overwrite`), qué dependencias se instalan, y que `.mimi/` debe quedar en git.

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
- **Desde el Grupo 1** (decisión 4.3): los ítems que usan aria declaran `@angular/aria` y `@angular/cdk` en `peerDependencies` (Select, Dropdown Menu, Context Menu, Tabs y mimi-toolbar); los que solo usan cdk declaran `@angular/cdk` (Popover, Tooltip, Dialog y Confirm). Por ser `@angular/*`, la CLI los instala con el rango de `@angular/core` del proyecto: no hace falta cambiar la CLI. ui-core los agrega a sus `peerDependencies` y el `package.json` raíz los instala para el showcase (tarea G1.1).
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

El tema vive en `packages/ui-core/src/lib/theme/theme-base.css` (valores de `docs/design/tokens-mimi.css`). Contiene, en este orden: `@custom-variant dark`, `:root` (claro), `.dark` (oscuro), el bloque `prefers-reduced-motion` (6.6), `@theme inline`, `@utility mimi-transition`, `@layer base` y los `@keyframes` `mimi-spin` y `mimi-pulse`. No importa Tailwind ni carga fuentes.

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

**Contraste de los hovers (V.1): «el hover se aleja del color del texto».** En modo claro, `success`, `info` y `destructive` llevan texto blanco: su `-hover` mezcla el tono al 88 % con `foreground` (oscurece), no con `background` como en el diseño, que no pasaba AA (≈3,8:1; con el cambio, ≈5,8:1). En modo oscuro y en `warning` (texto oscuro) el hover sigue yendo hacia el fondo. `primary` y `secondary` no cambian. El diseño (`F2 Tokens y Tonos`) debe actualizar esos hovers (plan, T.2a). `contrast.spec.ts` comprueba que cada texto pase 4,5:1 sobre su fondo, en reposo y en hover, en claro y oscuro.

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
  paddingX?: string;
  fontSize?: string;
  borderWidth?: string;
  focusRingWidth?: string;
}

/** paddingX y fontSize se aplican al tamaño default; sm y lg usan los valores del diseño. */
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
  // select y dialog se agregan con sus componentes (G1.5 y G1.6)
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
| `applyMimiTheme(document, preset)` | Crea o reutiliza `<style id="mimi-theme">`, reemplaza su contenido y lo mueve al final del `<head>`. Con un preset vacío o `null` lo elimina. La usará también Theme Studio.                     |
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

- Los componentes traen sus íconos internos como SVG en línea con trazos de Lucide (licencia ISC; avisos en `THIRD_PARTY_NOTICES.md`, junto con el Octicon de GitHub del header). Fase 2: spinner, check, minus. Grupo 1: chevron-down, x, search.
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

- **Header:** fijo (`sticky`), 60px de alto, fondo `bg-background/78` con desenfoque de 14px y borde inferior. Contiene el botón de menú (solo bajo `lg`), el logo (enlace a `/`), la versión, el enlace a GitHub y el botón claro/oscuro. Sin nav superior, buscador ⌘K ni selector ES/EN: quedan para las tareas 5.10, 5.8 y 5.9.
  - **Versión:** `SITE.version`, que lee `packages/cli/package.json` (única fuente de la versión de Mimi, tarea 3.8) con el alias `@mimi-ng/cli/package.json` de `tsconfig.base.json` (y `resolveJsonModule`). Tiene que ser un alias y no una importación de paquete: `ng serve` deja los paquetes de `node_modules` fuera del bundle y Vite los busca desde la raíz del workspace, donde `@mimi-ng/cli` no está instalado. La prueba `site.spec.ts` lo comprueba.
  - **GitHub:** `SITE.githubUrl` (`https://github.com/nuki23/mimi-ng`). Lucide ya no tiene logos de marcas, así que el ícono es el SVG oficial de GitHub (Octicon mark-github, MIT) en línea, con `fill="currentColor"` y `aria-hidden`; el enlace lleva `aria-label="Repositorio de Mimi en GitHub"`.
- **Grilla de la documentación:** `max-w-[1440px]`, `px-6`; columnas `240px | contenido | 200px`; separación de 28px (48px desde 1100px). Contenido con `max-w-[900px]`, 40px arriba y 120px abajo, y migas (sección › página) sacadas de `DOCS_NAV`.
- **Responsive:** desde `lg` (1024px) la sidebar es una columna fija; bajo `lg` se abre en el panel móvil. Desde `xl` (1280px) se muestra la TOC; bajo `xl` se oculta.

### Rutas

| Ruta                                       | Página                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                        | Landing (tarea 2.12)                                                                                                                                                                                                                                                                                                                                                                            |
| `/docs`                                    | Redirige a `/docs/introduction`                                                                                                                                                                                                                                                                                                                                                                 |
| `/docs/introduction`, `/docs/installation` | Páginas de Primeros pasos, dentro del layout de documentación                                                                                                                                                                                                                                                                                                                                   |
| `/docs/components/<nombre>`                | Páginas de componentes (Fase 2)                                                                                                                                                                                                                                                                                                                                                                 |
| `/dev/tokens`, `/dev/theme`, `/dev/code`   | Páginas internas, sin sidebar y fuera del menú. **Solo en desarrollo:** sus rutas están en `app/dev/dev.routes.ts`, que la configuración `production` reemplaza por una lista vacía (`fileReplacements` en `angular.json`), y el build de producción usa `styles.prod.css` (importa `styles.css` y agrega `@source not './app/dev'`), así que sus clases no llegan al CSS del sitio (tarea 4.4) |
| `**`                                       | 404                                                                                                                                                                                                                                                                                                                                                                                             |

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

**Presupuesto del bundle inicial** (`angular.json`, configuración de producción): aviso a partir de 400 kB y error a partir de 420 kB. Después de la tarea 2.2 medía 353.3 kB (95 kB en gzip); después de la 2.11, 364.7 kB (96.9 kB); después de la T.1, 388.31 kB (98.96 kB). Al informar el bundle se dan siempre el tamaño crudo y el gzip.

**Por qué subió el aviso (tarea T.1, de 380 a 400 kB; el error sigue en 420 kB).** La T.1 sumó unos 20 kB de CSS (52.14 → 72.51 kB; JS 315.60 → 315.80 kB): las variables nuevas del tema (tonos, sombras de color y glow, de tres capas con `color-mix`, en claro y oscuro) y los respaldos `@supports` que Tailwind (Lightning CSS) agrega a todo lo que usa `color-mix` (13.5 kB del archivo), más las muestras de `/dev/tokens` y `/dev/theme` (6.4 kB). En gzip fue solo +1.3 kB (97.65 → 98.96 kB). No se sube otra vez sin decidirlo: los componentes con `@angular/cdk` y `@angular/aria` llegan solo en rutas diferidas (tarea G1.1).

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
- **Rutas:** una ruta sin archivo entrega `index.html` con estado 200 y la resuelve Angular. Recargar `/docs/components/button` funciona, y una ruta inexistente muestra la 404 del showcase, pero con estado **200** (soft 404). Por eso la 404 agrega `<meta name="robots" content="noindex">` mientras se muestra. El estado 404 real llega con el prerender (tarea 5.14).
- **Caché:** `apps/docs/public/_headers` (Angular lo copia a la salida) marca `main-*`, `chunk-*`, `polyfills-*` y `styles-*` como `public, max-age=31536000, immutable`: llevan hash (`outputHashing: all`). `index.html`, `favicon.ico` y `avatars/` quedan con la caché por defecto de Cloudflare (`max-age=0, must-revalidate` con ETag). Si se agrega un archivo sin hash con esos prefijos, hay que sacarlo de `_headers`.
- **Dominio:** Custom Domain del Worker (Cloudflare crea el registro DNS y el certificado); el subdominio no debe tener un CNAME previo.

### Pendiente

- **Páginas:** Personalización, Theme Studio (sección 4), Iconos, Migrar desde PrimeNG / NG-ZORRO y una página por componente. Select y Dialog aparecen como «Próximamente» hasta la 0.2.0 (Grupo 1).
- **Página de componente:** título, descripción, `InstallCommand`, un `CodePreview` por estado (cada ejemplo en su archivo `examples/*.example.ts`), ejemplo con `class` y tabla de API.
- Prerender para generar páginas estáticas y responder 404 con estado real (tarea 5.14).

**Landing (`/`, tarea 2.12)** según `docs/design/Mimi Sitio.dc.html`: hero (badge con la versión, «v0.1.0 · Vista previa» mientras sea 0.x, titular, subtítulo, `ng add @mimi-ng/cli` con `CodeBlock` y botones «Empezar» → `/docs/installation` y «Componentes» → `/docs/components/button`), cuatro diferenciales y la vitrina «Hecho con Mimi» (`pages/home/`: un formulario real con Reactive Forms y una lista de equipo). Reglas:

- **Honestidad:** lo que todavía no existe (`mimi update`, la guía de migración) lleva «Próximamente» y no enlaza. Ningún enlace lleva a una página deshabilitada o a un 404: una prueba compara los `href` con las rutas `ready` de `DOCS_NAV`. Los textos públicos no mencionan las fases del plan.
- **Bundle:** la ruta es lazy; los componentes de la vitrina y `@lucide/angular` no entran al bundle inicial (comprobado con el `metafile`).
- **Título y descripción:** la ruta tiene `title` y `index.html` trae el mismo `<title>` y un `<meta name="description">`: sin SSR, es lo que leen los buscadores y las vistas previas.
- **Tamaños que el diseño no define:** el titular baja de 60px a 40px bajo `md`, el padding del hero de 96/72 a 64/48px, y la vitrina se apila bajo `lg`.

## 11. Tema

- Mimi tiene **un solo tema base: Mimi**. Cada persona lo adapta: de fábrica se llama «Mimi»; cuando el usuario cambia algo (con el preset o en Theme Studio), es «Mi tema». No hay temas ni estilos alternativos.
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

Con cada versión nueva de Angular, leer también las notas de `@angular/aria` (es reciente y la usan Select, los menús, Tabs y mimi-toolbar) y de `@angular/cdk`, y correr las pruebas de esos componentes.

Lo mismo para Tailwind CSS: probar la versión nueva en una rama, correr las pruebas, revisar el CSS generado (tokens, `@theme inline`, `@source`, variantes) y probar la CLI en un proyecto limpio.

### Herramientas fijadas por versión mayor

- **wrangler** (despliegue del showcase): el comando de despliegue de Workers Builds es `npx wrangler@4 deploy`. Cuando salga una versión mayor nueva (`npm view wrangler version`), revisar sus cambios que rompen en `wrangler.jsonc` (`assets`, `not_found_handling`, `workers_dev`, `preview_urls`) y en `_headers`, cambiar la mayor en el comando del panel de Cloudflare y en esta spec (secciones 2 y 10), y comprobar en el sitio que recargar una ruta, la 404 y los encabezados de caché sigan funcionando.
- **Node y pnpm del build:** `.node-version` y la variable `PNPM_VERSION` del panel se actualizan junto con la sección 2 (`packageManager` y el rango de Node que exige Angular).

## 13. Tokens

Catálogo de los tokens del tema Mimi en tres niveles (tarea T.0). Va al final para no renumerar las secciones que citan el código y los documentos; amplía las secciones 6.1 a 6.3.

**Fuentes** (en `docs/design/`): `mimi-tokens-data.js`, la hoja de tokens en datos (se ve en `Mimi Tokens.dc.html`); `tokens-mimi.css`, con los globales y los compartidos en claro y oscuro; y `mimi-variables-componentes.css`, con los tokens por componente. Ningún valor de esta sección se inventa: lo que la hoja no defina, se pregunta.

**Cobertura:** la hoja cubre 21 componentes: los 11 de la 0.1.0 y los del Grupo 1. Los Grupos 2 a 5 agregan sus tokens (y su tabla aquí) con cada tanda de diseño, antes de construirlos.

### Niveles

1. **Globales:** colores, derivados, forma, profundidad, movimiento y tipografía de todo Mimi. En el preset, `colors`, `radii`, `shadows`, `fonts` y `motion`.
2. **Compartidos:** los que comparte una familia de componentes para quedar alineados (alturas de control, foco, deshabilitado, íconos). En el preset, `controls`.
3. **Por componente:** `--mimi-<prefijo>-<propiedad>` (`--mimi-btn-px`). Heredan de un compartido o de un global con la cascada de la sección 6.2 y se configuran con `components.<nombre>` del preset.

### Nivel 1: globales

#### Colores

Cada color de superficie o de acción tiene su pareja de texto (`-foreground`). El Theme Studio los muestra juntos con el indicador de contraste AA.

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

Una tabla por componente (21: los de la 0.1.0 y los del Grupo 1). «Hereda de» indica el token del que toma su valor; si está vacío, el valor por defecto es propio. Los valores en px se pasan a rem al llevarlos a ui-core (16px = 1rem), como en `tokens-mimi.css`. Los Grupos 2 a 5 agregan sus tablas con cada tanda de diseño.

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

#### Confirm (`confirm`)

| Variable                   | Qué controla    | Hereda de                            | Valor por defecto |
| -------------------------- | --------------- | ------------------------------------ | ----------------- |
| `--mimi-confirm-width`     | Ancho           | —                                    | `380px`           |
| `--mimi-confirm-icon-bg`   | Fondo del ícono | `--mimi-destructive-soft-bg`         | —                 |
| `--mimi-confirm-icon-fg`   | Ícono           | `--mimi-destructive-soft-foreground` | —                 |
| `--mimi-confirm-action-bg` | Botón de acción | `--mimi-destructive`                 | —                 |

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

#### Tooltip (`tooltip`)

| Variable                   | Qué controla    | Hereda de                   | Valor por defecto |
| -------------------------- | --------------- | --------------------------- | ----------------- |
| `--mimi-tooltip-bg`        | Fondo           | `--mimi-tooltip`            | —                 |
| `--mimi-tooltip-fg`        | Texto           | `--mimi-tooltip-foreground` | —                 |
| `--mimi-tooltip-radius`    | Radio           | —                           | `8px`             |
| `--mimi-tooltip-font-size` | Tamaño de texto | —                           | `12.5px`          |
| `--mimi-tooltip-arrow`     | Flecha          | —                           | `8px`             |
| `--mimi-tooltip-delay`     | Retraso         | —                           | `300ms`           |

#### Popover (`popover`)

| Variable                 | Qué controla | Hereda de               | Valor por defecto |
| ------------------------ | ------------ | ----------------------- | ----------------- |
| `--mimi-popover-bg`      | Fondo        | `--mimi-popover`        | —                 |
| `--mimi-popover-border`  | Borde        | `--mimi-border`         | —                 |
| `--mimi-popover-radius`  | Radio        | `--mimi-radius`         | —                 |
| `--mimi-popover-shadow`  | Sombra       | `--mimi-shadow-popover` | —                 |
| `--mimi-popover-padding` | Relleno      | —                       | `16px`            |
| `--mimi-popover-arrow`   | Flecha       | —                       | `10px`            |

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

#### Pagination (`pagination`)

| Variable                        | Qué controla        | Hereda de               | Valor por defecto |
| ------------------------------- | ------------------- | ----------------------- | ----------------- |
| `--mimi-pagination-bg`          | Fondo translúcido   | `--mimi-glass`          | —                 |
| `--mimi-pagination-border`      | Borde               | `--mimi-glass-border`   | —                 |
| `--mimi-pagination-blur`        | Desenfoque          | `--mimi-glass-blur`     | —                 |
| `--mimi-pagination-shadow`      | Sombra flotante     | `--mimi-shadow-popover` | —                 |
| `--mimi-pagination-item-size`   | Tamaño de botón     | —                       | `40px`            |
| `--mimi-pagination-input-width` | Ancho del campo     | —                       | `56px`            |
| `--mimi-pagination-error`       | Error de página     | `--mimi-destructive`    | —                 |
| `--mimi-pagination-offset`      | Separación inferior | —                       | `20px`            |

**En ui-core desde la T.1:** los tonos con sus derivados, sombras y glow, `destructive-ring`, `destructive-soft-bg` y `destructive-soft-foreground`, `tooltip`, `glass`, `overlay-blur`, `glass-blur`, `soft-mix`, `shadow-popover` y los compartidos (foco, deshabilitado, íconos); `overlay` y `popover` en oscuro con los valores del diseño. Lo demás de `tokens-mimi.css` (rango, pista, chips, zona de arrastre, fuerza, selección, `corner-shape`, `input-hover` y los keyframes de la Fase 3 y de Effects) entra con su componente.

**Hovers corregidos por contraste (V.1):** en claro, `--mimi-success-hover`, `--mimi-info-hover` y `--mimi-destructive-hover` mezclan el tono al 88 % con `foreground` (el diseño los mezcla con `background` y no pasaban AA). Corrección de Mimi pendiente de pasar al diseño (plan, T.2a); también en `tokens-mimi.css`. La prueba `contrast.spec.ts` (ui-core) lee `theme-base.css` y falla si un texto queda por debajo de 4,5:1 sobre su fondo, en reposo o en hover, en claro u oscuro.

**Variantes con tono (V.1):** `--mimi-<tono>-soft-hover`, `--mimi-<tono>-border` y `--mimi-<tono>-subtle` para `primary`, `success`, `warning`, `info` y `destructive` son derivados con las fórmulas en línea del diseño `F2 Tokens y Tonos` (`color-mix` del tono al 22 % sobre el fondo, al 55 % y al 10 % sobre transparente). Están en `theme-base.css` y en `tokens-mimi.css`, no en el preset: se recalculan solos.

**Provisional, sin diseño (V.1):** en Button, el tono `secondary` en todas sus variantes (solid = el secondary de la 0.1.0; soft = `muted` con hover `accent`; outline y ghost = los de la 0.1.0; link = `foreground`) y ghost y link con tono (ghost: texto `<tono>-soft-foreground`, hover `<tono>-soft`; link: texto `<tono>-soft-foreground`); en Badge, `secondary` soft (`muted`). Se diseñan en Claude Design antes de Theme Studio (plan, T.2a).

### Otros globales del diseño

Están en `tokens-mimi.css` (valores en claro y oscuro) y no tienen fila propia en la hoja:

- **Texto sobre fondos suaves:** `--mimi-success-soft-foreground`, `--mimi-warning-soft-foreground`, `--mimi-info-soft-foreground` y `--mimi-destructive-soft-foreground`.
- **Superficies:** `--mimi-tooltip` y `--mimi-tooltip-foreground`; `--mimi-overlay` y `--mimi-overlay-blur` (fondo de Dialog y Sheet); `--mimi-glass`, `--mimi-glass-border` y `--mimi-glass-blur` (píldoras translúcidas de mimi-toolbar y Pagination); `--mimi-soft-mix` (cuánto tono lleva el fondo suave: 12 % en claro, 18 % en oscuro).
- **Campos:** `--mimi-input-background`, `--mimi-input-hover`, `--mimi-ring-soft` y `--mimi-switch-off`.
- **Entradas avanzadas:** `--mimi-range`, `--mimi-track`, `--mimi-track-fill`, `--mimi-thumb`, `--mimi-chip`, `--mimi-chip-foreground`, `--mimi-dropzone`, `--mimi-dropzone-active`, `--mimi-dropzone-active-border`, `--mimi-strength-weak`, `--mimi-strength-medium`, `--mimi-strength-strong`, `--mimi-selection` y `--mimi-corner-shape` (Squircle).
- **Keyframes:** `mimi-spin`, `mimi-pulse`, `mimi-caret`, `mimi-bob`, `mimi-shake` y los de Mimi Effects (`mimi-beam`, `mimi-marquee`, `mimi-typing-*`, `mimi-blurfade-*`, `mimi-reveal`).

### Reglas

- **Obligatorio en cada componente nuevo:** registrar sus tokens en `MimiComponentTokens` (`theme/types.ts`) y su prefijo en `COMPONENT_PREFIX` (`theme/provider.ts`), con prueba en `provider.spec.ts`, y tener su tabla en esta sección. Es un paso del comando `/componente`.
- **Prefijos:** los de la hoja son `btn`, `input`, `textarea`, `badge`, `card`, `avatar`, `switch`, `checkbox`, `field` (FormField), `separator`, `skeleton`, `select`, `dialog`, `confirm`, `toast`, `tooltip`, `popover`, `menu` (Dropdown y Context Menu comparten), `tabs`, `toolbar` y `pagination`. En el código de la 0.1.0 solo están registrados `btn`, `input` y `card`.
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
- `Mimi Sitio.dc.html` y `Mimi Theme Studio.dc.html`: `import { definePreset } from '@mimi-ng/theme'` no existe → `provideMimiTheme(preset)` con un `MimiThemePreset` (`colors` y `darkColors`, sección 6.3).
- `Mimi Sitio.dc.html`: `import { MimiInput } from '@/app/components/ui/input/input'` → `@/components/ui/input`.
- `Mimi Theme Studio.dc.html`: tiene «Mis variantes» y no tiene «Copiar prompt». Theme Studio no tiene variantes propias y su barra lleva «Copiar prompt» (sección 4, «Theme Studio»).
- `mimi-variables-componentes.css`: `--mimi-badge-radius: var(--mimi-badge-radius)` (referencia a sí misma). **Corregido** en `docs/design/` con `999px`.
