import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { ContextMenuBasicExample } from './examples/context-menu-basic.example';
import { ContextMenuCheckboxExample } from './examples/context-menu-checkbox.example';
import { ContextMenuDisabledExample } from './examples/context-menu-disabled.example';
import { ContextMenuSubmenuExample } from './examples/context-menu-submenu.example';
import { ContextMenuTableExample } from './examples/context-menu-table.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/context-menu-basic.example' with { loader: 'text' };
// @ts-expect-error
import checkboxSource from './examples/context-menu-checkbox.example' with { loader: 'text' };
// @ts-expect-error
import disabledSource from './examples/context-menu-disabled.example' with { loader: 'text' };
// @ts-expect-error
import submenuSource from './examples/context-menu-submenu.example' with { loader: 'text' };
// @ts-expect-error
import tableSource from './examples/context-menu-table.example' with { loader: 'text' };

/** Documentación de Context Menu (tarea G1.4). */
@Component({
  selector: 'app-context-menu-page',
  imports: [
    RouterLink,
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    ContextMenuBasicExample,
    ContextMenuCheckboxExample,
    ContextMenuDisabledExample,
    ContextMenuSubmenuExample,
    ContextMenuTableExample,
  ],
  templateUrl: './context-menu-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuPage {
  protected readonly source = {
    basic: basicSource as string,
    checkbox: checkboxSource as string,
    disabled: disabledSource as string,
    submenu: submenuSource as string,
    table: tableSource as string,
  };

  protected readonly usage = [
    "import { MimiContextMenuImports } from '@/components/ui/context-menu';",
    '',
    '@Component({',
    "  selector: 'app-file-list',",
    '  imports: [MimiContextMenuImports],',
    '  template: `',
    '    <mimi-context-menu label="Acciones del archivo">',
    '      @for (file of files; track file.id) {',
    '        <div mimiContextMenuTrigger [mimiContextMenuTriggerData]="file">{{ file.name }}</div>',
    '      }',
    '      <ng-template mimiContextMenuContent let-file>',
    '        <mimi-menu-item (selected)="rename(file)">Renombrar</mimi-menu-item>',
    '        <mimi-menu-separator />',
    '        <mimi-menu-item tone="danger" (selected)="remove(file)">Eliminar</mimi-menu-item>',
    '      </ng-template>',
    '    </mimi-context-menu>',
    '  `,',
    '})',
    'export class FileListComponent {}',
  ].join('\n');

  protected readonly depsCss = [
    '/* styles.css */',
    '@import "tailwindcss";',
    '@import "./app/components/ui/theme/theme-base.css";',
    '@import "@angular/cdk/overlay-prebuilt.css";',
  ].join('\n');

  protected readonly parts = [
    {
      name: '<mimi-context-menu>',
      description: 'Contenedor: estado, nombre accesible y desactivado. Su class va al panel.',
    },
    {
      name: '[mimiContextMenuTrigger]',
      description:
        'La zona que abre el menú. Puede ir en varios elementos (cada fila de una tabla); [mimiContextMenuTriggerData] pasa un dato al contenido.',
    },
    {
      name: '<ng-template mimiContextMenuContent let-dato>',
      description:
        'Los ítems, los mismos del Dropdown Menu. Se crean en cada apertura; dato es el del trigger.',
    },
  ];

  protected readonly api = [
    {
      name: 'open',
      type: 'boolean (model)',
      default: 'false',
      description: 'Abierto o cerrado. Abierto desde tu código, va junto al primer trigger.',
    },
    {
      name: 'label',
      type: 'string',
      default: "''",
      description:
        'Nombre accesible del menú. Hace falta: en modo desarrollo, Mimi avisa si falta.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Sin menú propio: el clic derecho muestra el del navegador.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del panel, mezcladas con cn(): tus clases ganan.',
    },
    {
      name: 'mimiContextMenuTriggerData',
      type: 'unknown',
      default: 'undefined',
      description: 'En el trigger: el dato que recibe el contenido (let-dato).',
    },
  ];
}
