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

Frase principal: *"Los componentes son tuyos. Las actualizaciones también."*

## 2. Stack

| Capa | Tecnología |
|---|---|
| Framework | Angular 22 (standalone, OnPush, zoneless, signals) |
| Estilos | Tailwind CSS 4 (configuración en CSS, sin `tailwind.config.js`) |
| Colores | OKLCH en variables CSS `--mimi-*` |
| Clases | `clsx` + `tailwind-merge` → `cn()` |
| Variantes | `class-variance-authority` (`cva`) |
| Overlays (Fase 4) | `@angular/cdk` (`overlay`, `dialog`, `a11y`) |
| Íconos | Lucide: SVG en línea dentro de los componentes; `@lucide/angular` en el showcase y como recomendación |
| CLI | Angular Schematics + comando `mimi` |
| Monorepo | pnpm workspaces |
| Showcase | Angular 22 puro (no AnalogJS), con prerender |

## 3. Estructura del monorepo

```
mimi-ng/
├── apps/docs/                 # Showcase = documentación + entorno de pruebas
├── packages/
│   ├── ui-core/src/lib/
│   │   ├── theme/             # theme-base.css, types.ts, provider.ts
│   │   ├── utils/             # cn.ts, control-styles.ts
│   │   └── components/        # button/, input/, card/…
│   └── cli/src/
│       ├── collection.json
│       ├── registry.json
│       ├── ng-add/  init/  ui/  theme/
│       └── bin/mimi.js
├── docs/                      # spec.md, plan.md, design/
├── CLAUDE.md
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

El showcase importa desde `ui-core` con alias de TypeScript, así lo que se ve en la documentación es exactamente lo que entrega la CLI. Al compilar la CLI, un script copia `ui-core/src/lib/**` a sus plantillas.

## 4. Catálogo

### Fase 2 del plan: componentes básicos (MVP)

| Componente | Selector | Notas |
|---|---|---|
| Button | `button[mimiBtn]`, `a[mimiBtn]` | Variantes: default, secondary, destructive, outline, ghost, link. Tamaños: sm, default, lg, icon. Input `loading` con spinner |
| Input | `input[mimiInput]` | Error automático |
| Textarea | `textarea[mimiTextarea]` | Error automático |
| Badge | `span[mimiBadge]` | default, secondary, outline, destructive |
| Card | `mimi-card`, `mimi-card-header`, `mimi-card-title`, `mimi-card-description`, `mimi-card-content`, `mimi-card-footer` | Exporta `MimiCardImports` |
| Separator | `mimi-separator` | `orientation`: horizontal / vertical |
| Skeleton | `mimi-skeleton` | `animate-pulse` |
| Avatar | `mimi-avatar`, `mimi-avatar-image`, `mimi-avatar-fallback` | Si la imagen falla, muestra el fallback |
| Switch | `mimi-switch` | `checked = model(false)`, `role="switch"`, ControlValueAccessor |
| Checkbox | `mimi-checkbox` | `role="checkbox"`, Espacio, estado indeterminado, ControlValueAccessor |
| FormField | `mimi-form-field`, `mimi-form-error` | Etiqueta + control + mensaje |

### Fase 4 del plan: overlays

- **Select** (`mimi-select`), estilo NG-ZORRO: buscador interno, limpiar, cargando, sin resultados, opciones deshabilitadas, check en la activa, teclado (flechas, Enter, Escape, Home/End), ControlValueAccessor.
  ```ts
  export interface MimiOption<T = unknown> { label: string; value: T; disabled?: boolean; }
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
3. Agrega las variables base, `@theme inline` y `@source` al `styles.css`.
4. Crea `utils/cn.ts` y `utils/control-styles.ts`.
5. Agrega el alias `@/components/ui/*` al `tsconfig.json`.
6. Registra `@mimi-ng/cli` en `schematicCollections` de `angular.json`.
7. Crea `mimi.json`.
8. Pregunta: *"¿Quieres instalar @lucide/angular para tus íconos? (recomendado)"*.

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

Los valores definitivos saldrán de `docs/design/`. Mientras tanto, esta es la base neutra:

```css
@import "tailwindcss";
@source "../../../packages/ui-core/src";          /* ruta relativa al styles.css del showcase */
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --mimi-background: oklch(1 0 0);
  --mimi-foreground: oklch(0.145 0 0);
  --mimi-card: oklch(1 0 0);
  --mimi-card-foreground: oklch(0.145 0 0);
  --mimi-popover: oklch(1 0 0);
  --mimi-popover-foreground: oklch(0.145 0 0);
  --mimi-primary: oklch(0.205 0 0);
  --mimi-primary-foreground: oklch(0.985 0 0);
  --mimi-secondary: oklch(0.97 0 0);
  --mimi-secondary-foreground: oklch(0.205 0 0);
  --mimi-muted: oklch(0.97 0 0);
  --mimi-muted-foreground: oklch(0.556 0 0);
  --mimi-accent: oklch(0.97 0 0);
  --mimi-accent-foreground: oklch(0.205 0 0);
  --mimi-destructive: oklch(0.577 0.245 27.325);
  --mimi-destructive-foreground: oklch(0.985 0 0);
  --mimi-border: oklch(0.922 0 0);
  --mimi-input: oklch(0.922 0 0);
  --mimi-ring: oklch(0.708 0 0);
  --mimi-radius: 0.5rem;
  --mimi-control-height: 2.5rem;
  --mimi-control-height-sm: 2rem;
  --mimi-control-height-lg: 2.75rem;
}

.dark {
  --mimi-background: oklch(0.145 0 0);
  --mimi-foreground: oklch(0.985 0 0);
  --mimi-card: oklch(0.205 0 0);
  --mimi-card-foreground: oklch(0.985 0 0);
  --mimi-popover: oklch(0.205 0 0);
  --mimi-popover-foreground: oklch(0.985 0 0);
  --mimi-primary: oklch(0.922 0 0);
  --mimi-primary-foreground: oklch(0.205 0 0);
  --mimi-secondary: oklch(0.269 0 0);
  --mimi-secondary-foreground: oklch(0.985 0 0);
  --mimi-muted: oklch(0.269 0 0);
  --mimi-muted-foreground: oklch(0.708 0 0);
  --mimi-accent: oklch(0.269 0 0);
  --mimi-accent-foreground: oklch(0.985 0 0);
  --mimi-destructive: oklch(0.704 0.191 22.216);
  --mimi-destructive-foreground: oklch(0.985 0 0);
  --mimi-border: oklch(1 0 0 / 10%);
  --mimi-input: oklch(1 0 0 / 15%);
  --mimi-ring: oklch(0.556 0 0);
}

@theme inline {
  --color-background: var(--mimi-background);
  --color-foreground: var(--mimi-foreground);
  --color-card: var(--mimi-card);
  --color-card-foreground: var(--mimi-card-foreground);
  --color-popover: var(--mimi-popover);
  --color-popover-foreground: var(--mimi-popover-foreground);
  --color-primary: var(--mimi-primary);
  --color-primary-foreground: var(--mimi-primary-foreground);
  --color-secondary: var(--mimi-secondary);
  --color-secondary-foreground: var(--mimi-secondary-foreground);
  --color-muted: var(--mimi-muted);
  --color-muted-foreground: var(--mimi-muted-foreground);
  --color-accent: var(--mimi-accent);
  --color-accent-foreground: var(--mimi-accent-foreground);
  --color-destructive: var(--mimi-destructive);
  --color-destructive-foreground: var(--mimi-destructive-foreground);
  --color-border: var(--mimi-border);
  --color-input: var(--mimi-input);
  --color-ring: var(--mimi-ring);
  --radius-sm: calc(var(--mimi-radius) - 4px);
  --radius-md: calc(var(--mimi-radius) - 2px);
  --radius-lg: var(--mimi-radius);
  --radius-xl: calc(var(--mimi-radius) + 4px);
}
```

Así funcionan clases como `bg-primary`, `text-muted-foreground`, `border-border`, `rounded-lg`.

### 6.2 Cascada de tokens

Cada propiedad busca primero la variable del componente, luego la compartida y por último un valor fijo:

```css
height: var(--mimi-btn-height, var(--mimi-control-height, 2.5rem));
border-radius: var(--mimi-btn-radius, var(--mimi-radius, 0.5rem));
```

| Si defines… | Afecta a… |
|---|---|
| `--mimi-control-height` | Button, Input, Textarea (y Select en Fase 4) |
| `--mimi-btn-height` | Solo Button |
| nada | Todos usan 2.5rem |

### 6.3 Preset tipado (`theme/types.ts`)

```ts
export interface MimiColorTokens {
  background?: string; foreground?: string;
  card?: string; cardForeground?: string;
  popover?: string; popoverForeground?: string;
  primary?: string; primaryForeground?: string;
  secondary?: string; secondaryForeground?: string;
  muted?: string; mutedForeground?: string;
  accent?: string; accentForeground?: string;
  destructive?: string; destructiveForeground?: string;
  border?: string; input?: string; ring?: string;
}

export interface MimiSharedControlTokens {
  height?: string; heightSm?: string; heightLg?: string;
  radius?: string; paddingX?: string; fontSize?: string;
  borderWidth?: string; focusRingWidth?: string;
}

export interface MimiButtonTokens extends MimiSharedControlTokens {
  fontWeight?: string | number; letterSpacing?: string; transitionDuration?: string;
}
export interface MimiInputTokens extends MimiSharedControlTokens {
  placeholderColor?: string; disabledOpacity?: string | number;
}
export interface MimiCardTokens {
  radius?: string; borderWidth?: string; shadow?: string;
  paddingHeader?: string; paddingContent?: string; paddingFooter?: string;
}

export interface MimiComponentTokens {
  button?: MimiButtonTokens;
  input?: MimiInputTokens;
  card?: MimiCardTokens;
  // select y dialog se agregan en la Fase 4
}

export interface MimiThemePreset {
  name?: string;
  radius?: string;
  colors?: MimiColorTokens;       // modo claro
  darkColors?: MimiColorTokens;   // modo oscuro
  controls?: MimiSharedControlTokens;
  components?: MimiComponentTokens;
}
```

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
providers: [provideMimiTheme(mimiTheme)]   // opcional
```

### 6.4 `provideMimiTheme()`

Debe generar una hoja de estilos e insertarla en el `<head>` con `:root { … }` y `.dark { … }`. **No** usar `document.documentElement.style.setProperty`: los estilos en línea le ganan a `.dark` y rompen el modo oscuro. Un mapa de nombres convierte el preset en variables (`primary` → `--mimi-primary`, `controls.height` → `--mimi-control-height`, `components.button.fontWeight` → `--mimi-btn-font-weight`). Debe funcionar con SSR/prerender (usar `inject(DOCUMENT)`).

### 6.5 Utilidades (`utils/control-styles.ts`)

```ts
export const controlSizes = {
  sm:      'h-[var(--mimi-control-height-sm,2rem)] px-2.5 text-xs',
  default: 'h-[var(--mimi-control-height,2.5rem)] px-3 py-2 text-sm',
  lg:      'h-[var(--mimi-control-height-lg,2.75rem)] px-4 text-base',
} as const;

export const controlFocusStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

export const controlDisabledStyles =
  'disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50';

export const controlInvalidStyles =
  'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive';
```

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
  })
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

- **Layout:** header fijo translúcido (logo, versión, buscador ⌘K, ES/EN, GitHub, claro/oscuro), sidebar 240px, contenido máx. ~900px, TOC 200px.
- **Páginas:** Inicio, Instalación, Personalización, Temas (personalizador en vivo + exportar `mimi.preset.ts`), Migrar desde PrimeNG / NG-ZORRO, una página por componente. Select y Dialog aparecen como "Próximamente" hasta la Fase 4.
- **Página de componente:** título, descripción, pestañas de instalación, `CodePreview` (Preview/Código, copiar, canvas centrado), ejemplos por estado, ejemplo con `class`, tabla de API.
- Resaltado con Shiki. Prerender para generar páginas estáticas.
- El diseño visual sale de `docs/design/`.

## 11. Estilos visuales

- Mimi tiene un solo estilo: **Vivid**, que es el estilo por defecto. No hay estilo Default.
- **Vivid:** paleta neutra (primario casi negro en claro, casi blanco en oscuro), radio 12px, sombras en capas (solo la de destructive va teñida de su color), fuente Outfit y micro-animaciones (escala al hacer clic, transiciones suaves de color y sombra). Inspirado en Vuesax sin copiarlo.
- Los tokens están en `docs/design/tokens-vivid.css`. El primario se cambia con el preset (el personalizador del diseño trae violeta, esmeralda, azul y naranja).
- `mimi.json` guarda `"style": "vivid"`; el campo queda para poder sumar estilos más adelante.
