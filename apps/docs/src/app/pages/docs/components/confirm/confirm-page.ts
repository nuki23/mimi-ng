import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_CONFIRM_TEXT_ES, provideMimiConfirmText } from '@/components/ui/confirm';
import { MIMI_DIALOG_TEXT_ES, provideMimiDialogText } from '@/components/ui/dialog';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { ConfirmBasicExample } from './examples/confirm-basic.example';
import { ConfirmCustomClassExample } from './examples/confirm-custom-class.example';
import { ConfirmCustomTextsExample } from './examples/confirm-custom-texts.example';
import { ConfirmDangerExample } from './examples/confirm-danger.example';
import { ConfirmFromDialogExample } from './examples/confirm-from-dialog.example';
import { ConfirmFromMenuExample } from './examples/confirm-from-menu.example';
import { ConfirmIconExample } from './examples/confirm-icon.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/confirm-basic.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/confirm-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import customTextsSource from './examples/confirm-custom-texts.example' with { loader: 'text' };
// @ts-expect-error
import dangerSource from './examples/confirm-danger.example' with { loader: 'text' };
// @ts-expect-error
import fromDialogSource from './examples/confirm-from-dialog.example' with { loader: 'text' };
// @ts-expect-error
import fromMenuSource from './examples/confirm-from-menu.example' with { loader: 'text' };
// @ts-expect-error
import iconSource from './examples/confirm-icon.example' with { loader: 'text' };

/** Documentación de Confirm (tarea G1.7). */
@Component({
  selector: 'app-confirm-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    ConfirmBasicExample,
    ConfirmCustomClassExample,
    ConfirmCustomTextsExample,
    ConfirmDangerExample,
    ConfirmFromDialogExample,
    ConfirmFromMenuExample,
    ConfirmIconExample,
  ],
  // Los textos de Confirm y de Dialog (la X del ejemplo «Desde un Dialog») están en inglés por
  // defecto; este sitio usa el español. Aquí y no en app.config.ts, para no sumar nada al JS
  // inicial. injectMimiConfirm() los toma de aquí.
  providers: [
    provideMimiConfirmText(MIMI_CONFIRM_TEXT_ES),
    provideMimiDialogText(MIMI_DIALOG_TEXT_ES),
  ],
  templateUrl: './confirm-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmPage {
  protected readonly source = {
    basic: basicSource as string,
    customClass: customClassSource as string,
    customTexts: customTextsSource as string,
    danger: dangerSource as string,
    fromDialog: fromDialogSource as string,
    fromMenu: fromMenuSource as string,
    icon: iconSource as string,
  };

  protected readonly usage = [
    "import { injectMimiConfirm } from '@/components/ui/confirm';",
    '',
    'export class ProjectsComponent {',
    '  private readonly confirm = injectMimiConfirm();',
    '',
    '  async remove(project: Project) {',
    '    const ok = await this.confirm({',
    "      title: '¿Eliminar este proyecto?',",
    "      description: 'Esta acción no se puede deshacer.',",
    "      tone: 'danger',",
    '    });',
    '    if (ok) this.projects.remove(project.id);',
    '  }',
    '}',
  ].join('\n');

  protected readonly wrongContext = [
    'export class ProjectsComponent {',
    '  async remove() {',
    '    // ✗ Dentro de un método no hay contexto de inyección:',
    '    const confirm = injectMimiConfirm();',
    '  }',
    '}',
    '',
    '// Error en la consola:',
    '// NG0203: injectMimiConfirm() can only be used within an injection context such as a',
    '// constructor, a factory function, a field initializer, or a function used with',
    '// `runInInjectionContext`.',
  ].join('\n');

  protected readonly depsCss = [
    '/* styles.css */',
    '@import "tailwindcss";',
    '@import "./app/components/ui/theme/theme-base.css";',
    '@import "@angular/cdk/overlay-prebuilt.css";',
  ].join('\n');

  protected readonly texts = [
    '// app.config.ts (o los providers de una ruta o de un componente)',
    "import { MIMI_CONFIRM_TEXT_ES, provideMimiConfirmText } from '@/components/ui/confirm';",
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [provideMimiConfirmText(MIMI_CONFIRM_TEXT_ES)],',
    '};',
  ].join('\n');

  protected readonly api = [
    {
      name: 'title',
      type: 'string',
      default: '—',
      description: 'La pregunta (obligatoria). Es el nombre accesible del diálogo.',
    },
    {
      name: 'description',
      type: 'string',
      default: '—',
      description:
        'Qué pasa si se confirma. Recomendada: el lector de pantalla la anuncia junto al título.',
    },
    {
      name: 'confirmText',
      type: 'string',
      default: "'Confirm'",
      description: 'Texto del botón que confirma. Gana sobre provideMimiConfirmText.',
    },
    {
      name: 'cancelText',
      type: 'string',
      default: "'Cancel'",
      description: 'Texto del botón que cancela. Gana sobre provideMimiConfirmText.',
    },
    {
      name: 'tone',
      type: "'primary' | 'danger'",
      default: "'primary'",
      description:
        'danger: confirmar va en rojo y el foco empieza en Cancelar. Con primary empieza en Confirmar.',
    },
    {
      name: 'icon',
      type: 'TemplateRef',
      default: '—',
      description: 'Plantilla con un <svg> para el círculo de color. Sin ella, no hay círculo.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del panel, mezcladas con cn(): tus clases ganan, también el ancho.',
    },
  ];
}
