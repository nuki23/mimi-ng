# Auditoría de las páginas del sitio contra la plantilla (12/11/2026)

[← Plan](plan.md)

Estado del 12/11/2026, después de la Parte A de la séptima tanda: Dialog, Input OTP y Toast ya cambiaron y sus filas son las de ahora. Es una lectura del código de cada página (`apps/docs/src/app/pages/docs/components/<n>/`), sin servidor.

Abreviaturas: **P**, ejemplos vivos (`app-code-preview`); **C**, bloques de código estático; **F**, pestañas «Con formularios» (R.13); **pw**, palabras de prosa visibles (aproximado); **«Plantilla»**, la de [plan.md](plan.md) (las reglas comunes).

Orden que comparten casi todas: h1 + frase → Instalación → Uso → Ejemplos (con «Accesibilidad» como h3 al final) → API (con «Variables CSS» como h3). Lo que pide la plantilla y no tiene **ninguna** página:

- la demo principal antes de Instalación (solo Dialog, desde hoy);
- «Accesibilidad y teclado» como h2;
- el desplegable «Qué instala».

## Componentes

| Página          | P · C · F · pw   | Falta                                                        | Sobra (fuera o a un desplegable)                                                                | Orden distinto                                                     | Repetidos o engorrosos                                                                        | Nombres inconsistentes                                              |
| --------------- | ---------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| avatar          | 3 · 1 · — · 190  | demo principal                                               | —                                                                                               | el primer ejemplo es «Tamaños»                                     | —                                                                                             | API con columna «Pieza» + «Input»; «Accesibilidad»                  |
| badge           | 5 · 1 · — · 140  | Accesibilidad                                                | la matriz (desplegable)                                                                         | empieza por «Tonos»                                                | Tonos + Variantes + Matriz enseñan lo mismo                                                   | «Input»                                                             |
| button          | 8 · 1 · — · 240  | Accesibilidad (repartida en párrafos)                        | aviso de atajos que se quitan (CHANGELOG); párrafo de 70 palabras sobre `aria-disabled`         | empieza por «Tonos»                                                | la matriz repite Tonos y Variantes                                                            | «Input»; filas de API de atajos que dejan de existir                |
| card            | 4 · 2 · — · 160  | —                                                            | —                                                                                               | accesibilidad como h3 después de class                             | —                                                                                             | «Título y accesibilidad»; «Input»                                   |
| checkbox        | 3 · 1 · F · 175  | Accesibilidad, Textos                                        | Uso con detalles internos (`role=checkbox`, `button type`)                                      | empieza por «Estados»                                              | —                                                                                             | «Input»                                                             |
| color-picker    | 4 · 1 · F · 160  | Textos (aplica `provideMimiColorPickerText` sin explicarlo)  | —                                                                                               | «Solo lectura» aparte de Estados                                   | `panel` de 77 líneas con función de ayuda                                                     | «Entrada»                                                           |
| combobox        | 8 · 2 · F · 380  | —                                                            | aria/cdk en Instalación; párrafo de 54 palabras sobre el teclado del múltiple                   | Textos después de F                                                | «Formularios y estados» se solapa con F; `async` de 84 líneas; `custom` con cast              | salidas como filas de la tabla de entradas; «Entrada»               |
| command         | 2 · 3 · — · 240  | —                                                            | —                                                                                               | —                                                                  | `dialog` de 161 líneas                                                                        | API en bucle: «Entrada / Salida / Pieza»                            |
| confirm         | 7 · 4 · — · 370  | —                                                            | Uso con el contexto de inyección (dos párrafos de 45 palabras)                                  | Textos bajo API                                                    | 7 variantes pequeñas; «Textos personalizados» se solapa con Textos                            | «Opción»                                                            |
| context-menu    | 5 · 2 · — · 410  | —                                                            | aria/cdk en Instalación (54 palabras)                                                           | —                                                                  | `table` de 96 líneas                                                                          | «Teclado y táctil»; «Input»                                         |
| data-table      | 2 · 3 · — · 235  | ejemplo vivo del modo servidor (hoy es solo texto)           | párrafo que lista todas las funciones                                                           | —                                                                  | `full` de 187 líneas (el más largo)                                                           | API en bucle: «Entrada / Estado / Plantilla»                        |
| date-picker     | 4 · 3 · F · 245  | —                                                            | —                                                                                               | Textos antes de F                                                  | `forms` (con cast) repite F                                                                   | «Entrada»                                                           |
| date-range      | 2 · 1 · F · 140  | Textos (aplica el proveedor sin explicarlo)                  | —                                                                                               | —                                                                  | `forms` repite F; `report` con función de ayuda                                               | «Entrada»                                                           |
| dialog (hoy)    | 8 · 2 · — · 420  | — (tiene la demo principal desde hoy)                        | cdk en Instalación; 30 filas de API en tres tablas                                              | Textos bajo API                                                    | Básico, Sin cierre y Contenido largo son variantes pequeñas del declarativo                   | «Opción», «Miembro»                                                 |
| dropdown-menu   | 5 · 2 · — · 350  | estado deshabilitado                                         | aria/cdk en Instalación (55 palabras, casi igual que Select)                                    | —                                                                  | —                                                                                             | «Teclado»; salidas como columna; «Input»                            |
| file-upload     | 4 · 1 · F · 165  | Textos (aplica el proveedor sin explicarlo)                  | —                                                                                               | «Solo lectura» aparte                                              | `basic` de 93 líneas; `forms` repite F                                                        | `(rejected)` en la tabla de entradas                                |
| form-field      | 8 · 2 · — · 425  | Accesibilidad                                                | dos h2 propios («Mensajes de error», «Personalizar los mensajes», 4 niveles): desplegable o Uso | h2 propios entre Ejemplos y API                                    | `register` de 84 líneas                                                                       | h1 «FormField» (sin espacio); «Input»                               |
| input           | 11 · 1 · F · 185 | Accesibilidad                                                | tres ejemplos de formularios **y** F; deshabilitado y error repetidos para Textarea             | h2 «Formularios» propio; Instalación con subsecciones              | ver «sobra»                                                                                   | «Input»                                                             |
| input-mask      | 3 · 1 · F · 225  | —                                                            | Uso con una decisión de diseño («control propio, no directiva»)                                 | —                                                                  | `basic` de 97 y `forms` de 63 líneas con funciones de ayuda; `forms` repite F                 | «Estados y class» en un mismo h3                                    |
| input-otp (hoy) | 6 · 1 · F · 200  | —                                                            | Uso con el detalle del campo transparente                                                       | interactivo primero, pero después de Uso (no es la demo principal) | Signal y Reactive vivos **y** F (la plantilla deja uno, de validación)                        | «Accesibilidad»; «Entrada»                                          |
| number-input    | 4 · 2 · F · 225  | —                                                            | Uso con `Intl.NumberFormat`                                                                     | Textos antes de F                                                  | `forms` repite F                                                                              | `(touch)` en la tabla de entradas; «Entrada»                        |
| pagination      | 6 · 2 · — · 330  | Textos como sección; Estados                                 | —                                                                                               | Textos dentro de Uso; h3 de API con una sola tabla                 | `table` de 67 líneas + datos aparte                                                           | `(paginate)` en la tabla de entradas                                |
| password        | 6 · 2 · F · 235  | —                                                            | párrafo sobre APG y `aria-pressed`                                                              | «Solo lectura» después de Textos                                   | `states` de 76 líneas con función de ayuda                                                    | «Accesibilidad»; «Personalizar» (sin «con class»)                   |
| popover         | 5 · 2 · — · 280  | —                                                            | cdk en Instalación                                                                              | —                                                                  | —                                                                                             | «Accesibilidad»; «Input»                                            |
| progress        | 5 · 1 · — · 165  | ejemplo de tamaños (tiene `size`)                            | —                                                                                               | —                                                                  | `tones` de 50 líneas                                                                          | id `custom` (no `custom-class`); «Accesibilidad»; «Entrada»         |
| select          | 11 · 4 · F · 635 | Tamaños; solo lectura en Estados                             | aria/cdk en Instalación (56 palabras); párrafo de 67 palabras del modo servidor                 | Textos bajo API                                                    | Reactive, Signal y ngModel vivos **y** F; «Con `<mimi-option>`» y «Con etiqueta» casi iguales | «Teclado»; la única con tabla de salidas aparte («Output»); «Input» |
| separator       | 4 · 1 · — · 190  | Accesibilidad con su nombre (está en «Cuándo usar cada uno») | dos párrafos de 40 palabras sobre decorativo y semántico                                        | —                                                                  | —                                                                                             | —                                                                   |
| skeleton        | 4 · 1 · — · 150  | —                                                            | —                                                                                               | —                                                                  | —                                                                                             | «Accesibilidad»; «Input»                                            |
| slider          | 4 · 1 · F · 150  | Textos (aplica el proveedor sin explicarlo); deshabilitado   | —                                                                                               | —                                                                  | `range` de 69 líneas con dos casts y una función de ayuda                                     | «Entrada»                                                           |
| sortable-list   | 2 · 2 · — · 185  | —                                                            | —                                                                                               | —                                                                  | `priorities` de 70 líneas                                                                     | API en bucle: «Entrada / Salida»                                    |
| switch          | 6 · 1 · F · 260  | Accesibilidad                                                | ejemplos de los tres formularios **y** F                                                        | —                                                                  | el ejemplo de Reactive mezcla un Checkbox                                                     | h3 de API con una sola tabla; «Input»                               |
| tabs            | 9 · 1 · — · 350  | —                                                            | —                                                                                               | —                                                                  | «Básico» y «Atajo» casi iguales; 9 ejemplos                                                   | «Entrada»; «Personalizado»                                          |
| tags-input      | 3 · 2 · F · 140  | —                                                            | —                                                                                               | —                                                                  | `forms` repite F                                                                              | dos bloques de Variables CSS (la del chip)                          |
| toast (hoy)     | 8 · 3 · — · 345  | —                                                            | contexto de inyección y NG0203 en Uso; tres tablas                                              | Textos bajo API                                                    | Tonos y Sólidos se solapan                                                                    | «Llamada», «Opción»; la tercera tabla sin Descripción               |
| toggle-group    | 8 · 1 · F · 340  | —                                                            | cuatro ejemplos de variaciones visuales                                                         | «Solo lectura» después de class                                    | `forms` de 61 líneas repite F                                                                 | `(touch)` en la tabla de entradas; títulos con «·»                  |
| toolbar         | 5 · 1 · — · 405  | Estados                                                      | accesibilidad de 193 palabras (desplegable)                                                     | —                                                                  | `floating` de 140, `tooltips` de 82 y `vertical` de 73 líneas                                 | `(activate)` en la tabla de entradas                                |
| tooltip         | 6 · 2 · — · 370  | —                                                            | dos párrafos de más de 50 palabras sobre `aria-describedby` y táctil                            | —                                                                  | `toolbar` de 73 líneas se solapa con la página de Toolbar                                     | «Accesibilidad»; «Input»                                            |
| tree            | 3 · 3 · F · 215  | —                                                            | «Carga diferida» (solo código) repite lo que ya hace el primer ejemplo                          | —                                                                  | `files` de 129, `permissions` de 86 y `forms` de 82 líneas; `forms` repite F                  | API en bucle: «Entrada / MimiTreeNode»                              |

## Inconsistencias entre páginas

1. **Accesibilidad** (seis nombres; la plantilla deja uno, en un h2):
   - «Teclado y accesibilidad»: 23 páginas.
   - «Accesibilidad»: avatar, input-otp, password, popover, progress, skeleton y tooltip.
   - «Teclado»: dropdown-menu y select.
   - «Teclado y táctil»: context-menu.
   - «Título y accesibilidad»: card.
   - Sin la sección: badge, button, checkbox, form-field, input, separator y switch.
2. **Cabecera de la API:**
   - «Input» (14 páginas) y «Entrada» (16);
   - «Opción»: confirm, dialog y toast; «Llamada»: toast; «Miembro»: dialog; «Pieza» + «Input»: avatar;
   - una columna «Outputs»: dropdown;
   - en bucle con títulos propios: command, data-table, sortable-list y tree.
   - Los Blocks usan siempre «Entrada» / «Salida» (`blocks/block-doc.ts`): es la forma que adopta la plantilla.
3. **Salidas, cinco formas:**
   - tabla aparte con «Output»: select;
   - «Salida» en el bucle: command y sortable-list;
   - columna: dropdown;
   - filas `(x)` dentro de las entradas: combobox, file-upload, number-input, pagination, toggle-group y toolbar;
   - sin tabla: el resto.
4. **Textos:**
   - en Ejemplos: combobox, command, data-table, date-picker, number-input, password, sortable-list, tags-input y tree;
   - bajo API: confirm, dialog, select y toast;
   - en Uso: pagination;
   - sin sección aunque la página aplica el proveedor: color-picker, date-range, file-upload y slider.
5. **Personalizar:**
   - «Personalizar con class» con `id` `custom-class` en 10 páginas, y con `id` `custom` en 3;
   - «Personalizado» en 5; «Personalizar» en password;
   - mezclado con otra cosa en combobox, input-mask y tags-input.
6. **Formularios:**
   - 17 páginas con F, y 12 de ellas repiten lo mismo en un ejemplo vivo;
   - input, select y switch tienen además un ejemplo por sistema;
   - el título varía: «Con formularios…», «Formularios» o «Formularios y estados».
7. **Solo lectura** es un h3 suelto, a veces después de Textos o de class: color-picker, file-upload, password, slider y toggle-group. La plantilla lo pone dentro de «Estados».
8. **Primer ejemplo:**
   - «Básico» en 10 páginas;
   - un escenario en 5;
   - un eje de propiedad (Tamaños, Tonos, Estados) en avatar, badge, button, checkbox y switch.
   - Solo Dialog tiene una demo principal.
9. **API subdividida sin regla:**
   - un h3 por selector: tabs, toggle-group, toolbar, input y form-field;
   - un h3 para una sola tabla: pagination y switch;
   - varias tablas sin h3: command, data-table, sortable-list, tree, dialog y toast.
10. **Instalación:**
    - 21 páginas explican aria/cdk; select, dropdown-menu y context-menu con el texto casi copiado;
    - 7 llevan además el CSS del CDK (`depsCss`).
    - Va todo al desplegable «Qué instala».
11. **Uso:**
    - mide de 7 a 141 palabras;
    - mezcla decisiones internas en checkbox, input-mask, input-otp, number-input, toast y confirm.
12. **Cabecera:**
    - h1 «FormField» sin espacio (y así en el menú), frente a «Date Picker» o «Input OTP»; «Input y Textarea» es la única que junta dos piezas;
    - la frase cambia de forma: nominal, «Un/Una…», infinitivo («Elegir un color…») o verbo («Marca…»);
    - mide de 13 a 48 palabras.
13. **Notas de versión en la página:** button (variantes que se quitan, `default` hasta la 0.7.0).

## Las más pesadas (prosa visible + descripciones de la API)

| #   | Página     | Palabras | Ejemplos       | Lo que pesa                                             |
| --- | ---------- | -------- | -------------- | ------------------------------------------------------- |
| 1   | select     | ≈ 970    | 11 P + 4 C + F | Instalación con aria/cdk; 3 ejemplos de formularios + F |
| 2   | dialog     | ≈ 880    | 8 P + 2 C      | 30 filas de API en tres tablas (Uso recortado hoy)      |
| 3   | combobox   | ≈ 660    | 8 P + 2 C + F  | `[options]`; accesibilidad de 147 palabras              |
| 4   | form-field | ≈ 590    | 8 P + 2 C      | dos h2 de mensajes de error con 4 niveles               |
| 5   | toolbar    | ≈ 590    | 5 P + 1 C      | accesibilidad de 193 palabras; `floating` de 140 líneas |

Les siguen toast (≈ 580), context-menu (≈ 545), tabs (≈ 540, 9 P), tooltip (≈ 470) e input (11 P).

**Ejemplos de más de 80 líneas:**

- data-table-full (187)
- command-dialog (161)
- toolbar-floating (140)
- tree-files (129)
- input-mask-basic (97)
- context-menu-table (96)
- file-upload-basic (93)
- tree-permissions (86)
- combobox-async (84)
- form-field-register (84)
- toolbar-tooltips (82)
- tree-forms (82)

## Blocks (7 páginas)

Todas usan `blocks/block-doc.ts`, el único sitio con estructura común:

1. etiqueta «Block», h1 y descripción;
2. Vista previa (iframe con estados);
3. Instalación;
4. Uso, con Accesibilidad como h3;
5. Componentes que usa;
6. Código, archivo por archivo;
7. API (Entrada / Salida).

Problemas:

- **Instalación** repite en las 7 unas 250 palabras de texto fijo de la CLI: `aliases.pages`, `--name`, «la CLI no toca tus rutas» y la nota «¿La instalaste con la 0.4.0?». Además lleva un párrafo de landmarks que solo afecta a settings-01. Va al desplegable «Qué instala».
- **Código** vuelca los archivos enteros sin plegar (settings-01: 398 + 424 líneas). Va en `app-more`, con el `.ts` y el `.html` cerrados.
- **Orden distinto del de los componentes:** la Vista previa va antes de Instalación, que coincide con la demo principal de la plantilla, y la Accesibilidad va dentro de Uso. La plantilla la saca a su h2.

## Vitrina de la portada

`apps/docs/src/app/pages/home-page.html` y `home/`:

- **Qué muestra:**
  - una tarjeta de preferencias: Reactive Forms con Card, FormField, Input, Button, Switch y Checkbox;
  - «Equipo»: Avatar, Badge y Button;
  - «Avisos», desde hoy: Toast en sm, md y lg.
- **Qué falta:**
  - Muestra 9 de los 38 componentes: no hay capas flotantes, ni Select, ni fechas, ni tablas.
  - El botón «Componentes» lleva a Button porque no hay un índice de componentes.
- **Inconsistencias:**
  - Usa Reactive Forms, mientras que los Blocks usan Signal Forms.
  - La tarjeta «Formularios listos» habla de `FormControl`.
  - El enlace a Blocks enumera «inicio de sesión, registro, verificación, ajustes y precios» y omite table-01.
- **Propuesta (DP.6):**
  - una vitrina con un Select, un Date Picker y un Dialog abierto desde un botón;
  - Signal Forms;
  - el enlace a Blocks completo;
  - una página índice de componentes, como destino de «Componentes».
