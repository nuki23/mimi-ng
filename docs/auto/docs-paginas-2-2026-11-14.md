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

Sin excepciones a los límites en estas dos tandas. Pruebas: `doc-pages.spec.ts` con las 15 registradas y sus 15 `*-page.spec.ts`: todo en verde salvo lo que dependía de las páginas que otros subagentes aún estaban escribiendo (sin registrar todavía), que se vuelve a correr al final.
