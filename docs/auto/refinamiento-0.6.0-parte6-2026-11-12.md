# Refinamiento 0.6.0, sexta tanda (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 5](refinamiento-0.6.0-parte5-2026-11-12.md)

Encargo (12/11/2026): `<mimi-option>` quedó a medias (solo había un ejemplo nuevo; los demás seguían con `[options]`). El usuario pide `<mimi-option>` como la forma normal de usar Select. Cinco puntos, **un commit por punto**: migrar todos los ejemplos, búsqueda en servidor sin trucos, `compareWith` con atajo, revisión con Playwright y CHANGELOG + API. **No se subió la versión ni se publicó nada.** Node 24.18.0.

## 1. Todos los ejemplos de Select y Combobox con `<mimi-option>`

**Plan breve.** Reescribir cada ejemplo con `<mimi-option>` / `<mimi-optgroup>`: opciones fijas escritas en la plantilla, y `@for` con `[value]` enlazado cuando los datos vienen de una señal. Dejar **un** ejemplo con `[options]` al final de cada página («Alternativa: `[options]` para listas generadas por código»). Lo mismo en el bloque «Uso», en los fragmentos de R.13, en Tamaños, Fundamentos y el ejemplo de Dialog con formulario, y en el comentario de uso de los dos componentes. Una prueba que impida volver atrás.

**Qué se hizo.**

- **Select** (11 ejemplos): Básico, Personalizado, Reactive Forms, Signal Forms y ngModel con opciones fijas en la plantilla; Grupos (`@for` de grupos con `@for` de opciones dentro, `[hint]` y `[disabled]` enlazados), Búsqueda (`@for` de una señal dentro de `<mimi-optgroup>`, con la plantilla `mimiSelectOption`), Servidor (`@for` de la señal con los resultados, `[value]` con el objeto), Estados (`@for` de una lista en tres Select; el de «cargando» ya no necesita `[options]="[]"`). **Alternativa nueva, la última:** `select-options.example.ts`, los 12 meses armados con `Intl.DateTimeFormat`. El tipo `MimiOption` / `MimiOptionGroup` pasa del bloque «Uso» a esa sección.
- **Combobox** (8 ejemplos): Ciudad, Múltiple, Crear, Servidor, Formularios (los cuatro campos) y Opción propia con `@for` de una señal o una lista. Crear y Múltiple siguen agregando la opción nueva a la señal: el `@for` la pinta y el Combobox la elige. **Alternativa nueva, la última:** `combobox-options.example.ts`, horas cada media hora en dos grupos armadas por código.
- «Con formularios» (`forms-tabs`) pasa antes de la alternativa en las dos páginas, para que la alternativa sea el último ejemplo.
- **Fragmentos de R.13** (`forms-snippets.ts`): Select y Combobox con `<mimi-option>` e `imports: [MimiSelectImports]` / `[MimiComboboxImports]`; se quitó el arreglo `roles` / `cities` de la clase. El control ahora puede ocupar varias líneas: se sangra entero dentro de `mimi-form-field`.
- **Blocks:** ningún Block usa Select ni Combobox (`git grep` en `packages/ui-core/src/lib/blocks` y en las páginas de Blocks): nada que migrar.
- **README de la CLI** (`packages/cli/README.md`): solo enlaza a la documentación de Select y Combobox, sin código: nada que migrar.

**Pruebas.**

- `select-page.spec.ts` y `combobox-page.spec.ts`: 11 y 8 ejemplos; **solo el último** usa `[options]="…"`, y todos los demás contienen `<mimi-option`.
- `forms-tabs.spec.ts`: los tres fragmentos de Select y Combobox no tienen `[options]`, importan `MimiSelectImports` / `MimiComboboxImports` y las opciones quedan sangradas dentro de `mimi-form-field`.
- `ng test docs` de las páginas de Select, Combobox, Dialog, Tamaños, Fundamentos y `forms-tabs`: 6 archivos, 15 pruebas en verde. `pnpm build` en verde: JS inicial 334,87 kB crudo / 106,23 kB gzip, CSS global 111,56 kB / 17,13 kB (antes, 334,87 / 106,24 y 111,56 / 17,13: sin cambio).

**Archivos.**

- Ejemplos de Select: `select-basic`, `select-custom-class`, `select-groups`, `select-ng-model`, `select-reactive-forms`, `select-search`, `select-server`, `select-signal-forms`, `select-states` y `select-options` (nuevo), en `apps/docs/src/app/pages/docs/components/select/examples/`.
- Ejemplos de Combobox: `combobox-async`, `combobox-city`, `combobox-create`, `combobox-custom`, `combobox-forms`, `combobox-multiple` y `combobox-options` (nuevo), en `apps/docs/src/app/pages/docs/components/combobox/examples/`.
- Páginas: `select-page.ts`, `select-page.html`, `select-page.spec.ts`, `combobox-page.ts`, `combobox-page.html`, `combobox-page.spec.ts`.
- Otros del sitio: `code/forms-snippets.ts`, `code/forms-tabs.spec.ts`, `pages/docs/sizes-page.ts`, `pages/docs/foundations-page.ts`, `components/dialog/examples/dialog-form.example.ts`.
- ui-core (solo el comentario de uso): `select/select.ts`, `combobox/combobox.ts`.

**Alerta para el revisor.** «Deja UN solo ejemplo» se leyó como **uno por página** (Select y Combobox documentan cada uno su `[options]`). Si querías uno solo entre las dos, se quita `combobox-options.example.ts`.
