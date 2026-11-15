import type { DocPage } from '../../../../doc-page/doc-page.types';
import { TagsInputBasicExample } from './examples/tags-input-basic.example';
import { TagsInputCustomExample } from './examples/tags-input-custom.example';
import { TagsInputSeparatorsExample } from './examples/tags-input-separators.example';
import { TagsInputSizesExample } from './examples/tags-input-sizes.example';
import { TagsInputStatesExample } from './examples/tags-input-states.example';
import { TagsInputValidateExample } from './examples/tags-input-validate.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/tags-input-basic.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/tags-input-custom.example' with { loader: 'text' };
// @ts-expect-error
import separatorsSource from './examples/tags-input-separators.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/tags-input-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/tags-input-states.example' with { loader: 'text' };
// @ts-expect-error
import validateSource from './examples/tags-input-validate.example' with { loader: 'text' };

/** La página de Tags Input (tarea G2.6), con la plantilla de página (DP). */
export const TAGS_INPUT_PAGE: DocPage = {
  name: 'Tags Input',
  lead: 'Campo para varias etiquetas: se escriben, se ven como chips y se quitan con el teclado o el puntero.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Con un límite de 5: prueba con una etiqueta repetida o llega al máximo. La normalización (minúsculas y sin #) es del ejemplo.',
    component: TagsInputBasicExample,
    source: basicSource as string,
  },
  install: 'tags-input',
  usage: {
    code: [
      "import { MimiTagsInput } from '@/components/ui/tags-input';",
      '',
      '@Component({',
      '  imports: [MimiTagsInput],',
      '  template: `<mimi-tags-input aria-label="Etiquetas" [limit]="5" [(value)]="tags" />`,',
      '})',
      'export class ProjectComponent {',
      "  tags = signal(['angular']);",
      '}',
    ].join('\n'),
    note: 'Las etiquetas son los chips del [Combobox](/docs/components/combobox) múltiple. Lo escrito que no se agregó no es parte del valor.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`sm`, `md` y `lg` cambian el alto mínimo de la caja (32, 40 y 48 px); el texto queda en 14 px.',
        component: TagsInputSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence: 'Deshabilitado y solo lectura: los chips no tienen el botón de quitar.',
        component: TagsInputStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'validate',
        title: 'Validar cada etiqueta',
        sentence:
          'Con `validate`, una etiqueta que no pasa no se agrega y su mensaje aparece debajo. Prueba con «ana».',
        component: TagsInputValidateExample,
        source: validateSource as string,
      },
      {
        id: 'separators',
        title: 'Separadores propios',
        sentence:
          'Con `separators`, la coma, el punto y coma y el espacio agregan. Pegar «ana, luis, sol» agrega las tres.',
        component: TagsInputSeparatorsExample,
        source: separatorsSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence: 'Tus clases van a la caja y se mezclan con `cn()`: si chocan, ganan las tuyas.',
        component: TagsInputCustomExample,
        source: customSource as string,
      },
    ],
  },
  forms: 'tags-input',
  accessibility: {
    points: [
      'Enter o un separador agregan; Backspace con el campo vacío quita la última.',
      'Tab recorre el campo y los botones de quitar, que se nombran con la etiqueta: «Quitar angular».',
      'Al agregar o quitar, el lector lo anuncia («angular agregada»).',
      'El mensaje de debajo (ayuda, error o límite) es un `role="status"` y, con el contador, describe al campo.',
      'Al quitar con el botón, el foco vuelve al campo.',
      'Nómbralo con `aria-label`, `aria-labelledby` o un `<label for>` con `id`; con error, lleva `aria-invalid="true"`.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: 'string[]',
        default: '[]',
        description:
          'Las etiquetas. Admite `[(value)]`, `[formField]`, `formControlName` y `[(ngModel)]`.',
      },
      {
        name: 'limit',
        type: 'number',
        default: '—',
        description:
          'Máximo de etiquetas, con contador. Al llegar, el campo queda en solo lectura.',
      },
      {
        name: 'separators',
        type: 'string[]',
        default: "[',']",
        description: 'Caracteres que agregan la etiqueta al escribirlos (además de Enter).',
      },
      {
        name: 'normalize',
        type: '(tag) => string',
        default: 'quita espacios',
        description: 'Normaliza antes de agregar (por ejemplo, minúsculas).',
      },
      {
        name: 'validate',
        type: '(tag) => string | null',
        default: '—',
        description: 'Valida una etiqueta: el mensaje aparece debajo y no se agrega.',
      },
      {
        name: 'allowDuplicates',
        type: 'boolean',
        default: 'false',
        description: 'Permite etiquetas repetidas.',
      },
      {
        name: 'hint',
        type: 'string',
        default: 'la ayuda',
        description: 'Texto debajo del campo cuando no hay error ni límite.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Tamaño del control, con la misma escala que los demás campos.',
      },
      {
        name: 'placeholder / disabled / readonly / id / aria-label / aria-labelledby',
        type: '—',
        default: '—',
        description: 'Los del campo de texto.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases de la caja, mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    outputs: [
      {
        name: 'touch',
        type: 'void',
        description: 'Cuando el foco sale del control; el formulario lo marca como tocado.',
      },
    ],
    dataAttributes: [
      'data-state="filled|empty"',
      'data-size',
      'data-invalid',
      'data-full',
      'data-disabled',
      'data-readonly',
    ],
  },
  texts: [
    {
      constant: 'MIMI_TAGS_INPUT_TEXT_ES',
      provider: 'provideMimiTagsInputText',
      path: 'tags-input/tags-input-texts',
    },
    {
      constant: 'MIMI_CHIP_TEXT_ES',
      provider: 'provideMimiChipText',
      path: 'chip/chip-texts',
      note: '«Quitar …» y los anuncios',
    },
  ],
  tokens: ['tagsInput', 'chip'],
};
