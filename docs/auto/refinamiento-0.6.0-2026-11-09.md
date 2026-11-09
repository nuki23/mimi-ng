# Informe de modo autónomo: refinamiento 0.6.0, rama `auto/refinamiento-0.6.0-2026-11-09`

09/11/2026. `node -v`: v24.18.0. Rama desde `main` = `8f610ff` (fusión del PR #13, el plan de refinamiento). Identidad noreply; sin atribución en los commits. **No se sube la versión ni se publica.** Plan: `docs/plan/refinamiento/R-0.6.0.md`.

**Herramienta de diagnóstico en navegador (fuera del repo, en el directorio temporal de la sesión):** `shot.mjs`, un script de Node que lanza Chrome sin ventana (`--headless=new`) con el puerto de depuración, se conecta por CDP con el `WebSocket` de Node 24, navega al servidor de desarrollo (`pnpm ng serve docs --port 4260`, con `timeout`), activa `.dark` en `<html>` si se pide, mide con `Runtime.evaluate` (`getBoundingClientRect`, `getComputedStyle`) y captura `Page.captureScreenshot` con recorte; al terminar mata Chrome y borra su perfil temporal. No hay ventana, ni dependencias nuevas.

## Base: presupuestos y bundle (antes de empezar)

| Medida     | Crudo     | gzip      | Aviso  | Error  |
| ---------- | --------- | --------- | ------ | ------ |
| JS inicial | 333,31 kB | 106,25 kB | 345 kB | 360 kB |
| CSS global | 170,44 kB | 24,45 kB  | 180 kB | 195 kB |
| `initial`  | 503,75 kB | —         | 525 kB | 555 kB |

(Las de la 0.5.0, `docs/auto/release-0.5.0-2026-11-09.md`.)

## 1. Decisiones del usuario

PD-1 opción B, PD-2 opción C y PD-3 opciones A + B registradas como «Decidido por el usuario» (`docs/auto/decisiones-por-defecto.md`, `docs/plan/refinamiento/decisiones-usuario.md`, tareas R.14, R.19 y R.20); quitadas del índice de pendientes. Commit `docs(plan): PD-1 opción B…`.

## R.10 Errores visuales (hecha)

**Diagnóstico antes de tocar nada** (capturas con zoom en claro/oscuro; medidas con `getBoundingClientRect` y `getComputedStyle`):

- **Tabs pill y Toggle Group, en oscuro: hipótesis confirmada.** Geometría correcta (el indicador está a 4 px del borde en Tabs y a 3 px en Toggle Group), pero el fondo del indicador (`--mimi-card`, `oklch(0.175)`) es **más oscuro** que el contenedor (`muted`, `0.225`), y la sombra `shadow-neutral` en oscuro (`0 4px 10px -4px` negra al 60 %) se extiende hasta el borde inferior del contenedor y por debajo: se ve una mancha oscura que «toca el borde».
- **Skeleton: la hipótesis era incorrecta.** No era el contraste del fondo ni que `tailwind-merge` perdiera `rounded-card` (el radio computado es 16 px, el de `rounded-card`). **El ejemplo medía 0 px de ancho**: su raíz `w-full max-w-md` se resuelve contra el contenedor de la vista previa, que se ajusta al contenido, y los hijos con `w-full` y `w-1/2` quedan en 0. El ejemplo de la tarjeta tenía el mismo defecto (`w-3/5` de un ancho mínimo: 30 px).

**Arreglo:** `--mimi-tabs-pill-active` (`color-mix(foreground 12 %, muted)`, más claro que el contenedor) y `--mimi-tabs-pill-shadow` (`inset` de luz y `0 1px 1px`, desplazamiento + desenfoque ≤ 3 px) en `.dark`, y los de Toggle Group apuntan a ellos; Tabs usa el token de la sombra (antes, `shadow-neutral` fijo). Los dos ejemplos del Skeleton con ancho definido (`w-80 max-w-full`). **Después:** capturas de Tabs y Toggle Group en oscuro con el indicador más claro y la sombra contenida; el ejemplo del Skeleton mide 320 × 128 px.

**Pruebas:** `theme/pill-dark.spec.ts` (3: el fondo se mezcla sobre `muted`, la sombra ≤ 3 px, Tabs usa el token), `skeleton.spec.ts` (`rounded-card` gana al radio por defecto), `tabs.spec.ts` actualizada. `pnpm test:ui-core`: 908 en verde (905 antes + 3 nuevas, y 1 nueva de Skeleton: 904 → 908).

**Bundle:** CSS global 170,44 → **171,12 kB** crudo (24,45 → 24,53 gzip); JS inicial sin cambios (333,31 / 106,25). Límite: 180 kB de aviso.

**Archivos:** `theme/theme-base.css`, `components/tabs/tabs.ts` y `tabs.spec.ts`, `theme/pill-dark.spec.ts` (nuevo), `components/skeleton/skeleton.spec.ts`, los dos ejemplos de `apps/docs/.../skeleton/examples/`, `docs/plan.md`, `R-0.6.0.md`.
