import type { DocPage } from '../../../../doc-page/doc-page.types';
import { LoadingBlockExample } from './examples/loading-block.example';
import { LoadingSizesExample } from './examples/loading-sizes.example';
import { LoadingViewExample } from './examples/loading-view.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import blockSource from './examples/loading-block.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/loading-sizes.example' with { loader: 'text' };
// @ts-expect-error
import viewSource from './examples/loading-view.example' with { loader: 'text' };

/** La página de Loading (R.23), con la plantilla de página. */
export const LOADING_PAGE: DocPage = {
  name: 'Loading',
  lead: 'Una capa de carga para toda la vista o para un contenedor: lo de debajo no se puede pulsar ni enfocar, y se anuncia.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Pulsa «Guardar el informe»: la capa cubre la página mientras dura, y el foco vuelve al botón al terminar.',
    component: LoadingViewExample,
    source: viewSource as string,
  },
  install: 'loading',
  usage: {
    code: [
      "import { MimiBlock, injectMimiLoading } from '@/components/ui/loading';",
      '',
      '@Component({',
      '  imports: [MimiBlock],',
      '  template: `<section [mimiBlock]="saving()" mimiBlockMessage="Guardando…">…</section>`,',
      '})',
      'export class ProfileComponent {',
      '  private readonly loading = injectMimiLoading();',
      '  async save() {',
      "    const ref = this.loading.show('Guardando…');",
      '    await this.api.save();',
      '    ref.hide();',
      '  }',
      '}',
    ].join('\n'),
    note: 'Si dura menos de 200 ms no aparece, y una vez visible se queda al menos 400 ms: no parpadea.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          'Con `mimiBlockSize` o `size` en `show()`: el anillo y el mensaje en `sm`, `md` o `lg`.',
        component: LoadingSizesExample,
        source: sizesSource as string,
      },
    ],
    advanced: [
      {
        id: 'block',
        title: 'Cargar una tarjeta',
        sentence:
          'Con `[mimiBlock]`, la capa cubre solo ese elemento: lo de dentro queda inerte y lo demás de la página sigue igual.',
        component: LoadingBlockExample,
        source: blockSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Lo que queda debajo lleva `inert` y `aria-busy`: no se enfoca, no se pulsa y los lectores saben que está cargando.',
      'El mensaje se anuncia al empezar y «Listo.» al terminar, con `LiveAnnouncer` (la capa misma es `aria-hidden`).',
      'El foco vuelve al control que lo tenía cuando la capa se va.',
      'Con «reducir movimiento», el anillo no gira; el mensaje se ve siempre.',
      'No es un diálogo: no atrapa el foco. Para pedir algo al usuario, usa Dialog o Confirm.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'mimiBlock',
        type: 'boolean',
        default: 'false',
        description: 'En el contenedor: muestra la capa mientras vale `true`.',
      },
      {
        name: 'mimiBlockMessage',
        type: 'string',
        default: "'Loading…'",
        description: 'El mensaje y lo que se anuncia.',
      },
      {
        name: 'mimiBlockDelay / mimiBlockMinDuration',
        type: 'number',
        default: '200 / 400',
        description: 'Las esperas en ms (las de `provideMimiLoading`).',
      },
      {
        name: 'mimiBlockSize',
        type: "'sm' | 'md' | 'lg'",
        default: "'md'",
        description: 'El tamaño del anillo y del texto.',
      },
    ],
    parts: [
      {
        name: 'MimiBlock',
        selector: '[mimiBlock]',
        description: 'La carga de un contenedor (si es `static`, se le pone `relative`).',
      },
    ],
    service: [
      {
        name: 'injectMimiLoading().show(message?, options?)',
        type: 'MimiLoadingRef',
        description:
          'Empieza una carga de toda la vista, ligada a tu componente: `hide()` y `update(message)`.',
      },
      {
        name: 'MimiLoadingService.show / hideAll',
        type: 'MimiLoadingRef / void',
        description: 'El servicio global, con contador: la capa sigue hasta el último `hide()`.',
      },
      {
        name: 'provideMimiLoading(options)',
        type: 'Provider',
        description: '`delay`, `minDuration` y `size` por defecto para toda la app.',
      },
    ],
    dataAttributes: ['data-size (en la capa)', 'aria-busy e inert (en lo bloqueado)'],
  },
  texts: [
    {
      constant: 'MIMI_LOADING_TEXT_ES',
      provider: 'provideMimiLoadingText',
      path: 'loading/loading-texts',
    },
  ],
  tokens: 'loading',
};
