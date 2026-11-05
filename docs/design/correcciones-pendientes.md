# Correcciones de diseño pendientes (tarea D6)

Lista de la tarea D6 de `docs/plan.md`, movida aquí el 03/11/2026 con el mismo texto (antes era la sección «Correcciones de diseño pendientes» del plan). Las citas «plan, D6» de la spec y del código se refieren a esta lista: la línea D6 del plan apunta aquí.

Cómo se usa: cada componente nuevo agrega al final su apartado («<Componente> (G#.#):») con lo que hizo distinto del diseño o sin diseño. No se borra nada hasta que el diseño lo resuelva en Claude Design.

## Correcciones de diseño pendientes

Lo que Mimi hizo distinto del diseño, o sin diseño, y hay que llevar a Claude Design. Cada componente nuevo agrega aquí lo suyo (antes era la T.2a, dentro de Theme Studio).

- [ ] D6 Correcciones de diseño pendientes (Claude Design). Revisar en el diseño `--mimi-field-error` (la hoja dice `destructive-soft-foreground`; Mimi usa `destructive`, el color de la 0.1.0; spec 13). Diseñar en Claude Design las celdas provisionales de la V.1 (tono secondary, ghost y link con tono; spec 13). Actualizar en el diseño los hovers de success, info y danger corregidos por contraste en la V.1. Definir en el diseño la animación de entrada y salida de los overlays (duración, curva y escala; hoy Popover usa los valores de `--mimi-transition`: 0,15 s, `cubic-bezier(.2,.8,.2,1)`, escala desde `--mimi-press-scale`) y, si conviene, un token propio. Definir también el margen mínimo de los overlays al borde de la pantalla: Popover y Tooltip usan 8px (`MIMI_VIEWPORT_MARGIN`, spec 13), que no está en el diseño. Tooltip: definir el ancho máximo (hoy `100vw − 16px`) y el margen del «salto sin retraso» (hoy 300 ms, como el retraso). Dropdown Menu (G1.3):
  - **Ancho:** el diseño mide 260px y el token `--mimi-menu-width`, 240px (el del Context Menu). Se usa el token.
  - **Submenú:** 200px sin token propio.
  - **Grupo radio** (`menuitemradio`): no está en el diseño. Es provisional, con un punto de 8px en la columna del ícono.
  - **Ítem deshabilitado con el foco de teclado:** el diseño no lo resalta. Mimi lo resalta para que se vea dónde está el foco.

  Context Menu (G1.4):
  - **Volteo:** el diseño mantiene el menú a 8px del borde. Mimi lo voltea a la izquierda o hacia arriba del punto, con el mismo margen. El diseño fijo no puede mostrar ese caso.
  - **Apertura con teclado:** el diseño no la muestra. Mimi lo abre junto al elemento enfocado, con los 8px del Dropdown.

  Select (G1.5):
  - **Alto máximo de la lista:** 280px (unas 8 opciones), sin token. No está en el diseño.
  - **Panel sin buscador:** el diseño siempre lo muestra. Mimi lo hace opcional (`search`); sin él, el mismo panel sin la barra.
  - **Anillos:** el diseño muestra el anillo de error siempre y el de foco mientras el panel está abierto. Mimi los muestra solo con el foco en el disparador, como Input. Con buscador, el foco está en el input del panel y el disparador queda sin anillo mientras está abierto.
  - **Sin opciones y sin búsqueda:** el diseño solo muestra «Sin resultados» con una búsqueda. Sin búsqueda, Mimi muestra el mismo bloque sin la segunda línea.
  - **`hint`:** el diseño lo muestra solo en la opción deshabilitada. Mimi lo muestra en cualquier opción que lo tenga.
  - **Volteo:** si el panel no cabe debajo, se abre encima, con los mismos 8px.
  - **Varios grupos:** el diseño muestra uno. Con varios, cada uno lleva su etiqueta, sin separador.

  Dialog (G1.6):
  - **Animación:** el diseño no la define. Mimi usa la de los demás overlays (0,15 s, escala desde `--mimi-press-scale`), y el fondo se desvanece en el mismo tiempo.
  - **Pantallas chicas y contenido largo:** no están en el diseño. Mimi deja 16px a cada borde (`100vw − 32px` de ancho máximo, `100dvh − 32px` de alto máximo) y pone el scroll en el cuerpo, con el encabezado y el pie fijos.
  - **Tamaños:** el diseño trae uno (420px). No hay sm, md ni lg; se cambia con `width`, `maxWidth` o `class`.
  - **Línea del título:** el diseño no da el interlineado; Mimi usa 1,25, como Popover.

  Confirm (G1.7):
  - **Botones de 36px:** ¿Button necesita un tamaño de 36px? Hoy solo tiene 40 y 32. El Confirm los fuerza con `h-9 px-3.5`.
  - **Ancho:** los 380px salen de la hoja de tokens; el diseño dibuja el panel fluido dentro de su recuadro.
  - **Ícono:** el diseño siempre muestra uno, distinto según el contenido (`upload`, `trash-2`). Mimi no pone uno por defecto; sin `icon` no hay círculo.
  - **Hover del botón de acción:** el diseño usa `color-mix(… 88%, background)`; Mimi usa el de Button (`-hover`, corregido por contraste en la V.1).
  - **Tono primary:** el círculo usa `info-soft` e `info-soft-foreground` (la variante «Neutral» del diseño), sin token propio.

  Toast (G1.8):
  - **Con acción, sin tiempo:** el diseño cierra a los 6 s también los que tienen acción («Reintentar»). Mimi no los cierra solos (WCAG 2.2.1).
  - **Región viva:** el diseño pone `aria-live` en la pila y `role="status"` en cada toast. Mimi anuncia con el `LiveAnnouncer` del CDK (una región aparte, que sigue funcionando con un diálogo modal abierto).
  - **Promesa:** el diseño muestra el resultado 4,7 s; Mimi usa la duración normal (6 s).
  - **Alto:** el diseño usa 68px fijos con elipsis en la pila; Mimi, alto natural con mínimo de 68px (zoom al 200 %), relleno vertical de 12px.
  - **Sólido sin tono y sólido con acción:** no están en el diseño. Sin tono se ve como la tarjeta; la acción en un sólido usa el `currentColor` al 16 % del círculo y de la X (24 % en hover).
  - **Posiciones, móvil, entrada y salida:** el diseño solo muestra `bottom-right`. Las otras cinco, el ancho en móvil (`100vw − 32px`), `safe-area-inset` (no se usa), la entrada (desde abajo o arriba con opacidad, 0,4 s) y la salida (0,3 s) no están en el diseño.
  - **Separación expandida:** 8px del diseño, sin token.
  - **Botón de acción de 28px:** igual que el de 36px de Confirm, no es un tamaño de Button.

  Tabs (G1.9):
  - **Deshabilitadas:** no están en el diseño. Mimi las muestra con `--mimi-disabled-opacity` y cursor de no permitido; se enfocan con las flechas pero no se eligen. Definir cómo se ven.
  - **Vertical:** fuera por ahora. Pendiente de diseño: el indicador y la píldora en vertical (aria ya maneja ↑/↓).
  - **Anchos distintos:** el indicador funciona con columnas iguales (porcentajes, sin medir). Pestañas de ancho propio no están soportadas, ni padding o gap propios en la píldora.
  - **Presión al pulsar:** el diseño usa 0,96 (subrayada) y 0,95 (píldora); Mimi usa `--mimi-press-scale` (0,975).
  - **Sin `tone`:** el diseño no tiene tonos para Tabs; el contador es fijo en `info-soft`.
  - **Alto de la píldora (34px) y duración del indicador (0,45 s):** sin token.
  - **Panel:** el diseño le da 4px 2px de relleno y 14px de separación con las pestañas (puede ser parte de la demo); Mimi los usa.
  - **Móvil:** con cuatro pestañas a 360px, cada una mide 51px y las etiquetas se cortan con puntos suspensivos. El diseño no muestra el caso.

  mimi-toolbar (G1.10):
  - **Presión al pulsar:** el diseño usa 0,88; Mimi usa `--mimi-press-scale-sm` (0,9, como Switch, Checkbox y Toast; con movimiento reducido vale 1). ¿Token propio?
  - **Foco de teclado:** el diseño muestra con el foco el mismo anillo que el hover (`info` al 60 %), que no basta como foco visible. Mimi usa el contorno `ring` a 4px, por fuera del anillo del activo y sin pisar al vecino (6px de separación).
  - **Contador:** en el diseño es hermano del botón (no escala al pulsar); en Mimi va dentro del botón (`span[mimiToolbarCount]`) y escala con él.
  - **Distancia del tooltip:** el diseño, 14px desde el botón (10px desde el anillo de 4px); Tooltip usa 10px fijos.
  - **Deshabilitado:** no está en el diseño. `--mimi-disabled-opacity`, cursor de no permitido, sin anillo ni escala.
  - **Grupos con nombre y `radiogroup` (ver abajo):** el diseño solo tiene separadores. Una herramienta activa con `aria-pressed` que no se desmarca no es lo que espera un lector; un grupo de radio con nombre (`role="radiogroup"` y `radio`) llegaría con los grupos.

  Pagination (G1.11):
  - **Hoja de tokens frente al diseño final:** `--mimi-pagination-item-size` 40px, `-input-width` 56px y `-offset` 20px en `mimi-variables-componentes.css`; el diseño final usa el alto de control (32/40px), 44/52px y 16px. Corregir la hoja.
  - **Presión y deshabilitado:** 0,9 (`--mimi-press-scale-sm`) en vez de 0,88; opacidad 0,5 sin cursor de no permitido (`aria-disabled` lleva `pointer-events-none`) en vez de 0,35 y `not-allowed`.
  - **Foco del campo:** el diseño no tiene anillo de foco; Mimi usa el de Input.
  - **Cambiar el tamaño:** el diseño vuelve a la página 1; Mimi mantiene visible el primer registro (como MatPaginator).
  - **Selector:** la separación con el panel es 8px (la de Select); el diseño, 10px.

  Grupo 2, encontrado al detallar el plan (tanda B, 03/11/2026; antes de construir los componentes):
  - **Number Input (G2.2), lectura del número:** el diseño interpreta el texto quitando todo lo que no es dígito, punto o signo y usando `parseFloat` (función `num()` de `F3 Slider OTP Numero Mascara`). Con un idioma de coma decimal (por ejemplo, `es-ES`), «1.250,5» se lee mal. Mimi tiene que leer con los separadores del idioma.
  - **Input Mask (G2.4), valor guardado:** en el diseño, el estado guarda solo los dígitos y la máscara se aplica al mostrar (`mask[key]` en `mask()`). Qué guarda Mimi está pendiente de decidir (plan, G2.4).
  - **Anillo de error (Number Input, Input Mask, Password, Input OTP, Tags Input):** los diseños del Grupo 2 usan `--mimi-destructive-soft` para el anillo de error; desde la T.1, el anillo es `--mimi-destructive-ring` (`--mimi-destructive-soft` queda como alias hasta la 1.0, spec 12).

  Grupo 2 (G2.0), al escribir las tablas de tokens (04/11/2026, spec 13, «Grupo 2»):
  - **La hoja de tokens no tiene el Grupo 2:** `mimi-tokens-data.js` y `mimi-variables-componentes.css` no traen tokens por componente del Grupo 2. Las tablas de la spec 13 salen de las medidas en línea de los `.dc.html`. Agregarlas a la hoja.
  - **Presiones distintas:** Toggle Group 0,93; Number Input y Password 0,88; File Upload 0,985; Color Picker 0,9 y 0,94; Date Picker 0,9, 0,94 y 0,96. Mimi usa `--mimi-press-scale` o `--mimi-press-scale-sm`; cada componente anota cuál.
  - **Radios fijos:** marca de tarjeta del Input Mask (5px) y burbuja del Slider (7px; Tooltip usa 8px).
  - **Íconos de 15px** en los botones de Number Input y en el ojo de la galería de Password; los controles usan `--mimi-icon-size` (16px).
  - **Deshabilitado del Date Picker:** opacidad 0,38 y tachado; el resto de Mimi usa `--mimi-disabled-opacity` (0,5).
  - **Botón de quitar del chip:** en Tags Input baja la opacidad a 0,7; en el Combobox usa `muted-foreground`. Elegir uno (el chip es compartido).
  - **Color Picker:** pulgares con borde `#fff` y sombras `oklch(0 0 0 / .25)` y `/ .3`, y el degradado con `#000` y `#fff` (este último es inherente al área de saturación). Los pulgares quedan pendientes de la G2.12.
  - **Progress:** la parte llena usa `--mimi-primary` y no `--mimi-track-fill` (que vale lo mismo). Decidir si Progress sigue a `track-fill`.
  - **Miniaturas de estados:** las galerías de Input OTP (38×46px) y Password (campo de 36px, medidor de 5px) no son un tamaño; si se quiere un tamaño `sm`, diseñarlo.
  - **`--mimi-selection`:** solo lo usa `Theme Studio`; ningún componente del Grupo 2 lo usa. Se lleva al tema igual (G2.0b).

  Revisión móvil del Grupo 1 (5.17a, 04/11/2026):
  - **Sin diseños móviles:** ningún componente tiene diseño para pantallas chicas. Mimi usa en móvil los paneles de escritorio, anclados y dentro de la pantalla (spec 4, «Paneles en pantallas chicas»). Si se quiere una hoja inferior o un panel modal en móvil (Select, Combobox, Date Picker), diseñarla.
  - **Alineación de los paneles:** cuando la alineación pedida no cabe, el panel se alinea al otro extremo o al centro del disparador antes de cambiar de lado. El diseño no muestra el caso.
  - **Tamaño de objetivo:** Switch (36 × 20px) y Checkbox (16 × 16px) cumplen 2.5.8 (AA) solo por espaciado; ninguno llega a 44 × 44 (2.5.5). Si se quiere un área táctil mayor, definirla en el diseño.

  Toggle Group (G2.1):
  - **Presión al pulsar:** el diseño usa 0,93; Mimi usa `--mimi-press-scale-sm` (0,9; con movimiento reducido, 1).
  - **Error del formulario:** no está en el diseño. Mimi pone un borde `destructive` de 1px al grupo (`data-invalid`) cuando es inválido y se tocó.
  - **`solid` en simple:** el diseño solo la muestra en múltiple. En simple, Mimi pinta el indicador en `primary` con el texto en `primary-foreground`.
  - **Múltiple:** el diseño usa columnas del ancho de cada botón (`auto`) solo en «Texto e ícono»; Mimi lo hace así en todo grupo múltiple (no hay indicador que necesite columnas iguales). En simple, columnas iguales (el ancho del botón más ancho).
  - **Foco visible:** el diseño no lo muestra. Mimi usa el contorno `ring` de los botones (2px, separado 2px).

  Progress (G2.10):
  - **Movimiento reducido:** el diseño dice que la barra indeterminada «late» pero no cómo. Mimi la pone a ancho completo con `mimi-pulse` (1,6 s). El círculo indeterminado también late (el diseño no lo dice).
  - **Barra de tonos de 6px:** en el diseño es otra altura; en Mimi se hace con `class="h-1.5"` (sin tamaño ni token propio).
  - **Círculo pequeño:** 44px, trazo 4 y texto de 11px sin token (el grande sí tiene `--mimi-progress-circle-size` y `-width`).
  - **Valor del círculo pequeño:** el diseño muestra «40» sin el signo; Mimi también lo quita en `sm`.
  - **RTL:** la barra indeterminada cruza de derecha a izquierda (`rtl:-scale-x-100`); el diseño no muestra RTL.
