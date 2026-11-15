# Informe de modo autónomo: plantilla de páginas, todas las pendientes, rama `auto/docs-paginas-2-2026-11-14`

14/11/2026. `node -v`: **v24.18.0**. `git config user.email`: la dirección noreply del autor. **No se subió la versión ni se publicó nada.**

**Base de la rama (alerta):** el encargo decía partir de `main` «con la fusión de la rama `auto/docs-paginas-2026-11-14`», pero `main` (también `origin/main`) seguía en `b313f0b`, **sin esa fusión** (19 commits por delante). Partir de `main` habría dejado fuera toda la plantilla y las páginas ya migradas, así que la rama sale de `origin/auto/docs-paginas-2026-11-14` (`66bde6d`). Al fusionar primero aquella rama, el PR de esta trae solo sus commits.

**Ajustes del usuario a la tanda 1:** el campo llegó sin rellenar («[escribe aquí…]»): ninguno.

## 1. PD-7: Dialog empieza por el servicio

- Ejemplo nuevo, más corto: `dialog-ask-name.example.ts` (30 líneas: «Hola, Ana» y «Cambiar nombre») y `ask-name-dialog.ts` (26: el diálogo recibe `name` por su entrada y devuelve el nuevo con `ref.close()`). **56 líneas entre los dos**: cabe en las 60 de la demo; la excepción hasta 80 que aprobó el usuario no hizo falta.
- Es la demo de Dialog; «En la plantilla: `<mimi-dialog>`» (el antiguo de la demo) pasa a Ejemplos. Se borran `dialog-edit-user.example.ts` y `edit-user-dialog.ts`.
- `dialog-page.spec.ts`: la demo es la del servicio, antes de Instalación; la prueba de la demo abre el diálogo, cambia el nombre, guarda y comprueba «Hola, Ana Ruiz». `doc-pages.spec.ts` y Dialog: **71 de 71**.
