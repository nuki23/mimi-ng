import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { DropdownMenuBasicExample } from './examples/dropdown-menu-basic.example';
import { DropdownMenuCheckboxRadioExample } from './examples/dropdown-menu-checkbox-radio.example';
import { DropdownMenuDestructiveExample } from './examples/dropdown-menu-destructive.example';
import { DropdownMenuShortcutsExample } from './examples/dropdown-menu-shortcuts.example';
import { DropdownMenuSubmenuExample } from './examples/dropdown-menu-submenu.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/dropdown-menu-basic.example' with { loader: 'text' };
// @ts-expect-error
import checkboxRadioSource from './examples/dropdown-menu-checkbox-radio.example' with {
  loader: 'text',
};
// @ts-expect-error
import destructiveSource from './examples/dropdown-menu-destructive.example' with {
  loader: 'text',
};
// @ts-expect-error
import shortcutsSource from './examples/dropdown-menu-shortcuts.example' with { loader: 'text' };
// @ts-expect-error
import submenuSource from './examples/dropdown-menu-submenu.example' with { loader: 'text' };

/** Documentación de Dropdown Menu (tarea G1.3). */
@Component({
  selector: 'app-dropdown-menu-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    DropdownMenuBasicExample,
    DropdownMenuCheckboxRadioExample,
    DropdownMenuDestructiveExample,
    DropdownMenuShortcutsExample,
    DropdownMenuSubmenuExample,
  ],
  templateUrl: './dropdown-menu-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuPage {
  protected readonly source = {
    basic: basicSource as string,
    checkboxRadio: checkboxRadioSource as string,
    destructive: destructiveSource as string,
    shortcuts: shortcutsSource as string,
    submenu: submenuSource as string,
  };

  protected readonly usage = [
    "import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';",
    '',
    '@Component({',
    "  selector: 'app-project-menu',",
    '  imports: [MimiDropdownMenuImports, MimiButton],',
    '  template: `',
    '    <mimi-dropdown-menu align="start">',
    '      <button mimiBtn variant="outline" mimiDropdownMenuTrigger>Proyecto</button>',
    '      <ng-template mimiDropdownMenuContent>',
    '        <mimi-menu-item shortcut="⌘," (selected)="openSettings()">Ajustes</mimi-menu-item>',
    '        <mimi-menu-separator />',
    '        <mimi-menu-item tone="danger" (selected)="remove()">Eliminar</mimi-menu-item>',
    '      </ng-template>',
    '    </mimi-dropdown-menu>',
    '  `,',
    '})',
    'export class ProjectMenuComponent {}',
  ].join('\n');

  protected readonly depsCss = [
    '/* styles.css */',
    '@import "tailwindcss";',
    '@import "./app/components/ui/theme/theme-base.css";',
    '@import "@angular/cdk/overlay-prebuilt.css";',
  ].join('\n');

  protected readonly parts = [
    {
      name: '<mimi-dropdown-menu>',
      description: 'Contenedor: estado, posición y nombre accesible. Su class va al panel.',
    },
    {
      name: '[mimiDropdownMenuTrigger]',
      description:
        'El botón que abre y cierra (aria-haspopup="menu", aria-expanded, aria-controls).',
    },
    {
      name: '<ng-template mimiDropdownMenuContent>',
      description: 'Los ítems. Se crean al abrir y se destruyen al cerrar.',
    },
    { name: '<mimi-menu-item>', description: 'Una acción. (selected) avisa al elegirla.' },
    {
      name: '<mimi-menu-checkbox-item>',
      description: 'Opción que se marca o desmarca con [(checked)].',
    },
    {
      name: '<mimi-menu-radio-group> y <mimi-menu-radio-item>',
      description: 'Opciones excluyentes con [(value)].',
    },
    { name: '<mimi-menu-label>', description: 'Título de un grupo de ítems.' },
    { name: '<mimi-menu-separator>', description: 'Línea entre grupos.' },
    {
      name: '<mimi-menu-sub>',
      description:
        'Submenú: un <mimi-menu-sub-trigger> con el texto y un <ng-template mimiMenuSubContent> con sus ítems.',
    },
  ];

  protected readonly api = [
    {
      name: 'open',
      type: 'boolean (model)',
      default: 'false',
      description: 'Abierto o cerrado. Admite [(open)] para controlarlo desde fuera.',
    },
    {
      name: 'side',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'bottom'",
      description: 'Lado preferido. Si no cabe, pasa al opuesto y después a los otros dos.',
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'start'",
      description: 'Alineación con el botón.',
    },
    {
      name: 'label',
      type: 'string',
      default: "''",
      description: 'Nombre accesible del menú. Sin él, lo nombra el texto del botón.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del panel, mezcladas con cn(): tus clases ganan.',
    },
  ];

  protected readonly itemApi = [
    {
      name: 'mimi-menu-item',
      inputs: 'tone (default | danger), shortcut, disabled, textValue, class',
      outputs: '(selected)',
    },
    {
      name: 'mimi-menu-checkbox-item',
      inputs: '[(checked)], shortcut, disabled, textValue, class',
      outputs: '(checkedChange)',
    },
    { name: 'mimi-menu-radio-group', inputs: '[(value)], label, class', outputs: '(valueChange)' },
    { name: 'mimi-menu-radio-item', inputs: 'value, disabled, textValue, class', outputs: '—' },
    { name: 'mimi-menu-sub', inputs: 'class (del panel del submenú)', outputs: '—' },
    { name: 'mimi-menu-sub-trigger', inputs: 'disabled, textValue, class', outputs: '—' },
    { name: 'mimi-menu-label, mimi-menu-separator', inputs: 'class', outputs: '—' },
  ];
}
