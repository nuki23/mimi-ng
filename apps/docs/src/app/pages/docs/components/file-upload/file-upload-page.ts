import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_FILE_UPLOAD_TEXT_ES, provideMimiFileUploadText } from '@/components/ui/file-upload';
import { MIMI_ERROR_MESSAGES_ES, provideMimiErrorMessages } from '@/components/ui/form-field';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { FileUploadBasicExample } from './examples/file-upload-basic.example';
import { FileUploadFormsExample } from './examples/file-upload-forms.example';
import { FileUploadListExample } from './examples/file-upload-list.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/file-upload-basic.example' with { loader: 'text' };
// @ts-expect-error
import formsSource from './examples/file-upload-forms.example' with { loader: 'text' };
// @ts-expect-error
import listSource from './examples/file-upload-list.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de File Upload (tarea G2.11). */
@Component({
  selector: 'app-file-upload-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    FileUploadBasicExample,
    FileUploadListExample,
    FileUploadFormsExample,
  ],
  providers: [
    provideMimiFileUploadText(MIMI_FILE_UPLOAD_TEXT_ES),
    provideMimiErrorMessages(MIMI_ERROR_MESSAGES_ES),
  ],
  templateUrl: './file-upload-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadPage {
  protected readonly source = {
    basic: basicSource as string,
    list: listSource as string,
    forms: formsSource as string,
  };

  protected readonly usage = [
    "import { MimiFileUploadImports } from '@/components/ui/file-upload';",
    '',
    '@Component({',
    '  imports: [MimiFileUploadImports],',
    '  template: `',
    '    <mimi-file-upload #zone accept="image/*" multiple [(value)]="files" />',
    '    <mimi-file-list [emptyFocus]="zone">',
    '      @for (file of files(); track file) {',
    '        <mimi-file-item [file]="file" [status]="statusOf(file)" (remove)="remove(file)" />',
    '      }',
    '    </mimi-file-list>',
    '  `,',
    '})',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'value',
      type: 'File[]',
      default: '[]',
      description:
        'Los archivos elegidos (mimi-file-upload). Admite [(value)], [formField], formControlName y [(ngModel)]. Los rechazados no entran.',
    },
    {
      name: 'accept / multiple',
      type: 'string / boolean',
      default: "'' / false",
      description:
        'Como en <input type="file">; accept vale también al soltar. Sin multiple, uno nuevo reemplaza al anterior.',
    },
    {
      name: 'maxSize / maxFiles',
      type: 'number',
      default: '—',
      description: 'Bytes por archivo y cantidad máxima (contando los que ya están).',
    },
    {
      name: 'title / hint',
      type: 'string',
      default: '«Arrastra archivos o haz clic» / —',
      description: 'Título de la zona y qué acepta (describe la zona).',
    },
    {
      name: '(rejected)',
      type: 'MimiFileRejection[]',
      default: '—',
      description: 'Los que no se agregaron, con el motivo (type, size o count) y el mensaje.',
    },
    {
      name: 'mimi-file-item',
      type: '[file] o [name] [size] [type] · [status] [progress] [error] [retryable]',
      default: "status 'idle'",
      description:
        "Una fila con el estado que da la app: 'uploading' (con progress), 'done' o 'error' (con error y Reintentar). Salidas (remove) y (retry). [mimiFileIcon] cambia el ícono.",
    },
    {
      name: 'mimi-file-list',
      type: '[emptyFocus] aria-label',
      default: "'Archivos'",
      description: 'La lista. Al quitar el último con el foco, el foco va a emptyFocus.',
    },
    {
      name: 'disabled / aria-label / class',
      type: '—',
      default: '—',
      description: 'De la zona de soltar.',
    },
  ];
}
