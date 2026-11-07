# Informe de modo autónomo: arreglos de la revisión y puerta B.P, rama `auto/blocks-0.4.0-2026-11-06`

Sesión del 07/11/2026, en la misma rama (checkout y `pull`: al día en `f81ccb3`). `node -v`: **v24.18.0**. `git config user.email`: la dirección noreply del autor.

Pedido: los arreglos de una revisión independiente de la rama, en orden y un commit por arreglo, con pruebas (G1, M1 a M5, menores y tareas de mantenimiento); después, terminar la puerta B.P (CHANGELOG, enlace en la landing, escenarios con el `.tgz` de la versión final, mover el grupo al historial). Sin subir la versión ni publicar.

## G1: con `source(none)`, un Block no recibía estilos

**Reproducido primero** en un proyecto nuevo fuera del repo (`C:\t\b040\g1\app`: `ng new` con Tailwind, `@import 'tailwindcss' source(none);`, la CLI de la rama empaquetada, `ng add` y `ng g mimi login-01` con la ruta). `init` escribió solo `@source "./app/components/ui";`. En el CSS compilado, buscando las clases propias del Block como texto literal:

| Clase de `login-01`   | Sin el `@source` de Blocks | Con él |
| --------------------- | -------------------------- | ------ |
| `max-w-[400px]`       | 0                          | 1      |
| `tracking-[-0.02em]`  | 0                          | 1      |
| `rounded-[12px]`      | 0                          | 1      |
| `bg-size-[18px_18px]` | 0                          | 1      |

(La primera búsqueda escribió los corchetes sin escapar y daba 0 también con el arreglo; se repitió con `grep -F` quitando y reponiendo la línea, que es la tabla de arriba.)

**Arreglo:** `withBlocksSource` (`utils/tailwind.ts`) agrega `@source "<ruta del CSS a aliases.blocks>";` cuando el `@import` de Tailwind usa `source(none)` y falta (comillas simples o dobles cuentan), después del `@source` de componentes o del tema. Lo usan:

- `ng g mimi` (regla `addBlocksSource`), solo si se copia un Block, con una línea en el resumen;
- `init`, que con `source(none)` escribe ahora los dos `@source` (componentes y Blocks; Tailwind no se queja si la carpeta todavía no existe).

**Pruebas:** `blocks.spec.ts`, «G1» (3): lo agrega después del de componentes una vez y lo dice; con `aliases.blocks` propio usa su carpeta y no repite uno escrito con comillas simples; un componente solo, o sin `source(none)`, no lo agrega. `init.spec.ts`: con `source(none)`, los dos `@source` exactos. **En el proyecto real**, con la CLI reempaquetada (`0.4.0-real.8`), `ng g mimi login-01` agregó `@source "./app/blocks";` y las cuatro clases entraron en el CSS. `pnpm test:cli`: 147 en verde. Spec 5 al día (paso 6 de `init` y «`@source` de los Blocks con `source(none)`»).

Commit: `fix(cli): @source de la carpeta de Blocks con source(none), en ng g mimi e init (G1)`.

## M1: aviso cuando se actualiza un componente que usa un Block

**Arreglo:** al terminar, `ng g mimi` revisa los Blocks de `mimi.json → blocks` que no se actualizaron en esa ejecución (el usuario los modificó, o no los pidió); si alguno usa (en cualquier nivel) un componente que sí se actualizó, avisa sin bloquear: «Tu Block test-block usa button, que se actualizó a 0.3.0; revisa el CHANGELOG por si tu pantalla necesita algún cambio.» (con la versión de la CLI).

**Pruebas:** `blocks.spec.ts`, «M1» (3): pidiendo solo el componente (se actualiza y avisa); con el Block modificado y bloqueado (avisa además del bloqueo; el componente se actualiza igual); sin aviso si el Block se actualizó con él o si el componente no cambió. `pnpm test:cli`: 150 en verde. Spec 5 al día.

Commit: `feat(cli): avisa si un componente actualizado lo usa un Block instalado (M1)`.

## M2: alias absolutos, con «..» o fuera del proyecto

**Antes:** `normalizePath` convertía `C:\proyecto\blocks` en `C:/proyecto/blocks` (una carpeta «C:» dentro del workspace) y quitaba el `/` inicial de una ruta absoluta; `..` se resolvía y podía salir del proyecto.

**Arreglo:** `invalidAliasReason` (`init/paths.ts`) y `assertAliases` (`utils/project.ts`): `ng g mimi` e `init` (con un `mimi.json` que ya existe) fallan **antes de escribir nada** si `aliases.components` o `aliases.blocks` es absoluto (`/x`, `C:\x`, `C:/x`, `~/x`), tiene `..`, está vacío o apunta a la raíz, con el motivo, el valor y un ejemplo.

**Pruebas:** `blocks.spec.ts`, «M2» (9): ocho casos de los dos alias con `ng g mimi` (error exacto, el árbol sin cambios y sin ninguna carpeta «C:») y uno con `init`. `pnpm test:cli`: 159 en verde. Spec 5 al día.

Commit: `fix(cli): error claro con alias absolutos o fuera del proyecto en mimi.json (M2)`.
