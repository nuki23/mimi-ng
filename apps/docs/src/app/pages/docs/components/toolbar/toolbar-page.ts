import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { ToolbarBasicExample } from './examples/toolbar-basic.example';
import { ToolbarFloatingExample } from './examples/toolbar-floating.example';
import { ToolbarToggleExample } from './examples/toolbar-toggle.example';
import { ToolbarTooltipsExample } from './examples/toolbar-tooltips.example';
import { ToolbarVerticalExample } from './examples/toolbar-vertical.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/toolbar-basic.example' with { loader: 'text' };
// @ts-expect-error
import floatingSource from './examples/toolbar-floating.example' with { loader: 'text' };
// @ts-expect-error
import toggleSource from './examples/toolbar-toggle.example' with { loader: 'text' };
// @ts-expect-error
import tooltipsSource from './examples/toolbar-tooltips.example' with { loader: 'text' };
// @ts-expect-error
import verticalSource from './examples/toolbar-vertical.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de mimi-toolbar (tarea G1.10). */
@Component({
  selector: 'app-toolbar-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    ToolbarBasicExample,
    ToolbarFloatingExample,
    ToolbarToggleExample,
    ToolbarTooltipsExample,
    ToolbarVerticalExample,
  ],
  templateUrl: './toolbar-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarPage {
  protected readonly source = {
    basic: basicSource as string,
    floating: floatingSource as string,
    toggle: toggleSource as string,
    tooltips: tooltipsSource as string,
    vertical: verticalSource as string,
  };

  protected readonly usage = [
    "import { MimiToolbarImports } from '@/components/ui/toolbar';",
    '',
    '@Component({',
    '  imports: [MimiToolbarImports, LucideBold, LucideTextAlignStart],',
    '  template: `',
    '    <mimi-toolbar aria-label="Formato" [(value)]="align" [(pressed)]="styles">',
    '      <button mimiToolbarItem="bold" kind="toggle" aria-label="Negrita">',
    '        <svg lucideBold></svg>',
    '      </button>',
    '      <mimi-toolbar-separator />',
    '      <button mimiToolbarItem="start" kind="tool" aria-label="Alinear al inicio">',
    '        <svg lucideTextAlignStart></svg>',
    '      </button>',
    '    </mimi-toolbar>',
    '  `,',
    '})',
    'export class EditorComponent {',
    "  align = signal('start');",
    '  styles = signal<string[]>([]);',
    '}',
  ].join('\n');

  protected readonly toolbarApi: ApiRow[] = [
    {
      name: 'aria-label / aria-labelledby',
      type: 'string',
      default: '—',
      description: 'Nombre de la toolbar (obligatorio: en desarrollo avisa si falta).',
    },
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description: 'Dirección de la fila y de las flechas (←→ o ↑↓).',
    },
    {
      name: 'value',
      type: 'string | undefined',
      default: 'undefined',
      description:
        'La herramienta activa (kind="tool"). Admite [(value)]. Volver a elegirla no la desmarca; un valor sin botón se conserva.',
    },
    {
      name: 'pressed',
      type: 'string[]',
      default: '[]',
      description: 'Los interruptores presionados (kind="toggle"). Admite [(pressed)].',
    },
    {
      name: 'wrap',
      type: 'boolean',
      default: 'true',
      description: 'Las flechas vuelven al principio desde el último botón.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description:
        'Clases de la píldora, mezcladas con cn(): tus clases ganan (por ejemplo, para posicionarla).',
    },
    {
      name: '(activate)',
      type: 'string',
      default: '—',
      description:
        'El valor del botón, en cada activación (clic, Enter o Espacio), después de actualizar value o pressed. Nunca en un deshabilitado.',
    },
  ];

  protected readonly itemApi: ApiRow[] = [
    {
      name: 'mimiToolbarItem',
      type: 'string',
      default: '—',
      description: 'El valor del botón (único y no vacío). Va en un <button>.',
    },
    {
      name: 'kind',
      type: "'tool' | 'toggle' | 'action'",
      default: "'action'",
      description:
        'tool: herramienta activa (una a la vez, value). toggle: interruptor (pressed). action: solo (activate). tool y toggle llevan aria-pressed.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Se enfoca con las flechas, pero no se activa: el clic se frena antes que tu (click) y que (activate).',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del botón, mezcladas con cn().',
    },
  ];
}
