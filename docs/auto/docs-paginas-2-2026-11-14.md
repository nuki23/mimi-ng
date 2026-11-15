# Informe de modo autónomo: plantilla de páginas, todas las pendientes, rama `auto/docs-paginas-2-2026-11-14`

14/11/2026. `node -v`: **v24.18.0**. `git config user.email`: la dirección noreply del autor. **No se subió la versión ni se publicó nada.**

**Base de la rama (alerta):** el encargo decía partir de `main` «con la fusión de la rama `auto/docs-paginas-2026-11-14`», pero `main` (también `origin/main`) seguía en `b313f0b`, **sin esa fusión** (19 commits por delante). Partir de `main` habría dejado fuera toda la plantilla y las páginas ya migradas, así que la rama sale de `origin/auto/docs-paginas-2026-11-14` (`66bde6d`). Al fusionar primero aquella rama, el PR de esta trae solo sus commits.

**Ajustes del usuario a la tanda 1:** el campo llegó sin rellenar («[escribe aquí…]»): ninguno.

## 1. PD-7: Dialog empieza por el servicio

- Ejemplo nuevo, más corto: `dialog-ask-name.example.ts` (30 líneas: «Hola, Ana» y «Cambiar nombre») y `ask-name-dialog.ts` (26: el diálogo recibe `name` por su entrada y devuelve el nuevo con `ref.close()`). **56 líneas entre los dos**: cabe en las 60 de la demo; la excepción hasta 80 que aprobó el usuario no hizo falta.
- Es la demo de Dialog; «En la plantilla: `<mimi-dialog>`» (el antiguo de la demo) pasa a Ejemplos. Se borran `dialog-edit-user.example.ts` y `edit-user-dialog.ts`.
- `dialog-page.spec.ts`: la demo es la del servicio, antes de Instalación; la prueba de la demo abre el diálogo, cambia el nombre, guarda y comprueba «Hola, Ana Ruiz». `doc-pages.spec.ts` y Dialog: **71 de 71**.

## 2. PD-8: sección «Servicio» en la API

- `DocPage.api.service` (`ServiceRow`: `name`, `type`, `description`), h3 «Servicio» (`id="service"`) entre Piezas y Textos, con `app-api-table kind="service"` (`Miembro | Tipo | Descripción`). Las descripciones cuentan para el límite de 20 palabras y los nombres internos; los `id` de la API quedan reservados (un ejemplo no puede llamarse `service`).
- Dialog: `MimiDialogService` y `MimiDialogRef` salen de Piezas y van a Servicio (`open`, `closeAll`, `close`, `afterClosed`/`closed`, `result` y `MIMI_DIALOG_DATA`). El bloque «Uso» usa el ejemplo nuevo (`AskNameDialog`).
- `docs/spec/plantilla-pagina.md`, reglas 2 y 10. Pruebas: `doc-page.spec.ts` (la sección en su sitio y su encabezado «Miembro»), `doc-pages.spec.ts` (el orden de los h3 con `service`) y Dialog: **83 de 83**.

## 3. Enlaces internos en los textos de la plantilla

- `app-doc-text` entiende `[texto](/ruta)` (solo rutas que empiezan por `/`; un enlace externo queda como texto) y lo pinta con `routerLink`. Dentro del código (entre comillas invertidas) no hay enlaces. `countWords` cuenta solo el texto del enlace.
- `doc-pages.spec.ts`, prueba nueva por página: cada enlace de todos sus textos (cabecera, frases, notas, desplegables y API) va a una página `ready` del menú.
- Páginas hermanas: Input → Textarea y Select ↔ Combobox, en la nota de Uso (Textarea → Input y Checkbox ↔ Switch, al migrarlas, más abajo). Pruebas: `doc-page.spec.ts` (los enlaces, el externo como texto, las palabras), Input (el enlace en la nota) y las de Select, Combobox y `doc-pages`: **92 de 92**.

## 4. Migración de las 32 páginas pendientes (DP.2 a DP.5)

**Plan breve:** por tandas del plan (DP.2 formularios, DP.3 capas flotantes, DP.4 datos y fechas, DP.5 simples; Textarea, que se separó de Input el 13/11/2026, va con DP.2). Capturas de «antes» de las 32 en una sola sesión de `ng serve`. La migración de cada página la escriben subagentes en paralelo, cada uno en las carpetas de sus páginas, sin git, sin servidores y sin tocar las piezas comunes, con un encargo común (la plantilla, los límites, «las excepciones no se aplican: se informan»); el agente principal revisa cada página, borra lo que sobra, la registra en `doc-pages.spec.ts` (fuera de `PENDING`, `PENDING_COUNT` baja), pasa sus pruebas y hace **un commit por página**. Al terminar cada tanda, Playwright «después».

**Capturas de antes** (`docs/auto/capturas/2026-11-14-b/tanda{2,3,4,5}/antes/`, JPEG al 50 %): tanda 2, 96 de 96; tanda 3, 84 de 84; tanda 4, 108 de 108; tanda 5, 93 de 96: **Avatar** da un 404 en la consola en los tres modos (un recurso de imagen que no existe; ya pasaba antes de migrar: se revisa al migrarla).

**`doc-pages.spec.ts`:** la lista `PENDING` deja de escribirse a mano: son las carpetas que no están en `MIGRATED`, y `PENDING_COUNT` (que solo baja) fija cuántas quedan; una carpeta nueva sin migrar lo haría subir y la prueba falla. La prueba de «cada carpeta» pasa a «una carpeta con `<nombre>.page.ts` está en `MIGRATED`, y al revés». Mismo control, una edición menos por página (en el commit de Switch).

### Tanda 2 (DP.2): formularios, 8 páginas — hechas

| Página       | Ejemplos (antes → demo + después) | Qué cambió                                                                                                                                                                                                                              |
| ------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Switch       | 6 → demo + 4                      | Demo nueva (modo avión y wifi, 25 líneas). Fuera Signal Forms y Reactive/ngModel vivos (repetían las pestañas). Estados con solo lectura. Accesibilidad nueva. API con `readonly` y `aria-labelledby`, que faltaban. Enlace a Checkbox. |
| Checkbox     | 3 → demo + 3                      | Demo nueva (22 líneas). Estados con solo lectura. Accesibilidad nueva. API con `readonly` y `aria-labelledby`. Enlace a Switch (el viejo iba a un ancla de Switch que ya no existe).                                                    |
| Textarea     | 2 → demo + 1                      | La básica es la demo; Estados con solo lectura (y el rótulo «Solo lectura» del deshabilitado corregido). Accesibilidad nueva. Enlace a Input.                                                                                           |
| Password     | 6 → demo + 4                      | «Solo lectura» se juntó con Estados (77 líneas). Uso como componente completo. Accesibilidad de 3 a 6. API con `size`.                                                                                                                  |
| Input OTP    | 6 → demo + 3                      | La demo es la verificación (validación propia, 49). Fuera Signal y Reactive. `playground` 91 → 80 líneas. API con `touch`, `MimiInputOtpSeparator` y `data-readonly`.                                                                   |
| Number Input | 4 → demo + 2                      | Fuera el ejemplo de los tres formularios (el «12 con máximo 10» queda descrito en la API). API con `size`.                                                                                                                              |
| Input Mask   | 3 → demo + 3                      | La demo tenía **97** líneas: se partió en la demo (teléfono y fecha, 49) y «Tarjeta con marca» (64). Estados y `class`, separados. Fuera el de los formularios. Funciones y piezas, de párrafos a Piezas.                               |
| Tags Input   | 3 → demo + 4                      | Estados nuevo (deshabilitado y solo lectura); «Validar cada etiqueta» y «Separadores propios» salen del ejemplo de formularios. Textos con dos proveedores (y el chip). Enlace a Combobox.                                              |

### Tanda 3 (DP.3): capas flotantes, 7 páginas — hechas

| Página        | Ejemplos     | Qué cambió                                                                                                                                                                                                                                                                                                                                             |
| ------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Toast         | 8 → demo + 7 | **Servicio** (`injectMimiToast`, `toast.*`, `provideMimiToast`). La vista estática de las seis posiciones (HTML propio) pasa a `usage.more`.                                                                                                                                                                                                           |
| Confirm       | 7 → demo + 6 | **Servicio** (`injectMimiConfirm`, `confirm(opciones)`). La demo es la destructiva. El bloque del error NG0203 y la explicación de la promesa, a `usage.more`.                                                                                                                                                                                         |
| Command       | 2 → demo + 1 | La demo es `mimi-command` (52). El diálogo ⌘K: **161 → 52 líneas** + `app-commands.ts` (64) en dos archivos, con `LucideDynamicIcon` (del mismo `@lucide/angular`) en vez de un `@switch` de 9 íconos; prueba nueva que abre el diálogo y cuenta los 9 íconos. Command **no tiene servicio** (solo componentes): sin sección Servicio. API con `size`. |
| Tooltip       | 6 → demo + 5 | Accesibilidad de 4 a 6 (+2 en el desplegable). API con `mimiTooltipSize`, que faltaba. Enlace a Popover.                                                                                                                                                                                                                                               |
| Popover       | 5 → demo + 4 | Accesibilidad de 4 a 6. API con `blocked`, que faltaba; Salidas `openChange`.                                                                                                                                                                                                                                                                          |
| Dropdown Menu | 5 → demo + 4 | Fuera el texto de aria/cdk e instalación del CSS (lo da «Qué instala»). Piezas: disparador, contenido y las 9 piezas de menú con selector.                                                                                                                                                                                                             |
| Context Menu  | 5 → demo + 4 | «Sobre una tabla» (96 líneas) en dos archivos (73 + `file-actions-menu.ts`, 48). Enlace a Dropdown Menu.                                                                                                                                                                                                                                               |

### Tanda 4 (DP.4): datos y fechas, 9 páginas — hechas

| Página        | Ejemplos     | Qué cambió                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data Table    | 2 → demo + 5 | El ejemplo completo (**187 líneas**) se partió en «Celdas a medida, filtros y columna fija» y «Selección, detalle y acciones» (80), con los datos en `customers.ts` (`files`); el menú de la fila perdió «Ver facturas». **Ejemplo vivo del modo servidor** (`customers-server.ts`), como pedía el plan. «Tamaños y densidad» (`size` y `density`, cada uno por su lado). Accesibilidad reescrita: la página vieja decía que la fila elegida lleva `aria-selected`, pero el código solo pone `data-selected`; se quitó. |
| Tree          | 3 → demo + 3 | Los datos, en `files.ts`: `tree-files` 129 → 76, `tree-permissions` 86 → 77. Fuera el de formularios. Estados nuevo. API con `size` y las salidas.                                                                                                                                                                                                                                                                                                                                                                      |
| Sortable List | 2 → demo + 3 | La lista simple es la demo; Estados y Tamaños nuevos.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Pagination    | 6 → demo + 5 | «Registros por página» es la demo; nada recortado. `pageCount` como fila «(solo lectura)» de Entradas.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Date Picker   | 4 → demo + 3 | Estados nuevo; fuera el de formularios. «La fecha ISO y cómo convertirla», a `usage.more`. Enlace a Date Range.                                                                                                                                                                                                                                                                                                                                                                                                         |
| Date Range    | 2 → demo + 1 | Estados nuevo; fuera el de formularios. Enlace a Date Picker.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Color Picker  | 4 → demo + 2 | Solo lectura junto a Estados; fuera el de formularios.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| File Upload   | 4 → demo + 3 | El básico (**93 líneas**) en dos archivos (67 + `simulated-upload.ts`, 34) y una demo nueva (42). El reintento de la subida simulada ahora funciona como dice su texto (antes fallaba siempre).                                                                                                                                                                                                                                                                                                                         |
| Slider        | 4 → demo + 3 | Estados nuevo; queda **un** ejemplo vivo de validación (el rango con distancia mínima), el que permite la regla 8.                                                                                                                                                                                                                                                                                                                                                                                                      |

**Arreglo de la regla de Variables CSS:** Sortable List, Date Picker, Date Range, Dropdown Menu y Context Menu usan tablas con otro nombre (`sortable`, `date`, `menu`); `validateDocPage` no las exigía. Ahora hay un mapa de alias (`TOKENS_ALIASES`) y una prueba; las cinco ya las tenían.

**PD-9 (pendiente del usuario):** `tokens` admite una sola tabla; Tags Input perdió la del chip. Ver `docs/plan/decisiones.md`.

Sin excepciones a los límites en estas tres tandas.

### Tanda 5 (DP.5): simples, 8 páginas — hechas

| Página       | Ejemplos     | Qué cambió                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Badge        | 5 → demo + 4 | Demo nueva (pedidos por estado); «Tonos» fuera (lo cubren la demo y la matriz, en el `more` de Variantes). Accesibilidad nueva. API con `size`. Sin los atajos de la 0.1.0 (prueba). El enlace del subagente a «Chip» (no tiene página) se cambió por [Tags Input].                                                                                                                                            |
| Avatar       | 3 → demo + 3 | Demo nueva. **El 404 de la consola era el ejemplo «Si la imagen falla»** (`/avatars/no-existe.png`): ahora es `data:text/plain,…`, que se carga y no se puede decodificar, así que dispara el mismo `error` sin pedir nada a la red. Comprobado en Chrome: `data-state="error"` y las iniciales «AT», sin errores de consola. (Un primer intento, `data:image/png;base64,…` inválido, daba `ERR_INVALID_URL`.) |
| Card         | 4 → demo + 3 | El bloque «Título y accesibilidad» a 4 viñetas; las piezas a Piezas.                                                                                                                                                                                                                                                                                                                                           |
| Separator    | 4 → demo + 3 | «Cuándo usar cada uno», a Accesibilidad.                                                                                                                                                                                                                                                                                                                                                                       |
| Skeleton     | 4 → demo + 3 | —                                                                                                                                                                                                                                                                                                                                                                                                              |
| Progress     | 5 → demo + 4 | Enlace a Toast; el `selector` que faltaba en Uso.                                                                                                                                                                                                                                                                                                                                                              |
| Tabs         | 9 → demo + 8 | En el límite de 8; «Según el ancho» en el `more` de Vertical. Las dos tablas (`mimi-tabs` y `mimiTab`) en Entradas; `size`, `valueChange` y piezas añadidas.                                                                                                                                                                                                                                                   |
| Toggle Group | 8 → demo + 6 | «Deshabilitado» y «Solo lectura» juntos en Estados; fuera el de formularios (61 líneas, repetía las pestañas).                                                                                                                                                                                                                                                                                                 |

## 5. Cierre de la migración

- **`PENDING` quitada:** con las 39 páginas migradas, `doc-pages.spec.ts` ya no tiene lista de pendientes ni la medida de la R.24 para ellas; el registro se llama `PAGES` y la prueba exige que **cada carpeta** tenga su `<nombre>.page.ts` y esté en `PAGES` (un componente nuevo sin página con la plantilla la hace fallar). `docs/spec/plantilla-pagina.md`, la spec 10 y `cerrar-grupo.md`, al día. **251 pruebas** en `doc-pages.spec.ts` y `doc-page.spec.ts`.
- **Ningún `*-page.html`** queda en `pages/docs/components/` (`ls …/*/*-page.html`: 0).
- **Ninguna excepción aplicada**; `EXCEPTIONS` sigue vacío. Lo que no cabía se rediseñó (ejemplos partidos en dos archivos: Input Mask, Data Table, Tree, Context Menu, File Upload, Command; recortes sin cambiar lo que muestran).

**Playwright «después»** (`docs/auto/capturas/2026-11-14-b/tanda{2,3,4,5}/despues/`, contra `ng serve` en el 4280; claro 1280, oscuro 1280 y claro 360): tanda 2, **216 de 216**; tanda 3, **189 de 189**; tanda 4, **243 de 243**; tanda 5, **216 de 216** (tras el arreglo de Avatar). Comprueba modo, sin errores de consola ni avisos `[Mimi docs]`, sin desborde horizontal, cada ejemplo corre, secciones en orden, frase delante de cada ejemplo, desplegables cerrados, «Qué instala» con Enter y sin espacio antes de la puntuación. Dos capturas revisadas a ojo (Data Table oscuro y Toast a 360): bien.

**Ejemplos y palabras del artículo** (claro 1280; ejemplos con la demo):

| Página        | Ejemplos | Palabras    |
| ------------- | -------- | ----------- |
| switch        | 6 → 5    | 715 → 708   |
| checkbox      | 3 → 4    | 599 → 726   |
| input-otp     | 6 → 4    | 765 → 783   |
| number-input  | 4 → 3    | 724 → 764   |
| input-mask    | 3 → 4    | 671 → 788   |
| password      | 6 → 5    | 740 → 784   |
| tags-input    | 3 → 5    | 781 → 832   |
| textarea      | 2 → 2    | 438 → 498   |
| toast         | 8 → 8    | 952 → 847   |
| tooltip       | 6 → 6    | 709 → 610   |
| popover       | 5 → 5    | 677 → 661   |
| dropdown-menu | 5 → 5    | 842 → 747   |
| context-menu  | 5 → 5    | 887 → 842   |
| confirm       | 7 → 7    | 799 → 663   |
| command       | 2 → 2    | 735 → 713   |
| data-table    | 2 → 6    | 1042 → 1447 |
| tree          | 3 → 4    | 894 → 948   |
| sortable-list | 2 → 4    | 720 → 914   |
| date-picker   | 4 → 4    | 870 → 998   |
| date-range    | 2 → 2    | 669 → 876   |
| color-picker  | 4 → 3    | 706 → 873   |
| file-upload   | 4 → 4    | 787 → 928   |
| slider        | 4 → 4    | 645 → 859   |
| pagination    | 6 → 6    | 902 → 902   |
| badge         | 5 → 5    | 423 → 426   |
| avatar        | 3 → 4    | 483 → 505   |
| card          | 4 → 4    | 505 → 503   |
| separator     | 4 → 4    | 426 → 372   |
| skeleton      | 4 → 4    | 336 → 319   |
| progress      | 5 → 5    | 525 → 548   |
| tabs          | 9 → 9    | 964 → 899   |
| toggle-group  | 8 → 6    | 970 → 915   |

**En total, el texto sube un 6 % (22 901 → 24 198 palabras).** No es lo que buscaba la plantilla («menos información visible»), y conviene que lo mire el usuario: suben las páginas que no tenían sección de accesibilidad (Checkbox, Textarea, Input Mask…), las de API incompleta (faltaban `size`, `readonly`, salidas) y Data Table, que gana el modo servidor y dos ejemplos partidos del de 187 líneas. Bajan las de capas flotantes (sin el texto de aria/cdk) y Tabs. La cuenta incluye las tablas de la API y el código visible, no solo la prosa (la prosa está limitada a 400 palabras por página y la prueba lo comprueba).

**Bundle** (`check-initial-js.mjs`; gzip -9 de `main` y `components.css`):

| Qué              | Antes (rama anterior) | Después                |
| ---------------- | --------------------- | ---------------------- |
| JS inicial       | 335,10 / 106,27 kB    | **334,38 / 106,05 kB** |
| `main`           | 137,83 / 40,51 kB     | 137,88 / 40,52 kB      |
| CSS global       | 130,77 / 18,70 kB     | 130,77 / 18,70 kB      |
| `components.css` | 141,27 / 19,70 kB     | 141,03 / 19,67 kB      |

Ningún presupuesto se acerca ni se sube (`main` sigue a 2,12 kB de su aviso: la M.25). El chunk compartido de la plantilla pasa a **73,6 / 16,8 kB**: ahora que todas las páginas usan `app-doc-page`, esbuild junta en él lo que comparten todas (`CodePreview`, Tabs, el botón de copiar, las pestañas de formularios con `FORMS_SPECS`, las tablas de `component-tokens.ts` y la plantilla), que antes iba repartido; es diferido.

**Pruebas finales:** `pnpm build` en verde (docs y CLI); `pnpm test` completo en verde (**docs 514, ui-core 1062, CLI 202**); `pnpm format:check` en verde (tras formatear los cuatro `resultado.json` nuevos).

**Servidores y temporales:** los tres `ng serve` de esta rama (4280), cerrados (`netstat`: libre). Subagentes: 7, todos terminados. `playwright-core` y los scripts, en el directorio temporal; se borran al final.

## 6. Decisiones del usuario tras la revisión (14/11/2026)

### 6.1 Capturas fuera del repo

- **Borrado** en un commit todo `docs/auto/capturas/`: **286 archivos, 70 428 510 bytes (67,2 MB)**: las de las ramas anteriores (2026-11-12, -13 y -14, con `paginas/` y `tanda1/`) y las de esta rama (`2026-11-14-b/`, 48 MB). Siguen en el historial de git de las ramas; con «Squash and merge» de esta rama (y `auto/docs-paginas-2026-11-14` cerrada sin fusionar, como dijo el usuario), no llegan a `main`.
- `.gitignore`: `docs/auto/capturas/`.
- `CLAUDE.md`, modo autónomo, **A10**: las capturas van a `C:\t\capturas\<AAAA-MM-DD>\` y el informe solo cita la ruta.
- `.claude/commands/cerrar-grupo.md`: punto «Capturas fuera del repo» en lo que comprueba el revisor.
- Los informes anteriores citan rutas `docs/auto/capturas/…` que ya no existen: son historial y no se editan.
- **Desde aquí**, las capturas de esta rama van a `C:\t\capturas\2026-11-14\`.

## Alertas para el revisor

1. **Base de la rama:** sale de `auto/docs-paginas-2026-11-14`, no de `main` (que no tenía su fusión). Fusiona primero aquella.
2. **Capturas grandes:** `docs/auto/capturas/2026-11-14-b/` pesa **48 MB** (32 páginas × 3 modos × antes y después, JPEG al 50 %). Si es demasiado para el repo, se puede dejar solo el modo claro o reducirlas antes de fusionar (la mitad, las de «antes», ya está en un commit empujado).
3. **El texto total sube un 6 %** (arriba): vale la pena mirar Data Table, Date Range, Slider e Input Mask, las que más crecen.
4. **PD-9** (varias tablas de Variables CSS; Tags Input perdió la del chip), en `docs/plan/decisiones.md`.
5. **Hechos del código que vieron los subagentes y no se tocaron** (ui-core no se cambió en esta rama):
   - Data Table: la página vieja decía `aria-selected` en la fila elegida, pero el código solo pone `data-selected` (se quitó del texto).
   - Sortable List: cambiar `--mimi-sortable-item-height` con `class` en un elemento sin `data-size` no surte efecto (la escala se resuelve en `:root` o `[data-size]`); lo mismo puede pasar con otros tokens de la escala.
   - Pagination: el comentario de `size` en `pagination.ts` (sm 32, md 40 px) y el ejemplo de tamaños (40, 50, 60 px) no coinciden.
   - Date Picker: `aria-readonly` en un `<button>` (el rol no lo admite); File Upload lo evita con `aria-disabled`.
   - Password: `password-states.example.ts` llama a un método que lee el estado de Reactive Forms en la plantilla (la regla 7 de `CLAUDE.md` prefiere `toSignal(control.events)`).
   - Toast: la página ya no dice que el nombre de la región de avisos solo se lee en la raíz (`app.config.ts`).
   - Forms tabs: en la prueba de Toggle Group sale en la consola el aviso de Tabs «`<mimi-tab label="">` no tiene value…», desde `code/forms-tabs.ts` (las pestañas reciben sus valores después del primer render); la prueba pasa.
   - Comentarios internos de ui-core con «decidido por defecto» (Input OTP, Tags Input) y «@angular/aria» (Progress): no salen en las páginas.
6. **File Upload:** el ejemplo de la subida simulada ahora reintenta bien (antes fallaba siempre, contra lo que decía su texto): cambia cómo se comporta el ejemplo.
7. **Dropdown Menu y Context Menu** repiten las 9 filas de las piezas de menú; si cambia la API de los ítems, hay que tocar las dos.

## Pendiente del usuario

- Fusionar `auto/docs-paginas-2026-11-14` y después esta rama.
- Decidir PD-9 y lo de las capturas (alerta 2).
- Revisar a ojo las páginas (sobre todo las que más crecen) y NVDA en las de capas flotantes: manual.
- Lo siguiente del plan de páginas: DP.6 (Blocks y portada) y la puerta DP.P.
