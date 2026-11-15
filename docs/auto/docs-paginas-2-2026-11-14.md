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
