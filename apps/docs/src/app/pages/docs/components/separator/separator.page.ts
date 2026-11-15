import type { DocPage } from '../../../../doc-page/doc-page.types';
import { SeparatorCustomClassExample } from './examples/separator-custom-class.example';
import { SeparatorHorizontalExample } from './examples/separator-horizontal.example';
import { SeparatorSemanticExample } from './examples/separator-semantic.example';
import { SeparatorVerticalExample } from './examples/separator-vertical.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import customClassSource from './examples/separator-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import horizontalSource from './examples/separator-horizontal.example' with { loader: 'text' };
// @ts-expect-error
import semanticSource from './examples/separator-semantic.example' with { loader: 'text' };
// @ts-expect-error
import verticalSource from './examples/separator-vertical.example' with { loader: 'text' };

/** La página de Separator (tarea 2.6), con la plantilla de página (DP.2). */
export const SEPARATOR_PAGE: DocPage = {
  name: 'Separator',
  lead: 'Línea de 1 px para separar contenido, en horizontal o en vertical, solo visual o anunciada a los lectores de pantalla.',
  demo: {
    id: 'demo',
    title: '',
    sentence: 'Entre un título y su texto: la línea horizontal ocupa todo el ancho del contenedor.',
    component: SeparatorHorizontalExample,
    source: horizontalSource as string,
  },
  install: 'separator',
  usage: {
    code: [
      "import { MimiSeparator } from '@/components/ui/separator';",
      '',
      '@Component({',
      "  selector: 'app-perfil',",
      '  imports: [MimiSeparator],',
      '  template: `',
      '    <h2>Perfil</h2>',
      '    <mimi-separator />',
      '    <p>Tus datos públicos.</p>',
      '  `,',
      '})',
      'export class PerfilComponent {}',
    ].join('\n'),
  },
  examples: {
    advanced: [
      {
        id: 'vertical',
        title: 'Vertical',
        sentence:
          'Toma el alto de su fila: el contenedor necesita `flex` y un alto (aquí, `h-5`). Fuera de una fila flex no se ve.',
        component: SeparatorVerticalExample,
        source: verticalSource as string,
      },
      {
        id: 'semantic',
        title: 'Semántico',
        sentence:
          'Con `decorative="false"` los lectores de pantalla anuncian la línea. Aquí divide dos grupos de acciones.',
        component: SeparatorSemanticExample,
        source: semanticSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          'Un acento bajo un título: más grueso, corto, redondeado y del color primario. Tus clases ganan.',
        component: SeparatorCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Por defecto es decorativa (`role="none"`): los lectores de pantalla no la anuncian. No recibe el foco.',
      'Decorativa es lo común: entre secciones con título, entre enlaces o dentro de una tarjeta, anunciarla solo agrega ruido.',
      'Con `decorative="false"` lleva `role="separator"` y `aria-orientation`: úsala para grupos con significado que no se distinguen de otra forma.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description:
          'Dirección de la línea. La vertical toma el alto de su fila: el contenedor necesita `flex`.',
      },
      {
        name: 'decorative',
        type: 'boolean',
        default: 'true',
        description:
          'Solo visual (`role="none"`). En `false`, `role="separator"` con `aria-orientation`.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases propias, mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    dataAttributes: ['data-orientation'],
  },
  tokens: 'separator',
};
