# B.3 `login-02`

[← Índice del plan](../../plan.md)

- [ ] B.3 `login-02`: inicio de sesión dividido en dos, con el formulario a un lado y una imagen con un testimonio en vidrio al otro.
  - v0.4.0 · Tamaño M · Depende de: B.1 (y los componentes que usa, publicados: 2.1, 2.2, 2.11) · Bloquea: B.P
  - Estado: —
  - Leer antes: B.1; la B.2 (`login-01`: la misma API de envío); spec 4 (Input, Button, FormField); spec 13, tokens `glass` y `overlay-blur` (T.1).
  - Diseño: `Block login-02.dc.html` y su fila en `Mimi F6 Blocks.dc.html` («Componentes: Input, Button, Image Slot, glass»). Lo que muestra:
    - Escritorio: dos columnas; la imagen ocupa la mitad derecha (un `image-slot` de la herramienta de diseño: «Arrastra tu imagen al hueco»), con un testimonio en vidrio abajo («“Pasamos de PrimeNG a Mimi en dos semanas…”», iniciales «DP», Diego Paz, CTO · Andes Logística).
    - Formulario a la izquierda (padding 32/40px): logo y «Mimi Ventas», `h1` de 32px «Hola de nuevo», subtítulo, correo, contraseña (con «¿La olvidaste?»), botón «Entrar» con carga, botón secundario «Entrar con SSO» (ícono `key-round`), «¿Primera vez? Crea una cuenta» y la nota legal.
    - Móvil: la imagen arriba como banner de 200px con las esquinas inferiores redondeadas (24px) y el testimonio oculto; `h1` de 26px.
  - Objetivo: la variante de inicio de sesión con imagen de marca, para productos que quieren una primera pantalla más visual.
  - Alcance: incluye los estados de la B.2 que aplican (cargando, error, inválido) y el testimonio. NO incluye: una imagen de verdad (ver «Preguntas abiertas»), el SSO (es una salida).
  - Base técnica: ninguna nueva.
  - Componentes que usa (`registryDependencies`): `input`, `button`, `form-field`. Avatar (2.8) para las iniciales del testimonio si se decide (abajo). Ninguno posterior a la 0.3.0.
  - API pública propuesta: `<mimi-login-02 [loading] [error] [imageSrc] [imageAlt] [forgotHref] [signupHref] (submitted) (sso) class>`; `submitted`: `{ email, password }`. El testimonio, escrito en la plantilla (se edita).
  - Formularios: como la B.2 (Signal Forms, B.1-f).
  - Tokens: sin tokens propios. El vidrio con `--mimi-glass` y `--mimi-glass-blur` (T.1, ya en el tema); con `prefers-reduced-transparency` (si el navegador lo soporta), fondo `card` sólido.
  - Teclado y accesibilidad: la imagen es decorativa salvo que el usuario dé `imageAlt` (`alt=""` por defecto). El testimonio es un `figure` con `blockquote` y `figcaption`, como el diseño. El contraste del texto sobre el vidrio se comprueba en claro y oscuro con la imagen de ejemplo.
  - Ejemplos del showcase: vista previa escritorio y móvil, claro y oscuro; con y sin `imageSrc`.
  - CLI: ítem `login-02` de tipo `block`; sin dependencias de npm; **sin archivos binarios** (la CLI copia solo texto).
  - Textos: en el idioma de B.1-i, incluido el testimonio de ejemplo.
  - Trampas conocidas:
    - El `image-slot` es un componente de la herramienta de diseño, no de Mimi: no se copia.
    - El contraste del testimonio depende de la imagen del usuario: el vidrio tiene que funcionar también sobre una imagen clara.
    - El banner de 200px en móvil no debe empujar el formulario fuera de la vista con el teclado virtual abierto (comprobar en teléfono).
  - Criterios de hecho:
    - El Block en ui-core, en el registro y en el sitio, con los estados.
    - Pruebas: envío, `loading`, `error`, `sso`, imagen con y sin `imageSrc` (`alt` vacío por defecto), `class`.
    - `ng g mimi login-02` en un proyecto limpio.
    - CSS global y JS inicial, crudo y gzip, antes y después.
    - D6: el marcador de imagen y lo que se agregó sin diseño.
    - `pnpm build`, `pnpm test` y `pnpm format:check` en verde.
    - Manual (a la M.20): contraste del testimonio sobre una imagen real clara y otra oscura; teléfono real con el teclado abierto; gestor de contraseñas.
  - Preguntas abiertas:
    - PENDIENTE DE DECIDIR (B.3-a): qué se ve sin `imageSrc`. (a) **Un panel de marcador** con `muted`, la trama de puntos de la B.2 y un ícono de imagen (sin archivo binario). (b) Pedir a Claude Design una ilustración libre (SVG en línea) para el ejemplo. (c) Una imagen de un banco libre desde una URL externa (el Block dependería de internet). **Recomendación: (a)**; si se quiere algo más vistoso, (b) se pide en la D6 sin bloquear la tarea.
    - PENDIENTE DE DECIDIR (B.3-b): las iniciales del testimonio con `mimi-avatar` (2.8, trae su ítem) o un `span` dentro del Block (como el diseño). Recomendación: `mimi-avatar`: es el mismo dibujo y el usuario lo cambia por una foto con `src`.
