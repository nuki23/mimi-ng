# Plan: versión 1.0

[← Índice del plan](../plan.md)

## Versión 1.0

Cambios que rompen, acumulados para la 1.0 (spec, sección 12, «Compatibilidad que se quita en la 1.0»).

- [ ] 1.0-1 Quitar alias destructive-soft → destructive-ring y renombrar destructive-soft-bg → destructive-soft. Antes, la nota de versión pide buscar `destructive-soft` en el proyecto y cambiarlo a `destructive-ring` (el código copiado con `ring-destructive-soft` seguiría compilando con otro color, sin error); `mimi update` (5.4) avisa si encuentra esa clase.
- [ ] 1.0-2 Quitar los atajos de variante de Button y Badge (`variant="default|secondary|destructive"`): en la nota de versión, `variant="destructive"` → `tone="danger"`, `variant="secondary"` → `tone="secondary"` y `variant="default"` se borra; y los selectores CSS propios sobre `[data-variant="destructive"]` → `[data-tone="danger"]` (spec 12).
- [ ] 1.0-3 Dejar de aceptar `"style": "vivid"` en `mimi.json` como sinónimo de `"mimi"` (la 0.1.0 lo escribe; spec 12). Decidir entonces si la CLI lo corrige al leerlo o si avisa.
- [ ] 1.0-4 Quitar los nombres de tokens de la 0.1.0 (spec 12): `--mimi-btn-padding-x` y `components.button.paddingX`, `--mimi-input-padding-x` y `components.input.paddingX`, `--mimi-input-placeholder-color` y `components.input.placeholderColor`, y `radii.badge` (queda `components.badge.radius`), con sus avisos de `provideMimiTheme`.
