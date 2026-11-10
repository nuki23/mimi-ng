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

  Number Input (G2.2):
  - **Botones en el límite:** el diseño los deshabilita (`disabled`, opacidad 0,35 y cursor de no permitido); Mimi usa `aria-disabled` (si no, el foco cae a `body`) con `--mimi-disabled-opacity` (0,5).
  - **Presión:** 0,9 (`--mimi-press-scale-sm`); el diseño, 0,88.
  - **Enter:** el diseño sale del campo; Mimi confirma lo escrito y deja el foco en el campo (mover el foco sin pedirlo desorienta con el teclado).
  - **No están en el diseño:** Re Pág/Av Pág (diez pasos), Inicio/Fin (los límites), mantener pulsado − o + (repite) y el campo vacío (`null`, con `placeholder`). La rueda del mouse no cambia el valor (decidido por defecto).
  - **Lectura:** el diseño quita todo lo que no es dígito, punto o signo; Mimi lee con los separadores del idioma (ya anotado en la tanda B).
  - **Solo lectura:** no está en el diseño; los botones quedan con `aria-disabled` y el teclado no cambia el valor.

  Password (G2.3):
  - **Heurística con otras reglas:** el diseño cuenta cuatro reglas (0–1 débil, 2–3 media, 4 fuerte); Mimi la generaliza a cualquier lista (todas, fuerte; al menos la mitad, media; menos, débil).
  - **Presión del ojo:** 0,9 (`--mimi-press-scale-sm`); el diseño, 0,88.
  - **Deshabilitado y solo lectura:** el diseño solo muestra el campo deshabilitado; Mimi deshabilita también el botón. Solo lectura no tiene diseño: el botón sigue funcionando (mostrar no cambia el valor).
  - **Reglas propias y sin reglas:** no están en el diseño.

  Input Mask (G2.4a):
  - **Cursor, borrar sobre un literal, pegado e IME:** el diseño no los muestra. Mimi deja el cursor después del mismo dígito, borra el dígito vecino al borrar sobre un literal, acepta pegar con o sin literales y no reformatea durante la composición.
  - **Literales al final:** el diseño (`applyMask`) los agrega mientras haya dígitos; Mimi escribe un literal solo si le sigue un dígito («(5», no «(5) »), para que borrar no se trabe.
  - **Solo lectura:** no está en el diseño (el input nativo `readonly`).

  Input Mask (G2.4b):
  - **Marcador:** en el diseño es el texto completo de la máscara rellenado con lo escrito (`typed` + `rest`); Mimi recibe el marcador entero (`ghost`, por ejemplo `DD/MM/AAAA`) y muestra lo que falta después de lo escrito. Si `ghost` y la máscara tienen distinto largo, el marcador se corta o queda corto (responsabilidad del usuario).
  - **Clic en el prefijo o el ícono:** el diseño no lo define; Mimi lleva el foco al campo.
  - **Marca de la tarjeta:** radio fijo de 5px en el diseño; en Mimi es del ejemplo.

  Input OTP (G2.5):
  - **«Completo»:** en el diseño, el borde verde aparece cuando el código está completo y es correcto; Mimi lo pinta con `success`, que pone la app al verificar (llenar las casillas no basta).
  - **Separador opcional y otras longitudes:** el diseño muestra 6 casillas con el guion después de la tercera; en Mimi el guion va donde diga `separatorAfter` y, sin él, no hay.
  - **Alfanumérico:** no está en el diseño.
  - **Casilla activa con el código completo:** el diseño no lo muestra; Mimi deja el anillo en la última casilla.

  Tags Input y chip (G2.6):
  - **Contador:** el diseño lo pone arriba, junto a la etiqueta; Mimi lo pone debajo, a la derecha del mensaje (la etiqueta es del usuario).
  - **Límite alcanzado:** el diseño deshabilita el campo; Mimi lo deja en solo lectura (si no, el foco se pierde).
  - **Pegado de varias etiquetas y validación propia:** no están en el diseño.
  - **Botón de quitar:** Mimi usa el de Tags Input (opacidad 0,7) también para el Combobox (el diseño del Combobox usa `muted-foreground`). Presión 0,9 (`--mimi-press-scale-sm`; el diseño, 0,85).
  - **Anuncios al agregar y quitar:** no están en el diseño.

  Slider (G2.7):
  - **Foco:** el diseño lo marca con `box-shadow` (2px del fondo y 4px de `ring`); Mimi usa el contorno `ring` de los botones (2px, separado 2px), que se ve igual y lo comprueba `focus-styles.spec.ts`.
  - **Al arrastrar, el pulgar recibe el foco:** el diseño no lo hace; Mimi sí, para que el teclado siga desde ahí.
  - **RTL:** no está en el diseño (las flechas y la posición se invierten).
  - **Vertical:** no está en el diseño ni en Mimi (más adelante).
  - **Nombres del rango:** el diseño usa «Mínimo» y «Máximo» con `aria-labelledby`; Mimi junta la etiqueta y el nombre en el `aria-label` («Precio por noche, Mínimo»).

  Combobox (G2.8a, simple):
  - **Sin coincidencias:** el diseño simple muestra «Sin coincidencias.» dentro de la lista, y el bloque de «Sin resultados» con ícono, título y detalle aparte; Mimi usa siempre el bloque (`role="status"`), con un detalle genérico en los textos (el del diseño, «crea la ciudad», es del ejemplo).
  - **Cargando:** el texto del diseño («Buscando ciudades…») es del ejemplo; el texto por defecto es «Buscando…».
  - **Escape con el panel cerrado:** el diseño no lo define; Mimi vacía el campo y quita el valor (APG).
  - **Al salir sin elegir:** el diseño no lo define; Mimi vuelve al texto de la opción elegida, y con el campo vacío quita el valor.
  - **Clic en el campo:** el diseño abre al enfocar (`onFocus`); Mimi abre con el clic, la flecha o al escribir, no al llegar con Tab (APG).
  - **«Crear»:** el diseño agrega la opción él mismo; en Mimi la agrega la app (`(create)`), y el Combobox la elige en cuanto aparece.
  - **Anuncio de la cantidad de resultados:** no está en el diseño.
  - **Ícono del principio:** en el diseño es parte del campo; en Mimi lo pone el usuario (`[mimiComboboxStart]`).

  Combobox (G2.8b, múltiple):
  - **Chips:** los del ítem `chip` (los de Tags Input: botón de quitar con opacidad 0,7, presión 0,9); el diseño del Combobox usa `muted-foreground` y 0,85 (ver Tags Input).
  - **Resumen «+N»:** el diseño lo muestra en la fila de estados (un chip de 24px sin botón y «+2»); Mimi lo aplica con el campo cerrado y sin foco, con el chip normal (26px, con su botón de quitar).
  - **Escape cerrado:** el diseño no lo define; en el múltiple Mimi solo vacía lo escrito (no quita los chips).
  - **Ayuda:** el diseño la escribe a mano debajo del campo; en Mimi es parte del componente en el múltiple (`hint`), en el `aria-describedby` del campo.
  - **Anuncios al agregar y quitar:** no están en el diseño (los de Tags Input).

  Date Picker y calendario (G2.9a):
  - **Teclado de la APG en la cuadrícula:** el diseño usa un botón por día con Tab; Mimi usa una cuadrícula (`role="grid"`) con una sola parada de Tab y las teclas de la APG.
  - **Días no disponibles:** el diseño los pone `disabled`; en Mimi llevan `aria-disabled` y reciben el foco (si no, las flechas no podrían pasar por ellos), con el mismo aspecto (0,38, tachado).
  - **Idioma:** el diseño escribe meses y días en español y empieza el lunes; en Mimi salen de `Intl` con el idioma. Con `es`, el título es «Septiembre de 2026» (el diseño, «Septiembre 2026») y la fecha del botón «30 sept 2026» (el diseño, «30 sep 2026»).
  - **Nombre del botón del título:** el diseño usa solo «Cambiar vista»; Mimi usa «Septiembre de 2026, Cambiar vista» (el nombre contiene el texto visible).
  - **Foco al abrir:** el diseño no lo define; Mimi lo lleva al día elegido o a hoy (el Popover enfoca el elemento con `autofocus`).
  - **«Ir a hoy»:** el diseño cambia el mes; Mimi además lleva el foco a hoy.
  - **Calendario suelto:** no está en el diseño.

  Date Range (G2.9b):
  - **Botones de mes:** el diseño los llama «Mes anterior» y «Mes siguiente»; Mimi usa los del calendario («Anterior», «Siguiente»).
  - **Atajos:** el diseño trae seis fijos; en Mimi son de la app (`presets`), y los seis del diseño están en el ejemplo.
  - **Fecha del botón:** con `Intl`, «24 sept 2026 – 30 sept 2026» (el diseño, «24 sep 2026 – 30 sep 2026»).
  - **Cerrar con solo el inicio:** el diseño no lo define; Mimi lo descarta y el valor no cambia.
  - **Límites:** se llaman `minDate` y `maxDate` (no `min`/`max`, que en un control de formulario tendrían el tipo del valor).

  File Upload (G2.11):
  - **La zona es un `<button>`** (el diseño, un `div` con `role="button"`), con el mismo contenido.
  - **Nombres al arrastrar:** el diseño muestra «portada.jpg, contrato.pdf y 1 más»; el navegador no da los nombres hasta soltar, así que Mimi muestra solo la cantidad («Suelta para subir 3 archivos»).
  - **Rechazados:** en el diseño, un archivo de más de 10 MB entra a la lista con su error; en Mimi no entra en el valor (sale por `(rejected)`) y la app decide si lo muestra.
  - **La lista es de la app:** `mimi-file-item` recibe el estado; la subida simulada del diseño está en el ejemplo.
  - **Tamaño con el idioma:** `Intl.NumberFormat` con `LOCALE_ID` («2,4 MB» en `es`; el diseño, «2.4 MB»).
  - **Anuncios:** no están en el diseño.

  Color Picker (G2.12):
  - **Disparador:** el diseño solo dibuja el panel; `mimi-color-input` (la caja de Input con la muestra y el valor, y el panel en un Popover) es propuesta de Mimi, sin diseño.
  - **Colores fijos de los pulgares y las muestras:** el borde blanco y las sombras del diseño son tokens del componente (`--mimi-color-picker-thumb-border`, `-thumb-shadow`, `-swatch-border`) con el valor del diseño.
  - **`aria-valuenow` en el área:** el diseño no lo pone; ARIA lo pide en un `slider`, así que Mimi da la saturación (y las dos en `aria-valuetext`).
  - **Foco:** el contorno de los botones (2px separado), en el área, el tono y las muestras.
  - **Paleta:** el diseño trae 16 colores fijos; en Mimi la paleta es de la app (`swatches`) y los 16 están en el ejemplo.
  - **Muestras:** una parada de Tab por grupo y flechas (el diseño: Tab por cada una).
  - **Tono y recorte:** Re Pág/Av Pág e Inicio/Fin en el tono; aviso cuando un OKLCH se recorta a sRGB. No están en el diseño.
  - **Panel suelto sin fondo:** el panel del diseño tiene fondo, borde y sombra; el `mimi-color-picker` suelto no los trae (los pone la app, como en el ejemplo); el del disparador, sí.

  Revisión móvil del Grupo 2 (5.17b, 05/11/2026; anotado en la G2.P, 06/11/2026):
  - **Paneles altos en pantallas chicas:** el calendario (365px), el Date Range con atajos (360px) y el Color Picker en su disparador (372px) no caben arriba ni abajo de un disparador que está en el medio de una pantalla de 360 × 780 y quedan de 2 a 7px fuera del margen de 8px. Sin diseño móvil; si se confirma en un teléfono real, diseñar una alternativa (por ejemplo, una hoja inferior) o un panel más bajo.
  - **Objetivo del Slider:** el anfitrión del Slider mide 24px de alto (el diseño, 20px, el alto del pulgar) para que en el rango estrecho los objetivos de los dos pulgares no se toquen (2.5.8). El aspecto no cambia.
  - **Objetivos chicos que cumplen por espaciado:** el botón de quitar del chip (18 × 18px, Tags Input y Combobox) y la barra de tono del Color Picker (12px de alto). Si se quiere un área táctil mayor, definirla en el diseño.

  Grupo 3 (G3.0), al escribir las tablas de tokens (07/11/2026, spec 13, «Grupo 3»):
  - **Sin hoja de variables:** ningún componente del Grupo 3 está en `mimi-variables-*.css` ni en `tokens-mimi.css`; las tablas salen de los estilos de `F4 Command Tree Sortable` y `Data Table`. Pasar los valores a la hoja de tokens.
  - **Radios fijos en Command:** la caja del ícono (7px) y las teclas `kbd` (5px; 4px en el pie) no usan tokens de radio.
  - **Colores fijos en la sombra de la columna fija de Data Table** (`oklch(0 0 0 / .25)`) y en las mezclas de hover y elegida (`color-mix` con `foreground` 3,5 % e `info` 8 % sobre `card`): no hay globales para ellos; quedan como tokens propios de la tabla.
  - **Casillas dibujadas a mano:** Tree (selección múltiple) y Data Table dibujan su casilla (16px, check de 12px); Mimi usa su Checkbox, con el mismo tamaño.

  Tree (G3.1, 07/11/2026):
  - **La casilla no es un botón:** el diseño pone un `<button role="checkbox">` y un botón para el chevrón dentro de cada `treeitem` del múltiple; Mimi no pone controles enfocables dentro de un nodo (la casilla es visual, con los estilos de Checkbox, y el estado va en el `aria-checked` del nodo) y el chevrón es un `span` que se puede pulsar. Sin `aria-multiselectable` (es de `aria-selected`; el múltiple usa `aria-checked`).
  - **Íconos y colores de los archivos:** son del usuario (plantilla `mimiTreeNode`); el ejemplo del sitio usa los del diseño (`folder`, `file-code`… con los `-soft-foreground`).
  - **Sin diseño:** la fila de error de la carga diferida (texto en `destructive-soft-foreground`, 12,5px, como «Cargando…»), los nodos deshabilitados (opacidad 50 %) y el árbol deshabilitado.
  - **Fila «Cargando…» (Tree):** el diseño la pinta dentro del árbol; Mimi la oculta a los lectores (`aria-hidden`) y anuncia el texto en una región `role="status"` aparte (los hijos de un `tree` solo pueden ser `treeitem` o `group`).

  Sortable List (G3.2, 07/11/2026):
  - **Agarrado con el teclado:** el diseño solo dibuja el arrastre con el puntero (girado y escalado); con el teclado, el elemento agarrado lleva la sombra y el anillo del levantado, sin girar (se mueve paso a paso) y con el asa en `accent`.
  - **Hueco:** del alto del elemento que se arrastra (el diseño, 56px fijos), para elementos con más contenido.
  - **Sin diseño:** la lista deshabilitada (asas al 50 %) y el asa con foco (el contorno `ring` de los botones).
  - **Contenido del elemento:** el número, el título, el dato y la etiqueta del diseño son del usuario (plantilla `mimiSortableItem`); el ejemplo del sitio los reproduce con Badge.

  table-01 (B.9, 07/11/2026):
  - **Escritorio y móvil con CSS:** el diseño cambia de vista con una propiedad (`mobile`); Mimi dibuja las dos y las alterna con `md:` (la oculta, `display: none`). El punto de corte (768px) no está en el diseño.
  - **Textos en inglés** (B.1-i); el diseño los tiene en español.
  - **Tabla de escritorio:** la Data Table de Mimi (columnas Customer, Status, Plan, MRR, Users y Country; el diseño tiene más: país con prefijo, última actividad, creado). Estado con Badge `soft`; sin el avatar de iniciales ni el menú de acciones por fila del diseño (la plantilla `mimiTableActions` está disponible).
  - **Resumen por estado:** lista con un punto de color y el número, sin las tarjetas del diseño.
  - **Móvil, sin diseño:** la barra de acciones (el diseño la fija abajo; sin menú de fila, sin «Export» con ícono) y el estado vacío («No customers match.»).

  Data Table (G3.4, 07/11/2026):
  - **Sin navegación por celdas:** el diseño no dice si es una tabla o un `grid`; Mimi usa una `<table>` nativa con botones que se recorren con Tab.
  - **Casilla del encabezado:** marca la página visible (el diseño marca «todas»); la barra cuenta todas las elegidas.
  - **Filtro:** el diseño abre un diálogo con casillas (y un cuadro "Contiene…" para el texto); Mimi usa un Dropdown Menu con casillas de menú y no tiene filtro de texto por columna (para otra versión).
  - **Ancho de las columnas:** las fijas necesitan `width`; el diseño las fija en la hoja. Sin `width`, no se fijan.
  - **Sin diseño:** la columna de acciones es una plantilla (el menú del ejemplo es el Dropdown Menu), las filas de esqueleto (tres barras, no las columnas del diseño), «sin datos» (distinto de «sin resultados») y la barra con selección en móvil (la barra se parte en varias líneas).
  - **RTL:** Data Table usa propiedades lógicas (`start-0`, `ps/pe`, `text-end`, `inset-inline-start`); la sombra de la columna fija se invierte en RTL con una variable interna (`--sticky-dir`, 1 o -1, interna y sin prefijo `--mimi-` porque no es un token; arreglo de la G3.P) y el desplazamiento negativo de RTL cuenta como «desplazada». Un `--mimi-table-sticky-shadow` propio se usa tal cual en las dos direcciones. Sin diseño RTL.
  - **Sombra de la columna fija:** aparece con cualquier desplazamiento horizontal (el diseño la ata a la tabla desplazada); el borde interior de 1px no se dibuja.

  Command (G3.3, 07/11/2026):
  - **Título de grupo:** relleno `6px 8px 4px` (el de la lista compartida con Combobox, ítem `option-list`), no el `8px 10px 4px` del diseño; el tamaño, el peso y el color son los del diseño.
  - **Alto de la lista:** el diseño lo fija en 332px; Mimi lo usa como máximo (`--mimi-command-list-height`) y la lista se acorta al filtrar, así que el panel cambia de alto mientras se escribe.
  - **Posición del panel en una pantalla real:** el diseño lo pone a 36px del borde de arriba dentro de un marco de 500px; Mimi usa esos 36px en la pantalla (`--mimi-command-top`). En móvil tapa la cabecera del sitio. Confirmar con el diseño (por ejemplo, un porcentaje del alto).
  - **Sin diseño:** comandos deshabilitados (opacidad 50 %, sin ejecutar), la paleta dentro de la página (borde, radio de tarjeta y sombra `popover`, sin la tecla `esc`) y el disparador en Windows (el ejemplo muestra «Ctrl K» fuera de Mac).
  - **Atajos de la derecha:** se muestran en `kbd`, ocultos a los lectores (los símbolos ⌘ ⇧ se leen mal); Mimi no los registra.
  - **Disparador del diseño:** la caja de Input de 220 × 34px con «Buscar…» y ⌘K no es una pieza de Command; el ejemplo del sitio la escribe con clases.

  Blocks: la página del sitio (B.1, 07/11/2026):
  - **Página de un Block sin diseño:** `Mimi F6 Blocks.dc.html` es el índice de los Blocks, no la página de documentación. La página (`/docs/blocks/<nombre>`) se armó con lo que ya tiene el sitio: título, descripción, la vista previa en un marco con borde y fondo `muted`, `InstallCommand`, «Componentes que usa» como enlaces en píldora, el código con `CodeBlock` (un bloque por archivo) y la tabla de API. Pedir el diseño de la página.
  - **Marco de la vista previa:** `iframe` de 760px de alto, con tres `mimi-toggle-group` encima (Escritorio · Móvil (375 px), Claro · Oscuro y el estado) y el enlace «Abrir en una pestaña». El ancho móvil (375px) es el de los marcos de `F6 Blocks`; el alto y los controles no están en el diseño.
  - **Páginas y secciones (B.11, 07/11/2026):** sin diseño. La sección «Instalación» de un Block de tipo página dice qué archivos genera (`login/login.ts`, `.html`, `.routes.ts`, `LoginPage`) y muestra la línea para `app.routes.ts` en un `CodeBlock`; la de una sección (`pricing-01`) dice que va dentro de una página. Las notas cambian con el tipo (`--name`, `aliases.pages`, las pantallas de la 0.4.0). «Código» muestra los archivos como los genera la CLI. Si se pide el diseño de la página de un Block, incluir los dos tipos.
  - **`pricing-01` sin `min-h-svh` (07/11/2026, pedido del usuario):** el índice de `F6 Blocks` lo dibuja a pantalla completa, pero es una sección (B.11-a) y va dentro de una página con más partes, así que ya no fuerza el alto de la pantalla (`class="min-h-svh"` lo devuelve). Lo demás del marco (fondo, márgenes, el `h1` del título) no cambia. **Pendiente de decidir con el diseño:** como sección, su título quizá debería ser un `h2` (hoy es el único `h1`, y la página que la contiene tendrá el suyo).

  login-01 (B.2, 07/11/2026):
  - **Error de credenciales sin diseño:** un `role="alert"` encima del botón, con el ícono `circle-alert` y los colores de error suave (`destructive-soft-bg`, `destructive-soft-foreground`, radio `--mimi-radius`), derivados del error de Input. Pedir el diseño.
  - **Campos inválidos sin diseño:** los de `mimi-form-field` y `mimi-input` (borde y etiqueta en `destructive`, mensaje debajo); al enviar con errores, el foco va al primero.
  - **Contraseña:** el diseño la escribe a mano (input y botón del ojo); el Block usa `mimi-password` (G2.3), con el mismo botón (`aria-pressed`, nombre fijo).
  - **Logotipos:** la «G» de Google es la letra en un círculo del diseño (no el logotipo); GitHub, el ícono `github` de Lucide escrito en línea (Lucide lo marca como obsoleto por ser una marca).
  - **Separador con texto:** `mimi-separator` no tiene texto; «or with your email» va entre dos separadores dentro del Block.
  - **Botón principal:** 4px más alto que el control (`calc(var(--mimi-control-height) + 4px)`), con `class` en `mimiBtn`; el giro de carga se detiene con «reducir movimiento» (el diseño no lo dice).
  - **Textos en inglés** (B.1-i): los del diseño, traducidos («Sign in», «Welcome back to Mimi Sales.», «or with your email», «Forgot it?», «Remember me for 30 days», «Signing in…», «Don't have an account? Sign up»).
  - **Trama de puntos:** la máscara usa `var(--mimi-foreground)` en lugar de `#000` (solo cuenta el canal alfa; así no hay un color fijo).

  login-02 (B.3, 07/11/2026):
  - **Imagen (provisional):** el diseño tiene un hueco de la herramienta (`image-slot`), no una imagen. Sin `imageSrc`, el Block muestra un **degradado neutro** (`from-secondary via-muted to-accent`), marcado como provisional en el código (decidido por el usuario). Pedir la imagen o una ilustración libre (SVG en línea) para el ejemplo.
  - **Error de credenciales y campos inválidos:** sin diseño, como en login-01 (`role="alert"` con los colores de error suave).
  - **Iniciales del testimonio:** `mimi-avatar` pequeño (32px) con `bg-info-soft` y `text-info-soft-foreground`, como el `span` del diseño.
  - **Vidrio:** con «reducir transparencia» (`prefers-reduced-transparency`), fondo `card` sólido y sin desenfoque (no está en el diseño).
  - **Corte del diseño:** dos columnas desde `md` (768px); el diseño solo dibuja 1280px y móvil.
  - **Textos en inglés** (B.1-i) y la nota legal.
  - **Testimonio de relleno (M5, 07/11/2026):** el diseño trae una cita, una persona y una empresa inventadas que nombran a otra biblioteca; el Block pone texto de relleno claramente genérico («Add a short quote from a customer here.», «Customer name», «Role · Company», iniciales «CN»). Si el diseño quiere un ejemplo, que sea igual de genérico.

  signup-01 (B.4, 07/11/2026):
  - **Estado «válido» de un campo:** `mimi-form-field` solo tiene errores. El «Looks good.» / «Valid email.» / «They match.» del diseño (ícono `circle-check` en `success-soft-foreground`) lo escribe el Block, en un elemento que describe el campo. Si se quiere en FormField, diseñarlo ahí (y su token).
  - **Color de la etiqueta y el mensaje con error:** el diseño usa `destructive-soft-foreground`; Mimi, `destructive` (`--mimi-field-error`, ya anotado arriba).
  - **Cuándo aparece el error:** al salir del campo (B.4-a), como el diseño; Mimi lo muestra también al escribir (`dirty`), así que el Block le pasa `[showError]` a cada campo.
  - **Términos:** el diseño no dibuja su error; el Block lo muestra debajo («Accept the terms to continue.») al pulsar el botón incompleto. «Terms» y «Privacy Notice» son enlaces (el diseño: texto).
  - **Botón:** `aria-disabled` en vez de `disabled` (la nota se lee y el botón se enfoca), con el aspecto deshabilitado del diseño; la nota cuenta también el nombre («your name»), que el diseño no lista.
  - **«Already have an account? Sign in»:** agregado (no está en el diseño), para `signinHref`.
  - **Dominio del correo:** el validador `email` de Angular acepta `ana@empresa`; el Block pide además un punto en el dominio, como el diseño.
  - **Textos en inglés** (B.1-i): beneficios y mensajes traducidos («Soporte en español» pasa a «Support that answers», neutro).

  otp-01 (B.5, 07/11/2026):
  - **Código incompleto al pulsar «Verify»:** sin diseño; el Block marca las casillas con el error y dice «Enter the 6-digit code.».
  - **Mensaje de éxito:** «Code verified. Signing you in…», como el diseño; el de error ya no sugiere el código del ejemplo («Prueba con 246810» es del diseño, no del Block).
  - **Casillas:** 42 × 50 px en móvil y 48 × 56 px desde `sm`, con los tokens de Input OTP (`--mimi-otp-width`, `-height`, `-gap`, `-font-size`) en `class`; el valor por defecto del componente es 46 × 54 px.
  - **«Use another email»:** un botón (salida `changeDestination`), no un enlace.
  - **Anuncio del reenvío:** «You can request another code now.» en una región `aria-live` oculta, solo al habilitarse (no está en el diseño).

  Tabs vertical (B.10, 07/11/2026):
  - **Sin diseño:** `F2 Toast Tabs Toolbar` no tiene Tabs vertical. Mimi lo armó con lo de la horizontal: filas iguales del alto de siempre (44px subrayada, 34px píldora), texto al inicio con 12px a los lados, la subrayada con el borde y la barra de 2px al inicio, y la píldora con su fondo moviéndose hacia abajo y sin el ancho máximo de 520px. El espacio entre la lista y el panel es el `gap` de 14px del componente. La navegación lateral de `settings-01` (fila con fondo `accent`, sin indicador) no es ninguna de las dos: lo resuelve la B.6.

  settings-01 (B.6, 07/11/2026):
  - **Navegación lateral y píldoras móviles frente a las variantes de Tabs:** ni `underline` ni `pill`. El Block usa una sola `mimi-tabs` (vertical en escritorio, horizontal en móvil, B.10) y la viste con `class` (selectores sobre `[role=tab]` y el indicador oculto): filas de 38px con fondo `accent` en la elegida (escritorio) y píldoras de 34px con borde que se desplazan en horizontal, la elegida en `primary` (móvil). Si se quiere como variante de Tabs, diseñarla (sin variante nueva sin decisión).
  - **Prefijo del usuario («mimi.dev/» en el diseño, «example.com/» en el Block):** no hay un grupo de input con prefijo; el Block arma la caja con los colores de Input (borde, fondo, foco y error).
  - **Descripción de los interruptores:** el diseño solo pone `aria-label`; el Block nombra cada uno con su título (`<label for>`) y lo describe con su descripción (`aria-describedby` en el botón de Switch, que no tiene entrada para eso).
  - **Barra de asientos:** `mimi-progress` con su nombre («Seats used»), no un `div`.
  - **«Quitar» la foto y «Cerrar» la sesión:** `mimiBtn` `ghost`/`danger` y `outline`/`secondary` en tamaño `sm`; «Cerrar» lleva el dispositivo en su nombre accesible («Sign out of Safari · iPhone»).
  - **Moneda y fecha:** con `Intl` y el `LOCALE_ID` (el diseño: «$240 por persona» y «1 de noviembre» escritos); el ejemplo usa 12 USD.
  - **Barra de cambios:** con «reducir transparencia», fondo sólido; el botón «Save» dice «Saving…» con `saving` (no está en el diseño).
  - **Textos en inglés** (B.1-i). **Datos de ejemplo genéricos (M5, 07/11/2026):** el diseño usa una persona inventada y dos ciudades; el Block, «Your name», «your-username», «YN», «Your city» y «Another city».

  pricing-01 (B.7, 07/11/2026):
  - **Borde del destacado (B.7-a, decidido por el usuario):** estático. El mismo `conic-gradient` de `info` y `success` del diseño (desde 200°), quieto, sobre `border`, con 1,5px, `shadow-popover` y la insignia; sin `@keyframes mimi-beam` ni `@property --mimi-beam-a`. Cuando exista Border Beam (E.7), el sitio mostrará cómo cambiarlo.
  - **Pie de precios:** el del diseño es de un país («pesos mexicanos más IVA · Factura CFDI 4.0»); el Block dice «Prices in &lt;moneda&gt;, taxes not included · FAQ».
  - **Precios del ejemplo:** en USD (12/10 y 24/20 por persona y mes), con `Intl.NumberFormat`; el diseño usa 190/158 y 240/199 pesos.
  - **Interruptor mensual/anual:** `mimi-toggle-group` redondeado (`rounded-full` con `class`), con su fondo deslizante; el «−17%» es un `mimiBadge` dentro del botón Anual.
  - **«Custom»:** el diseño dice «A medida»; sin unidad ni nota.

## Refinamiento 0.6.0 (09/11/2026): sin diseño de Claude Design

- **Tamaños `sm` y `lg` de Toast, Switch, Checkbox, Dialog y de los controles:** el diseño solo muestra `md`. Las medidas de `sm` y `lg` (Toast: alto mínimo 48/84 px, ancho 288/400 px; Switch 32×18 y 44×24; Checkbox 14 y 20 px; Dialog 360 y 560 px) las eligió el plan: pendientes de revisión en Claude Design.
- **Escala de violeta de la marca (`--mimi-brand-50…950`):** solo las anclas `600` (`#793EEA`) y `400` (`#A88FFF`) vienen de la marca; los pasos intermedios son una curva propuesta.
- **Toast `outline` de color y `neutral`:** sin diseño (el diseño solo muestra la tarjeta neutra y el sólido).
- **`info` más oscuro en claro (`oklch(0.44 0.17 255)`) y más claro en oscuro (`oklch(0.83 0.11 250)`):** ajustado para distinguirlo del violeta de marca por luminosidad.
