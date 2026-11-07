# B.10 Tabs con orientación vertical

[← Índice del plan](../../plan.md)

- [ ] B.10 Tabs: entrada `orientation` (`'horizontal' | 'vertical'`) en `mimi-tabs`, para la navegación lateral de `settings-01`.
  - v0.4.0 · Tamaño M · Depende de: G1.9 (Tabs, publicado en la 0.2.0) · Bloquea: B.6
  - Estado: —
  - Leer antes: la G1.9 Tabs en `docs/historial/plan-grupo-1.md` (los dos choques con aria y cómo se contienen; el indicador animado; `preserveContent`); spec 4, «Rodeos de aria» (Tabs) y la tabla de Tabs; spec 13 (tokens `tabs`); la B.6 (qué necesita el Block); spec 10, «Trampas de tamaño» (una instrucción de plantilla nueva puede sumar al JS inicial).
  - Diseño: `Block settings-01.dc.html` (la lista vertical de escritorio). `F2 Toast Tabs Toolbar` (Tabs) no tiene una variante vertical: lo que se haga se anota en D6.
  - Objetivo: que Tabs sirva también como navegación lateral, con el teclado de su orientación, sin cambiar nada para quien ya lo usa en horizontal.
  - Alcance: incluye `orientation` (por defecto `horizontal`), que pueda cambiar en vivo, el indicador animado en vertical (para `underline`: barra a la izquierda; para `pill`: el fondo se mueve en vertical), `aria-orientation` (lo pone aria) y `data-orientation` en el anfitrión. NO incluye: pestañas a la derecha o abajo (`side`), una variante nueva de aspecto.
  - Base técnica: `@angular/aria/tabs`; `ngTabList` ya acepta `orientation` (`'horizontal' | 'vertical'`, comprobado en `@angular/aria` 22.2.4: `InputSignal<"horizontal" | "vertical">`). Spike corto al empezar: que cambiar `orientation` en vivo no rompa los dos rodeos de la G1.9 (recrear la fila al cambiar el valor desde fuera).
  - API pública propuesta: `<mimi-tabs [orientation] …>`; sin cambios en lo demás. **No es una ruptura** (entrada nueva con el valor de antes por defecto).
  - Formularios: no aplica.
  - Tokens: los de Tabs; si el ancho de la lista vertical o el espacio entre lista y panel necesitan un token, se agrega a la tabla de Tabs en la spec 13 y en `MimiTabsTokens` (con prueba), con valor del diseño de settings-01.
  - Teclado y accesibilidad: en vertical, ↑/↓ mueven entre pestañas y ←/→ no hacen nada (patrón APG «Tabs», lo da aria); Inicio/Fin igual. Pruebas de alarma si aria cambia el teclado vertical.
  - Ejemplos del showcase: en la página de Tabs, un ejemplo vertical (`underline` y `pill`), uno que cambia con el ancho y la tabla de API con `orientation`.
  - CLI: sin ítems nuevos; el ítem `tabs` cambia (sale en la 0.4.0: «actualizado de 0.3.0 a 0.4.0»).
  - Textos: no aplica.
  - Trampas conocidas:
    - El indicador animado mide el ancho y la posición `x` de la pestaña: en vertical, el alto y la `y`. Usar bindings `[style.x]` sueltos ya existentes, no `[style]="objeto"` (`ɵɵstyleMap` sumó 0,96 kB al JS inicial en la G2.1).
    - Las variantes encadenadas (`data-[orientation=vertical]:data-[variant=pill]:…`) generan selectores largos (G2.1): elegir las clases en TypeScript.
    - Un `outline-none` anula el anillo de foco en Tailwind 4 (5.11).
  - Criterios de hecho:
    - `orientation` con pruebas: teclado en las dos orientaciones, cambio en vivo, `aria-orientation`, indicador en vertical, sin cambios en horizontal (las pruebas de Tabs de antes, en verde sin tocarlas).
    - Página de Tabs al día; spec 4 (tabla de Tabs) y 13 si hay token; D6 (Tabs vertical sin diseño).
    - CHANGELOG de la 0.4.0 (lo junta la B.P): «Tabs: `orientation`».
    - JS inicial y CSS global, crudo y gzip, antes y después.
    - `pnpm build`, `pnpm test` y `pnpm format:check` en verde.
    - Manual (a la M.20): NVDA en vertical (anuncia «vertical» y las flechas ↑/↓).
  - Preguntas abiertas:
    - Decidido por el usuario (07/11/2026: adopta la recomendación; era PENDIENTE DE DECIDIR) (B.10-a): ¿la orientación vertical va en una tarea propia (esta) o dentro de la B.6? Recomendación: **tarea propia**, porque cambia un componente publicado (sale en el CHANGELOG, se prueba con las pruebas de Tabs y la usa cualquiera, no solo el Block). Alternativa: dentro de la B.6, o que settings-01 no use Tabs en escritorio sino una lista de enlaces (`aria-current`) y Tabs solo en móvil.
