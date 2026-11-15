import type { DocPage } from '../../../../doc-page/doc-page.types';
import { SliderBasicExample } from './examples/slider-basic.example';
import { SliderMarksExample } from './examples/slider-marks.example';
import { SliderRangeExample } from './examples/slider-range.example';
import { SliderSizesExample } from './examples/slider-sizes.example';
import { SliderStatesExample } from './examples/slider-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/slider-basic.example' with { loader: 'text' };
// @ts-expect-error
import marksSource from './examples/slider-marks.example' with { loader: 'text' };
// @ts-expect-error
import rangeSource from './examples/slider-range.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/slider-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/slider-states.example' with { loader: 'text' };

/** La página de Slider (tarea G2.7), con la plantilla de página (DP.2). */
export const SLIDER_PAGE: DocPage = {
  name: 'Slider',
  lead: 'Control para elegir un valor o un rango arrastrando o con el teclado, con marcas y el valor en una burbuja.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      '`[format]` da el texto del valor en la burbuja y para el lector; con `showValue="always"`, la burbuja queda fija.',
    component: SliderBasicExample,
    source: basicSource as string,
  },
  install: 'slider',
  usage: {
    code: [
      "import { MimiSlider, type MimiSliderValue } from '@/components/ui/slider';",
      '',
      '@Component({',
      '  imports: [MimiSlider],',
      '  template: `',
      '    <mimi-slider aria-label="Volumen" [(value)]="volume" />',
      '    <mimi-slider aria-label="Precio" range [max]="1000" [step]="10" [(value)]="price" />',
      '  `,',
      '})',
      'export class SettingsComponent {',
      '  volume = signal<MimiSliderValue>(60);',
      '  price = signal<MimiSliderValue>([300, 700]);',
      '}',
    ].join('\n'),
    note: 'Con `range`, el valor es `[desde, hasta]` y los dos pulgares no se cruzan.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          '`sm`, `md` (por defecto) y `lg`: la pista mide 4, 6 u 8 px de alto y el pulgar, 16, 20 o 24 px.',
        component: SliderSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Deshabilitado, solo lectura (el pulgar se enfoca, pero no se mueve) y con error, como lo deja un formulario.',
        component: SliderStatesExample,
        source: statesSource as string,
      },
    ],
    forms: [
      {
        id: 'range',
        title: 'Rango y distancia mínima',
        sentence:
          'La distancia mínima entre pulgares es un validador de tu formulario: el rango de edad la pide de 5 años y marca el error.',
        component: SliderRangeExample,
        source: rangeSource as string,
      },
    ],
    advanced: [
      {
        id: 'marks',
        title: 'Marcas',
        sentence:
          '`[marks]` pinta marcas sobre la pista, con su texto debajo. Con `[formField]`, los límites salen del esquema (`min` y `max`).',
        component: SliderMarksExample,
        source: marksSource as string,
      },
    ],
  },
  forms: 'slider',
  accessibility: {
    points: [
      'Nómbralo con `aria-label` o `aria-labelledby`; en el rango, cada pulgar suma «Mínimo» o «Máximo»: «Precio, Mínimo».',
      'Cada pulgar es un `role="slider"` con su valor y `aria-valuetext` (el texto de `format`).',
      'Flechas: un paso; Re Pág y Av Pág: diez; Inicio y Fin: los límites. En derecha a izquierda, ← sube.',
      'Al tocar la pista, el pulgar más cercano va ahí, recibe el foco y se arrastra (también con el dedo).',
      'La burbuja no se anuncia: el valor ya está en el pulgar.',
      'Con `readonly`, el pulgar se enfoca y lleva `aria-readonly`, pero no se mueve con el puntero ni con el teclado.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: 'number | [number, number] | null',
        default: 'null',
        description:
          'Un número o, con `range`, `[desde, hasta]`. Fuera de los límites se pinta acotado, sin cambiar el modelo.',
      },
      {
        name: 'range',
        type: 'boolean',
        default: 'false',
        description: 'Dos pulgares que no se cruzan («Mínimo» y «Máximo»).',
      },
      {
        name: 'min, max',
        type: 'number',
        default: '0, 100',
        description: 'Límites. Con `[formField]`, salen del esquema (`min` y `max`).',
      },
      {
        name: 'step',
        type: 'number',
        default: '1',
        description: 'Paso de las flechas; Re Pág y Av Pág mueven diez pasos.',
      },
      {
        name: 'marks',
        type: '(number | { value, label? })[]',
        default: '[]',
        description: 'Marcas sobre la pista, con su texto debajo si lo tienen.',
      },
      {
        name: 'format',
        type: '(value: number) => string',
        default: 'el número',
        description: 'Texto del valor: `aria-valuetext` y la burbuja.',
      },
      {
        name: 'showValue',
        type: "'auto' | 'always' | 'never'",
        default: "'auto'",
        description: 'La burbuja: al arrastrar y con el foco, siempre o nunca.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: 'Pista de 4, 6 u 8 px y pulgar de 16, 20 o 24 px.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'No se mueve ni se enfoca. Un formulario lo pasa solo.',
      },
      {
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description: 'El valor se ve y el pulgar se enfoca, pero no se mueve.',
      },
      {
        name: 'invalid, touched, dirty, required',
        type: 'boolean',
        default: 'false',
        description:
          'Los pasa el formulario. El error se muestra si es inválido y se tocó o modificó.',
      },
      {
        name: 'aria-label, aria-labelledby',
        type: 'string',
        default: '—',
        description: 'Nombre accesible; en el rango, el de cada pulgar es «Precio, Mínimo».',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del contenedor, mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    outputs: [
      {
        name: 'touch',
        type: 'void',
        description:
          'Se soltó el pulgar o salió el foco: el formulario marca el campo como tocado.',
      },
    ],
    dataAttributes: [
      'data-range',
      'data-disabled',
      'data-readonly',
      'data-invalid',
      'data-dragging',
    ],
  },
  texts: [
    {
      constant: 'MIMI_SLIDER_TEXT_ES',
      provider: 'provideMimiSliderText',
      path: 'slider/slider-texts',
    },
  ],
  tokens: 'slider',
};
