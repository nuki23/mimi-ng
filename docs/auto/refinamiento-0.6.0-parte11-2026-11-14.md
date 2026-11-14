# Refinamiento 0.6.0, undécima tanda: grises malva medio (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 10](refinamiento-0.6.0-parte10-2026-11-13.md)

Encargo del 14/11/2026. **Decisión del usuario: grises «malva medio»** (croma 0,014), en claro y oscuro, después de ver las capturas lado a lado del 13/11/2026. Registrada como «Decidido por el usuario» en `docs/auto/decisiones-por-defecto.md`; malva suave queda marcada como sustituida. Un commit. **No se subió la versión ni se publicó nada.**

## Qué cambió

- **Tema (`theme/theme-base.css`):** los 15 grises de `:root` y `.dark` pasan de croma 0,006 (0,003 en los extremos) a **0,014** (**0,007** en los casi blancos y casi negros). El tono (292), la luminosidad y la transparencia no cambian, así que el contraste tampoco. `MIMI_THEME_NEUTRAL` sigue en croma 0.
- **Prueba:** `gray-tint.spec.ts` pasa a exigir 0,014 y 0,007.
- **Spec:**
  - el párrafo del tema de marca (sección 6.1);
  - la tabla de colores globales (sección 13), con los 15 valores nuevos en claro y oscuro;
  - la nota de debajo de esa tabla.
- **CHANGELOG «por publicar»:** la línea de los grises dice «malva medio», croma 0,014.
- **`docs/design/correcciones-pendientes.md`:** la nota de los grises, con la historia (malva suave el 12/11, no se notaba, malva medio el 14/11).

| Token              | Claro (antes → ahora)         | Oscuro (antes → ahora)            |
| ------------------ | ----------------------------- | --------------------------------- |
| `background`       | `0.985 0.003` → `0.985 0.007` | `0.205 0.006` → `0.205 0.014`     |
| `card`             | `1 0.003` → `1 0.007`         | `0.235 0.006` → `0.235 0.014`     |
| `muted`            | `0.97 0.003` → `0.97 0.007`   | `0.27 0.006` → `0.27 0.014`       |
| `muted-foreground` | `0.54 0.006` → `0.54 0.014`   | `0.74 0.006` → `0.74 0.014`       |
| `border`           | `0.922 0.006` → `0.922 0.014` | `1 0.003 / 10%` → `1 0.007 / 10%` |
| `input`            | `0.88 0.006` → `0.88 0.014`   | `1 0.003 / 15%` → `1 0.007 / 15%` |

Todo en `oklch(L C 292)`. El resto (`foreground`, `popover`, `secondary`, `accent` y sus textos, `input-background`) sigue la misma regla.

## Verificación

- **Contraste AA:** `contrast.spec.ts` en verde, con las 184 pruebas del tema.
- **`pnpm test`:** ui-core 1061, docs 260, CLI 202, en verde. **`pnpm build`** en verde. **`pnpm format:check`:** «All matched files use Prettier code style!».
- **Playwright** (`/docs/states` y la portada, claro y oscuro, contra `pnpm ng serve docs --port 4280`):
  - capturas **antes** (con el tema sin tocar) y **después**;
  - en las 4 páginas, los 15 grises leídos del documento tienen la croma que toca (**60 de 60**). El fondo de la página es `oklch(0.985 0.007 292)` en claro y `oklch(0.205 0.014 292)` en oscuro;
  - sin errores de consola.
- **Capturas antes y después** (`docs/auto/capturas/2026-11-14/`): `grises-estados-light-antes-despues.png`, `grises-estados-dark-antes-despues.png`, `grises-portada-light-antes-despues.png` y `grises-portada-dark-antes-despues.png`.
- **Bundle:** JS inicial **334,89 kB / 106,23 kB gzip** (sin cambio); CSS global **130,77 kB / 18,70 kB gzip** (antes 130,77 / 18,69: los valores tienen la misma longitud). Sin subir presupuestos.
- Servidor de desarrollo cerrado: puerto 4280 libre. Las herramientas de Playwright y los registros, borrados del directorio temporal.

## Alertas

- Con 0,014, el tinte se ve sobre todo en oscuro (fondo, tarjetas, `muted`). En claro sigue siendo sutil: los casi blancos llevan la mitad, 0,007.
- La plantilla del tema que copia la CLI se genera al compilar (`packages/cli/dist`), así que lleva los valores nuevos después de `pnpm build`.

## Archivos

`packages/ui-core/src/lib/theme/theme-base.css`, `packages/ui-core/src/lib/theme/gray-tint.spec.ts`, `docs/spec.md`, `CHANGELOG.md`, `docs/design/correcciones-pendientes.md`, `docs/auto/decisiones-por-defecto.md`, este informe y las 4 capturas de `docs/auto/capturas/2026-11-14/`.
