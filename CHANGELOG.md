# Cambios

Todos los cambios de `@mimi-ng/cli` y de los componentes que copia. Mimi usa [versionado semántico](https://semver.org/lang/es/): mientras sea `0.x`, la API puede cambiar entre versiones menores (ver [`docs/spec.md`](docs/spec.md), sección 12).

## Sin publicar

### Correcciones

- **Accesibilidad: contraste del hover de los botones sólidos en modo claro.** En `success`, `info` y `danger` (`destructive`) el texto es blanco y el hover aclaraba el fondo hasta unos 3,8:1, por debajo de AA (4,5:1). Ahora el hover se aleja del color del texto: oscurece el fondo un 12 % (5,8:1). Cambia `--mimi-destructive-hover`, que ya fallaba en la 0.1.0 (`variant="destructive"` de Button), y los nuevos `--mimi-success-hover` e `--mimi-info-hover`. En modo oscuro no cambia nada.

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
