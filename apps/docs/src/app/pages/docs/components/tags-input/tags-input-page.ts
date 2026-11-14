import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_CHIP_TEXT_ES, provideMimiChipText } from '@/components/ui/chip';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { MIMI_TAGS_INPUT_TEXT_ES, provideMimiTagsInputText } from '@/components/ui/tags-input';
import { CodeBlock } from '../../../../code/code-block';
import { FormsTabs } from '../../../../code/forms-tabs';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { TagsInputBasicExample } from './examples/tags-input-basic.example';
import { TagsInputCustomExample } from './examples/tags-input-custom.example';
import { TagsInputFormsExample } from './examples/tags-input-forms.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/tags-input-basic.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/tags-input-custom.example' with { loader: 'text' };
// @ts-expect-error
import formsSource from './examples/tags-input-forms.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Tags Input (tarea G2.6). */
@Component({
  selector: 'app-tags-input-page',
  imports: [
    CodeBlock,
    FormsTabs,
    CodePreview,
    CssVariables,
    InstallCommand,
    TagsInputBasicExample,
    TagsInputFormsExample,
    TagsInputCustomExample,
  ],
  providers: [
    provideMimiTagsInputText(MIMI_TAGS_INPUT_TEXT_ES),
    provideMimiChipText(MIMI_CHIP_TEXT_ES),
    provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
  ],
  templateUrl: './tags-input-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputPage {
  protected readonly source = {
    basic: basicSource as string,
    forms: formsSource as string,
    custom: customSource as string,
  };

  protected readonly usage = [
    "import { MimiTagsInput } from '@/components/ui/tags-input';",
    '',
    '@Component({',
    '  imports: [MimiTagsInput],',
    '  template: `<mimi-tags-input aria-label="Etiquetas" [limit]="5" [(value)]="tags" />`,',
    '})',
    'export class ProjectComponent {',
    "  tags = signal(['angular']);",
    '}',
  ].join('\n');

  protected readonly texts = [
    '// app.config.ts: los archivos de textos, no los índices.',
    "import { MIMI_CHIP_TEXT_ES, provideMimiChipText } from '@/components/ui/chip/chip-texts';",
    'import {',
    '  MIMI_TAGS_INPUT_TEXT_ES,',
    '  provideMimiTagsInputText,',
    "} from '@/components/ui/tags-input/tags-input-texts';",
    '',
    'providers: [',
    '  provideMimiTagsInputText(MIMI_TAGS_INPUT_TEXT_ES),',
    '  provideMimiChipText(MIMI_CHIP_TEXT_ES), // «Quitar …» y los anuncios',
    ']',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'value',
      type: 'string[]',
      default: '[]',
      description:
        'Las etiquetas. Admite [(value)], [formField], formControlName y [(ngModel)]. Lo escrito sin agregar no cuenta.',
    },
    {
      name: 'limit',
      type: 'number',
      default: '—',
      description: 'Máximo de etiquetas, con contador. Al llegar, el campo queda en solo lectura.',
    },
    {
      name: 'separators',
      type: 'string[]',
      default: "[',']",
      description: 'Caracteres que agregan la etiqueta al escribirlos (además de Enter).',
    },
    {
      name: 'normalize',
      type: '(tag) => string',
      default: 'quita espacios',
      description: 'Normaliza antes de agregar (por ejemplo, minúsculas).',
    },
    {
      name: 'validate',
      type: '(tag) => string | null',
      default: '—',
      description: 'Valida una etiqueta: el mensaje aparece debajo y no se agrega.',
    },
    {
      name: 'allowDuplicates',
      type: 'boolean',
      default: 'false',
      description: 'Permite etiquetas repetidas.',
    },
    {
      name: 'hint',
      type: 'string',
      default: 'la ayuda',
      description: 'Texto debajo del campo cuando no hay error ni límite.',
    },
    {
      name: 'placeholder / disabled / readonly / id / aria-label',
      type: '—',
      default: '—',
      description: 'Los del campo de texto.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases de la caja, mezcladas con cn().',
    },
  ];
}
