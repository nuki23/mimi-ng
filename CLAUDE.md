# Mimi (@mimi-ng)

Librería de componentes UI para **Angular 22** + **Tailwind CSS 4**. Los componentes se copian al proyecto del usuario con una CLI (como shadcn/ui). Un solo prefijo: `mimi`. Tema opcional tipado (como los presets de PrimeNG). El objetivo número uno es que sea **muy fácil de usar**.

## Documentos del proyecto

- `docs/spec.md`: especificación completa. Léela antes de crear o cambiar un componente, el tema o la CLI.
- `docs/plan.md`: el índice de tareas (una línea por tarea, con su estado y el enlace a su detalle) y las reglas del plan. El detalle de cada tarea está en `docs/plan/` (una tarea detallada tiene su archivo con el ID como nombre, por ejemplo `docs/plan/grupo-2/G2.1.md`; las de una línea van en el archivo de su bloque). Para encontrar una tarea por su ID: el índice o `grep -rn "<ID>" docs/plan/`. Cómo se trabaja una tarea: «Forma de trabajar», abajo.
- `docs/design/`: diseños y variables CSS de Claude Design. Colores, radios y sombras salen de aquí, nunca inventados. Lo que Mimi haga distinto del diseño, o sin diseño, se anota en `docs/design/correcciones-pendientes.md` (tarea D6 del plan).
- `docs/historial/`: el texto completo de las tareas terminadas del plan. No se edita.
- `docs/futuro/`: proyectos aparte que no se trabajan en mimi-ng (por ahora, `theme-studio.md`). No se toman como tareas.

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
9. Los archivos de `packages/ui-core` se importan entre sí con el alias y el **archivo concreto** (`@/components/ui/utils/cn`, `@/components/ui/theme/provider`, `@/components/ui/<componente>`), nunca con el índice de `utils` o `theme` (el de utils trae `@angular/forms` a quien use solo Button) ni con rutas relativas que salgan de su carpeta (la CLI los copia a otra estructura: `components/ui/<nombre>/`, `components/ui/utils/`). Dentro de la misma carpeta, rutas relativas. Lo comprueba `packages/ui-core/src/lib/imports.spec.ts`. El showcase importa los componentes igual que el usuario (`@/components/ui/<componente>`), no desde `@mimi-ng/ui-core`.
10. Formularios: los campos nativos detectan `FormField` (Signal Forms) o `NgControl` (Reactive Forms / ngModel); los controles propios implementan `FormValueControl` / `FormCheckboxControl`, nunca `ControlValueAccessor` (spec, sección 8). En directivas que conviven con `[formField]` (Input, Textarea), no uses nombres de entrada que Signal Forms escribe (`invalid`, `touched`, `dirty`, `disabled`, `errors`, `required`, `name`…), salvo en controles propios que implementen `FormValueControl`, donde es intencional.

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
8. En valores arbitrarios con `var()`, indica siempre el tipo cuando la utilidad sea ambigua: `shadow-[shadow:var(…)]`, `text-[length:var(…)]` o `text-[color:var(…)]`, `border-[length:var(…)]` o `border-[color:var(…)]`, `bg-[color:var(…)]`. El tipo hace falta por dos motivos: (1) tailwind-merge: sin tipo, `shadow-[var(…)]` y `outline-[var(…)]` no se resuelven bien contra la clase del usuario (lo cubren las pruebas de `class`: cubre cada caso con una); (2) Tailwind: sin tipo puede generar la propiedad equivocada, por ejemplo `text-[var(…)]` se interpreta como color en vez de tamaño (esto no lo detectan las pruebas de `class`, solo la revisión del CSS generado o el navegador). La práctica no cambia: siempre con tipo.
9. Íconos internos de los componentes: SVG escrito en línea con los trazos de Lucide (sin dependencia). Los íconos que ponga el usuario se aceptan por `ng-content` y se dimensionan con `[&_svg]:size-4 [&_svg]:shrink-0`.
10. En el showcase, los íconos se usan con `@lucide/angular` (el paquete nuevo, no `lucide-angular`).
11. Accesibilidad: foco visible, roles ARIA correctos (`role="switch"`, `role="checkbox"`, `aria-invalid`), manejo de teclado.

## Forma de trabajar

- Una tarea del plan por vez (índice en `docs/plan.md`, detalle en `docs/plan/`). Si el usuario pide un paso aparte («PASO A»), detente al terminarlo para que haga su commit.
- Los comandos `/componente` (componentes), `/tarea` (todo lo demás) y `/cerrar-grupo` (la puerta de un grupo) siguen este protocolo.
- Con «modo autónomo» en el prompt de la sesión, ver «Modo autónomo», abajo: reemplaza los pasos b y d.

**Al empezar una tarea**

- a. Lee su línea del índice y su archivo en `docs/plan/` (búscalo con `grep -rn "<ID>" docs/plan/`), no todo el plan. De la tarea, lee «Leer antes», «Depende de», «Trampas conocidas» y «Criterios de hecho».
- b. Si una dependencia no está hecha, o hay un «PENDIENTE DE DECIDIR» que afecta a la tarea, pregunta al usuario; no lo resuelvas tú.
- c. Marca la tarea `[~]` en su archivo de detalle y en el índice, y agrega su fila a «En curso» de `docs/plan.md` (ID, rama si la hay, quién, fecha).
- d. Antes de escribir código, propone un plan breve y **espera la aprobación**.

**Al terminar una tarea**

- e. Verifica cada «Criterio de hecho» uno por uno y repórtalos en una lista con la evidencia de cada uno (el comando y su resultado, la prueba, el archivo). Entre ellos, siempre: `pnpm build`, `pnpm test` y `pnpm format` en verde (y `pnpm format:check`). Un criterio que no comprobaste se informa como **NO COMPROBADO**; la tarea no se marca hecha si falta alguno obligatorio.
- f. Marca `[x]` en su archivo de detalle y en el índice, y quita su fila de «En curso». Si la tarea cierra el grupo, mueve el texto al historial como dice «Cómo usar este plan» (`docs/plan.md`).
- g. Anota en `docs/design/correcciones-pendientes.md` lo que quedó distinto del diseño o sin diseño. Actualiza la spec si cambió algo; las decisiones que siguen vigentes van a la spec.
- h. Informa: la **lista de archivos** nuevos y modificados, el bundle (ver «Bundle», abajo), el CSS global crudo y gzip, las alertas para el revisor y el mensaje de commit sugerido. Si algo no salió como se pidió (una decisión distinta, un valor que no está en el diseño, una regla que no cumpliste), dilo explícitamente.

**Commit y push**

- Por defecto, los commits los hace el usuario. Al terminar, avisa que toca commit y sugiere un mensaje breve, sin líneas de atribución.
- Solo si el usuario lo autoriza en el prompt de la sesión, haz el commit y el push con estas barreras:
  - `git status --short` antes.
  - `git add` solo de rutas concretas de lo que tocaste en esa tarea: nunca `git add -A` ni `git add .`, nunca `.vscode/`.
  - `git config user.email` debe ser exactamente `220945288+nuki23@users.noreply.github.com`; si no, **no hagas el commit** y avísale. No cambies la configuración global de git.
  - El mensaje, solo el acordado: sin pie «Co-Authored-By», sin «Generated with…», sin «Claude-Session» ni ninguna mención a Claude o a una IA.
  - Antes del push, verifica autor y mensaje con `git log -1 --format='%an <%ae>%n%B'`.
  - Push sin `--force`. Si algo falla, detente y avisa.
- **No publiques nada** (npm, tags, releases, despliegues): lo hace siempre el usuario, aunque autorice commits. Puedes darle los comandos (`docs/proceso/release.md`).
- No agregues dependencias que no estén en la spec sin preguntar.
- Cada componente nuevo tiene su página en el showcase con todos sus estados.
- Para crear o editar archivos usa siempre la herramienta de archivos, nunca bash con heredoc ni echo: las comillas invertidas se ejecutan como comandos. Tampoco `sed -i` para editar archivos del repo.
  - **Única excepción: la misma edición en muchos archivos.** Se permite un script (Node, guardado fuera del repo, en el directorio temporal; nunca `sed -i` ni un heredoc que escriba en el repo) solo si se cumplen las cuatro condiciones: (1) la edición es idéntica en todos los archivos (el mismo cambio, en el mismo lugar de cada uno), y son al menos cinco; (2) el script falla y no escribe nada en un archivo donde no encuentra exactamente lo que espera; (3) después del script, y antes de seguir, se revisa el resultado: `git diff --stat` de esos archivos y una comprobación de solo lectura de que cada cambio quedó donde debía; el `git diff --stat` se registra en el informe dos veces, antes y después de Prettier (`pnpm format` o `prettier --write`), para distinguir lo que hizo el script de lo que hizo el formato; (4) el informe de la tarea (o el mensaje al usuario) lleva la lista de archivos, los dos `git diff --stat`, qué hizo el script y **el texto completo del script**, copiado tal cual (el script vive fuera del repo).
  - **Nunca** para un solo archivo, para unos pocos (menos de cinco: con la herramienta de archivos) ni para ediciones distintas entre sí; nunca para evitar un permiso o una confirmación, ni para tocar archivos que la herramienta de archivos no puede editar por una regla (por ejemplo, `.claude/settings.json`).
- **Bundle:** cada vez que lo informes, da el tamaño crudo **y** el gzip, antes y después, con el JS y el CSS por separado (la salida de `apps/docs/scripts/check-initial-js.mjs`; la columna «Estimated transfer size» de `ng build` es brotli, no gzip). Si el JS inicial crece más de 1 kB, explica qué módulos entraron y por qué. Ningún presupuesto se sube sin que lo decida el usuario (spec 10).
- **Servidores en segundo plano:** detén el `pnpm dev` que levantes para comprobar algo. Si un servidor se detuvo por falta de memoria, no lo vuelvas a levantar sin que lo pida.
- **Privacidad:** las copias de respaldo del historial antiguo (`mimi-ng-respaldo-2026-09-30\` y el `.bundle`, fuera del repo) contienen el correo personal del autor: no las subas, compartas ni copies al repo. El `author` de `packages/cli/package.json` (el que se publica) es «Ariel O (https://github.com/nuki23)», sin correo: no agregues correos a ningún archivo, salvo la dirección noreply de GitHub del autor (`220945288+nuki23@users.noreply.github.com`), que es la que se usa en los commits.

## Modo autónomo

Se activa solo cuando el prompt de la sesión dice «modo autónomo». Mientras está activo, reemplaza los pasos **b** y **d** de «Forma de trabajar» y las reglas 1, 3 y 5 (la parte de «se avisa al usuario») de «Cómo usar este plan» (`docs/plan.md`). El resto del protocolo (a, c, e, f, g, h) sigue igual.

**A1. Rama.** Una rama propia `auto/<grupo>-<AAAA-MM-DD>` (por ejemplo, `auto/grupo-2-2026-11-05`), creada desde `main` actualizado y sin upstream hacia `main`. Nunca se trabaja ni se hace commit en `main`.

**A2. Orden.** Se sigue el «Orden recomendado» del grupo en `docs/plan.md` y se encadenan las tareas sin esperar la aprobación del plan ni respuestas del usuario. El plan breve del paso d se escribe igual, en el informe (A6), pero no se espera.

**A3. Decisiones.** Toda «PENDIENTE DE DECIDIR» de la tarea se resuelve sola: si tiene «Recomendación», se adopta; si no, se elige la opción más simple y coherente con `docs/spec.md`. Se anota en la tarea como «Decidido por defecto (DD/MM/AAAA), pendiente de revisión del usuario», con una fila en `docs/auto/decisiones-por-defecto.md`, y la línea se quita del índice de `docs/plan/decisiones.md`. Si el plan y la spec no coinciden (regla 5 del plan), se decide igual, por la spec, y se registra igual. Los spikes se ejecutan; si fallan, se usa el plan B documentado en la tarea.

**A4. Rupturas.** Hasta la 1.0 se permiten cambios de API. Todo lo que cambie algo publicado en la 0.2.0 se marca **RUPTURA** en el registro. El CHANGELOG no tiene sección «Sin publicar»: las rupturas las pasa al CHANGELOG la puerta del grupo, desde el registro.

**A5. Commits.** Un commit por tarea en la rama, con las barreras de «Commit y push» (identidad noreply, `git add` de rutas concretas, nunca `-A` ni `.`, nunca `.vscode/`, sin atribución ni mención a Claude o a una IA, sin `--force`). Después de cada commit, push de la rama `auto/…` (nunca de otra). Fusionar a `main` lo hace siempre el usuario.

**A6. Informe y criterios manuales.** El informe de cada tarea (plan breve, criterios de hecho con su evidencia, bundle crudo y gzip antes y después, CSS global, alertas, NO COMPROBADO y lista de archivos) va en `docs/auto/<rama sin «auto/»>.md` (por ejemplo, `docs/auto/grupo-2-2026-11-05.md`), una sección por tarea, y entra en el commit de la tarea. Antes de escribirlo se hace una revisión crítica propia: si la evidencia prueba de verdad cada criterio, si se salió del alcance, y los riesgos de bundle, accesibilidad, compatibilidad y privacidad.

- **Criterio principal manual** (la tarea existe para algo que solo comprueba el usuario; por ejemplo, la 5.17a con teléfonos reales): se hace toda la parte automática, la tarea queda en `[~]` con la nota «a falta de comprobación del usuario» (en su archivo de detalle, en el índice y en su fila de «En curso»), se anota en «Pendiente del usuario» del informe y se sigue con la cadena. En modo autónomo, una tarea en ese estado cuenta como hecha para las dependencias de las siguientes.
- **Criterio menor manual** (por ejemplo, una pasada con NVDA o una comprobación en un navegador real dentro de un componente): se informa como «NO COMPROBADO (manual, usuario)»; si todos los demás criterios están en verde, la tarea se marca `[x]` con la nota «pendiente de comprobación manual» y va a «Pendiente del usuario» del informe.
- **Dependencia de otro bloque sin hacer** (por ejemplo, M.2 para la G2.8): se hace antes, como una tarea más de la cadena, si no cae en A7; si cae, se detiene.

**A7. Cuándo se detiene** (deja el informe al día y avisa):

- hace falta una dependencia de npm que no está en la spec;
- habría que subir un presupuesto de bundle (se mide y se informa; no se sube);
- un spike falla y la tarea no tiene plan B;
- `pnpm build` o `pnpm test` siguen en rojo después de tres intentos;
- algo exige publicar o usar una cuenta externa;
- se llega a una puerta de grupo (`G<n>.P`): se hace su informe y se para.

**A8. Siguen prohibidos:** push a `main`, fusionar a `main` (`gh pr merge` incluido), `--force`, publicar (npm, etiquetas, releases, despliegues), tocar los respaldos (`mimi-ng-respaldo-*`, `*.bundle`) y hacer commit de `.vscode/`. Los permisos del repo (`.claude/settings.json`) refuerzan algunas de estas reglas, pero son patrones de texto que se pueden esquivar: la regla vale aunque un comando no esté denegado. `.claude/settings.json` no se edita (está denegado); si hay que cambiarlo, lo hace el usuario.
