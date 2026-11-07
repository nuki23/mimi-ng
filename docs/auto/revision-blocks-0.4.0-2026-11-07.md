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

## M3: settings-01, guardar con un error desde otra sección

**Prueba primero** (`settings-01.spec.ts`, «M3»): usuario inválido en Perfil, cambiar a Facturación (el panel de Perfil deja de existir: contenido diferido de Tabs), pulsar «Save». **Falló como dijo el revisor:** volvía a Perfil, pero el foco se quedaba en la pestaña (`expected <button role="tab"…> to be <input mimiinput…>`): el `queueMicrotask` llegaba antes de que aria creara el panel.

**Arreglo:** el campo con error queda pendiente (`pendingFocus`) y lo enfoca el primer render en el que el campo ya está enlazado a su `[formField]` (`formFieldBindings().length > 0`), desde el `afterEveryRender` que ya tenía el Block; si ya lo está (se guarda desde Perfil), se enfoca en el acto. **La prueba pasa;** `settings-01.spec.ts`: 12 en verde.

Commit: `fix(blocks): settings-01 enfoca el campo con error al guardar desde otra sección (M3)`.

## M4: otp-01, reintentar el mismo código tras un error

**Pruebas primero** (`otp-01.spec.ts`, «M4», 2): las dos fallaron con el código anterior (`expected [ '246811' ] to deeply equal [ '246811', '246811' ]`): el mismo código no se podía reenviar, ni volviendo a escribirlo ni con «Verify», y al reescribirlo el «Incorrect code» volvía al instante.

**Arreglo** (`otp-01.ts`):

- editar el código anula el «enviado» (vuelve a «idle»); completo otra vez, aunque sea el mismo, se envía;
- con el mismo código y un error, «Verify» lo reenvía; sin error, sigue siendo una vez por código (B.5-a);
- después de enviar, el Block **espera la respuesta** (`awaiting`): no muestra el `status` anterior hasta que tu app cambia `status` o `loading`, y mientras `loading` no muestra ninguno. Si una app responde con el mismo `status` sin `loading`, el mensaje se queda en «idle» (documentado en la API de la página: pon `loading` mientras compruebas).

**Pruebas:** `otp-01.spec.ts`, 9 en verde (las 7 de antes sin cambios); `otp-01-demo.spec.ts` en verde.

Commit: `fix(blocks): otp-01 deja reintentar el mismo código tras un error (M4)`.

## M5: datos inventados en los Blocks

**login-02:** el testimonio («“We moved from PrimeNG to Mimi in two weeks…”», «Diego Paz», «CTO · Andes Logistics», iniciales «DP») pasa a texto de relleno genérico: «Add a short quote from a customer here.», «Customer name», «Role · Company» e iniciales «CN», con un comentario en la plantilla (pon la cita de un cliente real, con su permiso, o quita el `figure`).

**Búsqueda en los demás Blocks** (nombres de personas, marcas de terceros y dominios, con `grep` en `packages/ui-core/src/lib/blocks`):

- **settings-01:** la persona del ejemplo («Ana Torres», «anatorres», «AT» y una biografía que nombraba a Mimi como empleador) y dos ciudades reales. Pasan a «Your name», «your-username», «YN», «A short bio your team will see.», «Your city» y «Another city».
- **Dominios reales** (`company.com` en `login-02`, `signup-01` y `otp-01`; `mimi.dev/` en `settings-01`): van en el punto 7 (`example.com`).
- **Se quedan:** «Mimi Sales», la marca de ejemplo del propio proyecto (`login-01`, `login-02`, `signup-01`); «Google» y «GitHub» en los botones de `login-01` (son los proveedores de inicio de sesión, la función del botón); «Chrome · macOS» y «Safari · iPhone» en las sesiones (describen dispositivos).

**Pruebas:** `login-02.spec.ts` comprueba los textos de relleno; `settings-01.spec.ts` usa los valores nuevos. Los Blocks: 54 pruebas en verde. D6 al día.

Commit: `fix(blocks): textos de relleno genéricos en vez de personas y marcas inventadas (M5)`.

## Punto 7: menores (un commit)

- **settings-01:** sin `$any($event)` (método `selectTab`, que solo toma una de las cuatro secciones) y sin el `!` del `afterEveryRender` (comprueba el `id`).
- **pricing-01:** el «−17%» se calcula con los precios (el mayor ahorro de los planes con precio, redondeado; sin ahorro, sin insignia); la insignia «Most popular» se centra con `start-1/2` y el `translate` se invierte en RTL (`rtl:translate-x-1/2`).
- **signup-01:** el formulario (con el `h1`) va antes que el `aside` (con su `h2`) en el DOM; a la vista sigue a la izquierda (`order-first`).
- **`example.com`** en los datos de ejemplo: `otp-01` (`a••••@example.com`), `settings-01` (prefijo `example.com/`), `login-02` (`name@example.com`) y el mensaje de `signup-01` (`name@example.com`). Antes, `company.com` y `mimi.dev`, dominios reales.
- **`<main>` y `<header>`:** la página de cada Block (plantilla `BlockDoc`) y la spec 4 dicen que ningún Block pone `<main>` y que el `<header>` de un Block pasa a ser el «banner» si la app no envuelve la ruta en `<main>`.

**Pruebas:** `pricing-01.spec.ts` (+2: el ahorro calculado con otros planes y sin ahorro; las clases de la insignia en RTL), `signup-01.spec.ts` (+1: el `h1` antes del `h2` y `order-first`), `block-pages.spec.ts` (la nota de `<main>` en cada página) e `imports.spec.ts` (+1, alarma: ninguna plantilla de Block tiene `<main>`). Los Blocks: 57 en verde; páginas y vista previa: 19.

Commit: `fix(blocks): menores de la revisión (tipos, «−17%» calculado, RTL, orden de encabezados, example.com, nota de <main>)`.

## Punto 8: tareas de mantenimiento (registradas, sin hacer)

- **M.21** Switch con una entrada `aria-describedby` (y quitar el rodeo de `settings-01`, que busca `[role="switch"]` en un `afterEveryRender`).
- **M.22** Hash de `blocks.css` en el sitio (sale sin hash: la caché del navegador puede servir la vieja después de un despliegue).

Las dos en `docs/plan/mantenimiento.md`, con su origen, opciones y criterios de hecho, y en el índice de `docs/plan.md`. La nota de Tabs (un `style="flex-direction:…"` estático en `<mimi-tabs>` ya no gana) va en el CHANGELOG de la 0.4.0, que se escribe en la puerta (abajo).

Commit: `docs(plan): M.21 (aria-describedby en Switch) y M.22 (hash de blocks.css)`.

## Puerta B.P

| Punto                           | Estado                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Spec (4, 13, 2, 12)          | 4: «Blocks» con los seis hechos, `<main>` y datos genéricos; 5: G1, M1 y M2; 10 sin cambios nuevos; 13, 2 y 12 sin cambios.                                                                                                                                                                                                                         |
| 2. CHANGELOG 0.4.0              | Escrito: «Antes de actualizar» (M.19), «Blocks», «Cambios en componentes publicados» (Tabs `orientation` y **la nota del `flex-direction` estático, que ya no gana**), «CLI» (block, M.19, G1, M1, M2, el texto del error), «Cómo actualizar desde la 0.3.0» y «Limitaciones conocidas». Sin rupturas. **La fecha la pone el usuario al publicar.** |
| 3. Showcase                     | Enlace a los Blocks en la landing (B.P-a), con prueba. README de la CLI y `x-prompt`: 42 (36 componentes + 6 Blocks). Fundamentos e Introducción no cambian.                                                                                                                                                                                        |
| 4. Registro y pruebas de la CLI | 159 en verde (`blocks.spec.ts`: 26).                                                                                                                                                                                                                                                                                                                |
| 5. `.tgz` en los escenarios     | Ver abajo: los cinco en verde.                                                                                                                                                                                                                                                                                                                      |
| 6. Presupuestos                 | CSS global 154,22 / 22,15 kB (+0,10 por el enlace de la landing; aviso 160, error 175); JS inicial 331,50 / 105,70 kB (aviso 345); `main` 135,97; `initial` 485,72; `blocks.css` 27,26 / 5,22 kB, fuera del inicial. Nada cerca de un error.                                                                                                        |
| 7. D6                           | Al día (M5 y `example.com`).                                                                                                                                                                                                                                                                                                                        |
| 8. Historial                    | `git mv docs/plan/blocks docs/historial/blocks` e índice `docs/historial/plan-blocks.md`; `docs/plan.md` («Terminado» y el historial), `docs/plan/grupo-3-blocks.md` y la M.20 al día.                                                                                                                                                              |
| 9. Release                      | **La hace el usuario:** versión 0.4.0 en `packages/cli/package.json`, fecha en el CHANGELOG, `npm publish`, etiqueta, release de GitHub, despliegue y prueba desde npm (`docs/proceso/release.md`).                                                                                                                                                 |

**Escenarios con el `.tgz` final** (la CLI de la rama empaquetada como `0.4.0` en `C:\t\b040p\`, sin el Block de prueba y **sin publicar**; proyectos nuevos con `ng new … --style=tailwind`; registro completo en `C:\t\b040p\scenarios.log`; los 33 comandos terminaron con código 0):

| Escenario                                   | Resultado                                                                                                                                                                                                                     |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1 npm, proyecto nuevo                      | `ng add` escribe `aliases.blocks` y `@source not "../.mimi"`; `ng g mimi button login-01 settings-01`; con las dos rutas, `ng build` en verde; las clases del Block en el CSS; `.mimi/base/blocks/` con los dos.              |
| S2 pnpm, proyecto nuevo                     | Lo mismo con pnpm (`login-01` y `settings-01`): `ng build` en verde y las clases en el CSS.                                                                                                                                   |
| S3 desde la 0.3.0 de npm, sin cambios       | `ng add @mimi-ng/cli@0.3.0` y `button input tabs`; con la 0.4.0: «tabs actualizado de 0.3.0 a 0.4.0», el aviso de la M.19 con la línea exacta; `ng g mimi login-01` escribe `aliases.blocks` y `blocks`; `ng build` en verde. |
| S4 desde la 0.3.0, con `tabs.ts` modificado | Tabs bloqueado con su aviso (mismo sha1 antes y después; `mimi.json` conserva 0.3.0); `ng g mimi settings-01`: «settings-01 no se agregó: necesita tabs 0.4.0, que no se actualizó»; `ng build` en verde.                     |
| S5 desde la 0.3.0 con `source(none)`        | `init` de la 0.3.0 escribió solo `@source "./app/components/ui"`; con la 0.4.0, `ng g mimi login-01` agrega `@source "./app/blocks"` y lo dice; las clases del Block en el CSS; `ng build` en verde.                          |

**Una prueba que se agotó (M.12):** en la corrida completa, con los escenarios corriendo a la vez, la última prueba de «M1» pasó de los 5 s de Vitest (crea dos proyectos y corre la CLI cuatro veces). Ese bloque tiene ahora 20 s, como la suite de Tabs; la corrida siguiente, en verde.

**`pnpm build`, `pnpm test` y `pnpm format:check` en verde** al cerrar: docs 183, ui-core 838 y CLI 159.

Commits: `ecdfc1b` «docs(blocks): puerta B.P (CHANGELOG 0.4.0, enlace en la landing, escenarios del .tgz) y Blocks al historial» **salió solo con los renombres** (`git mv` de `docs/plan/blocks/` a `docs/historial/blocks/`): el `git add` falló al nombrar `docs/plan/blocks`, que ya no existía, y el commit tomó solo lo que el `git mv` había dejado preparado. Sin `--force` no se corrige un commit subido: el resto (CHANGELOG, landing, spec, plan, el estado de B.P, el índice del historial, el tiempo de M1 y este informe) va en el commit siguiente, «docs(blocks): puerta B.P, segunda parte (CHANGELOG 0.4.0, landing, estado del cierre)».

## Pendiente del usuario

1. **Publicar la 0.4.0** (punto 9): versión en `packages/cli/package.json`, la fecha en el título del CHANGELOG («por publicar»), `npm publish`, etiqueta, release, despliegue y prueba desde npm; después, el registro en `docs/historial/plan-blocks.md`.
2. **Lo manual de la M.20** (punto 9 de la M.20): teléfonos reales, NVDA, Safari y Firefox en cada Block y en Tabs vertical.
3. **Revisar** que el CHANGELOG cuenta lo que quieres contar (sobre todo la nota de Tabs y la de `otp-01`).

## Por qué usé `node -e` y `sed -i` en la B.1 y la B.2 (pregunta del usuario)

**La herramienta de edición no falló con ningún archivo.** Fue una elección mía, por comodidad, y equivocada: para `angular.json` quise cambiar dos arrays de `styles` a la vez y lo hice con un `JSON.parse`/`stringify` en `node -e`; para `build.mjs` y para reescribir una prueba entera de `block-preview-page.spec.ts` usé `node -e` por el mismo motivo; y `sed -i` para cambiar un comentario de una línea en `blocks.spec.ts`. Todo eso se podía hacer con la herramienta de archivos (como se hizo después). En esta sesión no lo repetí: los archivos del repo se editaron solo con la herramienta de archivos; `node -e` y redirecciones de la terminal solo tocaron archivos fuera del repo (los proyectos de prueba en `C:\t\` y el script de empaquetado del directorio temporal).
