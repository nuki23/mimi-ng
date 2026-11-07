---
description: Recorre la puerta de un grupo del plan (G<n>.P) y entrega lo comprobado, lo que falta y lo que hace el usuario
argument-hint: <ID de la puerta, ej. G2.P>
---

Recorre la puerta **$ARGUMENTS** del plan de Mimi. **No publiques nada**: ni npm, ni etiquetas, ni releases, ni despliegues (`CLAUDE.md`, «Forma de trabajar», «Commit y push»).

## 1. Leer

1. La puerta general: «Puerta del grupo» en «Cómo usar este plan» (`docs/plan.md`), los nueve puntos.
2. La puerta del grupo: su archivo en `docs/plan/` (por ejemplo, la G3.P en `docs/plan/grupo-3-blocks.md`; la G2.P, ya cerrada, está en `docs/historial/grupo-2/G2.P.md`; búscalo con `grep -rln "$ARGUMENTS" docs/plan/`), con lo específico del grupo y sus «Criterios de hecho».
3. El índice del grupo en `docs/plan.md`: todas sus tareas tienen que estar `[x]` (salvo la puerta). Si alguna no lo está, detente y dilo: la puerta no se recorre con tareas abiertas.
4. `docs/proceso/release.md` (lo que hace el usuario al final).

Marca la puerta `[~]` en su archivo y en el índice, con su fila en «En curso» (`CLAUDE.md`, «Forma de trabajar», paso c), y propone un plan breve antes de cambiar archivos (paso d).

## 2. Comprobar (lo que se puede sin el usuario)

Para cada punto, la evidencia: el comando y su resultado, o el archivo y la línea.

- **Spec al día:** sección 4 (catálogo, archivos por componente y la tabla del grupo), 13 (una tabla de tokens por componente del grupo), 2 (versiones, contra `package.json`) y 12 (compatibilidad).
- **CHANGELOG:** la sección de la versión, con «Cómo actualizar desde la anterior» si cambia algo publicado, y lo específico que pida la puerta del grupo.
- **Conteos y listas:** el número de componentes y la lista en Fundamentos (`FOUNDATION_PACKAGES` y la tabla de paquetes), `INTRODUCTION_COMPONENTS` de Introducción, la landing, el README de la CLI y el `x-prompt` de `packages/cli/src/ui/schema.json`: los mismos componentes en todos (compáralos con grep o un script, no a ojo).
- **Registro de la CLI:** un ítem en `registry.json` por componente del grupo, con sus dependencias; `pnpm test:cli` en verde.
- **Presupuestos:** `pnpm build` (informe de `check-initial-js.mjs`): JS inicial y CSS global, crudo y gzip, antes del grupo y ahora (`CLAUDE.md`, «Forma de trabajar», «Bundle»; spec 10).
- **Tabla acumulada del CSS global y del `initial`**, si la pide la puerta: una fila por componente, de los informes de bundle de cada tarea del grupo (en sus archivos de `docs/plan/` o en el historial). Si falta el informe de una tarea, dilo; no lo inventes.
- **D6:** `docs/design/correcciones-pendientes.md` con un apartado por cada componente del grupo.
- `pnpm build`, `pnpm test`, `pnpm format:check` en verde.
- Búsqueda de correos, tokens y rutas personales en lo que se va a publicar (`CLAUDE.md`, «Forma de trabajar», «Privacidad»).

## 3. Entregar

Tres listas:

1. **Comprobado**, con la evidencia de cada punto.
2. **Falta** (o **NO COMPROBADO**), con qué haría falta para comprobarlo.
3. **Lo que hace el USUARIO**, con los comandos de `docs/proceso/release.md`:
   - las pruebas reales con el `.tgz` en 4 escenarios (npm nuevo, pnpm nuevo, actualización desde la versión anterior sin cambios y con un archivo modificado), en una ruta corta en Windows;
   - las pruebas a mano que pida el grupo (lector de pantalla, teléfonos);
   - la publicación en npm, la etiqueta, la release de GitHub, el despliegue y la prueba desde npm.

Cuando el usuario confirme que hizo lo suyo y todo esté comprobado: marca la puerta `[x]` en su archivo y en el índice, quita la fila de «En curso» y mueve el texto del grupo al historial como dice la puerta (paso f del protocolo) y «Al cerrar un grupo» de `docs/plan.md` (`git mv` de la carpeta del grupo a `docs/historial/`; lo manual pendiente, a una tarea abierta). Informa archivos, alertas y el mensaje de commit (paso h).
