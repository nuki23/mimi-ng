import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { TabsBasicExample } from './examples/tabs-basic.example';
import { TabsShortcutExample } from './examples/tabs-shortcut.example';
import { TabsControlledExample } from './examples/tabs-controlled.example';
import { TabsCustomClassExample } from './examples/tabs-custom-class.example';
import { TabsDisabledExample } from './examples/tabs-disabled.example';
import { TabsPillExample } from './examples/tabs-pill.example';
import { TabsPreserveExample } from './examples/tabs-preserve.example';
import { TabsResponsiveExample } from './examples/tabs-responsive.example';
import { TabsVerticalExample } from './examples/tabs-vertical.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/tabs-basic.example' with { loader: 'text' };
// @ts-expect-error
import shortcutSource from './examples/tabs-shortcut.example' with { loader: 'text' };
// @ts-expect-error
import controlledSource from './examples/tabs-controlled.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/tabs-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import disabledSource from './examples/tabs-disabled.example' with { loader: 'text' };
// @ts-expect-error
import pillSource from './examples/tabs-pill.example' with { loader: 'text' };
// @ts-expect-error
import preserveSource from './examples/tabs-preserve.example' with { loader: 'text' };
// @ts-expect-error
import responsiveSource from './examples/tabs-responsive.example' with { loader: 'text' };
// @ts-expect-error
import verticalSource from './examples/tabs-vertical.example' with { loader: 'text' };

/** Documentación de Tabs (tarea G1.9). */
@Component({
  selector: 'app-tabs-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    TabsBasicExample,
    TabsShortcutExample,
    TabsControlledExample,
    TabsCustomClassExample,
    TabsDisabledExample,
    TabsPillExample,
    TabsPreserveExample,
    TabsResponsiveExample,
    TabsVerticalExample,
  ],
  templateUrl: './tabs-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPage {
  protected readonly source = {
    basic: basicSource as string,
    shortcut: shortcutSource as string,
    controlled: controlledSource as string,
    customClass: customClassSource as string,
    disabled: disabledSource as string,
    pill: pillSource as string,
    preserve: preserveSource as string,
    responsive: responsiveSource as string,
    vertical: verticalSource as string,
  };

  protected readonly usage = [
    "import { MimiTabsImports } from '@/components/ui/tabs';",
    '',
    '@Component({',
    '  imports: [MimiTabsImports],',
    '  template: `',
    '    <!-- La forma corta: una pestaña es un elemento (su contenido se crea con la página). -->',
    '    <mimi-tabs [(value)]="section" aria-label="Secciones de la cuenta">',
    '      <mimi-tab label="Cuenta" value="account">…</mimi-tab>',
    '      <mimi-tab label="Avisos" [count]="3">…</mimi-tab>',
    '',
    '      <!-- Un panel costoso: la plantilla se crea solo al elegir la pestaña. -->',
    '      <ng-template mimiTab="billing" label="Facturación">…</ng-template>',
    '    </mimi-tabs>',
    '  `,',
    '})',
    'export class AccountComponent {',
    "  section = signal('account');",
    '}',
  ].join('\n');

  protected readonly tabsApi = [
    {
      name: 'value',
      type: 'string | undefined',
      default: 'la primera habilitada',
      description: 'La pestaña elegida. Admite [(value)].',
    },
    {
      name: 'variant',
      type: "'underline' | 'pill'",
      default: "'underline'",
      description: 'Subrayada o en píldora.',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description:
        'En vertical, las pestañas a un lado y el panel al otro, con ↑/↓. Puede cambiar en vivo (desde la 0.4.0).',
    },
    {
      name: 'preserveContent',
      type: 'boolean',
      default: 'false',
      description:
        'Conserva los paneles al cambiar de pestaña. Sin él, cada panel se crea al mostrarse y se destruye al ocultarse.',
    },
    {
      name: 'aria-label / aria-labelledby',
      type: 'string',
      default: '—',
      description: 'Nombre de la fila de pestañas.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del contenedor de las pestañas, mezcladas con cn(): tus clases ganan.',
    },
    { name: 'panelClass', type: 'string', default: "''", description: 'Clases de los paneles.' },
  ];

  protected readonly tabApi = [
    {
      name: 'mimiTab',
      type: 'string',
      default: '—',
      description:
        'El valor de la pestaña (único y no vacío), en `ng-template[mimiTab]`: su contenido se crea al elegirla. En el elemento `<mimi-tab>` (la forma corta) la entrada se llama `value` y es opcional: sin ella, el valor es el `label` en minúsculas y con guiones. El contenido de `<mimi-tab>` se crea con la página, no al elegirla.',
    },
    {
      name: 'label',
      type: 'string',
      default: "''",
      description:
        'El texto de la pestaña. Con mimiTabLabel sin texto visible (solo un ícono), es su nombre accesible.',
    },
    {
      name: 'count',
      type: 'number | string',
      default: '—',
      description: 'Contador al lado del texto.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Se puede enfocar con las flechas, pero no elegir.',
    },
  ];
}
