import type { DocPage } from '../../../../doc-page/doc-page.types';
import { SkeletonCardExample } from './examples/skeleton-card.example';
import { SkeletonCustomClassExample } from './examples/skeleton-custom-class.example';
import { SkeletonLoadingExample } from './examples/skeleton-loading.example';
import { SkeletonShapesExample } from './examples/skeleton-shapes.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import cardSource from './examples/skeleton-card.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/skeleton-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import loadingSource from './examples/skeleton-loading.example' with { loader: 'text' };
// @ts-expect-error
import shapesSource from './examples/skeleton-shapes.example' with { loader: 'text' };

/** La página de Skeleton (tarea 2.7), con la plantilla de página (DP.2). */
export const SKELETON_PAGE: DocPage = {
  name: 'Skeleton',
  lead: 'Bloque que late mientras el contenido carga, con el tamaño y la forma del contenido que va a reemplazar.',
  demo: {
    id: 'demo',
    title: '',
    sentence: 'Una tarjeta mientras carga: avatar, dos líneas, un párrafo y un botón.',
    component: SkeletonCardExample,
    source: cardSource as string,
  },
  install: 'skeleton',
  usage: {
    code: [
      "import { MimiSkeleton } from '@/components/ui/skeleton';",
      '',
      '@Component({',
      "  selector: 'app-perfil',",
      '  imports: [MimiSkeleton],',
      '  template: `',
      '    <div aria-busy="true">',
      '      <span class="sr-only">Cargando…</span>',
      '      <mimi-skeleton class="h-3 w-2/3" />',
      '    </div>',
      '  `,',
      '})',
      'export class PerfilComponent {}',
    ].join('\n'),
    note: 'El tamaño y la forma se ponen con `class`.',
  },
  examples: {
    advanced: [
      {
        id: 'shapes',
        title: 'Formas',
        sentence:
          'Por defecto, el radio de las líneas de texto. Para un avatar, `rounded-full`; para un botón, `rounded-lg` con la altura de los controles.',
        component: SkeletonShapesExample,
        source: shapesSource as string,
      },
      {
        id: 'loading',
        title: 'Mientras carga',
        sentence:
          'Pulsa «Recargar»: el skeleton ocupa el lugar del contenido y `aria-busy` cambia a la vez.',
        component: SkeletonLoadingExample,
        source: loadingSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          'Una imagen de portada con el radio de las tarjetas. Tus clases ganan; incluso `animate-none` lo deja quieto.',
        component: SkeletonCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Cada `mimi-skeleton` lleva `aria-hidden="true"`: no tiene nada que anunciar.',
      'Pon `aria-busy="true"` en el contenedor que carga y un texto para lectores de pantalla: `<span class="sr-only">Cargando…</span>`.',
      'Con movimiento reducido (`prefers-reduced-motion`) el bloque queda quieto.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'class',
        type: 'string',
        default: "''",
        description:
          'Tamaño y forma del bloque (`h-3 w-2/3`, `size-12 rounded-full`…). Se mezcla con `cn()`: las tuyas ganan.',
      },
    ],
  },
  tokens: 'skeleton',
};
