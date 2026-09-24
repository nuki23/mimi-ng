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
│   └── cli/src/
│       ├── collection.json
│       ├── registry.json
│       ├── ng-add/  init/  ui/  theme/
│       └── bin/mimi.js
├── docs/                      # spec.md, plan.md, design/
├── README.md
└── CLAUDE.md
```

Angular CLI se ejecuta siempre desde la raíz. `ui-core` no tiene build propio: su target `test` compila con la configuración de `docs:build:development`. Hay un solo lockfile. Las dependencias de ui-core (`clsx`, `tailwind-merge`, `class-variance-authority`) están en su `package.json` y también en el de la raíz, porque las pruebas las resuelven desde la raíz del workspace (igual que en un proyecto real, donde las instala la app).

Como Angular corre desde la raíz, el `styles.css` del showcase usa `@import 'tailwindcss' source(none)` y declara sus fuentes a mano (`apps/docs/src` y `packages/ui-core/src`, sin los `.spec.ts`); si no, Tailwind escanearía todo el repositorio (`docs/`, `CLAUDE.md`…) y generaría clases de más.

El showcase importa desde `ui-core` con alias de TypeScript, así lo que se ve en la documentación es exactamente lo que entrega la CLI. Al compilar la CLI, un script copia `ui-core/src/lib/**` a sus plantillas.

## 4. Catálogo

### Fase 2 del plan: componentes básicos (MVP)

| Componente | Selector                                                                                                             | Notas                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Button     | `button[mimiBtn]`, `a[mimiBtn]`                                                                                      | Variantes: default, secondary, destructive, outline, ghost, link. Tamaños: sm, default, lg, icon. Input `loading` con spinner |
| Input      | `input[mimiInput]`                                                                                                   | Error automático                                                                                                              |
| Textarea   | `textarea[mimiTextarea]`                                                                                             | Error automático                                                                                                              |
| Badge      | `span[mimiBadge]`                                                                                                    | default, secondary, outline, destructive                                                                                      |
| Card       | `mimi-card`, `mimi-card-header`, `mimi-card-title`, `mimi-card-description`, `mimi-card-content`, `mimi-card-footer` | Exporta `MimiCardImports`                                                                                                     |
| Separator  | `mimi-separator`                                                                                                     | `orientation`: horizontal / vertical                                                                                          |
| Skeleton   | `mimi-skeleton`                                                                                                      | `animate-pulse`                                                                                                               |
| Avatar     | `mimi-avatar`, `mimi-avatar-image`, `mimi-avatar-fallback`                                                           | Si la imagen falla, muestra el fallback                                                                                       |
| Switch     | `mimi-switch`                                                                                                        | `checked = model(false)`, `role="switch"`, ControlValueAccessor                                                               |
| Checkbox   | `mimi-checkbox`                                                                                                      | `role="checkbox"`, Espacio, estado indeterminado, ControlValueAccessor                                                        |
| FormField  | `mimi-form-field`, `mimi-form-error`                                                                                 | Etiqueta + control + mensaje                                                                                                  |

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

DropdownMenu, Tooltip, Tabs, Popover, Combobox múltiple, DatePicker, Toast, Table.

## 5. Uso para el desarrollador final

### Comandos

```bash
ng add @mimi-ng/cli                 # instala y ejecuta init

pnpm mimi add button                # uno
pnpm mimi add button input card     # varios
pnpm mimi add                       # menú para elegir
pnpm mimi list                      # disponibles e instalados
pnpm mimi theme                     # crea mimi.preset.ts
pnpm mimi update button             # actualiza respetando cambios (Fase 5)

# Equivalentes con Angular CLI
ng g @mimi-ng/cli:ui button
ng g ui button                      # tras init (schematicCollections)
ng g @mimi-ng/cli:theme --palette=violet --radius=lg
```

El comando `mimi` es una capa delgada que llama a los schematics. `ui` acepta varios nombres (`"$default": { "$source": "argv" }`) y muestra un `x-prompt` de selección múltiple si no recibe ninguno.

### Qué hace `init`

1. Verifica Tailwind 4.
2. Instala `clsx`, `tailwind-merge`, `class-variance-authority` como dependencias normales.
3. Agrega las variables base y `@theme inline` al `styles.css`. **No** agrega `@source`: en el proyecto del usuario los componentes se copian dentro de `src/` (por defecto `src/app/components/ui`), y la detección automática de Tailwind 4 ya escanea esa carpeta. El `@source` solo hace falta en el showcase de este monorepo, porque ahí los componentes viven fuera de la app, en `packages/ui-core/src`.
4. Crea `utils/cn.ts` y `utils/control-styles.ts`.
5. Agrega el alias `@/components/ui/*` al `tsconfig.json`.
6. Registra `@mimi-ng/cli` en `schematicCollections` de `angular.json`.
7. Crea `mimi.json`.
8. Pregunta: _"¿Quieres instalar @lucide/angular para tus íconos? (recomendado)"_.

### Qué hace `ui`

1. Copia los archivos del componente y los de sus `registryDependencies`.
2. Instala sus `dependencies` si faltan (por ejemplo `@angular/cdk` para Select).
3. Guarda una copia original en `.mimi/base/<componente>/` y registra la versión en `mimi.json`.
4. Si el componente ya existe, no lo sobrescribe sin `--overwrite`.

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

```json
{
  "components": {
    "button": {
      "dependencies": ["class-variance-authority", "clsx", "tailwind-merge"],
      "registryDependencies": ["utils"],
      "files": ["button.directive.ts", "index.ts"]
    },
    "form-field": {
      "dependencies": [],
      "registryDependencies": ["utils"],
      "files": ["form-field.component.ts", "form-error.component.ts", "index.ts"]
    }
  }
}
```

### Uso en código

```ts
import { MimiButtonDirective } from '@/components/ui/button';
import { MimiInputDirective } from '@/components/ui/input';
import { MimiCardImports } from '@/components/ui/card';
import { MimiFormFieldComponent, MimiFormErrorComponent } from '@/components/ui/form-field';
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
| Sombras ◐                 | `shadow-card`, `shadow-primary`, `shadow-primary-hover`, `shadow-destructive`, `shadow-destructive-hover`, `shadow-neutral`, `shadow-neutral-hover`                                                                                                                                                                                                                                                     |
| Fuentes                   | `font-sans` (`'Outfit', ui-sans-serif, system-ui, sans-serif`), `font-mono` (`'Geist Mono', ui-monospace, monospace`)                                                                                                                                                                                                                                                                                   |
| Forma                     | `radius` (0.75rem), `radius-sm` (`min(radius / 2, 6px)`), `radius-card` (`min(radius + 4px, 24px)`), `badge-radius` (999px)                                                                                                                                                                                                                                                                             |
| Alturas                   | `control-height` (2.5rem), `control-height-sm` (2rem), `control-height-lg` (3rem)                                                                                                                                                                                                                                                                                                                       |
| Movimiento                | `transition`, `press-scale`, `lift` (0px, sin uso por ahora). Ver 6.6                                                                                                                                                                                                                                                                                                                                   |

**`@theme inline`** (siempre `inline`: los valores son `var()` y deben resolverse donde se usan, o el modo oscuro falla):

| Tailwind                     | Origen                          | Clases                                                                                                                                              |
| ---------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-*`                  | cada color y derivado de arriba | `bg-*`, `text-*`, `border-*`, `ring-*`, `outline-*`, `fill-*`…                                                                                      |
| `--radius-sm`                | `--mimi-radius-sm`              | `rounded-sm`                                                                                                                                        |
| `--radius-md`                | `calc(radius - 2px)`            | `rounded-md`                                                                                                                                        |
| `--radius-lg`                | `--mimi-radius`                 | `rounded-lg`                                                                                                                                        |
| `--radius-xl`                | `calc(radius + 4px)`            | `rounded-xl`                                                                                                                                        |
| `--radius-card`              | `--mimi-radius-card`            | `rounded-card`                                                                                                                                      |
| `--radius-badge`             | `--mimi-badge-radius`           | `rounded-badge`                                                                                                                                     |
| `--shadow-*`                 | cada sombra                     | `shadow-card`, `shadow-primary`, `shadow-primary-hover`, `shadow-destructive`, `shadow-destructive-hover`, `shadow-neutral`, `shadow-neutral-hover` |
| `--font-sans`, `--font-mono` | fuentes                         | `font-sans` (también la fuente por defecto de la página), `font-mono`                                                                               |

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
export interface MimiButtonTokens extends MimiControlTokens {
  fontWeight?: string | number;
  letterSpacing?: string;
  transitionDuration?: string;
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
- **Movimiento reducido:** si el preset define `motion`, su `:root` le ganaría al `@media (prefers-reduced-motion)` de la base, así que el CSS generado agrega su propio bloque con `--mimi-press-scale: 1` y `--mimi-lift: 0`.
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

**`control-styles.ts`**: estilos compartidos de Button, Input y Textarea, tomados de la hoja de componentes. El padding no va aquí: lo pone cada componente (16px en botones, 12px en campos).

```ts
export const controlSizes = {
  sm: 'h-[var(--mimi-control-height-sm,2rem)] text-[13px]',
  default: 'h-[var(--mimi-control-height,2.5rem)] text-sm',
  lg: 'h-[var(--mimi-control-height-lg,3rem)] text-[15px]',
} as const;

export type ControlSize = keyof typeof controlSizes;

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

**Pruebas de ui-core:** corren con `ng test ui-core` (`pnpm test:ui-core`, incluido en `pnpm test`), con TestBed disponible.

### 6.6 Movimiento

Dos variables controlan las micro-animaciones del estilo Vivid:

| Variable             | Valor                                                                                                                         | Uso                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `--mimi-transition`  | `background-color .2s ease, border-color .2s ease, color .2s ease, box-shadow .25s ease, scale .15s cubic-bezier(.2,.8,.2,1)` | Lista completa de transiciones de los componentes interactivos. |
| `--mimi-press-scale` | `0.975`                                                                                                                       | Escala al hacer clic (`:active`).                               |

La transición anima la propiedad `scale`, no `transform`: en Tailwind 4, `scale-*` escribe `scale`. Así funciona `active:scale-(--mimi-press-scale)`. Si en el futuro se usa `--mimi-lift` (hoy `0px`) con `translate-y-*`, hay que agregar `translate` a `--mimi-transition` de la misma forma, y quitarlo en la versión de movimiento reducido.

Con `prefers-reduced-motion: reduce`, `--mimi-press-scale` pasa a `1` y `--mimi-transition` pierde `scale`:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --mimi-press-scale: 1;
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

- `mimiInput`, `mimiTextarea` (y `mimi-select`, `mimi-checkbox`, `mimi-switch`) inyectan `NgControl` de forma opcional. Si el control es inválido y fue tocado o modificado, agregan `aria-invalid="true"` y se ponen en rojo con los estilos de `controlInvalidStyles`.
- El estado se obtiene con `toSignal(control.events)` (los flags de Reactive Forms no son signals).
- `mimi-form-field` agrupa etiqueta, control y mensaje. `mimi-form-error` muestra el mensaje del primer error; si tiene contenido propio, usa ese.
- Mensajes personalizables:
  ```ts
  provideMimiErrorMessages({
    required: 'Este campo es obligatorio.',
    email: 'Correo inválido.',
    minlength: (e) => `Mínimo ${e.requiredLength} caracteres.`,
  });
  ```
- Pendiente: soporte de Signal Forms.

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 max-w-md">
  <mimi-form-field>
    <label>Correo</label>
    <input mimiInput type="email" formControlName="email" />
    <mimi-form-error />
  </mimi-form-field>
  <button mimiBtn type="submit">Guardar</button>
</form>
```

## 9. Íconos

- Los componentes traen sus íconos internos como SVG en línea con trazos de Lucide (licencia ISC, aviso en el repositorio). Fase 2: spinner, check, minus. Fase 4: chevron-down, x, search.
- Los íconos del usuario van por `ng-content` y se dimensionan solos: `[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:pointer-events-none`.
- Recomendado para el usuario y usado en el showcase: `@lucide/angular` (standalone, signals, un componente por ícono):
  ```html
  <button mimiBtn><svg lucideSave></svg> Guardar</button>
  ```

## 10. Showcase (`apps/docs`)

El diseño visual sale de `docs/design/Mimi Sitio.dc.html`. Los botones del layout son HTML con Tailwind hasta que exista `mimiBtn` (tarea 2.1).

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
  - **Versión:** `SITE.version`, que por ahora lee `packages/ui-core/package.json` con el alias `@mimi-ng/ui-core/package.json` de `tsconfig.base.json` (y `resolveJsonModule`). Tiene que ser un alias y no una importación de paquete: `ng serve` deja los paquetes de `node_modules` fuera del bundle y Vite los busca desde la raíz del workspace, donde `@mimi-ng/ui-core` no está instalado. En la Fase 3 se leerá de `@mimi-ng/cli`.
  - **GitHub:** `SITE.githubUrl` (`https://github.com/nuki23/mimi-ng`). Lucide ya no tiene logos de marcas, así que el ícono es el SVG oficial de GitHub (Octicon mark-github, MIT) en línea, con `fill="currentColor"` y `aria-hidden`; el enlace lleva `aria-label="Repositorio de Mimi en GitHub"`.
- **Grilla de la documentación:** `max-w-[1440px]`, `px-6`; columnas `240px | contenido | 200px`; separación de 28px (48px desde 1100px). Contenido con `max-w-[900px]`, 40px arriba y 120px abajo, y migas (sección › página) sacadas de `DOCS_NAV`.
- **Responsive:** desde `lg` (1024px) la sidebar es una columna fija; bajo `lg` se abre en el panel móvil. Desde `xl` (1280px) se muestra la TOC; bajo `xl` se oculta.

### Rutas

| Ruta                                       | Página                                                        |
| ------------------------------------------ | ------------------------------------------------------------- |
| `/`                                        | Placeholder de inicio (la landing es la tarea 2.12)           |
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
| `InstallCommand`     | Pestañas subrayadas `pnpm` (`pnpm mimi add <nombre>`) y `Angular CLI` (`ng g @mimi-ng/cli:ui <nombre>`), cada una con un `CodeBlock`.                                                                                                                                                                                                       |
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

**Resaltado con Shiki** (`shiki` 4.4.3, `@shikijs/langs` y `@shikijs/themes`):

- Se usa solo el núcleo (`shiki/core`) con el motor de expresiones regulares en JavaScript (`shiki/engine/javascript`, sin WebAssembly). Los lenguajes son `angular-html`, `angular-ts`, `html`, `typescript`, `css`, `bash` y `json`, y los temas `github-light` y `github-dark`.
- Se carga con `import()` dinámico la primera vez que se pide, y todas las llamadas comparten una sola instancia. No entra en el bundle inicial: cada lenguaje, tema, el núcleo y el motor quedan en chunks diferidos.
- Usa el modo dual (`defaultColor: false`): los colores quedan en `--shiki-light` y `--shiki-dark`, y `styles.css` elige según `.dark`. Cambiar de modo no vuelve a resaltar.
- Con `structure: 'inline'` Shiki devuelve solo los `<span>`: el `<pre>` es nuestro y usa `bg-muted`, como el diseño, en lugar del fondo del tema.
- Mientras Shiki carga, se muestra el código sin colores con la misma fuente e interlineado, así la página no salta.
- Shiki pone los colores en atributos `style`, que el sanitizador de Angular eliminaría. `DomSanitizer.bypassSecurityTrustHtml` se usa **solo** para su salida, en `HighlighterService`: el contenido es código fuente propio y estático, nunca texto del usuario.

**Pestañas.** Están hechas a mano hasta que exista el componente Tabs: `role="tablist"`, `tab` y `tabpanel`, `aria-selected`, `aria-controls` y `aria-labelledby`. Solo la pestaña activa recibe foco con Tab. Las flechas izquierda/derecha (circulares), Inicio y Fin cambian de pestaña y mueven el foco.

**Accesibilidad.** El `<pre>` tiene `tabindex="0"` y un `aria-label`, para recorrer el scroll horizontal con el teclado.

**Bundle inicial** (producción): pasó de 313.5 kB (79.7 kB en transferencia) a 336.3 kB (84.3 kB). Shiki no está en el bundle inicial. La diferencia se reparte así:

- 14.8 kB de `@lucide/angular`: esbuild pone en un chunk compartido el código que usan a la vez el bundle inicial y los chunks diferidos, y ahí caen los íconos de copiar, check, código y ojo.
- 6.3 kB de `@angular/core`: partes del framework que usan los componentes nuevos, como `effect` y `viewChildren`.
- 1.4 kB de `platform-browser`.

### Pendiente

- **Páginas:** Personalización, Temas (personalizador en vivo y exportar `mimi.preset.ts`), Iconos, Migrar desde PrimeNG / NG-ZORRO y una página por componente. Select y Dialog aparecen como «Próximamente» hasta la Fase 4.
- **Página de componente:** título, descripción, `InstallCommand`, un `CodePreview` por estado (cada ejemplo en su archivo `examples/*.example.ts`), ejemplo con `class` y tabla de API.
- Prerender para generar páginas estáticas (Fase 5).

## 11. Estilos visuales

- Mimi tiene un solo estilo: **Vivid**, que es el estilo por defecto. No hay estilo Default.
- **Vivid:** paleta neutra (primario casi negro en claro, casi blanco en oscuro), radio 12px, sombras en capas (solo la de destructive va teñida de su color), fuente Outfit y micro-animaciones (escala al hacer clic, transiciones suaves de color y sombra). Inspirado en Vuesax sin copiarlo.
- Los tokens están en `docs/design/tokens-vivid.css`. El primario se cambia con el preset (el personalizador del diseño trae violeta, esmeralda, azul y naranja).
- `mimi.json` guarda `"style": "vivid"`; el campo queda para poder sumar estilos más adelante.
