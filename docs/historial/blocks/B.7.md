# B.7 `pricing-01`

[← Índice del plan](../../plan.md)

- [x] B.7 `pricing-01`: tres planes con un interruptor mensual/anual; el plan destacado con la insignia «Más popular». (07/11/2026; pendiente de comprobación manual: NVDA, Firefox y Safari, teléfono real y movimiento reducido en el sistema, a la M.20. Informe: `docs/auto/blocks-0.4.0-2026-11-06.md`, «B.7». API final: `<mimi-pricing-01 [plans] [(period)] [currency] [locale] [faqHref] (planSelected) class>`; tipos `Pricing01Plan` y `Pricing01Selection`.)
  - v0.4.0 · Tamaño M · Depende de: B.1 y los componentes que usa, publicados (2.1, 2.4, 2.5, G2.1) · Bloquea: B.P
  - Estado: —
  - Leer antes: B.1; la G2.1 Toggle Group en `docs/historial/grupo-2/G2.1.md` (modo simple, que no se deja sin elección); spec 4 (Card, Badge, Button, Toggle Group) y «Mimi Effects»; spec 6.6 (movimiento reducido); `docs/plan/mimi-effects.md` (E.7 Border Beam, sin versión).
  - Diseño: `Block pricing-01.dc.html` y su fila en `Mimi F6 Blocks.dc.html` («Componentes: Toggle Group, Card, Border Beam, Badge, Button»). Lo que muestra:
    - Cabecera centrada: insignia «14 días gratis en cualquier plan» (`sparkles`), `h1` de 48px (32px en móvil) «Planes que crecen contigo», subtítulo.
    - Interruptor Mensual/Anual (`role="radiogroup"` con dos `role="radio"` y un fondo que se desliza), «−17%» en Anual.
    - Tres tarjetas (una columna en móvil): nombre, descripción, precio («A medida» en el último), «por persona / mes», nota de facturación anual, botón (`primary` en la destacada, `card` en las otras) y lista de características con `check` (incluida) o `minus` (no incluida, en `muted-foreground`).
    - **La destacada lleva Border Beam** (un borde de 1,5px con `conic-gradient` de `info` y `success` que gira con `@keyframes mimi-beam` y la propiedad `@property --mimi-beam-a`), `shadow-popover` y la insignia «Más popular» (`star`).
    - Pie: «Precios en pesos mexicanos más IVA · Factura CFDI 4.0 incluida · Preguntas frecuentes».
  - Objetivo: una página de precios lista para adaptar, con el cambio de periodo accesible.
  - Alcance: incluye los planes como datos (entrada con valores por defecto), mensual/anual, precios con `Intl.NumberFormat`, la tarjeta destacada y el pie. NO incluye: el cobro ni el formulario de contacto del plan «A medida» (salida).
  - Base técnica: la de sus componentes; el interruptor es `mimi-toggle-group` en modo simple (patrón «Radio Group»/«Toolbar» que ya resuelve la G2.1).
  - Componentes que usa (`registryDependencies`): `toggle-group`, `card`, `badge`, `button`. **Border Beam (E.7) no está publicado ni tiene versión** (ver «Preguntas abiertas»).
  - API pública propuesta: `<mimi-pricing-01 [plans] [period] [currency] [locale] (planSelected) class>`; `period`: `model<'monthly' | 'yearly'>`; `plans`: `MimiPricing01Plan[]` (`name`, `description`, `monthly`, `yearly`, `featured`, `cta`, `features: { label, included }[]`), con los tres del diseño por defecto; `planSelected` sale con el plan y el periodo.
  - Formularios: no aplica (el interruptor no es un campo de formulario aquí; se enlaza con `[(value)]`).
  - Tokens: sin tokens propios. Si se decide (b) abajo, `mimi-beam` y `--mimi-beam-a` entran en el CSS del Block, no en el tema.
  - Teclado y accesibilidad: el interruptor con su nombre («Periodo de facturación») y las flechas de Toggle Group; «−17%» dentro del texto del botón Anual (se lee); cada tarjeta es una región con su nombre (`aria-labelledby` al nombre del plan); la lista de características dice «incluido» o «no incluido» en texto para lectores (el ícono es `aria-hidden`); el precio cambia con el periodo sin anunciarse (el cambio lo provocó el usuario). Movimiento reducido: sin el giro del borde.
  - Ejemplos del showcase: vista previa escritorio y móvil, claro y oscuro, mensual y anual.
  - CLI: ítem `pricing-01` de tipo `block`; sin dependencias de npm.
  - Textos: en el idioma de B.1-i; el pie del diseño (pesos mexicanos, CFDI) es de un país: se cambia por un texto neutro («Prices in USD, taxes not included» o el equivalente) y se anota en D6.
  - Trampas conocidas:
    - `@property` no funciona en todos los navegadores de la misma forma (Firefox lo soporta desde la 128): sin él, el borde no gira pero se ve; comprobar en Firefox y Safari.
    - El fondo deslizante del interruptor del diseño es de Toggle Group (`data-fx`): usar el componente, no copiar el marcado.
    - Precios con decimales y miles según el idioma (`Intl.NumberFormat`), no con `toLocaleString('es-MX')` fijo.
    - Las tres tarjetas a la misma altura en escritorio (grilla con `items-stretch`) aunque tengan distinto número de características.
  - Criterios de hecho:
    - El Block en ui-core, en el registro y en el sitio.
    - Pruebas: cambiar de periodo cambia los precios y la nota anual; `planSelected` con el plan y el periodo; plan «A medida» sin precio; formato con otro `locale`; movimiento reducido sin animación; `class`.
    - `ng g mimi pricing-01` en un proyecto limpio.
    - CSS global y JS inicial, crudo y gzip, antes y después.
    - D6: el borde destacado (según la decisión) y el pie de precios.
    - `pnpm build`, `pnpm test` y `pnpm format:check` en verde.
    - Manual (a la M.20): NVDA (interruptor y características incluidas o no); Firefox y Safari (el borde); teléfono real; movimiento reducido en el sistema.
  - Preguntas abiertas:
    - Decidido por el usuario (07/11/2026: adopta la recomendación; era PENDIENTE DE DECIDIR) (B.7-a): el Border Beam de la tarjeta destacada depende de Mimi Effects (E.7, sin versión), que todavía no existe. (a) **Borde estático** en la 0.4.0: 1,5px con el mismo `conic-gradient` de `info` y `success` pero quieto (o un borde `primary`), con `shadow-popover` y la insignia; cuando exista E.7, el sitio muestra cómo cambiarlo por el Border Beam. (b) Escribir el giro dentro del Block (`@keyframes mimi-beam` y `@property --mimi-beam-a` en el CSS del Block, con movimiento reducido), como lo dibuja el diseño. (c) Pasar `pricing-01` a la versión de Mimi Effects. **Recomendación: (a)**: la 0.4.0 no depende de nada posterior y el Block no adelanta una API de Effects que después cambie; (b) se puede hacer igual sin dependencia si prefieres el giro ya.
