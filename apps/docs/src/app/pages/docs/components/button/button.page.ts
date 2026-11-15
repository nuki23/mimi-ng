import type { DocPage } from '../../../../doc-page/doc-page.types';
import { ButtonAsLinkExample } from './examples/button-as-link.example';
import { ButtonCustomClassExample } from './examples/button-custom-class.example';
import { ButtonDemoExample } from './examples/button-demo.example';
import { ButtonMatrixExample } from './examples/button-matrix.example';
import { ButtonSizesExample } from './examples/button-sizes.example';
import { ButtonStatesExample } from './examples/button-states.example';
import { ButtonVariantsExample } from './examples/button-variants.example';
import { ButtonWithIconExample } from './examples/button-with-icon.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import asLinkSource from './examples/button-as-link.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/button-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import demoSource from './examples/button-demo.example' with { loader: 'text' };
// @ts-expect-error
import matrixSource from './examples/button-matrix.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/button-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/button-states.example' with { loader: 'text' };
// @ts-expect-error
import variantsSource from './examples/button-variants.example' with { loader: 'text' };
// @ts-expect-error
import withIconSource from './examples/button-with-icon.example' with { loader: 'text' };

/** La página de Button (tarea 2.1), con la plantilla de página (DP.0, piloto). */
export const BUTTON_PAGE: DocPage = {
  name: 'Button',
  lead: 'Botón para las acciones y los enlaces de una página, en cinco variantes, seis tonos y tres tamaños.',
  demo: {
    id: 'demo',
    title: '',
    sentence: 'Las acciones de un formulario. Pulsa «Guardar» para ver el estado de carga.',
    component: ButtonDemoExample,
    source: demoSource as string,
  },
  install: 'button',
  usage: {
    code: [
      "import { MimiButton } from '@/components/ui/button';",
      '',
      '@Component({',
      "  selector: 'app-save',",
      '  imports: [MimiButton],',
      '  template: `<button mimiBtn>Guardar</button>`,',
      '})',
      'export class SaveComponent {}',
    ].join('\n'),
    note: 'Funciona sobre `<button>` y `<a>`: conserva lo que ya hace el elemento (formularios, teclado y foco).',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`sm`, `md` y `lg`. `icon` es cuadrado: dale un `aria-label`, porque no tiene texto.',
        component: ButtonSizesExample,
        source: sizesSource as string,
      },
    ],
    variants: [
      {
        id: 'variants',
        title: 'Variantes',
        sentence:
          '`variant` elige cómo se ve y `tone`, el color. Sin `tone`, `outline` y `ghost` son neutros; las demás usan `primary`.',
        component: ButtonVariantsExample,
        source: variantsSource as string,
        more: {
          id: 'matrix',
          title: 'Ver la matriz variante × tono',
          sentence: 'Las cinco variantes con los seis tonos.',
          component: ButtonMatrixExample,
          source: matrixSource as string,
        },
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Deshabilitado y cargando. Pulsa «Guardar»: muestra un spinner y queda deshabilitado, sin cambiar de ancho.',
        component: ButtonStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'with-icon',
        title: 'Con ícono',
        sentence:
          'Los íconos que pongas dentro se dimensionan solos a 16 px. En la documentación usamos `@lucide/angular`.',
        component: ButtonWithIconExample,
        source: withIconSource as string,
      },
      {
        id: 'as-link',
        title: 'Como enlace',
        sentence:
          'Sobre un `<a>`, `disabled` pone `aria-disabled`, lo saca del orden de tabulación y cancela el clic.',
        component: ButtonAsLinkExample,
        source: asLinkSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          'Tus clases se mezclan con las del componente usando `cn()`: si chocan, ganan las tuyas.',
        component: ButtonCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Es el elemento nativo: Enter y Espacio activan un `<button>`, Enter sigue un `<a>` y el foco se ve con un anillo.',
      '`disabled` usa el atributo nativo en `<button>`; en `<a>`, pone `aria-disabled`, lo saca del orden de tabulación y cancela el clic.',
      'Con `loading` queda deshabilitado y lleva `aria-busy` mientras carga.',
      'Un botón `size="icon"` no tiene texto: dale un `aria-label`.',
    ],
    more: [
      'Para un botón deshabilitado que siga enfocable (por ejemplo, para no perder el foco cuando se deshabilita estando enfocado), usa `[attr.aria-disabled]` en vez de `disabled`: se ve deshabilitado y no recibe clics del puntero, pero Enter y Espacio siguen llegando a tu `(click)`, así que revisa el estado ahí.',
      'Button conserva tu `aria-disabled`, tu `tabindex` y tu `aria-busy`: solo los cambia mientras los necesita (un enlace deshabilitado o cargando).',
    ],
  },
  api: {
    inputs: [
      {
        name: 'variant',
        type: "'solid' | 'soft' | 'outline' | 'ghost' | 'link'",
        default: "'solid'",
        description: 'Cómo se ve.',
      },
      {
        name: 'tone',
        type: "'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger'",
        default: 'tono natural',
        description:
          'De qué color es. Sin `tone`, `outline` y `ghost` usan `secondary`; las demás, `primary`.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg' | 'icon'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Tamaño. `icon` es cuadrado y necesita `aria-label`.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description:
          'Deshabilita: `disabled` nativo en `<button>`; `aria-disabled` y `tabindex="-1"` en `<a>`.',
      },
      {
        name: 'loading',
        type: 'boolean',
        default: 'false',
        description: 'Muestra el spinner, deshabilita y agrega `aria-busy`. No cambia el ancho.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases propias, mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    dataAttributes: ['data-variant', 'data-tone', 'data-size', 'data-loading', 'data-disabled'],
  },
  tokens: 'button',
};
