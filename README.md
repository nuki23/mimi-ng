# Mimi (@mimi-ng)

Librería de componentes UI para **Angular 22** y **Tailwind CSS 4** que se distribuye como código fuente: una CLI copia cada componente a tu proyecto y desde ese momento el código es tuyo.

## Estructura

```
apps/docs/          # Showcase: documentación y entorno de pruebas
packages/ui-core/   # Código fuente de los componentes, el tema y las utilidades
docs/               # Especificación (spec.md), plan de tareas (plan.md) y diseños (design/)
angular.json        # Workspace de Angular con los proyectos "docs" y "ui-core"
```

## Comandos

Requiere Node.js 24.15+ y pnpm (ver `docs/spec.md`, sección 2). Todo se ejecuta desde la raíz.

```sh
pnpm install   # instalar dependencias
pnpm dev       # levantar el showcase en http://localhost:4200
pnpm build     # compilar el showcase en dist/docs
pnpm test      # pruebas de docs y ui-core
pnpm format    # formatear con Prettier (pnpm format:check solo revisa)
```
