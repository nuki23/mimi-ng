import type { DocPage } from '../../../../doc-page/doc-page.types';
import { TextareaBasicExample } from './examples/textarea-basic.example';
import { TextareaStatesExample } from './examples/textarea-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/textarea-basic.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/textarea-states.example' with { loader: 'text' };

/** La página de Textarea (tarea 2.3), con la plantilla de página (DP.1). */
export const TEXTAREA_PAGE: DocPage = {
  name: 'Textarea',
  lead: 'Campo de texto de varias líneas sobre el `<textarea>` nativo: funciona con cualquier formulario y se pone en rojo solo con error.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Un `<label for>` nombra el campo y `rows` da el alto inicial; se puede estirar hacia abajo.',
    component: TextareaBasicExample,
    source: basicSource as string,
  },
  install: 'textarea',
  usage: {
    code: [
      "import { MimiTextarea } from '@/components/ui/textarea';",
      '',
      '@Component({',
      "  selector: 'app-feedback',",
      '  imports: [MimiTextarea],',
      '  template: `<textarea mimiTextarea rows="3" placeholder="Cuéntanos más"></textarea>`,',
      '})',
      'export class FeedbackComponent {}',
    ].join('\n'),
    note: 'Es una directiva sobre el elemento nativo. Para una sola línea, usa [Input](/docs/components/input).',
  },
  examples: {
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Deshabilitado, solo lectura y con error. Con un formulario el error sale solo; para una validación propia, usa `showError`.',
        component: TextareaStatesExample,
        source: statesSource as string,
      },
    ],
  },
  forms: 'textarea',
  accessibility: {
    points: [
      'Es el `<textarea>` nativo: el teclado, el foco, la selección y el lector funcionan como siempre.',
      'Nómbralo con un `<label for>`, `aria-label` o `aria-labelledby`; dentro de `mimi-form-field`, la etiqueta se enlaza sola.',
      'Con error, lleva `aria-invalid="true"`; el mensaje de `mimi-form-field` va en su `aria-describedby`.',
      'El rojo sale cuando el campo es inválido y ya se tocó o modificó, no al cargar la página.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description:
          'Letra y relleno, los de Input. Con `rows="1"`, el mismo alto que Input y Button.',
      },
      {
        name: 'showError',
        type: 'boolean | undefined',
        default: 'undefined',
        description:
          '`undefined`: decide el formulario. `true`: muestra el error. `false`: lo oculta aunque sea inválido.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases propias. Se mezclan con `cn()`: las tuyas ganan.',
      },
    ],
    parts: [
      {
        name: 'MimiTextarea (exportAs)',
        selector: '#campo="mimiTextarea"',
        description:
          '`fieldState`: `invalid`, `touched`, `dirty`, `disabled` y `showError`, como signals.',
      },
    ],
    dataAttributes: ['data-size', 'data-invalid', 'data-disabled'],
  },
  tokens: 'textarea',
};
