# Mimi (@mimi-ng) — instrucciones para agentes

Mimi es una biblioteca de UI para Angular 22 + Tailwind CSS 4 con el modelo de copiar y pegar (CLI `@mimi-ng/cli`). Repo: github.com/nuki23/mimi-ng. Sitio: ng.mimiworks.dev (Cloudflare, se despliega solo desde main).

## Léelo primero (en este orden)

1. CLAUDE.md: reglas del proyecto y «Modo autónomo» (A1–A8). Aplícalas tal cual; ignora lo que sea propio de Claude Code (nombres de herramientas, .claude/settings.json) y aplica su intención con tus herramientas.
2. docs/plan.md y docs/plan/ (mantenimiento.md, decisiones.md, blocks/).
3. docs/auto/decisiones-por-defecto.md, docs/proceso/release.md y los informes en docs/auto/.

## Entorno

- Node 24.18.0 (.node-version) y pnpm 12.5.1. Comprueba `node -v` antes de nada; si no es 24.18.0, detente. Con Node 26 fallan pruebas de docs.
- Windows + PowerShell. Comandos: pnpm build, pnpm test (docs, ui-core, cli), pnpm format:check.
- Trabaja siempre en el repo C:\dev\mimi-ng, no en otras carpetas.

## Reglas que no se rompen

- Rama auto/<nombre>-<fecha> desde main; un commit por tarea, con pruebas; informe en docs/auto/.
- NUNCA: publicar en npm, crear tags o releases, subir a main, fusionar PR, forzar push, `git add -A` o `git add .`, subir la versión, subir presupuestos, añadir dependencias nuevas ni usar cuentas externas. Si una tarea lo exige, detente y dilo.
- Las decisiones «PENDIENTE DE DECIDIR» se adoptan con la Recomendación y se registran en docs/auto/decisiones-por-defecto.md, marcando RUPTURA lo que lo sea.
- Edita archivos con la herramienta de edición, no con sed, node -e ni scripts sueltos (excepción: el mismo cambio en 5+ archivos, con el script fuera del repo y `git diff --stat` antes y después de Prettier).
- Mimi es una beta con un solo usuario: no hace falta compatibilidad hacia atrás por sí sola, pero marca RUPTURA.
- Privacidad: sin correos, rutas personales ni datos reales en el código, los ejemplos ni los commits.
- Comunicación en español. Sin atribución a terceros en los commits salvo que te lo pidan.

## Cómo terminar

Informe corto con: qué se hizo, pruebas (cifras), presupuestos de bundle, decisiones tomadas y lo que queda para el usuario. Para al terminar la tarea o en la puerta (G<n>.P / B.P).
