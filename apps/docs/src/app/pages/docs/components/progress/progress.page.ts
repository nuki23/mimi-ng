import type { DocPage } from '../../../../doc-page/doc-page.types';
import { ProgressBarExample } from './examples/progress-bar.example';
import { ProgressCircleExample } from './examples/progress-circle.example';
import { ProgressCustomExample } from './examples/progress-custom.example';
import { ProgressIndeterminateExample } from './examples/progress-indeterminate.example';
import { ProgressTonesExample } from './examples/progress-tones.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import barSource from './examples/progress-bar.example' with { loader: 'text' };
// @ts-expect-error
import circleSource from './examples/progress-circle.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/progress-custom.example' with { loader: 'text' };
// @ts-expect-error
import indeterminateSource from './examples/progress-indeterminate.example' with { loader: 'text' };
// @ts-expect-error
import tonesSource from './examples/progress-tones.example' with { loader: 'text' };

/** La página de Progress (tarea G2.10), con la plantilla de página (DP.2). */
export const PROGRESS_PAGE: DocPage = {
  name: 'Progress',
  lead: 'Indicador del avance de una tarea, determinado o indeterminado, en barra o en círculo y en cinco tonos.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Una subida: el texto y el porcentaje son tuyos y la barra los toma como nombre con `aria-labelledby`. Prueba los botones.',
    component: ProgressBarExample,
    source: barSource as string,
  },
  install: 'progress',
  usage: {
    code: [
      "import { MimiProgress } from '@/components/ui/progress';",
      '',
      '@Component({',
      "  selector: 'app-upload',",
      '  imports: [MimiProgress],',
      '  template: `',
      '    <mimi-progress aria-label="Subiendo informe.pdf" [value]="progress()" />',
      '  `,',
      '})',
      'export class UploadComponent {',
      '  progress = signal(64);',
      '}',
    ].join('\n'),
    note: 'Necesita un nombre: `aria-label` o `aria-labelledby`. Sin `value`, es indeterminado.',
  },
  examples: {
    variants: [
      {
        id: 'tones',
        title: 'Tonos',
        sentence:
          '`tone` elige el color de la parte llena: `primary`, `success`, `warning`, `info` o `danger`.',
        component: ProgressTonesExample,
        source: tonesSource as string,
      },
    ],
    states: [
      {
        id: 'indeterminate',
        title: 'Indeterminada',
        sentence:
          'Sin `value`, un tramo cruza la barra. Con «reducir movimiento», la barra late en lugar de desplazarse.',
        component: ProgressIndeterminateExample,
        source: indeterminateSource as string,
      },
    ],
    advanced: [
      {
        id: 'circle',
        title: 'Círculo',
        sentence:
          '`shape="circle"` muestra el valor dentro; `size="sm"` mide 44 px. El indeterminado gira (con «reducir movimiento», late).',
        component: ProgressCircleExample,
        source: circleSource as string,
      },
    ],
    custom: [
      {
        id: 'custom',
        title: 'Personalizar con class',
        sentence:
          '`class` va al elemento con el rol (la pista o el círculo) y gana. Con `max`, cualquier escala: 7 de 12.',
        component: ProgressCustomExample,
        source: customSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      '`role="progressbar"` con `aria-valuemin`, `aria-valuemax` y, si es determinado, `aria-valuenow`; el indeterminado lleva `aria-busy="true"`.',
      'No recibe el foco. En desarrollo avisa si no tiene `aria-label` ni `aria-labelledby`.',
      'No anuncia los cambios: el lector lee el valor cuando llega a la barra. Si la tarea termina o falla, avísalo tú, por ejemplo con un [Toast](/docs/components/toast).',
      'Con «reducir movimiento», el indeterminado late y el avance no se anima.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'aria-label / aria-labelledby',
        type: 'string',
        default: '—',
        description: 'Nombre de la barra (obligatorio: en desarrollo avisa si falta).',
      },
      {
        name: 'value',
        type: 'number | null',
        default: 'undefined',
        description: 'El avance, entre 0 y `max` (se acota). Sin valor o `null`: indeterminado.',
      },
      {
        name: 'max',
        type: 'number',
        default: '100',
        description: 'El total. Un valor no válido (0 o negativo) cuenta como 100.',
      },
      {
        name: 'tone',
        type: "'primary' | 'success' | 'warning' | 'info' | 'danger'",
        default: "'primary'",
        description: 'Color de la parte llena.',
      },
      {
        name: 'shape',
        type: "'bar' | 'circle'",
        default: "'bar'",
        description: 'Barra o círculo (el círculo muestra el valor dentro).',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'Círculo: 44, 76 o 96 px. Barra: 4, 8 o 12 px de alto.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description:
          'Clases del elemento con el rol (la pista o el círculo), mezcladas con `cn()`: tus clases ganan.',
      },
    ],
    dataAttributes: ['data-state', 'data-tone', 'data-shape', 'data-size'],
  },
  tokens: 'progress',
};
