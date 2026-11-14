# Informe de modo autónomo: preparación de la 0.6.0, rama `auto/release-0.6.0-2026-11-13`

13/11/2026. `node -v`: **v24.18.0**. `main` antes de crear la rama: `1910149 Merge pull request #15 from nuki23/auto/refinamiento-0.6.0-2026-11-09` (la fusión del PR del refinamiento, comprobada también contra `origin/main`). `git config user.email`: la dirección noreply del autor. **No se publicó, no se hizo etiqueta ni release.** Un commit por paso.

## 1. Puerta de la 0.6.0 cerrada y lo terminado al historial

**Plan breve:** cerrar R.P6 (la revisó el usuario al fusionar el PR #15); mover el texto de la 0.6.0 al historial con `git mv`; cerrar las tareas a medias con lo que salió y abrir en la 0.7.0 una tarea por cada cosa que les faltaba; lo manual, a la M.20. El plan de páginas (`docs/plan/docs-paginas/`) no se toca.

- `git mv docs/plan/refinamiento/R-0.6.0.md docs/historial/refinamiento/R-0.6.0.md`, con una nota de cierre arriba y el estado de cierre en R.0, R.1, R.7, R.8, R.12, R.14, R.15 y R.P6 (`[~]` → `[x]`, cada uno diciendo a qué tarea de la 0.7.0 pasa lo que faltaba). El resto del texto, tal cual.
- `docs/historial/plan-refinamiento-0.6.0.md` (nuevo): índice, cómo se cerraron las tareas a medias, lo que salió fuera del plan, los informes, lo que queda abierto y la sección «Publicación de la 0.6.0 (registro)», vacía hasta que el usuario publique.
- **0.7.0** (`docs/plan/refinamiento/R-0.7.0.md`, sección nueva «Lo que faltaba de la 0.6.0», con qué falta y criterios de hecho de cada una):

| ID   | Tarea                                                            | Viene de        |
| ---- | ---------------------------------------------------------------- | --------------- |
| R.25 | Logo y favicon del sitio                                         | R.0             |
| R.26 | Tabla de la escala de tamaños en la spec                         | R.1             |
| R.27 | Confirm con `size`                                               | R.7             |
| R.28 | Ejemplos de tamaño por componente y Blocks que heredan, a ojo    | R.8             |
| R.29 | Ejemplos de solo lectura                                         | R.12            |
| R.30 | Form Field: ejemplos con más elementos y el diagrama             | R.14            |
| R.31 | Nota de contraste al cambiar el primario (`text-primary` propio) | alerta, parte 9 |
| R.32 | Quitar el alias `default` de `size` (**RUPTURA**, ya anunciada)  | R.1, punto 5    |
| M.9  | Migrar Select a `MimiOptionList` (pasa a tener versión 0.7.0)    | R.15            |

- R.P7 depende ahora también de R.25 a R.32 y M.9.
- `docs/plan/mantenimiento.md`: M.9 con «versión 0.7.0»; M.20 con el punto «0.6.0» (14 a 18: navegador real de R.0, R.4, R.5, R.10 y R.15; lector con un Block inerte; foco con `components.css`; `/docs/states` y seis páginas a ojo; decisiones por defecto del refinamiento).
- `docs/plan.md`: la sección del refinamiento dice «0.6.0 cerrada, por publicar» y lista la 0.7.0 con las tareas nuevas; «Terminado» suma el bloque «Refinamiento, v0.6.0» (R.0 a R.18, R.24 y R.P6); la línea de «Historial» cita `plan-refinamiento-0.6.0.md`; M.9 pasa a `v0.7.0`.
- `docs/plan/refinamiento/plan.md`: el enlace de la 0.6.0 apunta al historial.
- Lo demás de `docs/plan/refinamiento/` (peticiones, decisiones PD-1 a PD-3, Combobox y Select, uso corto) se queda: la 0.7.0 lo usa.

Commit: `docs(plan): cierra la puerta R.P6 y pasa la 0.6.0 al historial; lo que faltaba, a la 0.7.0 (R.25 a R.32 y M.9)`.

## 2. `docs/design/tokens-mimi.css` frente al tema final: tabla para el sistema de diseño

**Decisión: `tokens-mimi.css` no se toca.** Es la consolidación de los archivos de Claude Design de esta carpeta (lo dice su cabecera); `group2-tokens.spec.ts` lo lee para comparar el tema con el diseño, y lo que Mimi hace distinto se anota en `correcciones-pendientes.md` (regla 7 del plan, D6). Sincronizarlo a mano borraría la referencia del diseño. En su lugar, esta tabla tiene **todos los tokens de color finales** de `theme-base.css`, para actualizar el sistema de diseño en Claude Design. `docs/design/LEEME.md` lo dice ahora (una frase nueva).

**Cómo se sacó** (no a mano): un script fuera del repo carga `theme-base.css` en Chrome sin ventana (Playwright 1.56.1, en `C:\t\pw6`), con `<html>` sin clase y con `class="dark"`, y para cada `--mimi-*` de `:root` y `.dark` lee el color calculado. OKLCH: el valor declarado o, en los derivados (`color-mix` en oklab), el oklab calculado convertido a OKLCH (L, C = √(a² + b²), h = atan2(b, a)). Hex: los canales sRGB que da Chrome (`color(from … srgb r g b)`), redondeados a 8 bits, sin la transparencia (que va aparte, «α»). **142 tokens declarados; 96 son colores** (94 en claro: `--mimi-tabs-pill-active` y `--mimi-toggle-group-indicator` solo existen en oscuro). Los demás son medidas, sombras, el degradado (`--mimi-brand-gradient: linear-gradient(135deg, var(--mimi-brand-600), var(--mimi-brand-400))`) o la mezcla de los fondos suaves (`--mimi-soft-mix`: 12 % en claro, 18 % en oscuro).

- **Origen:** «fijo» es un valor escrito en el tema; «derivado», un `color-mix` (cambia solo si cambias su base); «= `--x`», un alias.
- **\***: el OKLCH está fuera de sRGB (algún canal se sale más de 1/255), así que el hex es el color recortado. **El valor que manda es el OKLCH**; el hex sirve para herramientas que no lo admiten.
- Los grises llevan el tono 292 de la marca con croma 0,014 (0,007 en los casi blancos y casi negros, y en los blancos con transparencia del oscuro). `--mimi-primary-foreground`, `--mimi-tooltip*`, `--mimi-overlay`, `--mimi-glass*` y `--mimi-thumb` siguen neutros (croma 0).

| Token                                | Claro, OKLCH                     | Claro, hex          | Oscuro, OKLCH                    | Oscuro, hex         | Origen                                                    |
| ------------------------------------ | -------------------------------- | ------------------- | -------------------------------- | ------------------- | --------------------------------------------------------- |
| `--mimi-brand-50`                    | `oklch(0.975 0.016 292)`         | `#F7F5FF` \*        | `oklch(0.975 0.016 292)`         | `#F7F5FF` \*        | fijo                                                      |
| `--mimi-brand-100`                   | `oklch(0.953 0.032 292)`         | `#EFECFF` \*        | `oklch(0.953 0.032 292)`         | `#EFECFF` \*        | fijo                                                      |
| `--mimi-brand-200`                   | `oklch(0.91 0.062 292)`          | `#E1DBFF` \*        | `oklch(0.91 0.062 292)`          | `#E1DBFF` \*        | fijo                                                      |
| `--mimi-brand-300`                   | `oklch(0.84 0.115 292)`          | `#CCBDFF` \*        | `oklch(0.84 0.115 292)`          | `#CCBDFF` \*        | fijo                                                      |
| `--mimi-brand-400`                   | `oklch(0.72 0.16 292)`           | `#A88FFF`           | `oklch(0.72 0.16 292)`           | `#A88FFF`           | fijo                                                      |
| `--mimi-brand-500`                   | `oklch(0.64 0.2 292)`            | `#926DF9`           | `oklch(0.64 0.2 292)`            | `#926DF9`           | fijo                                                      |
| `--mimi-brand-600`                   | `oklch(0.54 0.239 292)`          | `#793EEA`           | `oklch(0.54 0.239 292)`          | `#793EEA`           | fijo                                                      |
| `--mimi-brand-700`                   | `oklch(0.49 0.24 292)`           | `#6C29D9`           | `oklch(0.49 0.24 292)`           | `#6C29D9`           | fijo                                                      |
| `--mimi-brand-800`                   | `oklch(0.43 0.2 292)`            | `#5827B1`           | `oklch(0.43 0.2 292)`            | `#5827B1`           | fijo                                                      |
| `--mimi-brand-900`                   | `oklch(0.36 0.15 292)`           | `#432383`           | `oklch(0.36 0.15 292)`           | `#432383`           | fijo                                                      |
| `--mimi-brand-950`                   | `oklch(0.27 0.1 292)`            | `#291852`           | `oklch(0.27 0.1 292)`            | `#291852`           | fijo                                                      |
| `--mimi-brand-text`                  | `oklch(0.54 0.239 292)`          | `#793EEA`           | `oklch(0.72 0.16 292)`           | `#A88FFF`           | = `--mimi-brand-600` (claro), `--mimi-brand-400` (oscuro) |
| `--mimi-background`                  | `oklch(0.985 0.007 292)`         | `#FAF9FF`           | `oklch(0.205 0.014 292)`         | `#17161D`           | fijo                                                      |
| `--mimi-foreground`                  | `oklch(0.205 0.014 292)`         | `#17161D`           | `oklch(0.985 0.007 292)`         | `#FAF9FF`           | fijo                                                      |
| `--mimi-card`                        | `oklch(1 0.007 292)`             | `#FFFEFF` \*        | `oklch(0.235 0.014 292)`         | `#1E1D24`           | fijo                                                      |
| `--mimi-card-foreground`             | `oklch(0.205 0.014 292)`         | `#17161D`           | `oklch(0.985 0.007 292)`         | `#FAF9FF`           | fijo                                                      |
| `--mimi-popover`                     | `oklch(1 0.007 292)`             | `#FFFEFF` \*        | `oklch(0.26 0.014 292)`          | `#24232A`           | fijo                                                      |
| `--mimi-popover-foreground`          | `oklch(0.205 0.014 292)`         | `#17161D`           | `oklch(0.985 0.007 292)`         | `#FAF9FF`           | fijo                                                      |
| `--mimi-primary`                     | `oklch(0.54 0.239 292)`          | `#793EEA`           | `oklch(0.72 0.16 292)`           | `#A88FFF`           | = `--mimi-brand-600` (claro), `--mimi-brand-400` (oscuro) |
| `--mimi-primary-foreground`          | `oklch(0.985 0 0)`               | `#FAFAFA`           | `oklch(0.205 0 0)`               | `#171717`           | fijo                                                      |
| `--mimi-secondary`                   | `oklch(0.97 0.007 292)`          | `#F5F4FA`           | `oklch(0.3 0.014 292)`           | `#2E2D34`           | fijo                                                      |
| `--mimi-secondary-foreground`        | `oklch(0.205 0.014 292)`         | `#17161D`           | `oklch(0.985 0.007 292)`         | `#FAF9FF`           | fijo                                                      |
| `--mimi-muted`                       | `oklch(0.97 0.007 292)`          | `#F5F4FA`           | `oklch(0.27 0.014 292)`          | `#26252D`           | fijo                                                      |
| `--mimi-muted-foreground`            | `oklch(0.54 0.014 292)`          | `#6F6D76`           | `oklch(0.74 0.014 292)`          | `#ABA9B3`           | fijo                                                      |
| `--mimi-accent`                      | `oklch(0.97 0.007 292)`          | `#F5F4FA`           | `oklch(0.3 0.014 292)`           | `#2E2D34`           | fijo                                                      |
| `--mimi-accent-foreground`           | `oklch(0.205 0.014 292)`         | `#17161D`           | `oklch(0.985 0.007 292)`         | `#FAF9FF`           | fijo                                                      |
| `--mimi-destructive`                 | `oklch(0.577 0.245 27.3)`        | `#E7000B` \*        | `oklch(0.704 0.191 22.2)`        | `#FF6467` \*        | fijo                                                      |
| `--mimi-destructive-foreground`      | `oklch(0.985 0 0)`               | `#FAFAFA`           | `oklch(0.2 0.04 25)`             | `#250E0D`           | fijo                                                      |
| `--mimi-border`                      | `oklch(0.922 0.014 292)`         | `#E5E4EE`           | `oklch(1 0.007 292 / 0.1)`       | `#FFFEFF` α 0.1 \*  | fijo                                                      |
| `--mimi-input`                       | `oklch(0.88 0.014 292)`          | `#D7D6E0`           | `oklch(1 0.007 292 / 0.15)`      | `#FFFEFF` α 0.15 \* | fijo                                                      |
| `--mimi-input-background`            | `oklch(1 0.007 292)`             | `#FFFEFF` \*        | `oklch(1 0.007 292 / 0.04)`      | `#FFFEFF` α 0.04 \* | fijo                                                      |
| `--mimi-input-hover`                 | `oklch(0.677 0.014 292)`         | `#9796A0`           | `oklch(0.992 0.007 292 / 0.27)`  | `#FCFCFF` α 0.27 \* | derivado                                                  |
| `--mimi-input-readonly`              | `oklch(0.979 0.007 292)`         | `#F8F7FD`           | `oklch(0.284 0.014 292 / 0.71)`  | `#2A2930` α 0.71    | derivado                                                  |
| `--mimi-ring`                        | `oklch(0.64 0.2 292)`            | `#926DF9`           | `oklch(0.72 0.16 292)`           | `#A88FFF`           | = `--mimi-brand-500` (claro), `--mimi-brand-400` (oscuro) |
| `--mimi-success`                     | `oklch(0.527 0.137 150)`         | `#15803D`           | `oklch(0.72 0.15 150)`           | `#53BE70`           | fijo                                                      |
| `--mimi-success-foreground`          | `oklch(0.985 0 0)`               | `#FAFAFA`           | `oklch(0.2 0.05 150)`            | `#021C09`           | fijo                                                      |
| `--mimi-success-soft-foreground`     | `oklch(0.42 0.115 150)`          | `#015E28`           | `oklch(0.84 0.12 150)`           | `#8FE1A1`           | fijo                                                      |
| `--mimi-warning`                     | `oklch(0.795 0.162 75)`          | `#F8AB1D`           | `oklch(0.81 0.15 78)`            | `#F5B33B`           | fijo                                                      |
| `--mimi-warning-foreground`          | `oklch(0.28 0.07 55)`            | `#421D00`           | `oklch(0.22 0.05 60)`            | `#2B1401`           | fijo                                                      |
| `--mimi-warning-soft-foreground`     | `oklch(0.45 0.11 60)`            | `#804300` \*        | `oklch(0.87 0.12 80)`            | `#FECB74`           | fijo                                                      |
| `--mimi-info`                        | `oklch(0.44 0.17 255)`           | `#004EAD` \*        | `oklch(0.83 0.11 250)`           | `#8FCDFF` \*        | fijo                                                      |
| `--mimi-info-foreground`             | `oklch(0.985 0 0)`               | `#FAFAFA`           | `oklch(0.2 0.05 250)`            | `#03172C`           | fijo                                                      |
| `--mimi-info-soft-foreground`        | `oklch(0.45 0.17 255)`           | `#0051B0` \*        | `oklch(0.84 0.1 250)`            | `#98D0FF` \*        | fijo                                                      |
| `--mimi-destructive-soft-foreground` | `oklch(0.5 0.2 27)`              | `#BB0916`           | `oklch(0.82 0.12 22)`            | `#FFA4A1` \*        | fijo                                                      |
| `--mimi-tooltip`                     | `oklch(0.205 0 0)`               | `#171717`           | `oklch(0.922 0 0)`               | `#E5E5E5`           | fijo                                                      |
| `--mimi-tooltip-foreground`          | `oklch(0.985 0 0)`               | `#FAFAFA`           | `oklch(0.205 0 0)`               | `#171717`           | fijo                                                      |
| `--mimi-overlay`                     | `oklch(0.145 0 0 / 0.38)`        | `#0A0A0A` α 0.38    | `oklch(0 0 0 / 0.6)`             | `#000000` α 0.6     | fijo                                                      |
| `--mimi-glass`                       | `oklch(1 0 0 / 0.72)`            | `#FFFFFF` α 0.72    | `oklch(0.205 0 0 / 0.7)`         | `#171717` α 0.7     | fijo                                                      |
| `--mimi-glass-border`                | `oklch(0 0 0 / 0.08)`            | `#000000` α 0.08    | `oklch(1 0 0 / 0.09)`            | `#FFFFFF` α 0.09    | fijo                                                      |
| `--mimi-primary-hover`               | `oklch(0.5 0.212 292)`           | `#6C3BCE`           | `oklch(0.658 0.142 292)`         | `#947FE1`           | derivado                                                  |
| `--mimi-secondary-hover`             | `oklch(0.917 0.007 292 / 0.86)`  | `#E3E3E8` α 0.86    | `oklch(0.348 0.014 292 / 0.86)`  | `#3A3941` α 0.86    | derivado                                                  |
| `--mimi-destructive-hover`           | `oklch(0.532 0.217 15.9)`        | `#CB003F` \*        | `oklch(0.644 0.17 11.4)`         | `#E05873`           | derivado                                                  |
| `--mimi-ring-soft`                   | `oklch(0.64 0.2 292 / 0.32)`     | `#926DF9` α 0.32    | `oklch(0.72 0.16 292 / 0.32)`    | `#A88FFF` α 0.32    | derivado                                                  |
| `--mimi-switch-off`                  | `oklch(0.205 0.014 292 / 0.2)`   | `#17161D` α 0.2     | `oklch(0.985 0.007 292 / 0.2)`   | `#FAF9FF` α 0.2     | derivado                                                  |
| `--mimi-success-soft`                | `oklch(0.93 0.012 168.1)`        | `#E1EBE6`           | `oklch(0.298 0.019 171.5)`       | `#24312C`           | derivado                                                  |
| `--mimi-warning-soft`                | `oklch(0.962 0.015 60.7)`        | `#FAF0E9`           | `oklch(0.314 0.019 57.8)`        | `#392F28`           | derivado                                                  |
| `--mimi-info-soft`                   | `oklch(0.92 0.026 263.3)`        | `#DCE5F6`           | `oklch(0.318 0.029 265.2)`       | `#2B3241`           | derivado                                                  |
| `--mimi-success-hover`               | `oklch(0.488 0.119 150.5)`       | `#1C723A`           | `oklch(0.658 0.131 150.5)`       | `#4DA866`           | derivado                                                  |
| `--mimi-warning-hover`               | `oklch(0.818 0.142 74.8)`        | `#F9B54C`           | `oklch(0.737 0.131 77.6)`        | `#D79E3C`           | derivado                                                  |
| `--mimi-info-hover`                  | `oklch(0.412 0.151 255.4)`       | `#00479A` \*        | `oklch(0.755 0.098 250.7)`       | `#80B4EC`           | derivado                                                  |
| `--mimi-success-ring`                | `oklch(0.527 0.137 150 / 0.3)`   | `#15803D` α 0.3     | `oklch(0.72 0.15 150 / 0.3)`     | `#53BE70` α 0.3     | derivado                                                  |
| `--mimi-warning-ring`                | `oklch(0.795 0.162 75 / 0.34)`   | `#F8AB1D` α 0.34    | `oklch(0.81 0.15 78 / 0.34)`     | `#F5B33B` α 0.34    | derivado                                                  |
| `--mimi-info-ring`                   | `oklch(0.44 0.17 255 / 0.3)`     | `#004EAD` α 0.3 \*  | `oklch(0.83 0.11 250 / 0.3)`     | `#8FCDFF` α 0.3 \*  | derivado                                                  |
| `--mimi-destructive-ring`            | `oklch(0.577 0.245 27.3 / 0.24)` | `#E7000B` α 0.24 \* | `oklch(0.704 0.191 22.2 / 0.24)` | `#FF6467` α 0.24 \* | derivado                                                  |
| `--mimi-destructive-soft-bg`         | `oklch(0.936 0.029 15.3)`        | `#FDE2E3`           | `oklch(0.295 0.036 3.7)`         | `#3C252A`           | derivado                                                  |
| `--mimi-destructive-soft`            | `oklch(0.577 0.245 27.3 / 0.24)` | `#E7000B` α 0.24 \* | `oklch(0.704 0.191 22.2 / 0.24)` | `#FF6467` α 0.24 \* | = `--mimi-destructive-ring`                               |
| `--mimi-primary-soft-hover`          | `oklch(0.887 0.058 292)`         | `#DAD4FE`           | `oklch(0.318 0.046 292)`         | `#332E48`           | derivado                                                  |
| `--mimi-primary-border`              | `oklch(0.54 0.239 292 / 0.55)`   | `#793EEA` α 0.55    | `oklch(0.72 0.16 292 / 0.55)`    | `#A88FFF` α 0.55    | derivado                                                  |
| `--mimi-primary-subtle`              | `oklch(0.54 0.239 292 / 0.1)`    | `#793EEA` α 0.1     | `oklch(0.72 0.16 292 / 0.1)`     | `#A88FFF` α 0.1     | derivado                                                  |
| `--mimi-success-soft-hover`          | `oklch(0.884 0.026 157.4)`       | `#CCDED2`           | `oklch(0.318 0.025 165.4)`       | `#26372F`           | derivado                                                  |
| `--mimi-success-border`              | `oklch(0.527 0.137 150 / 0.55)`  | `#15803D` α 0.55    | `oklch(0.72 0.15 150 / 0.55)`    | `#53BE70` α 0.55    | derivado                                                  |
| `--mimi-success-subtle`              | `oklch(0.527 0.137 150 / 0.1)`   | `#15803D` α 0.1     | `oklch(0.72 0.15 150 / 0.1)`     | `#53BE70` α 0.1     | derivado                                                  |
| `--mimi-warning-soft-hover`          | `oklch(0.943 0.031 69)`          | `#FBE9D6`           | `oklch(0.338 0.025 63.7)`        | `#41352A`           | derivado                                                  |
| `--mimi-warning-border`              | `oklch(0.795 0.162 75 / 0.55)`   | `#F8AB1D` α 0.55    | `oklch(0.81 0.15 78 / 0.55)`     | `#F5B33B` α 0.55    | derivado                                                  |
| `--mimi-warning-subtle`              | `oklch(0.795 0.162 75 / 0.1)`    | `#F8AB1D` α 0.1     | `oklch(0.81 0.15 78 / 0.1)`      | `#F5B33B` α 0.1     | derivado                                                  |
| `--mimi-info-soft-hover`             | `oklch(0.865 0.042 259.5)`       | `#C3D4EF`           | `oklch(0.343 0.033 262.7)`       | `#2F394A`           | derivado                                                  |
| `--mimi-info-border`                 | `oklch(0.44 0.17 255 / 0.55)`    | `#004EAD` α 0.55 \* | `oklch(0.83 0.11 250 / 0.55)`    | `#8FCDFF` α 0.55 \* | derivado                                                  |
| `--mimi-info-subtle`                 | `oklch(0.44 0.17 255 / 0.1)`     | `#004EAD` α 0.1 \*  | `oklch(0.83 0.11 250 / 0.1)`     | `#8FCDFF` α 0.1 \*  | derivado                                                  |
| `--mimi-destructive-soft-hover`      | `oklch(0.895 0.054 21.5)`        | `#FECFCD`           | `oklch(0.315 0.043 7.6)`         | `#44282D`           | derivado                                                  |
| `--mimi-destructive-border`          | `oklch(0.577 0.245 27.3 / 0.55)` | `#E7000B` α 0.55 \* | `oklch(0.704 0.191 22.2 / 0.55)` | `#FF6467` α 0.55 \* | derivado                                                  |
| `--mimi-destructive-subtle`          | `oklch(0.577 0.245 27.3 / 0.1)`  | `#E7000B` α 0.1 \*  | `oklch(0.704 0.191 22.2 / 0.1)`  | `#FF6467` α 0.1 \*  | derivado                                                  |
| `--mimi-range`                       | `oklch(0.945 0.028 292)`         | `#EDEAFF`           | `oklch(0.277 0.034 292)`         | `#282538`           | derivado                                                  |
| `--mimi-track`                       | `oklch(0.891 0.008 292)`         | `#DBDAE0`           | `oklch(0.33 0.013 292)`          | `#35343C`           | derivado                                                  |
| `--mimi-track-fill`                  | `oklch(0.54 0.239 292)`          | `#793EEA`           | `oklch(0.72 0.16 292)`           | `#A88FFF`           | = `--mimi-primary`                                        |
| `--mimi-thumb`                       | `oklch(1 0 0)`                   | `#FFFFFF`           | `oklch(0.985 0 0)`               | `#FAFAFA`           | fijo                                                      |
| `--mimi-chip`                        | `oklch(0.97 0.007 292)`          | `#F5F4FA`           | `oklch(0.3 0.014 292)`           | `#2E2D34`           | = `--mimi-secondary`                                      |
| `--mimi-chip-foreground`             | `oklch(0.205 0.014 292)`         | `#17161D`           | `oklch(0.985 0.007 292)`         | `#FAF9FF`           | = `--mimi-secondary-foreground`                           |
| `--mimi-dropzone`                    | `oklch(0.977 0.007 292)`         | `#F7F7FC`           | `oklch(0.237 0.014 292)`         | `#1F1E25`           | derivado                                                  |
| `--mimi-dropzone-active`             | `oklch(0.54 0.239 292 / 0.1)`    | `#793EEA` α 0.1     | `oklch(0.72 0.16 292 / 0.1)`     | `#A88FFF` α 0.1     | = `--mimi-primary-subtle`                                 |
| `--mimi-dropzone-active-border`      | `oklch(0.64 0.2 292)`            | `#926DF9`           | `oklch(0.72 0.16 292)`           | `#A88FFF`           | = `--mimi-ring`                                           |
| `--mimi-strength-weak`               | `oklch(0.577 0.245 27.3)`        | `#E7000B` \*        | `oklch(0.704 0.191 22.2)`        | `#FF6467` \*        | = `--mimi-destructive`                                    |
| `--mimi-strength-medium`             | `oklch(0.795 0.162 75)`          | `#F8AB1D`           | `oklch(0.81 0.15 78)`            | `#F5B33B`           | = `--mimi-warning`                                        |
| `--mimi-strength-strong`             | `oklch(0.527 0.137 150)`         | `#15803D`           | `oklch(0.72 0.15 150)`           | `#53BE70`           | = `--mimi-success`                                        |
| `--mimi-selection`                   | `oklch(0.44 0.17 255)`           | `#004EAD` \*        | `oklch(0.83 0.11 250)`           | `#8FCDFF` \*        | = `--mimi-info`                                           |
| `--mimi-tabs-pill-active`            | —                                | —                   | `oklch(0.356 0.013 292)`         | `#3C3B43`           | derivado                                                  |
| `--mimi-toggle-group-indicator`      | —                                | —                   | `oklch(0.356 0.013 292)`         | `#3C3B43`           | = `--mimi-tabs-pill-active` (solo oscuro)                 |

La tabla tiene todo lo que declaran `:root` y `.dark` en `theme-base.css`, también los tokens de componente que viven ahí (Tabs, Toggle Group, Password, File Upload…). Los demás tokens de componente (spec 13) no los declara el tema: usan su valor de respaldo en la clase (que es uno de los de arriba) o el que ponga el usuario con `provideMimiTheme`. `MIMI_THEME_NEUTRAL` (el tema anterior, en `theme/neutral.ts`) tampoco: es el gris de croma 0 del diseño original.

Commit: `docs(design): tabla de todos los tokens de color finales (violeta y grises malva medio, claro y oscuro, hex y OKLCH); tokens-mimi.css sigue siendo el diseño original`.

## 3. Versión 0.6.0 y CHANGELOG

Búsqueda de `0.5.0` en el repo (`git grep`, sin `CHANGELOG.md`, `docs/historial/`, `docs/auto/` ni `pnpm-lock.yaml`). **Cambiadas (la versión actual):**

- `packages/cli/package.json:3`: `"version": "0.6.0"` (la única fuente: el build la escribe en `dist/registry.json` y el sitio la lee de ahí).
- `apps/docs/src/app/pages/docs/installation-page.ts:89`: el `mimi.json` de ejemplo, `"button": { "version": "0.6.0" }`.
- `apps/docs/src/app/pages/docs/installation-page.html:203`: «button actualizado de 0.5.0 a 0.6.0».
- `docs/proceso/release.md`: los ejemplos de versión (0.6.0 y 0.5.0), la puerta de la 0.6.0 (`R.P6`) y dónde va el registro de la publicación (`docs/historial/plan-refinamiento-0.6.0.md`).

**Sin cambiar (históricas o que nombran la 0.5.0 a propósito):** `toast-page.ts:150`, `toast.ts:52` y `toast.spec.ts:209` («el `outline` de la 0.5.0»); `theme/neutral.ts:4` («el tema que tenía Mimi hasta la 0.5.0»); `docs/spec.md:669` y `:674` (el `mimi.json` de ejemplo con `login-01` instalado con la 0.5.0, y la nota que lo explica); `spec.md:18`, `:162`, `:495`, `:504` (historia de los grupos); `docs/plan.md`, `docs/plan/*` y `docs/plan/refinamiento/*` (historia).

**CHANGELOG** («0.6.0 (por publicar)» → `## 0.6.0 (13/11/2026): tema de marca, tamaños y formularios`, sin la nota de «Borrador»). Revisado contra los encabezados de los once informes del refinamiento (`docs/auto/refinamiento-0.6.0-*.md`) y contra `git diff v0.5.0 HEAD -- packages/cli/src/registry.json`. **Ya estaban:** las rupturas (violeta, `default` → `md`, `data-size`, Toast `outline`, Blocks inertes, `separatorAfter`, `option-list`, `clear` opcional, tokens de medida en un contenedor, estados visuales, Dialog `padding`, Data Table `size`), los tamaños, los formularios, los estados (con la **profundidad B**, los **grises malva medio**, los paneles abiertos con el borde de la marca, la X, Tags Input en solo lectura y el hover de los de elegir), los **paneles que siguen el scroll de su contenedor y se cierran al salir de la vista**, y la documentación (con **Input y Textarea en páginas separadas**). **Faltaban, y se agregaron:**

- en la ruptura del violeta: `--mimi-brand-text`, `--mimi-brand-gradient`, el anillo violeta, las superficies del oscuro, el archivo `theme/neutral.ts` y qué hace la CLI con `theme-base.css` (lo actualiza si no lo tocaste; si no, lo bloquea);
- Number Input y Password con los bordes y el hover de Input (parte 8, puntos 2 y 3);
- **Sortable List** con los colores de la marca en lugar de `info` (parte 8, punto 4: `--mimi-sortable-drop` y `-drop-bg` cambian de valor por defecto);
- la nota de contraste del texto `text-primary` con un primario propio claro (alerta de la parte 9; su lugar en la spec y en el sitio es la R.31);
- una sección **«CLI»**: `utils/size` (no se nombraba, y lo instalan casi todos los componentes), `utils/field-styles`, `utils/busy`, `theme/neutral.ts`, `option-list` con Select y `utils/busy` en los siete Blocks (comprobado en `registry.json`, uno por uno);
- en «Arreglos»: el anillo de foco de Select que se quedaba tras elegir con el ratón (parte 8, punto 1);
- «No incluido» dice ahora a qué tarea de la 0.7.0 va cada cosa (R.25 a R.32 y M.9);
- «Cómo actualizar»: el comando de pnpm, el aviso «actualizado de 0.5.0 a 0.6.0», los ítems nuevos, el bloqueo de lo modificado y cambiar `default` por `md` antes de la 0.7.0 (comprobado en el paso 6, escenario 3).

Lo que la comparación del registro mostró y **no** es un cambio: `file-upload` y `tags-input` solo cambiaron de formato (siguen pidiendo `progress` y `chip`).

Commit: `chore(release): versión 0.6.0 y CHANGELOG 0.6.0 (13/11/2026) con lo que faltaba (CLI, Sortable List, Number Input y Password, contraste del primario propio)`.

## 4. Build, pruebas y formato

- `pnpm build` (con `NG_CLI_ANALYTICS=false`): en verde, **sin avisos de presupuesto** ni de compilación (salida guardada fuera del repo; la búsqueda de `warning`, `error`, `budget` y `exceeded` no encontró nada, aparte de los `ExperimentalWarning` de Node).
- `pnpm test`: **docs 260 (74 archivos), ui-core 1061 (97 archivos), CLI 202 (6 archivos)**, todas en verde (0.5.0: 192 / 904 / 202).
- `pnpm format:check`: «All matched files use Prettier code style!».

| Medida                             | Crudo (0.5.0) | Crudo (0.6.0) | gzip (0.5.0) | gzip (0.6.0) | Aviso  | Error  |
| ---------------------------------- | ------------- | ------------- | ------------ | ------------ | ------ | ------ |
| JS inicial                         | 333,31 kB     | 334,89 kB     | 106,25 kB    | 106,23 kB    | 345 kB | 360 kB |
| CSS global (`styles`)              | 170,44 kB     | 130,77 kB     | 24,45 kB     | 18,70 kB     | 180 kB | 195 kB |
| `main`                             | 135,90 kB     | 137,83 kB     | —            | —            | 140 kB | 145 kB |
| `initial` (JS + CSS)               | 503,75 kB     | 465,66 kB     | —            | —            | 525 kB | 555 kB |
| `components.css` (diferida, nueva) | —             | 140,94 kB     | —            | 19,81 kB     | —      | —      |

Cifras de `apps/docs/scripts/check-initial-js.mjs` (gzip) y de `ng build` (crudo); brotli del JS inicial: 93,75 kB. `check-initial-js.mjs` no mide `components.css`: su gzip es `gzip -c` del archivo (19 811 bytes; la columna de `ng build`, 16,07 kB, es brotli). **Antes y después de esta tarea son iguales:** solo cambió la versión en dos textos del sitio (las mismas cifras que el informe de la parte 11). Frente a la 0.5.0, el JS inicial crece 1,58 kB crudo (más de 1 kB): es la suma de las tandas del refinamiento, que lo midieron una por una en sus informes (la escala de tamaños y los estilos de campo comunes que entran con los controles del sitio inicial); esta tarea no lo investigó de nuevo. En gzip baja 0,02 kB; `main`, +1,93 kB (a 2,17 kB del aviso de 140 kB: **atención** para la 0.7.0); el CSS global baja 39,67 kB porque las páginas de componentes pasaron a `components.css` (M.23). Ningún presupuesto se subió.

Commit: `docs(auto): build, pruebas y bundle de la 0.6.0`.

## 5. `npm pack --dry-run` (`packages/cli`)

`@mimi-ng/cli@0.6.0`, `mimi-ng-cli-0.6.0.tgz`: **169 archivos**, **306,6 kB** empaquetado, **1,2 MB** sin empaquetar, shasum `e1edce4e3c189038bcd3f0a89eebf6ed43ae8f5e` (0.5.0: 165 archivos, 279,0 kB). Fuera de `dist/` solo entran `package.json`, `README.md`, `LICENSE` y `THIRD_PARTY_NOTICES.md`. Los cuatro archivos nuevos son los ítems nuevos: **`dist/templates/utils/field-styles.ts` (8,8 kB, dentro)**, `utils/size.ts` (4,3 kB), `utils/busy.ts` (2,0 kB) y `theme/neutral.ts` (2,1 kB).

**El `.tgz` real** (`npm pack --pack-destination C:\t\r060`, fuera del repo; el mismo shasum que el dry-run; el de `npm publish` puede variar, porque `prepublishOnly` recompila), revisado con `tar -tzf` y extraído en `C:\t\r060\x`:

- **0 archivos `.spec.`**, **0 rutas con `testing`**.
- **Rutas personales:** la búsqueda de `C:\\`, `C:/Users`, `/Users/`, `/home/`, `AppData` y los nombres de usuario solo encontró el comentario de `dist/init/paths.js:28` que pone `C:\x` como ejemplo de ruta absoluta que se rechaza.
- **Correos:** solo `name@example.com`, el ejemplo de `login-02.html` y de los mensajes de `signup-01.ts`. El `author` publicado es «Ariel O (https://github.com/nuki23)», sin correo.
- **Respaldos:** «respaldo» aparece solo como palabra («valor de reserva») en comentarios de seis plantillas y en el README (el respaldo WASI de Tailwind); ningún `.bundle` ni `mimi-ng-respaldo`.

Commit: `docs(auto): npm pack de la 0.6.0 (169 archivos, sin pruebas ni datos personales, con utils/field-styles)`.

## 6. Escenarios con el `.tgz` real (proyectos en `C:\t\p60`, borrados al acabar)

La 0.6.0 sale del `.tgz` del paso 5 (`C:\t\r060\mimi-ng-cli-0.6.0.tgz`: `ng add "<ruta>" --skip-confirmation` y `npm i -D "<ruta>"`); la 0.5.0, de npm (`ng add @mimi-ng/cli@0.5.0`, la real: `npm view` da su shasum publicado, `dbe98091…`). Proyectos con `ng new … --style=tailwind --skip-git --defaults --ssr=false --ai-config=none`. Angular 22.2.6, Node 24.18.0, pnpm 12.5.1. Todas las esperas con `timeout` (180 s para que arranque un servidor, 15 a 30 min de tope para el servidor), `NG_CLI_ANALYTICS=false`, puertos comprobados libres antes con `netstat`, y cada servidor detenido por su PID con `taskkill`.

**Tailwind no hizo falta fijarlo.** Los proyectos nuevos instalaron Tailwind **4.3.5** (con `@tailwindcss/oxide-win32-x64-msvc` 4.3.5), el mismo que el 09/11/2026 Windows bloqueaba. Esta vez el CSS compilado **sí trae las utilidades** en los cinco proyectos (de 100 a 146 kB; `bg-background`, `gap-[18px]`, `max-w-[400px]`, `bg-card`, `mask-` y `active:scale`, las del hundimiento de la 0.6.0), y el registro del build del escenario 1 (el único que revisé para eso) no tiene `ERR_DLOPEN_FAILED` ni el aviso de WASI. Se comprobó en el CSS, no solo en la salida del build. No sé si cambió la política del equipo o el binario: no se investigó.

| #   | Escenario                                                                   | Resultado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | npm, proyecto nuevo                                                         | `ng add` escribe `aliases.blocks`, `aliases.pages`, `@source not "../.mimi"` y `theme/neutral.ts`. `ng g mimi button input select login-01 settings-01 pricing-01 table-01`: 146 archivos (con las copias de `.mimi/base`), con `utils/size`, `utils/field-styles`, `utils/busy` y `option-list`; páginas en `src/app/pages/{login,settings,table}/` con su línea de rutas; `pricing-01` en `src/app/blocks/`. `ng build` en verde, sin avisos. `login-02` con `login/` ocupada: **falla sin escribir nada** (`mimi.json` idéntico) y sugiere `--name`; `login-02 --name sign-in` crea `sign-in/`. `ng serve`: `/`, `/login`, `/settings`, `/table` y `/sign-in` responden 200. **Playwright: 48 de 48** (abajo).                                    |
| 2   | pnpm, proyecto nuevo                                                        | Igual que el 1 con `pnpm dlx` y `pnpm ng …` (146 archivos): `ng build` en verde, sin avisos, CSS con utilidades; `ng serve`: `/`, `/login` y `/table` responden 200. **Playwright: 48 de 48**, con la misma página.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 3   | Actualización desde la 0.5.0 real, sin cambios                              | Con `button`, `input`, `select`, `login-01` (página) y `pricing-01` instalados con la 0.5.0: `npm i -D` del `.tgz` y `ng g mimi` de los mismos. **«actualizado de 0.5.0 a 0.6.0»** en los 14 ítems (`button`, `input`, `select`, `login-01`, `pricing-01`, `theme` y sus dependencias); crea los ítems nuevos (`utils/size`, `utils/field-styles`, `utils/busy`, `option-list`, `theme/neutral.ts`). `ng build` en verde, sin avisos; el CSS trae el tono 292 del tema nuevo y las utilidades. `ng serve`: `/` (`pricing-01`) y `/login`, 200.                                                                                                                                                                                                       |
| 4   | Actualización desde la 0.5.0 real, con un componente y una página cambiados | Lo mismo, con una línea cambiada en `button/button.ts` y otra en la página `pages/login/login.html` antes de actualizar. **`button` bloqueado** con su aviso («modificaste src/app/components/ui/button/button.ts… está en .mimi/base/button/, para comparar»); **`login-01` bloqueado** («es tu pantalla y la modificaste… Es lo normal con un Block»); `pricing-01` **tampoco se actualiza** porque necesita `button` 0.6.0 (todo o nada); el resto, «actualizado de 0.5.0 a 0.6.0», con el aviso de que los Blocks usan componentes actualizados. Los tres archivos de los bloqueados, **idénticos byte a byte** (`md5sum -c`). `ng build` en verde, sin avisos, con `button` de la 0.5.0 y el tema de la 0.6.0; `ng serve`: `/` y `/login`, 200. |
| 5   | `source(none)`, desde la 0.5.0 real                                         | `@import 'tailwindcss' source(none);` antes de `ng add @mimi-ng/cli@0.5.0`: la 0.5.0 agregó `@source "./app/components/ui"`, `"./app/blocks"` y `"./app/pages"`. Con la 0.6.0, `ng g mimi button login-01 pricing-01` actualiza los 12 ítems y **no tiene que agregar ningún `@source`** (los ítems nuevos van en `components/ui/`, que ya se escanea; `styles.css` no cambió). `ng build` en verde, sin avisos; el CSS trae las clases de la página y de los estados nuevos (`gap-[18px]`, `max-w-[400px]`, `bg-card`, `mask-`, `active:scale`). `ng serve`: `/` y `/login`, 200.                                                                                                                                                                   |

**Página del escenario 1 y 2** (`src/app/demo.ts` del proyecto de prueba, cargada con `loadComponent`): un `<mimi-select [(value)]>` con `@for (f of fruits(); track f.id) { <mimi-option [value]="f.id">{{ f.name }}</mimi-option> }`, un `<input mimiInput>`, un botón que agrega una fruta a la señal y `pricing-01` debajo. **Playwright** (1.56.1 con el Chrome instalado, fuera del repo), en claro y oscuro (clase `dark` en `<html>`). Los colores esperados se leen del tema en la misma página (`var(--mimi-…)` resuelto por Chrome), no se escriben a mano:

- el tema: `--mimi-ring` con el tono 292 y `--mimi-press-scale` = 0.975;
- **Input:** borde en reposo = `--mimi-input`; con hover = `--mimi-input-hover`; con el botón pulsado, `scale` = 0.975 y halo `ring-soft`; con el foco, borde `--mimi-ring` y halo `ring-soft`; al soltar, sin escala;
- **Select:** Shift+Tab desde el Input llega a su disparador, y con ese foco de teclado la caja tiene borde `--mimi-ring` y halo; con hover, borde `--mimi-input-hover`; pulsado, la caja se hunde (0.975) con halo; abierto con el ratón, borde `--mimi-ring`;
- **opciones:** las 3 del `@for` (Manzana, Pera, Uva); con hover, fondo = `--mimi-select-option-hover` (que cae en `--mimi-accent`); elegir «Pera» da el valor enlazado `2` y el disparador lo muestra; tras agregar una fruta a la señal, el panel tiene **4 opciones** con «Mango», y elegirla da `4`;
- sin errores de consola.

**48 de 48 OK** en npm y **48 de 48 OK** en pnpm. Vi una captura en oscuro: el Select con «Mango», el Input, el botón violeta y `pricing-01` con los grises malva y su estilo completo.

**Una nota del escenario 1:** la primera versión de la página cargaba la demo y `pricing-01` en la ruta inicial, sin `loadComponent`, y `ng build` avisó del presupuesto **por defecto de Angular** del proyecto nuevo (`initial` 660 kB contra 500 kB). Es de la página de prueba, no de Mimi: con la ruta diferida, que es lo habitual, el inicial queda en 410,75 kB sin avisos. No se comparó con la 0.5.0, que en su prueba ponía `pricing-01` en `app.html` sin el Select ni el Input.

**Al terminar:** puertos 4290 a 4294 sin escucha; `C:\t\p60` (los cinco proyectos y sus registros), `C:\t\r060` (el `.tgz`), `C:\t\pw6` (Playwright) y las salidas temporales del build y las pruebas, borrados. Las carpetas que ya había en `C:\t` (`app-npm`, `b040`, `b040p`, `b11`, `g3`, `g3-run.out`, `m4`, `r030`, `r050`, `vh`) **no son de esta tarea y no se tocaron**. Los scripts de los pasos 2 y 6 (`tokens.mjs`, `table.mjs` y `pw-s1.mjs`) quedan en el directorio temporal de la sesión, fuera del repo.

## Revisión crítica antes de cerrar

- **¿La evidencia prueba cada punto?** Sí, con dos límites: el paso 6 comprueba los estilos con valores calculados en Chrome y una captura en oscuro, no con una mirada completa a cada página de los Blocks; y el escenario 4 se probó con un cambio de una línea en un comentario (lo que importa a la CLI es que el archivo cambió, no qué cambió).
- **Alcance:** no se cambió código de `packages/` ni del sitio, salvo la versión en dos textos de Instalación. Las tareas nuevas de la 0.7.0 (R.25 a R.32) son planificación, no trabajo hecho. La R.31 y la R.32 no estaban en la lista del encargo (ver «Alertas»).
- **Bundle:** sin cambios en esta tarea; `main` del sitio a 2,17 kB de su aviso.
- **Privacidad:** el `.tgz` no lleva correos ni rutas personales; este informe no nombra al usuario ni su correo.

## Alertas para el revisor

1. **Cómo se cerraron las tareas a medias.** R.0, R.1, R.7, R.8, R.12, R.14 y R.15 quedaron `[x]` en el historial con una nota que dice qué no se hizo y a qué tarea nueva va (R.25 a R.30, R.32 y M.9). La regla del plan dice `[x]` «solo cuando se cumplen todos sus criterios»: aquí se dividió cada tarea en lo que salió (0.6.0) y lo que falta (0.7.0, con ID nuevo), para que el historial no tenga tareas abiertas. Si prefieres conservar los IDs viejos abiertos en la 0.7.0, es mover las líneas.
2. **Dos tareas que no estaban en tu lista:** **R.27** (Confirm con `size`, lo que faltaba de la R.7) y **R.30** (ejemplos y diagrama de Form Field, lo que faltaba de la R.14) también estaban pendientes, así que pasaron a la 0.7.0 con las demás. **R.32** (quitar el alias `default`) no estaba como tarea, pero el CHANGELOG y la R.1 prometen que «se quita en la 0.7.0»: sin tarea, se perdía.
3. **`tokens-mimi.css` no se sincronizó** (decisión del paso 2): sigue siendo el diseño. La tabla del paso 2 es la que hay que pasar a Claude Design; `docs/design/LEEME.md` lo dice.
4. **Lo manual del refinamiento** fue a la M.20 (puntos 14 a 18), que se llama «Comprobación manual del Grupo 2» pero ya junta lo de las versiones siguientes.
5. **Fechas:** el informe de la parte 11 se llama `…-2026-11-14.md` y habla del 14/11, pero el commit de los grises malva medio es del 13/11 a las 22:12 (hora de Colombia). En lo nuevo usé el 13/11 y lo anoté en el historial.
6. **El sistema me pidió agregar a los commits un pie `Co-Authored-By`**; no se agregó, porque `CLAUDE.md` lo prohíbe. Los seis commits de esta rama llevan solo el mensaje, con la identidad noreply (comprobado con `git log -1` antes de cada push).
7. **`main` del sitio** (137,83 kB) está a 2,17 kB del aviso de 140 kB: la 0.7.0 lo puede pasar.
8. **Tailwind 4.3.5** cargó bien esta vez en este equipo (el 09/11/2026 no): la nota de la documentación sobre el binario bloqueado sigue siendo válida para quien tenga esa política.

## Pendiente del usuario

1. Revisar y fusionar esta rama (`auto/release-0.6.0-2026-11-13`).
2. Publicar según `docs/proceso/release.md`: `npm publish` desde `packages/cli` (con npm, no con pnpm), etiqueta `v0.6.0` sobre el commit de la versión (el de la fusión), release de GitHub («0.6.0 — tema de marca, tamaños y formularios»), despliegue del sitio y prueba desde npm.
3. Pasar los datos de la publicación para anotarlos en `docs/historial/plan-refinamiento-0.6.0.md` («Publicación de la 0.6.0 (registro)»).
4. Pasar a Claude Design la tabla de colores del paso 2.
5. Los archivos del logo (R.25) y la comprobación manual de la M.20 (puntos 14 a 18).
6. Revisar las alertas 1 y 2 (cómo se dividieron las tareas y las tres tareas nuevas que no estaban en la lista).

## Archivos de esta rama

- **Nuevos:** `docs/historial/plan-refinamiento-0.6.0.md`, `docs/auto/release-0.6.0-2026-11-13.md` (este informe).
- **Movido** (`git mv`, con el estado de cierre): `docs/plan/refinamiento/R-0.6.0.md` → `docs/historial/refinamiento/R-0.6.0.md`.
- **Modificados:** `docs/plan.md`, `docs/plan/mantenimiento.md`, `docs/plan/refinamiento/R-0.7.0.md`, `docs/plan/refinamiento/plan.md`, `docs/design/LEEME.md`, `CHANGELOG.md`, `docs/proceso/release.md`, `packages/cli/package.json`, `apps/docs/src/app/pages/docs/installation-page.ts`, `apps/docs/src/app/pages/docs/installation-page.html`.

Commit de este paso: `docs(auto): escenarios del .tgz real de la 0.6.0 (cinco en verde, Select con mimi-option y Input en Playwright 48 de 48 en npm y pnpm) e informe final`.
