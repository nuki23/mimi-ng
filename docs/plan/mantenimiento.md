# Plan: mantenimiento

[← Índice del plan](../plan.md)

## Mantenimiento

Pendientes sin grupo. No tienen versión propia: salen en la siguiente versión que se publique después de terminarlos.

- [ ] M.1 Confirm con acción asíncrona (`onConfirm` que devuelve una promesa): «cargando» en Confirmar, sin cerrar hasta que termine y sin doble envío. El diseño no lo muestra (decidido en la G1.7). Trampas que encontró la revisión del plan:
  - **Doble clic en zoneless:** el `disabled` de `loading` llega en el render siguiente, no en el mismo evento; dos clics rápidos o Enter con autorrepetición llaman dos veces. Hace falta una marca `pending` que se revise antes de llamar.
  - **Foco a `body`:** al deshabilitarse el botón enfocado, el foco cae a `body`. Moverlo antes al contenedor del diálogo (`tabindex="-1"`), devolverlo a Confirmar si falla y poner `aria-busy` en el panel.
  - **`closeAll()` y navegación durante la acción:** cierran y resuelven `false` aunque la acción siga y quizá termine bien. Documentarlo o hacer que `closeAll()` respete el bloqueo.
  - **Cambio que exige en Dialog:** poder bloquear Escape y el fondo con el diálogo abierto. Propuesta: `disableClose` como signal en `MimiDialogRef`, leído en el momento en que llega Escape o el clic (hoy se calcula al abrir). Es API pública nueva de Dialog: spec 4, página de Dialog y pruebas.
  - Depende de: G1.6, G1.7 (hechas).
- [ ] M.2 Alinear Angular en la 22.2.x (trae #33974 del combobox, que salió en cdk y aria 22.2.4). **Regla:** todos los `@angular/*` del repo (core y el resto del framework, cdk, aria, cli y build) en la mayor versión que core, cdk, aria, cli y build tengan en común, verificada con `npm view <paquete> version` el día de la tarea. Así aria queda siempre igual a cdk (spec 2 y 4). Después, `pnpm dedupe`, para que las peers de ui-core no queden en la versión anterior (lo que pasó al subir a la 22.2.3, el 21/10/2026).
  - Bloquea: G2.8 (provisional: el arreglo #33974 podría hacer falta en el Combobox; el spike del primer paso de G2.8 lo comprueba y, si no se reproduce, se quita este «Bloquea»; ver G2.8, «Base técnica»).
  - Dato del 03/11/2026 (`npm view`): `@angular/core` en 22.2.4 (salió el 29/10/2026); `@angular/cdk`, `@angular/aria` y `@angular/cli` en 22.2.5. Versión común: **22.2.4**. Cuando core llegue a la 22.2.5, se vuelve a alinear con la misma regla.
  - Criterios de hecho: `pnpm-lock.yaml` con una sola versión de cada `@angular/*`; `pnpm build`, `pnpm test` (incluidas las pruebas de alarma de aria) y `pnpm format:check` en verde; tabla de versiones de la spec 2 al día; bundle crudo y gzip antes y después.
- [ ] M.3 Revisar rodeos con aria 22.2: MenuItem value opcional (#33715) y tokens exportados (#33607); quitar los que ya no hagan falta, con las pruebas de alarma.
  - Leer antes: spec 4, «Base técnica», subsección «Rodeos de aria» (la lista que antes estaba en la G1.5b).
  - Depende de: M.2.
- [ ] M.4 Aviso de la CLI si el `@angular/cdk` instalado es anterior a `^22.2.0`. Hoy, si el proyecto ya declara `@angular/cdk` en cualquier rango (por ejemplo, 22.1), `ng g mimi` no lo cambia ni avisa aunque el registro pida `^22.2.0`, y agrega `@angular/aria` en la versión exacta de ese cdk (spec 5, «Límites conocidos de la 0.2.0»). El CHANGELOG de la 0.2.0 pide `ng update @angular/cdk`.
  - PENDIENTE DE DECIDIR: ¿solo avisar, o también actualizar el rango?
- [ ] M.5 Pasada con NVDA por los componentes con overlays. Select verificado con NVDA por el usuario (fecha aproximada: octubre de 2026). Pendiente: menús, Dialog, Tabs y Toast. Quién: usuario (prueba manual). Origen: G1.5 («Pendiente: la prueba con NVDA») y G1.12 («se amplía si hay una pasada con NVDA antes de publicar»). Al terminar, actualizar la sección de accesibilidad de Fundamentos con lo verificado.
- [ ] M.6 Select: saltar a una opción con una letra estando cerrado. Con el panel cerrado, una letra no salta a la opción (el `<select>` nativo sí). aria no lo ofrece: cerrado solo atiende ↓, Enter y Espacio, y la lista no existe. Habría que escribir la búsqueda por letra en Mimi. Origen: G1.5 y G1.5b; spec 4, «Rodeos de aria». Una prueba de alarma avisa si aria empieza a hacerlo.
- [ ] M.7 Revisar la división de los íconos de Lucide en los chunks del showcase. Origen: G1.10: todos los íconos que usa cualquier página lazy van en un solo chunk (141.66/9.35 → 191.22/11.63 kB crudo/gzip en la G1.10, por los íconos de los ejemplos). No afecta a quien usa Mimi; revisar si sigue creciendo.
- [ ] M.8 La CLI calcula las dependencias de npm y los `@import` antes de decidir los bloqueos de «todo o nada»: un Confirm bloqueado igual agrega `@angular/cdk` y el `@import` del overlay (inofensivo). Origen: spec 5, «Límites conocidos de la 0.2.0».
- [ ] M.9 Migrar Select a las utilidades de lista del Combobox (filtro sin tildes, resaltado y lista con «cargando» y «sin resultados»), para quitar el código repetido. Origen: G2.8 (decidido el 03/11/2026: los archivos de Select no se tocan en la 0.3.0).
  - Depende de: G2.8 · Bloquea: —
  - Alcance: Select usa las utilidades nuevas en lugar de su `normalize()`, `MimiSelectHighlight` y `MimiSelectList`; la API pública de Select no cambia (si algún tipo o export público cambia de sitio, Select lo sigue reexportando).
  - Trampas: el ítem `select` de la CLI pasa a depender del ítem de las utilidades; quien ya tiene Select copiado recibe el cambio solo si no lo modificó (todo o nada, spec 5). Las pruebas de alarma de aria del Select (G1.5b) tienen que seguir pasando sin cambios.
  - Criterios de hecho: pruebas de Select sin cambios y en verde; `registry.json` y pruebas de la CLI al día; `ng g mimi select` probado en un proyecto limpio y sobre un Select 0.3.0 sin modificar; nota en el CHANGELOG de la versión en que salga (qué cambió por dentro y que la API sigue igual); bundle: JS inicial y CSS global, crudo y gzip, antes y después.
- [ ] M.10 Script `check-plan` (el PASO 5 de la reorganización del plan, pedido por el usuario el 03/11/2026): `scripts/check-plan.mjs` y `pnpm check:plan`, que revisan el plan sin que haya que leerlo entero.
  - Depende de: la reorganización del plan (PASO 4: `CLAUDE.md`, `/componente`, los comandos nuevos y `docs/proceso/release.md`) · Bloquea: —
  - Alcance propuesto (lo detalla la tarea, con la aprobación del usuario): IDs sin duplicados en el índice ni en `docs/plan/`; cada «Depende de» cita IDs que existen; cada tarea pendiente del índice tiene su detalle y cada enlace del índice apunta a un archivo que existe; las dependencias de los componentes comparadas con la tabla de su grupo en la spec 4, como **aviso** y no como error (con las excepciones de la regla 5 de «Cómo usar este plan»). Antes de escribir el script, se explica cómo se leen las tablas de la spec 4.
  - Criterios de hecho:
    - **La casilla de cada tarea en el índice (`docs/plan.md`) coincide con la de su archivo de detalle en `docs/plan/`** (pedido del usuario al dividir el plan, 03/11/2026); si no coinciden, el script falla y dice cuáles.
    - Los enlaces del índice apuntan a archivos que existen.
    - `pnpm check:plan` en verde sobre el plan de ese día, con una prueba de cada falla (un ID duplicado, una casilla distinta, un enlace roto).
    - `CLAUDE.md` dice cuándo correrlo (al marcar una tarea y antes de cada commit del plan).
- [ ] M.11 La CLI y `--overwrite` con la misma versión. Origen: G2.4b (04/11/2026, modo autónomo): con un ítem ya instalado en la 0.2.0 sin modificar, una plantilla distinta con la misma versión (0.2.0) no se copia, ni con `--overwrite`; la prueba se hizo en un proyecto limpio nuevo. Registrada a pedido del usuario (05/11/2026).
  - Lo que se ve en el código (sin confirmar): en `packages/cli/src/utils/write-files.ts`, `stateOf()` devuelve `formatted` cuando el archivo del proyecto es igual a su copia en `.mimi/base/` y la versión del manifiesto es la misma que la de la CLI; el caso `formatted` solo informa «sin cambios» y no mira `overwrite` (el reemplazo forzado solo se aplica a `modified` y `modifiedOld`).
  - Qué hay que decidir: si es intencional (con la misma versión, el contenido publicado no cambia, así que la diferencia solo puede venir del formateo del proyecto) o un error (`--overwrite` debería reemplazar siempre). Si es intencional, se documenta en la spec 5 y en la ayuda de `--overwrite`; si es un error, `formatted` con `--overwrite` reemplaza, con su prueba.
  - No se sube la versión del paquete: eso lo hace el usuario.
  - Depende de: — · Bloquea: — (afecta a las pruebas en proyectos limpios de la G2.P).
- [ ] 0.1.1-3 `pnpm publish` da 404 aunque `npm whoami` funciona (pnpm 12 no usa la sesión de `npm login`). Mientras se resuelve, publicar con `npm publish` desde `packages/cli`. Investigar cómo autentica pnpm 12.
