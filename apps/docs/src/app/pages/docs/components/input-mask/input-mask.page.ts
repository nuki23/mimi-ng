import type { DocPage } from '../../../../doc-page/doc-page.types';
import { InputMaskBasicExample } from './examples/input-mask-basic.example';
import { InputMaskCardExample } from './examples/input-mask-card.example';
import { InputMaskCustomExample } from './examples/input-mask-custom.example';
import { InputMaskStatesExample } from './examples/input-mask-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/input-mask-basic.example' with { loader: 'text' };
// @ts-expect-error
import cardSource from './examples/input-mask-card.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/input-mask-custom.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/input-mask-states.example' with { loader: 'text' };

/** La página de Input Mask (tareas G2.4a y G2.4b), con la plantilla de página (DP). */
export const INPUT_MASK_PAGE: DocPage = {
  name: 'Input Mask',
  lead: 'Campo que da formato mientras escribes, como un teléfono, una fecha o una tarjeta, y guarda solo los dígitos.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Un prefijo fijo, un ícono y el marcador de lo que falta; debajo, los dígitos que recibe el modelo.',
    component: InputMaskBasicExample,
    source: basicSource as string,
  },
  install: 'input-mask',
  usage: {
    code: [
      "import { MimiInputMask } from '@/components/ui/input-mask';",
      '',
      '@Component({',
      '  imports: [MimiInputMask],',
      '  template: `',
      '    <mimi-input-mask mask="(00) 0000 0000" aria-label="Teléfono" [(value)]="phone" />',
      '  `,',
      '})',
      'export class ContactComponent {',
      "  // Guarda '5512345678'; el campo muestra '(55) 1234 5678'.",
      "  phone = signal('');",
      '}',
    ].join('\n'),
    note: 'En la máscara, `0` es un dígito y lo demás son literales. El formulario recibe solo los dígitos.',
    more: {
      summary: 'Validar una máscara incompleta',
      items: [
        'Con Signal Forms, una máscara incompleta deja el campo inválido sola, con el error `mask`.',
        'Con Reactive Forms y `ngModel`, agrega un validador tuyo; por ejemplo, `Validators.minLength(10)` para un teléfono de 10 dígitos.',
        'Una regla propia (que la fecha exista, la suma de una tarjeta) es un validador tuyo sobre los dígitos.',
      ],
    },
  },
  examples: {
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Deshabilitado y solo lectura; el valor llega sin literales y se pinta con la máscara.',
        component: InputMaskStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'card',
        title: 'Tarjeta con marca',
        sentence:
          'Con `mimiMaskEnd`, la marca y un ícono de válido al final de la caja. Prueba con 4242 4242 4242 4242.',
        component: InputMaskCardExample,
        source: cardSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence: 'Tus clases van a la caja y se mezclan con `cn()`: aquí, más angosta y redonda.',
        component: InputMaskCustomExample,
        source: customSource as string,
      },
    ],
  },
  forms: 'input-mask',
  accessibility: {
    points: [
      'El teclado es el del campo de texto. Al escribir o borrar en medio, el cursor se queda después del mismo dígito.',
      'Borrar sobre un literal borra el dígito de al lado.',
      'Pegar funciona con o sin literales («55 1234 5678» o «(55) 1234-5678»). Durante la composición de texto (IME) no se reformatea hasta terminar.',
      'Ctrl+Z es el del navegador: después de un reformateo puede deshacer solo hasta el último cambio.',
      'Di el formato esperado con texto (`aria-describedby` a una ayuda), no solo con la máscara: el marcador es decorativo.',
      'Con error, el campo lleva `aria-invalid="true"`; el nombre y el `id` van al campo de dentro.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'mask',
        type: 'string',
        default: '—',
        description:
          '`0` es un dígito; lo demás, literales: `(00) 0000 0000`, `00/00/0000`… Obligatoria.',
      },
      {
        name: 'value',
        type: 'string',
        default: "''",
        description:
          'Solo los dígitos. Admite `[(value)]`, `[formField]`, `formControlName` y `[(ngModel)]`.',
      },
      {
        name: 'ghost',
        type: 'string',
        default: "''",
        description:
          'Marcador de lo que falta (`DD/MM/AAAA`), debajo de lo escrito. Decorativo: di el formato con texto.',
      },
      {
        name: 'inputmode',
        type: 'string',
        default: "'numeric'",
        description: 'Teclado del móvil.',
      },
      {
        name: 'autocomplete',
        type: 'string',
        default: '—',
        description: 'El del campo: `tel-national`, `cc-number`, `bday`…',
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
        name: 'aria-label / aria-labelledby / aria-describedby / id',
        type: 'string',
        default: '—',
        description: 'Van al campo de dentro (con `id`, sirve un `<label for>`).',
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
        description: 'Al salir del campo; el formulario lo marca como tocado.',
      },
    ],
    parts: [
      {
        name: 'MimiMaskPrefix',
        selector: '[mimiMaskPrefix]',
        description: 'Un prefijo fijo dentro de la caja, como «+52».',
      },
      {
        name: 'MimiMaskStart',
        selector: '[mimiMaskStart]',
        description: 'Algo al principio de la caja, como un ícono.',
      },
      {
        name: 'MimiMaskEnd',
        selector: '[mimiMaskEnd]',
        description: 'Algo al final de la caja: la marca de una tarjeta, un ícono de válido.',
      },
      {
        name: 'MimiInputMaskImports',
        selector: '—',
        description: 'El campo y sus tres piezas, para importarlos juntos.',
      },
      {
        name: 'mimiApplyMask / mimiUnmask / mimiMaskLength',
        selector: '(funciones)',
        description:
          'Aplican la máscara a unos dígitos, la quitan de un texto y cuentan sus dígitos.',
      },
    ],
    dataAttributes: [
      'data-state="empty|partial|complete"',
      'data-size',
      'data-invalid',
      'data-disabled',
      'data-readonly',
    ],
  },
  tokens: 'inputMask',
};
