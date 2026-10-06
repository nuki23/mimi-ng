import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { FormFieldBasicExample } from './examples/form-field-basic.example';
import { FormFieldCustomClassExample } from './examples/form-field-custom-class.example';
import { FormFieldCustomErrorExample } from './examples/form-field-custom-error.example';
import { FormFieldMessagesDefaultExample } from './examples/form-field-messages-default.example';
import { FormFieldMessagesProviderExample } from './examples/form-field-messages-provider.example';
import { FormFieldOwnLabelExample } from './examples/form-field-own-label.example';
import { FormFieldRegisterExample } from './examples/form-field-register.example';
import { FormFieldSignalFormsExample } from './examples/form-field-signal-forms.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import formFieldBasicSource from './examples/form-field-basic.example' with { loader: 'text' };
// @ts-expect-error
import formFieldCustomClassSource from './examples/form-field-custom-class.example' with {
  loader: 'text',
};
// @ts-expect-error
import formFieldCustomErrorSource from './examples/form-field-custom-error.example' with {
  loader: 'text',
};
// @ts-expect-error
import formFieldMessagesDefaultSource from './examples/form-field-messages-default.example' with {
  loader: 'text',
};
// @ts-expect-error
import formFieldMessagesProviderSource from './examples/form-field-messages-provider.example' with {
  loader: 'text',
};
// @ts-expect-error
import formFieldOwnLabelSource from './examples/form-field-own-label.example' with {
  loader: 'text',
};
// @ts-expect-error
import formFieldRegisterSource from './examples/form-field-register.example' with {
  loader: 'text',
};
// @ts-expect-error
import formFieldSignalFormsSource from './examples/form-field-signal-forms.example' with {
  loader: 'text',
};

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de FormField y FormError (tarea 2.11). */
@Component({
  selector: 'app-form-field-page',
  imports: [
    CodeBlock,
    CssVariables,
    CodePreview,
    InstallCommand,
    FormFieldBasicExample,
    FormFieldCustomClassExample,
    FormFieldCustomErrorExample,
    FormFieldMessagesDefaultExample,
    FormFieldMessagesProviderExample,
    FormFieldOwnLabelExample,
    FormFieldRegisterExample,
    FormFieldSignalFormsExample,
  ],
  templateUrl: './form-field-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldPage {
  protected readonly source = {
    basic: formFieldBasicSource as string,
    customClass: formFieldCustomClassSource as string,
    customError: formFieldCustomErrorSource as string,
    messagesDefault: formFieldMessagesDefaultSource as string,
    messagesProvider: formFieldMessagesProviderSource as string,
    ownLabel: formFieldOwnLabelSource as string,
    register: formFieldRegisterSource as string,
    signalForms: formFieldSignalFormsSource as string,
  };

  protected readonly usage = [
    "import { MimiFormField } from '@/components/ui/form-field';",
    "import { MimiInput } from '@/components/ui/input';",
    '',
    '@Component({',
    "  selector: 'app-perfil',",
    '  imports: [ReactiveFormsModule, MimiFormField, MimiInput],',
    '  template: `',
    '    <mimi-form-field label="Correo">',
    '      <input mimiInput type="email" [formControl]="email" />',
    '    </mimi-form-field>',
    '  `,',
    '})',
    'export class PerfilComponent {',
    "  readonly email = new FormControl('', [Validators.required, Validators.email]);",
    '}',
  ].join('\n');

  protected readonly messagesEs = [
    '// app.config.ts',
    'import {',
    '  MIMI_ERROR_MESSAGES_ES,',
    '  provideMimiErrorMessages,',
    "} from '@/components/ui/form-field';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES)],',
    '};',
  ].join('\n');

  protected readonly messages: { key: string; en: string; es: string }[] = [
    { key: 'required', en: 'This field is required.', es: 'Este campo es obligatorio.' },
    { key: 'email', en: 'Enter a valid email address.', es: 'Ingresa un correo válido.' },
    {
      key: 'minlength',
      en: 'Use at least {n} characters.',
      es: 'Usa al menos {n} caracteres.',
    },
    {
      key: 'maxlength',
      en: 'Use at most {n} characters.',
      es: 'Usa como máximo {n} caracteres.',
    },
    { key: 'min', en: 'The minimum value is {n}.', es: 'El valor mínimo es {n}.' },
    { key: 'max', en: 'The maximum value is {n}.', es: 'El valor máximo es {n}.' },
    { key: 'pattern', en: 'The format is not valid.', es: 'El formato no es válido.' },
    { key: 'default', en: 'Check this field.', es: 'Revisa este campo.' },
  ];

  protected readonly apiTables: { id: string; title: string; rows: ApiRow[] }[] = [
    {
      id: 'api-form-field',
      title: 'mimi-form-field',
      rows: [
        {
          name: 'label',
          type: 'string',
          default: '—',
          description:
            'Texto de la etiqueta, enlazada al control. Sin label, puedes proyectar tu propio <label>.',
        },
        {
          name: 'class',
          type: 'string',
          default: "''",
          description: 'Clases del contenedor. Se mezclan con cn(): las tuyas ganan.',
        },
      ],
    },
    {
      id: 'api-form-error',
      title: 'mimi-form-error',
      rows: [
        {
          name: 'contenido',
          type: 'texto',
          default: 'mensaje del error',
          description: 'Si escribes un texto, se muestra ese en lugar del mensaje automático.',
        },
        {
          name: 'class',
          type: 'string',
          default: "''",
          description: 'Clases del mensaje (por ejemplo, su columna en una grilla).',
        },
      ],
    },
  ];
}
