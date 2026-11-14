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
