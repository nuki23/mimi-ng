import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { FormsTabs } from '../../../../code/forms-tabs';
import { InstallCommand } from '../../../../code/install-command';
import { TextareaBasicExample } from './examples/textarea-basic.example';
import { TextareaStatesExample } from './examples/textarea-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
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

/**
 * Documentación de Textarea (tarea 2.3). Tenía página compartida con Input hasta el 13/11/2026;
 * ahora cada uno tiene la suya, como Switch y Checkbox.
 */
@Component({
  selector: 'app-textarea-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    FormsTabs,
    InstallCommand,
    TextareaBasicExample,
    TextareaStatesExample,
  ],
  templateUrl: './textarea-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaPage {
  protected readonly source = {
    textareaBasic: textareaBasicSource as string,
    textareaStates: textareaStatesSource as string,
  };

  protected readonly usage = [
    "import { MimiTextarea } from '@/components/ui/textarea';",
    '',
    '@Component({',
    "  selector: 'app-feedback',",
    '  imports: [MimiTextarea],',
    '  template: `<textarea mimiTextarea rows="3" placeholder="Cuéntanos más"></textarea>`,',
    '})',
    'export class FeedbackComponent {}',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md' (o el del contenedor con mimiSize)",
      description:
        'Tamaño de letra y relleno, los de Input. Con rows="1", el mismo alto que Input y Button.',
    },
    {
      name: 'showError',
      type: 'boolean | undefined',
      default: 'undefined',
      description:
        'undefined: decide el formulario (inválido y ya tocado o modificado). true: muestra el error. false: lo oculta aunque el formulario sea inválido.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases propias. Se mezclan con cn(): las tuyas ganan.',
    },
  ];
}
