# Refinamiento 0.6.0, séptima tanda (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 6](refinamiento-0.6.0-parte6-2026-11-12.md)

Encargo (12/11/2026), en dos partes: **A**, cuatro arreglos tras la revisión del sitio (un commit cada uno, con pruebas y Playwright); **B**, solo el plan de una plantilla común para las páginas de componentes, con la auditoría de todas. Además, respuesta a las dudas de la sexta tanda: un ejemplo de `[options]` por página queda así, y `compareWith` acepta cualquier texto pero **avisa en desarrollo** si el campo no existe. **No se subió la versión ni se publicó nada.** Node 24.18.0.

## 0. `compareWith`: aviso en desarrollo si el campo no existe

- `mimiCompareFn` (`option-list.ts`): con un nombre de campo, si el valor elegido es un objeto sin ese campo, `console.warn` **una vez** por componente (`[Mimi] Select o Combobox: compareWith="ID": el valor no tiene el campo «ID»…`). Fuera de `isDevMode()` no avisa. Con valores sueltos (texto, número) no avisa: se comparan con `Object.is`.
- Pruebas (`compare-with.spec.ts`, +2): avisa una sola vez y no avisa con el campo correcto ni con valores sueltos; Select y Combobox con `compareWith="ID"` avisan una vez cada uno. 6 de 6 en verde.
- **Corregido en un commit aparte:** el primer texto del aviso (`[Mimi] compareWith=…`) no seguía el formato `[Mimi] Componente: …`, y lo detectó `dev-warnings.spec.ts` al pasar la suite completa. Ese commit quedó en la rama con esa prueba en rojo; el siguiente (`fix(select,combobox): el aviso de compareWith…`) la arregla.

## A1. Select y Combobox: la X de limpiar solo cuando hace falta

**Plan breve.** La X ya no sustituye siempre al chevron:

- **Cuándo se ve:** solo con el ratón encima del campo, con el foco dentro o con el panel abierto. En pantallas sin ratón (`@media (hover: none)`), siempre que haya valor.
- **Fuera de esos casos:** vuelve el chevron.
- **Cómo:** solo con CSS (variantes de grupo de Tailwind), sin estado nuevo.
- **Teclado:** Supr y Retroceso limpian con el foco en el campo.

**Qué se hizo** (`select.ts`, `combobox.ts`):

- Con valor y `clearable` se pintan **los dos**, la X (`data-slot="clear"`) y el chevron (`data-slot="chevron"`).
  - La X lleva `hidden` y se muestra con `group-hover/…`, `group-focus-within/…`, `group-data-[state=open]/…` y `[@media(hover:none)]:inline-flex`.
  - El chevron se esconde con las mismas cuatro variantes.
- `data-icon` del hueco sigue diciendo `clear`, `loading` o `chevron`. La X sigue en el orden del Tab: al recibir el foco, el foco ya está dentro y se ve.
- **Teclado:**
  - **Select**, con el panel cerrado: Supr o Retroceso en el disparador quitan el valor.
  - **Combobox simple:** quitan el valor si el campo muestra la opción elegida. Si se está escribiendo, Retroceso borra letras.
  - **Combobox múltiple:** Supr con el campo vacío quita todos los chips. Retroceso sigue quitando el último.
  - Sin `clearable` no hacen nada.
- Las dos páginas lo cuentan en «Teclado».

**Pruebas** (`clear-button.spec.ts`, nuevo, 8 casos):

- las clases de la X y del chevron en los cuatro casos;
- sin valor no hay X;
- Supr y Retroceso en Select, en el Combobox simple (escribiendo no limpia) y en el múltiple;
- sin `clearable` no limpian.

En verde. Con la suite completa de ui-core: 1017 pruebas, 1016 en verde. La que fallaba era `dev-warnings.spec.ts` (ver arriba), ya arreglada.

**Playwright** (sitio servido en el 4280; ejemplos «Con `<mimi-option>`» de Select y Combobox), en claro y oscuro. **28 de 28 OK, sin errores de página.**

- Sin ratón ni foco: chevron sin X.
- Con el ratón encima: X sin chevron.
- Con el foco: X.
- Con el panel abierto y el ratón fuera: X.
- Al salir: vuelve el chevron.
- Supr con el foco: limpia; el Select vuelve al placeholder y el Combobox queda vacío.
- Contexto táctil (`isMobile`, `hasTouch`; `matchMedia('(hover: none)')` = `true`): X visible con valor, sin ratón ni foco, y sin chevron.
