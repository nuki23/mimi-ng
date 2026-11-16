---
description: Recorre la puerta de un grupo del plan (G<n>.P) y entrega lo comprobado, lo que falta y lo que hace el usuario
argument-hint: <ID de la puerta, ej. G2.P>
---

Recorre la puerta **$ARGUMENTS** del plan de Mimi. **No publiques nada**: ni npm, ni etiquetas, ni releases, ni despliegues (`CLAUDE.md`, «Forma de trabajar», «Commit y push»).

## 1. Leer

1. La puerta general: «Puerta del grupo» en «Cómo usar este plan» (`docs/plan.md`), los nueve puntos.
2. La puerta del grupo: su archivo en `docs/plan/` (por ejemplo, la G4.P en `docs/plan/grupo-4.md`; la G2.P, ya cerrada, está en `docs/historial/grupo-2/G2.P.md`, y la G3.P, en `docs/historial/plan-grupo-3.md`; búscalo con `grep -rln "$ARGUMENTS" docs/plan/`), con lo específico del grupo y sus «Criterios de hecho».
3. El índice del grupo en `docs/plan.md`: todas sus tareas tienen que estar `[x]` (salvo la puerta). Si alguna no lo está, detente y dilo: la puerta no se recorre con tareas abiertas.
4. `docs/proceso/release.md` (lo que hace el usuario al final).

Marca la puerta `[~]` en su archivo y en el índice, con su fila en «En curso» (`CLAUDE.md`, «Forma de trabajar», paso c), y propone un plan breve antes de cambiar archivos (paso d).

## 2. Comprobar (lo que se puede sin el usuario)

Para cada punto, la evidencia: el comando y su resultado, o el archivo y la línea.

- **Spec al día:** sección 4 (catálogo, archivos por componente y la tabla del grupo), 13 (una tabla de tokens por componente del grupo), 2 (versiones, contra `package.json`) y 12 (compatibilidad).
- **CHANGELOG:** la sección de la versión, con «Cómo actualizar desde la anterior» si cambia algo publicado, y lo específico que pida la puerta del grupo.
- **Rupturas y obsoletos, según la versión** (spec 12, «Rupturas y obsoletos», decidido por el usuario el 16/11/2026; la versión, en `packages/cli/package.json` o la que se va a publicar):
  - **Antes de la 1.0.0:** ningún obsoleto de transición en `packages/ui-core` (`grep -rn "@deprecated\|deprecad" packages/ui-core/src`: cada resultado se justifica o es un hallazgo) y **cada ruptura** del grupo (las marcadas RUPTURA en los informes y en `docs/auto/decisiones-por-defecto.md`, y cualquier cambio de API en `git diff <base>..HEAD`) está en «Rupturas» del CHANGELOG con su «Cómo actualizar».
  - **Desde la 1.0.0:** ningún cambio incompatible en componentes, `utils` ni tema en una versión menor o de parche; lo que se quite estaba marcado obsoleto (`@deprecated`, CHANGELOG) en una versión menor anterior y solo se quita en una mayor.
- **Conteos y listas:** el número de componentes y la lista en Fundamentos (`FOUNDATION_PACKAGES` y la tabla de paquetes), `INTRODUCTION_COMPONENTS` de Introducción, la landing, el README de la CLI y el `x-prompt` de `packages/cli/src/ui/schema.json`: los mismos componentes en todos (compáralos con grep o un script, no a ojo).
- **Páginas con la plantilla:**
  - `doc-pages.spec.ts` en verde (cada componente del grupo registrado en `PAGES`; la lista de pendientes de la migración ya no existe);
  - cada excepción de `EXCEPTIONS` está en `docs/spec/plantilla-pagina.md` con la aprobación del usuario y su fecha;
  - cada componente del grupo tiene su `<nombre>.page.ts` y ningún `*-page.html`.
  - Evidencia: la salida de la prueba y `git ls-files 'apps/docs/src/app/pages/docs/components/**/*-page.html'` vacío.
- **Registro de la CLI:** un ítem en `registry.json` por componente del grupo, con sus dependencias; `pnpm test:cli` en verde.
- **Presupuestos:** `pnpm build` (informe de `check-initial-js.mjs`): JS inicial y CSS global, crudo y gzip, antes del grupo y ahora (`CLAUDE.md`, «Forma de trabajar», «Bundle»; spec 10).
- **Tabla acumulada del CSS global y del `initial`**, si la pide la puerta: una fila por componente, de los informes de bundle de cada tarea del grupo (en sus archivos de `docs/plan/` o en el historial). Si falta el informe de una tarea, dilo; no lo inventes.
- **Aspecto en la spec:** lo nuevo de aspecto de cada componente del grupo (sin precedente en el tema) está en la spec. `docs/design/` es referencia histórica: no se compara el grupo con Claude Design (decidido por el usuario el 14/11/2026).
- **Controles nuevos en `/docs/states`:** cada control de formulario del grupo tiene su fila en la cuadrícula de Estados (`ROWS` en `apps/docs/src/app/pages/docs/states/states-page.ts`, que falla en su prueba si falta) y usa las piezas de `utils/field-styles.ts`. Revísalo en la página, en claro y oscuro: hover, foco, clic, deshabilitado, solo lectura y error iguales a los demás.
- `pnpm build`, `pnpm test`, `pnpm format:check` en verde.
- Búsqueda de correos, tokens y rutas personales en lo que se va a publicar (`CLAUDE.md`, «Forma de trabajar», «Privacidad»).
- **Capturas fuera del repo** (`CLAUDE.md`, A10): `git ls-files docs/auto/capturas` vacío y ninguna imagen de comprobación nueva en el grupo (`git diff --stat <base>..HEAD -- '*.png' '*.jpg'` sin capturas); el informe cita la ruta `C:\t\capturas\<fecha>\`.

## 3. Entregar

Tres listas:

1. **Comprobado**, con la evidencia de cada punto. «Páginas con la plantilla» va como fila propia, para que el revisor la vea separada de las pruebas generales.
2. **Falta** (o **NO COMPROBADO**), con qué haría falta para comprobarlo.
3. **Lo que hace el USUARIO**, con los comandos de `docs/proceso/release.md`:
   - las pruebas reales con el `.tgz` en 4 escenarios (npm nuevo, pnpm nuevo, actualización desde la versión anterior sin cambios y con un archivo modificado), en una ruta corta en Windows;
   - las pruebas a mano que pida el grupo (lector de pantalla, teléfonos);
   - la publicación en npm, la etiqueta, la release de GitHub, el despliegue y la prueba desde npm.

Cuando el usuario confirme que hizo lo suyo y todo esté comprobado: marca la puerta `[x]` en su archivo y en el índice, quita la fila de «En curso» y mueve el texto del grupo al historial como dice la puerta (paso f del protocolo) y «Al cerrar un grupo» de `docs/plan.md` (`git mv` de la carpeta del grupo a `docs/historial/`; lo manual pendiente, a una tarea abierta). Informa archivos, alertas y el mensaje de commit (paso h).
