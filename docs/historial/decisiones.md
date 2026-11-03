# Historial del plan: decisiones tomadas

Texto exacto de la sección «Decisiones pendientes» de `docs/plan.md` antes de la reorganización del 03/11/2026 (commit anterior: `cce6ee8`). Todas estaban tomadas (`[x]`). Cada una está también en la spec, en la sección que cita.

## Decisiones pendientes

- [x] Estilo del MVP: un solo tema base, Mimi («Mimi» de fábrica, «Mi tema» cuando el usuario lo cambia).
- [x] Formularios: Signal Forms, Reactive Forms y ngModel. Campos nativos detectan FormField o NgControl; controles propios con FormValueControl (spec, sección 8).
- [x] Idioma por defecto de los mensajes de error: inglés. `MIMI_ERROR_MESSAGES_ES` trae el español: `provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)` (el showcase lo usa). Ver spec, sección 8.
- [x] Versión exacta de Node.js y TypeScript según los requisitos de Angular 22 (ver spec, sección 2).
- [x] Variantes propias en `mimi.preset.ts`: no se harán. El preset solo cambia los tokens que Mimi expone (spec, sección 11).
- [x] Theme Studio (20/10/2026): deja de ser parte de mimi-ng. Proyecto aparte, construido con Mimi como un usuario más, cuando el catálogo esté completo (`docs/futuro/theme-studio.md`). En mimi-ng queda la página de tema sencilla (5.2); el sistema de tokens no cambia.
