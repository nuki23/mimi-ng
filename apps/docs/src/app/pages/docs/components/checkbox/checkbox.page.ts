import type { ApiRow, DocPage } from '../../../../doc-page/doc-page.types';
import { CheckboxDemoExample } from './examples/checkbox-demo.example';
import { CheckboxSelectAllExample } from './examples/checkbox-select-all.example';
import { CheckboxSizesExample } from './examples/checkbox-sizes.example';
import { CheckboxStatesExample } from './examples/checkbox-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import demoSource from './examples/checkbox-demo.example' with { loader: 'text' };
// @ts-expect-error
import selectAllSource from './examples/checkbox-select-all.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/checkbox-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/checkbox-states.example' with { loader: 'text' };

const INPUTS: ApiRow[] = [
  {
    name: 'checked',
    type: 'boolean (model)',
    default: 'false',
    description: 'Marcada o no. Úsalo con `[(checked)]` o deja que lo maneje el formulario.',
  },
  {
    name: 'indeterminate',
    type: 'boolean (model)',
    default: 'false',
    description:
      'Estado mixto (`aria-checked="mixed"`): gana a `checked`. Al hacer clic se marca y deja de ser mixto.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md' (o el del contenedor con mimiSize)",
    description: 'Casilla de 14, 16 o 20 px, con el texto al tamaño de la escala.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Deshabilita el control. Con un formulario, lo pasa el formulario.',
  },
  {
    name: 'readonly',
    type: 'boolean',
    default: 'false',
    description: 'Solo lectura: se ve y se enfoca, pero no cambia.',
  },
  {
    name: 'id',
    type: 'string',
    default: 'automático',
    description: '`id` del botón interno, para nombrarlo con un `<label for>` externo.',
  },
  {
    name: 'aria-label, aria-labelledby',
    type: 'string',
    default: '—',
    description:
      'Nombre accesible cuando no hay texto ni etiqueta externa. Pasan al botón interno.',
  },
  {
    name: 'invalid, touched, dirty, required',
    type: 'boolean',
    default: 'false',
    description:
      'Los pasa el formulario. Con inválido y tocado o modificado, el control lleva `aria-invalid`.',
  },
  {
    name: 'class',
    type: 'string',
    default: "''",
    description: 'Clases del envoltorio (casilla y texto). Se mezclan con `cn()`: las tuyas ganan.',
  },
];

/** La página de Checkbox (R.3: página propia), con la plantilla de página (DP.1). */
export const CHECKBOX_PAGE: DocPage = {
  name: 'Checkbox',
  lead: 'Casilla para marcar una opción que se confirma después, como aceptar los términos al enviar un formulario.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Dos casillas con `[(checked)]`. Marca los términos: el botón se habilita al aceptarlos.',
    component: CheckboxDemoExample,
    source: demoSource as string,
  },
  install: 'checkbox',
  usage: {
    code: [
      "import { MimiCheckbox } from '@/components/ui/checkbox';",
      '',
      '@Component({',
      "  selector: 'app-registro',",
      '  imports: [MimiCheckbox],',
      '  template: `',
      '    <mimi-checkbox [(checked)]="recordarme">Recordarme</mimi-checkbox>',
      '    <mimi-checkbox size="sm" [(checked)]="acepto">Acepto los términos</mimi-checkbox>',
      '  `,',
      '})',
      'export class RegistroComponent {',
      '  readonly recordarme = signal(true);',
      '  readonly acepto = signal(false);',
      '}',
    ].join('\n'),
    note: 'El texto de adentro es la etiqueta. Para un ajuste que se aplica al instante, usa [Switch](/docs/components/switch).',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`sm`, `md` (por defecto) y `lg`. Para todo un formulario, ponlo una vez en el contenedor con `mimiSize`.',
        component: CheckboxSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Sin marcar, marcada, mixta, deshabilitada y solo lectura. Se alterna con Espacio; Enter no hace nada.',
        component: CheckboxStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'select-all',
        title: 'Seleccionar todo',
        sentence:
          'Con `indeterminate`, la casilla principal muestra un guion cuando solo algunas están marcadas. Haz clic en ella para marcarlas todas.',
        component: CheckboxSelectAllExample,
        source: selectAllSource as string,
      },
    ],
  },
  forms: 'checkbox',
  accessibility: {
    points: [
      'Es un `<button type="button">` con `role="checkbox"`: nunca envía el formulario que lo contiene.',
      '`aria-checked` vale `true`, `false` o `mixed`; la marca y el guion son decorativos.',
      'Tab llega a la casilla y Espacio la alterna; Enter no hace nada, como pide el patrón de casillas. Un clic en el texto también la alterna.',
      'Nómbrala con el texto de adentro, `aria-label`, `aria-labelledby` o un `<label for>` que apunte a su `id`.',
      'Con error lleva `aria-invalid`; con `required`, `aria-required`; con `readonly`, `aria-readonly`, y no cambia.',
      'Deshabilitada no recibe el foco. En solo lectura se enfoca, pero ni el clic ni el teclado la cambian.',
    ],
  },
  api: {
    inputs: INPUTS,
    outputs: [
      { name: 'checkedChange', type: 'boolean', description: 'El estado cambió.' },
      {
        name: 'indeterminateChange',
        type: 'boolean',
        description: 'Dejó de ser mixta al hacer clic (pasa a marcada).',
      },
      {
        name: 'touch',
        type: 'void',
        description: 'Al perder el foco. Lo usa el formulario para marcar el campo como tocado.',
      },
    ],
    dataAttributes: ['data-state', 'data-disabled', 'data-size'],
  },
  tokens: 'checkbox',
};
