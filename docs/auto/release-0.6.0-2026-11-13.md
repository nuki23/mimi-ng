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
