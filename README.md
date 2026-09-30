# Mimi para Angular (@mimi-ng)

> Angular + Tailwind CSS components you copy into your project. Docs in Spanish; English coming soon.

Librería de componentes UI para **Angular 22** y **Tailwind CSS 4** que se distribuye como código fuente: una CLI copia cada componente a tu proyecto y desde ese momento el código es tuyo.

- Documentación: https://ng.mimiworks.dev
- Paquete: [`@mimi-ng/cli`](https://www.npmjs.com/package/@mimi-ng/cli) (vista previa 0.x)

Mimi para Angular es un proyecto de [Mimi Works](https://mimiworks.dev).

## Inicio rápido

En un proyecto de Angular 22 con Tailwind CSS 4 (`ng new mi-app --style=tailwind`):

```sh
ng add @mimi-ng/cli
ng g ui button input card
```

```ts
import { MimiButton } from '@/components/ui/button';
```

Más detalles en [`packages/cli/README.md`](packages/cli/README.md) y en la [página de Instalación](https://ng.mimiworks.dev/docs/installation).

## Estructura

```
apps/docs/          # Showcase: documentación y entorno de pruebas
packages/ui-core/   # Código fuente de los componentes, el tema y las utilidades
packages/cli/       # @mimi-ng/cli: schematics (init, ng-add, ui) y plantillas de ui-core
docs/               # Especificación (spec.md), plan de tareas (plan.md) y diseños (design/)
angular.json        # Workspace de Angular con los proyectos "docs" y "ui-core"
```

## Desarrollo

Requiere Node.js 24.15+ y pnpm 12 (ver `docs/spec.md`, sección 2). Todo se ejecuta desde la raíz.

```sh
pnpm install        # instalar dependencias
pnpm dev            # levantar el showcase en http://localhost:4200
pnpm build          # compilar el showcase (dist/docs) y la CLI (packages/cli/dist)
pnpm build:cli      # compilar solo la CLI
pnpm test           # pruebas del showcase, de ui-core y de la CLI
pnpm test:ui-core   # solo ui-core
pnpm test:cli       # solo la CLI (compila antes)
pnpm format         # formatear con Prettier (pnpm format:check solo revisa)
```

## Probar la CLI sin publicarla

1. Compila y empaqueta la CLI:

   ```sh
   pnpm build:cli
   cd packages/cli && pnpm pack --pack-destination ../../../mimi-sandbox
   ```

2. En un proyecto de Angular aparte (fuera de este repositorio), instala el `.tgz` como dependencia de desarrollo y ejecuta `ng add`. `ng add` no acepta el archivo directamente, pero si el paquete ya está instalado, ejecuta su schematic:

   ```sh
   pnpm add -D ../mimi-ng-cli-0.1.0.tgz
   pnpm ng add @mimi-ng/cli
   ```

3. Si vuelves a empaquetar la misma versión, dale otro nombre al `.tgz` antes de instalarlo: pnpm guarda en caché el contenido por nombre de archivo.

## Documentación del proyecto

- [`docs/spec.md`](docs/spec.md): especificación completa.
- [`docs/plan.md`](docs/plan.md): tareas por fase.

## Licencia

[MIT](LICENSE). Los avisos de terceros (Lucide, Octicons) están en [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
