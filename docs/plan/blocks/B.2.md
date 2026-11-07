# B.2 `login-01`

[← Índice del plan](../../plan.md)

- [x] B.2 `login-01`: inicio de sesión centrado con correo, contraseña con mostrar u ocultar, «recordarme» y botones de Google y GitHub. (07/11/2026; pendiente de comprobación manual: gestor de contraseñas, NVDA, teléfono real y navegador real, a la M.20. Informe: `docs/auto/blocks-0.4.0-2026-11-06.md`, «B.2».)
  - v0.4.0 · Tamaño M · Depende de: B.1 (y los componentes que usa, todos publicados: 2.1, 2.2, 2.5, 2.6, 2.10, 2.11, G2.3) · Bloquea: B.P
  - Estado: hecha el 07/11/2026 en `auto/blocks-0.4.0-2026-11-06` (Claude Code, modo autónomo). API final: `<mimi-login-01 [loading] [error] [forgotHref] [signupHref] (submitted) (provider) class>`; `submitted` lleva `Login01Value` (`{ email, password, remember }`).
  - Leer antes: B.1 (las decisiones comunes: tipo `block`, API mínima, Signal Forms, idioma, íconos, vista previa); spec 4 (Card, Input, Password, Checkbox, Button, Separator y FormField); spec 8 (Signal Forms y `mimi-form-field`); la G2.3 Password en `docs/historial/grupo-2/G2.3.md` (el botón de mostrar y `autocomplete`).
  - Diseño: `Block login-01.dc.html` (escritorio y `mobile`), y su fila en `Mimi F6 Blocks.dc.html` («Componentes: Card, Input, Password, Checkbox, Button, Separator»). Lo que muestra:
    - Escritorio: fondo `muted` con una trama de puntos (`radial-gradient` con `foreground` al 14%, 18px, con máscara elíptica), tarjeta de 400px con padding de 32px, radio `--mimi-radius-card` y `shadow-card`.
    - Cabecera: logo de 40px (`primary`, radio 12px, `shadow-primary`), `h1` de 24px peso 800, subtítulo `muted-foreground` de 14px.
    - Dos botones de redes (Google con una «G» en círculo, GitHub con su ícono) en dos columnas; separador con texto «o con tu correo».
    - Correo (`type="email"`, `autocomplete="email"`), contraseña con el enlace «¿La olvidaste?» al lado de la etiqueta y el botón del ojo; checkbox «Recordarme 30 días»; botón principal de 4px más alto que el control, con `shadow-primary` y el giro de carga «Entrando…»; pie «¿No tienes cuenta? Regístrate».
    - Móvil: sin tarjeta (fondo `background`), sin trama, ancho completo, padding 32/22px y los botones de redes apilados.
  - Objetivo: la pantalla de inicio de sesión más común, lista para enchufar al sistema de autenticación del usuario con una salida.
  - Alcance: incluye los estados del diseño (normal, cargando) y los que hacen falta y el diseño no tiene (error de credenciales, campos inválidos); claro y oscuro; escritorio y móvil. NO incluye: la autenticación, la recuperación de contraseña ni el registro (son enlaces).
  - Base técnica: ninguna nueva; la de sus componentes.
  - Componentes que usa (`registryDependencies`): `card`, `input`, `password`, `checkbox`, `button`, `form-field`, `separator`. Ninguno posterior a la 0.3.0.
  - API pública propuesta: `<mimi-login-01 [loading] [error] [forgotHref] [signupHref] (submitted) (provider) class>`. `submitted`: `{ email, password, remember }`; `provider`: `'google' | 'github'`; `error`: texto o `null`. Los nombres se fijan al empezar (dentro de la regla de B.1-e).
  - Formularios: un `form()` de Signal Forms (B.1-f) con `required` y `email` en el correo y `required` en la contraseña; errores con `mimi-form-field` y los mensajes de `provideMimiErrorMessages`. Al enviar inválido, se marcan los campos como tocados y el foco va al primero con error.
  - Tokens: sin tokens propios (B.1). La trama de puntos usa `foreground` con `color-mix` (como el diseño); el resto, utilidades con tokens.
  - Teclado y accesibilidad: orden de Tab igual al visual (redes, correo, «¿La olvidaste?», contraseña, ojo, recordarme, entrar, registrarse). La trama es `aria-hidden`. El botón de carga con `aria-busy` y el texto «Entrando…» (el giro, `aria-hidden`; sin giro con movimiento reducido). El error de credenciales en un `role="alert"` encima del botón. Los íconos de las redes, `aria-hidden`, con el nombre en el texto del botón.
  - Ejemplos del showcase: página `/docs/blocks/login-01` (plantilla de B.1) con la vista previa en escritorio y móvil, claro y oscuro; estados cargando y con error (un control de la página los cambia).
  - CLI: ítem `login-01` de tipo `block` con los archivos `blocks/login-01/login-01.ts`, `login-01.html` e `index.ts` (o la forma que fije B.1); sin dependencias de npm propias.
  - Textos: los de la plantilla, en el idioma que decida B.1-i («Sign in», «Welcome back…», «Forgot it?», «Remember me for 30 days», «Signing in…», «Don't have an account? Sign up»).
  - Trampas conocidas:
    - El diseño escribe el campo de contraseña a mano (input y botón): en el Block va `mimi-password` (G2.3), que tiene el mismo botón con `aria-pressed` y nombre fijo.
    - La «G» de Google del diseño es una letra en un círculo, no el logotipo; el ícono `github` de Lucide está marcado como obsoleto (marcas): se escribe en línea (B.1-j) y se anota en D6.
    - El diseño no tiene estado de error de credenciales ni de campo inválido: se agrega con los tokens de error de los componentes y se anota en D6 (pedir el diseño).
    - El botón principal es 4px más alto que el control (`calc(var(--mimi-control-height) + 4px)`): con `class` en `mimiBtn`, no con un tamaño nuevo de Button.
    - `Separator` no tiene texto: «o con tu correo» se arma con dos separadores y el texto entre ellos dentro del Block.
  - Criterios de hecho:
    - El Block en `packages/ui-core/src/lib/blocks/login-01/`, en el registro y en el sitio, con los estados del diseño y los agregados.
    - Pruebas: envía el valor con un formulario válido; no envía con uno inválido y marca los errores; `loading` deshabilita el envío; `error` se muestra en el `role="alert"`; `provider` con cada red; `class` del usuario.
    - `ng g mimi login-01` en un proyecto limpio: copia el Block y sus siete componentes, compila y se ve igual que en el sitio.
    - CSS global y JS inicial, crudo y gzip, antes y después (con la decisión B.1-h aplicada).
    - D6: lo que el Block hace sin diseño (error, campo inválido, logotipos).
    - `pnpm build`, `pnpm test` y `pnpm format:check` en verde.
    - Manual (a la M.20): gestor de contraseñas del navegador (rellena correo y contraseña y ofrece guardarlos); NVDA (errores y alerta anunciados); teléfono real a 360px; claro y oscuro en un navegador real.
  - Preguntas abiertas: ninguna propia; las comunes están en B.1.
