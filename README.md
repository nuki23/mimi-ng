# Mimi para Angular (@mimi-ng)

> Angular + Tailwind CSS components you copy into your project. Docs in Spanish; English coming soon.

Librería de componentes UI para **Angular 22 o superior** y **Tailwind CSS 4** que se distribuye como código fuente: una CLI copia cada componente a tu proyecto y desde ese momento el código es tuyo.

- Documentación: https://ng.mimiworks.dev
- Paquete: [`@mimi-ng/cli`](https://www.npmjs.com/package/@mimi-ng/cli) (vista previa 0.x)

Mimi para Angular es un proyecto de [Mimi Works](https://mimiworks.dev).

## Por qué "Mimi"

Mimi viene de "mi, mi": mis componentes, mis herramientas, mis desarrollos. Empezó como lo que yo usaba en mis propios proyectos.

Pero la idea que más me importa es la contraria: que lo que construyas con Mimi sea tuyo. Por eso Mimi no se instala como una caja cerrada: la CLI copia cada componente a tu proyecto y, desde ese momento, el código es tuyo. Puedes cambiarlo como quieras, y Mimi respeta tus cambios cuando hay versiones nuevas.

Mimi nació como "lo mío". Su promesa es que sea tuyo.

## Inicio rápido

En un proyecto de Angular 22 o superior con Tailwind CSS 4 (`ng new mi-app --style=tailwind`):

```sh
ng add @mimi-ng/cli
ng g mimi button input card
```

```ts
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-root',
  imports: [MimiButton],
  template: `<button mimiBtn>Guardar</button>`,
})
export class App {}
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
pnpm build:docs     # compilar solo el showcase (lo que se despliega en Cloudflare)
pnpm build:cli      # compilar solo la CLI
pnpm test           # pruebas del showcase, de ui-core y de la CLI
pnpm test:ui-core   # solo ui-core
pnpm test:cli       # solo la CLI (compila antes)
pnpm format         # formatear con Prettier (pnpm format:check solo revisa)
```

## Probar la CLI sin publicarla

1. Compila la CLI y empaquétala en una carpeta **fuera de este repositorio** (aquí, `<carpeta-de-pruebas>`):

   ```sh
   pnpm build:cli
   cd packages/cli
   pnpm pack --pack-destination <carpeta-de-pruebas>
   ```

2. Crea el proyecto de prueba también **fuera de este repositorio** (dentro, pnpm lo trataría como parte del workspace), por ejemplo en `<carpeta-de-pruebas>/app`. Ahí instala el `.tgz` como dependencia de desarrollo y ejecuta `ng add`. `ng add` no acepta el archivo directamente, pero si el paquete ya está instalado, ejecuta su schematic:

   ```sh
   pnpm add -D <carpeta-de-pruebas>/mimi-ng-cli-0.1.0.tgz
   pnpm ng add @mimi-ng/cli
   ```

3. Si vuelves a empaquetar la misma versión, dale otro nombre al `.tgz` antes de instalarlo: pnpm guarda en caché el contenido por nombre de archivo.

## Contribuir

Los errores y las sugerencias van en los [issues del repositorio](https://github.com/nuki23/mimi-ng/issues).

## Documentación del proyecto

- [`docs/spec.md`](docs/spec.md): especificación completa.
- [`docs/plan.md`](docs/plan.md): tareas por fase.

## Licencia

[MIT](LICENSE). Los avisos de terceros (Lucide, Octicons) están en [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
