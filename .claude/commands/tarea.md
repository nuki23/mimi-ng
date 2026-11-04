---
description: Trabaja una tarea del plan que no es un componente (CLI, plataforma, mantenimiento, correcciones, spec)
argument-hint: <ID de la tarea, ej. M.2 o 5.14>
---

Trabaja la tarea **$ARGUMENTS** del plan de Mimi. Es para todo lo que no es un componente nuevo: la CLI, la plataforma y el showcase, el mantenimiento (M.x), las correcciones, la spec y el diseño de tokens (por ejemplo, G2.0). Para un componente, usa `/componente`; para la puerta de un grupo, `/cerrar-grupo`.

Sigue el protocolo de `CLAUDE.md`, «Forma de trabajar», sin saltarte ningún paso:

1. **Al empezar** (pasos a–d): busca la tarea con `grep -rn "$ARGUMENTS" docs/plan/` y lee su línea del índice (`docs/plan.md`) y su detalle. Si es una tarea de una línea (en el archivo de su bloque, por ejemplo `docs/plan/plataforma.md`), lee también lo que diga la spec de ella (`grep -n "$ARGUMENTS" docs/spec.md`). Pregunta si falta una dependencia o hay un «PENDIENTE DE DECIDIR» que la afecte; marca `[~]` en el detalle y en el índice, agrega la fila a «En curso», y propone un plan breve y espera la aprobación.
2. **Mientras trabajas:** cumple las reglas de `CLAUDE.md` que apliquen a lo que toques (Angular 1–10 y estilos 1–11 si cambias código de ui-core o del showcase; «Forma de trabajar» siempre). Si la tarea cambia un archivo de un componente ya publicado, recuerda que la CLI lo actualiza solo si el usuario no lo modificó (spec 5, «Qué hace `mimi`»): va en el CHANGELOG.
3. **Al terminar** (pasos e–h): verifica cada «Criterio de hecho» con su evidencia (comando y resultado, prueba o archivo) y marca como **NO COMPROBADO** lo que no pudiste comprobar; marca `[x]` en el detalle y en el índice y quita la fila de «En curso»; anota en `docs/design/correcciones-pendientes.md` lo que corresponda y lleva a la spec las decisiones que siguen vigentes; informa archivos, bundle (crudo y gzip, antes y después, JS y CSS por separado, si cambió el build), alertas y mensaje de commit.
4. **Commit y push:** como dice `CLAUDE.md`, «Commit y push». No publiques nada: si la tarea termina en una publicación, dale al usuario los comandos de `docs/proceso/release.md`.

Si la tarea de una línea necesita más detalle para trabajarse (no tiene «Criterios de hecho»), propon primero su plantilla completa (`docs/plan.md`, «Plantilla de tarea») en un archivo propio con su ID como nombre, y espera la aprobación antes de empezar.
