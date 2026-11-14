# Auditoría de «uso corto» (R.24)

[← Plan de refinamiento](plan.md)

Principio (spec 1): **uso corto por defecto, composición cuando la necesites.** Criterio medible del plan: un «formulario de contacto» completo cabe en **≤ 12 líneas de plantilla**. Hoy son **7** (Input, Select, Textarea, Checkbox y Button dentro de Form Field, con `required`, `hint` y error automático), y lo comprueba `packages/ui-core/src/lib/short-use.spec.ts`: si una API cambia y deja de caber, la prueba falla.

Revisión hecha el 09/11/2026 **sobre el código y las páginas de la rama** (no con usuarios). «Ya cubierto» = la forma corta existe y está probada; «Hecho en la 0.6.0» = se hizo en esta rama; «Pendiente» = no se hizo.

## Atajos que existen (y quedaron probados)

| Componente                                                                                       | Forma corta                                                                                                                                        | Estado                               |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Form Field                                                                                       | `<mimi-form-field label="…" required hint="…" description="…" [errors]="{…}">` y mensajes con el validador (`withMessage`, Signal Forms `message`) | Hecho en la 0.6.0 (R.14)             |
| Tabs                                                                                             | `<mimi-tab label="…">…</mimi-tab>` junto a `ng-template[mimiTab]`                                                                                  | Hecho en la 0.6.0 (R.17)             |
| Dialog                                                                                           | `service.open(Componente, { size, inputs, padding, chrome })`, `ref.closed`                                                                        | Hecho en la 0.6.0 (R.6, R.7)         |
| Tamaño de un formulario                                                                          | `mimiSize="sm"` en el contenedor, sin repetirlo en cada campo                                                                                      | Hecho en la 0.6.0 (R.1)              |
| Blocks en carga                                                                                  | `[loading]` (inerte, devuelve el foco)                                                                                                             | Hecho en la 0.6.0 (R.11 y revisión)  |
| Toast                                                                                            | `provideMimiToast({ size })` y `toast.success('texto')`                                                                                            | Ya cubierto + R.4                    |
| Select, Combobox                                                                                 | `[options]` y `[(value)]`                                                                                                                          | Ya cubierto; `<mimi-option>` en R.15 |
| Button, Badge, Input, Textarea, Checkbox, Switch, Avatar, Separator, Skeleton, Progress, Tooltip | una línea por caso común                                                                                                                           | Ya cubierto                          |

## Casos donde el caso común sigue siendo largo (con su tarea)

| Caso                                           | Hoy                                                       | Forma corta propuesta                      | Tarea        |
| ---------------------------------------------- | --------------------------------------------------------- | ------------------------------------------ | ------------ |
| Select con contenido propio en las opciones    | `ng-template[mimiSelectOption]` o `[options]` con objetos | `<mimi-option value>texto</mimi-option>`   | R.15 (hecho) |
| Combobox con la misma API que Select           | tipos y plantilla de opción distintos                     | los mismos `<mimi-option>` y `[options]`   | R.16 (hecho) |
| Card                                           | seis componentes anidados                                 | `mimiCard` + piezas opcionales (PD-1, B)   | R.19 (0.7.0) |
| Data Table con celdas propias                  | `[columns]` + una plantilla por columna                   | estado «headless» + `@for` (PD-2, C)       | R.20 (0.7.0) |
| Cargando a pantalla completa o en una región   | cada componente con su `loading`                          | `MimiLoadingService`, `[mimiBlock]`        | R.23 (0.7.0) |
| Ejemplo con Signal Forms, Reactive y plantilla | un ejemplo por forma, a veces solo en el texto            | una sección «Con formularios» con pestañas | R.13 (hecho) |

## Recorrido de todas las páginas de componentes (10/11/2026)

Medido sobre el código de las **38 páginas** de componentes del sitio (los componentes sin página propia —Textarea, que va en la de Input, Menu, Calendar, Chip, Option List— se cubren con la del componente que los usa). Dos medidas por página, ambas **líneas de plantilla** sin contar las vacías:

- **Uso:** la plantilla del bloque «Uso» de la página (lo primero que ve quien llega). Lo vigila `apps/docs/src/app/code/short-use-pages.spec.ts` con un tope de **12 líneas** (Dialog en plantilla, 14, es la única excepción: un formulario completo; con el servicio son 1).
- **Primer ejemplo:** la plantilla del primer ejemplo de la página (a menudo un «mostrador» con varias variantes, no el uso mínimo).

| Página        |          Uso | Primer ejemplo |
| ------------- | -----------: | -------------: |
| avatar        |            4 |             24 |
| badge         |            1 |              8 |
| button        |            1 |              8 |
| card          |            8 |             14 |
| checkbox      |            2 |              6 |
| color-picker  |            1 |             22 |
| combobox      |            1 |              7 |
| command       |            1 |             55 |
| confirm       | — (servicio) |              4 |
| context-menu  |           10 |             32 |
| data-table    |            4 |             88 |
| date-picker   |            1 |             15 |
| date-range    |            1 |             17 |
| dialog        |           14 |             35 |
| dropdown-menu |            8 |             12 |
| file-upload   |            6 |             30 |
| form-field    |            3 |              6 |
| input         |            2 |              4 |
| input-mask    |            2 |             61 |
| input-otp     |            1 |             17 |
| number-input  |            1 |             35 |
| pagination    |            7 |              5 |
| password      |            3 |             14 |
| popover       |            9 |             10 |
| progress      |            1 |             16 |
| select        |            9 |             10 |
| separator     |            3 |              8 |
| skeleton      |            4 |             15 |
| slider        |            2 |             24 |
| sortable-list |            3 |             27 |
| switch        |            2 |              6 |
| tabs          |            8 |             20 |
| tags-input    |            1 |             11 |
| toast         | — (servicio) |              1 |
| toggle-group  |            4 |              9 |
| toolbar       |            9 |              9 |
| tooltip       |            3 |              1 |
| tree          |            1 |             42 |

**Lectura.** El criterio medible (≤ 12 líneas en el uso) **se cumple en las 36 páginas con plantilla** (Toast y Confirm se usan con un servicio) salvo Dialog en plantilla (14, justificado arriba). Los primeros ejemplos largos (Data Table 88, Input Mask 61, Command 55, Tree 42, Dialog y Number Input 35, Context Menu 32, File Upload 30) son mostradores de variantes, no el uso mínimo: no se tocan.

**Casos donde el caso común sigue siendo largo, con su tarea** (los de la tabla de arriba): Card (R.19), Data Table con celdas propias (R.20), cargas (R.23), Select con contenido propio en las opciones (hecho: `<mimi-option>`, R.15) y el ejemplo de formularios (hecho: pestañas, R.13).
