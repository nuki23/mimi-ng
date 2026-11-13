import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlock } from '../../../../code/code-block';
import { FormsTabs } from '../../../../code/forms-tabs';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
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

/**
 * Documentación de Input (tarea 2.2). Compartía página con Textarea hasta el 13/11/2026; ahora
 * Textarea tiene la suya (`../textarea`). «En fila» se queda aquí: muestra Input con Textarea y
 * Button alineados.
 */
@Component({
  selector: 'app-input-page',
  imports: [
    RouterLink,
    CodeBlock,
    FormsTabs,
    CssVariables,
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
  };

  protected readonly usage = [
    "import { MimiInput } from '@/components/ui/input';",
    '',
    '@Component({',
    "  selector: 'app-contact',",
    '  imports: [MimiInput],',
    '  template: `<input mimiInput type="email" placeholder="tu@correo.com" />`,',
    '})',
    'export class ContactComponent {}',
  ].join('\n');

  protected readonly inputApi: ApiRow[] = [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md' (o el del contenedor con mimiSize)",
      description:
        'Alto y tamaño de letra, iguales a los de Button. Reemplaza al atributo nativo size de <input> (el ancho en caracteres): para el ancho, usa class.',
    },
    SHOW_ERROR,
    CLASS,
  ];

  protected readonly apiTables = [{ id: 'api-input', title: 'Input', rows: this.inputApi }];
}
