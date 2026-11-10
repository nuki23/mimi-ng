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

| Caso                                           | Hoy                                                       | Forma corta propuesta                      | Tarea            |
| ---------------------------------------------- | --------------------------------------------------------- | ------------------------------------------ | ---------------- |
| Select con contenido propio en las opciones    | `ng-template[mimiSelectOption]` o `[options]` con objetos | `<mimi-option value>texto</mimi-option>`   | R.15 (pendiente) |
| Combobox con la misma API que Select           | tipos y plantilla de opción distintos                     | los mismos `<mimi-option>` y `[options]`   | R.16 (pendiente) |
| Card                                           | seis componentes anidados                                 | `mimiCard` + piezas opcionales (PD-1, B)   | R.19 (0.7.0)     |
| Data Table con celdas propias                  | `[columns]` + una plantilla por columna                   | estado «headless» + `@for` (PD-2, C)       | R.20 (0.7.0)     |
| Cargando a pantalla completa o en una región   | cada componente con su `loading`                          | `MimiLoadingService`, `[mimiBlock]`        | R.23 (0.7.0)     |
| Ejemplo con Signal Forms, Reactive y plantilla | un ejemplo por forma, a veces solo en el texto            | una sección «Con formularios» con pestañas | R.13 (pendiente) |

## Lo que esta auditoría **no** hizo

- No recorrió los 43 componentes uno a uno con el criterio de líneas de plantilla: se midió el **formulario de contacto** (el criterio del plan) y se listaron los casos largos que ya tienen tarea. Los demás componentes (Tree, Sortable List, Command, Toolbar, menús, Calendar, Slider, File Upload, Color Picker, Tags Input…) quedan **sin revisar** para esta pasada.
- No hay una tabla de líneas por componente: si el usuario la quiere, es una tarea aparte (medir cada página del sitio con un recuento de la plantilla de su primer ejemplo).
