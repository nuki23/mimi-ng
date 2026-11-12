# Refinamiento 0.6.0, séptima tanda (rama `auto/refinamiento-0.6.0-2026-11-09`)

[← Parte 6](refinamiento-0.6.0-parte6-2026-11-12.md)

Encargo (12/11/2026), en dos partes: **A**, cuatro arreglos tras la revisión del sitio (un commit cada uno, con pruebas y Playwright); **B**, solo el plan de una plantilla común para las páginas de componentes, con la auditoría de todas. Además, respuesta a las dudas de la sexta tanda: un ejemplo de `[options]` por página queda así, y `compareWith` acepta cualquier texto pero **avisa en desarrollo** si el campo no existe. **No se subió la versión ni se publicó nada.** Node 24.18.0.

## 0. `compareWith`: aviso en desarrollo si el campo no existe

- `mimiCompareFn` (`option-list.ts`): con un nombre de campo, si el valor elegido es un objeto sin ese campo, `console.warn` **una vez** por componente (`[Mimi] compareWith="ID": el valor no tiene el campo «ID»…`). Fuera de `isDevMode()` no avisa. Con valores sueltos (texto, número) no avisa: se comparan con `Object.is`.
- Pruebas (`compare-with.spec.ts`, +2): avisa una sola vez y no avisa con el campo correcto ni con valores sueltos; Select y Combobox con `compareWith="ID"` avisan una vez cada uno. 6 de 6 en verde.
