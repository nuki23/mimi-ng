import type { DocPage } from '../../../../doc-page/doc-page.types';
import { ColorPickerInputExample } from './examples/color-picker-input.example';
import { ColorPickerPanelExample } from './examples/color-picker-panel.example';
import { ColorPickerSizesExample } from './examples/color-picker-sizes.example';
import { ColorPickerStatesExample } from './examples/color-picker-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import inputSource from './examples/color-picker-input.example' with { loader: 'text' };
// @ts-expect-error
import panelSource from './examples/color-picker-panel.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/color-picker-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/color-picker-states.example' with { loader: 'text' };
// @ts-expect-error
import phoneSource from './examples/color-picker-phone.example' with { loader: 'text' };
import { ColorPickerPhoneExample } from './examples/color-picker-phone.example';

/** La página del Color Picker (tarea G2.12), con la plantilla de página (DP.2). */
export const COLOR_PICKER_PAGE: DocPage = {
  name: 'Color Picker',
  lead: 'Selector de color con área de saturación y brillo, tono, valor escrito en HEX u OKLCH y paleta, suelto o en un panel.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      '`<mimi-color-input>` abre el selector en un panel. Con `[swatches]`, la paleta; con `format="oklch"`, el campo empieza en OKLCH.',
    component: ColorPickerInputExample,
    source: inputSource as string,
  },
  install: 'color-picker',
  usage: {
    code: [
      "import { MimiColorInput } from '@/components/ui/color-picker';",
      '',
      '@Component({',
      '  imports: [MimiColorInput],',
      '  template: `<mimi-color-input aria-label="Color" [(value)]="color" />`,',
      '})',
      'export class BrandComponent {',
      "  color = signal('#4f46e5');",
      '}',
    ].join('\n'),
    note: 'El valor es siempre hex de 6 dígitos en minúsculas (`#4f46e5`), aunque se escriba en OKLCH.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence:
          'Con `size` en el disparador: alto de 32, 40 o 48 px, como Input y Button; el selector del panel toma el mismo tamaño.',
        component: ColorPickerSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Deshabilitado, solo lectura (se enfoca, pero no abre el panel) y con error, como lo deja un formulario.',
        component: ColorPickerStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'panel',
        title: 'El panel suelto, con paleta y vista previa',
        sentence:
          '`<mimi-color-picker>` sin disparador, con `[(recent)]` para guardar los recientes. La vista previa y el contraste son del ejemplo.',
        component: ColorPickerPanelExample,
        source: panelSource as string,
      },
      {
        id: 'phone',
        title: 'En el teléfono',
        sentence:
          'Debajo de 640 px `mimi-color-input` abre su panel en una hoja inferior; `presentation="sheet"` la pide aquí.',
        component: ColorPickerPhoneExample,
        source: phoneSource as string,
      },
    ],
  },
  forms: 'color-picker',
  accessibility: {
    points: [
      'Nombra el disparador con un `<label for>`, `aria-label` o `aria-labelledby`.',
      'El área es un `slider`: ← y → cambian la saturación y ↑ y ↓ el brillo, de a 2 %; se lee «Saturación 80 %, brillo 90 %».',
      'Tono: flechas de a 3°, Re Pág y Av Pág de a 30°, Inicio y Fin.',
      'El formato es un grupo de radio con flechas. El campo se confirma con Enter o al salir; si no se entiende, queda inválido.',
      'Paleta y recientes: una parada de Tab cada uno y flechas entre las muestras, que llevan `aria-pressed`.',
      'Arrastrar con el puntero o el dedo lleva el foco al control.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'presentation',
        type: "'auto' | 'popover' | 'sheet' | 'fullscreen'",
        default: "'auto'",
        description:
          'Solo en `mimi-color-input`: cómo se abre. `auto`: hoja inferior debajo de 640 px.',
      },
      {
        name: 'value',
        type: "string ('#4f46e5')",
        default: "''",
        description:
          'El color, en hex de 6 dígitos en minúsculas. Con `[(value)]` o un formulario.',
      },
      {
        name: 'swatches',
        type: 'string[]',
        default: '[]',
        description: 'La paleta (hex). Sin paleta, no se muestra.',
      },
      {
        name: 'recent',
        type: 'string[] (model)',
        default: '[]',
        description: 'Los recientes (hasta 8, el último primero). `[(recent)]` para guardarlos.',
      },
      {
        name: 'showRecent',
        type: 'boolean',
        default: 'true',
        description: 'Muestra la sección de recientes.',
      },
      {
        name: 'format',
        type: "'hex' | 'oklch'",
        default: "'hex'",
        description: 'Formato del campo al empezar. El valor sigue siendo hex.',
      },
      {
        name: 'placeholder',
        type: 'string',
        default: "''",
        description: 'Texto del disparador sin color (solo `mimi-color-input`).',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'Desactiva el disparador y el panel. Un formulario lo pasa solo.',
      },
      {
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description: 'El color se ve y se enfoca, pero no cambia: el panel no se abre.',
      },
      {
        name: 'invalid, touched, dirty, required',
        type: 'boolean',
        default: 'false',
        description:
          'Los pasa el formulario. El error se muestra si es inválido y se tocó o modificó.',
      },
      {
        name: 'id, aria-label, aria-labelledby',
        type: 'string',
        default: '—',
        description:
          'Los del disparador: `id` para un `<label for>` externo, o el nombre accesible.',
      },
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description:
          'En los dos. En `mimi-color-input`, el alto del disparador y el selector del panel.',
      },
      {
        name: 'class, panelClass',
        type: 'string',
        default: "''",
        description: 'Clases del disparador (o del panel suelto) y del panel del disparador.',
      },
    ],
    outputs: [
      {
        name: 'touch',
        type: 'void',
        description:
          'Se cerró el panel (o se eligió un color en el suelto): el formulario marca el campo como tocado.',
      },
    ],
    parts: [
      {
        name: 'MimiColorPicker',
        selector: 'mimi-color-picker',
        description:
          'El selector suelto, sin disparador: las mismas entradas de color, también con un formulario.',
      },
    ],
    dataAttributes: ['data-state', 'data-size', 'data-invalid', 'data-disabled', 'data-readonly'],
  },
  texts: [
    {
      constant: 'MIMI_COLOR_PICKER_TEXT_ES',
      provider: 'provideMimiColorPickerText',
      path: 'color-picker/color-picker-texts',
    },
  ],
  tokens: 'colorPicker',
};
