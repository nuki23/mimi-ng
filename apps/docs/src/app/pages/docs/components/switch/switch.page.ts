import type { ApiRow, DocPage } from '../../../../doc-page/doc-page.types';
import { SwitchCustomClassExample } from './examples/switch-custom-class.example';
import { SwitchDemoExample } from './examples/switch-demo.example';
import { SwitchLabelsExample } from './examples/switch-labels.example';
import { SwitchSizesExample } from './examples/switch-sizes.example';
import { SwitchStatesExample } from './examples/switch-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import customClassSource from './examples/switch-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import demoSource from './examples/switch-demo.example' with { loader: 'text' };
// @ts-expect-error
import labelsSource from './examples/switch-labels.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/switch-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/switch-states.example' with { loader: 'text' };

const INPUTS: ApiRow[] = [
  {
    name: 'checked',
    type: 'boolean (model)',
    default: 'false',
    description: 'Encendido o apagado. Úsalo con `[(checked)]` o deja que lo maneje el formulario.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md' (o el del contenedor con mimiSize)",
    description: 'Pista de 32×18, 36×20 o 44×24 px, con el texto al tamaño de la escala.',
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
    description: 'Clases del envoltorio (control y texto). Se mezclan con `cn()`: las tuyas ganan.',
  },
];

/** La página de Switch (tarea 2.9), con la plantilla de página (DP.1). */
export const SWITCH_PAGE: DocPage = {
  name: 'Switch',
  lead: 'Interruptor de sí o no que aplica un ajuste al instante, con su texto como etiqueta y tres tamaños.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Dos ajustes con `[(checked)]`. Enciende el modo avión: el wifi queda deshabilitado hasta que lo apagues.',
    component: SwitchDemoExample,
    source: demoSource as string,
  },
  install: 'switch',
  usage: {
    code: [
      "import { MimiSwitch } from '@/components/ui/switch';",
      '',
      '@Component({',
      "  selector: 'app-ajustes',",
      '  imports: [MimiSwitch],',
      '  template: `',
      '    <mimi-switch [(checked)]="avion">Modo avión</mimi-switch>',
      '    <mimi-switch size="sm" [(checked)]="sonido">Sonido</mimi-switch>',
      '  `,',
      '})',
      'export class AjustesComponent {',
      '  readonly avion = signal(false);',
      '  readonly sonido = signal(true);',
      '}',
    ].join('\n'),
    note: 'El texto de adentro es la etiqueta. Para una opción que se confirma al enviar, usa [Checkbox](/docs/components/checkbox).',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`sm` (32×18 px), `md` (36×20 px) y `lg` (44×24 px). Para todo un formulario, ponlo una vez en el contenedor con `mimiSize`.',
        component: SwitchSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Apagado, encendido, deshabilitado y solo lectura. Llega con Tab y alterna con Espacio o Enter.',
        component: SwitchStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'labels',
        title: 'Etiquetas',
        sentence:
          'Sin texto adentro, nómbralo con `aria-label` o con un `<label for>` que apunte a su `id`: los dos pasan al botón interno.',
        component: SwitchLabelsExample,
        source: labelsSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          '`class` va al envoltorio del control y su texto: aquí, una lista de ajustes con el switch a la derecha.',
        component: SwitchCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  forms: 'switch',
  accessibility: {
    points: [
      'Es un `<button type="button">` con `role="switch"` y `aria-checked`: nunca envía el formulario que lo contiene.',
      'Tab llega al control; Espacio o Enter lo alternan. Un clic en el texto también.',
      'Nómbralo con el texto de adentro, `aria-label`, `aria-labelledby` o un `<label for>` que apunte a su `id`.',
      'Con error lleva `aria-invalid`; con `required`, `aria-required`; con `readonly`, `aria-readonly`, y no cambia.',
      'Deshabilitado no recibe el foco. En solo lectura se enfoca, pero ni el clic ni el teclado lo cambian.',
    ],
  },
  api: {
    inputs: INPUTS,
    outputs: [
      { name: 'checkedChange', type: 'boolean', description: 'El estado cambió.' },
      {
        name: 'touch',
        type: 'void',
        description: 'Al perder el foco. Lo usa el formulario para marcar el campo como tocado.',
      },
    ],
    dataAttributes: ['data-state', 'data-disabled', 'data-size'],
  },
  tokens: 'switch',
};
