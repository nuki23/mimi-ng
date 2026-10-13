import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_DIALOG_TEXT_ES, provideMimiDialogText } from '@/components/ui/dialog';
import { MIMI_SELECT_TEXT_ES, provideMimiSelectText } from '@/components/ui/select';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { DialogBasicExample } from './examples/dialog-basic.example';
import { DialogCustomClassExample } from './examples/dialog-custom-class.example';
import { DialogFormExample } from './examples/dialog-form.example';
import { DialogFromMenuExample } from './examples/dialog-from-menu.example';
import { DialogLongContentExample } from './examples/dialog-long-content.example';
import { DialogNoDismissExample } from './examples/dialog-no-dismiss.example';
import { DialogServiceExample } from './examples/dialog-service.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/dialog-basic.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/dialog-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import formSource from './examples/dialog-form.example' with { loader: 'text' };
// @ts-expect-error
import fromMenuSource from './examples/dialog-from-menu.example' with { loader: 'text' };
// @ts-expect-error
import longContentSource from './examples/dialog-long-content.example' with { loader: 'text' };
// @ts-expect-error
import noDismissSource from './examples/dialog-no-dismiss.example' with { loader: 'text' };
// @ts-expect-error
import serviceSource from './examples/dialog-service.example' with { loader: 'text' };

/** Documentación de Dialog (tarea G1.6). */
@Component({
  selector: 'app-dialog-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    DialogBasicExample,
    DialogCustomClassExample,
    DialogFormExample,
    DialogFromMenuExample,
    DialogLongContentExample,
    DialogNoDismissExample,
    DialogServiceExample,
  ],
  // Los textos de Dialog y de Select están en inglés por defecto; este sitio usa el español.
  // Aquí y no en app.config.ts, para no sumar nada al JS inicial.
  providers: [
    provideMimiDialogText(MIMI_DIALOG_TEXT_ES),
    provideMimiSelectText(MIMI_SELECT_TEXT_ES),
  ],
  templateUrl: './dialog-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogPage {
  protected readonly source = {
    basic: basicSource as string,
    customClass: customClassSource as string,
    form: formSource as string,
    fromMenu: fromMenuSource as string,
    longContent: longContentSource as string,
    noDismiss: noDismissSource as string,
    service: serviceSource as string,
  };

  protected readonly usageTemplate = [
    "import { MimiDialogImports } from '@/components/ui/dialog';",
    '',
    '@Component({',
    "  selector: 'app-edit-user',",
    '  imports: [MimiDialogImports, MimiButton],',
    '  template: `',
    '    <mimi-dialog [(open)]="open">',
    '      <button mimiBtn mimiDialogTrigger>Editar usuario</button>',
    '      <ng-template mimiDialogContent>',
    '        <mimi-dialog-header>',
    '          <h2 mimiDialogTitle>Editar usuario</h2>',
    '          <p mimiDialogDescription>Los cambios se aplican al guardar.</p>',
    '        </mimi-dialog-header>',
    '        <mimi-dialog-body>…</mimi-dialog-body>',
    '        <mimi-dialog-footer>',
    '          <button mimiBtn variant="outline" mimiDialogClose>Cancelar</button>',
    '          <button mimiBtn (click)="save()">Guardar cambios</button>',
    '        </mimi-dialog-footer>',
    '      </ng-template>',
    '    </mimi-dialog>',
    '  `,',
    '})',
    'export class EditUserComponent {',
    '  open = signal(false);',
    '}',
  ].join('\n');

  protected readonly usageService = [
    "import { MIMI_DIALOG_DATA, MimiDialogRef, MimiDialogService } from '@/components/ui/dialog';",
    '',
    '// Quien abre:',
    'const ref = inject(MimiDialogService).open<string>(RenameProjectDialog, { data: project });',
    'ref.afterClosed().subscribe((name) => { /* undefined si se canceló */ });',
    '',
    '// Dentro de RenameProjectDialog:',
    'project = inject<Project>(MIMI_DIALOG_DATA);',
    'ref = inject<MimiDialogRef<string>>(MimiDialogRef);',
    "save() { this.ref.close('Nombre nuevo'); }",
  ].join('\n');

  protected readonly depsCss = [
    '/* styles.css */',
    '@import "tailwindcss";',
    '@import "./app/components/ui/theme/theme-base.css";',
    '@import "@angular/cdk/overlay-prebuilt.css";',
  ].join('\n');

  protected readonly texts = [
    '// app.config.ts',
    "import { MIMI_DIALOG_TEXT_ES, provideMimiDialogText } from '@/components/ui/dialog';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [provideMimiDialogText(MIMI_DIALOG_TEXT_ES)],',
    '};',
  ].join('\n');

  protected readonly parts = [
    {
      name: '<mimi-dialog>',
      description: 'El diálogo en la plantilla: [(open)] y las opciones. Su class va al panel.',
    },
    { name: '[mimiDialogTrigger]', description: 'El botón que lo abre (opcional).' },
    {
      name: '<ng-template mimiDialogContent>',
      description: 'El contenido. Se crea al abrir y se destruye al cerrar.',
    },
    {
      name: '<mimi-dialog-header>',
      description: 'Encabezado, con sitio para la X a la derecha.',
    },
    {
      name: '[mimiDialogTitle]',
      description: 'El título (en un <h2>): le da al diálogo su nombre accesible.',
    },
    { name: '[mimiDialogDescription]', description: 'La descripción (aria-describedby).' },
    {
      name: '<mimi-dialog-body>',
      description: 'El cuerpo. Si el contenido no cabe, el scroll queda aquí.',
    },
    { name: '<mimi-dialog-footer>', description: 'El pie, con las acciones a la derecha.' },
    {
      name: '[mimiDialogClose]',
      description: 'Cierra al hacer clic. Con un valor, ese es el resultado.',
    },
  ];

  protected readonly api = [
    {
      name: 'data',
      type: 'D',
      default: '—',
      description: 'Datos para el contenido: inject(MIMI_DIALOG_DATA). Solo con el servicio.',
    },
    {
      name: 'width',
      type: 'string',
      default: '420px',
      description: 'Ancho del panel (cualquier valor CSS). Por defecto, --mimi-dialog-width.',
    },
    {
      name: 'maxWidth',
      type: 'string',
      default: '100vw − 32px',
      description: 'Ancho máximo. Nunca supera el ancho de la pantalla menos 32px.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del panel, mezcladas con cn(): tus clases ganan.',
    },
    {
      name: 'closeOnEscape',
      type: 'boolean',
      default: 'true',
      description: 'Escape cierra.',
    },
    {
      name: 'closeOnBackdropClick',
      type: 'boolean',
      default: 'true',
      description: 'Un clic en el fondo cierra.',
    },
    {
      name: 'disableClose',
      type: 'boolean',
      default: 'false',
      description: 'Atajo: ni Escape ni el clic en el fondo cierran. La X sigue funcionando.',
    },
    {
      name: 'closeButton',
      type: 'boolean',
      default: 'true',
      description:
        'La X se ve siempre; ocúltala solo en diálogos de confirmación que tienen sus propios botones de salida.',
    },
    {
      name: 'ariaLabel (aria-label en la plantilla)',
      type: 'string',
      default: '—',
      description: 'Nombre accesible, si el contenido no tiene un mimiDialogTitle.',
    },
    {
      name: 'autoFocus',
      type: "'first' | 'dialog' | selector CSS",
      default: "'first'",
      description:
        'A dónde va el foco al abrir: el primer elemento enfocable, el panel o el elemento del selector.',
    },
    {
      name: 'role',
      type: "'dialog' | 'alertdialog'",
      default: "'dialog'",
      description: 'alertdialog para una confirmación que interrumpe. Solo con el servicio.',
    },
    {
      name: 'injector',
      type: 'Injector',
      default: 'el de la app',
      description: 'Injector para el contenido. Solo con el servicio.',
    },
  ];

  protected readonly members = [
    {
      name: 'MimiDialogService.open(contenido, opciones?)',
      description:
        'Abre un componente o un TemplateRef y devuelve su MimiDialogRef. closeAll() cierra todos.',
    },
    {
      name: 'MimiDialogRef.close(resultado?)',
      description: 'Cierra el diálogo, con un resultado opcional.',
    },
    {
      name: 'MimiDialogRef.afterClosed()',
      description:
        'Observable que emite una vez, con el resultado, cuando el diálogo ya se cerró (undefined si se canceló).',
    },
    {
      name: '<mimi-dialog> [(open)] y (closed)',
      description: 'En la plantilla: open abre y cierra; (closed) trae el resultado.',
    },
  ];
}
