import type { DocPage } from '../../../../doc-page/doc-page.types';
import { CardCustomClassExample } from './examples/card-custom-class.example';
import { CardFormExample } from './examples/card-form.example';
import { CardLinkExample } from './examples/card-link.example';
import { CardPlanExample } from './examples/card-plan.example';
import { CardSizesExample } from './examples/card-sizes.example';
import { CardSurfaceExample } from './examples/card-surface.example';
import { CardVariantsExample } from './examples/card-variants.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import customClassSource from './examples/card-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import formSource from './examples/card-form.example' with { loader: 'text' };
// @ts-expect-error
import linkSource from './examples/card-link.example' with { loader: 'text' };
// @ts-expect-error
import planSource from './examples/card-plan.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/card-sizes.example' with { loader: 'text' };
// @ts-expect-error
import surfaceSource from './examples/card-surface.example' with { loader: 'text' };
// @ts-expect-error
import variantsSource from './examples/card-variants.example' with { loader: 'text' };

/** La página de Card (tarea 2.5; superficie y piezas opcionales desde la R.19), con la plantilla. */
export const CARD_PAGE: DocPage = {
  name: 'Card',
  lead: 'Una superficie (fondo, borde, radio y sombra) para cualquier elemento, con piezas opcionales para el encabezado, el contenido y el pie.',
  demo: {
    id: 'demo',
    title: '',
    sentence: 'Un plan de precios: tu `<section>`, tu `<h3>` y un pie con dos acciones.',
    component: CardPlanExample,
    source: planSource as string,
  },
  install: 'card',
  usage: {
    code: [
      "import { MimiCardImports } from '@/components/ui/card';",
      '',
      '@Component({',
      "  selector: 'app-plan',",
      '  imports: [MimiCardImports],',
      '  template: `',
      '    <section mimiCard>',
      '      <header mimiCardHeader>',
      '        <h3 mimiCardTitle>Plan Equipo</h3>',
      '        <p mimiCardDescription>Para equipos de hasta 10 personas.</p>',
      '      </header>',
      '      <div mimiCardContent>…</div>',
      '      <footer mimiCardFooter>…</footer>',
      '    </section>',
      '  `,',
      '})',
      'export class PlanComponent {}',
    ].join('\n'),
    note: 'Las piezas son opcionales y van en tus elementos; sin ellas, `mimiCard` es solo la superficie.',
    more: {
      summary: 'Si vienes de la 0.6.0',
      items: [
        '`<mimi-card>` y sus piezas (`<mimi-card-header>`, `<mimi-card-title>`…) se quitaron en la 0.7.0: no compilan.',
        'Cambia cada elemento por su directiva en tu elemento: `<mimi-card>` → `<div mimiCard class="flex flex-col">`, `<mimi-card-title>` → `<h3 mimiCardTitle>`.',
        'Un solo relleno: `--mimi-card-padding-header`, `-content` y `-footer` (y sus claves del tema) se quitaron; usa `--mimi-card-padding` y `--mimi-card-gap`.',
      ],
    },
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          'Con `size`, el relleno de las piezas es de 16, 24 o 32 px, y los controles de dentro toman el mismo tamaño.',
        component: CardSizesExample,
        source: sizesSource as string,
      },
    ],
    variants: [
      {
        id: 'variants',
        title: 'Variantes',
        sentence:
          '`outline` (por defecto), `elevated`, `flat` y `ghost`: cambian el borde, la sombra y el fondo.',
        component: CardVariantsExample,
        source: variantsSource as string,
      },
    ],
    advanced: [
      {
        id: 'link',
        title: 'Un enlace o un botón entero',
        sentence:
          'Con `interactive`, la superficie de un `<a>` o un `<button>` tiene hover, foco visible y clic.',
        component: CardLinkExample,
        source: linkSource as string,
      },
      {
        id: 'form',
        title: 'Con un formulario',
        sentence:
          'El `<form>` es la tarjeta: las piezas quedan juntas y el botón del pie envía el formulario.',
        component: CardFormExample,
        source: formSource as string,
      },
      {
        id: 'surface',
        title: 'Solo la superficie',
        sentence: 'Sin piezas, en cada `<li>` de una lista: el relleno lo pones tú con `class`.',
        component: CardSurfaceExample,
        source: surfaceSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          'Una tarjeta destacada con el borde y la sombra del color primario, y otra sin sombra sobre fondo atenuado.',
        component: CardCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'El título es tu encabezado (`<h2>`, `<h3>`…): elige el nivel que le toca en tu página.',
      'La superficie no añade rol ni foco: un `<section>` o un `<li>` siguen siendo lo que son.',
      'Una tarjeta que se pulsa debe ser un `<a>` o un `<button>` con `interactive`, no un `<div>` con `(click)`.',
      'Para una tarjeta deshabilitada, usa `<button disabled>`: un `<a aria-disabled>` sigue enfocable y se abre con Enter.',
      'Con `interactive`, el foco se ve con el anillo del tema; Enter y Espacio son los del elemento nativo.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'variant',
        type: "'outline' | 'elevated' | 'flat' | 'ghost'",
        default: "'outline'",
        description: 'En `mimiCard`: el borde, la sombra y el fondo.',
      },
      {
        name: 'interactive',
        type: 'boolean',
        default: 'false',
        description: 'En `mimiCard` sobre un `<a>` o un `<button>`: hover, foco visible y clic.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description:
          'En `mimiCard`: el relleno de las piezas y el tamaño de los controles de dentro.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'En todas las piezas. Se mezcla con `cn()`: tus clases ganan.',
      },
    ],
    parts: [
      {
        name: 'MimiCard',
        selector: '[mimiCard]',
        description: 'La superficie: fondo, borde, radio y sombra, en cualquier elemento.',
      },
      {
        name: 'MimiCardHeader',
        selector: '[mimiCardHeader]',
        description: 'Agrupa el título y la descripción, en columna.',
      },
      {
        name: 'MimiCardTitle',
        selector: '[mimiCardTitle]',
        description: 'El aspecto del título, en tu encabezado.',
      },
      {
        name: 'MimiCardDescription',
        selector: '[mimiCardDescription]',
        description: 'Texto secundario bajo el título.',
      },
      {
        name: 'MimiCardContent',
        selector: '[mimiCardContent]',
        description: 'Contenido principal.',
      },
      {
        name: 'MimiCardFooter',
        selector: '[mimiCardFooter]',
        description: 'Acciones, alineadas al final.',
      },
    ],
    dataAttributes: ['data-variant', 'data-size', 'data-interactive', 'data-card-part'],
  },
  tokens: 'card',
};
