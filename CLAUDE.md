# Mimi (@mimi-ng)

Librería de componentes UI para **Angular 22** + **Tailwind CSS 4**. Los componentes se copian al proyecto del usuario con una CLI (como shadcn/ui). Un solo prefijo: `mimi`. Tema opcional tipado (como los presets de PrimeNG). El objetivo número uno es que sea **muy fácil de usar**.

## Documentos del proyecto

- `docs/spec.md`: especificación completa. Léela antes de crear o cambiar un componente, el tema o la CLI.
- `docs/plan.md`: tareas por fase. Trabaja solo la tarea que se te pida y marca su casilla al terminar.
- `docs/design/`: diseños y variables CSS de Claude Design. Colores, radios y sombras salen de aquí, nunca inventados.

## Estructura

```
apps/docs/          # Showcase y entorno de pruebas (Angular 22 puro, sin AnalogJS)
packages/ui-core/   # Código fuente maestro de los componentes, tema y utils
packages/cli/       # @mimi-ng/cli (Angular Schematics)
```

## Comandos

- `pnpm install`: instalar dependencias (usar siempre pnpm, nunca npm ni yarn).
- `pnpm dev`: levantar el showcase.
- `pnpm build`: compilar todo.
- `pnpm test`: pruebas de docs y ui-core (`ng test`, sin watch).
- `pnpm test:ui-core`: solo las pruebas de ui-core.
- `pnpm format`: formatear con Prettier (`pnpm format:check` solo revisa).
- Angular CLI se ejecuta desde la raíz: `pnpm ng <comando> <proyecto>` (proyectos `docs` y `ui-core`).

## Reglas de Angular (obligatorias)

1. `ChangeDetectionStrategy.OnPush` en todo. App zoneless: nada puede depender de Zone.js.
2. Solo `input()`, `output()`, `model()`, `viewChild()`, `contentChild()` y el objeto `host`. Prohibido `@Input`, `@Output`, `@ViewChild`, `@HostBinding`, `@HostListener`.
3. Solo `@if`, `@for` (con `track`), `@switch`, `@let`. Prohibido `*ngIf` y `*ngFor`.
4. `inject()` en propiedades, nunca inyección por constructor.
5. No escribir `standalone: true` (es el valor por defecto).
6. Nunca envolver un `<input>` nativo de forma que rompa `formControlName` o `[(ngModel)]`: para elementos nativos se usan directivas de atributo (`input[mimiInput]`).
7. El estado de Reactive Forms no es un signal: para reaccionar a `invalid`/`touched` usar `toSignal(control.events)`, nunca un `computed()` que lea el control directamente.
8. Ante dudas de API de Angular, consultar el MCP de Angular (`angular-cli`) en lugar de adivinar.
9. Los archivos de `packages/ui-core` se importan entre sí con el alias (`@/components/ui/utils`, `@/components/ui/theme`, `@/components/ui/<componente>`), nunca con rutas relativas que salgan de su carpeta: la CLI los copia a otra estructura (`components/ui/<nombre>/`, `components/ui/utils/`). Dentro de la misma carpeta, rutas relativas.
10. Formularios: los campos nativos detectan `FormField` (Signal Forms) o `NgControl` (Reactive Forms / ngModel); los controles propios implementan `FormValueControl` / `FormCheckboxControl`, nunca `ControlValueAccessor` (spec, sección 8).

## Reglas de estilos (obligatorias)

1. **Cero colores fijos.** Prohibido `bg-white`, `text-gray-500`, `border-red-500`, etc. Solo tokens: `bg-background`, `text-muted-foreground`, `border-destructive`…
2. Todas las variables CSS llevan el prefijo `--mimi-`. Se exponen a Tailwind 4 con `@theme inline` (ver spec, sección 6).
3. Tailwind 4: sin `tailwind.config.js`. Toda la configuración va en CSS. El `styles.css` del showcase debe incluir `@source` apuntando a `packages/ui-core/src`, o Tailwind no generará las clases de los componentes.
4. Variantes con `cva`. Las clases se escriben **completas y literales** (nunca `'bg-' + color`), para que Tailwind las detecte.
5. **Todo componente acepta `class` del usuario** y lo mezcla con `cn()`:
   ```ts
   userClass = input('', { alias: 'class' });
   protected classes = computed(() => cn(variants({ ... }), this.userClass()));
   // host: { '[class]': 'classes()' }
   ```
6. Cada componente expone su estado con atributos `data-*` (`data-variant`, `data-size`, `data-state="checked|unchecked"`, `data-disabled`).
7. Alturas con cascada: `h-[var(--mimi-btn-height,var(--mimi-control-height,2.5rem))]`. Button, Input y Textarea deben quedar alineados al píxel.
8. Íconos internos de los componentes: SVG escrito en línea con los trazos de Lucide (sin dependencia). Los íconos que ponga el usuario se aceptan por `ng-content` y se dimensionan con `[&_svg]:size-4 [&_svg]:shrink-0`.
9. En el showcase, los íconos se usan con `@lucide/angular` (el paquete nuevo, no `lucide-angular`).
10. Accesibilidad: foco visible, roles ARIA correctos (`role="switch"`, `role="checkbox"`, `aria-invalid`), manejo de teclado.

## Forma de trabajar

- Una tarea de `docs/plan.md` por vez. Antes de escribir código, propone un plan breve.
- Al terminar: verifica que `pnpm build` pase, marca la casilla en `docs/plan.md` y resume qué cambió.
- Al terminar cada tarea, ejecuta `pnpm format`.
- No agregues dependencias que no estén en la spec sin preguntar.
- Cada componente nuevo tiene su página en el showcase con todos sus estados.
