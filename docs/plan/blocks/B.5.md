# B.5 `otp-01`

[← Índice del plan](../../plan.md)

- [ ] B.5 `otp-01`: verificación con un código de 6 dígitos (Input OTP), con reenvío y cuenta regresiva.
  - v0.4.0 · Tamaño S · Depende de: B.1, G2.5 (Input OTP, publicado en la 0.3.0) y 2.1 · Bloquea: B.P
  - Estado: —
  - Leer antes: B.1; la G2.5 Input OTP en `docs/historial/grupo-2/G2.5.md` (`length`, `separatorAfter`, `success`, mensaje con `role="status"`, movimiento reducido); spec 8.
  - Diseño: `Block otp-01.dc.html` y su fila en `Mimi F6 Blocks.dc.html` («Componentes: Input OTP, Button»). Lo que muestra:
    - Tarjeta de 440px (padding 36/32px) sobre `muted`; ícono `mail-check` de 26px en un círculo; `h1` «Revisa tu correo»; «Enviamos un código de 6 dígitos a **a••••@empresa.com**».
    - Input OTP de 6 con separador después del tercero; mensaje con `role="status"` (error «Código incorrecto.» o «Código verificado.», con ícono); botón «Verificar».
    - «¿No te llegó? Reenviar en 0:42» (botón deshabilitado con cuenta regresiva) y el enlace «Usar otro correo» con flecha.
    - Móvil: sin tarjeta y con casillas más pequeñas.
  - Objetivo: el paso de verificación por código, que encaja después del registro (B.4) o del inicio de sesión.
  - Alcance: incluye escribir, pegar y autocompletar el código, verificar al completar o con el botón, error y éxito, reenvío con cuenta regresiva. NO incluye: enviar el código ni verificarlo (salidas).
  - Base técnica: ninguna nueva.
  - Componentes que usa (`registryDependencies`): `input-otp`, `button`, `card` (si se usa para la tarjeta). Ninguno posterior a la 0.3.0.
  - API pública propuesta: `<mimi-otp-01 [destination] [length] [resendSeconds] [loading] [status] (verify) (resend) (changeDestination) class>`. `destination`: el correo o teléfono ya enmascarado que se muestra; `status`: `'idle' | 'error' | 'success'`, lo pone el usuario tras verificar; `resendSeconds`: 42 en el diseño, 60 por defecto (se decide al empezar).
  - Formularios: un campo de Signal Forms (B.1-f) con `required` y `minLength(length)`; `verify` sale con el código al completar los dígitos o al pulsar el botón (una sola vez por código).
  - Tokens: sin tokens propios; los de Input OTP.
  - Teclado y accesibilidad: el foco empieza en el código (`autofocus` del Block, con cuidado de no robarlo si el Block está en un diálogo); el mensaje de estado ya es `role="status"` de Input OTP (no se duplica). El botón de reenvío deshabilitado lleva el tiempo en su texto («Reenviar en 0:42»); el anuncio de la cuenta regresiva **no** se repite cada segundo (solo cuando se habilita: «Ya puedes pedir otro código»).
  - Ejemplos del showcase: vista previa escritorio y móvil, claro y oscuro; estados escribiendo, error, éxito y reenvío disponible.
  - CLI: ítem `otp-01` de tipo `block`; sin dependencias de npm.
  - Textos: en el idioma de B.1-i.
  - Trampas conocidas:
    - La cuenta regresiva con `setInterval` en una app zoneless: un `signal` que cambia cada segundo y se limpia con `DestroyRef`; en pruebas, con temporizadores falsos (M.12).
    - Verificar al completar puede disparar dos veces (al completar y al pulsar): se guarda el último código enviado.
    - El código de prueba del diseño (`246810`) es del diseño, no del Block.
    - Casillas «más pequeñas» en móvil: con `class` en `mimi-input-otp` o con sus tokens, sin tocar el componente.
  - Criterios de hecho:
    - El Block en ui-core, en el registro y en el sitio.
    - Pruebas: `verify` al completar y al pulsar (una vez por código), `status` pinta error y éxito, cuenta regresiva y `resend` (temporizadores falsos), anuncio al habilitar el reenvío, `class`.
    - `ng g mimi otp-01` en un proyecto limpio.
    - CSS global y JS inicial, crudo y gzip, antes y después.
    - `pnpm build`, `pnpm test` y `pnpm format:check` en verde.
    - Manual (a la M.20): autocompletar el código desde un SMS en iOS y en Android (`one-time-code`); NVDA; teléfono real.
  - Preguntas abiertas:
    - Decidido por el usuario (07/11/2026: adopta la recomendación; era PENDIENTE DE DECIDIR) (B.5-a): ¿verifica solo al completar los dígitos, solo con el botón, o con los dos (el diseño tiene botón)? Recomendación: los dos, con la salida una sola vez por código.
