import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { CheckboxSelectAllExample } from './examples/checkbox-select-all.example';
import { CheckboxStatesExample } from './examples/checkbox-states.example';
import { SwitchCustomClassExample } from './examples/switch-custom-class.example';
import { SwitchLabelsExample } from './examples/switch-labels.example';
import { SwitchReactiveFormsExample } from './examples/switch-reactive-forms.example';
import { SwitchSignalFormsExample } from './examples/switch-signal-forms.example';
import { SwitchStatesExample } from './examples/switch-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import checkboxSelectAllSource from './examples/checkbox-select-all.example' with {
  loader: 'text',
};
// @ts-expect-error
import checkboxStatesSource from './examples/checkbox-states.example' with { loader: 'text' };
// @ts-expect-error
import switchCustomClassSource from './examples/switch-custom-class.example' with {
  loader: 'text',
};
// @ts-expect-error
import switchLabelsSource from './examples/switch-labels.example' with { loader: 'text' };
// @ts-expect-error
import switchReactiveFormsSource from './examples/switch-reactive-forms.example' with {
  loader: 'text',
};
// @ts-expect-error
import switchSignalFormsSource from './examples/switch-signal-forms.example' with {
  loader: 'text',
};
// @ts-expect-error
import switchStatesSource from './examples/switch-states.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

const COMMON_API: ApiRow[] = [
  {
    name: 'checked',
    type: 'boolean (model)',
    default: 'false',
    description: 'Estado. Úsalo con [(checked)] o deja que lo maneje el formulario.',
  },
  {
    name: 'disabled',
    type: 'boolean',
    default: 'false',
    description: 'Deshabilita el control. Con un formulario, lo pasa el formulario.',
  },
  {
    name: 'id',
    type: 'string',
    default: 'automático',
    description: 'id del botón interno, para nombrarlo con un <label for> externo.',
  },
  {
    name: 'aria-label',
    type: 'string',
    default: '—',
    description: 'Nombre accesible cuando no hay texto ni etiqueta externa.',
  },
  {
    name: 'invalid, touched, dirty, required',
    type: 'boolean',
    default: 'false',
    description:
      'Los pasa el formulario. Con inválido y tocado o modificado, el control lleva aria-invalid.',
  },
  {
    name: 'class',
    type: 'string',
    default: "''",
    description: 'Clases del envoltorio (control + texto). Se mezclan con cn(): las tuyas ganan.',
  },
];

const CHECKBOX_API: ApiRow[] = [
  COMMON_API[0],
  {
    name: 'indeterminate',
    type: 'boolean (model)',
    default: 'false',
    description:
      'Estado mixto (aria-checked="mixed"): gana a checked. Al hacer clic se marca y deja de ser mixto.',
  },
  ...COMMON_API.slice(1),
];

/** Documentación de Switch y Checkbox (tareas 2.9 y 2.10). */
@Component({
  selector: 'app-switch-page',
  imports: [
    CodeBlock,
    CssVariables,
    CodePreview,
    InstallCommand,
    CheckboxSelectAllExample,
    CheckboxStatesExample,
    SwitchCustomClassExample,
    SwitchLabelsExample,
    SwitchReactiveFormsExample,
    SwitchSignalFormsExample,
    SwitchStatesExample,
  ],
  templateUrl: './switch-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchPage {
  protected readonly source = {
    checkboxSelectAll: checkboxSelectAllSource as string,
    checkboxStates: checkboxStatesSource as string,
    customClass: switchCustomClassSource as string,
    labels: switchLabelsSource as string,
    reactiveForms: switchReactiveFormsSource as string,
    signalForms: switchSignalFormsSource as string,
    switchStates: switchStatesSource as string,
  };

  protected readonly usage = [
    "import { MimiCheckbox } from '@/components/ui/checkbox';",
    "import { MimiSwitch } from '@/components/ui/switch';",
    '',
    '@Component({',
    "  selector: 'app-ajustes',",
    '  imports: [MimiSwitch, MimiCheckbox],',
    '  template: `',
    '    <mimi-switch [(checked)]="avion">Modo avión</mimi-switch>',
    '    <mimi-checkbox [(checked)]="recordarme">Recordarme</mimi-checkbox>',
    '  `,',
    '})',
    'export class AjustesComponent {',
    '  readonly avion = signal(false);',
    '  readonly recordarme = signal(true);',
    '}',
  ].join('\n');

  protected readonly apiTables = [
    { id: 'api-switch', title: 'mimi-switch', rows: COMMON_API },
    { id: 'api-checkbox', title: 'mimi-checkbox', rows: CHECKBOX_API },
  ];
}
