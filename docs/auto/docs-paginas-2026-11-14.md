# Informe de modo autónomo: plantilla de páginas (DP.0 y piloto), rama `auto/docs-paginas-2026-11-14`

14/11/2026. `node -v`: **v24.18.0**. `main` antes de crear la rama: `b313f0b Merge pull request #16 from nuki23/auto/release-0.6.0-2026-11-13` (igual que `origin/main` tras `git fetch`). `git config user.email`: la dirección noreply del autor. **No se subió la versión ni se publicó nada.** Un commit por paso.

## 1. Registro de la publicación de la 0.6.0

**Plan breve:** leer los datos de npm y de git (no de lo que dijo el usuario) y anotarlos en «Publicación de la 0.6.0 (registro)» de `docs/historial/plan-refinamiento-0.6.0.md`, con el mismo formato que el registro de la 0.5.0 (`docs/historial/plan-grupo-3.md`). Quitar el «por publicar» del índice.

- `npm view @mimi-ng/cli dist-tags time --json`: `latest: 0.6.0`; `0.6.0: 2026-11-14T23:00:38.716Z`.
- `npm view @mimi-ng/cli@0.6.0 dist.fileCount dist.unpackedSize dist.shasum`: 169 archivos, 1 161 273 bytes, `e1edce4e3c189038bcd3f0a89eebf6ed43ae8f5e`.
- `git log -1 --oneline v0.6.0`: `b313f0b Merge pull request #16 from nuki23/auto/release-0.6.0-2026-11-13`; `git rev-parse --short v0.6.0`: `3ed07b1` (etiqueta anotada); `git ls-remote --tags origin v0.6.0`: `3ed07b1f…  refs/tags/v0.6.0`.
- La release de GitHub y la prueba desde npm: dato del usuario (el encargo). No se consultó GitHub (`gh` no se usó).
- `docs/plan.md`: la sección del refinamiento y su bloque de «Terminado» dicen «publicada el 14/11/2026».
- `prettier --check` de los dos archivos: en verde. Sin código: no se corrieron build ni pruebas en este paso (van en los pasos 4 y 5).

## 2. Tarea M.25 registrada (sin hacerla): `main` del sitio

**Plan breve:** una tarea nueva en `docs/plan/mantenimiento.md` con el siguiente número libre (M.25), versión 0.7.0, con el dato del informe de la 0.6.0 (`main` 137,83 kB, aviso 140, error 145) y el punto (3) de la M.13 que quedó sin hacer (`cn()` en la cabecera trae `tailwind-merge`, 39 kB).

- `docs/plan/mantenimiento.md`: M.25 con origen, alcance propuesto (medir módulo por módulo contra la M.13; probar la cabecera sin `cn()`; diferir lo que se pueda del shell), criterios de hecho (5 kB de margen o una recomendación para el usuario, sin subir presupuestos) y «Bloquea: R.19 a R.23, como aviso».
- `docs/plan.md`: la línea en «Mantenimiento» y en el bloque de la 0.7.0; R.P7 depende también de M.25 (aquí y en `docs/plan/refinamiento/R-0.7.0.md`).
- No se midió ni se cambió nada del sitio.

## 3. Decisiones del usuario: PD-4 y PD-4c (14/11/2026)

**Plan breve:** registrar lo que eligió el usuario en el prompt (no son decisiones por defecto) donde estaba cada pregunta, quitarlas del índice de `docs/plan/decisiones.md` y anotarlas en `docs/auto/decisiones-por-defecto.md` con la base «Decidido por el usuario».

- PD-4: **variante A**. PD-4c: (1) componente común con configuración; (2) la prueba falla desde DP.0 con la lista de pendientes que solo encoge; (3) los textos de C.3 se aplican tal como están en `parte-c.md`; (4) cada excepción la aprueba el usuario. Todas coinciden con la recomendación.
- Archivos: `docs/plan/decisiones.md` (sección (a): «Ninguna abierta», con la nota de la decisión), `docs/plan/docs-paginas/plan.md` (PD-4 y la Parte C), `docs/plan/docs-paginas/parte-c.md` (estado y PD-4c), `docs/plan/docs-paginas/ejemplos.md` (cabecera), `docs/plan.md` (sección de las páginas y la línea de DP.0), `docs/auto/decisiones-por-defecto.md` (sección nueva).
