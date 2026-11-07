# Historial del plan: Grupo 2 (v0.3.0)

Texto de las tareas del Grupo 2 al cerrarlo (06/11/2026, rama `auto/cierre-g2-m13-2026-11-06`; `main` anterior: `38cc5b2`). No se edita: lo vigente está en `docs/plan.md` y en `docs/spec.md`.

**Dónde está el texto.** Cada tarea tenía su archivo en `docs/plan/grupo-2/` (el nombre es el ID). Esos archivos se movieron tal cual (`git mv`) a `docs/historial/grupo-2/`, con su texto completo y el estado del cierre; este archivo es su índice. Se movieron en vez de copiarse aquí para no reescribir unas 240 kB de texto a mano: así el historial de git sigue cada archivo y el texto es el mismo, letra por letra.

- [G2.0 Catálogo de tokens del Grupo 2 en la spec 13](grupo-2/G2.0.md)
- [G2.0b Tokens globales del Grupo 2 en el tema](grupo-2/G2.0b.md)
- [G2.1 Toggle Group](grupo-2/G2.1.md)
- [5.2 Página «Tema» sencilla](grupo-2/5.2.md)
- [G2.2 Number Input](grupo-2/G2.2.md)
- [G2.3 Password](grupo-2/G2.3.md)
- [G2.4 Input Mask, con G2.4a y G2.4b](grupo-2/G2.4.md)
- [G2.5 Input OTP](grupo-2/G2.5.md)
- [G2.6 Tags Input](grupo-2/G2.6.md)
- [G2.7 Slider](grupo-2/G2.7.md)
- [G2.8 Combobox/Autocomplete, con G2.8a y G2.8b](grupo-2/G2.8.md)
- [G2.9 Date Picker y Date Range, con G2.9a y G2.9b](grupo-2/G2.9.md)
- [G2.10 Progress](grupo-2/G2.10.md)
- [G2.11 File Upload](grupo-2/G2.11.md)
- [G2.12 Color Picker](grupo-2/G2.12.md)
- [5.17 Revisión móvil, con 5.17a y 5.17b](grupo-2/5.17.md)
- [G2.P Puerta del Grupo 2](grupo-2/G2.P.md): con la tabla acumulada del CSS global, del JS inicial y del `initial`, y el registro de la publicación de la 0.3.0.

Movido también aquí (abajo, con el mismo texto):

- La sección «Decididas (03/11/2026)» de `docs/plan/decisiones.md`.
- La medición con fecha del primer aviso de presupuesto (G2.10) de la spec 10; en la spec queda la regla comprobada.

Informes del modo autónomo de este grupo: `docs/auto/grupo-2-2026-11-04.md`, `docs/auto/release-0.3.0-2026-11-06.md` y `docs/auto/cierre-g2-m13-2026-11-06.md`. Decisiones por defecto: `docs/auto/decisiones-por-defecto.md`.

**Lo que queda abierto del grupo** (no es parte del historial; sigue en `docs/plan.md`): la comprobación manual (teléfonos reales con los paneles altos de la 5.17b, NVDA, Firefox, Safari, VoiceOver y la revisión de las decisiones por defecto antes de la 0.9.9), en la M.20; la pregunta «Cambios de API que pueda exigir la revisión móvil», en `docs/plan/decisiones.md`.

## Publicación de la 0.3.0 (registro)

El detalle está al final de la [G2.P](grupo-2/G2.P.md), «Publicación de la 0.3.0». En resumen, al 06/11/2026:

- `@mimi-ng/cli@0.3.0` en npm, `latest`, publicada el `2026-11-07T00:23:48Z` (UTC, según `npm view`).
- Etiqueta anotada `v0.3.0` en `origin`, sobre `1b79d71` (fusión del PR #3). Después, el PR #4 (M.19) dejó `main` en `38cc5b2`.
- El sitio (Cloudflare, desde `main`) muestra la 0.3.0 (dato del usuario).
- Release de GitHub: **pendiente** (sin dato).
- Prueba desde npm real en un proyecto limpio: **pendiente** (sin dato).

## Decididas (03/11/2026)

Texto de `docs/plan/decisiones.md` al cerrar el grupo.

Decisiones tomadas por el usuario el 03/11/2026 sobre preguntas que estaban aquí o en las tareas del Grupo 2. Cada una queda escrita en su tarea; las que siguen vigentes como regla, en la spec. Pasan al historial al cerrar el grupo (G2.P), con el texto de las tareas del grupo (`docs/historial/plan-grupo-2.md`).

- [x] **Convención de valor simple/múltiple** (G2.1, G2.7 y G2.8). Decidió el usuario: opción (a), un solo `value` cuyo tipo cambia con el modo, con un spike de Signal Forms al empezar G2.1 (un campo `T` y otro `T[]` contra el mismo componente); si TypeScript no acepta la unión con `[formField]`, opción (c), dos selectores. El nombre del modo de rango del Slider se propone al empezar G2.7, dentro de la misma convención. Vive en la spec 8, «Valor simple o múltiple». Descartadas: (b) `value` y `values` (`[formField]` solo enlaza `value`) y (d) siempre arreglo (incómodo en simple y distinto de Select).
- [x] **Presupuesto del CSS global y del `initial` en el Grupo 2.** Decidió el usuario: medir primero y no subir ningún presupuesto ahora. El aviso (CSS global 130 kB, `initial` 475 kB) no rompe el build; solo el error (145 kB y 505 kB) lo rompe. Cuando un componente deje el CSS global cerca del error, el usuario decide con la tabla acumulada de la G2.P y el gzip real. Ningún presupuesto se sube sin su decisión. Vive en la spec 10, «Grupo 2: medir primero». Datos de partida (03/11/2026, `pnpm build:docs`): CSS global 120,08 / 17,67 kB, JS inicial 333,94 / 105,24 kB (crudo / gzip), `initial` 454,02 kB; estimación al cerrar el grupo: unos 164 kB de CSS global y unos 498 kB de `initial` (G2.0b). La política que el usuario propuso en la tanda D (subir los techos si el gzip se mantiene bajo) queda para cuando se llegue cerca del error, con los números reales.
- [x] **Presupuesto del CSS global y del `initial`: se suben (05/11/2026).** Decidido por el usuario (05/11/2026), solo en el sitio de documentación: CSS global, aviso de 130 a 160 kB y error de 145 a 175 kB; `initial`, aviso de 475 a 505 kB y error de 505 a 535 kB (los mismos +30 kB, porque incluye el CSS). Motivo: con la G2.7 el CSS global llegó a 140,98 / 20,50 kB (crudo / gzip), a 4,02 kB del error. Cada informe da además el peso de `theme-base.css` solo y cuánto del CSS global viene de los ejemplos; la G2.P repite la medición. Vive en la spec 10.
- [x] **Para la puerta G2.P (decidido por el usuario el 05/11/2026):** la M.9 no entra en la 0.3.0 (Select no se toca); la tabla del CSS: en la spec 10 solo los límites, y las mediciones con fecha van a `docs/historial/` (con el grupo, en la G2.P); no hay 0.2.1: el arreglo de la 5.17a va en la 0.3.0; la M.11 era un error (`--overwrite` sobrescribe siempre; corregida); los paneles altos a 360px (5.17b) son un criterio manual de la puerta (teléfono real) y, si se confirma, una tarea con un spike de las opciones del overlay (margen de viewport y empuje); aceptadas las versiones exactas de Angular (M.2) y `minDate`/`maxDate` en el Date Range; la tabla única de tokens de las fechas, anotada con su por qué y lo que se pierde (`docs/auto/decisiones-por-defecto.md`).
- [x] **Grupo 5 (revisado en la G2.P, decidido por el usuario el 05/11/2026):** opción (a), sigue sin versión hasta la G4.P. Antes: «el criterio "según lo que pidan los usuarios" sigue abierto; se revisa en la G2.P».
- [x] **Blocks (revisado en la G2.P, decidido por el usuario el 05/11/2026):** opción (b), dividir: v0.4.0 con los Blocks que no usan Data Table (`login-01`, `login-02`, `signup-01`, `otp-01`, `settings-01`, `pricing-01` y el tipo `block`, B.1 a B.7 y la puerta B.P), v0.5.0 con el Grupo 3 y `table-01`, y el Grupo 4 pasa a la v0.6.0. **Ajuste por dependencias** (el usuario pidió comprobarlo antes de aplicar): en los diseños, ningún Block usa componentes del Grupo 4, del Grupo 5 ni posteriores, salvo `dashboard-01`, que tiene una barra lateral fija (como la Sidebar de dashboard, G5.1, sin versión) y un botón «Abrir menú» en móvil que pide un cajón (Sheet, G4.2). Se aplicó: `dashboard-01` (B.8) en la v0.6.0 con el Grupo 4, con la barra lateral escrita dentro del Block. Alternativa: v0.5.0 sin el cajón (spec 4, «Blocks»). Antes: «todos en la v0.4.0, con el Grupo 3 (decidido el 03/11/2026)». **El ajuste de `dashboard-01`, aceptado por el usuario tal como se aplicó (05/11/2026).**
- [x] **M.4: CLI con cdk o aria anteriores (decidido por el usuario el 05/11/2026):** solo avisar (la CLI no cambia el rango); umbral 22.2.4; en la 0.3.0, con prueba. Hecha (spec 5, «Versión mínima de cdk y aria»). Antes: «¿solo avisar o también actualizar el rango?», con umbral `^22.2.0`.
- [x] **M.15: axe-core (decidido por el usuario el 05/11/2026):** aprobado solo como `devDependency` del repo, que no se distribuye; la tarea se hace después de la G2.P.
- [x] **Globales del Grupo 2 por preset** (G2.0b). Decidió el usuario: ningún global nuevo va por preset; todos solo en el CSS.
- [x] **`mimi-indet`** (G2.0 y G2.10). Decidió el usuario: global, en `theme-base.css`, como `mimi-caret`, `mimi-bob` y `mimi-shake`; entra en el alcance de la G2.0b. Vive en la spec 13, «Otros globales del diseño».
- [x] **Chip compartido** (G2.6 y G2.8). Decidió el usuario: un ítem `chip` de la CLI (como `menu`), que crea la G2.6 y usan Tags Input y el Combobox múltiple.
- [x] **Combobox y Select** (G2.8). Decidió el usuario: el Combobox usa utilidades nuevas (filtro, resaltado y lista); Select no se toca en la 0.3.0; la M.9 lo migra después.
- [x] **Combobox y Tags Input** (G2.6 y G2.8). Decidió el usuario: se comparten el chip y su lógica de quitar (Backspace y botón), en el ítem `chip`; los anuncios, con un util pequeño que usan los dos.
- No decidida a propósito: las tablas de tokens de Date Picker y Date Range (¿una o dos?) quedan para el inicio de la G2.9 (pregunta de la G2.0). Decidió el usuario (respuesta a la tanda E): mientras tanto, la G2.0 las escribe juntas y marcadas como provisionales.
- [x] **G2.7 y G2.8 dependen de G2.1** (respuesta a la tanda E). Decidió el usuario: «Depende de: G2.1» solo por el resultado del spike de la convención de valor, anotado como excepción en la regla 5 de «Cómo usar este plan»; la tabla de la spec 4 no cambia.
- [x] **Presupuesto: la intención se confirma** (respuesta a la tanda E). Decidió el usuario: que el aviso no rompe el build se comprueba la primera vez que salte un aviso, sin provocarlo (spec 10, «Grupo 2: medir primero»).
- [x] **5.17 dividida** (respuesta a la tanda E). Decidió el usuario: 5.17a (Grupo 1) y 5.17b (Grupo 2); la 5.17a se hace antes de G2.1, porque el comportamiento de los paneles en móvil es transversal (Combobox, Date Picker, Color Picker y la burbuja del Slider son overlays nuevos). Sus cambios de API van a la 0.3.0, o a una 0.2.1 si son correcciones graves (lo decide el usuario al ver los resultados). G2.1 depende de 5.17a; G2.P, de 5.17a y 5.17b.

## Medición con fecha de la spec 10

Texto de la spec 10 («Presupuestos») al cerrar el grupo; en la spec queda solo la regla que comprobó.

- **Primer aviso (G2.10, 04/11/2026):** con la ruta y la entrada de la sidebar de Progress, el budget `main` (aviso 140 kB, error 145 kB) marcó un aviso: 140,16 kB. El build terminó igual (`ng build` siguió con el resto y `pnpm build` compiló la CLI): el aviso no rompe el build, como dice esta regla. Cada página nueva suma unos 0,1–0,2 kB a `main` (su ruta y su entrada en `DOCS_NAV`); no se subió nada.
