# Plan de refinamiento (0.6.0 y 0.7.0)

[← Índice del plan](../../plan.md)

Origen: las peticiones del usuario tras probar la 0.5.0 desde npm (09/11/2026), en [`peticiones-usuario.md`](peticiones-usuario.md). Este plan es solo **planificación**: ninguna tarea `R.x` está hecha ni empezada. Cada una cita el código actual (archivo y línea, comprobado el 09/11/2026 en `main` = `e4e967f`).

- Tareas de la **0.6.0**: [`R-0.6.0.md`](R-0.6.0.md) (R.0 a R.18 y R.24).
- Tareas de la **0.7.0**: [`R-0.7.0.md`](R-0.7.0.md) (R.19 a R.23).
- **Tres decisiones de gusto del usuario, sin adoptar por defecto:** [`decisiones-usuario.md`](decisiones-usuario.md) (Card, API de Table/Data Table, API de los mensajes de error de Form Field).
- **Combobox y Select** (por qué son dos y qué cambiar para que tengan la misma API): [`combobox-vs-select.md`](combobox-vs-select.md).
- El **Grupo 4** (Accordion, Sheet/Drawer, Stepper y `dashboard-01`) pasa de la 0.6.0 a la **0.8.0**.

## Principio nuevo (va a la spec 1)

**Uso corto por defecto, composición cuando la necesites.** Lo habitual se escribe en una línea (`<mimi-select [options]="…" />`, `<mimi-form-field label="…">`); cuando hace falta más control, el usuario compone piezas (`mimi-option`, `mimi-dialog-header`…) sin que Mimi lo amarre a un diseño. Toda API nueva de este plan se juzga con esa regla: la forma corta cubre el 80 % de los casos y la compuesta no es una API distinta, sino las mismas piezas por separado. Regla de revisión: si un ejemplo de la documentación necesita más de unas 5 líneas de plantilla para el caso común, la API se rediseña o se agrega un atajo.

## Reparto por versión

| Versión   | Tareas                                                                                                                                                                                                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **0.6.0** | R.0 tema de marca · R.1 escala de tamaños · R.2 a R.8 tamaños `sm/md/lg` en todos · R.9 clic uniforme · R.10 errores visuales · R.11 Blocks en carga · R.12 `readonly` · R.13 ejemplos de formularios · R.14 Form Field (atajos y errores) · R.15 Select · R.16 Combobox (misma API) · R.17 Tabs `mimi-tab` · R.18 OTP · R.24 auditoría de «uso corto» |
| **0.7.0** | R.19 Card · R.20 Table de directivas y Data Table · R.21 Sortable List con listas conectadas · R.22 Block `kanban-01` · R.23 servicio y directiva de carga                                                                                                                                                                                             |
| **0.8.0** | Grupo 4: G4.1 Accordion, G4.2 Sheet/Drawer, G4.3 Stepper, B.8 `dashboard-01`, G4.P (sin cambios de contenido; solo la versión)                                                                                                                                                                                                                         |

Por qué esta división: la 0.6.0 son correcciones y cambios transversales (se tocan casi todos los componentes una sola vez, con la escala de tamaños y el tema de marca primero); la 0.7.0 son las piezas que se rediseñan por completo (Card, Table, Sortable) y por eso esperan a las decisiones del usuario y a que la 0.6.0 deje la escala de tamaños, el tema y la API compuesta de Select y Form Field estables.

## Orden y dependencias

1. **R.0** (tema) y **R.1** (escala de tamaños): primero y en paralelo; nada de tamaños se escribe antes de R.1.
2. **R.2 a R.8** (tamaños) dependen de R.1; **R.9** (clic) es independiente, pero va antes de R.2 a R.8 para no tocar dos veces las mismas clases.
3. **R.15 → R.16** (Select antes de Combobox: Combobox copia la forma compuesta de Select). R.16 depende además de M.9 (utilidades de lista compartidas).
4. **R.14** depende de la decisión PD-3. **R.19** de PD-1. **R.20** de PD-2.
5. **R.21 → R.22**; **R.23** es independiente.
6. **R.13** (ejemplos de formularios) va al final de la 0.6.0: usa las APIs nuevas de R.14 y R.15.
7. Puerta de cada versión: `R.P6` (0.6.0) y `R.P7` (0.7.0), con el protocolo de `/cerrar-grupo` (build, pruebas, bundle, CHANGELOG, `.tgz` real y los cinco escenarios de `docs/proceso/release.md`, incluida la comprobación de que el CSS trae utilidades).

## Rupturas previstas (hasta la 1.0 se permiten)

| Tarea | Ruptura                                                                                                                                    | Mitigación propuesta                                                                                            |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| R.1   | La variante de tamaño `default` se llama `md` en Button, Input, Avatar, Progress y Pagination.                                             | `default` sigue aceptándose como alias de `md` durante la 0.6.0, con aviso en desarrollo; se quita en la 0.7.0. |
| R.0   | Los colores del tema cambian (primario violeta, neutros `#171717`/`#FAFAFA`); la CLI actualiza `theme-base.css` solo si no lo modificaste. | CHANGELOG con la tabla antes/después y cómo conservar el tema anterior (un preset `neutral` tipado).            |
| R.19  | Si PD-1 cambia Card, `mimi-card-*` cambia o se mantiene como alias.                                                                        | Según la opción.                                                                                                |
| R.20  | Si PD-2 cambia la API de Data Table.                                                                                                       | Según la opción; la API de columnas por datos puede quedar como atajo.                                          |

El resto del plan es aditivo (entradas nuevas con valor por defecto igual al actual).

## Pruebas generales

- Cada tarea trae sus pruebas (ver cada una). Reglas comunes: una prueba por cada tamaño que compruebe `data-size` y la altura resultante (para los controles, que Button, Input, Select… den la **misma altura** en el mismo tamaño); las pruebas de `class` del usuario (`tailwind-merge`) de cada variante nueva; ninguna clase de color fija (la prueba de tokens existente); y las comprobaciones de contraste de R.0.
- Cualquier cambio visual se comprueba además en un navegador (el modo oscuro de R.10, el CSS generado de R.1): las pruebas de jsdom no ven la geometría.

## Cosas que la petición daba por hechas y el código ya tiene

Se anotan para no rehacerlas (cada una detallada en su tarea):

- **Dialog como servicio** ya existe (`MimiDialogService.open()`, `MimiDialogRef.close(resultado)`, `afterClosed()`, `MIMI_DIALOG_DATA`, sobre `@angular/cdk/dialog`): R.7 cubre lo que falta, no lo rehace.
- **OTP con `length`** ya existe (`input-otp.ts:118`, por defecto 6): R.18 cubre lo que falla de verdad (la documentación solo muestra 4, 5 y 6; con 10 casillas de 46 px no cabe en un teléfono).
- **Toast `outline`** ya existe, pero es una tarjeta neutra con solo el ícono de color: R.5 agrega el contorno con el color del tono.
- **Switch y Checkbox** ya son dos componentes (`switch/`, `checkbox/`); lo que está junto es la página de documentación (`/docs/components/switch`, «Switch y Checkbox»): R.3.
- **Input Mask con `readonly`** y **Number Input**, **Tags Input**, **OTP** también lo tienen; faltan los demás: R.12 lleva la tabla.
