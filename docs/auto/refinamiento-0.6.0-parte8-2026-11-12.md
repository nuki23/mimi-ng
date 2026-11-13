# Refinamiento 0.6.0, octava tanda: estados visuales de los controles (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 7](refinamiento-0.6.0-parte7-2026-11-12.md)

Encargo del 12/11/2026. El usuario revisó los controles: «cada control de formulario dibuja hover, foco, clic y bordes a su manera». Tiene dos partes:

- **Parte 1:** errores claros y una página de estados para comparar opciones. Es la que se hizo.
- **Parte 2:** unificar los controles según lo que elija el usuario. **No se hizo:** espera a su elección.

**No se subió la versión ni se publicó nada.** Node 24.18.0. Playwright con `playwright-core` y el Chrome instalado, **fuera del repo** (directorio temporal de la sesión), contra el sitio servido con `pnpm ng serve docs --port 4280`.

## 1. Select: el anillo de foco ya no se queda al elegir con el ratón

**Antes**, medido con Playwright en claro y oscuro: con el ratón se abre, se elige una opción y se aparta el puntero; con el teclado se llega con Tab.

| Control                       | Anillo tras elegir con el ratón | Anillo con Tab |
| ----------------------------- | ------------------------------- | -------------- |
| Select                        | **sí (error)**                  | sí             |
| Select con buscador           | **sí (error)**                  | sí             |
| Combobox                      | sí (ver abajo)                  | sí             |
| Date Picker                   | no                              | sí             |
| Date Range                    | no                              | sí             |
| Color Picker                  | no                              | sí             |
| Dropdown Menu (el disparador) | no                              | sí             |

**Causa.** La caja del Select pintaba el anillo con `has-[[role=combobox]:focus]`. Al elegir, el Select devuelve el foco al disparador desde el código, así que `:focus` se cumplía aunque se hubiera usado el ratón. Con `:focus-visible` tampoco basta: con buscador, el foco viene del campo de búsqueda, y el navegador marca como «visible» el foco que se mueve desde un campo de texto.

**Arreglo** (`select.ts`):

- La caja pinta el anillo con `data-focus-visible`.
- Ese atributo lo pone el **origen del foco** del `FocusMonitor` del cdk (`@angular/cdk/a11y`; el Select ya dependía de `@angular/cdk`). Se pinta si el origen es `keyboard` o `program`, como cuando Signal Forms lleva el foco al campo con error.
- Cuando el Select devuelve el foco él mismo (al elegir, al limpiar o al abrir sin buscador), usa `focusVia` con la última modalidad de entrada (`InputModalityDetector`): ratón o teclado.
- El error (`data-invalid`) se combina igual.

**Combobox, sin cambio.** Es un campo de texto: como Input, muestra el anillo mientras tiene el foco, también con el ratón. El navegador hace lo mismo con cualquier `<input>` de texto. Date Picker, Date Range, Color Picker y los menús ya usaban `:focus-visible` y lo hacían bien.

**Pruebas:**

- `select-focus-ring.spec.ts` (nuevo, 3 casos):
  - con el ratón, abrir y elegir deja el foco en el disparador **sin** `data-focus-visible`;
  - con el teclado, Tab y elegir con Enter lo dejan **con** él;
  - la caja ya no usa `:focus` para el anillo.
- Se actualizaron las clases esperadas en `select.spec.ts` y la razón de `focus-styles.spec.ts`.
- Select y focus-styles: 37 de 37 en verde.

**Después** (Playwright, claro y oscuro): **14 de 14 OK**. Select y Select con buscador quedan **sin anillo tras el ratón y con anillo con Tab**. El resto, igual que antes.
