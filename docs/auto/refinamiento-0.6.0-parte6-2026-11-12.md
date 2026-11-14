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

## 2. Búsqueda en servidor sin trucos: `searchMode`

**Plan breve.** Una entrada con la misma API en los dos componentes; con `'server'` la lista muestra las opciones tal cual llegan. Usarla en los dos ejemplos de servidor en lugar de `[filterWith]="() => true"`.

**Nombre.** El plan no traía Recomendación para esta entrada (`grep` en `docs/plan/`): se tomó **`searchMode="client" | "server"`**, por defecto `"client"`, el que proponías. Registrado en `docs/auto/decisiones-por-defecto.md` («Decididas por defecto: refinamiento 0.6.0»).

**Qué se hizo.**

- `option-list.ts`: tipo `MimiSearchMode` (exportado en el índice de `option-list`).
- `select.ts` y `combobox.ts`: `searchMode = input<MimiSearchMode>('client')`. Con `'server'`, `visibleSections` devuelve todas las opciones (en el Select, aunque haya texto en el buscador). `filterWith` sigue igual para filtros propios y **solo cuenta en `'client'`**. Lo demás no cambia: `(searchChange)`, el resaltado de lo escrito, el contador del Select y la fila «Crear» del Combobox.
- Ejemplos: `select-server.example.ts` y `combobox-async.example.ts` usan `searchMode="server"`; se quitaron `serverFilters` / `all`. Las páginas lo explican en «Búsqueda en el servidor».

**Pruebas** (`packages/ui-core/src/lib/search-mode.spec.ts`, nuevo; 6 casos, los mismos para Select y Combobox, con `<mimi-option>` en un `@for`):

- por defecto filtra sin tildes («cami» → «Camila»);
- con `'server'`, «zzz» deja las 3 opciones y `(searchChange)` recibe «zzz»; al cambiar la señal, la lista es la nueva;
- un `filterWith` propio filtra en `'client'` y se ignora en `'server'`.

En verde junto con `declared-options.spec.ts`: 2 archivos, 9 pruebas.

**Archivos:** `option-list/option-list.ts`, `option-list/index.ts`, `select/select.ts`, `combobox/combobox.ts`, `search-mode.spec.ts` (nuevo), los dos ejemplos de servidor, `select-page.html`, `combobox-page.html`, `docs/auto/decisiones-por-defecto.md` y este informe.

Con todo ui-core: 84 archivos, 1003 pruebas en verde; CLI, 202 en verde.

## 3. `compareWith` con atajo: el nombre de un campo

**Plan breve.** Que `compareWith` acepte una función o un nombre de campo, con la misma lógica en Select y Combobox (una función compartida en `option-list`), y usarlo en los ejemplos con objetos.

**Qué se hizo.**

- `option-list.ts`: tipo `MimiCompareWith<T> = ((a: T, b: T) => boolean) | string` y `mimiCompareFn()`. Con un nombre, dos objetos son iguales si ese campo es igual (`Object.is`). Si alguno no es un objeto (un valor suelto), se compara con `Object.is`. Las dos cosas se exportan en el índice de `option-list`.
- `select.ts` y `combobox.ts`: `compareWith = input<MimiCompareWith<T>>(Object.is)`, convertido una sola vez con un `computed`.
- **El tipo es `string`, no `keyof T`.** Con `<mimi-option>` el tipo `T` no siempre se deduce, y con `keyof T` el atajo dejaría de compilar en esos casos. No hay aviso si el campo no existe: no coincide nada y no hay opción elegida (lo cubre una prueba).
- Ejemplos con objetos:
  - `select-server.example.ts`: `compareWith="id"`. El valor inicial es **otro objeto** con el mismo `id` (como uno guardado) y el disparador lo reconoce. Se quitó `sameUser`.
  - `combobox-custom.example.ts`: `compareWith="email"`, con un valor inicial guardado igual.
  - La página de Select explica el atajo en «Búsqueda en el servidor».

**Pruebas** (`packages/ui-core/src/lib/compare-with.spec.ts`, nuevo; 4 casos):

- `compareWith="id"` en Select y Combobox, con otro objeto del mismo `id`: el disparador y el campo muestran «Bruno»;
- con una función, sigue igual;
- con un campo que no coincide, no hay opción elegida;
- `mimiCompareFn` con objetos, valores sueltos, `null` y una función (la devuelve tal cual).

En verde. Las pruebas de las páginas de Select y Combobox siguen en verde. `pnpm build` en verde: JS inicial **334,87 kB / 106,23 kB gzip**, CSS global **111,56 kB / 17,13 kB** (sin cambio).

**Archivos:**

- ui-core: `option-list/option-list.ts`, `option-list/index.ts`, `select/select.ts`, `combobox/combobox.ts`, `compare-with.spec.ts` (nuevo).
- Sitio: `select-server.example.ts`, `combobox-custom.example.ts`, `select-page.html`.
- Este informe.

## 4. Revisión con Playwright en el sitio servido (claro y oscuro)

**Cómo.** Sitio servido con `pnpm ng serve docs --port 4280` (el 4200 lo tenía otro proceso, que no se tocó), lanzado con `timeout` y esperado con un bucle de 3 minutos como tope. Script `review.mjs` con `playwright-core` 1.56.1 y el Chrome instalado, **fuera del repo** (en el directorio temporal de la sesión). Contextos con `colorScheme: 'light'` y `'dark'`; se comprobó que `<html>` lleva `dark` en el oscuro.

**Qué hace en cada ejemplo** de las páginas de Select y Combobox (y en el Select del ejemplo de Dialog con formulario):

1. abre el panel;
2. cuenta las opciones visibles (`role="option"`);
3. elige una habilitada que no esté marcada;
4. comprueba el texto del disparador, el valor del campo o el chip.

Los deshabilitados no abren, y el de «cargando» muestra `aria-busy` sin opciones.

**Resultado: 56 comprobaciones (28 por tema), todas OK, sin errores de consola.**

| Página   | Ejemplo                         | Opciones         | Elegida → mostrada                                    |
| -------- | ------------------------------- | ---------------- | ----------------------------------------------------- |
| Select   | `<mimi-option>`                 | 5                | Gratis                                                |
| Select   | Con etiqueta                    | 6                | Bogotá (UTC−5)                                        |
| Select   | Con búsqueda (plantilla propia) | 8                | Argentina → «AR Argentina»                            |
| Select   | Grupos                          | 5                | Gratis                                                |
| Select   | Estados (limpiar / error)       | 3 / 3            | Pequeño; deshabilitado no abre; cargando sin opciones |
| Select   | Reactive / Signal / ngModel     | 3 / 3 / 4        | Administrador / English / Peso mexicano               |
| Select   | Personalizado                   | 3                | Más antiguos                                          |
| Select   | Alternativa `[options]`         | 12               | Enero                                                 |
| Combobox | `<mimi-option>`                 | 4                | Madrid                                                |
| Combobox | Ciudad                          | 8                | Bogotá                                                |
| Combobox | Múltiple                        | 6                | chips «Angular · TypeScript · Tailwind CSS»           |
| Combobox | Crear                           | 3                | Desarrollo                                            |
| Combobox | Formularios (3 + deshabilitado) | 5 cada uno       | TypeScript; el deshabilitado muestra «TypeScript»     |
| Combobox | Opción propia                   | 3                | Ana Ruiz                                              |
| Combobox | Alternativa `[options]`         | 24 (en 2 grupos) | 08:00                                                 |
| Dialog   | Formulario (Select en el panel) | 3                | Administrador                                         |

**Búsqueda en el servidor, con carga (`searchMode="server"`):**

- **Select:**
  - al abrir muestra «Camila Rojas», el valor inicial: otro objeto con el mismo `id`, reconocido con `compareWith="id"`;
  - hay 6 opciones;
  - con «zzz» sale la carga (`aria-busy` en el panel y el spinner en el disparador) y después 0 opciones;
  - con «an» sale la carga y después «Ana Morales»; al elegirla, el disparador y `value:` dicen «Ana Morales».
- **Combobox:**
  - con «Tokio» sale la carga (el esqueleto y el spinner) y después «Sin resultados para «Tokio»» con la ayuda propia;
  - con «sa» sale la carga y después «Santiago»; al elegirla, el campo dice «Santiago».

**Observación, sin cambio.** En el ejemplo de servidor del Select, al elegir se ve el spinner unos 600 ms. Al cerrarse, el panel emite `searchChange('')` (ya lo hacía) y el ejemplo vuelve a pedir la lista completa al «servidor». Es lo que haría una app real. No se tocó.

**Prueba añadida:** `combobox-page.spec.ts` comprueba que el campo de «Opción propia» muestra «Sol Díaz», el valor guardado que reconoce `compareWith="email"`.

**Limpieza:** se detuvo el servidor del 4280 (tarea y proceso `node` por PID) y se comprobó con `netstat` que el puerto quedó libre. El script, `playwright-core` y las capturas se borran del directorio temporal al terminar.

## 5. CHANGELOG, página de API y spec

- **`CHANGELOG.md`** («0.6.0 (por publicar)», «Formularios»): una entrada nueva, **como añadido y no como ruptura**. Dice que `<mimi-option>` es la forma normal y `[options]` la alternativa, y presenta `searchMode` y `compareWith="id"`. La línea anterior («como alternativa a `[options]`») ya no se contradice: remite a la nueva.
- **Tablas de API** (`select-page.ts`, `combobox-page.ts`):
  - fila nueva `searchMode`;
  - `compareWith` con su tipo `función | string` y el atajo;
  - `filterWith` aclara que solo cuenta en `'client'`;
  - `options` se describe como alternativa (en el punto 1).
- **Spec:**
  - «Principio de uso»: la forma corta de Select es `<mimi-select>` con sus `<mimi-option>`.
  - Filas de Select y Combobox del catálogo: `<mimi-option>` como forma normal, `searchMode` y `compareWith` con nombre de campo.

## Verificación final (con los cinco puntos)

- **`pnpm build`** en verde:
  - JS inicial: **334,87 kB crudo / 106,24 kB gzip** (antes, 334,87 / 106,24; sin cambio);
  - CSS global: **111,56 kB / 17,13 kB** (sin cambio).
  - El código nuevo (`searchMode`, `mimiCompareFn`) va en los chunks diferidos de Select y Combobox, no en el JS inicial.
- **`pnpm test`** en verde: docs **246** (antes, 245), ui-core **1007** (antes, 997: +6 de `searchMode`, +4 de `compareWith`), CLI **202**.
- **`pnpm format:check`** en verde.

## Alertas para el revisor

1. **Un ejemplo con `[options]` por página** (Select y Combobox), no uno solo entre las dos (ver punto 1).
2. **`searchMode` es un nombre decidido por defecto.** Está registrado en `docs/auto/decisiones-por-defecto.md`. Con `'server'` también se ignora `filterWith`.
3. **`compareWith` acepta cualquier `string`**, no `keyof T`, y no avisa si el campo no existe (ver punto 3).
4. **Revisión con Playwright, no con NVDA.** La accesibilidad del panel no cambió y no se volvió a revisar con un lector de pantalla.

**No se subió la versión ni se publicó nada.** Los cinco commits están en `auto/refinamiento-0.6.0-2026-11-09`, con push. Fusionar a `main` lo hace el usuario.
