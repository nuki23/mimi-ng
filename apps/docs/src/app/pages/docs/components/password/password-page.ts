import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_PASSWORD_TEXT_ES, provideMimiPasswordText } from '@/components/ui/password';
import { CodeBlock } from '../../../../code/code-block';
import { FormsTabs } from '../../../../code/forms-tabs';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { PasswordCustomExample } from './examples/password-custom.example';
import { PasswordLevelsExample } from './examples/password-levels.example';
import { PasswordLoginExample } from './examples/password-login.example';
import { PasswordNewExample } from './examples/password-new.example';
import { PasswordReadonlyExample } from './examples/password-readonly.example';
import { PasswordStatesExample } from './examples/password-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import customSource from './examples/password-custom.example' with { loader: 'text' };
// @ts-expect-error
import levelsSource from './examples/password-levels.example' with { loader: 'text' };
// @ts-expect-error
import loginSource from './examples/password-login.example' with { loader: 'text' };
// @ts-expect-error
import newSource from './examples/password-new.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/password-states.example' with { loader: 'text' };
// @ts-expect-error
import readonlySource from './examples/password-readonly.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Password (tarea G2.3). */
@Component({
  selector: 'app-password-page',
  imports: [
    CodeBlock,
    FormsTabs,
    CodePreview,
    CssVariables,
    InstallCommand,
    PasswordNewExample,
    PasswordLoginExample,
    PasswordLevelsExample,
    PasswordStatesExample,
    PasswordReadonlyExample,
    PasswordCustomExample,
  ],
  providers: [provideMimiPasswordText(MIMI_PASSWORD_TEXT_ES)],
  templateUrl: './password-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordPage {
  protected readonly source = {
    new: newSource as string,
    login: loginSource as string,
    levels: levelsSource as string,
    states: statesSource as string,
    readonly: readonlySource as string,
    custom: customSource as string,
  };

  protected readonly usage = [
    "import { MimiInput } from '@/components/ui/input';",
    "import { MimiPassword } from '@/components/ui/password';",
    '',
    '@Component({',
    '  imports: [MimiPassword, MimiInput, ReactiveFormsModule],',
    '  template: `',
    '    <mimi-password meter>',
    '      <input mimiInput type="password" autocomplete="new-password" formControlName="password" />',
    '    </mimi-password>',
    '  `,',
    '})',
  ].join('\n');

  protected readonly texts = [
    '// app.config.ts: el archivo de textos, no el índice del componente.',
    "import { MIMI_PASSWORD_TEXT_ES, provideMimiPasswordText } from '@/components/ui/password/password-texts';",
    '',
    'providers: [provideMimiPasswordText(MIMI_PASSWORD_TEXT_ES)]',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      description:
        'Solo lectura: el <input> de dentro queda readonly (se ve y se enfoca, no se edita). El ojo sigue funcionando.',
    },
    {
      name: 'meter',
      type: 'boolean',
      default: 'false',
      description: 'Muestra el medidor (nivel y reglas) debajo del campo. Es orientativo.',
    },
    {
      name: 'rules',
      type: 'MimiPasswordRule[]',
      default: 'las cuatro del diseño',
      description:
        '{ label, test(value) }. Por defecto: 8 caracteres o más, una mayúscula, un número y un símbolo. Con [] no hay lista y el nivel lo da strength.',
    },
    {
      name: 'strength',
      type: '(value: string) => 0 | 1 | 2 | 3',
      default: 'la heurística',
      description:
        'Nivel propio. Por defecto: todas las reglas, fuerte; al menos la mitad, media; menos, débil.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases de la caja, mezcladas con cn(): tus clases ganan.',
    },
  ];
}
