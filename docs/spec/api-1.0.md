# API pública hasta la 1.0 (1.0-6)

Revisión de la API de ui-core de la tanda 2 de la 0.9.0 (26/11/2026, modo autónomo; rama `auto/0.9.0-tanda2-2026-11-26`). Desde la 1.0.0, lo que esté aquí solo cambia de forma compatible (spec 12). Contiene:

1. La **convención**: nombres, sufijos, entradas comunes, eventos, textos, configuración global y tokens.
2. Los **cambios** que la aplican (C1 a C9), con su motivo y si son RUPTURA (todos con su «Cómo actualizar» en el CHANGELOG «Por publicar»).
3. Lo que queda **PENDIENTE DE DECIDIR (usuario)** (P1 a P6): cosas de gusto sin una opción claramente mejor; no se cambiaron.
4. El **inventario**, componente por componente: piezas, selectores, entradas, salidas, textos, variables propias y exports del `index.ts`. Los exports son la lista fija: `packages/ui-core/src/lib/api-1.0.spec.ts` la compara con los `index.ts` y falla si algo entra o sale sin pasar por aquí.

El inventario se escribió **antes de cambiar nada**, con cada inconsistencia marcada (⚠C1… ⚠P6); después de aplicar un cambio, la marca pasa a ✔ y el nombre a su forma nueva.

## 1. Convención

**Piezas y selectores**

- Clase `Mimi<Pieza>`; un componente de elemento, `mimi-<pieza>` (el kebab de la clase sin `Mimi`: `MimiDatePicker` ↔ `mimi-date-picker`).
- Una directiva sobre un elemento nativo, `elemento[mimi<Pieza>]` (`button[mimiBtn]`, `input[mimiInput]`, `td[mimiTd]`); una directiva de atributo, `[mimi<Pieza>]`; una plantilla, `ng-template[mimi<Pieza>]`.
- Si `Mimi<Pieza>` ya es el nombre de un tipo, la clase lleva un sufijo: `MimiTreeNodeTemplate` (`MimiTreeNode` es el nodo), `MimiTabElement` (`mimi-tab`; `MimiTab` es la plantilla), `MimiOptionItem` (`mimi-option`; `MimiOption` es la opción de Select).
- Cada componente con varias piezas exporta `Mimi<Componente>Imports`.

**Tipos, funciones y constantes exportados**

- Tipos e interfaces: `Mimi<Nombre>` (C4).
- Funciones y constantes: `mimi<Nombre>` y `MIMI_<NOMBRE>` (C5). Excepciones con forma propia de Angular: `inject<…>` y `provide<…>` (`injectMimiToast`, `provideMimiTheme`), `cn` y `withMessage`.
- Lo que solo usan otros componentes de Mimi no va en el `index.ts`: se importa del archivo (`@/components/ui/table/table`), como ya hacían Menu, Dialog y Select (C8).

**Entradas**

- Los controles de formulario aceptan las mismas: `disabled`, `readonly` (o su motivo de no tenerla), `invalid`, `touched`, `dirty` y `required` (las escribe el formulario), `id`, `aria-label`, `aria-labelledby` y `aria-describedby` (M.16: los ids del usuario se suman a los propios), `class`, `size` y `panelClass` si tienen panel. La tabla de qué control acepta cuál está en la spec 8.
- Límites: `min` y `max` cuando son del tipo del valor (Number Input y Slider: lo exige `FormValueControl`, y Signal Forms los escribe desde `min()`/`max()` del esquema); en las fechas, `minDate` y `maxDate`, también en Date Picker y Calendar (C2).
- Paneles: `presentation` (`auto`, `popover`, `sheet`, `fullscreen`) y `sheetTitle` (el título de la hoja; por defecto, el `aria-label`) en todos los que se abren en una hoja en el teléfono (C9); `side` y `align` donde el panel se puede colocar.
- Una directiva que agrega comportamiento a otro elemento lleva su prefijo en todas las entradas (`mimiTooltipSide`, `mimiBlockMessage`); una que es el componente de su elemento, no (`variant`, `size`, `align`) (C7).
- `size` es siempre `MimiSize` (`sm`, `md`, `lg`) con `MimiSized`, salvo las escalas propias anotadas (Avatar; P4).

**Salidas**

- Verbo en presente, sin «on»: `touch`, `create`, `remove`, `retry`, `run`, `finish`, `activate`, `paginate`, `searchChange`.
- Participio cuando el presente sería un evento del DOM que burbujea (`selected` de Menu Item: `select` lo es) o cuando avisa de algo que ya terminó, con su resultado (`closed` de Dialog, `rejected` de File Upload, `reordered` y `moved` de Sortable List).
- Los `model()` emiten `<nombre>Change` (Angular). La lista de excepciones que quedan, en P3.

**Textos**

- Un componente con texto propio (visible o anunciado) tiene: la interfaz `Mimi<Componente>Text`, `MIMI_<COMPONENTE>_TEXT_EN` y `_ES`, el token `MIMI_<COMPONENTE>_TEXT` (en inglés por defecto) y `provideMimi<Componente>Text(parte)`, que acepta una parte.
- El nombre es el de la carpeta donde vive (C3).
- Sin texto propio, no tiene: Toggle Group, Input Mask, Input OTP y Progress no pintan ni anuncian nada que no ponga el usuario (su nombre, `aria-label`, y su contenido), así que no les falta. Card, Badge, Avatar, Separator, Skeleton, Table, Tabs, Toolbar, Tooltip, Accordion, Popover y Sheet, igual (Sheet y los menús en la hoja usan los de `MimiOverlayText`).
- Excepción: Form Field usa `MIMI_ERROR_MESSAGES` (`_EN`, `_ES`) y `provideMimiErrorMessages`: son mensajes por clave de error, no textos del componente.

**Configuración global**

- `Mimi<X>Config`, `MIMI_<X>_CONFIG_DEFAULT`, el token `MIMI_<X>_CONFIG` y `provideMimi<X>(parte)`: Overlay, Table, Toast y Loading (C6). El tema: `provideMimiTheme(preset)`.

**Tokens y atributos**

- Variables CSS `--mimi-<componente>-<propiedad>`, expuestas en el preset como `components.<componente>.<propiedad>`; las abreviaturas que ya existen (`btn`, `upload`, `number`, `tags`, `date`, `cal`, `toggle`), en P5.
- Estado en `data-*`: `data-state`, `data-disabled`, `data-invalid`, `data-readonly`, `data-size`, `data-variant`, `data-tone`, `data-slot`.

## 2. Cambios (aplicados en esta tanda)

| Id  | Qué                                                                                                                                                                                                                                                                                                                                                                                               | Motivo                                                                                                                                                                                                                        | RUPTURA    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| C1  | Date Range: selector `mimi-date-range` → `mimi-date-range-picker` (la clase sigue siendo `MimiDateRangePicker`; el ítem de la CLI sigue siendo `date-range`)                                                                                                                                                                                                                                      | Selector y clase iguales, como `mimi-date-picker` / `MimiDatePicker`. Se cambia el selector y no la clase: `MimiDateRange` ya es el tipo del valor (`{ start, end }`), y «picker» empareja con Date Picker.                   | sí         |
| C2  | Calendar y Date Picker: `min`/`max` → `minDate`/`maxDate`                                                                                                                                                                                                                                                                                                                                         | La misma familia con el mismo nombre (Date Range ya los llamaba así, porque `FormValueControl` daría a `min` el tipo del periodo). Además, con `[formField]` Signal Forms no deja enlazar `[min]` (NG8022): con `minDate` sí. | sí         |
| C3  | `MimiDatePickerText`, `MIMI_DATE_PICKER_TEXT(_EN/_ES)` y `provideMimiDatePickerText` → `MimiCalendarText`, `MIMI_CALENDAR_TEXT(_EN/_ES)` y `provideMimiCalendarText`                                                                                                                                                                                                                              | Viven en `calendar/` y los usan Calendar, Date Picker y Date Range: el nombre es el de la carpeta.                                                                                                                            | sí         |
| C4  | Tipos sin prefijo → `MimiAvatarSize`, `MimiAvatarStatus`, `MimiBadgeVariant`, `MimiBadgeTone`, `MimiButtonVariant`, `MimiButtonTone`, `MimiButtonSize`, `MimiInputSize`, `MimiSeparatorOrientation`                                                                                                                                                                                               | Eran los 9 tipos públicos (de unos 150) sin `Mimi`; sin él chocan con los tipos del proyecto del usuario (`ButtonVariant`).                                                                                                   | sí         |
| C5  | Valores sin prefijo → `mimiAvatarVariants`, `mimiBadgeVariants`, `mimiButtonVariants`, `mimiInputVariants`, `mimiTextareaVariants`, `mimiSeparatorVariants`, `mimiResolveBadgeTone`, `mimiResolveButtonTone`                                                                                                                                                                                      | La misma regla que el resto de las funciones públicas (`mimiFormatDate`, `mimiCompareValues`…).                                                                                                                               | sí         |
| C6  | `MIMI_TOAST_DEFAULTS` → `MIMI_TOAST_CONFIG_DEFAULT`; Loading suma `MimiLoadingConfig` y `MIMI_LOADING_CONFIG_DEFAULT`, y `provideMimiLoading` acepta `Partial<MimiLoadingConfig>`                                                                                                                                                                                                                 | Una sola forma para la configuración global (la de Overlay y Table).                                                                                                                                                          | sí (Toast) |
| C7  | (anulado al revisar el inventario) Tooltip y `[mimiBlock]` ya cumplían la regla del prefijo: `delay` y `minDuration` son los nombres de la propiedad, y sus alias públicos son `mimiTooltipDelay`, `mimiBlockDelay` y `mimiBlockMinDuration`                                                                                                                                                      | La primera pasada del inventario leía el alias solo en la misma línea que `input(`.                                                                                                                                           | no         |
| C8  | Fuera del `index.ts` (siguen en su archivo): `MIMI_CHECKBOX_BOX_STYLES`, `injectMimiChipAnnouncer`, `MIMI_FORM_FIELD_CONTEXT`, `MimiFormFieldContext`, `MIMI_DEFAULT_ROW_ID`, `MIMI_TABLE_CELL`, `MIMI_TABLE_CELL_BG`, `MIMI_TABLE_HEAD`, `MIMI_TABLE_SCROLL_CELL`, `MIMI_TABLE_SORT_BUTTON`, `MIMI_TABLE_SORT_ICON`, `MIMI_TABLE_STACK`, `MimiThOutlet`, `mimiLabelCells`, `mimiClearStackRoles` | Piezas internas que solo usan otros componentes de Mimi (Tree, Combobox, Tags Input, Data Table) o el propio componente: quedaban en la API pública sin querer (como el `MimiSelectList` de la 0.7.0).                        | sí (menor) |
| C9  | `sheetTitle` en Date Picker, Date Range, `mimi-color-input` y Command Dialog (por defecto, el `aria-label`)                                                                                                                                                                                                                                                                                       | Los demás paneles que se abren en una hoja lo tienen. Sin él, con un `<mimi-form-field label>` (sin `aria-label`), la hoja de Date Picker salía sin título.                                                                   | no         |

**Además, en esta tanda y con la misma convención:** M.24 (Data Table con propiedades lógicas, RTL), M.16 y M.21 (`readonly`, `aria-labelledby` y `aria-describedby` en todos los controles) y M.1, M.3, M.6 y M.14 (en el informe, punto 4).

## 3. PENDIENTE DE DECIDIR (usuario)

| Id  | Qué                                                                                                                                                                                      | Opciones                                                                                                                                     | Recomendación                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Data Table: `density` y `size` (1.0-8)                                                                                                                                                   | (a) unir en `size` y quitar `density`; (b) los dos, documentados como ejes distintos.                                                        | **(b)**, y cambia la recomendación del plan: `density` es un `model()` que cambia **quien mira** la tabla con el botón de la barra (compacta o cómoda), y `size` lo fija el desarrollador con la escala del tema. Unirlos haría de `size` un `model()` solo aquí. |
| P2  | Input OTP: `success` (booleano) frente a `tone`                                                                                                                                          | (a) `tone="success"`; (b) `success`, como `invalid`.                                                                                         | **(b)**: es un estado del valor (el código se comprobó), como `invalid`, no un color que se elige; `tone` es el color de Button, Badge, Progress y Menu.                                                                                                          |
| P3  | Nombres de eventos fuera de la regla: `datePick` (Calendar, en vez de `pick`) y los participios (`closed`, `selected`, `rejected`, `reordered`, `moved`)                                 | (a) renombrarlos a la regla estricta del presente; (b) dejarlos, con la regla del participio de arriba.                                      | **(b)**: cambiarlos rompe las plantillas de todos sin un beneficio claro; `datePick` podría pasar a `pick` si el usuario lo quiere.                                                                                                                               |
| P4  | Pagination y Progress con `size` propio (`MimiPaginationSize`, `MimiProgressSize`, los dos `sm \| md \| lg`), sin heredar `mimiSize`                                                     | (a) `MimiSized` como el resto (heredan el tamaño de un `[mimiSize]` de arriba; Pagination pasaría de `sm` a `md` por defecto); (b) dejarlos. | **(a)** para Progress (mismo valor por defecto, `md`); **(b)** para Pagination (su `sm` por defecto es una decisión de diseño).                                                                                                                                   |
| P5  | Variables con abreviatura: `--mimi-btn-*`, `--mimi-upload-*` y `--mimi-dropzone*` (File Upload), `--mimi-number-*`, `--mimi-tags-*`, `--mimi-cal-*` y `--mimi-date-*`, `--mimi-toggle-*` | (a) renombrarlas al nombre del componente; (b) dejarlas.                                                                                     | **(b)**: renombrar una variable CSS no da error en el proyecto del usuario (su valor deja de aplicarse sin aviso), y el preset ya las agrupa con el nombre del componente.                                                                                        |
| P6  | `buttonVariants` y los demás `cva` (C5) son el nombre que conoce quien viene de shadcn/ui                                                                                                | (a) `mimiButtonVariants` (aplicado); (b) volver a `buttonVariants` como excepción.                                                           | **(a)**, la regla sin excepciones; se aplicó. Si el usuario prefiere (b), son seis nombres.                                                                                                                                                                       |

## 4. Inventario

Por componente (la carpeta de `packages/ui-core/src/lib/components/`, más `utils` y `theme`). «Comunes» son las entradas de la convención; `[(x)]` es un `model()`; `*`, obligatoria. Las plantillas y directivas sin entradas ni salidas pueden no tener fila: están en «Exports». «Variables propias» son las `--mimi-<componente>-*` que lee el componente (las del tema, en la spec 6).

### accordion

| Pieza                | Selector               | Entradas                                                                                  | Salidas |
| -------------------- | ---------------------- | ----------------------------------------------------------------------------------------- | ------- |
| `MimiAccordion`      | `mimi-accordion`       | `size`, `multiple`, `[(value)]`, `indicator`, `level`, `region`, comunes: disabled, class | —       |
| `MimiAccordionTitle` | `[mimiAccordionTitle]` | —                                                                                         | —       |
| `MimiAccordionStart` | `[mimiAccordionStart]` | —                                                                                         | —       |
| `MimiAccordionEnd`   | `[mimiAccordionEnd]`   | —                                                                                         | —       |
| `MimiAccordionItem`  | `mimi-accordion-item`  | `value`, `title`, comunes: disabled, class                                                | —       |

- **Variables propias** (`--mimi-…`): accordion-bg, accordion-border, accordion-content-text, accordion-h, accordion-hover, accordion-px, accordion-radius, accordion-text.
- **Exports** (`index.ts`): `MimiAccordion`, `MimiAccordionEnd`, `MimiAccordionImports`, `MimiAccordionIndicator`, `MimiAccordionItem`, `MimiAccordionStart`, `MimiAccordionTitle`.

### avatar

| Pieza                | Selector               | Entradas                                                 | Salidas |
| -------------------- | ---------------------- | -------------------------------------------------------- | ------- |
| `MimiAvatar`         | `mimi-avatar`          | `size` (escala propia, `MimiAvatarSize`), comunes: class | —       |
| `MimiAvatarImage`    | `img[mimiAvatarImage]` | `src`, comunes: class                                    | —       |
| `MimiAvatarFallback` | `mimi-avatar-fallback` | `label`, comunes: class                                  | —       |

- **Variables propias** (`--mimi-…`): avatar-bg, avatar-fg, avatar-radius, avatar-s, avatar-size, avatar-text.
- **Exports** (`index.ts`): `AvatarSize` ⚠C4, `AvatarStatus` ⚠C4, `MimiAvatar`, `MimiAvatarFallback`, `MimiAvatarImage`, `MimiAvatarImports`, `avatarVariants` ⚠C5.

### badge

| Pieza       | Selector          | Entradas                                  | Salidas |
| ----------- | ----------------- | ----------------------------------------- | ------- |
| `MimiBadge` | `span[mimiBadge]` | `size`, `variant`, `tone`, comunes: class | —       |

- **Variables propias** (`--mimi-…`): badge-font-size, badge-font-weight, badge-h, badge-height, badge-px, badge-px-s, badge-radius.
- **Exports** (`index.ts`): `BadgeTone` ⚠C4, `BadgeVariant` ⚠C4, `MimiBadge`, `badgeVariants` ⚠C5, `resolveBadgeTone` ⚠C5.

### button

| Pieza        | Selector                      | Entradas                                                       | Salidas |
| ------------ | ----------------------------- | -------------------------------------------------------------- | ------- |
| `MimiButton` | `button[mimiBtn], a[mimiBtn]` | `variant`, `tone`, `size`, `loading`, comunes: disabled, class | —       |

- **Variables propias** (`--mimi-…`) ⚠P5: btn-border-width, btn-focus-ring-width, btn-font-size, btn-font-weight, btn-gap, btn-gap-s, btn-h, btn-height, btn-letter-spacing, btn-press-scale, btn-px, btn-px-s, btn-radius, btn-text.
- **Exports** (`index.ts`): `ButtonSize` ⚠C4, `ButtonTone` ⚠C4, `ButtonVariant` ⚠C4, `MimiButton`, `buttonVariants` ⚠C5, `resolveButtonTone` ⚠C5.

### calendar

| Pieza          | Selector        | Entradas                                                                                                                                     | Salidas        |
| -------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `MimiCalendar` | `mimi-calendar` | `size`, `[(value)]`, `mode`, `rangeStart`, `rangeEnd`, `min` ⚠C2, `max` ⚠C2, `isDateDisabled`, `locale`, `weekStart`, `fill`, comunes: class | `datePick` ⚠P3 |

- **Textos** `MimiDatePickerText` ⚠C3: pickDate, pickRange, previous, next, changeView, today, goToday, unavailable, pickEnd, pickStart, days, required.
- **Variables propias** (`--mimi-…`) ⚠P5: cal-cell, cal-nav, date-cell-hover, date-cell-radius, date-cell-size, date-range, date-selected-bg, date-selected-fg, date-today-ring.
- **Exports** (`index.ts`): `MIMI_DATE_PICKER_TEXT` ⚠C3, `MIMI_DATE_PICKER_TEXT_EN` ⚠C3, `MIMI_DATE_PICKER_TEXT_ES` ⚠C3, `MIMI_TODAY`, `MimiCalendar`, `MimiCalendarView`, `MimiDate`, `MimiDatePickerText` ⚠C3, `MimiDateRange`, `fromMimiDate`, `mimiAddDays`, `mimiAddMonths`, `mimiClampDate`, `mimiDaysBetween`, `mimiFormatDate`, `mimiIsDate`, `mimiStartOfMonth`, `mimiWeekStart`, `mimiWeekday`, `provideMimiDatePickerText` ⚠C3, `toMimiDate`.

### card

| Pieza                 | Selector                | Entradas                                         | Salidas |
| --------------------- | ----------------------- | ------------------------------------------------ | ------- |
| `MimiCard`            | `[mimiCard]`            | `size`, `variant`, `interactive`, comunes: class | —       |
| `MimiCardHeader`      | `[mimiCardHeader]`      | comunes: class                                   | —       |
| `MimiCardTitle`       | `[mimiCardTitle]`       | comunes: class                                   | —       |
| `MimiCardDescription` | `[mimiCardDescription]` | comunes: class                                   | —       |
| `MimiCardContent`     | `[mimiCardContent]`     | comunes: class                                   | —       |
| `MimiCardFooter`      | `[mimiCardFooter]`      | comunes: class                                   | —       |

- **Variables propias** (`--mimi-…`): card-bg, card-border, card-border-hover, card-border-width, card-fg, card-flat-bg, card-foreground, card-gap, card-gap-s, card-p, card-padding, card-radius, card-shadow, card-shadow-elevated, card-shadow-hover.
- **Exports** (`index.ts`): `MimiCard`, `MimiCardContent`, `MimiCardDescription`, `MimiCardFooter`, `MimiCardHeader`, `MimiCardImports`, `MimiCardTitle`, `MimiCardVariant`.

### checkbox

| Pieza          | Selector        | Entradas                                                                                                                                           | Salidas |
| -------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiCheckbox` | `mimi-checkbox` | `size`, `[(checked)]`, `[(indeterminate)]`, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, class | `touch` |

- **Variables propias** (`--mimi-…`): checkbox-border, checkbox-check, checkbox-checked-bg, checkbox-radius, checkbox-s, checkbox-size.
- **Exports** (`index.ts`): `MIMI_CHECKBOX_BOX_STYLES` ⚠C8, `MimiCheckbox`.

### chip

| Pieza      | Selector    | Entradas                                              | Salidas  |
| ---------- | ----------- | ----------------------------------------------------- | -------- |
| `MimiChip` | `mimi-chip` | `size`, `removable`, `label`, comunes: invalid, class | `remove` |

- **Textos** `MimiChipText`: remove, added, removed.
- **Variables propias** (`--mimi-…`): chip-bg, chip-fg, chip-font-size, chip-foreground, chip-h, chip-height, chip-radius, chip-remove-size, chip-text.
- **Exports** (`index.ts`): `MIMI_CHIP_TEXT`, `MIMI_CHIP_TEXT_EN`, `MIMI_CHIP_TEXT_ES`, `MimiChip`, `MimiChipText`, `injectMimiChipAnnouncer` ⚠C8, `provideMimiChipText`.

### color-picker

| Pieza             | Selector            | Entradas                                                                                                                                                                                                                       | Salidas |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `MimiColorPicker` | `mimi-color-picker` | `size`, `[(value)]`, `swatches`, `[(recent)]`, `showRecent`, `format`, comunes: disabled, readonly, invalid, touched, dirty, class                                                                                             | `touch` |
| `MimiColorInput`  | `mimi-color-input`  | `size`, `[(value)]`, `swatches`, `[(recent)]`, `showRecent`, `format`, `placeholder`, `panelClass`, `presentation` ⚠C9, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, class | `touch` |

- **Textos** `MimiColorPickerText`: area, areaValue, hue, format, value, palette, recent, noRecent, pickColor, clipped, required.
- **Variables propias** (`--mimi-…`): color-picker-area-height, color-picker-area-radius, color-picker-bg, color-picker-hue-height, color-picker-padding, color-picker-radius, color-picker-shadow, color-picker-swatch-border, color-picker-swatch-gap, color-picker-thumb-border, color-picker-thumb-shadow, color-picker-width.
- **Exports** (`index.ts`): `MIMI_COLOR_PICKER_TEXT`, `MIMI_COLOR_PICKER_TEXT_EN`, `MIMI_COLOR_PICKER_TEXT_ES`, `MimiColorFormat`, `MimiColorInput`, `MimiColorPicker`, `MimiColorPickerImports`, `MimiColorPickerText`, `MimiHsv`, `MimiRgb`, `mimiFormatOklch`, `mimiHexToRgb`, `mimiHsvToRgb`, `mimiNormalizeHex`, `mimiOklchToRgb`, `mimiParseColor`, `mimiRgbToHex`, `mimiRgbToHsv`, `mimiRgbToOklch`, `provideMimiColorPickerText`.

### combobox

| Pieza                | Selector                          | Entradas                                                                                                                                                                                                                                                                                                               | Salidas                           |
| -------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `MimiComboboxStart`  | `[mimiComboboxStart]`             | comunes: class                                                                                                                                                                                                                                                                                                         | —                                 |
| `MimiComboboxOption` | `ng-template[mimiComboboxOption]` | —                                                                                                                                                                                                                                                                                                                      | —                                 |
| `MimiCombobox`       | `mimi-combobox`                   | `size`, `options`, `[(value)]`, `multiple`, `hint`, `compareWith`, `filterWith`, `searchMode`, `creatable`, `loading`, `clearable`, `placeholder`, `panelClass`, `side`, `align`, `presentation`, `sheetTitle`, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, class | `touch`, `searchChange`, `create` |

- **Textos** `MimiComboboxText`: create, noResults, noResultsHint, noOptions, loading, results, help, more, clear.
- **Variables propias** (`--mimi-…`): combobox-height, combobox-menu-bg, combobox-menu-max-height, combobox-menu-shadow, combobox-option-height, combobox-option-hover, combobox-option-radius, combobox-radius.
- **Exports** (`index.ts`): `MIMI_COMBOBOX_TEXT`, `MIMI_COMBOBOX_TEXT_EN`, `MIMI_COMBOBOX_TEXT_ES`, `MimiCombobox`, `MimiComboboxImports`, `MimiComboboxOption`, `MimiComboboxStart`, `MimiComboboxText`, `provideMimiComboboxText`.

### command

| Pieza               | Selector                       | Entradas                                                                                               | Salidas |
| ------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------ | ------- |
| `MimiCommandIcon`   | `ng-template[mimiCommandIcon]` | —                                                                                                      | —       |
| `MimiCommandEmpty`  | `[mimiCommandEmpty]`           | —                                                                                                      | —       |
| `MimiCommand`       | `mimi-command`                 | `size`, `items`, `[(query)]`, `placeholder`, comunes: aria-label, class                                | `run`   |
| `MimiCommandDialog` | `mimi-command-dialog`          | `size`, `[(open)]`, `items`, `placeholder`, `shortcut`, `presentation` ⚠C9, comunes: aria-label, class | `run`   |

- **Textos** `MimiCommandText`: placeholder, label, navigate, run, results, noResults, noResultsHint.
- **Variables propias** (`--mimi-…`): command-active, command-icon-size, command-input-font-size, command-input-h, command-input-height, command-item-h, command-item-height, command-item-radius, command-list-height, command-text, command-top, command-width.
- **Exports** (`index.ts`): `MIMI_COMMAND_TEXT`, `MIMI_COMMAND_TEXT_EN`, `MIMI_COMMAND_TEXT_ES`, `MimiCommand`, `MimiCommandDialog`, `MimiCommandEmpty`, `MimiCommandGroup`, `MimiCommandIcon`, `MimiCommandIconContext`, `MimiCommandImports`, `MimiCommandItem`, `MimiCommandText`, `MimiCommandTone`, `provideMimiCommandText`.

### confirm

- **Textos** `MimiConfirmText`: confirm, cancel.
- **Variables propias** (`--mimi-…`): confirm-icon-bg, confirm-icon-fg, confirm-width.
- **Exports** (`index.ts`): `MIMI_CONFIRM_TEXT`, `MIMI_CONFIRM_TEXT_EN`, `MIMI_CONFIRM_TEXT_ES`, `MimiConfirmFn`, `MimiConfirmOptions`, `MimiConfirmText`, `injectMimiConfirm`, `provideMimiConfirmText`.

### context-menu

| Pieza                    | Selector                              | Entradas                                                                               | Salidas |
| ------------------------ | ------------------------------------- | -------------------------------------------------------------------------------------- | ------- |
| `MimiContextMenu`        | `mimi-context-menu`                   | `size`, `[(open)]`, `presentation`, `sheetTitle`, comunes: aria-label, disabled, class | —       |
| `MimiContextMenuTrigger` | `[mimiContextMenuTrigger]`            | `mimiContextMenuTriggerData`                                                           | —       |
| `MimiContextMenuContent` | `ng-template[mimiContextMenuContent]` | —                                                                                      | —       |

- **Exports** (`index.ts`): `MimiContextMenu`, `MimiContextMenuContent`, `MimiContextMenuImports`, `MimiContextMenuTrigger`, `MimiMenuCheckboxItem`, `MimiMenuItem`, `MimiMenuItemTone`, `MimiMenuLabel`, `MimiMenuRadioGroup`, `MimiMenuRadioItem`, `MimiMenuSeparator`, `MimiMenuSub`, `MimiMenuSubContent`, `MimiMenuSubTrigger`.

### data-table

| Pieza              | Selector                        | Entradas                                                                                                                                                                                                                                                                                            | Salidas |
| ------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiTableCell`    | `ng-template[mimiTableCell]`    | `mimiTableCell`*                                                                                                                                                                                                                                                                                    | —       |
| `MimiTableDetail`  | `ng-template[mimiTableDetail]`  | —                                                                                                                                                                                                                                                                                                   | —       |
| `MimiTableActions` | `ng-template[mimiTableActions]` | —                                                                                                                                                                                                                                                                                                   | —       |
| `MimiTableBulk`    | `ng-template[mimiTableBulk]`    | —                                                                                                                                                                                                                                                                                                   | —       |
| `MimiTableEmpty`   | `[mimiTableEmpty]`              | —                                                                                                                                                                                                                                                                                                   | —       |
| `MimiDataTable`    | `mimi-data-table`               | `size`, `data`, `columns`, `rowId`, `selectable`, `toolbar`, `loading`, `total`, `pageSizeOptions`, `searchPlaceholder`, `[(selection)]`, `[(expanded)]`, `expandMode`, `[(sort)]`, `[(query)]`, `[(filters)]`, `[(page)]`, `[(pageSize)]`, `[(density)]` ⚠P1, `mobile`, comunes: aria-label, class | —       |

- **Textos** `MimiDataTableText`: search, clearSearch, selectAll, selectRow, selected, clearSelection, filter, clearFilters, density, compact, comfortable, expand, select, details, actions, loading, empty, emptyHint, noResults, noResultsHint, range, refine, sortBy, showResults, ascending, descending, active, results.
- **Variables propias** (`--mimi-…`): table-bg, table-expanded-bg, table-font-size, table-font-size-comfortable, table-head-height-comfortable, table-row-height-comfortable, table-sticky-shadow, table-toolbar-height.
- **Exports** (`index.ts`): `MIMI_DATA_TABLE_TEXT`, `MIMI_DATA_TABLE_TEXT_EN`, `MIMI_DATA_TABLE_TEXT_ES`, `MimiDataTable`, `MimiDataTableImports`, `MimiDataTableText`, `MimiTableActions`, `MimiTableBulk`, `MimiTableCell`, `MimiTableCellContext`, `MimiTableColumn`, `MimiTableDensity`, `MimiTableDetail`, `MimiTableEmpty`, `MimiTableFilterOption`, `MimiTableFilters`, `MimiTableRowContext`, `MimiTableSort`, `provideMimiDataTableText`.

### date-picker

| Pieza            | Selector           | Entradas                                                                                                                                                                                                                                              | Salidas |
| ---------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiDatePicker` | `mimi-date-picker` | `size`, `[(value)]`, `min` ⚠C2, `max` ⚠C2, `isDateDisabled`, `locale`, `weekStart`, `format`, `placeholder`, `panelClass`, `presentation` ⚠C9, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, class | `touch` |

- **Variables propias** (`--mimi-…`) ⚠P5: date-menu-bg, date-menu-shadow, date-padding.
- **Exports** (`index.ts`): `MimiDatePicker`.

### date-range

| Pieza                 | Selector              | Entradas                                                                                                                                                                                                                                                         | Salidas |
| --------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiDateRangePicker` | `mimi-date-range` ⚠C1 | `size`, `[(value)]`, `minDate`, `maxDate`, `isDateDisabled`, `presets`, `locale`, `weekStart`, `format`, `placeholder`, `panelClass`, `presentation` ⚠C9, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, class | `touch` |

- **Variables propias** (`--mimi-…`) ⚠P5: date-padding, date-presets-width.
- **Exports** (`index.ts`): `MimiDateRangePicker`, `MimiDateRangePreset`.

### dialog

| Pieza                   | Selector                         | Entradas                                                                                                                                                                       | Salidas      |
| ----------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ |
| `MimiDialog`            | `mimi-dialog`                    | `[(open)]`, `width`, `maxWidth`, `size` (el ancho), `padding`, `closeOnEscape`, `closeOnBackdropClick`, `disableClose`, `closeButton`, `autoFocus`, comunes: class, aria-label | `closed` ⚠P3 |
| `MimiDialogTrigger`     | `[mimiDialogTrigger]`            | —                                                                                                                                                                              | —            |
| `MimiDialogContent`     | `ng-template[mimiDialogContent]` | —                                                                                                                                                                              | —            |
| `MimiDialogHeader`      | `mimi-dialog-header`             | comunes: class                                                                                                                                                                 | —            |
| `MimiDialogTitle`       | `[mimiDialogTitle]`              | comunes: class                                                                                                                                                                 | —            |
| `MimiDialogDescription` | `[mimiDialogDescription]`        | comunes: class                                                                                                                                                                 | —            |
| `MimiDialogBody`        | `mimi-dialog-body`               | comunes: class                                                                                                                                                                 | —            |
| `MimiDialogFooter`      | `mimi-dialog-footer`             | comunes: class                                                                                                                                                                 | —            |
| `MimiDialogClose`       | `[mimiDialogClose]`              | `mimiDialogClose`                                                                                                                                                              | —            |

- **Textos** `MimiDialogText`: close.
- **Variables propias** (`--mimi-…`): dialog-bg, dialog-close-size, dialog-overlay, dialog-overlay-blur, dialog-padding, dialog-radius, dialog-shadow, dialog-width.
- **Exports** (`index.ts`): `MIMI_DIALOG_DATA`, `MIMI_DIALOG_TEXT`, `MIMI_DIALOG_TEXT_EN`, `MIMI_DIALOG_TEXT_ES`, `MimiDialog`, `MimiDialogBody`, `MimiDialogClose`, `MimiDialogConfig`, `MimiDialogContent`, `MimiDialogDescription`, `MimiDialogFooter`, `MimiDialogHeader`, `MimiDialogImports`, `MimiDialogRef`, `MimiDialogService`, `MimiDialogText`, `MimiDialogTitle`, `MimiDialogTrigger`, `provideMimiDialogText`.

### dropdown-menu

| Pieza                     | Selector                               | Entradas                                                                                      | Salidas |
| ------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------- | ------- |
| `MimiDropdownMenu`        | `mimi-dropdown-menu`                   | `size`, `[(open)]`, `side`, `align`, `presentation`, `sheetTitle`, comunes: aria-label, class | —       |
| `MimiDropdownMenuTrigger` | `[mimiDropdownMenuTrigger]`            | —                                                                                             | —       |
| `MimiDropdownMenuContent` | `ng-template[mimiDropdownMenuContent]` | —                                                                                             | —       |

- **Exports** (`index.ts`): `MimiDropdownMenu`, `MimiDropdownMenuAlign`, `MimiDropdownMenuContent`, `MimiDropdownMenuImports`, `MimiDropdownMenuSide`, `MimiDropdownMenuTrigger`, `MimiMenuCheckboxItem`, `MimiMenuItem`, `MimiMenuItemTone`, `MimiMenuLabel`, `MimiMenuRadioGroup`, `MimiMenuRadioItem`, `MimiMenuSeparator`, `MimiMenuSub`, `MimiMenuSubContent`, `MimiMenuSubTrigger`.

### file-upload

| Pieza            | Selector           | Entradas                                                                                                                                                                                    | Salidas                 |
| ---------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `MimiFileUpload` | `mimi-file-upload` | `size`, `[(value)]`, `accept`, `multiple`, `maxSize`, `maxFiles`, `heading`, `hint`, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, class | `rejected` ⚠P3, `touch` |
| `MimiFileIcon`   | `[mimiFileIcon]`   | —                                                                                                                                                                                           | —                       |
| `MimiFileList`   | `mimi-file-list`   | `emptyFocus`, comunes: aria-label, class                                                                                                                                                    | —                       |
| `MimiFileItem`   | `mimi-file-item`   | `file`, `name`, `size` (el peso, no la escala), `type`, `thumbnailUrl`, `status`, `progress`, `error`, `retryable`, comunes: class                                                          | `remove`, `retry`       |

- **Textos** `MimiFileUploadText`: title, drop, readonly, list, uploading, uploaded, retry, remove, tooLarge, wrongType, tooMany, added, rejected, done, failed, required.
- **Variables propias** (`--mimi-…`) ⚠P5: dropzone-active, dropzone-active-border, upload-active-bg, upload-active-border, upload-bg, upload-border, upload-height, upload-hint, upload-icon-s, upload-icon-size, upload-item-radius, upload-min-h, upload-p, upload-radius, upload-svg, upload-thumb-size, upload-title.
- **Exports** (`index.ts`): `MIMI_FILE_UPLOAD_TEXT`, `MIMI_FILE_UPLOAD_TEXT_EN`, `MIMI_FILE_UPLOAD_TEXT_ES`, `MimiFileIcon`, `MimiFileItem`, `MimiFileList`, `MimiFileRejection`, `MimiFileStatus`, `MimiFileUpload`, `MimiFileUploadImports`, `MimiFileUploadText`, `mimiFileMatchesAccept`, `mimiFormatFileSize`, `provideMimiFileUploadText`.

### form-field

| Pieza           | Selector          | Entradas                                                           | Salidas |
| --------------- | ----------------- | ------------------------------------------------------------------ | ------- |
| `MimiFormError` | `mimi-form-error` | comunes: class                                                     | —       |
| `MimiFormField` | `mimi-form-field` | `label`, `errors`, `description`, `hint`, comunes: required, class | —       |

- **Variables propias** (`--mimi-…`): field-error, field-gap, field-label-size, field-label-weight.
- **Exports** (`index.ts`): `MIMI_ERROR_MESSAGES`, `MIMI_ERROR_MESSAGES_EN`, `MIMI_ERROR_MESSAGES_ES`, `MIMI_FORM_FIELD_CONTEXT` ⚠C8, `MimiErrorMessage`, `MimiErrorMessages`, `MimiFormError`, `MimiFormField`, `MimiFormFieldContext` ⚠C8, `MimiFormFieldImports`, `mimiErrorText`, `provideMimiErrorMessages`, `withMessage`.

### input

| Pieza       | Selector           | Entradas                            | Salidas |
| ----------- | ------------------ | ----------------------------------- | ------- |
| `MimiInput` | `input[mimiInput]` | `size`, `showError`, comunes: class | —       |

- **Variables propias** (`--mimi-…`): input-background, input-bg, input-border, input-border-focus, input-border-width, input-disabled-opacity, input-error, input-fg, input-focus-ring-width, input-font-size, input-h, input-height, input-placeholder, input-px, input-radius, input-text.
- **Exports** (`index.ts`): `InputSize` ⚠C4, `MimiInput`, `inputVariants` ⚠C5.

### input-mask

| Pieza            | Selector           | Entradas                                                                                                                                                                                                    | Salidas |
| ---------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiMaskPrefix` | `[mimiMaskPrefix]` | comunes: class                                                                                                                                                                                              | —       |
| `MimiMaskStart`  | `[mimiMaskStart]`  | comunes: class                                                                                                                                                                                              | —       |
| `MimiMaskEnd`    | `[mimiMaskEnd]`    | comunes: class                                                                                                                                                                                              | —       |
| `MimiInputMask`  | `mimi-input-mask`  | `size`, `[(value)]`, `mask`*, `inputmode`, `autocomplete`, `placeholder`, `ghost`, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, aria-describedby, class | `touch` |

- Sin textos propios (todo lo que dice lo pone el usuario).
- **Variables propias** (`--mimi-…`): mask-gap, mask-placeholder, mask-prefix-bg, mask-prefix-height, mask-prefix-radius.
- **Exports** (`index.ts`): `MimiInputMask`, `MimiInputMaskImports`, `MimiMaskEnd`, `MimiMaskPrefix`, `MimiMaskStart`, `mimiApplyMask`, `mimiMaskLength`, `mimiUnmask`.

### input-otp

| Pieza                   | Selector                             | Entradas                                                                                                                                                                                                                              | Salidas |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiInputOtpSeparator` | `ng-template[mimiInputOtpSeparator]` | —                                                                                                                                                                                                                                     | —       |
| `MimiInputOtp`          | `mimi-input-otp`                     | `size`, `[(value)]`, `length`, `separatorAfter`, `separator`, `alphanumeric`, `success` ⚠P2, `autocomplete`, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, aria-describedby, class | `touch` |

- Sin textos propios (un solo `<input>` con el nombre del usuario).
- **Variables propias** (`--mimi-…`): otp-bg, otp-border, otp-caret, otp-font-size, otp-gap, otp-gap-s, otp-h, otp-height, otp-radius, otp-separator, otp-text, otp-w, otp-width.
- **Exports** (`index.ts`): `MimiInputOtp`, `MimiInputOtpImports`, `MimiInputOtpSeparator`.

### loading

| Pieza       | Selector      | Entradas                                                                                   | Salidas |
| ----------- | ------------- | ------------------------------------------------------------------------------------------ | ------- |
| `MimiBlock` | `[mimiBlock]` | `mimiBlock`, `mimiBlockMessage`, `mimiBlockDelay`, `mimiBlockMinDuration`, `mimiBlockSize` | —       |

- **Textos** `MimiLoadingText`: loading, done.
- **Variables propias** (`--mimi-…`): loading-bg, loading-blur, loading-fg, loading-panel-bg, loading-shadow, loading-spinner, loading-z.
- **Exports** (`index.ts`): `MIMI_LOADING_CONFIG` ⚠C6, `MIMI_LOADING_TEXT`, `MIMI_LOADING_TEXT_EN`, `MIMI_LOADING_TEXT_ES`, `MimiBlock`, `MimiLoadingOptions`, `MimiLoadingRef`, `MimiLoadingService`, `MimiLoadingText`, `injectMimiLoading`, `provideMimiLoading`, `provideMimiLoadingText`.

### menu

| Pieza                  | Selector                          | Entradas                                                         | Salidas        |
| ---------------------- | --------------------------------- | ---------------------------------------------------------------- | -------------- |
| `MimiMenuItem`         | `mimi-menu-item`                  | `tone`, `shortcut`, `textValue`, comunes: disabled, class        | `selected` ⚠P3 |
| `MimiMenuCheckboxItem` | `mimi-menu-checkbox-item`         | `[(checked)]`, `shortcut`, `textValue`, comunes: disabled, class | —              |
| `MimiMenuRadioGroup`   | `mimi-menu-radio-group`           | `[(value)]`, comunes: aria-label, class                          | —              |
| `MimiMenuRadioItem`    | `mimi-menu-radio-item`            | `value`*, `textValue`, comunes: disabled, class                  | —              |
| `MimiMenuLabel`        | `mimi-menu-label`                 | comunes: class                                                   | —              |
| `MimiMenuSeparator`    | `mimi-menu-separator`             | comunes: class                                                   | —              |
| `MimiMenuSubTrigger`   | `mimi-menu-sub-trigger`           | `textValue`, comunes: disabled, class                            | —              |
| `MimiMenuSubContent`   | `ng-template[mimiMenuSubContent]` | —                                                                | —              |
| `MimiMenuSub`          | `mimi-menu-sub`                   | comunes: class                                                   | —              |

- **Variables propias** (`--mimi-…`): menu-bg, menu-border, menu-danger, menu-danger-hover, menu-item-h, menu-item-height, menu-item-hover, menu-item-radius, menu-radius, menu-shadow, menu-shortcut, menu-text, menu-width.
- **Exports** (`index.ts`): `MimiMenuCheckboxItem`, `MimiMenuItem`, `MimiMenuItemTone`, `MimiMenuItemsImports`, `MimiMenuLabel`, `MimiMenuRadioGroup`, `MimiMenuRadioItem`, `MimiMenuSeparator`, `MimiMenuSub`, `MimiMenuSubContent`, `MimiMenuSubTrigger`.

### number-input

| Pieza             | Selector            | Entradas                                                                                                                                                                             | Salidas |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `MimiNumberInput` | `mimi-number-input` | `size`, `[(value)]`, `min`, `max`, `step`, `format`, `locale`, `placeholder`, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, class | `touch` |

- **Textos** `MimiNumberInputText`: decrement, increment.
- **Variables propias** (`--mimi-…`) ⚠P5: number-button-hover, number-button-radius, number-button-size, number-height, number-px, number-radius.
- **Exports** (`index.ts`): `MIMI_NUMBER_INPUT_TEXT`, `MIMI_NUMBER_INPUT_TEXT_EN`, `MIMI_NUMBER_INPUT_TEXT_ES`, `MimiNumberInput`, `MimiNumberInputText`, `provideMimiNumberInputText`.

### option-list

| Pieza            | Selector         | Entradas                                    | Salidas |
| ---------------- | ---------------- | ------------------------------------------- | ------- |
| `MimiOptgroup`   | `mimi-optgroup`  | `label`                                     | —       |
| `MimiOptionItem` | `mimi-option`    | `value`, `label`, `hint`, comunes: disabled | —       |
| `MimiHighlight`  | `mimi-highlight` | `text`*, `query`, comunes: class            | —       |

- **Exports** (`index.ts`): `MimiCompareWith`, `MimiHighlight`, `MimiListFilter`, `MimiListOption`, `MimiListOptionContext`, `MimiListOptionGroup`, `MimiOptgroup`, `MimiOptionItem`, `MimiSearchMode`, `mimiCompareFn`, `mimiDefaultListFilter`, `mimiNormalizeText`.

### pagination

| Pieza            | Selector          | Entradas                                                                                                             | Salidas    |
| ---------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| `MimiPagination` | `mimi-pagination` | `[(page)]`, `[(pageSize)]`, `total`*, `pageSizeOptions`, `size` ⚠P4, `variant`, comunes: disabled, aria-label, class | `paginate` |

- **Textos** `MimiPaginationText`: label, previous, next, page, pageSize, pageSizeOption, outOfRange, announce.
- **Variables propias** (`--mimi-…`): pagination-bg, pagination-blur, pagination-border, pagination-error, pagination-input-width, pagination-item-size, pagination-shadow.
- **Exports** (`index.ts`): `MIMI_PAGINATION_TEXT`, `MIMI_PAGINATION_TEXT_EN`, `MIMI_PAGINATION_TEXT_ES`, `MimiPagination`, `MimiPaginationEvent`, `MimiPaginationImports`, `MimiPaginationSize` ⚠P4, `MimiPaginationText`, `MimiPaginationVariant`, `provideMimiPaginationText`.

### password

| Pieza          | Selector        | Entradas                                                       | Salidas |
| -------------- | --------------- | -------------------------------------------------------------- | ------- |
| `MimiPassword` | `mimi-password` | `size`, `meter`, `rules`, `strength`, comunes: readonly, class | —       |

- **Textos** `MimiPasswordText`: show, weak, medium, strong, announce, minLength, uppercase, number, symbol.
- **Variables propias** (`--mimi-…`): password-meter-gap, password-meter-height, password-meter-track, password-toggle-hover, password-toggle-radius, password-toggle-size.
- **Exports** (`index.ts`): `MIMI_PASSWORD_TEXT`, `MIMI_PASSWORD_TEXT_EN`, `MIMI_PASSWORD_TEXT_ES`, `MimiPassword`, `MimiPasswordLevel`, `MimiPasswordRule`, `MimiPasswordText`, `mimiPasswordLevel`, `provideMimiPasswordText`.

### popover

| Pieza                    | Selector                          | Entradas                                                                                                                                | Salidas |
| ------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiPopover`            | `mimi-popover`                    | `size`, `[(open)]`, `blocked`, `side`, `align`, `arrow`, `presentation`, `mobilePresentation`, `sheetTitle`, comunes: aria-label, class | —       |
| `MimiPopoverTrigger`     | `[mimiPopoverTrigger]`            | —                                                                                                                                       | —       |
| `MimiPopoverContent`     | `ng-template[mimiPopoverContent]` | —                                                                                                                                       | —       |
| `MimiPopoverTitle`       | `[mimiPopoverTitle]`              | comunes: class                                                                                                                          | —       |
| `MimiPopoverDescription` | `[mimiPopoverDescription]`        | comunes: class                                                                                                                          | —       |
| `MimiPopoverClose`       | `[mimiPopoverClose]`              | —                                                                                                                                       | —       |

- **Variables propias** (`--mimi-…`): popover-arrow, popover-arrow-offset, popover-bg, popover-border, popover-padding, popover-radius, popover-shadow, popover-w.
- **Exports** (`index.ts`): `MimiPopover`, `MimiPopoverAlign`, `MimiPopoverClose`, `MimiPopoverContent`, `MimiPopoverDescription`, `MimiPopoverImports`, `MimiPopoverSide`, `MimiPopoverTitle`, `MimiPopoverTrigger`.

### progress

| Pieza          | Selector        | Entradas                                                                                 | Salidas |
| -------------- | --------------- | ---------------------------------------------------------------------------------------- | ------- |
| `MimiProgress` | `mimi-progress` | `value`, `max`, `tone`, `shape`, `size` ⚠P4, comunes: aria-label, aria-labelledby, class | —       |

- Sin textos propios (el nombre lo pone el usuario; el porcentaje es un número).
- **Variables propias** (`--mimi-…`): progress-circle-size, progress-circle-width, progress-fill, progress-height, progress-track.
- **Exports** (`index.ts`): `MimiProgress`, `MimiProgressShape`, `MimiProgressSize` ⚠P4, `MimiProgressTone`.

### select

| Pieza                 | Selector                        | Entradas                                                                                                                                                                                                                                                                                                                           | Salidas                 |
| --------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `MimiSelectOption`    | `ng-template[mimiSelectOption]` | —                                                                                                                                                                                                                                                                                                                                  | —                       |
| `MimiSelectHighlight` | `mimi-select-highlight`         | `text`*, `query`, comunes: class                                                                                                                                                                                                                                                                                                   | —                       |
| `MimiSelect`          | `mimi-select`                   | `size`, `options`, `[(value)]`, `compareWith`, `placeholder`, `search`, `searchPlaceholder`, `filterWith`, `searchMode`, `clearable`, `loading`, `panelClass`, `side`, `align`, `matchWidth`, `presentation`, `sheetTitle`, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, class | `touch`, `searchChange` |

- **Textos** `MimiSelectText`: search, results, noResults, noResultsFor, loading, clear.
- **Variables propias** (`--mimi-…`): select-border, select-height, select-menu-bg, select-menu-shadow, select-option-height, select-option-hover, select-option-radius, select-radius, select-trigger-bg.
- **Exports** (`index.ts`): `MIMI_SELECT_TEXT`, `MIMI_SELECT_TEXT_EN`, `MIMI_SELECT_TEXT_ES`, `MimiOption`, `MimiOptionGroup`, `MimiSelect`, `MimiSelectFilter`, `MimiSelectHighlight`, `MimiSelectImports`, `MimiSelectOption`, `MimiSelectOptionContext`, `MimiSelectText`, `provideMimiSelectText`.

### separator

| Pieza           | Selector         | Entradas                                    | Salidas |
| --------------- | ---------------- | ------------------------------------------- | ------- |
| `MimiSeparator` | `mimi-separator` | `orientation`, `decorative`, comunes: class | —       |

- **Variables propias** (`--mimi-…`): separator-color, separator-size.
- **Exports** (`index.ts`): `MimiSeparator`, `SeparatorOrientation` ⚠C4, `separatorVariants` ⚠C5.

### sheet

| Pieza                  | Selector                        | Entradas                                                                              | Salidas |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------------------------- | ------- |
| `MimiSheet`            | `mimi-sheet`                    | `size`, `[(open)]`, `side`, `closeButton`, `disableClose`, comunes: aria-label, class | —       |
| `MimiSheetTrigger`     | `[mimiSheetTrigger]`            | —                                                                                     | —       |
| `MimiSheetContent`     | `ng-template[mimiSheetContent]` | —                                                                                     | —       |
| `MimiSheetHeader`      | `[mimiSheetHeader]`             | comunes: class                                                                        | —       |
| `MimiSheetTitle`       | `[mimiSheetTitle]`              | comunes: class                                                                        | —       |
| `MimiSheetDescription` | `[mimiSheetDescription]`        | comunes: class                                                                        | —       |
| `MimiSheetBody`        | `[mimiSheetBody]`               | comunes: class                                                                        | —       |
| `MimiSheetFooter`      | `[mimiSheetFooter]`             | comunes: class                                                                        | —       |
| `MimiSheetClose`       | `[mimiSheetClose]`              | —                                                                                     | —       |

- **Exports** (`index.ts`): `MimiSheet`, `MimiSheetBody`, `MimiSheetClose`, `MimiSheetContent`, `MimiSheetDescription`, `MimiSheetFooter`, `MimiSheetHeader`, `MimiSheetImports`, `MimiSheetSide`, `MimiSheetTitle`, `MimiSheetTrigger`.

### skeleton

| Pieza          | Selector        | Entradas       | Salidas |
| -------------- | --------------- | -------------- | ------- |
| `MimiSkeleton` | `mimi-skeleton` | comunes: class | —       |

- **Variables propias** (`--mimi-…`): skeleton-bg, skeleton-duration, skeleton-radius.
- **Exports** (`index.ts`): `MimiSkeleton`.

### slider

| Pieza        | Selector      | Entradas                                                                                                                                                                               | Salidas |
| ------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiSlider` | `mimi-slider` | `size`, `[(value)]`, `range`, `min`, `max`, `step`, `marks`, `format`, `showValue`, comunes: disabled, readonly, invalid, touched, dirty, required, aria-label, aria-labelledby, class | `touch` |

- **Textos** `MimiSliderText`: minimum, maximum.
- **Variables propias** (`--mimi-…`): slider-fill, slider-h, slider-height, slider-thumb, slider-thumb-s, slider-thumb-shadow, slider-thumb-size, slider-track.
- **Exports** (`index.ts`): `MIMI_SLIDER_TEXT`, `MIMI_SLIDER_TEXT_EN`, `MIMI_SLIDER_TEXT_ES`, `MimiSlider`, `MimiSliderMark`, `MimiSliderShowValue`, `MimiSliderText`, `MimiSliderValue`, `provideMimiSliderText`.

### sortable-list

| Pieza                      | Selector                                   | Entradas                                                                                                                               | Salidas                      |
| -------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `MimiSortableGroup`        | `mimi-sortable-group, [mimiSortableGroup]` | —                                                                                                                                      | `moved` ⚠P3                  |
| `MimiSortableItemTemplate` | `ng-template[mimiSortableItem]`            | —                                                                                                                                      | —                            |
| `MimiSortableHeader`       | `[mimiSortableHeader]`                     | —                                                                                                                                      | —                            |
| `MimiSortableFooter`       | `[mimiSortableFooter]`                     | —                                                                                                                                      | —                            |
| `MimiSortableList`         | `mimi-sortable-list`                       | `size`, `[(items)]`, `itemLabel`, `trackBy`, `listId`, `orientation`, `accepts`, comunes: disabled, aria-label, aria-labelledby, class | `reordered` ⚠P3, `moved` ⚠P3 |

- **Textos** `MimiSortableText`: roleDescription, handle, instructions, grabbed, moved, dropped, canceled, instructionsGroup, movedToList, droppedInList, empty, rejected.
- **Variables propias** (`--mimi-…`): sortable-bg, sortable-drop, sortable-drop-bg, sortable-easing, sortable-gap, sortable-gap-s, sortable-handle-hover, sortable-item-h, sortable-item-height, sortable-lift, sortable-radius.
- **Exports** (`index.ts`): `MIMI_SORTABLE_TEXT`, `MIMI_SORTABLE_TEXT_EN`, `MIMI_SORTABLE_TEXT_ES`, `MimiSortableFooter`, `MimiSortableGroup`, `MimiSortableHeader`, `MimiSortableItemContext`, `MimiSortableItemTemplate`, `MimiSortableList`, `MimiSortableListImports`, `MimiSortableMove`, `MimiSortablePlace`, `MimiSortableReorder`, `MimiSortableText`, `provideMimiSortableText`.

### stepper

| Pieza             | Selector            | Entradas                                                                                   | Salidas  |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------ | -------- |
| `MimiStep`        | `mimi-step`         | `title`, `description`, `optional`, `completed`, `error`, `form`, comunes: disabled, class | —        |
| `MimiStepper`     | `mimi-stepper`      | `size`, `[(value)]`, `linear`, `orientation`, comunes: aria-label, class                   | `finish` |
| `MimiStepperNext` | `[mimiStepperNext]` | `mimiStepperNext`*                                                                         | —        |
| `MimiStepperPrev` | `[mimiStepperPrev]` | `mimiStepperPrev`*                                                                         | —        |

- **Textos** `MimiStepperText`: completed, current, pending, error, optional, step, announce, invalid.
- **Variables propias** (`--mimi-…`): stepper-hint, stepper-line, stepper-line-done, stepper-number, stepper-s, stepper-text.
- **Exports** (`index.ts`): `MIMI_STEPPER_TEXT`, `MIMI_STEPPER_TEXT_EN`, `MIMI_STEPPER_TEXT_ES`, `MimiStep`, `MimiStepForm`, `MimiStepState`, `MimiStepper`, `MimiStepperImports`, `MimiStepperNext`, `MimiStepperOrientation`, `MimiStepperPrev`, `MimiStepperText`, `provideMimiStepperText`.

### switch

| Pieza        | Selector      | Entradas                                                                                                                      | Salidas |
| ------------ | ------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiSwitch` | `mimi-switch` | `size`, `[(checked)]`, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, class | `touch` |

- **Variables propias** (`--mimi-…`): switch-h, switch-height, switch-off, switch-thumb, switch-track-off, switch-track-on, switch-w, switch-width.
- **Exports** (`index.ts`): `MimiSwitch`.

### table

| Pieza              | Selector                | Entradas                                 | Salidas |
| ------------------ | ----------------------- | ---------------------------------------- | ------- |
| `MimiTable`        | `table[mimiTable]`      | `size`, `mobile`, comunes: class         | —       |
| `MimiCaption`      | `caption[mimiCaption]`  | comunes: class                           | —       |
| `MimiThead`        | `thead[mimiThead]`      | comunes: class                           | —       |
| `MimiTbody`        | `tbody[mimiTbody]`      | comunes: class                           | —       |
| `MimiTr`           | `tr[mimiTr]`            | `selected`, comunes: class               | —       |
| `MimiTd`           | `td[mimiTd]`            | `align`, `label`, comunes: class         | —       |
| `MimiThOutlet` ⚠C8 | `[mimiThOutlet]`        | `mimiThOutlet`*                          | —       |
| `MimiTh`           | `th[mimiTh]`            | `sort`, `scope`, `align`, comunes: class | —       |
| `MimiRowToggle`    | `button[mimiRowToggle]` | `row`*, `controls`                       | —       |

- **Variables propias** (`--mimi-…`): table-bg, table-cell-px, table-font-size, table-head-bg, table-head-h, table-head-height, table-row-h, table-row-height, table-row-hover, table-row-selected.
- **Exports** (`index.ts`): `MIMI_DEFAULT_ROW_ID` ⚠C8, `MIMI_TABLE_CELL` ⚠C8, `MIMI_TABLE_CELL_BG` ⚠C8, `MIMI_TABLE_CONFIG`, `MIMI_TABLE_CONFIG_DEFAULT`, `MIMI_TABLE_HEAD` ⚠C8, `MIMI_TABLE_SCROLL_CELL` ⚠C8, `MIMI_TABLE_SORT_BUTTON` ⚠C8, `MIMI_TABLE_SORT_ICON` ⚠C8, `MIMI_TABLE_STACK` ⚠C8, `MimiCaption`, `MimiRowColumn`, `MimiRowToggle`, `MimiTable`, `MimiTableConfig`, `MimiTableFilters`, `MimiTableImports`, `MimiTableMobile`, `MimiTableRow`, `MimiTableSort`, `MimiTableSortHandle`, `MimiTableState`, `MimiTableStateColumn`, `MimiTableStateOptions`, `MimiTbody`, `MimiTd`, `MimiTh`, `MimiThOutlet` ⚠C8, `MimiThead`, `MimiTr`, `mimiClearStackRoles` ⚠C8, `mimiCompareValues`, `mimiFilterSortRows`, `mimiLabelCells` ⚠C8, `mimiNextSort`, `mimiTableState`, `provideMimiTable`.

### tabs

| Pieza            | Selector                    | Entradas                                                                                                                    | Salidas |
| ---------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiTab`        | `ng-template[mimiTab]`      | `mimiTab`, `label`, `count`, comunes: disabled                                                                              | —       |
| `MimiTabElement` | `mimi-tab`                  | `value`, `label`, `count`, comunes: disabled                                                                                | —       |
| `MimiTabLabel`   | `ng-template[mimiTabLabel]` | `mimiTabLabel`                                                                                                              | —       |
| `MimiTabs`       | `mimi-tabs`                 | `size`, `[(value)]`, `variant`, `orientation`, `preserveContent`, `panelClass`, comunes: aria-label, aria-labelledby, class | —       |

- **Variables propias** (`--mimi-…`): tabs-active-fg, tabs-count, tabs-fg, tabs-h-p, tabs-h-u, tabs-height, tabs-index, tabs-indicator, tabs-pill-active, tabs-pill-bg, tabs-pill-shadow, tabs-spring, tabs-text-p.
- **Exports** (`index.ts`): `MimiTab`, `MimiTabElement`, `MimiTabLabel`, `MimiTabs`, `MimiTabsImports`, `MimiTabsVariant`.

### tags-input

| Pieza           | Selector          | Entradas                                                                                                                                                                                                              | Salidas |
| --------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiTagsInput` | `mimi-tags-input` | `size`, `[(value)]`, `limit`, `separators`, `allowDuplicates`, `normalize`, `validate`, `hint`, `placeholder`, comunes: disabled, readonly, invalid, touched, dirty, required, id, aria-label, aria-labelledby, class | `touch` |

- **Textos** `MimiTagsInputText`: help, duplicate, full, fullPlaceholder.
- **Variables propias** (`--mimi-…`) ⚠P5: tags-chip-readonly-border, tags-full-border, tags-gap, tags-input-min-width, tags-padding.
- **Exports** (`index.ts`): `MIMI_TAGS_INPUT_TEXT`, `MIMI_TAGS_INPUT_TEXT_EN`, `MIMI_TAGS_INPUT_TEXT_ES`, `MimiTagsInput`, `MimiTagsInputText`, `provideMimiTagsInputText`.

### textarea

| Pieza          | Selector                 | Entradas                            | Salidas |
| -------------- | ------------------------ | ----------------------------------- | ------- |
| `MimiTextarea` | `textarea[mimiTextarea]` | `size`, `showError`, comunes: class | —       |

- **Variables propias** (`--mimi-…`): textarea-bg, textarea-border, textarea-line-height, textarea-min-height, textarea-py, textarea-radius.
- **Exports** (`index.ts`): `MimiTextarea`, `textareaVariants` ⚠C5.

### toast

- **Textos** `MimiToastText`: region, close.
- **Variables propias** (`--mimi-…`): toast-bg, toast-border, toast-circle, toast-desc, toast-enter, toast-icon, toast-min-h, toast-offset, toast-pl, toast-py, toast-radius, toast-shadow, toast-stack-gap, toast-title, toast-w, toast-width.
- **Exports** (`index.ts`): `MIMI_TOAST_CONFIG`, `MIMI_TOAST_DEFAULTS` ⚠C6, `MIMI_TOAST_TEXT`, `MIMI_TOAST_TEXT_EN`, `MIMI_TOAST_TEXT_ES`, `MimiToastAction`, `MimiToastConfig`, `MimiToastFn`, `MimiToastMessage`, `MimiToastOptions`, `MimiToastPosition`, `MimiToastPromiseMessages`, `MimiToastText`, `MimiToastVariant`, `injectMimiToast`, `provideMimiToast`, `provideMimiToastText`.

### toggle-group

| Pieza                 | Selector                      | Entradas                                                                                                                                       | Salidas |
| --------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiToggleGroupItem` | `button[mimiToggleGroupItem]` | `mimiToggleGroupItem`, comunes: class                                                                                                          | —       |
| `MimiToggleGroup`     | `mimi-toggle-group`           | `size`, `[(value)]`, `multiple`, `variant`, comunes: disabled, readonly, invalid, touched, dirty, required, aria-label, aria-labelledby, class | `touch` |

- Sin textos propios (el texto o el `aria-label` de cada botón es del usuario).
- **Variables propias** (`--mimi-…`) ⚠P5: toggle-group-active-fg, toggle-group-bg, toggle-group-count, toggle-group-fg, toggle-group-font-size, toggle-group-gap, toggle-group-icon-width, toggle-group-index, toggle-group-indicator, toggle-group-indicator-shadow, toggle-group-item-height, toggle-group-item-px, toggle-group-padding, toggle-group-radius, toggle-group-spring, toggle-h, toggle-px.
- **Exports** (`index.ts`): `MimiToggleGroup`, `MimiToggleGroupImports`, `MimiToggleGroupItem`, `MimiToggleGroupVariant`.

### toolbar

| Pieza                  | Selector                  | Entradas                                                                                               | Salidas    |
| ---------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| `MimiToolbarItem`      | `button[mimiToolbarItem]` | `mimiToolbarItem`, `kind`, comunes: disabled, class                                                    | —          |
| `MimiToolbar`          | `mimi-toolbar`            | `size`, `orientation`, `wrap`, `[(value)]`, `[(pressed)]`, comunes: aria-label, aria-labelledby, class | `activate` |
| `MimiToolbarSeparator` | `mimi-toolbar-separator`  | comunes: class                                                                                         | —          |
| `MimiToolbarCount`     | `[mimiToolbarCount]`      | comunes: class                                                                                         | —          |

- **Variables propias** (`--mimi-…`): toolbar-active-bg, toolbar-active-fg, toolbar-bg, toolbar-blur, toolbar-border, toolbar-icon, toolbar-item-s, toolbar-item-size, toolbar-pressed-bg, toolbar-ring, toolbar-shadow.
- **Exports** (`index.ts`): `MimiToolbar`, `MimiToolbarCount`, `MimiToolbarImports`, `MimiToolbarItem`, `MimiToolbarItemKind`, `MimiToolbarOrientation`, `MimiToolbarSeparator`.

### tooltip

| Pieza         | Selector        | Entradas                                                                                                                                                                          | Salidas |
| ------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiTooltip` | `[mimiTooltip]` | `mimiTooltip`, `mimiTooltipSide`, `mimiTooltipAlign`, `mimiTooltipDelay`, `mimiTooltipDisabled`, `mimiTooltipShortcut`, `mimiTooltipArrow`, `mimiTooltipClass`, `mimiTooltipSize` | —       |

- **Variables propias** (`--mimi-…`): tooltip-arrow, tooltip-arrow-offset, tooltip-bg, tooltip-delay, tooltip-fg, tooltip-font-size, tooltip-foreground, tooltip-px, tooltip-radius, tooltip-text.
- **Exports** (`index.ts`): `MIMI_TOOLTIP_SKIP_DELAY`, `MimiTooltip`, `MimiTooltipAlign`, `MimiTooltipSide`.

### tree

| Pieza                  | Selector                    | Entradas                                                                                                                        | Salidas |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `MimiTreeNodeTemplate` | `ng-template[mimiTreeNode]` | —                                                                                                                               | —       |
| `MimiTree`             | `mimi-tree`                 | `size`, `nodes`, `[(value)]`, `multiple`, `[(expanded)]`, `loadChildren`, comunes: disabled, aria-label, aria-labelledby, class | `touch` |

- **Textos** `MimiTreeText`: loading, loadError.
- **Variables propias** (`--mimi-…`): tree-bg, tree-font-size, tree-hover, tree-indent, tree-padding, tree-row-h, tree-row-height, tree-row-radius, tree-selected, tree-selected-fg, tree-text.
- **Exports** (`index.ts`): `MIMI_TREE_TEXT`, `MIMI_TREE_TEXT_EN`, `MIMI_TREE_TEXT_ES`, `MimiTree`, `MimiTreeImports`, `MimiTreeNode`, `MimiTreeNodeContext`, `MimiTreeNodeTemplate`, `MimiTreeText`, `provideMimiTreeText`.

### utils

| Pieza           | Selector               | Entradas    | Salidas |
| --------------- | ---------------------- | ----------- | ------- |
| `MimiSized`     | (directiva anfitriona) | `size`      | —       |
| `MimiSizeScope` | `[mimiSize]`           | `mimiSize`* | —       |

- Los estilos de los campos (`field*Styles`, `control*Styles`, `buttonFocusStyles`, `choicePressStyles`) son públicos: sirven para un control propio con el aspecto de Mimi.
- **Exports** (`index.ts`): `MIMI_SIZE`, `MimiSize`, `MimiSizeContext`, `MimiSizeScope`, `MimiSized`, `buttonFocusStyles`, `choicePressStyles`, `cn`, `controlDisabledStyles`, `controlInvalidStyles`, `controlPressStyles`, `fieldBoxStyles`, `fieldButtonHoverStyles`, `fieldFocusStyles`, `fieldNativeStyles`, `fieldTriggerBoxStyles`, `fieldTriggerStyles`, `injectMimiSize`.

### theme

- **Exports** (`index.ts`): `MIMI_THEME`, `MIMI_THEME_NEUTRAL`, `MIMI_THEME_STYLE_ID`, `MimiAccordionTokens`, `MimiAvatarTokens`, `MimiBadgeTokens`, `MimiButtonTokens`, `MimiCardTokens`, `MimiCheckboxTokens`, `MimiChipTokens`, `MimiColorPickerTokens`, `MimiColorTokens`, `MimiComboboxTokens`, `MimiCommandTokens`, `MimiComponentTokens`, `MimiConfirmTokens`, `MimiControlSizeTokens`, `MimiControlTokens`, `MimiDateTokens`, `MimiDialogTokens`, `MimiEffectTokens`, `MimiFieldTokens`, `MimiFileUploadTokens`, `MimiFontTokens`, `MimiInputMaskTokens`, `MimiInputOtpTokens`, `MimiInputTokens`, `MimiLoadingTokens`, `MimiMenuTokens`, `MimiMotionTokens`, `MimiNumberInputTokens`, `MimiPaginationTokens`, `MimiPasswordTokens`, `MimiPopoverTokens`, `MimiProgressTokens`, `MimiRadiusTokens`, `MimiSelectTokens`, `MimiSeparatorTokens`, `MimiShadowTokens`, `MimiSharedTokens`, `MimiSheetTokens`, `MimiSkeletonTokens`, `MimiSliderTokens`, `MimiSortableTokens`, `MimiStepperTokens`, `MimiSwitchTokens`, `MimiTableTokens`, `MimiTabsTokens`, `MimiTagsInputTokens`, `MimiTextareaTokens`, `MimiThemePreset`, `MimiToastTokens`, `MimiToggleGroupTokens`, `MimiToolbarTokens`, `MimiTooltipTokens`, `MimiTreeTokens`, `applyMimiTheme`, `mimiThemeToCss`, `provideMimiTheme`.
