# B.4 `signup-01`

[← Índice del plan](../../plan.md)

- [x] B.4 `signup-01`: registro con validación en vivo, medidor de contraseña con reglas, confirmación y un botón que explica qué falta. (07/11/2026; pendiente de comprobación manual: NVDA, gestor de contraseñas y teléfono real, a la M.20. Informe: `docs/auto/blocks-0.4.0-2026-11-06.md`, «B.4».)
  - v0.4.0 · Tamaño M · Depende de: B.1 (y los componentes que usa, publicados: 2.1, 2.2, 2.10, 2.11, G2.3) · Bloquea: B.P
  - Estado: hecha el 07/11/2026 en `auto/blocks-0.4.0-2026-11-06` (Claude Code, modo autónomo). API final: `<mimi-signup-01 [loading] [error] [termsHref] [privacyHref] [signinHref] (submitted) class>`; `submitted` lleva `Signup01Value` (`{ name, email, password }`).
  - Leer antes: B.1; la B.2 (mismo esqueleto de formulario); la G2.3 Password en `docs/historial/grupo-2/G2.3.md` (`meter`, `rules`, `strength`, anuncios del nivel con el `LiveAnnouncer`); spec 8 (validadores de Signal Forms, `mimi-form-field` y `mimi-form-error`).
  - Diseño: `Block signup-01.dc.html` y su fila en `Mimi F6 Blocks.dc.html` («Componentes: Input, Password, medidor, Checkbox, Button»). Lo que muestra:
    - Escritorio: una columna de beneficios a la izquierda (`aside`: logo «Mimi Ventas», `h2` «Todo tu equipo comercial en un solo panel.», tres beneficios con ícono —`git-merge`, `shield-check`, `headset`— y «14 días gratis · sin tarjeta») y el formulario a la derecha.
    - Formulario: «Crea tu cuenta», nombre completo y correo de trabajo con mensaje debajo al salir del campo (error con `circle-alert` en `destructive-soft-foreground`, válido con `circle-check` en `success-soft-foreground`: «Perfecto.», «Correo válido.»), contraseña con el ojo, el medidor de cuatro barras y las cuatro reglas, confirmación («no coincide»), checkbox de términos y el botón «Crear cuenta» deshabilitado con una nota que dice qué falta («Falta: un correo válido, una contraseña fuerte…»).
    - Móvil: sin la columna de beneficios; el logo arriba del formulario.
  - Objetivo: un registro que guía al usuario mientras escribe, con el medidor de Password y mensajes claros.
  - Alcance: incluye validación en vivo (al salir del campo), confirmación de contraseña, términos, la nota de lo que falta, cargando y error del servidor. NO incluye: el envío real ni la verificación del correo (es la B.5).
  - Base técnica: ninguna nueva.
  - Componentes que usa (`registryDependencies`): `input`, `password`, `checkbox`, `button`, `form-field`. Ninguno posterior a la 0.3.0.
  - API pública propuesta: `<mimi-signup-01 [loading] [error] [termsHref] [privacyHref] [signinHref] (submitted) class>`; `submitted`: `{ name, email, password }`.
  - Formularios: Signal Forms (B.1-f) con `required` y `minLength(2)` en el nombre, `required` y `email` en el correo, la fuerza de la contraseña con las reglas de `mimi-password` (el nivel «fuerte» como validador del Block), la confirmación con un validador del formulario (las dos iguales) y los términos con `requiredTrue`.
  - Tokens: sin tokens propios. El medidor y sus colores son los de Password (G2.3).
  - Teclado y accesibilidad: los mensajes de cada campo con `aria-describedby` (los de error con `mimi-form-error`; los de «válido», texto del Block en el mismo `id`). El botón «Crear cuenta» **no** usa `disabled` (no se enfoca ni se lee la nota): usa `aria-disabled="true"` con la nota en `aria-describedby`, y al pulsarlo sin estar completo marca todo como tocado y lleva el foco al primer campo con error. El medidor ya anuncia el nivel (G2.3).
  - Ejemplos del showcase: vista previa escritorio y móvil, claro y oscuro; estados vacío, con errores, completo y cargando.
  - CLI: ítem `signup-01` de tipo `block`; sin dependencias de npm.
  - Textos: en el idioma de B.1-i. Las reglas y el nivel del medidor salen de `MIMI_PASSWORD_TEXT` (con `_ES` si el usuario lo provee); los demás, en la plantilla.
  - Trampas conocidas:
    - La heurística del diseño cuenta «al menos la mitad de las reglas» como «media»; `mimi-password` ya la generaliza (`mimiPasswordLevel`): el Block no la repite.
    - Un botón con `disabled` no recibe el foco y su explicación no se lee: por eso `aria-disabled` (lo dice el diseño en la nota, no en el atributo).
    - Los mensajes de «válido» (verde) no existen en `mimi-form-field` (solo errores): se escriben en el Block y se anotan en D6 si hace falta un estado «válido» en FormField.
    - `autocomplete="new-password"` en los dos campos de contraseña, para que el gestor proponga una.
  - Criterios de hecho:
    - El Block en ui-core, en el registro y en el sitio.
    - Pruebas: cada validación (nombre, correo, fuerza, confirmación, términos), la nota de lo que falta, el botón con `aria-disabled` y el foco al primer error, envío con el valor, `loading`, `error`, `class`.
    - `ng g mimi signup-01` en un proyecto limpio.
    - CSS global y JS inicial, crudo y gzip, antes y después.
    - D6: el estado «válido» de un campo, si no está en el diseño de FormField.
    - `pnpm build`, `pnpm test` y `pnpm format:check` en verde.
    - Manual (a la M.20): NVDA (mensajes, nivel del medidor y la nota del botón); gestor de contraseñas (propone una contraseña nueva); teléfono real.
  - Preguntas abiertas:
    - Decidido por el usuario (07/11/2026: adopta la recomendación; era PENDIENTE DE DECIDIR) (B.4-a): cuándo se muestran los mensajes: al salir del campo (el diseño: `touched`) o al escribir. Recomendación: al salir del campo, y la confirmación también al escribir una vez que se tocó (así deja de decir «no coincide» en cuanto coincide).
