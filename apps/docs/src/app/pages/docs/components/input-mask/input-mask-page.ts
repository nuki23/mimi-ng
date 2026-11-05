import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { InputMaskBasicExample } from './examples/input-mask-basic.example';
import { InputMaskFormsExample } from './examples/input-mask-forms.example';
import { InputMaskStatesExample } from './examples/input-mask-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/input-mask-basic.example' with { loader: 'text' };
// @ts-expect-error
import formsSource from './examples/input-mask-forms.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/input-mask-states.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Input Mask (tareas G2.4a y G2.4b). */
@Component({
  selector: 'app-input-mask-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    InputMaskBasicExample,
    InputMaskStatesExample,
    InputMaskFormsExample,
  ],
  providers: [provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)],
  templateUrl: './input-mask-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskPage {
  protected readonly source = {
    basic: basicSource as string,
    states: statesSource as string,
    forms: formsSource as string,
  };

  protected readonly usage = [
    "import { MimiInputMask } from '@/components/ui/input-mask';",
    '',
    '@Component({',
    '  imports: [MimiInputMask, ReactiveFormsModule],',
    '  template: `',
    '    <mimi-input-mask mask="(00) 0000 0000" autocomplete="tel-national"',
    '      aria-label="Teléfono" formControlName="phone" />',
    '  `,',
    '})',
    "// El control recibe '5512345678'; el campo muestra '(55) 1234 5678'.",
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'mask',
      type: 'string',
      default: '—',
      description: '0 es un dígito; lo demás, literales: (00) 0000 0000, 00/00/0000…',
    },
    {
      name: 'value',
      type: 'string',
      default: "''",
      description:
        'Solo los dígitos. Admite [(value)], [formField], formControlName y [(ngModel)]. Un valor con o sin literales se pinta con la máscara.',
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
      description: 'El del campo: tel-national, cc-number, bday…',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: "''",
      description: 'Texto con el campo vacío.',
    },
    {
      name: 'aria-label / aria-labelledby / aria-describedby / id',
      type: 'string',
      default: '—',
      description: 'Van al input de dentro (con id, sirve un <label for>).',
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
      description: 'Clases del input, mezcladas con cn(): tus clases ganan.',
    },
  ];
}
