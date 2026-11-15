import type { DocPage } from '../../../../doc-page/doc-page.types';
import { CardContentOnlyExample } from './examples/card-content-only.example';
import { CardCustomClassExample } from './examples/card-custom-class.example';
import { CardFormExample } from './examples/card-form.example';
import { CardPlanExample } from './examples/card-plan.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import contentOnlySource from './examples/card-content-only.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/card-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import formSource from './examples/card-form.example' with { loader: 'text' };
// @ts-expect-error
import planSource from './examples/card-plan.example' with { loader: 'text' };

/** La página de Card (tarea 2.5), con la plantilla de página (DP.2). */
export const CARD_PAGE: DocPage = {
  name: 'Card',
  lead: 'Contenedor para agrupar información y acciones relacionadas, con encabezado, contenido y pie opcionales.',
  demo: {
    id: 'demo',
    title: '',
    sentence: 'Un plan de precios: encabezado, contenido y un pie con dos acciones.',
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
      '    <mimi-card>',
      '      <mimi-card-header>',
      '        <mimi-card-title>Plan Equipo</mimi-card-title>',
      '        <mimi-card-description>Para equipos de hasta 10 personas.</mimi-card-description>',
      '      </mimi-card-header>',
      '      <mimi-card-content>…</mimi-card-content>',
      '      <mimi-card-footer>…</mimi-card-footer>',
      '    </mimi-card>',
      '  `,',
      '})',
      'export class PlanComponent {}',
    ].join('\n'),
    note: 'Todas las piezas son opcionales, salvo `<mimi-card>`. Se importan juntas con `MimiCardImports`.',
  },
  examples: {
    advanced: [
      {
        id: 'form',
        title: 'Con un formulario',
        sentence:
          'El `<form>` envuelve el contenido y el pie, así el botón del pie envía el formulario.',
        component: CardFormExample,
        source: formSource as string,
      },
      {
        id: 'content-only',
        title: 'Solo contenido',
        sentence:
          'Sin encabezado, el contenido suma espacio arriba para no quedar pegado al borde. Lo mismo pasa con el pie si va primero.',
        component: CardContentOnlyExample,
        source: contentOnlySource as string,
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
      '`<mimi-card-title>` es un encabezado para los lectores de pantalla (`role="heading"`), de nivel 3.',
      'Si en tu página le corresponde otro nivel, cámbialo con `level`: `<mimi-card-title [level]="2">`.',
      'Si prefieres tu propio `<h2>` o `<h3>`, úsalo en lugar de `<mimi-card-title>`, no dentro: el título se anunciaría dos veces.',
      'La tarjeta no tiene rol ni foco propios: los enlaces y botones de adentro se recorren con Tab como siempre.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'level (en el título)',
        type: 'number',
        default: '3',
        description: 'Nivel del encabezado (`aria-level`).',
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
        selector: 'mimi-card',
        description: 'Contenedor: fondo, borde, radio y sombra de la tarjeta.',
      },
      {
        name: 'MimiCardHeader',
        selector: 'mimi-card-header',
        description: 'Agrupa el título y la descripción.',
      },
      {
        name: 'MimiCardTitle',
        selector: 'mimi-card-title',
        description: 'Título, con `role="heading"` y `aria-level`.',
      },
      {
        name: 'MimiCardDescription',
        selector: 'mimi-card-description',
        description: 'Texto secundario bajo el título.',
      },
      {
        name: 'MimiCardContent',
        selector: 'mimi-card-content',
        description: 'Contenido principal.',
      },
      {
        name: 'MimiCardFooter',
        selector: 'mimi-card-footer',
        description: 'Acciones, alineadas a la derecha.',
      },
    ],
  },
  tokens: 'card',
};
