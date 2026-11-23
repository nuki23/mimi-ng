import type { DocPage } from '../../../../doc-page/doc-page.types';
import { StepperBasicExample } from './examples/stepper-basic.example';
import { StepperCustomClassExample } from './examples/stepper-custom-class.example';
import { StepperReactiveExample } from './examples/stepper-reactive.example';
import { StepperSignalFormsExample } from './examples/stepper-signal-forms.example';
import { StepperSizesExample } from './examples/stepper-sizes.example';
import { StepperVerticalExample } from './examples/stepper-vertical.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/stepper-basic.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/stepper-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import reactiveSource from './examples/stepper-reactive.example' with { loader: 'text' };
// @ts-expect-error
import signalSource from './examples/stepper-signal-forms.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/stepper-sizes.example' with { loader: 'text' };
// @ts-expect-error
import verticalSource from './examples/stepper-vertical.example' with { loader: 'text' };

/** La página de Stepper (tarea G4.3), con la plantilla de página. */
export const STEPPER_PAGE: DocPage = {
  name: 'Stepper',
  lead: 'Un proceso en pasos numerados, con su estado, para altas, compras o asistentes. En el teléfono, la lista pasa a vertical.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Cinco pasos con Atrás y Siguiente. También se cambia de paso tocando su número; el actual lleva `aria-current="step"`.',
    component: StepperBasicExample,
    source: basicSource as string,
  },
  install: 'stepper',
  usage: {
    code: [
      "import { MimiStepperImports } from '@/components/ui/stepper';",
      '',
      '@Component({',
      "  selector: 'app-alta',",
      '  imports: [MimiStepperImports, MimiButton],',
      '  template: `',
      '    <mimi-stepper #pasos="mimiStepper" linear aria-label="Alta" [(value)]="paso">',
      '      <mimi-step title="Datos" [form]="datos">…</mimi-step>',
      '      <mimi-step title="Pago">…</mimi-step>',
      '    </mimi-stepper>',
      '    <button mimiBtn [mimiStepperNext]="pasos">Siguiente</button>',
      '  `,',
      '})',
    ].join('\n'),
    note: '`value` es el índice del paso, desde 0. Con `linear`, no se avanza desde un paso con su `form` inválido.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence: '`size` cambia el círculo (28, 32 o 40 px) y los textos.',
        component: StepperSizesExample,
        source: sizesSource as string,
      },
    ],
    variants: [
      {
        id: 'vertical',
        title: 'Vertical y estados',
        sentence:
          '`orientation="vertical"`, con los estados: completado, error (`error`), actual, pendiente y un paso `optional`.',
        component: StepperVerticalExample,
        source: verticalSource as string,
      },
    ],
    advanced: [
      {
        id: 'signal-forms',
        title: 'Lineal con Signal Forms',
        sentence:
          'Cada paso lleva su parte del formulario en `form`. Siguiente con un campo vacío no avanza: lo marca y muestra el error.',
        component: StepperSignalFormsExample,
        source: signalSource as string,
      },
      {
        id: 'reactive',
        title: 'Lineal con Reactive Forms',
        sentence: 'Lo mismo con un `FormGroup` por paso, en `form` y en `formGroup`.',
        component: StepperReactiveExample,
        source: reactiveSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Con class',
        sentence: '`class` va en el anfitrión y se mezcla con `cn()`: aquí, dentro de una tarjeta.',
        component: StepperCustomClassExample,
        source: customSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Los pasos son una lista ordenada (`ol`) con nombre (`aria-label`); el actual lleva `aria-current="step"`.',
      'Cada paso es un botón: «Paso 2 de 5: Envío, Actual». Los que no se alcanzan, con `aria-disabled`.',
      'Al cambiar de paso, un `role="status"` lo anuncia: «Paso 3 de 5: Pago».',
      'El contenido del paso es un grupo con el nombre del paso; los demás están ocultos.',
      'Con `linear`, Siguiente marca tocado el formulario inválido: se ven sus errores y el paso queda en error.',
      'El estado no depende solo del color: el círculo cambia de ícono y el texto lo dice.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: 'number (model)',
        default: '0',
        description: 'Índice del paso actual, desde 0. Admite `[(value)]`.',
      },
      {
        name: 'linear',
        type: 'boolean',
        default: 'false',
        description: 'De uno en uno y solo con el paso válido (los opcionales no frenan).',
      },
      {
        name: 'orientation',
        type: "'horizontal' | 'vertical'",
        default: "'horizontal'",
        description: 'Horizontal pasa a vertical por debajo de 640 px.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Círculo y textos de los pasos.',
      },
      {
        name: 'aria-label',
        type: 'string',
        default: "''",
        description: 'Nombre de la lista de pasos.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del anfitrión, mezcladas con `cn()`.',
      },
    ],
    outputs: [
      { name: 'valueChange', type: 'number', description: 'Cambió el paso actual.' },
      {
        name: 'finish',
        type: 'void',
        description: 'Siguiente desde el último paso, con su formulario válido.',
      },
    ],
    parts: [
      {
        name: 'MimiStepper',
        selector: 'mimi-stepper',
        description:
          'La lista y el contenido. `next()`, `prev()`, `goTo(i)`, `isFirst()` e `isLast()`.',
      },
      {
        name: 'MimiStep',
        selector: 'mimi-step',
        description:
          '`title`, `description`, `optional`, `completed`, `error`, `disabled` y `form`.',
      },
      {
        name: 'MimiStepperNext',
        selector: '[mimiStepperNext]',
        description: 'En tu botón: va al paso siguiente (o emite `finish`).',
      },
      {
        name: 'MimiStepperPrev',
        selector: '[mimiStepperPrev]',
        description: 'En tu botón: vuelve al paso anterior.',
      },
    ],
    dataAttributes: ['data-state', 'data-orientation', 'data-linear', 'data-size'],
  },
  texts: [
    {
      constant: 'MIMI_STEPPER_TEXT_ES',
      provider: 'provideMimiStepperText',
      path: 'stepper/stepper-texts',
    },
  ],
  tokens: 'stepper',
};
