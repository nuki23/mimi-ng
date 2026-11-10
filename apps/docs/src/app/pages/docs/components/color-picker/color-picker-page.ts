import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  MIMI_COLOR_PICKER_TEXT_ES,
  provideMimiColorPickerText,
} from '@/components/ui/color-picker';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { ColorPickerFormsExample } from './examples/color-picker-forms.example';
import { ColorPickerInputExample } from './examples/color-picker-input.example';
import { ColorPickerPanelExample } from './examples/color-picker-panel.example';
import { ColorPickerReadonlyExample } from './examples/color-picker-readonly.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import formsSource from './examples/color-picker-forms.example' with { loader: 'text' };
// @ts-expect-error
import inputSource from './examples/color-picker-input.example' with { loader: 'text' };
// @ts-expect-error
import panelSource from './examples/color-picker-panel.example' with { loader: 'text' };
// @ts-expect-error
import readonlySource from './examples/color-picker-readonly.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación del Color Picker (tarea G2.12). */
@Component({
  selector: 'app-color-picker-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    ColorPickerPanelExample,
    ColorPickerInputExample,
    ColorPickerFormsExample,
    ColorPickerReadonlyExample,
  ],
  providers: [
    provideMimiColorPickerText(MIMI_COLOR_PICKER_TEXT_ES),
    provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
  ],
  templateUrl: './color-picker-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerPage {
  protected readonly source = {
    panel: panelSource as string,
    input: inputSource as string,
    forms: formsSource as string,
    readonly: readonlySource as string,
  };

  protected readonly usage = [
    "import { MimiColorInput } from '@/components/ui/color-picker';",
    '',
    '@Component({',
    '  imports: [MimiColorInput],',
    '  template: `<mimi-color-input aria-label="Color" [(value)]="color" />`,',
    '})',
    'export class BrandComponent {',
    "  color = signal('#4f46e5');",
    '}',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'value',
      type: "string ('#4f46e5')",
      default: "''",
      description:
        'El color, siempre en hex de 6 dígitos en minúsculas. Admite [(value)], [formField], formControlName y [(ngModel)].',
    },
    {
      name: 'swatches',
      type: 'string[]',
      default: '[]',
      description: 'La paleta (hex). Sin paleta, no se muestra.',
    },
    {
      name: 'recent',
      type: 'string[]',
      default: '[]',
      description: 'Los recientes (hasta 8). [(recent)] para guardarlos.',
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
      name: 'placeholder / disabled / id / aria-label',
      type: '—',
      default: '—',
      description: 'Del disparador (mimi-color-input); disabled también en el panel.',
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      description:
        'Solo lectura (panel y disparador): se ve el color; el panel no se abre, y el área, el tono, la paleta y el campo no lo cambian.',
    },
    {
      name: 'class / panelClass',
      type: 'string',
      default: "''",
      description: 'Clases del disparador (o del panel suelto) y del panel en el Popover.',
    },
  ];
}
