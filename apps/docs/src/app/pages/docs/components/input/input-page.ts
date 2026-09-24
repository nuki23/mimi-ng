import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { InstallCommand } from '../../../../code/install-command';
import { FieldRowExample } from './examples/field-row.example';
import { InputBasicExample } from './examples/input-basic.example';
import { InputCustomClassExample } from './examples/input-custom-class.example';
import { InputDisabledExample } from './examples/input-disabled.example';
import { InputNgModelExample } from './examples/input-ng-model.example';
import { InputReactiveFormsExample } from './examples/input-reactive-forms.example';
import { InputShowErrorExample } from './examples/input-show-error.example';
import { InputSignalFormsExample } from './examples/input-signal-forms.example';
import { InputSizesExample } from './examples/input-sizes.example';
import { TextareaBasicExample } from './examples/textarea-basic.example';
import { TextareaStatesExample } from './examples/textarea-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import fieldRowSource from './examples/field-row.example' with { loader: 'text' };
// @ts-expect-error
import inputBasicSource from './examples/input-basic.example' with { loader: 'text' };
// @ts-expect-error
import inputCustomClassSource from './examples/input-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import inputDisabledSource from './examples/input-disabled.example' with { loader: 'text' };
// @ts-expect-error
import inputNgModelSource from './examples/input-ng-model.example' with { loader: 'text' };
// @ts-expect-error
import inputReactiveFormsSource from './examples/input-reactive-forms.example' with {
  loader: 'text',
};
// @ts-expect-error
import inputShowErrorSource from './examples/input-show-error.example' with { loader: 'text' };
// @ts-expect-error
import inputSignalFormsSource from './examples/input-signal-forms.example' with { loader: 'text' };
// @ts-expect-error
import inputSizesSource from './examples/input-sizes.example' with { loader: 'text' };
// @ts-expect-error
import textareaBasicSource from './examples/textarea-basic.example' with { loader: 'text' };
// @ts-expect-error
import textareaStatesSource from './examples/textarea-states.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const SHOW_ERROR: ApiRow = {
  name: 'showError',
  type: 'boolean | undefined',
  default: 'undefined',
  description:
    'undefined: decide el formulario (inválido y ya tocado o modificado). true: muestra el error. false: lo oculta aunque el formulario sea inválido.',
};

const CLASS: ApiRow = {
  name: 'class',
  type: 'string',
  default: "''",
  description: 'Clases propias. Se mezclan con cn(): las tuyas ganan.',
};

/** Documentación de Input y Textarea (tareas 2.2 y 2.3). */
@Component({
  selector: 'app-input-page',
  imports: [
    CodeBlock,
    CodePreview,
    InstallCommand,
    FieldRowExample,
    InputBasicExample,
    InputCustomClassExample,
    InputDisabledExample,
    InputNgModelExample,
    InputReactiveFormsExample,
    InputShowErrorExample,
    InputSignalFormsExample,
    InputSizesExample,
    TextareaBasicExample,
    TextareaStatesExample,
  ],
  templateUrl: './input-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputPage {
  protected readonly source = {
    fieldRow: fieldRowSource as string,
    inputBasic: inputBasicSource as string,
    inputCustomClass: inputCustomClassSource as string,
    inputDisabled: inputDisabledSource as string,
    inputNgModel: inputNgModelSource as string,
    inputReactiveForms: inputReactiveFormsSource as string,
    inputShowError: inputShowErrorSource as string,
    inputSignalForms: inputSignalFormsSource as string,
    inputSizes: inputSizesSource as string,
    textareaBasic: textareaBasicSource as string,
    textareaStates: textareaStatesSource as string,
  };

  protected readonly usage = [
    "import { MimiInput } from '@/components/ui/input';",
    "import { MimiTextarea } from '@/components/ui/textarea';",
    '',
    '@Component({',
    "  selector: 'app-contact',",
    '  imports: [MimiInput, MimiTextarea],',
    '  template: `',
    '    <input mimiInput type="email" placeholder="tu@correo.com" />',
    '    <textarea mimiTextarea rows="3"></textarea>',
    '  `,',
    '})',
    'export class ContactComponent {}',
  ].join('\n');

  protected readonly inputApi: ApiRow[] = [
    {
      name: 'size',
      type: "'sm' | 'default' | 'lg'",
      default: "'default'",
      description:
        'Alto y tamaño de letra, iguales a los de Button. Reemplaza al atributo nativo size de <input> (el ancho en caracteres): para el ancho, usa class.',
    },
    SHOW_ERROR,
    CLASS,
  ];

  protected readonly textareaApi: ApiRow[] = [SHOW_ERROR, CLASS];

  protected readonly apiTables = [
    { id: 'api-input', title: 'Input', rows: this.inputApi },
    { id: 'api-textarea', title: 'Textarea', rows: this.textareaApi },
  ];

  protected readonly tokens: { name: string; description: string }[] = [
    {
      name: '--mimi-input-height',
      description:
        'Alto del tamaño default y alto mínimo de Textarea. Si no, --mimi-control-height.',
    },
    {
      name: '--mimi-input-height-sm',
      description: 'Alto del tamaño sm. Si no, --mimi-control-height-sm.',
    },
    {
      name: '--mimi-input-height-lg',
      description: 'Alto del tamaño lg. Si no, --mimi-control-height-lg.',
    },
    { name: '--mimi-input-radius', description: 'Radio. Si no, --mimi-radius.' },
    { name: '--mimi-input-padding-x', description: 'Padding horizontal (0.75rem).' },
    {
      name: '--mimi-input-font-size',
      description: 'Tamaño de letra del tamaño default y de Textarea (0.875rem).',
    },
    { name: '--mimi-input-border-width', description: 'Grosor del borde (1px).' },
    { name: '--mimi-input-focus-ring-width', description: 'Grosor del halo de foco (3px).' },
    {
      name: '--mimi-input-placeholder-color',
      description: 'Color del placeholder. Si no, --mimi-muted-foreground.',
    },
    { name: '--mimi-input-disabled-opacity', description: 'Opacidad deshabilitado (0.5).' },
  ];
}
