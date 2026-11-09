# Combobox y Select: por qué son dos y qué cambiar para que tengan la misma API

[← Plan de refinamiento](plan.md)

Pregunta del usuario (09/11/2026): «¿Qué diferencia tiene con el Select y por qué no son uno solo?» Respuesta con evidencia del código (`packages/ui-core/src/lib/components/`, comprobado el 09/11/2026 en `main` = `e4e967f`; abreviado `select.ts` y `combobox.ts`).

## 1. La diferencia que importa: qué es el elemento que enfocas

|                               | **Select** (`mimi-select`)                                                                     | **Combobox** (`mimi-combobox`)                                                                                                                    |
| ----------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Elemento enfocable            | un **`<button>`** con `ngCombobox` (`select.ts:~543`, `type="button"`)                         | un **`<input type="text">`** con `ngCombobox` (`combobox.ts:195-199`)                                                                             |
| Qué haces                     | **eliges** de una lista cerrada; el disparador muestra la opción elegida                       | **escribes** y la lista se filtra; puedes **elegir** o (con `creatable`) **crear** un valor nuevo                                                 |
| Patrón de accesibilidad (APG) | «Select-Only Combobox»: rol `combobox` sobre un botón, sin texto editable                      | «Editable Combobox with List Autocomplete»: rol `combobox` sobre un campo de texto                                                                |
| El texto                      | no hay texto libre; la búsqueda es **opcional y dentro del panel** (`search`, `select.ts:761`) | el texto del campo **es** la interacción principal (`draft()`, `valueChange` → `onText`)                                                          |
| Valor                         | `T \| null` (`select.ts:756`)                                                                  | `T \| null \| T[]` (`combobox.ts:328`): con `multiple`, varios valores como **chips** (`mimi-chip`) dentro del campo                              |
| Solo de uno                   | `clearable` (limpiar), `matchWidth`, `search`, `searchPlaceholder`                             | `multiple`, `creatable`, `hint` (texto de ayuda bajo el campo)                                                                                    |
| Teclado propio                | letras para saltar a una opción **no** (M.6, pendiente); ↑↓ abren y navegan                    | ↑↓ navegan, escribir filtra, con `multiple` y el campo vacío, `Retroceso` quita el último chip (`combobox.ts:742`); `Enter` crea o elige (`:765`) |
| Dónde está la lista           | `MimiSelectList` (propia de Select, `select.ts:233-367`)                                       | `MimiOptionList` (compartida, `option-list.ts`)                                                                                                   |

**No son uno solo porque no se pueden hacer bien con un solo elemento.** Un `<button>` no admite texto editable, y un `<input>` no se comporta como un botón: en un lector de pantalla y en un teléfono (teclado virtual) son interacciones distintas. Un componente único con un modo `editable` tendría que cambiar de elemento nativo según una entrada, lo que rompe el foco, el id que usa `<label for>` y la API de formularios (`mimi-form-field` encuentra el control por su elemento: `controlElement`). Es lo que hacen las librerías de referencia que usa la spec como inspiración: shadcn tiene `Select` y `Combobox` por separado, y PrimeNG, un desplegable y `AutoComplete` (`docs/spec.md`, sección 4, tabla del Grupo 2, fila 8: «shadcn (Combobox) y PrimeNG (AutoComplete)»; Select aparece en la tabla del Grupo 1). Y una consecuencia práctica: **Select es el control por defecto** para una lista corta y cerrada; **Combobox**, cuando hay muchas opciones, se busca escribiendo, se quiere elegir varias o crear.

## 2. Lo que comparten (y ya es la misma base)

- Los dos usan la directiva `Combobox` de `@angular/aria` para el rol, `aria-expanded` y `aria-activedescendant` (`select.ts:1`, `combobox.ts:1`) y el mismo posicionamiento de panel (`@angular/cdk/overlay`, `mimiConnectedPositions`).
- La **forma de los datos es idéntica**: `MimiOption` de Select (`label`, `value`, `disabled`, `hint`) y `MimiListOption` de Combobox son el mismo tipo con dos nombres (`option-list.ts:33-40`: «Tiene la misma forma que `MimiOption` de Select»); lo mismo `MimiOptionGroup`/`MimiListOptionGroup`.
- Las mismas entradas: `options`, `value` (`model`), `compareWith`, `filterWith`, `loading`, `placeholder`, `disabled`, `invalid`, `touched`, `dirty`, `required`, `id`, `aria-label`, `aria-labelledby`, `class`, `panelClass`, `side`, `align` (`select.ts:754-789`, `combobox.ts:323-366`).
- Los dos son `FormValueControl` y `MIMI_FIELD_CONTROL` (Signal Forms, Reactive Forms y `ngModel`).

## 3. Lo que difiere sin motivo (y hay que unificar)

1. **Dos tipos para lo mismo:** `MimiOption`/`MimiOptionGroup`/`MimiSelectFilter` frente a `MimiListOption`/`MimiListOptionGroup`/`MimiListFilter`. Un usuario que cambia de Select a Combobox tiene que renombrar tipos.
2. **Dos directivas de plantilla de opción:** `ng-template[mimiSelectOption]` (`select.ts:162`) y `ng-template[mimiComboboxOption]` (`combobox.ts:143`), con contextos distintos (`let-option let-query let-trigger` frente al del Combobox).
3. **Dos implementaciones de la lista:** `MimiSelectList` (con su propio `normalize()`, `MimiSelectHighlight` y filtro, `select.ts:92-98, 125-367`) frente a `MimiOptionList` (con `mimiDefaultListFilter` y el resaltado, `option-list.ts`). Es la tarea **M.9** (ya registrada: «Migrar Select a las utilidades de lista del Combobox»): «para quitar el código repetido».
4. **Entradas que solo tiene uno y debería tener el otro:** `clearable` (Combobox no lo tiene, y en un campo de texto es lo más natural: borrar el texto y el valor), `size` y `readonly` (ninguno; R.2, R.12), `matchWidth` (solo Select), `hint` de la opción (el de campo, `hint`, solo Combobox, con el mismo nombre que el `hint` de **opción**: confuso).
5. **Íconos del extremo:** Select tiene limpiar + carga + chevron en fila (R.15 lo cambia a una sola celda); Combobox tiene su propio manejo.
6. **Opciones como contenido:** ninguno de los dos acepta `<mimi-option>` (lo pide el usuario para Select, R.15).

## 4. Plan de cambios (R.15, R.16, M.9)

Orden: **M.9 → R.15 → R.16** (la lista compartida primero; después Select; después Combobox copia a Select).

1. **M.9:** Select usa `MimiOptionList` (se borran `MimiSelectList`, el `normalize()` y el resaltado propio). La API pública de Select no cambia (reexporta lo que movió). Pruebas de Select sin cambios (las de «Rodeos de aria», G1.5b, siguen).
2. **Un solo vocabulario de datos:** `MimiOption`/`MimiOptionGroup`/`MimiOptionFilter` (nombres de Select) como tipos **únicos**, definidos en el ítem `option-list` (que ya comparten); `MimiListOption` y compañía quedan como alias `@deprecated` de los de arriba durante la 0.6.0 y se quitan en la 0.7.0 (RUPTURA suave, como `default` → `md`).
3. **Una sola plantilla de opción:** `ng-template[mimiOption]` (con el contexto de Select: `option`, `query`, `trigger`), usada por los dos; `mimiSelectOption` y `mimiComboboxOption` siguen como alias durante la 0.6.0.
4. **Opciones por contenido (R.15) en los dos:** `<mimi-option value label? disabled? hint?>` y `<mimi-optgroup label>`, **los mismos elementos** en `mimi-select` y en `mimi-combobox`; `[options]` sigue para datos dinámicos.
5. **Entradas comunes (R.16):** Combobox suma `clearable` (con la misma celda de íconos de R.15: X sobre el extremo; en `multiple`, limpia todos los chips), `size` (R.1), `readonly` (R.12) y `matchWidth`; Select suma, **si el usuario lo quiere**, `multiple` (decisión abierta: sería un `mimi-select` con chips como el Combobox pero **sin** texto editable; la recomendación es **no** agregarlo a Select y que «varios valores» sea siempre Combobox `multiple`, para no mezclar los dos patrones). El `hint` del campo del Combobox pasa a llamarse `description` (como el de Form Field en R.14) para no chocar con el `hint` de opción.
6. **Documentación:** una tabla «¿Select o Combobox?» (la de la sección 1, resumida) al principio de las dos páginas, con el criterio: lista corta y cerrada → Select; muchas opciones, escribir para buscar, varias o crear → Combobox. Un ejemplo con **los mismos datos y las mismas `mimi-option`** en los dos.
7. **Nada de aria ni de cdk sale en la API pública** (decisión 4.3); los rodeos (`select.ts`, «Rodeo», G1.5b) siguen documentados.

### Archivos

`c/option-list/option-list.ts` (tipos únicos, plantilla común, `mimi-option`/`mimi-optgroup`), `c/select/select.ts` (M.9 y R.15), `c/combobox/combobox.ts` (R.16), `c/combobox/combobox-texts.ts` y `c/select/select-texts.ts` (el texto de limpiar compartido), `theme/types.ts`, el registro de la CLI (`packages/cli/src/registry.json`: los dos dependen de `option-list`), las páginas de los dos y la spec 4.

### Pruebas

- **Contrato compartido:** una suite que se ejecuta contra **los dos componentes** (una función `describeOptionsApi(factory)`): las mismas `<mimi-option>`/`<mimi-optgroup>` producen las mismas opciones, el mismo `value` al elegir, el mismo filtro sin tildes, `compareWith`, `disabled`, grupos, `clearable`, `loading`, `readonly` y `size` (altura idéntica en el mismo tamaño).
- Lo propio de cada uno sigue con sus pruebas (Select: la búsqueda del panel; Combobox: `multiple`, `creatable`, `Retroceso` borra el chip).
- Compatibilidad: los alias `@deprecated` (`MimiListOption`, `mimiSelectOption`, `mimiComboboxOption`) siguen compilando y avisan en desarrollo.
- Accesibilidad: roles y `aria-activedescendant` sin cambios (las pruebas de aria existentes).
