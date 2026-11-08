import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_COMMAND_TEXT_ES, provideMimiCommandText } from '@/components/ui/command';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { CommandDialogExample } from './examples/command-dialog.example';
import { CommandInlineExample } from './examples/command-inline.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import dialogSource from './examples/command-dialog.example' with { loader: 'text' };
// @ts-expect-error
import inlineSource from './examples/command-inline.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Command (tarea G3.3). */
@Component({
  selector: 'app-command-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    CommandDialogExample,
    CommandInlineExample,
  ],
  providers: [provideMimiCommandText(MIMI_COMMAND_TEXT_ES)],
  templateUrl: './command-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPage {
  protected readonly source = {
    dialog: dialogSource as string,
    inline: inlineSource as string,
  };

  protected readonly usage = [
    'import {',
    '  MimiCommandImports,',
    '  type MimiCommandGroup,',
    '  type MimiCommandItem,',
    "} from '@/components/ui/command';",
    '',
    '@Component({',
    '  imports: [MimiCommandImports],',
    '  template: `',
    '    <mimi-command-dialog [(open)]="open" [items]="commands" (run)="run($event)" />',
    '  `,',
    '})',
    'export class AppComponent {',
    '  open = signal(false);',
    '  commands: MimiCommandGroup[] = [',
    "    { label: 'Navegación', items: [{ id: 'billing', label: 'Ir a facturación' }] },",
    '  ];',
    '  run(command: MimiCommandItem) {',
    '    // command.id, command.data…',
    '  }',
    '}',
  ].join('\n');

  protected readonly item = [
    'interface MimiCommandItem<T = unknown> {',
    '  id: string;',
    '  label: string;',
    '  keywords?: string[]; // otras palabras con las que se encuentra',
    "  shortcut?: string[]; // ['⌘', 'N']: solo se muestra",
    "  tone?: 'info' | 'success' | 'warning' | 'danger';",
    '  disabled?: boolean;',
    '  data?: T;',
    '}',
  ].join('\n');

  protected readonly texts = [
    "import { MIMI_COMMAND_TEXT_ES, provideMimiCommandText } from '@/components/ui/command';",
    '',
    '// app.config.ts',
    'providers: [provideMimiCommandText(MIMI_COMMAND_TEXT_ES)],',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'items',
      type: '(MimiCommandItem | MimiCommandGroup)[]',
      default: '[]',
      description: 'Los comandos, sueltos o en grupos ({ label, items }).',
    },
    {
      name: 'open',
      type: 'boolean',
      default: 'false',
      description: 'Solo mimi-command-dialog. Abierta o cerrada; admite [(open)].',
    },
    {
      name: 'shortcut',
      type: 'string',
      default: "'k'",
      description:
        'Solo mimi-command-dialog. Letra que, con ⌘ (Mac) o Ctrl, abre y cierra la paleta. Vacío: sin atajo.',
    },
    {
      name: 'query',
      type: 'string',
      default: "''",
      description: 'Solo mimi-command. Lo escrito; admite [(query)].',
    },
    {
      name: 'placeholder',
      type: 'string',
      default: '«Type a command or search…»',
      description: 'Texto del buscador vacío.',
    },
    {
      name: 'aria-label',
      type: 'string',
      default: '«Command palette»',
      description: 'Nombre del diálogo y de la lista.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Se mezcla con cn(): en mimi-command, la paleta; en el diálogo, el panel.',
    },
  ];

  protected readonly outputs: ApiRow[] = [
    {
      name: 'run',
      type: 'MimiCommandItem',
      default: '—',
      description:
        'Se ejecutó un comando (Enter o clic; los deshabilitados no). El diálogo se cierra antes.',
    },
  ];

  protected readonly parts: ApiRow[] = [
    {
      name: 'ng-template[mimiCommandIcon]',
      type: 'let-item',
      default: '—',
      description: 'El ícono de cada comando, en su caja de 26px con el color de tone.',
    },
    {
      name: '[mimiCommandEmpty]',
      type: 'contenido',
      default: '—',
      description: 'Lo que va debajo de «sin resultados» (por ejemplo, un botón).',
    },
  ];
}
