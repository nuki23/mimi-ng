# Historial del plan: Blocks (v0.4.0)

Texto de las tareas de los Blocks de la 0.4.0 al cerrar su puerta (07/11/2026, rama `auto/blocks-0.4.0-2026-11-06`). No se edita: lo vigente está en `docs/plan.md` y en `docs/spec.md`.

**Dónde está el texto.** Cada tarea tenía su archivo en `docs/plan/blocks/` (el nombre es el ID). Esos archivos se movieron tal cual (`git mv`) a `docs/historial/blocks/`, con su texto completo y el estado del cierre; este archivo es su índice.

- [B.1 Ítems de tipo `block` en el registro, en la CLI y en el showcase](blocks/B.1.md)
- [B.2 `login-01`](blocks/B.2.md)
- [B.3 `login-02`](blocks/B.3.md)
- [B.4 `signup-01`](blocks/B.4.md)
- [B.5 `otp-01`](blocks/B.5.md)
- [B.10 Tabs con orientación vertical](blocks/B.10.md)
- [B.6 `settings-01`](blocks/B.6.md)
- [B.7 `pricing-01`](blocks/B.7.md)
- [B.P Puerta de los Blocks](blocks/B.P.md): con los escenarios del `.tgz` final.

**Decisiones:** las 20 de «Blocks 0.4.0» las decidió el usuario el 07/11/2026 (adoptó las recomendaciones; la B.3-a con un degradado neutro provisional). Están en cada tarea y en `docs/auto/decisiones-por-defecto.md`, «Decididas por el usuario: Blocks 0.4.0»; las vigentes como regla, en la spec 4 («Blocks»), 5 y 10.

**Revisión independiente de la rama (07/11/2026)**, arreglada antes de cerrar la puerta: G1 (`@source` de los Blocks con `source(none)`), M1 (aviso de un componente que usa un Block), M2 (alias absolutos o fuera del proyecto), M3 (foco al guardar `settings-01` desde otra sección), M4 (reintentar el mismo código en `otp-01`), M5 (textos de relleno genéricos) y menores; M.21 y M.22 registradas en `docs/plan/mantenimiento.md`.

**Publicación de la 0.4.0 (registro):** la hizo el usuario (`docs/proceso/release.md`); datos del usuario, anotados el 07/11/2026:

- `@mimi-ng/cli@0.4.0` publicada en npm el 07/11/2026, sobre las 14:56 (hora de Colombia, UTC−5), con `npm publish` desde `packages/cli`.
- `npm view @mimi-ng/cli dist-tags` da `{ latest: '0.4.0' }`, y `versions` termina en `0.4.0`.
- Paquete: 149 archivos, 232,9 kB, shasum `e54248945c862d17dbd229e427601cacf56e35d7`.
- Etiqueta `v0.4.0` sobre `0860c55` (fusión del PR #9).
- Release de GitHub creada como **Latest**.
- Despliegue del sitio: no informado en este registro.
- Prueba desde npm: el usuario instaló y probó los Blocks desde npm y no reportó problemas (el usuario corregirá esta línea si hubo alguno).

Informes del modo autónomo: `docs/auto/plan-0.4.0-2026-11-06.md` (el detalle del plan), `docs/auto/blocks-0.4.0-2026-11-06.md` (las tareas, con la tabla acumulada del bundle) y `docs/auto/revision-blocks-0.4.0-2026-11-07.md` (los arreglos de la revisión y la puerta).
