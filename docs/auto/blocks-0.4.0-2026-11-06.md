# Informe de modo autónomo: Blocks de la 0.4.0, rama `auto/blocks-0.4.0-2026-11-06`

Rama creada el 06/11/2026 (pasada la medianoche, 07/11/2026 en el reloj) desde `main` actualizado (`2814fac`, la fusión del PR #7; `docs/plan/blocks/` con las nueve tareas, comprobado antes de crearla), sin upstream hacia `main`. `node -v`: **v24.18.0**. `git config user.email`: la dirección noreply del autor.

Pedido: ejecutar B.1 → B.2 → B.3 → B.4 → B.5 → B.10 → B.6 → B.7 → B.P según «Modo autónomo» de `CLAUDE.md`, con un commit por tarea y la medición del bundle en cada una, y parar en la puerta B.P (o antes, si se cumple una condición de parada). Sin subir la versión ni publicar. Las 20 preguntas de «Blocks 0.4.0» las **decidió el usuario** en el prompt (adopta las recomendaciones; la B.3-a con un degradado neutro provisional): están en cada tarea como «Decidido por el usuario (07/11/2026…)» y en `docs/auto/decisiones-por-defecto.md`, «Decididas por el usuario: Blocks 0.4.0»; salieron del índice de `docs/plan/decisiones.md`.

## Pendiente del usuario

1. **Diseños que faltan** (no bloquearon, decidido por el usuario): la página de un Block en el sitio y el marco de la vista previa (B.1, en D6); los estados de error de `login-01` (B.2); la imagen de `login-02` (B.3); el estado «válido» de un campo (B.4). Cada uno está en `docs/design/correcciones-pendientes.md` con lo que se hizo.
2. **Comprobaciones manuales** (van a la M.20 en la B.P): la vista previa en un teléfono real (que el `iframe` no haga scroll doble) y en Safari (el `iframe` con `100dvh`) (B.1); `login-01` con el gestor de contraseñas del navegador (rellena y ofrece guardar), NVDA (errores y alerta anunciados), un teléfono real a 360 px y claro/oscuro en un navegador real (B.2); `login-02`: contraste del testimonio sobre una imagen real clara y otra oscura, un teléfono real con el teclado abierto (el banner de 200 px no debe tapar el formulario) y el gestor de contraseñas (B.3); `signup-01`: NVDA (mensajes, nivel del medidor y la nota del botón), el gestor de contraseñas (que proponga una nueva) y un teléfono real (B.4); `otp-01`: autocompletar el código desde un SMS en iOS y en Android (`one-time-code`), NVDA y un teléfono real (B.5); Tabs vertical con NVDA (que anuncie «vertical» y las flechas ↑/↓) (B.10); `settings-01`: NVDA (pestañas verticales, interruptores con descripción, barra de cambios), un teléfono real (píldoras desplazables con el dedo, teclado virtual sobre la barra de cambios) y claro/oscuro en un navegador real (B.6); `pricing-01`: NVDA (interruptor y características incluidas o no), Firefox y Safari (el borde), un teléfono real y movimiento reducido en el sistema (B.7).
3. **Imagen de `login-02`** (B.3-a): hoy un degradado neutro provisional; pedir la imagen o una ilustración en Claude Design (D6).

## Tabla acumulada del sitio

Medición de partida (06/11/2026, después de la M.13, comprobada al empezar la B.1 con `pnpm build:docs`): CSS global 153,15 / 22,00 kB; JS inicial 330,16 / 104,57 kB; `main` 135,40 kB; `initial` 483,32 kB. Crudo / gzip (salida de `apps/docs/scripts/check-initial-js.mjs`); `main` e `initial`, crudos, de `ng build`. `blocks.css` es la hoja de la vista previa (B.1-h), que no cuenta en el inicial.

| Tarea   | CSS global (kB) | JS inicial (kB) | `main` (kB) | `initial` (kB) | `blocks.css` (kB) |
| ------- | --------------- | --------------- | ----------- | -------------- | ----------------- |
| Partida | 153,15 / 22,00  | 330,16 / 104,57 | 135,40      | 483,32         | —                 |
| B.1     | 153,39 / 22,05  | 330,69 / 104,78 | 135,93      | 484,08         | 0,06 / 0,08       |
| B.2     | 153,39 / 22,05  | 330,71 / 104,78 | 135,93      | 484,10         | 8,26 / 2,10       |
| B.3     | 153,39 / 22,05  | 331,42 / 105,69 | 135,97      | 484,81         | 14,78 / 3,09      |
| B.4     | 153,39 / 22,05  | 331,42 / 105,69 | 135,97      | 484,81         | 16,18 / 3,34      |
| B.5     | 153,39 / 22,05  | 331,42 / 105,69 | 135,97      | 484,81         | 17,80 / 3,66      |
| B.10    | 154,12 / 22,14  | 331,42 / 105,69 | 135,97      | 485,54         | 17,80 / 3,66      |
| B.6     | 154,12 / 22,14  | 331,50 / 105,71 | 135,97      | 485,62         | 24,13 / 4,64      |
| B.7     | 154,12 / 22,14  | 331,50 / 105,70 | 135,97      | 485,62         | 27,08 / 5,17      |

## B.1 Ítems de tipo `block` en el registro, en la CLI y en el showcase

**Estado:** `[x]`, pendiente de comprobación manual (teléfono real y Safari, a la M.20).

### Plan breve

1. Spike del CSS (B.1-h) antes de nada: un Block de prueba con clases únicas, `blocks.css` con `inject: false` y `@source not` en `styles.css`; comprobar que el CSS global no cambia y que las clases salen solo en la hoja nueva. Si falla, plan B (medir y aceptar el aviso).
2. CLI: `type: 'block'`, destino `aliases.blocks` (por defecto, hermana de `components/`), `mimi.json → blocks`, bases en `.mimi/base/blocks/`, aviso propio de Block bloqueado y de `--overwrite`, el `x-prompt` con los Blocks después de los componentes, `init` escribe `aliases.blocks`, el build copia `ui-core/src/lib/blocks/`.
3. Pruebas: `blocks.spec.ts` con un Block de prueba que no va en el registro publicado (copia de `dist/` con el Block agregado); `registry.spec.ts` y `imports.spec.ts` con las reglas de los Blocks.
4. Showcase: ruta `/preview/blocks/:name` sin el shell, `BLOCK_PREVIEWS`, `BlockFrame` (iframe, ancho, modo, estado) y `BlockDoc` (plantilla de página); sección «Blocks» en `DOCS_NAV` con los seis en `pending`.
5. Prueba real con el Block de prueba empaquetado aparte, npm y pnpm, sobre proyectos de la 0.3.0 sin `aliases.blocks`.
6. Spec 4, 5 y 10; README de la CLI; D6; plan y decisiones.

### Spike B.1-h: superado

Con `packages/ui-core/src/lib/blocks/spike/spike.ts` (clases `tracking-[0.123em]`, `md:p-[37px]`, `max-w-[431px]`, `bg-primary`, `dark:bg-card`, `shadow-card`, `rounded-card`, `animate-[mimi-spin_1s_linear_infinite]`) y `pnpm ng build docs`:

- El CSS global quedó **idéntico** (mismo hash, `styles-DVIUDKMC.css`, 153,15 kB): ninguna de las clases únicas está en él.
- `dist/docs/browser/blocks.css` (2,40 kB con el spike) tiene todas, en `@layer utilities`, con `dark:` y `md:` bien resueltos, los tokens del tema por `var(--mimi-…)` (`@reference` del tema: no vuelve a emitir sus variables) y las `@property` que necesitan.
- El build no le pone hash (`blocks.css`) ni la enlaza en `index.html` (`inject: false`): la agrega la vista previa.

El archivo del spike se borró. Que un Block real «se vea igual con las dos hojas» se comprueba con el primer Block (B.2). Límite conocido, anotado en la spec 10: una utilidad que está en las dos hojas gana, en la vista previa, a una variante responsiva que solo está en el CSS global, si las dos van en el mismo elemento.

### Criterios de hecho

- **`type: 'block'` en el registro con la regla de B.1-a, y pruebas de la CLI en verde.** `packages/cli/src/blocks.spec.ts` (11 pruebas): copia a `src/app/blocks` y sus componentes a `components/ui`, con bases en `.mimi/base/blocks/` y clave en el manifiesto; `aliases.blocks` propio; proyecto de la 0.3.0 sin `aliases.blocks` (un componente solo no lo escribe; el primer Block sí); otra carpeta de componentes (la de Blocks es su hermana); idempotente; versión anterior sin cambios (se actualiza); Block modificado (no se toca, con su aviso exacto); Block bloqueado con sus componentes actualizados; componente del Block bloqueado (bloquea el Block); `--overwrite` (reemplaza y avisa que reemplazó la pantalla); sugerencia del nombre. `registry.spec.ts`: el `x-prompt` es componentes + Blocks, el README lista los dos, un Block solo tiene archivos en `blocks/<nombre>/` y solo depende de componentes y utils. `imports.spec.ts` (ui-core): nadie importa `@/blocks…` y un Block solo importa `@/components/ui/…`. `pnpm test:cli`: **144 pruebas en verde**.
- **Prueba real en un proyecto limpio con el Block de prueba empaquetado aparte, npm y pnpm, proyecto de la 0.3.0, Block modificado, componente modificado.** Tres `.tgz` de prueba (`0.4.0-b1a`, `-b1b`, `-b1c`, con el Block de prueba agregado a las plantillas y al registro; `C:\t\b040\`) sobre copias de los proyectos de la 0.3.0 de la G2.P (`C:\t\r030\app-npm` y `app-pnpm`, sin `aliases.blocks`), reinstalados con `npm ci` / `pnpm install --frozen-lockfile`. Con **npm y con pnpm**: (1) `ng g mimi test-block` copia `src/app/blocks/test-block/` y `.mimi/base/blocks/test-block/`, escribe `"blocks": "src/app/blocks"` en `aliases` y `blocks` en `mimi.json`, da la línea de las rutas; `ng build` en verde. (2) Block modificado + CLI b1b: no se toca (mismo sha1 antes y después), con el aviso de B.1-b; `mimi.json` conserva `0.4.0-b1a`. (3) Block sin cambios, Button modificado + CLI b1c, `ng g mimi test-block input`: Button bloqueado con su aviso, «test-block no se actualizó a 0.4.0-b1c: necesita button 0.4.0-b1c…», `input` pasa a `0.4.0-b1c`; `ng build` en verde. Registros: `C:\t\b040\npm.log` y `C:\t\b040\pnpm.log`. (Los proyectos de la 0.3.0 no tienen la línea de la M.19, y `ng g mimi` avisó de ella como debe.)
- **Sección «Blocks», ruta de vista previa sin el shell, selector de ancho y modo oscuro dentro del `iframe`, con pruebas.** `preview/block-preview-page.spec.ts` (6): muestra el Block con su título y carga `blocks.css` una sola vez; `?state=` pasa las entradas; nombre desconocido; `?theme=dark`; sigue el evento `storage`; `App` sin header, menú móvil, `main` ni salto al contenido en `/preview/…`, y con ellos en otra ruta. `pages/docs/blocks/block-frame.spec.ts` (5): `src` y `title` del `iframe` y enlace a la pestaña; ancho móvil 375 px; estado en la URL; sin estados no hay selector; el modo va en el `<html>` del iframe y no en el del sitio. La sección «Blocks» está en `DOCS_NAV` con los seis en `pending` (las pruebas de rutas y de la barra lateral siguen en verde).
- **Spike del CSS con su resultado; CSS global, JS inicial y `main`, antes y después.** Arriba y en la tabla. JS inicial +0,53 kB (el `@if` y la suscripción al router en `App`). Con `NgComponentOutlet` subía 2,87 kB (más de 1 kB): `NgComponentOutlet` vive en `@angular/common`, que va en el chunk inicial; se cambió por `ViewContainerRef.createComponent` y quedó en +0,53. CSS global +0,24 kB (las clases de la plantilla de página y del marco, que son del sitio).
- **Spec 4, 5 y 10; README de la CLI; D6.** Spec 4 «Blocks» (cómo es un Block), spec 5 (pasos 2, 4, 5, 6, «Blocks y todo o nada», `mimi.json`, `registry.json`, prueba de consistencia), spec 10 (rutas, alias `@/blocks/*`, sección «Blocks»: iframe, hoja aparte, JS). README de la CLI: sección «Blocks» (la lista de Blocks se llena con cada uno). D6: «Blocks: la página del sitio».
- **`pnpm build`, `pnpm test` y `pnpm format:check` en verde.** `pnpm build` en verde (sin avisos de presupuesto); `pnpm test`: docs 175, ui-core 775 y CLI 144 en verde; `pnpm format` y `pnpm format:check` en verde (antes del commit).
- **Manual (a la M.20 en la B.P):** NO COMPROBADO (manual, usuario): la vista previa en un teléfono real y en Safari.

### Revisión crítica

- **Alcance:** sin Blocks reales (son B.2 a B.7). La plantilla `BlockDoc` y `BLOCK_PREVIEWS` se prueban de verdad con el primero.
- **Compatibilidad:** `ng g mimi` sigue igual para los componentes; el único cambio visible es el texto del error de nombre desconocido («no es un componente ni un Block de Mimi»). `init` escribe una clave nueva en `mimi.json` (`aliases.blocks`); una CLI 0.3.0 la ignora. No es RUPTURA.
- **Riesgos:** en la vista previa, la cascada entre las dos hojas (límite anotado en la spec 10). `blocks.css` sin hash: un despliegue nuevo puede servir la hoja vieja de la caché del navegador hasta que caduque (Cloudflare la sirve con la caché por defecto de los estáticos); si molesta, se cambia el `href` con la versión de la CLI.
- **Accesibilidad:** el `iframe` lleva `title`; los selectores son `mimi-toggle-group` con nombre. Falta la pasada manual.
- **Privacidad:** nada.

### Alertas para el revisor

- **Reglas de edición que no cumplí:** edité `angular.json`, `packages/cli/scripts/build.mjs` y `apps/docs/src/app/preview/block-preview-page.spec.ts` con `node -e` (un solo archivo cada vez) y un comentario de `packages/cli/src/blocks.spec.ts` con `sed -i`. `CLAUDE.md` pide la herramienta de archivos para eso. Revisé el resultado de cada uno con `git diff`; desde ahí volví a la herramienta de archivos.
- **Script de la misma edición en muchos archivos** (permitido: 9 archivos, la misma edición): marcar las 20 preguntas como decididas. Texto completo, guardado fuera del repo:

  ```js
  // Marca como decididas por el usuario (07/11/2026) las 20 preguntas de «Blocks 0.4.0».
  // La misma edición en 9 archivos; falla sin escribir nada si un archivo no tiene lo esperado.
  import { readFileSync, writeFileSync } from 'node:fs';

  const OLD = 'PENDIENTE DE DECIDIR (';
  const NEW =
    'Decidido por el usuario (07/11/2026: adopta la recomendación; era PENDIENTE DE DECIDIR) (';
  const expected = {
    'docs/plan/blocks/B.1.md': 10,
    'docs/plan/blocks/B.10.md': 1,
    'docs/plan/blocks/B.3.md': 2,
    'docs/plan/blocks/B.4.md': 1,
    'docs/plan/blocks/B.5.md': 1,
    'docs/plan/blocks/B.6.md': 2,
    'docs/plan/blocks/B.7.md': 1,
    'docs/plan/blocks/B.P.md': 1,
    'docs/plan/grupo-3-blocks.md': 1,
  };
  const out = {};
  for (const [file, count] of Object.entries(expected)) {
    const text = readFileSync(file, 'utf8');
    const found = text.split(OLD).length - 1;
    if (found !== count)
      throw new Error(`${file}: ${found} en vez de ${count}; no se escribió nada`);
    out[file] = text.split(OLD).join(NEW);
  }
  for (const [file, text] of Object.entries(out)) writeFileSync(file, text);
  console.log(`${Object.keys(out).length} archivos`);
  ```

  `git diff --stat` después del script (antes de Prettier): `B.1.md` 20 (10+/10−), `B.10.md` 2, `B.3.md` 4, `B.4.md` 2, `B.5.md` 2, `B.6.md` 4, `B.7.md` 2, `B.P.md` 2, `grupo-3-blocks.md` 2; 9 archivos, 20 inserciones y 20 borrados. Comprobación de solo lectura: `grep -c "PENDIENTE DE DECIDIR ("` da 0 en los nueve y `grep -c "Decidido por el usuario (07/11/2026: adopta"` da 10, 1, 2, 1, 1, 2, 1, 1 y 1. Después, a mano (herramienta de archivos): la precisión de la B.3-a (en la misma línea que el script ya había cambiado) y el estado de la B.1 (dos líneas). `git diff --stat` después de Prettier: `B.1.md` 24 (12+/12−: las 10 del script y las 2 del estado), los otros ocho igual que antes; 9 archivos, 22 inserciones y 22 borrados. Prettier no cambió nada de lo que hizo el script.

### Archivos

Nuevos: `apps/docs/src/blocks.css`, `apps/docs/src/app/preview/block-previews.ts`, `apps/docs/src/app/preview/block-preview-page.ts`, `apps/docs/src/app/preview/block-preview-page.spec.ts`, `apps/docs/src/app/pages/docs/blocks/block-doc.ts`, `apps/docs/src/app/pages/docs/blocks/block-frame.ts`, `apps/docs/src/app/pages/docs/blocks/block-frame.spec.ts`, `packages/cli/src/blocks.spec.ts`, `packages/cli/src/testing/test-block.ts`, `docs/auto/blocks-0.4.0-2026-11-06.md`.

Modificados: `angular.json`, `tsconfig.base.json`, `apps/docs/src/styles.css`, `apps/docs/src/app/app.html`, `apps/docs/src/app/app.ts`, `apps/docs/src/app/app.routes.ts`, `apps/docs/src/app/layout/docs-nav.ts`, `packages/cli/README.md`, `packages/cli/scripts/build.mjs`, `packages/cli/src/registry.ts`, `packages/cli/src/registry.spec.ts`, `packages/cli/src/init/index.ts`, `packages/cli/src/init.spec.ts`, `packages/cli/src/ui/index.ts`, `packages/cli/src/ui/schema.json`, `packages/cli/src/ui.spec.ts`, `packages/cli/src/utils/project.ts`, `packages/cli/src/utils/write-files.ts`, `packages/cli/src/testing/harness.ts`, `packages/ui-core/src/lib/imports.spec.ts`, `docs/spec.md`, `docs/plan.md`, `docs/plan/decisiones.md`, `docs/plan/blocks/B.1.md` (y B.3, B.4, B.5, B.6, B.7, B.10, B.P, por las decisiones), `docs/plan/grupo-3-blocks.md`, `docs/auto/decisiones-por-defecto.md`, `docs/design/correcciones-pendientes.md`.

Commit: `feat(cli): ítems de tipo block en el registro, la CLI y el showcase, con la vista previa en iframe y blocks.css aparte (B.1)`.

## B.2 `login-01`

**Estado:** `[x]`, pendiente de comprobación manual (gestor de contraseñas, NVDA, teléfono real, navegador real; a la M.20).

### Plan breve

El Block en `packages/ui-core/src/lib/blocks/login-01/` (`login-01.ts`, `login-01.html`, `index.ts`) con `mimi-card`, `mimi-form-field`, `input[mimiInput]`, `mimi-password`, `mimi-checkbox`, `button[mimiBtn]` y `mimi-separator`; un `form()` de Signal Forms (`required` y `email` en el correo, `required` en la contraseña); API mínima (`loading`, `error`, `forgotHref`, `signupHref`, `submitted`, `provider`, `class`); textos en inglés; íconos de Lucide en línea; error de credenciales derivado de los tokens de error. Ítem `login-01` en el registro, `x-prompt` y README; página `/docs/blocks/login-01` con `BlockDoc` y la vista previa con los estados «Cargando» y «Con error». Comprobación visual con Chrome sin interfaz y la segunda mitad del spike B.1-h.

### Criterios de hecho

- **El Block en ui-core, en el registro y en el sitio, con los estados del diseño y los agregados.** `packages/ui-core/src/lib/blocks/login-01/`; ítem `login-01` (`type: block`, peer `@angular/forms`, `registryDependencies`: button, card, checkbox, form-field, input, password, separator y `utils/cn`), en el `x-prompt` como «login-01 (Block)» y en el README de la CLI; página `/docs/blocks/login-01` (`ready` en `DOCS_NAV`). Estados: normal, cargando (giro y «Signing in…»), error de credenciales y campos inválidos (estos dos, sin diseño), claro y oscuro, escritorio y móvil. Capturas (Chrome sin interfaz, emulando el ancho por CDP: la ventana no baja de 500 px): escritorio oscuro, móvil 375 px claro con error y la página del sitio con el marco; coinciden con el diseño (tarjeta de 400 px con trama en escritorio; sin tarjeta, a todo el ancho y con las redes apiladas en móvil).
- **Pruebas.** `login-01.spec.ts` (9): envía el valor con un formulario válido; inválido no envía, marca `aria-invalid`, muestra el mensaje y lleva el foco al correo; correo mal escrito; «recordarme» en el valor; `loading` (texto, `aria-busy`, `aria-disabled`, giro `aria-hidden`, no reenvía, `data-state`); `error` en el `role="alert"` que existe siempre; `provider` con cada red; un `h1` que nombra el formulario, la etiqueta de la contraseña y los enlaces; `class` del usuario gana con `cn()`. `login-01-page.spec.ts`: secciones, `iframe`, comando, componentes, los tres archivos reales y los estados de `BLOCK_PREVIEWS`.
- **`ng g mimi login-01` en un proyecto limpio: copia el Block y sus siete componentes, compila y se ve igual que en el sitio.** Proyecto nuevo con `npx @angular/cli@22 new app --style=tailwind` (`C:\t\b040\clean\app`, npm), CLI empaquetada del repo (`0.4.0-real.2`, sin el Block de prueba), `ng add` y `ng g mimi login-01`: copia `src/app/blocks/login-01/` (3 archivos) y los siete componentes con sus utils, instala `@angular/cdk` (lo pide Password), `mimi.json` con `aliases.blocks` (de `init`) y `blocks.login-01`, y la línea de las rutas. Con la ruta `{ path: 'login', component: Login01 }`, `ng build` en verde (440,20 kB iniciales) y `ng serve` muestra la pantalla igual que en el sitio (con la fuente del sistema: Outfit solo la carga el sitio).
- **CSS global y JS inicial, crudo y gzip, antes y después (con B.1-h).** CSS global sin cambios (153,39 / 22,05 kB): las clases del Block van en `blocks.css` (8,26 / 2,10 kB). JS inicial 330,69 → 330,71 kB (+0,02), `main` igual (135,93). **Spike B.1-h, segunda mitad: superada.** Con el servidor de desarrollo, se compararon los estilos calculados (24 propiedades) de los 47 elementos del Block con las dos hojas y con una sola (el CSS global sin el `@source not` y sin `blocks.css`), a 1280 y a 375 px: idénticos.
- **D6.** «login-01 (B.2)»: error de credenciales y campos inválidos sin diseño, contraseña con `mimi-password`, logotipos, separador con texto, botón principal, textos en inglés y la máscara de la trama.
- **`pnpm build`, `pnpm test` y `pnpm format:check` en verde.** Build sin avisos; docs 176, ui-core 784 y CLI 144 pruebas en verde; formato correcto.
- **Manual (a la M.20):** NO COMPROBADO (manual, usuario): gestor de contraseñas, NVDA, teléfono real a 360 px, claro y oscuro en un navegador real.

### Revisión crítica

- **Accesibilidad:** el botón de enviar usa `aria-disabled` (sigue enfocable) mientras carga; el error de servidor está en un `role="alert"` que existe siempre (vacío no ocupa lugar: `empty:hidden`). «Remember me» con `<label for>` hacia el botón de `mimi-checkbox`.
- **Alcance:** en la vista previa del sitio, los mensajes de error van en inglés: la página de vista previa provee `MIMI_ERROR_MESSAGES_EN` (el sitio da los de español en `app.config`).
- **Bundle:** sin cambios en el inicial; la página y el Block son diferidos.
- **Regla de edición que no cumplí:** para la comparación de una sola hoja, quité y repuse una línea de `apps/docs/src/styles.css` con `grep … >` desde la terminal; quedó idéntico (`git diff` vacío) y no entra en el commit.

### Archivos

Nuevos: `packages/ui-core/src/lib/blocks/login-01/login-01.ts`, `login-01.html`, `index.ts`, `login-01.spec.ts`; `apps/docs/src/app/pages/docs/blocks/login-01-page.ts` y `login-01-page.spec.ts`.

Modificados: `packages/cli/src/registry.json`, `packages/cli/src/ui/schema.json`, `packages/cli/README.md`, `apps/docs/src/app/preview/block-previews.ts`, `apps/docs/src/app/preview/block-preview-page.ts`, `apps/docs/src/app/pages/docs/docs.routes.ts`, `apps/docs/src/app/layout/docs-nav.ts`, `docs/design/correcciones-pendientes.md`, `docs/plan.md`, `docs/plan/blocks/B.2.md`, `docs/auto/blocks-0.4.0-2026-11-06.md`.

Commit: `feat(blocks): login-01, inicio de sesión centrado con Signal Forms (B.2)`.

## B.3 `login-02`

**Estado:** `[x]`, pendiente de comprobación manual (contraste del testimonio sobre imágenes reales, teléfono con el teclado abierto, gestor de contraseñas; a la M.20).

### Plan breve

El Block en `packages/ui-core/src/lib/blocks/login-02/` con el esqueleto de envío de `login-01` (Signal Forms, foco al primer error, `role="alert"`, `aria-busy`); la columna de la imagen (banner de 200 px con las esquinas inferiores redondeadas en móvil, la mitad derecha desde `md`), el testimonio en vidrio (`figure`, `blockquote`, `figcaption`, `mimi-avatar`), `imageSrc`/`imageAlt` y, sin imagen, el degradado neutro provisional (B.3-a, precisión del usuario). Registro, `x-prompt`, README, página y vista previa con los estados «Con imagen», «Cargando» y «Con error».

### Decisiones aplicadas

- **B.3-a (decidido por el usuario, con una precisión):** sin `imageSrc`, un degradado neutro con tokens (`bg-linear-to-br from-secondary via-muted to-accent`), con el comentario «PROVISIONAL (B.3-a)» en la plantilla y en D6. El estado «Con imagen» de la vista previa usa una ilustración del sitio (`/avatars/avatar-2.svg`, original de Mimi): el Block no trae imágenes.
- **B.3-b (decidido por el usuario):** las iniciales con `mimi-avatar` (y `mimi-avatar-fallback` con `bg-info-soft`, como el diseño).
- La contraseña es un `input[mimiInput]` como en el diseño (sin el ojo ni `mimi-password`): así el Block no trae `@angular/cdk`.

### Criterios de hecho

- **El Block en ui-core, en el registro y en el sitio, con los estados.** Ítem `login-02` (peer `@angular/forms`; `registryDependencies`: avatar, button, form-field, input, `utils/cn`), `x-prompt` «login-02 (Block)», README; página `/docs/blocks/login-02` (`ready`). Capturas (Chrome sin interfaz, CDP): escritorio claro sin imagen (el degradado se ve muy suave en claro), escritorio oscuro con imagen y vidrio legible, móvil 375 px con el banner arriba y el error. Coinciden con el diseño.
- **Pruebas.** `login-02.spec.ts` (8): envío válido; inválido con foco al correo; `loading`; `error`; `sso`; sin `imageSrc` el degradado `aria-hidden` y con `imageSrc` la imagen con `alt=""` por defecto y el `imageAlt` del usuario; el testimonio en `figure` con `blockquote`, `figcaption` y el avatar; un `h1`; `class`. Las páginas de los Blocks pasan a una prueba con una fila por Block (`block-pages.spec.ts`, reemplaza a `login-01-page.spec.ts`), que además exige que cada Block de `BLOCK_PREVIEWS` tenga página, ruta y su ítem `ready` en el menú.
- **`ng g mimi login-02` en un proyecto limpio.** En el mismo proyecto de la B.2 (`C:\t\b040\clean\app`), con la CLI reempaquetada (`0.4.0-real.3`): agrega avatar y los tres archivos del Block (lo demás ya estaba igual a la plantilla), la línea de las rutas; con las dos pantallas en las rutas, `ng build` en verde (454,39 kB iniciales).
- **CSS global y JS inicial, antes y después.** CSS global sin cambios (153,39 / 22,05 kB); `blocks.css` 8,26 → 14,78 kB (3,09 gzip). JS inicial 330,71 → **331,42 kB** (+0,71; gzip 104,78 → 105,69) y `main` 135,93 → 135,97. **Reparto de chunks:** el JS inicial pasó de 3 a 4 archivos: el optimizador sacó del chunk inicial grande (194,06 → 179,68 kB) el código de `@angular/platform-browser` (el `EventManager` y el renderizador del DOM) a un chunk inicial propio de 15,07 kB, porque ahora lo comparten más chunks diferidos. No entró código nuevo; el neto (+0,71 kB) es menor que 1 kB.
- **D6.** «login-02 (B.3)»: la imagen provisional, el error sin diseño, el avatar, el vidrio con «reducir transparencia», el corte en `md` y los textos.
- **`pnpm build`, `pnpm test` y `pnpm format:check` en verde.** Build sin avisos; docs 178, ui-core 792 y CLI 144 pruebas; formato correcto.
- **Manual (a la M.20):** NO COMPROBADO (manual, usuario): contraste sobre imágenes reales claras y oscuras, teléfono real con el teclado abierto, gestor de contraseñas.

### Revisión crítica

- El degradado provisional en claro casi no se distingue del fondo `muted` (los tres tokens son grises muy cercanos). Es «neutro» como se pidió; si se quiere más contraste, se decide con la imagen del diseño.
- En la comprobación, un servidor de desarrollo viejo (el `TaskStop` no detiene el `ng serve` hijo de `pnpm dev`) servía un `blocks.css` sin las clases del Block nuevo: la hoja `inject: false` no se regenera con archivos nuevos en modo vigilancia. Con el servidor reiniciado, todo bien. Desde aquí, el servidor se detiene por puerto (`Stop-Process`) y se reinicia en cada Block.

### Archivos

Nuevos: `packages/ui-core/src/lib/blocks/login-02/login-02.ts`, `login-02.html`, `index.ts`, `login-02.spec.ts`; `apps/docs/src/app/pages/docs/blocks/login-02-page.ts`, `block-pages.spec.ts`. Borrado: `apps/docs/src/app/pages/docs/blocks/login-01-page.spec.ts`.

Modificados: `packages/cli/src/registry.json`, `packages/cli/src/ui/schema.json`, `packages/cli/README.md`, `apps/docs/src/app/preview/block-previews.ts`, `apps/docs/src/app/pages/docs/docs.routes.ts`, `apps/docs/src/app/layout/docs-nav.ts`, `docs/design/correcciones-pendientes.md`, `docs/plan.md`, `docs/plan/blocks/B.3.md`, `docs/auto/blocks-0.4.0-2026-11-06.md`.

Commit: `feat(blocks): login-02, inicio de sesión en dos columnas con imagen y testimonio (B.3)`.

## B.4 `signup-01`

**Estado:** `[x]`, pendiente de comprobación manual (NVDA, gestor de contraseñas, teléfono real; a la M.20).

### Plan breve

El Block con la columna de beneficios (escritorio) y el formulario: nombre, correo de trabajo, `mimi-password` con el medidor, confirmación y términos, en un `form()` de Signal Forms con `required`, `minLength(2)`, `email` más el dominio, «fuerte» (las cuatro reglas), «coinciden» y términos aceptados. Mensajes al salir del campo (B.4-a), mensajes de «válido» propios del Block, botón con `aria-disabled` y la nota de lo que falta, `loading` y `error`. Registro, `x-prompt`, README, página y vista previa.

### Decisiones y desvíos

- **B.4-a (decidido por el usuario):** al salir del campo; una vez tocado, cambia mientras se escribe. Mimi muestra el error también con `dirty`, así que el Block pasa `[showError]="touched && invalid"` a cada campo (la entrada `showError` de Input, publicada).
- **Una sola lista de reglas:** el Block arma las cuatro reglas de Password con los textos de `MIMI_PASSWORD_TEXT`, se las pasa a `mimi-password` (`[rules]`) y las usa con `mimiPasswordLevel` para el validador de «fuerte»: no repite la heurística.
- **El dominio del correo:** el validador `email` de Angular acepta `ana@empresa`; el Block agrega uno que pide un punto en el dominio (como el diseño), con el mismo mensaje.
- **Los términos** van en un `mimi-form-field` para que se vea su error al pulsar el botón incompleto.
- **Estados de la vista previa:** «Cargando» y «Con error». «Vacío», «con errores» y «completo» se ven escribiendo en la vista previa (el Block no tiene entradas para fijar el valor del formulario: API mínima, B.1-e). Las capturas de abajo los muestran con valores escritos por CDP.

### Criterios de hecho

- **El Block en ui-core, en el registro y en el sitio.** Ítem `signup-01` (peer `@angular/forms`; button, checkbox, form-field, input, password, `utils/cn`), `x-prompt`, README; página `/docs/blocks/signup-01` (`ready`). Capturas: escritorio claro con nombre válido, correo sin dominio, contraseña media, confirmación distinta y la nota («Missing: a valid email, a strong password, matching passwords, accepting the terms.»); móvil oscuro vacío, sin la columna de beneficios y con el logo arriba. Coinciden con el diseño.
- **Pruebas.** `signup-01.spec.ts` (9): nombre (mensaje solo al salir, `aria-invalid`, «Looks good.» y que describe el campo); correo sin dominio y «Valid email.»; fuerza (nota y `data-level` del medidor 2 → 3); confirmación («no coinciden» y deja de decirlo en cuanto coinciden); el botón con `aria-disabled` (no `disabled`) y la nota exacta; pulsarlo incompleto marca todo, no envía y enfoca el primer error; completo («All set.», envía `{ name, email, password }`); `loading` y `error`; `autocomplete="new-password"` en las dos, un `h1` y `class`.
- **`ng g mimi signup-01` en un proyecto limpio.** En el proyecto de la B.2 con la CLI `0.4.0-real.4`: copia los tres archivos del Block (sus componentes ya estaban), con la línea de las rutas; con la ruta `signup`, `ng build` en verde (466,92 kB iniciales).
- **CSS global y JS inicial, antes y después.** Sin cambios: CSS global 153,39 / 22,05 kB, JS inicial 331,42 / 105,69 kB, `main` 135,97 kB. `blocks.css` 14,78 → 16,18 kB (3,34 gzip).
- **D6.** «signup-01 (B.4)»: el estado «válido», el color del error, cuándo aparece, los términos, el botón, «Sign in», el dominio y los textos.
- **`pnpm build`, `pnpm test` y `pnpm format:check` en verde.** Docs 179, ui-core 801 y CLI 144 pruebas; build sin avisos; formato correcto.
- **Manual (a la M.20):** NO COMPROBADO (manual, usuario): NVDA, gestor de contraseñas, teléfono real.

### Revisión crítica

- Los `aria-describedby` de «válido» se escriben una vez (valor constante): `mimi-form-field` les suma el id de su error sin que Angular los reescriba. Lo cubre la prueba del nombre.
- En las pruebas, el evento `input` tiene que burbujear (como en el navegador) para que `mimi-password` lo vea en su anfitrión.

### Archivos

Nuevos: `packages/ui-core/src/lib/blocks/signup-01/signup-01.ts`, `signup-01.html`, `index.ts`, `signup-01.spec.ts`; `apps/docs/src/app/pages/docs/blocks/signup-01-page.ts`.

Modificados: `packages/cli/src/registry.json`, `packages/cli/src/ui/schema.json`, `packages/cli/README.md`, `apps/docs/src/app/preview/block-previews.ts`, `apps/docs/src/app/pages/docs/docs.routes.ts`, `apps/docs/src/app/layout/docs-nav.ts`, `apps/docs/src/app/pages/docs/blocks/block-pages.spec.ts`, `docs/design/correcciones-pendientes.md`, `docs/plan.md`, `docs/plan/blocks/B.4.md`, `docs/auto/blocks-0.4.0-2026-11-06.md`.

Commit: `feat(blocks): signup-01, registro con medidor de contraseña y la nota de lo que falta (B.4)`.

## B.5 `otp-01`

**Estado:** `[x]`, pendiente de comprobación manual (SMS en iOS y Android, NVDA, teléfono real; a la M.20).

### Plan breve

El Block con `mimi-input-otp` (6 dígitos, separador después del tercero), el mensaje `role="status"` que describe el código, «Verify», el reenvío con cuenta regresiva (`setInterval` limpiado con `DestroyRef`) y «Use another email». `verify` una vez por código, al completar o con el botón (B.5-a); `status` de la app pinta error o éxito. En la vista previa, una demo del sitio simula la verificación.

### Decisiones y desvíos

- **B.5-a (decidido por el usuario):** al completar y con el botón, una sola vez por código (se guarda el último enviado).
- **Sin Signal Forms (desvío de la tarea, que proponía un campo con `required` y `minLength`):** el error del código lo decide la app (`status`) y se pinta con las entradas `invalid`/`touched`/`success` de Input OTP, que Signal Forms escribe cuando hay `[formField]` (no se pueden usar los dos a la vez). Un solo campo no necesita `form()`: el Block usa `[value]`/`(valueChange)` y valida la longitud al pulsar el botón. No trae `@angular/forms`.
- **`status` vale para el código enviado:** al escribir otro, vuelve a «idle» (si no, el error del código anterior quedaba pintado mientras se escribe uno nuevo).
- **`resendSeconds`:** 60 por defecto (42 en el diseño, que es un instante de la cuenta); la vista previa usa 42.
- **`autofocus`** (entrada nueva, `true` por defecto): el foco va al código solo si nadie lo tiene (no lo roba dentro de un diálogo).
- **Demo de la vista previa (`apps/docs/src/app/preview/otp-01-demo.ts`):** acepta 246810 después de 600 ms; no es parte del Block. Estado de la página: «Reenvío disponible» (`resendSeconds: 0`).

### Criterios de hecho

- **El Block en ui-core, en el registro y en el sitio.** Ítem `otp-01` (button, card, input-otp, `utils/cn`; sin peers propias), `x-prompt`, README; página `/docs/blocks/otp-01` (`ready`). Capturas: escritorio claro con un código incorrecto (casillas en error y el mensaje), móvil oscuro con 246810 (éxito, casillas de 42 × 50 px).
- **Pruebas.** `otp-01.spec.ts` (7, con temporizadores falsos): `verify` al completar y con el botón una vez por código; incompleto con el botón; `status` error y éxito y la vuelta a «idle» al cambiar el código; el mensaje describe el código; cuenta regresiva («Resend in 0:42» → «0:41» → «Resend code»), el anuncio solo al habilitarse, `resend` reinicia y vacía el código; `loading`; `changeDestination`, foco inicial, un `h1` y `class`. `otp-01-demo.spec.ts`: la demo da error con otro código y éxito con 246810.
- **`ng g mimi otp-01` en un proyecto limpio.** Con la CLI `0.4.0-real.5`: agrega input-otp y el Block; con la ruta, `ng build` en verde.
- **CSS global y JS inicial, antes y después.** Sin cambios (153,39 / 22,05 kB; 331,42 / 105,69 kB; `main` 135,97). `blocks.css` 16,18 → 17,80 kB (3,66 gzip).
- **`pnpm build`, `pnpm test` y `pnpm format:check` en verde.** Docs 181, ui-core 808 y CLI 144.
- **Manual (a la M.20):** NO COMPROBADO (manual, usuario): SMS en iOS y Android, NVDA, teléfono real.

### Archivos

Nuevos: `packages/ui-core/src/lib/blocks/otp-01/otp-01.ts`, `otp-01.html`, `index.ts`, `otp-01.spec.ts`; `apps/docs/src/app/pages/docs/blocks/otp-01-page.ts`; `apps/docs/src/app/preview/otp-01-demo.ts` y `otp-01-demo.spec.ts`.

Modificados: `packages/cli/src/registry.json`, `packages/cli/src/ui/schema.json`, `packages/cli/README.md`, `apps/docs/src/app/preview/block-previews.ts`, `apps/docs/src/app/pages/docs/docs.routes.ts`, `apps/docs/src/app/layout/docs-nav.ts`, `apps/docs/src/app/pages/docs/blocks/block-pages.spec.ts`, `docs/design/correcciones-pendientes.md`, `docs/plan.md`, `docs/plan/blocks/B.5.md`, `docs/auto/blocks-0.4.0-2026-11-06.md`.

Commit: `feat(blocks): otp-01, verificación por código con reenvío y cuenta regresiva (B.5)`.

## B.10 Tabs con orientación vertical

**Estado:** `[x]`, pendiente de comprobación manual (NVDA en vertical; a la M.20). **No es RUPTURA** (decidido por el usuario: cambio aditivo, B.10-a): entrada nueva con el valor de antes por defecto. Va al CHANGELOG de la 0.4.0 («Tabs: `orientation`»), que junta la B.P.

### Plan breve

Entrada `orientation` en `mimi-tabs`, pasada a `ngTabList` (aria pone `aria-orientation` y el teclado); las clases de cada orientación completas en TypeScript (`cva` con `compoundVariants`): `grid-rows` en vertical, el indicador con `translate-y` (barra al inicio en la subrayada, fondo en la píldora), el borde al inicio, el texto al inicio y el panel al lado (`flex-direction` en el anfitrión con un binding suelto). Spike: cambiar la orientación en vivo. Página de Tabs con dos ejemplos y la fila de la API.

### Criterios de hecho

- **`orientation` con pruebas.** `tabs-orientation.spec.ts` (5): `aria-orientation`, `data-orientation`, fila al lado del panel y filas iguales; ↑/↓ eligen, ←/→ no hacen nada, Inicio y Fin; el indicador en vertical (subrayada y píldora, `--mimi-tabs-index`); **cambio en vivo** a horizontal (←/→) y de vuelta a vertical (↑/↓), con el `tabindex="0"` solo en la elegida; horizontal por defecto. **Las 20 pruebas de antes (`tabs.spec.ts`) en verde sin tocarlas.** El spike salió bien: aria lee su `orientation` como señal y no hace falta recrear la fila.
- **Un fallo encontrado en la comprobación visual (no lo veían las pruebas):** el primer intento usaba `[style.flex-direction]` con `null` en horizontal, y Angular quitaba también el `flex-direction: column` del estilo estático del anfitrión: las pestañas de CodePreview (y cualquier Tabs horizontal) quedaban en fila. Se corrigió dando siempre un valor (`column`/`row`) y quitando `flex-direction` del estilo estático; la prueba de orientación comprueba ahora `flex-direction: column` en horizontal. Las capturas de la página de Tabs (CodePreview correcto y los dos ejemplos verticales) están en el informe de la sesión.
- **Página de Tabs al día; spec 4; D6.** Ejemplos «Vertical» (subrayada y píldora) y «Según el ancho» (vertical desde 768 px con `matchMedia`, cambia en vivo); `orientation` en la tabla de API; el teclado en «Teclado y accesibilidad»; la prueba de la página pasa de 6 a 8 ejemplos. Spec 4 (Tabs: «Vertical (B.10…)»); sin tokens nuevos (spec 13 sin cambios). D6: «Tabs vertical (B.10)».
- **CHANGELOG:** lo junta la B.P.
- **JS inicial y CSS global.** JS inicial sin cambios (331,42 / 105,69 kB; `main` 135,97). **CSS global 153,39 → 154,12 kB** (+0,73; gzip 22,05 → 22,14): las clases verticales de Tabs, que es un componente y va al CSS global (aviso 160 kB, error 175 kB).
- **`pnpm build`, `pnpm test` y `pnpm format:check` en verde.** Build sin avisos; docs 181 y CLI 144 pruebas en verde; ui-core: en la primera corrida de `pnpm test` falló una prueba de Toast que esta tarea no toca («se cierra solo; con acción, Infinity o un valor enorme, no»: `expected 3 to be 4`, temporizadores bajo carga, la inestabilidad de la M.12); `pnpm test:ui-core` repetido: **813 en verde**. Formato correcto.
- **Manual (a la M.20):** NO COMPROBADO (manual, usuario): NVDA en vertical.

### Archivos

Nuevos: `packages/ui-core/src/lib/components/tabs/tabs-orientation.spec.ts`, `apps/docs/src/app/pages/docs/components/tabs/examples/tabs-vertical.example.ts`, `tabs-responsive.example.ts`.

Modificados: `packages/ui-core/src/lib/components/tabs/tabs.ts`, `apps/docs/src/app/pages/docs/components/tabs/tabs-page.ts`, `tabs-page.html`, `tabs-page.spec.ts`, `docs/spec.md`, `docs/design/correcciones-pendientes.md`, `docs/plan.md`, `docs/plan/blocks/B.10.md`, `docs/auto/blocks-0.4.0-2026-11-06.md`.

Commit: `feat(tabs): orientación vertical, también en vivo (B.10)`.

## B.6 `settings-01`

**Estado:** `[x]`, pendiente de comprobación manual (NVDA, teléfono real, claro/oscuro en un navegador real; a la M.20).

### Plan breve

Cabecera, una sola `mimi-tabs` (vertical desde 768 px con `matchMedia`, horizontal en móvil; B.10) con íconos en `mimiTabLabel`, y las cuatro secciones: Perfil (avatar, foto, nombre, usuario con prefijo, biografía con contador, dos interruptores), Notificaciones (dos grupos), Seguridad (dos pasos, sesiones, zona de peligro) y Facturación (plan con `Intl`, asientos con Progress, tarjeta). Un `form()` de Signal Forms con el perfil y las preferencias; «con cambios» comparando con el valor de partida; Descartar y Guardar; salidas para foto, sesiones, borrar la cuenta y plan.

### Decisiones y desvíos

- **B.6-a y B.6-b (decididas por el usuario):** «Delete account» solo emite la salida; «Save» no muestra un Toast. La página del sitio muestra cómo enchufarles `injectMimiConfirm()` (tono `danger`) y `injectMimiToast()`.
- **Sin `preserveContent`:** los valores viven en el modelo de Signal Forms, así que cambiar de sección no pierde lo escrito aunque el panel se destruya; la barra cuenta todas las secciones. (La tarea lo proponía por si el formulario vivía en el panel.)
- **La navegación**, con `class` sobre Tabs (selectores sobre `[role=tab]`, indicador oculto): ver D6.
- **Descripción de los interruptores:** Switch no tiene entrada para `aria-describedby`; el Block lo pone en el botón interno después de cada render (`afterEveryRender`: el panel de una sección se crea al mostrarse, sin una señal que avise).
- **Entrada `tab`** (`model`, `[(tab)]`): la sección elegida; la vista previa la usa para los estados.
- **`maxlength` en la biografía:** no se escribe en el HTML (choca con `[formField]`; Signal Forms tiene `maxLength(160)` y el contador).
- **Un fallo de la B.10 encontrado aquí:** en vertical, las pestañas quedaban centradas: `tabVariants` daba `justify-center` y `justify-start` juntas (sin `cn()`), y ganaba la que va después en el CSS. Se corrigió en `tabs.ts` (`cn(tabVariants(…))`) con su prueba en `tabs-orientation.spec.ts`. Va en este commit; la B.10 ya estaba subida.

### Criterios de hecho

- **El Block en ui-core, en el registro y en el sitio, con las cuatro secciones.** Ítem `settings-01` (peer `@angular/forms`; avatar, badge, button, card, form-field, input, progress, separator, switch, tabs, textarea y `utils/cn`), `x-prompt`, README; página `/docs/blocks/settings-01` con los estados «Notificaciones», «Seguridad» y «Facturación». Capturas: Perfil en escritorio claro con un interruptor cambiado y la barra; Seguridad en móvil oscuro con las píldoras; Facturación en escritorio. Coinciden con el diseño.
- **Pruebas.** `settings-01.spec.ts` (11): las secciones con ↑/↓ en vertical; en móvil (con `matchMedia` simulado) horizontal con ←/→; «con cambios» aparece y desaparece al volver al valor original; un interruptor cuenta y Descartar restaura; Guardar emite y quita la barra; Guardar con un error no emite y enfoca el campo; el contador de la biografía describe el campo y no es una región viva; cada interruptor con su título y su descripción; las salidas de foto, sesiones, borrar y plan; facturación con `Intl` y la barra de asientos con su nombre; un `h1` y `class`.
- **`ng g mimi settings-01` en un proyecto limpio (trae los once componentes).** En el proyecto de la B.2 con la CLI `0.4.0-real.6`: agrega los que faltaban (badge, progress, switch, tabs, textarea; los demás ya estaban) y el Block, e instala `@angular/aria` (lo pide Tabs) en la versión exacta del cdk; con la ruta, `ng build` en verde.
- **CSS global y JS inicial, antes y después.** CSS global sin cambios (154,12 / 22,14 kB). JS inicial 331,42 → 331,50 kB (+0,08, por el `cn()` de Tabs); `main` igual. `blocks.css` 17,80 → 24,13 kB (4,64 gzip): el Block más grande, fuera del CSS global (B.1-h).
- **D6.** «settings-01 (B.6)».
- **`pnpm build`, `pnpm test` y `pnpm format:check` en verde.** Docs 182, ui-core 824 y CLI 144.
- **Manual (a la M.20):** NO COMPROBADO (manual, usuario): NVDA, teléfono real, claro y oscuro en un navegador real.

### Archivos

Nuevos: `packages/ui-core/src/lib/blocks/settings-01/settings-01.ts`, `settings-01.html`, `index.ts`, `settings-01.spec.ts`; `apps/docs/src/app/pages/docs/blocks/settings-01-page.ts`.

Modificados: `packages/ui-core/src/lib/components/tabs/tabs.ts` y `tabs-orientation.spec.ts` (el arreglo de la B.10), `packages/cli/src/registry.json`, `packages/cli/src/ui/schema.json`, `packages/cli/README.md`, `apps/docs/src/app/preview/block-previews.ts`, `apps/docs/src/app/pages/docs/docs.routes.ts`, `apps/docs/src/app/layout/docs-nav.ts`, `apps/docs/src/app/pages/docs/blocks/block-pages.spec.ts`, `docs/design/correcciones-pendientes.md`, `docs/plan.md`, `docs/plan/blocks/B.6.md`, `docs/auto/blocks-0.4.0-2026-11-06.md`.

Commit: `feat(blocks): settings-01, ajustes de cuenta con navegación lateral y barra de cambios (B.6)`.

## B.7 `pricing-01`

**Estado:** `[x]`, pendiente de comprobación manual (NVDA, Firefox y Safari, teléfono real, movimiento reducido; a la M.20).

### Plan breve

Cabecera con la insignia, el `h1` y el interruptor mensual/anual (`mimi-toggle-group` en modo simple, con el «−17%» dentro de Anual); tres tarjetas como datos (`plans`, con los del diseño por defecto), precios con `Intl.NumberFormat` (`currency`, `locale`), la nota anual, el destacado con la insignia y el borde **estático** (B.7-a), y el pie neutro.

### Decisiones y desvíos

- **B.7-a (decidido por el usuario):** borde estático (el `conic-gradient` del diseño, quieto). No hace falta movimiento reducido: no hay animación (lo prueba la spec).
- **Nombres:** `Pricing01Plan`/`Pricing01Selection` (no `MimiPricing01Plan` como decía la tarea), como `Login01Value` y los demás Blocks; con un `id` estable por plan para `planSelected`.
- **Pie neutro y precios en USD** (D6).

### Criterios de hecho

- **El Block en ui-core, en el registro y en el sitio.** Ítem `pricing-01` (badge, button, toggle-group, `utils/cn`; sin peers propias), `x-prompt`, README; página `/docs/blocks/pricing-01` con el estado «Anual». Capturas: escritorio claro en anual (tres columnas a la misma altura, el destacado con su borde e insignia) y móvil oscuro en mensual (una columna). Coinciden con el diseño.
- **Pruebas.** `pricing-01.spec.ts` (7): el periodo cambia los precios y la nota anual; `planSelected` con el plan y el periodo; «Custom» sin precio ni unidad; otro `locale` y otra moneda (`de-DE`, EUR); el destacado con la insignia, sin animación y con el degradado; cada tarjeta es una región con el nombre del plan; «Included»/«Not included» para lectores con el ícono `aria-hidden`; el interruptor con nombre, un `h1` y `class`.
- **`ng g mimi pricing-01` en un proyecto limpio.** Con la CLI `0.4.0-real.7`: agrega toggle-group y el Block; con la ruta, `ng build` en verde.
- **CSS global y JS inicial, antes y después.** Sin cambios (154,12 / 22,14 kB; 331,50 / 105,70 kB; `main` 135,97). `blocks.css` 24,13 → 27,08 kB (5,17 gzip).
- **D6.** «pricing-01 (B.7)».
- **`pnpm build`, `pnpm test` y `pnpm format:check` en verde.** Docs 183, ui-core 831 y CLI 144.
- **Manual (a la M.20):** NO COMPROBADO (manual, usuario): NVDA, Firefox y Safari, teléfono real, movimiento reducido en el sistema.

### Archivos

Nuevos: `packages/ui-core/src/lib/blocks/pricing-01/pricing-01.ts`, `pricing-01.html`, `index.ts`, `pricing-01.spec.ts`; `apps/docs/src/app/pages/docs/blocks/pricing-01-page.ts`.

Modificados: `packages/cli/src/registry.json`, `packages/cli/src/ui/schema.json`, `packages/cli/README.md`, `apps/docs/src/app/preview/block-previews.ts`, `apps/docs/src/app/pages/docs/docs.routes.ts`, `apps/docs/src/app/layout/docs-nav.ts`, `apps/docs/src/app/pages/docs/blocks/block-pages.spec.ts`, `docs/design/correcciones-pendientes.md`, `docs/plan.md`, `docs/plan/blocks/B.7.md`, `docs/auto/blocks-0.4.0-2026-11-06.md`.

Commit: `feat(blocks): pricing-01, planes con mensual/anual y el destacado con borde estático (B.7)`.
