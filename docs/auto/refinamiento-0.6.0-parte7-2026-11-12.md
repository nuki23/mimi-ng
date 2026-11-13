# Refinamiento 0.6.0, séptima tanda (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 6](refinamiento-0.6.0-parte6-2026-11-12.md)

Encargo (12/11/2026), en dos partes: **A**, cuatro arreglos tras la revisión del sitio (un commit cada uno, con pruebas y Playwright); **B**, solo el plan de una plantilla común para las páginas de componentes, con la auditoría de todas. Además, respuesta a las dudas de la sexta tanda: un ejemplo de `[options]` por página queda así, y `compareWith` acepta cualquier texto pero **avisa en desarrollo** si el campo no existe. **No se subió la versión ni se publicó nada.** Node 24.18.0.

## 0. `compareWith`: aviso en desarrollo si el campo no existe

- `mimiCompareFn` (`option-list.ts`): con un nombre de campo, si el valor elegido es un objeto sin ese campo, `console.warn` **una vez** por componente (`[Mimi] Select o Combobox: compareWith="ID": el valor no tiene el campo «ID»…`). Fuera de `isDevMode()` no avisa. Con valores sueltos (texto, número) no avisa: se comparan con `Object.is`.
- Pruebas (`compare-with.spec.ts`, +2): avisa una sola vez y no avisa con el campo correcto ni con valores sueltos; Select y Combobox con `compareWith="ID"` avisan una vez cada uno. 6 de 6 en verde.
- **Corregido en un commit aparte:** el primer texto del aviso (`[Mimi] compareWith=…`) no seguía el formato `[Mimi] Componente: …`, y lo detectó `dev-warnings.spec.ts` al pasar la suite completa. Ese commit quedó en la rama con esa prueba en rojo; el siguiente (`fix(select,combobox): el aviso de compareWith…`) la arregla.

## A1. Select y Combobox: la X de limpiar solo cuando hace falta

**Plan breve.** La X ya no sustituye siempre al chevron:

- **Cuándo se ve:** solo con el ratón encima del campo, con el foco dentro o con el panel abierto. En pantallas sin ratón (`@media (hover: none)`), siempre que haya valor.
- **Fuera de esos casos:** vuelve el chevron.
- **Cómo:** solo con CSS (variantes de grupo de Tailwind), sin estado nuevo.
- **Teclado:** Supr y Retroceso limpian con el foco en el campo.

**Qué se hizo** (`select.ts`, `combobox.ts`):

- Con valor y `clearable` se pintan **los dos**, la X (`data-slot="clear"`) y el chevron (`data-slot="chevron"`).
  - La X lleva `hidden` y se muestra con `group-hover/…`, `group-focus-within/…`, `group-data-[state=open]/…` y `[@media(hover:none)]:inline-flex`.
  - El chevron se esconde con las mismas cuatro variantes.
- `data-icon` del hueco sigue diciendo `clear`, `loading` o `chevron`. La X sigue en el orden del Tab: al recibir el foco, el foco ya está dentro y se ve.
- **Teclado:**
  - **Select**, con el panel cerrado: Supr o Retroceso en el disparador quitan el valor.
  - **Combobox simple:** quitan el valor si el campo muestra la opción elegida. Si se está escribiendo, Retroceso borra letras.
  - **Combobox múltiple:** Supr con el campo vacío quita todos los chips. Retroceso sigue quitando el último.
  - Sin `clearable` no hacen nada.
- Las dos páginas lo cuentan en «Teclado».

**Pruebas** (`clear-button.spec.ts`, nuevo, 8 casos):

- las clases de la X y del chevron en los cuatro casos;
- sin valor no hay X;
- Supr y Retroceso en Select, en el Combobox simple (escribiendo no limpia) y en el múltiple;
- sin `clearable` no limpian.

En verde. Con la suite completa de ui-core: 1017 pruebas, 1016 en verde. La que fallaba era `dev-warnings.spec.ts` (ver arriba), ya arreglada.

**Playwright** (sitio servido en el 4280; ejemplos «Con `<mimi-option>`» de Select y Combobox), en claro y oscuro. **28 de 28 OK, sin errores de página.**

- Sin ratón ni foco: chevron sin X.
- Con el ratón encima: X sin chevron.
- Con el foco: X.
- Con el panel abierto y el ratón fuera: X.
- Al salir: vuelve el chevron.
- Supr con el foco: limpia; el Select vuelve al placeholder y el Combobox queda vacío.
- Contexto táctil (`isMobile`, `hasTouch`; `matchMedia('(hover: none)')` = `true`): X visible con valor, sin ratón ni foco, y sin chevron.

## A2. Input OTP: longitud, grupos y separador propio

**Comprobado sin cambios:**

- `length` acepta cualquier entero positivo; los decimales se redondean hacia abajo, y 0 o un valor no válido vuelve a 6.
- `separatorAfter` acepta un número, una lista (`[3]`, `[4, 8]`) o `"3,6"`.
- Las posiciones fuera de la fila se ignoran.

**Faltaba y se añadió: el separador propio.**

- `separator="·"` (texto) o `<ng-template mimiInputOtpSeparator>` (cualquier contenido, por ejemplo un ícono), que gana sobre el texto. Sin ninguno, el guion del diseño.
- Se pinta en cada separación, `aria-hidden`, con `text-muted-foreground` y los SVG a 16 px.
- Nuevos `MimiInputOtpSeparator` y `MimiInputOtpImports`. El índice del componente exporta solo la API pública: `MimiOtpOutlet`, que pinta la plantilla sin `@angular/common`, es interno.
- Anotado en `correcciones-pendientes.md` (sin diseño).

**Página** (6 ejemplos):

- **Casillas y grupos**, el primero e interactivo:
  - Number Input para las casillas (1–12);
  - Select para los grupos: sin grupos, en dos mitades, de 2, 3 o 4;
  - Toggle Group para el separador: guion, «·» o «/»;
  - debajo, la línea de código que lo hace.
- Verificación, sin cambios.
- **Separador propio** (nuevo).
- Estados y longitud, sin cambios.
- **Signal Forms** y **Reactive Forms**, separados, cada uno con su botón y su error. Sustituyen al ejemplo «Formularios», que juntaba los tres sistemas; el de ngModel sigue en las pestañas «Con formularios».
- La API documenta `separator` y los grupos.

**Pruebas:**

- `input-otp.spec.ts`, +2:
  - longitudes de 1 a 12, `[2]`, `[4]`, `[3, 6]`, `[4, 8]`, posiciones fuera de la fila, decimales y 0;
  - separador de texto y plantilla, que gana y se repite.
- `input-otp-page.spec.ts`:
  - 6 ejemplos;
  - el interactivo empieza con 8 casillas, un separador y su código;
  - el separador propio pinta «·», «·» y el ícono.
- En verde: 20 en ui-core y la página.

**Playwright** (claro y oscuro, **24 de 24 OK, sin errores de consola**):

- el interactivo:
  - empieza con 8 casillas `[4]`;
  - con 12 casillas queda en dos mitades `[6]`;
  - «De 4 en 4» da `[4, 8]` y 2 separadores;
  - «/» cambia los separadores y el código;
  - se escriben 12 dígitos;
  - cabe en su contenedor (670 de 670 px);
- se ve el ícono separador;
- Signal Forms marca «El código tiene 6 dígitos.» con 3 dígitos y queda válido con 6;
- Reactive Forms marca el error vacío y queda válido con 4.

## A3. Toast: los tamaños sm, md y lg en su página y en la portada

- **Página de Toast:** ejemplo nuevo «Tamaños» (`toast-sizes.example.ts`), después de «Tonos». Tiene un botón por tamaño, del mismo tamaño que el aviso que abre. La frase explica `size` por aviso y `provideMimiToast({ size })` para todos.
- **Portada:** tarjeta nueva «Avisos» (`home/showcase-toasts.ts`) debajo de «Equipo», en la columna derecha, con los tres botones. La frase de la vitrina nombra Toast. Toast ya está en el CSS global y la portada es una ruta diferida: no entra nada al JS inicial (ver la verificación final).
- **Pruebas:**
  - `toast-page.spec.ts`: 8 ejemplos; los tres botones y el código con `size`.
  - `home-page.spec.ts`: la tarjeta tiene los tres botones y cada uno crea un aviso con su `data-size`.
- **Playwright** (claro y oscuro, en la página y en la portada, **6 de 6 OK, sin errores de consola**): los tres avisos aparecen y crecen. Alto en px: sm 57, md 68, lg 84.

## A4. Dialog: la página empieza con el servicio

**Orden nuevo de la página:**

1. Título y una frase.
2. **El ejemplo principal**, antes de Instalación: «Editar usuario». El botón abre `EditUserDialog` (un componente real) con `inputs: { user }`. El diálogo edita el nombre (Input) y el rol (Select con `<mimi-option>`) y devuelve el usuario con `ref.close()`. La página lo muestra («Ana T. Ruiz · Admin», `resultado: guardado`). Con Escape, `resultado: cancelado`.
   - El código va en **dos archivos cortos**: `dialog-edit-user.example.ts` (quien abre, 39 líneas) y `edit-user-dialog.ts` (el componente, 51 líneas).
3. Instalación.
4. Uso: solo el servicio, en 10 líneas.
5. Ejemplos:
   - «**Tamaños y opciones**» (`dialog-options.example.ts`): `size` sm, md y lg, `maxWidth` (pide 800 px y lo limita a 640), `panelClass` y `chrome: 'none'`, con el mismo contenido;
   - «**En la plantilla: `<mimi-dialog>`**» va al final, con su código, la lista de piezas y los ejemplos declarativos de antes (Básico, Formulario, Sin cierre, Contenido largo, Desde un menú y Personalizado);
   - Teclado y accesibilidad.
6. API.

**Qué más cambió:**

- Se quitó `dialog-service.example.ts` (renombrar un proyecto con `data`): lo sustituye el ejemplo principal.
- La nota «sin `mimiDialogTitle`, `aria-label`» pasó a «Teclado y accesibilidad».
- **CodePreview** gana una entrada opcional, `files`: la pestaña Código muestra cada archivo con su nombre, y Copiar los copia todos con `// nombre`. Sin `files`, nada cambia.

**Pruebas:**

- `dialog-page.spec.ts`:
  - 8 ejemplos;
  - el primero es el del servicio y va antes de `#installation`;
  - «Tamaños y opciones» va antes de «En la plantilla»;
  - prueba nueva: abre el diálogo, el campo trae «Ana Torres», guarda «Ana T. Ruiz» y la página muestra el resultado.
- `code-preview.spec.ts`: el modo de varios archivos, con los nombres, el código y el texto de Copiar.

**Playwright** (claro y oscuro, **16 de 16 OK, sin errores de consola**):

- el orden de la página (demo < Instalación < opciones < `<mimi-dialog>` < API);
- el diálogo recibe el usuario;
- la X dice «Cerrar»;
- guardar con el rol Admin devuelve el resultado y la página lo muestra;
- Escape cancela;
- el código va en dos archivos;
- anchos de 360, 420 y 560 px por `size`, 640 px con `maxWidth`;
- `chrome: 'none'` sin X.

Fallo encontrado por Playwright y arreglado antes del commit: con `width: '100%'`, el panel medía 384 px, porque el contenedor se ajusta al contenido. El ejemplo pide 800 px y lo limita con `maxWidth`.

**Nota:** durante las ediciones, el servidor de desarrollo se quedó con una compilación intermedia con errores (el HTML ya estaba bien). Se reinició y la revisión se repitió entera.

## Verificación de la Parte A

- **`pnpm build`** en verde.
  - **JS inicial:** **334,87 kB crudo / 106,23 kB gzip**, igual que antes de la tanda. La portada y las páginas son rutas diferidas.
  - **CSS global:** **112,44 kB / 17,27 kB gzip** (antes, 111,56 / 17,13): **+0,88 kB crudo, +0,14 kB gzip**. Vienen de:
    - las variantes de la X de Select (`group-hover`, `group-focus-within`, `group-data-[state=open]` y `[@media(hover:none)]`, para la X y el chevron);
    - la tarjeta de avisos de la portada.
  - No se subió ningún presupuesto.
- **Pruebas en verde:** docs **249** (antes, 246), ui-core **1019** (antes, 1007), CLI **202**.
- **`pnpm format:check`** en verde.
- **CHANGELOG** («0.6.0 (por publicar)», «Formularios»): se añadieron la X de limpiar con Supr/Retroceso, el aviso de `compareWith` y el separador propio de Input OTP. Son añadidos, no rupturas. Se anotó en el commit de la Parte B.

## Parte B: plan de una plantilla común para las páginas (solo plan)

**No se cambió ninguna página.** Archivos nuevos en `docs/plan/docs-paginas/`:

- **`plan.md`:**
  - el resumen de lo encontrado;
  - **PD-4, PENDIENTE DE DECIDIR (usuario)**, con 12 reglas comunes:
    - orden y nombres fijos (h2 `Instalación`, `Uso`, `Ejemplos`, `Accesibilidad y teclado`, `API`);
    - una frase de cabecera de 12 a 25 palabras y una demo principal antes de Instalación;
    - «Qué instala» en un desplegable;
    - Uso de 12 líneas como máximo;
    - una frase por ejemplo, de 25 palabras como máximo;
    - los ejemplos en orden fijo: Tamaños → Variantes → Estados → Formularios → Casos avanzados → `class` → Alternativas;
    - sin ejemplos vivos que repitan las pestañas de formularios;
    - ejemplos de 80 líneas como máximo;
    - tablas de API con columnas fijas;
    - qué sale de la página (spec o CHANGELOG) y qué va a un desplegable.
  - Dos variantes:
    - **A, completa (recomendada):** hasta 8 ejemplos y 400 palabras visibles, con una tabla de Entradas, Salidas, Piezas, Textos y Variables CSS.
    - **B, corta:** hasta 4 ejemplos y 200 palabras, una sola tabla y los avanzados en una página «Recetas».
  - **Prioridad y tandas** (DP.0 a DP.P):
    - primero, las piezas comunes y una prueba de estructura;
    - después, tandas de 5 a 9 páginas: las más pesadas (Select, Combobox, Dialog, Form Field y Toolbar), formularios con ejemplos repetidos, capas flotantes, datos y fechas, simples, y Blocks y portada.
- **`auditoria.md`:**
  - una tabla de las **38 páginas** contra la plantilla: qué falta, qué sobra, orden distinto, repetidos o código engorroso, y nombres inconsistentes;
  - 13 inconsistencias entre páginas, con su lista de páginas;
  - las 5 más pesadas y los 12 ejemplos de más de 80 líneas;
  - los **7 Blocks** (`block-doc.ts`: 250 palabras fijas repetidas y código sin plegar);
  - la **vitrina de la portada** (9 de 38 componentes, Reactive Forms frente a Signal Forms en los Blocks, y un enlace a Blocks incompleto).
- **`ejemplos.md`:** Button y Select con cada variante: el esqueleto de secciones, de dónde sale cada ejemplo y qué sale de la página.
  - **Button:** A queda en 6 ejemplos y unas 160 palabras; B, en 3 ejemplos y unas 90 (hoy, 8 y 240).
  - **Select:** A queda en 7 ejemplos y unas 420 palabras con la API; B, en 4 y unas 220 (hoy, 11 y unas 970).

Registrado en el índice (`docs/plan.md`, bloque «Páginas de la documentación», tareas DP.0 a DP.P bloqueadas por PD-4) y en `docs/plan/decisiones.md`, sección (a). La línea de R.15 en el índice se actualizó con lo hecho hoy (la X de limpiar).

**Cómo se hizo la auditoría:** un subagente de solo lectura recorrió el código de las 38 páginas, los Blocks y la portada. Se comprobaron a mano el número de páginas (38) y el orden de Button (8 ejemplos, en el orden indicado). Las filas de Dialog, Input OTP y Toast se corrigieron con lo cambiado hoy. Los recuentos de palabras son aproximados.

## Parte C: que la plantilla se cumpla sola (solo plan, encargo posterior del 12/11/2026)

Archivo nuevo: **`docs/plan/docs-paginas/parte-c.md`**. **No se aplicó nada**: ni `CLAUDE.md`, ni `.claude/commands/`, ni el sitio. Todo queda **PENDIENTE DE DECIDIR (usuario), junto con PD-4**, como **PD-4c** (cuatro preguntas, con su recomendación).

- **C.1 `app-doc-page`:**
  - cada página es una configuración tipada `DocPage` (nombre, frase, demo, `install`, `usage`, ejemplos por categoría con su frase, accesibilidad, API, textos y variables CSS);
  - el componente pinta las secciones con su orden, nombres e `id` fijos, y no hay campo de HTML libre;
  - las dos variantes son una constante del sitio (qué pinta cada una, en una tabla);
  - incluye la migración paso a paso, lo que añade B (la página «Recetas») y Button como piloto en DP.0;
  - los Blocks se quedan con su `block-doc.ts`.
- **C.2 `doc-pages.spec.ts`:** falla si una página (cada carpeta de componentes y cada ítem `ready` del menú, así que también cubre las futuras):
  - no usa el componente;
  - le falta una sección obligatoria (`texts`, `forms` y `tokens` se exigen cuando el componente los tiene);
  - cambia el orden de los h2 o los h3;
  - pasa de un límite de la variante;
  - tiene un ejemplo sin frase;
  - muestra nombres internos.
  - Durante la migración, con `PENDING`, que solo encoge. Después, las excepciones con la aprobación del usuario. Sustituye a la prueba de R.24.
- **C.3 Textos propuestos** (en el plan, citados, sin aplicar), para:
  - `CLAUDE.md`: reemplazar «Cada componente nuevo tiene su página…» por la regla que apunta a `docs/spec/plantilla-pagina.md` (se crea en DP.0), y una regla de Angular 11 para las páginas;
  - `.claude/commands/componente.md`: el apartado «3. La página» con la configuración y la prueba como paso obligatorio;
  - `.claude/commands/cerrar-grupo.md`: «Páginas con la plantilla» en «Comprobar» y en «Comprobado».
- **Plan e índice:**
  - `plan.md` gana la sección «Parte C» y el enlace;
  - DP.0 incluye `app-doc-page`, la prueba, `plantilla-pagina.md`, los textos y Button como piloto;
  - la tanda 5 queda en 8 páginas;
  - `docs/plan.md` y `docs/plan/decisiones.md` (PD-4c) se actualizaron.

## Alertas para el revisor

1. **El primer commit de la tanda dejó `dev-warnings.spec.ts` en rojo:** el formato del aviso de `compareWith`. Lo arregla el commit siguiente; la rama terminó en verde.
2. **El CSS global crece 0,88 kB crudo (0,14 kB gzip)** por las variantes de la X de limpiar (también en Combobox, que va en `components.css`) y la tarjeta de avisos de la portada. Es lejos del presupuesto y no se subió nada.
3. **`CodePreview` gana `files`** (varios archivos por ejemplo). Es del sitio, no de la librería. Lo usa la demo de Dialog, y la plantilla (DP) lo propone para los ejemplos largos.
4. **Input OTP**:
   - mantiene un ejemplo vivo de Signal Forms y otro de Reactive Forms **además** de las pestañas, como pidió el encargo;
   - la variante A de la plantilla dejaría uno solo (de validación);
   - lo decide PD-4.
5. **Supr/Retroceso en el Combobox simple** quitan el valor solo si el campo muestra la opción elegida. Si se está escribiendo, Retroceso borra letras, como en cualquier campo.
6. **Nada comprobado con NVDA ni en teléfonos reales:** la X en táctil se comprobó con la emulación de Chromium (`hover: none`).

## Archivos

- **ui-core:**
  - `option-list/option-list.ts`
  - `select/select.ts`
  - `combobox/combobox.ts`
  - `input-otp/input-otp.ts` e `input-otp/index.ts`
  - pruebas: `clear-button.spec.ts` (nuevo), `compare-with.spec.ts` e `input-otp/input-otp.spec.ts`
- **Sitio:**
  - `code/code-preview.ts`, `code/code-preview.html` y `code/code-preview.spec.ts`
  - Select y Combobox: `select-page.html`, `combobox-page.html`
  - Input OTP: `input-otp-page.*` y los ejemplos `input-otp-playground`, `-separator`, `-signal-forms` y `-reactive-forms` (nuevos); se quitó `-forms`
  - Toast: `toast-page.*` y `toast-sizes.example.ts` (nuevo)
  - portada: `home-page.*` y `home/showcase-toasts.ts` (nuevo)
  - Dialog: `dialog-page.*` y los ejemplos `dialog-edit-user.example.ts`, `edit-user-dialog.ts` y `dialog-options.example.ts` (nuevos); se quitó `dialog-service.example.ts`
- **Docs:**
  - `CHANGELOG.md`
  - `docs/design/correcciones-pendientes.md`
  - `docs/plan.md` y `docs/plan/decisiones.md`
  - `docs/plan/docs-paginas/plan.md`, `auditoria.md` y `ejemplos.md` (nuevos)
  - este informe

## Limpieza

- **Servidor de desarrollo (puerto 4280):**
  - lanzado con `timeout`;
  - reiniciado una vez, porque se quedó en una compilación intermedia;
  - al final, detenido (la tarea y el proceso `node`, por PID);
  - se comprobó con `netstat` que el puerto quedó libre.
- **Playwright** (scripts, `playwright-core` y capturas) vivió en el directorio temporal de la sesión, fuera del repo, y se borró al terminar.
