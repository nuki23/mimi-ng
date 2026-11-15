import type { DocPage } from '../../../../doc-page/doc-page.types';
import { FileUploadBasicExample } from './examples/file-upload-basic.example';
import { FileUploadDemoExample } from './examples/file-upload-demo.example';
import { FileUploadListExample } from './examples/file-upload-list.example';
import { FileUploadStatesExample } from './examples/file-upload-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/file-upload-basic.example' with { loader: 'text' };
// @ts-expect-error
import demoSource from './examples/file-upload-demo.example' with { loader: 'text' };
// @ts-expect-error
import listSource from './examples/file-upload-list.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/file-upload-states.example' with { loader: 'text' };
// @ts-expect-error
import simulatedSource from './examples/simulated-upload' with { loader: 'text' };

/** La página de File Upload (tarea G2.11), con la plantilla de página (DP.2). */
export const FILE_UPLOAD_PAGE: DocPage = {
  name: 'File Upload',
  lead: 'Zona para elegir archivos con un clic, el teclado o arrastrando, con validación y la lista con el progreso que da tu app.',
  demo: {
    id: 'demo',
    title: '',
    sentence:
      'Con `accept` y `maxSize`, los que no cumplen llegan a `(rejected)` con su motivo. Suelta o elige varios archivos.',
    component: FileUploadDemoExample,
    source: demoSource as string,
  },
  install: 'file-upload',
  usage: {
    code: [
      "import { MimiFileUploadImports } from '@/components/ui/file-upload';",
      '',
      '@Component({',
      '  imports: [MimiFileUploadImports],',
      '  template: `',
      '    <mimi-file-upload #zone heading="Adjuntos" accept="image/*" multiple [(value)]="files" />',
      '    <mimi-file-list [emptyFocus]="zone">',
      '      @for (file of files(); track file) {',
      '        <mimi-file-item [file]="file" [status]="statusOf(file)" (remove)="remove(file)" />',
      '      }',
      '    </mimi-file-list>',
      '  `,',
      '})',
    ].join('\n'),
    note: 'Mimi no sube nada: la subida es de tu app, que pasa a cada fila su `status` y su `progress`.',
  },
  examples: {
    states: [
      {
        id: 'states',
        title: 'Estados',
        sentence:
          'Deshabilitado, solo lectura (se enfoca, pero no abre el selector ni acepta archivos soltados) y con error, como lo deja un formulario.',
        component: FileUploadStatesExample,
        source: statesSource as string,
      },
    ],
    advanced: [
      {
        id: 'basic',
        title: 'Con la subida simulada',
        sentence:
          'Prueba con imágenes y PDF; un archivo cuyo nombre tenga «error» falla la primera vez y se puede reintentar.',
        component: FileUploadBasicExample,
        source: basicSource as string,
        files: [
          { name: 'file-upload-basic.example.ts', code: basicSource as string },
          { name: 'simulated-upload.ts', code: simulatedSource as string },
        ],
      },
      {
        id: 'list',
        title: 'Archivos ya subidos e ícono propio',
        sentence:
          'Sin un `File`: `[name]`, `[size]` y `[type]` bastan para los que ya están en el servidor. `mimiFileIcon` cambia el ícono.',
        component: FileUploadListExample,
        source: listSource as string,
      },
    ],
  },
  forms: 'file-upload',
  accessibility: {
    points: [
      'El nombre accesible de la zona es su título visible (`heading`); `aria-label` y `aria-labelledby` van delante, sin reemplazarlo.',
      'La zona es un botón: se usa sin arrastrar, con Enter o Espacio. Su descripción (`hint`) dice qué acepta.',
      'Se anuncian los archivos agregados y los rechazados (con el motivo), y cuándo uno termina o falla, no cada porcentaje.',
      'Al quitar un archivo, el foco pasa al siguiente, al anterior o a `emptyFocus`.',
      'Con `readonly`, la zona queda enfocable y con `aria-disabled`: un botón no admite `aria-readonly`.',
      'Con movimiento reducido, la zona no se agranda ni el ícono rebota.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'value',
        type: 'File[]',
        default: '[]',
        description:
          'Los archivos elegidos. Con `[(value)]` o un formulario. Los rechazados no entran.',
      },
      {
        name: 'accept',
        type: 'string',
        default: "''",
        description: 'Como en `<input type="file">`; vale también al soltar.',
      },
      {
        name: 'multiple',
        type: 'boolean',
        default: 'false',
        description: 'Varios archivos. Sin él, uno nuevo reemplaza al anterior.',
      },
      {
        name: 'maxSize, maxFiles',
        type: 'number',
        default: '—',
        description: 'Bytes por archivo y cantidad máxima (contando los que ya están).',
      },
      {
        name: 'heading',
        type: 'string',
        default: '«Arrastra archivos o haz clic»',
        description: 'Título visible de la zona; es también su nombre accesible.',
      },
      {
        name: 'hint',
        type: 'string',
        default: "''",
        description: 'Qué acepta, debajo del título. Describe la zona.',
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: 'false',
        description: 'No abre el selector ni acepta archivos. Un formulario lo pasa solo.',
      },
      {
        name: 'readonly',
        type: 'boolean',
        default: 'false',
        description: 'Se enfoca, pero no abre el selector ni acepta archivos soltados.',
      },
      {
        name: 'invalid, touched, dirty, required',
        type: 'boolean',
        default: 'false',
        description:
          'Los pasa el formulario. El error se muestra si es inválido y se tocó o modificó.',
      },
      {
        name: 'aria-label, aria-labelledby',
        type: 'string',
        default: '—',
        description:
          'Van delante del título en el nombre de la zona: el nombre contiene siempre el texto visible.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases de la zona, mezcladas con `cn()`: las tuyas ganan.',
      },
    ],
    outputs: [
      {
        name: 'rejected',
        type: 'MimiFileRejection[]',
        description:
          'Los que no se agregaron, con el motivo (`type`, `size` o `count`) y el mensaje.',
      },
      {
        name: 'touch',
        type: 'void',
        description: 'Se eligieron o soltaron archivos: el formulario marca el campo como tocado.',
      },
      {
        name: 'remove, retry (mimi-file-item)',
        type: 'void',
        description: 'Quitar la fila y Reintentar (con `status="error"`). Los resuelve tu app.',
      },
    ],
    parts: [
      {
        name: 'MimiFileList',
        selector: 'mimi-file-list',
        description:
          'La lista (`aria-label`, «Archivos» por defecto). Al quitar el último con el foco, va a `[emptyFocus]`.',
      },
      {
        name: 'MimiFileItem',
        selector: 'mimi-file-item',
        description:
          'Una fila: `[file]` o `[name]`, `[size]` y `[type]`; `[status]`, `[progress]`, `[error]`, `[retryable]` y `[thumbnailUrl]`.',
      },
      {
        name: 'MimiFileIcon',
        selector: '[mimiFileIcon]',
        description: 'Un ícono propio dentro de `mimi-file-item`, en lugar del del tipo.',
      },
    ],
    dataAttributes: ['data-state', 'data-invalid', 'data-disabled', 'data-readonly', 'data-status'],
  },
  texts: [
    {
      constant: 'MIMI_FILE_UPLOAD_TEXT_ES',
      provider: 'provideMimiFileUploadText',
      path: 'file-upload/file-upload-texts',
    },
  ],
  tokens: 'fileUpload',
};
