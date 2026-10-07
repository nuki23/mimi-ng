# Mimi para Angular

[![npm](https://img.shields.io/npm/v/@mimi-ng/cli)](https://www.npmjs.com/package/@mimi-ng/cli)
[![Licencia: MIT](https://img.shields.io/npm/l/@mimi-ng/cli)](https://github.com/nuki23/mimi-ng/blob/main/LICENSE)

> Angular + Tailwind CSS components you copy into your project. Docs in Spanish; English coming soon.

Componentes para **Angular** y **Tailwind CSS 4** que una CLI copia a tu proyecto: desde ese momento, el código es tuyo. Un solo prefijo (`mimi`), tema opcional y tipado, y formularios con errores automáticos.

Mimi nació como "lo mío". Su promesa es que sea tuyo.

**Vista previa 0.x:** la API puede cambiar entre versiones menores hasta la 1.0.

Documentación: **https://ng.mimiworks.dev**

![Página de inicio de Mimi para Angular en ng.mimiworks.dev](https://raw.githubusercontent.com/nuki23/mimi-ng/main/docs/assets/mimi-ng-showcase.png)

## Requisitos

- Angular 22 o superior.
- Tailwind CSS 4. Para un proyecto nuevo: `ng new mi-app --style=tailwind`. Si tu proyecto ya existe, sigue la [guía de Tailwind CSS para Angular](https://tailwindcss.com/docs/installation/framework-guides/angular).
- Node.js `^22.22.3`, `^24.15.0` o `>=26` (los que exige Angular 22).

## Instalación

```sh
ng add @mimi-ng/cli
```

Verifica Angular y Tailwind (si falta algo, se detiene sin modificar nada) y configura el proyecto:

- importa el tema de Mimi en tu CSS global, justo después de `@import "tailwindcss"`;
- agrega el alias `@/components/ui/*` al `tsconfig.json`;
- registra la CLI en `angular.json`, para que funcione `ng g mimi`;
- instala `clsx`, `tailwind-merge` y `class-variance-authority` con tu gestor de paquetes;
- crea `mimi.json` y la carpeta `.mimi/`.

Con `--icons` instala también [`@lucide/angular`](https://lucide.dev) para tus íconos.

## Agregar componentes

```sh
ng g mimi button              # uno
ng g mimi button input card   # varios a la vez
ng g mimi                     # menú para elegir (terminal interactiva)
ng g @mimi-ng/cli:ui button   # forma larga (si Mimi no está en schematicCollections)
```

Cada componente se copia a `src/app/components/ui/<nombre>`, con lo que necesite, y se instalan las dependencias que falten. Después lo importas como cualquier otro:

```ts
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-root',
  imports: [MimiButton],
  template: `<button mimiBtn>Hola, Mimi</button>`,
})
export class App {}
```

## Componentes

- **Avatar**: `ng g mimi avatar` · [documentación](https://ng.mimiworks.dev/docs/components/avatar)
- **Badge**: `ng g mimi badge` · [documentación](https://ng.mimiworks.dev/docs/components/badge)
- **Button**: `ng g mimi button` · [documentación](https://ng.mimiworks.dev/docs/components/button)
- **Card**: `ng g mimi card` · [documentación](https://ng.mimiworks.dev/docs/components/card)
- **Checkbox**: `ng g mimi checkbox` · [documentación](https://ng.mimiworks.dev/docs/components/switch)
- **FormField**: `ng g mimi form-field` · [documentación](https://ng.mimiworks.dev/docs/components/form-field)
- **Input**: `ng g mimi input` · [documentación](https://ng.mimiworks.dev/docs/components/input)
- **Popover**: `ng g mimi popover` · [documentación](https://ng.mimiworks.dev/docs/components/popover)
- **Separator**: `ng g mimi separator` · [documentación](https://ng.mimiworks.dev/docs/components/separator)
- **Skeleton**: `ng g mimi skeleton` · [documentación](https://ng.mimiworks.dev/docs/components/skeleton)
- **Switch**: `ng g mimi switch` · [documentación](https://ng.mimiworks.dev/docs/components/switch)
- **Textarea**: `ng g mimi textarea` · [documentación](https://ng.mimiworks.dev/docs/components/input)
- **Tooltip**: `ng g mimi tooltip` · [documentación](https://ng.mimiworks.dev/docs/components/tooltip)

## Tus cambios

- Guarda la carpeta `.mimi/` en git: tiene la copia original de cada archivo, y con ella Mimi sabe qué cambiaste tú.
- Los componentes que modificaste nunca se sobrescriben: `ng g mimi` los omite con un aviso (`--overwrite` los reemplaza).
- Los que no tocaste se actualizan al volver a ejecutar `ng g mimi` con una versión nueva de la CLI.
- Próximamente: `mimi update`, para combinar tus cambios con la versión nueva.

## Si usas pnpm

Desde pnpm 10, los scripts de instalación de las dependencias están bloqueados hasta que los apruebes, y la instalación puede fallar con `ERR_PNPM_IGNORED_BUILDS`. Apruébalos con `pnpm approve-builds`. Más detalles en la [página de Instalación](https://ng.mimiworks.dev/docs/installation).

## Licencia

MIT. Incluye íconos de Lucide (ISC); ver `THIRD_PARTY_NOTICES.md`.

Mimi para Angular es un proyecto de [Mimi Works](https://mimiworks.dev).
