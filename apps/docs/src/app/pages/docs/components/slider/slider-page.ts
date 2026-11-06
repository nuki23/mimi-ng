import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_SLIDER_TEXT_ES, provideMimiSliderText } from '@/components/ui/slider';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { SliderBasicExample } from './examples/slider-basic.example';
import { SliderMarksExample } from './examples/slider-marks.example';
import { SliderRangeExample } from './examples/slider-range.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/slider-basic.example' with { loader: 'text' };
// @ts-expect-error
import marksSource from './examples/slider-marks.example' with { loader: 'text' };
// @ts-expect-error
import rangeSource from './examples/slider-range.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Slider (tarea G2.7). */
@Component({
  selector: 'app-slider-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    SliderBasicExample,
    SliderRangeExample,
    SliderMarksExample,
  ],
  providers: [provideMimiSliderText(MIMI_SLIDER_TEXT_ES)],
  templateUrl: './slider-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderPage {
  protected readonly source = {
    basic: basicSource as string,
    range: rangeSource as string,
    marks: marksSource as string,
  };

  protected readonly usage = [
    "import { MimiSlider } from '@/components/ui/slider';",
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
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'value',
      type: 'number | [number, number] | null',
      default: 'null',
      description:
        'Un número o, con range, [desde, hasta]. Admite [(value)], [formField], formControlName y [(ngModel)]. Fuera de rango se pinta acotado sin cambiar el modelo.',
    },
    {
      name: 'range',
      type: 'boolean',
      default: 'false',
      description: 'Dos pulgares que no se cruzan («Mínimo» y «Máximo»).',
    },
    { name: 'min / max', type: 'number', default: '0 / 100', description: 'Límites.' },
    {
      name: 'step',
      type: 'number',
      default: '1',
      description: 'Paso (Re Pág / Av Pág: diez pasos).',
    },
    {
      name: 'marks',
      type: '(number | { value, label? })[]',
      default: '[]',
      description: 'Marcas sobre la pista, con su texto debajo si lo tienen.',
    },
    {
      name: 'format',
      type: '(value) => string',
      default: 'el número',
      description: 'Texto del valor: aria-valuetext y la burbuja.',
    },
    {
      name: 'showValue',
      type: "'auto' | 'always' | 'never'",
      default: "'auto'",
      description: 'La burbuja: al arrastrar y con el foco, siempre o nunca.',
    },
    { name: 'disabled', type: 'boolean', default: 'false', description: 'Deshabilitado.' },
    {
      name: 'aria-label / aria-labelledby',
      type: 'string',
      default: '—',
      description: 'Nombre (en el rango, cada pulgar: «Precio, Mínimo»).',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del contenedor, mezcladas con cn().',
    },
  ];
}
