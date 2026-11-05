import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import {
  MIMI_NUMBER_INPUT_TEXT_ES,
  provideMimiNumberInputText,
} from '@/components/ui/number-input';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { NumberInputBasicExample } from './examples/number-input-basic.example';
import { NumberInputCustomExample } from './examples/number-input-custom.example';
import { NumberInputFormsExample } from './examples/number-input-forms.example';
import { NumberInputStatesExample } from './examples/number-input-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/number-input-basic.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/number-input-custom.example' with { loader: 'text' };
// @ts-expect-error
import formsSource from './examples/number-input-forms.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/number-input-states.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Number Input (tarea G2.2). */
@Component({
  selector: 'app-number-input-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    NumberInputBasicExample,
    NumberInputStatesExample,
    NumberInputFormsExample,
    NumberInputCustomExample,
  ],
  providers: [
    provideMimiNumberInputText(MIMI_NUMBER_INPUT_TEXT_ES),
    provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
  ],
  templateUrl: './number-input-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberInputPage {
  protected readonly source = {
    basic: basicSource as string,
    states: statesSource as string,
    forms: formsSource as string,
    custom: customSource as string,
  };

  protected readonly usage = [
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
  ].join('\n');

  protected readonly texts = [
    '// app.config.ts: el archivo de textos, no el índice del componente.',
    'import {',
    '  MIMI_NUMBER_INPUT_TEXT_ES,',
    '  provideMimiNumberInputText,',
    "} from '@/components/ui/number-input/number-input-texts';",
    '',
    'providers: [provideMimiNumberInputText(MIMI_NUMBER_INPUT_TEXT_ES)]',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'aria-label / aria-labelledby',
      type: 'string',
      default: '—',
      description:
        'Nombre del campo (o un <label for> con id). También nombra los botones: «Disminuir Cantidad».',
    },
    {
      name: 'value',
      type: 'number | null',
      default: 'null',
      description:
        'El número; vacío es null. Admite [(value)], [formField], formControlName y [(ngModel)]. Un valor fuera de rango se pinta acotado sin cambiar el modelo.',
    },
    {
      name: 'min / max',
      type: 'number',
      default: '—',
      description: 'Límites (también desde el formulario).',
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
      name: 'disabled / readonly',
      type: 'boolean',
      default: 'false',
      description: 'Deshabilitado o solo lectura.',
    },
    { name: 'id', type: 'string', default: '—', description: 'id del input, para un <label for>.' },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases de la caja, mezcladas con cn(): tus clases ganan.',
    },
    {
      name: '(touch)',
      type: 'void',
      default: '—',
      description: 'Cuando el foco sale de la caja (lo usa el formulario para «tocado»).',
    },
  ];
}
