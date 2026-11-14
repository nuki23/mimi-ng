import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { CodeBlock } from '../../../../code/code-block';
import { FormsTabs } from '../../../../code/forms-tabs';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { InputOtpPlaygroundExample } from './examples/input-otp-playground.example';
import { InputOtpReactiveFormsExample } from './examples/input-otp-reactive-forms.example';
import { InputOtpSeparatorExample } from './examples/input-otp-separator.example';
import { InputOtpSignalFormsExample } from './examples/input-otp-signal-forms.example';
import { InputOtpStatesExample } from './examples/input-otp-states.example';
import { InputOtpVerifyExample } from './examples/input-otp-verify.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import playgroundSource from './examples/input-otp-playground.example' with { loader: 'text' };
// @ts-expect-error
import reactiveFormsSource from './examples/input-otp-reactive-forms.example' with {
  loader: 'text',
};
// @ts-expect-error
import separatorSource from './examples/input-otp-separator.example' with { loader: 'text' };
// @ts-expect-error
import signalFormsSource from './examples/input-otp-signal-forms.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/input-otp-states.example' with { loader: 'text' };
// @ts-expect-error
import verifySource from './examples/input-otp-verify.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Input OTP (tarea G2.5). */
@Component({
  selector: 'app-input-otp-page',
  imports: [
    CodeBlock,
    FormsTabs,
    CodePreview,
    CssVariables,
    InstallCommand,
    InputOtpPlaygroundExample,
    InputOtpVerifyExample,
    InputOtpSeparatorExample,
    InputOtpStatesExample,
    InputOtpSignalFormsExample,
    InputOtpReactiveFormsExample,
  ],
  providers: [provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)],
  templateUrl: './input-otp-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputOtpPage {
  protected readonly source = {
    playground: playgroundSource as string,
    verify: verifySource as string,
    separator: separatorSource as string,
    states: statesSource as string,
    signalForms: signalFormsSource as string,
    reactiveForms: reactiveFormsSource as string,
  };

  protected readonly usage = [
    "import { MimiInputOtp } from '@/components/ui/input-otp';",
    '',
    '@Component({',
    '  imports: [MimiInputOtp],',
    '  template: `',
    '    <mimi-input-otp aria-label="Código de verificación" [separatorAfter]="3" [(value)]="code" />',
    '  `,',
    '})',
    'export class VerifyComponent {',
    "  code = signal('');",
    '}',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'value',
      type: 'string',
      default: "''",
      description:
        'El código, sin espacios ni guiones. Admite [(value)], [formField], formControlName y [(ngModel)].',
    },
    {
      name: 'length',
      type: 'number',
      default: '6',
      description:
        'Cuántas casillas (4, 6, 8, 10…; sin tope). Con muchas, las casillas se encogen para caber en el ancho disponible; un código pegado más largo se recorta.',
    },
    {
      name: 'separatorAfter',
      type: 'number | number[]',
      default: '—',
      description:
        'Después de qué casilla va el separador (3 en el diseño), o una lista para varios grupos: [3], [4, 8]. Sin él, no hay separador.',
    },
    {
      name: 'separator',
      type: 'string',
      default: "''",
      description:
        'Separador propio, como texto: "·", "/". Sin él, el guion del diseño. Para un ícono u otro contenido, <ng-template mimiInputOtpSeparator> (gana sobre este).',
    },
    {
      name: 'alphanumeric',
      type: 'boolean',
      default: 'false',
      description: 'Letras y dígitos (inputmode text). Por defecto, solo dígitos (numeric).',
    },
    {
      name: 'success',
      type: 'boolean',
      default: 'false',
      description: 'El código se verificó: borde y anillo success. El error lo da el formulario.',
    },
    {
      name: 'autocomplete',
      type: 'string',
      default: "'one-time-code'",
      description: 'El sistema propone el código del SMS.',
    },
    {
      name: 'aria-label / aria-labelledby / aria-describedby / id',
      type: 'string',
      default: '—',
      description: 'Van al input real (con id, sirve un <label for>).',
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
      description: 'Clases de la fila de casillas, mezcladas con cn().',
    },
  ];
}
