# Historial del plan: Plataforma y experiencia (tareas hechas)

Texto exacto de `docs/plan.md` antes de la reorganización del 03/11/2026 (commit anterior: `cce6ee8`). No se edita: las tareas pendientes de esta sección siguen en `docs/plan.md`.

- [x] 5.7 Publicar `@mimi-ng/cli` en npm: hecha en la 0.1.0 (ver Lanzamiento 0.1.0).
- [x] 5.11 Cuando exista el componente Tabs (G1.9), reemplazar las pestañas hechas a mano de CodePreview e InstallCommand. Dato de la G1.9: los dos se usan solo en las páginas de componentes (lazy) y en `/dev/code`; ningún archivo del JS inicial contiene su código, así que usar Tabs sumaría 0 kB al JS inicial (el costo de aria Tabs iría a los chunks de esas páginas).
  - Hecho con `<mimi-tabs preserveContent>`: píldora en CodePreview (Copiar antes de las pestañas en el orden de Tab) y subrayado en `foreground` en InstallCommand, con las medidas de Tabs. El panel Código es diferido; el código se resalta por adelantado en tiempo libre (caché y `peek()` en `HighlighterService`) para que no aparezca sin colores. Se borró `tab-keys.ts`.
  - Arreglo en Tabs (ui-core): la fila y los paneles tenían `outline-none`, que en Tailwind 4 anula el `focus-visible:outline-2` (el anillo de foco del panel no se veía). Con prueba.
  - **Bundle:** JS inicial 326.31/102.64 → 326.27/102.64 kB (crudo/gzip; la diferencia son los nombres de los chunks). CSS global 109.43/16.46 → 108.84/16.39 kB. El chunk compartido de CodePreview pasa de 25.34/5.78 a 66.03/17.96 kB (entra aria Tabs): una página sin aria (Button) carga +40.91/+12.28 kB; las que ya usaban aria (Select, Dialog) +11.4/+2.0 kB; Tabs −3.68/−2.41 kB.
