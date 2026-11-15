import type { DocPage } from '../../../../doc-page/doc-page.types';
import { BadgeCustomClassExample } from './examples/badge-custom-class.example';
import { BadgeDemoExample } from './examples/badge-demo.example';
import { BadgeMatrixExample } from './examples/badge-matrix.example';
import { BadgeVariantsExample } from './examples/badge-variants.example';
import { BadgeWithIconExample } from './examples/badge-with-icon.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import customClassSource from './examples/badge-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import demoSource from './examples/badge-demo.example' with { loader: 'text' };
// @ts-expect-error
import matrixSource from './examples/badge-matrix.example' with { loader: 'text' };
// @ts-expect-error
import variantsSource from './examples/badge-variants.example' with { loader: 'text' };
// @ts-expect-error
import withIconSource from './examples/badge-with-icon.example' with { loader: 'text' };

/** La página de Badge (tarea 2.4), con la plantilla de página (DP.2). */
export const BADGE_PAGE: DocPage = {
  name: 'Badge',
  lead: 'Etiqueta corta para estados, categorías o conteos, en tres variantes y seis tonos, sobre el `<span>` nativo.',
  demo: {
    id: 'demo',
    title: '',
    sentence: 'El estado de cada pedido de una lista, con `variant="soft"` y un tono por estado.',
    component: BadgeDemoExample,
    source: demoSource as string,
  },
  install: 'badge',
  usage: {
    code: [
      "import { MimiBadge } from '@/components/ui/badge';",
      '',
      '@Component({',
      "  selector: 'app-plan',",
      '  imports: [MimiBadge],',
      '  template: `<span mimiBadge tone="success">Nuevo</span>`,',
      '})',
      'export class PlanComponent {}',
    ].join('\n'),
    note: 'Es una directiva sobre el `<span>` nativo: `span[mimiBadge]`.',
  },
  examples: {
    variants: [
      {
        id: 'variants',
        title: 'Variantes',
        sentence:
          '`variant` elige cómo se ve y `tone`, el color. `outline` con tono lleva un punto de ese color; sin `tone` es neutro.',
        component: BadgeVariantsExample,
        source: variantsSource as string,
        more: {
          id: 'matrix',
          title: 'Ver la matriz variante × tono',
          sentence: 'Las tres variantes con los seis tonos.',
          component: BadgeMatrixExample,
          source: matrixSource as string,
        },
      },
    ],
    advanced: [
      {
        id: 'with-icon',
        title: 'Con ícono',
        sentence:
          'Los íconos que pongas dentro se dimensionan solos a 12 px, el tamaño de la letra, y no se deforman.',
        component: BadgeWithIconExample,
        source: withIconSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          'Un contador: ancho mínimo, texto centrado y números del mismo ancho. Tus clases ganan a las del componente.',
        component: BadgeCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Es un `<span>` sin rol ni foco: los lectores de pantalla leen su texto junto con lo que lo rodea.',
      'El color no basta: el texto tiene que nombrar el estado («Activo», «Error»). El punto de `outline` es decorativo y no se lee.',
      'Un contador con solo un número necesita contexto: ponlo junto a su etiqueta, como «Notificaciones 12».',
      'No es interactivo: para etiquetas que se pueden quitar, usa [Tags Input](/docs/components/tags-input).',
    ],
  },
  api: {
    inputs: [
      {
        name: 'variant',
        type: "'solid' | 'soft' | 'outline'",
        default: "'solid'",
        description: 'Cómo se ve.',
      },
      {
        name: 'tone',
        type: "'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger'",
        default: 'tono natural',
        description:
          'De qué color es. Sin `tone`, `outline` usa `secondary` (neutro, sin punto); `solid` y `soft`, `primary`.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Alto de 18, 22 o 26 px, según la escala del tema.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases propias, mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    dataAttributes: ['data-variant', 'data-tone', 'data-size'],
  },
  tokens: 'badge',
};
