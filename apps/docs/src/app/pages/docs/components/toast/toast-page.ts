import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_DIALOG_TEXT_ES, provideMimiDialogText } from '@/components/ui/dialog';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { ToastActionExample } from './examples/toast-action.example';
import { ToastBasicExample } from './examples/toast-basic.example';
import { ToastCustomClassExample } from './examples/toast-custom-class.example';
import { ToastInDialogExample } from './examples/toast-in-dialog.example';
import { ToastPromiseExample } from './examples/toast-promise.example';
import { ToastSolidExample } from './examples/toast-solid.example';
import { ToastTonesExample } from './examples/toast-tones.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import actionSource from './examples/toast-action.example' with { loader: 'text' };
// @ts-expect-error
import basicSource from './examples/toast-basic.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/toast-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import inDialogSource from './examples/toast-in-dialog.example' with { loader: 'text' };
// @ts-expect-error
import promiseSource from './examples/toast-promise.example' with { loader: 'text' };
// @ts-expect-error
import solidSource from './examples/toast-solid.example' with { loader: 'text' };
// @ts-expect-error
import tonesSource from './examples/toast-tones.example' with { loader: 'text' };

/** Documentación de Toast (tarea G1.8). Los textos en español van en app.config.ts. */
@Component({
  selector: 'app-toast-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    ToastActionExample,
    ToastBasicExample,
    ToastCustomClassExample,
    ToastInDialogExample,
    ToastPromiseExample,
    ToastSolidExample,
    ToastTonesExample,
  ],
  // La X del Dialog del ejemplo «Desde un Dialog», en español.
  providers: [provideMimiDialogText(MIMI_DIALOG_TEXT_ES)],
  templateUrl: './toast-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastPage {
  protected readonly source = {
    action: actionSource as string,
    basic: basicSource as string,
    customClass: customClassSource as string,
    inDialog: inDialogSource as string,
    promise: promiseSource as string,
    solid: solidSource as string,
    tones: tonesSource as string,
  };

  protected readonly usage = [
    "import { injectMimiToast } from '@/components/ui/toast';",
    '',
    'export class ProjectComponent {',
    '  private readonly toast = injectMimiToast();',
    '',
    '  save() {',
    "    this.toast.success('Cambios guardados');",
    "    this.toast.error('No se pudo guardar', {",
    "      description: 'Revisa tu conexión.',",
    "      action: { label: 'Reintentar', onClick: () => this.save() },",
    '    });',
    '  }',
    '}',
  ].join('\n');

  protected readonly config = [
    '// app.config.ts (opcional)',
    "import { provideMimiToast } from '@/components/ui/toast/toast-config';",
    '',
    'export const appConfig: ApplicationConfig = {',
    "  providers: [provideMimiToast({ position: 'top-center', duration: 5000, hotkey: 'F8' })],",
    '};',
  ].join('\n');

  protected readonly texts = [
    '// app.config.ts: el nombre de la región se lee en la raíz.',
    "import { MIMI_TOAST_TEXT_ES, provideMimiToastText } from '@/components/ui/toast/toast-texts';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [provideMimiToastText(MIMI_TOAST_TEXT_ES)],',
    '};',
  ].join('\n');

  /** Vista estática de cada posición (la pila es una por aplicación). */
  protected readonly positions = [
    { name: 'top-left', classes: 'top-2 left-2' },
    { name: 'top-center', classes: 'top-2 left-1/2 -translate-x-1/2' },
    { name: 'top-right', classes: 'top-2 right-2' },
    { name: 'bottom-left', classes: 'bottom-2 left-2' },
    { name: 'bottom-center', classes: 'bottom-2 left-1/2 -translate-x-1/2' },
    { name: 'bottom-right', classes: 'right-2 bottom-2' },
  ];

  protected readonly api = [
    {
      name: 'description',
      type: 'string',
      default: '—',
      description: 'Texto bajo el título.',
    },
    {
      name: 'action',
      type: '{ label, onClick }',
      default: '—',
      description:
        'Botón de acción. Al pulsarlo, el toast se cierra. Con acción no se cierra solo.',
    },
    {
      name: 'duration',
      type: 'number',
      default: '6000',
      description: 'Milisegundos hasta cerrarse. Infinity: no se cierra solo.',
    },
    {
      name: 'icon',
      type: 'TemplateRef | false',
      default: 'el del tono',
      description: 'Ícono propio (una plantilla con un <svg>), o false para no mostrar ninguno.',
    },
    {
      name: 'variant',
      type: "'outline' | 'solid'",
      default: "'outline'",
      description:
        'Tarjeta con borde, o del color del tono (solid sin tono se ve como la tarjeta).',
    },
    {
      name: 'id',
      type: 'string',
      default: '—',
      description: 'Con el id de un toast abierto, lo reemplaza.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del toast, mezcladas con cn(): tus clases ganan.',
    },
  ];

  protected readonly members = [
    { name: 'toast(título, opciones?)', description: 'Toast neutro. Devuelve su id.' },
    {
      name: 'toast.success / info / warning / error',
      description: 'Con el tono y su ícono. error usa el tono danger y se anuncia con prioridad.',
    },
    {
      name: 'toast.promise(promesa, { loading, success, error })',
      description:
        'Cargando mientras está pendiente y después el resultado. Devuelve la misma promesa.',
    },
    { name: 'toast.dismiss(id?)', description: 'Cierra un toast, o todos sin id.' },
  ];

  protected readonly options = [
    { name: 'position', type: 'MimiToastPosition', default: "'bottom-right'" },
    { name: 'duration', type: 'number', default: '6000' },
    { name: 'hotkey', type: 'string', default: "'F8'" },
  ];
}
