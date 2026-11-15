import type { DocPage } from '../../../../doc-page/doc-page.types';
import { NumberInputBasicExample } from './examples/number-input-basic.example';
import { NumberInputCustomExample } from './examples/number-input-custom.example';
import { NumberInputSizesExample } from './examples/number-input-sizes.example';
import { NumberInputStatesExample } from './examples/number-input-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/number-input-basic.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/number-input-custom.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/number-input-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/number-input-states.example' with { loader: 'text' };

/** La página de Number Input (tarea G2.2), con la plantilla de página (DP). */
export const NUMBER_INPUT_PAGE: DocPage = {
  name: 'Number Input',
  lead: 'Campo numérico con botones − y +, límites y el formato del idioma: moneda, decimales o unidades.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Cantidad, peso y precio: con el foco se ve el número sin formato; al salir, se redondea al paso y se formatea.',
    component: NumberInputBasicExample,
    source: basicSource as string,
  },
  install: 'number-input',
  usage: {
    code: [
      "import { MimiNumberInput } from '@/components/ui/number-input';",
      '',
      '@Component({',
      '  imports: [MimiNumberInput],',
      '  template: `',
      '    <mimi-number-input aria-label="Cantidad" [(value)]="qty" [min]="0" [max]="10" />',
      '  `,',
      '})',
      'export class CartComponent {',
      '  qty = signal<number | null>(1);',
      '}',
    ].join('\n'),
    note: 'El formato usa `Intl.NumberFormat` del navegador, sin dependencias. Lo escrito se lee con los separadores del idioma: «1.250,5» en `es-ES`.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`size` cambia el alto de la caja: 32, 40 o 48 px, alineada con Input y Button. El texto sigue en 14 px.',
        component: NumberInputSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence: 'Deshabilitado, solo lectura y vacío: sin número, el valor es `null`.',
        component: NumberInputStatesExample,
        source: statesSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          'Tus clases se mezclan con las de la caja usando `cn()`: aquí, más angosta, más alta y redonda.',
        component: NumberInputCustomExample,
        source: customSource as string,
      },
    ],
  },
  forms: 'number-input',
  accessibility: {
    points: [
      'El campo tiene `role="spinbutton"` con `aria-valuenow`, los límites y `aria-valuetext` con el número formateado: el lector dice «$1,250.00», no «1250».',
      '↑ y ↓ suman o restan un paso; Re Pág y Av Pág, diez; Inicio y Fin van a los límites; Enter confirma lo escrito.',
      '− y + son para el puntero (no son paradas de Tab): mantenerlos pulsados repite. La rueda del mouse no cambia el valor.',
      'En los límites, − y + llevan `aria-disabled`: así el foco nunca se pierde.',
      'Nómbralo con `aria-label`, `aria-labelledby` o un `<label for>` con `id`; el nombre también nombra los botones: «Disminuir Cantidad».',
      'Con error, el campo lleva `aria-invalid="true"`; dentro de `mimi-form-field`, el mensaje va en su `aria-describedby`.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: 'number | null',
        default: 'null',
        description:
          'El número; vacío es `null`. Admite `[(value)]`, `[formField]`, `formControlName` y `[(ngModel)]`.',
      },
      {
        name: 'min / max',
        type: 'number',
        default: '—',
        description:
          'Límites (también desde el formulario). Un valor fuera de rango se pinta acotado sin cambiar el modelo.',
      },
      {
        name: 'step',
        type: 'number',
        default: '1',
        description: 'Paso de ↑/↓ y de − y +; al salir del campo, el valor se redondea a él.',
      },
      {
        name: 'format',
        type: 'Intl.NumberFormatOptions',
        default: '—',
        description: 'Formato sin el foco: moneda, decimales, unidad, porcentaje…',
      },
      {
        name: 'locale',
        type: 'string',
        default: 'LOCALE_ID',
        description: 'Idioma del formato y de la lectura (separadores de miles y decimales).',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: "''",
        description: 'Texto con el campo vacío.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Tamaño del control, con la misma escala que los demás campos.',
      },
      {
        name: 'aria-label / aria-labelledby',
        type: 'string',
        default: '—',
        description: 'Nombre del campo; también nombra los botones: «Disminuir Cantidad».',
      },
      {
        name: 'id',
        type: 'string',
        default: '—',
        description: '`id` del campo, para un `<label for>`.',
      },
      {
        name: 'disabled / readonly',
        type: 'boolean',
        default: 'false',
        description: 'Deshabilitado o solo lectura.',
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
        description: 'Cuando el foco sale de la caja; el formulario lo marca como tocado.',
      },
    ],
    dataAttributes: [
      'data-state="editing|idle"',
      'data-size',
      'data-invalid',
      'data-disabled',
      'data-readonly',
    ],
  },
  texts: [
    {
      constant: 'MIMI_NUMBER_INPUT_TEXT_ES',
      provider: 'provideMimiNumberInputText',
      path: 'number-input/number-input-texts',
    },
  ],
  tokens: 'numberInput',
};
