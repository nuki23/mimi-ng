# Plan: una plantilla común para las páginas de componentes

[← Índice del plan](../../plan.md) · [Auditoría](auditoria.md) · [Ejemplos: Button y Select](ejemplos.md)

Origen: la revisión del sitio que hizo el usuario el 12/11/2026. Dijo: «Las páginas de componentes no tienen una estructura común y presentan demasiada información». **Solo plan:** todavía no se cambió ninguna página. El informe de la tanda está en `docs/auto/refinamiento-0.6.0-parte7-2026-11-12.md`.

## Qué se encontró (resumen de la [auditoría](auditoria.md))

- **38 páginas de componentes, 7 Blocks y la portada.** Las páginas de componentes comparten el esqueleto (Instalación, Uso, Ejemplos, API) y nada más. Los Blocks sí tienen una plantilla común (`blocks/block-doc.ts`).
- **La accesibilidad tiene seis nombres:**
  - «Teclado y accesibilidad» (23 páginas);
  - «Accesibilidad» (7);
  - «Teclado» (2);
  - «Teclado y táctil»;
  - «Título y accesibilidad»;
  - ninguno (7 páginas).
  - Siempre es un h3 colgado de «Ejemplos».
- **Primera columna de la API:**
  - «Input» (14 páginas), «Entrada» (16), «Opción», «Llamada», «Miembro» y «Pieza»;
  - las salidas salen de **cinco formas** distintas.
- **Textos (i18n):** van en Ejemplos (9 páginas), en la API (4) o en Uso (1). Cuatro páginas aplican el proveedor de textos sin explicarlo.
- **Formularios:** 12 de las 17 páginas con las pestañas de R.13 repiten lo mismo en un ejemplo vivo. Input, Select y Switch van más lejos: un ejemplo vivo por sistema de formularios, **además** de las pestañas.
- **Detalles de implementación en la página:**
  - 21 páginas explican `@angular/aria` y `@angular/cdk` en Instalación (tres con el texto copiado casi literal);
  - el Uso de Checkbox, Input OTP, Input Mask, Number Input, Toast y Confirm cuenta decisiones internas;
  - Button documenta atajos que dejan de existir.
- **Las más pesadas:**
  - Select: unas 970 palabras y 11 ejemplos;
  - Dialog: unas 960 palabras y 30 filas de API;
  - Combobox: unas 660 palabras;
  - Form Field: unas 590 palabras y dos h2 propios;
  - Toolbar: unas 590 palabras y una accesibilidad de 193 palabras.
- **Doce ejemplos pasan de 80 líneas.** El más largo es `data-table-full` (187).
- **Ninguna página usa un desplegable.** Todo está siempre abierto.

## PENDIENTE DE DECIDIR (usuario) — PD-4: la plantilla de página

> **Decide el usuario.** En modo autónomo no se adopta por defecto (lo pidió el encargo del 12/11/2026). Hasta que decida, las tareas DP.1 en adelante no empiezan; DP.0 tampoco, porque depende de la variante.

Las dos variantes comparten las reglas comunes (abajo). Se diferencian en cuánto se ve sin abrir nada. En [ejemplos.md](ejemplos.md) están Button y Select con cada una.

### Reglas comunes (las dos variantes)

1. **Orden fijo.** Una sección que no aplica se omite: nunca cambia de lugar ni de nombre.
2. **Nombres fijos:**
   - h2 `Instalación`, `Uso`, `Ejemplos`, `Accesibilidad y teclado` y `API`;
   - h3 de API: `Entradas`, `Salidas`, `Piezas`, `Textos` y `Variables CSS`.
   - Los `id`, también fijos: `installation`, `usage`, `examples`, `accessibility`, `api`, `inputs`, `outputs`, `parts`, `texts`, `tokens`.
3. **Cabecera:** el h1 con el nombre que sale en el menú, más **una frase de 12 a 25 palabras**, nominal: «Botón para…», «Lista desplegable para…». Debe decir qué es y para qué sirve, sin enumerar todas sus funciones.
4. **Demo principal**, sin título y antes de Instalación: **un** ejemplo realista del caso común (como el «Editar usuario» de Dialog), con Vista y Código, de **60 líneas como máximo** (en uno o dos archivos).
5. **Instalación:** solo el comando.
   - Lo que instala de más (`@angular/aria`, `@angular/cdk`, el CSS del CDK, otros ítems como `option-list` o `chip`) va en un **desplegable «Qué instala»** común, generado desde el registro de la CLI.
   - Nada de versiones exactas en la página: van en Fundamentos.
6. **Uso:** el código mínimo (**12 líneas como máximo**) y **dos frases como máximo**. Nada de cómo está hecho por dentro.
7. **Cada ejemplo** lleva un h3 y **una frase de 25 palabras como máximo**: qué muestra y, si hace falta, cómo probarlo («Escribe «mede»: el filtro no distingue tildes»). Va en presente o en imperativo y sin nombres internos (`aria`, `rodeo`, `CDK`).
8. **Los ejemplos van en un orden fijo** y solo con los que aplican:
   1. Tamaños
   2. Variantes (los tonos dentro)
   3. Estados (deshabilitado, solo lectura, carga y error, en **un** ejemplo con rejilla)
   4. Formularios: las pestañas Signal Forms / Reactive / plantilla (R.13). **No hay ejemplos vivos que repitan las pestañas**, salvo uno de validación si el control tiene algo propio (Input OTP, Slider de rango).
   5. Casos avanzados
   6. Personalizar con `class`
   7. Alternativas (`[options]` en Select y Combobox)
9. **Los ejemplos son cortos:** **80 líneas como máximo** por archivo, sin `as` ni funciones de ayuda para tipar plantillas. Si un caso necesita más, se parte en dos archivos (`CodePreview` admite `files` desde el 12/11/2026) o pasa a un Block.
10. **API:**
    - tablas con las columnas fijas `Entrada | Tipo | Por defecto | Descripción`, `Salida | Tipo | Descripción` y `Pieza | Selector | Para qué`;
    - descripciones de **20 palabras como máximo**;
    - los `data-*` en una línea debajo de Entradas.
    - Un solo componente compartido (`app-api-table`) pinta todas.
11. **Fuera de la página:**
    - decisiones y rodeos internos (a la spec);
    - versiones, atajos que se quitan y migraciones (al CHANGELOG, con un enlace);
    - notas para el revisor.
12. **Desplegable** (`<details>` con un componente común `app-more`, cerrado por defecto): la matriz variante × tono, las listas largas de teclado (más de 6 puntos), «Qué instala» y las explicaciones de más de 3 frases que sí son para el usuario (por ejemplo, la cascada de mensajes de error de Form Field).

### Variante A — completa (recomendada)

| #   | Sección (h2)            | Qué va                                                                                                           | Límite                           |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | Cabecera + demo         | h1, frase, demo principal                                                                                        | 25 palabras · 60 líneas          |
| 2   | Instalación             | comando + desplegable «Qué instala»                                                                              | —                                |
| 3   | Uso                     | código mínimo + 2 frases                                                                                         | 12 líneas                        |
| 4   | Ejemplos                | en el orden fijo de la regla 8                                                                                   | **8 ejemplos vivos** como máximo |
| 5   | Accesibilidad y teclado | viñetas: qué teclas, qué anuncia, qué tiene que poner el usuario (un `aria-label`…); el resto, en el desplegable | 6 viñetas visibles               |
| 6   | API                     | Entradas, Salidas, Piezas, Textos (proveedor y `*_ES`, siempre que el componente tenga textos), Variables CSS    | 20 palabras por descripción      |

**Prosa visible fuera de la API:** 400 palabras como máximo.

- **A favor:** todo lo que importa se ve sin abrir nada; cubre bien los componentes con mucho uso real (Select, Data Table, Dialog); se parece a lo que ya hay y la migración es de orden y recorte, no de reescritura.
- **En contra:** las páginas grandes siguen siendo largas (Select queda en 7 ejemplos).

### Variante B — corta

| #   | Sección (h2)            | Qué va                                                                                            | Límite                           |
| --- | ----------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | Cabecera + demo         | h1, frase, demo principal                                                                         | 20 palabras · 50 líneas          |
| 2   | Instalación             | comando + desplegable «Qué instala»                                                               | —                                |
| 3   | Uso                     | código mínimo, sin prosa                                                                          | 10 líneas                        |
| 4   | Ejemplos                | Tamaños y variantes **juntos**, Estados, Formularios (pestañas), **un** caso avanzado como mucho  | **4 ejemplos vivos** como máximo |
| 5   | Accesibilidad y teclado | 3 viñetas visibles; el resto, en el desplegable                                                   | 3 viñetas                        |
| 6   | API                     | **una** tabla (las salidas como filas `(nombre)`); Piezas, Textos y Variables CSS en desplegables | 15 palabras por descripción      |

**Prosa visible fuera de la API:** 200 palabras como máximo. Los casos avanzados que no quepan van a una página aparte, «Recetas», con un enlace.

- **A favor:** páginas de un vistazo y todas parecidas.
- **En contra:**
  - Select, Combobox, Data Table, Dialog y Form Field pierden ejemplos que la gente busca (servidor, plantilla propia, cascada de errores) o los mandan a «Recetas», una página más que mantener;
  - la tabla única mezcla entradas y salidas, que es justo una de las inconsistencias de hoy.

**Recomendación: A.** Arregla lo que pidió el usuario (estructura común y menos información visible: los límites recortan las páginas pesadas entre un 30 y un 50 %) sin perder casos reales. Lo que B quita se puede plegar en A con el desplegable.

## Prioridad y tandas (después de PD-4)

Un commit por página. Al final de cada tanda: Playwright en claro y oscuro (que cada ejemplo corra, que el orden de las secciones sea el de la plantilla y que no haya errores de consola) y la prueba de estructura (DP.0).

| Tarea | Tanda                                      | Páginas                                                                                                 | Por qué este orden                                                                                                                                                                                                                                                      |
| ----- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DP.0  | Piezas comunes                             | —                                                                                                       | `app-api-table`, `app-more` y «Qué instala» desde el registro; una prueba `page-structure.spec.ts` que recorre las 38 páginas y exige el orden, los nombres y los `id` de la plantilla (al principio, con la lista de las que faltan; la lista se vacía tanda a tanda). |
| DP.1  | 1 · Las más pesadas (5)                    | Select, Combobox, Dialog, Form Field, Toolbar                                                           | Son las que el usuario revisó y las más largas; fijan cómo se aplica la plantilla a un componente grande.                                                                                                                                                               |
| DP.2  | 2 · Formularios con ejemplos repetidos (8) | Input, Switch, Checkbox, Input OTP, Number Input, Input Mask, Password, Tags Input                      | Quitar los ejemplos vivos que repiten las pestañas; mismo patrón en todas.                                                                                                                                                                                              |
| DP.3  | 3 · Capas flotantes (7)                    | Toast, Tooltip, Popover, Dropdown Menu, Context Menu, Confirm, Command                                  | Comparten el texto de aria/cdk (pasa a «Qué instala») y tablas de opciones con nombres distintos.                                                                                                                                                                       |
| DP.4  | 4 · Datos y fechas (9)                     | Data Table, Tree, Sortable List, Date Picker, Date Range, Color Picker, File Upload, Slider, Pagination | Ejemplos de más de 80 líneas y textos sin explicar; Data Table necesita un ejemplo vivo del modo servidor.                                                                                                                                                              |
| DP.5  | 5 · Simples (9)                            | Button, Badge, Avatar, Card, Separator, Skeleton, Progress, Tabs, Toggle Group                          | Cambios pequeños: demo principal, accesibilidad que falta y quitar matrices o duplicados.                                                                                                                                                                               |
| DP.6  | 6 · Blocks y portada                       | `block-doc.ts` (7 Blocks), portada                                                                      | Blocks: Instalación con el texto fijo de la CLI en el desplegable y el código en `app-more`. Portada: la vitrina (ver la auditoría).                                                                                                                                    |
| DP.P  | Puerta                                     | todas                                                                                                   | La prueba de estructura sin excepciones, Playwright de las 38 páginas y los 7 Blocks, y los presupuestos de bundle sin subir.                                                                                                                                           |

**Tamaño de las tandas:** de 5 a 9 páginas. Es lo que se revisa bien en una sesión de Playwright y en un informe. Las tandas 2 a 5 se pueden hacer en cualquier orden después de la 1.

## Lo que el plan no hace

- No cambia componentes ni su API: solo páginas, ejemplos y piezas del sitio.
- No toca la spec más allá de la sección 10 (Showcase), con la plantilla elegida.
- No añade dependencias: `<details>` es HTML y `app-more` es un componente del sitio.
