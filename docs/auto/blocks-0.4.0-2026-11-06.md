# Informe de modo autónomo: Blocks de la 0.4.0, rama `auto/blocks-0.4.0-2026-11-06`

Rama creada el 06/11/2026 (pasada la medianoche, 07/11/2026 en el reloj) desde `main` actualizado (`2814fac`, la fusión del PR #7; `docs/plan/blocks/` con las nueve tareas, comprobado antes de crearla), sin upstream hacia `main`. `node -v`: **v24.18.0**. `git config user.email`: la dirección noreply del autor.

Pedido: ejecutar B.1 → B.2 → B.3 → B.4 → B.5 → B.10 → B.6 → B.7 → B.P según «Modo autónomo» de `CLAUDE.md`, con un commit por tarea y la medición del bundle en cada una, y parar en la puerta B.P (o antes, si se cumple una condición de parada). Sin subir la versión ni publicar. Las 20 preguntas de «Blocks 0.4.0» las **decidió el usuario** en el prompt (adopta las recomendaciones; la B.3-a con un degradado neutro provisional): están en cada tarea como «Decidido por el usuario (07/11/2026…)» y en `docs/auto/decisiones-por-defecto.md`, «Decididas por el usuario: Blocks 0.4.0»; salieron del índice de `docs/plan/decisiones.md`.

## Pendiente del usuario

1. **Diseños que faltan** (no bloquearon, decidido por el usuario): la página de un Block en el sitio y el marco de la vista previa (B.1, en D6); los estados de error de `login-01` (B.2); la imagen de `login-02` (B.3); el estado «válido» de un campo (B.4). Cada uno está en `docs/design/correcciones-pendientes.md` con lo que se hizo.
2. **Comprobaciones manuales** (van a la M.20 en la B.P): la vista previa en un teléfono real (que el `iframe` no haga scroll doble) y en Safari (el `iframe` con `100dvh`) (B.1); `login-01` con el gestor de contraseñas del navegador (rellena y ofrece guardar), NVDA (errores y alerta anunciados), un teléfono real a 360 px y claro/oscuro en un navegador real (B.2).

## Tabla acumulada del sitio

Medición de partida (06/11/2026, después de la M.13, comprobada al empezar la B.1 con `pnpm build:docs`): CSS global 153,15 / 22,00 kB; JS inicial 330,16 / 104,57 kB; `main` 135,40 kB; `initial` 483,32 kB. Crudo / gzip (salida de `apps/docs/scripts/check-initial-js.mjs`); `main` e `initial`, crudos, de `ng build`. `blocks.css` es la hoja de la vista previa (B.1-h), que no cuenta en el inicial.

| Tarea   | CSS global (kB) | JS inicial (kB) | `main` (kB) | `initial` (kB) | `blocks.css` (kB) |
| ------- | --------------- | --------------- | ----------- | -------------- | ----------------- |
| Partida | 153,15 / 22,00  | 330,16 / 104,57 | 135,40      | 483,32         | —                 |
| B.1     | 153,39 / 22,05  | 330,69 / 104,78 | 135,93      | 484,08         | 0,06 / 0,08       |
| B.2     | 153,39 / 22,05  | 330,71 / 104,78 | 135,93      | 484,10         | 8,26 / 2,10       |

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
