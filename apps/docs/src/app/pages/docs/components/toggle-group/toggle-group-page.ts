import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { ToggleGroupCustomExample } from './examples/toggle-group-custom.example';
import { ToggleGroupDisabledExample } from './examples/toggle-group-disabled.example';
import { ToggleGroupFormsExample } from './examples/toggle-group-forms.example';
import { ToggleGroupIconsExample } from './examples/toggle-group-icons.example';
import { ToggleGroupMultipleExample } from './examples/toggle-group-multiple.example';
import { ToggleGroupReadonlyExample } from './examples/toggle-group-readonly.example';
import { ToggleGroupSolidExample } from './examples/toggle-group-solid.example';
import { ToggleGroupTextExample } from './examples/toggle-group-text.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import customSource from './examples/toggle-group-custom.example' with { loader: 'text' };
// @ts-expect-error
import disabledSource from './examples/toggle-group-disabled.example' with { loader: 'text' };
// @ts-expect-error
import formsSource from './examples/toggle-group-forms.example' with { loader: 'text' };
// @ts-expect-error
import iconsSource from './examples/toggle-group-icons.example' with { loader: 'text' };
// @ts-expect-error
import multipleSource from './examples/toggle-group-multiple.example' with { loader: 'text' };
// @ts-expect-error
import solidSource from './examples/toggle-group-solid.example' with { loader: 'text' };
// @ts-expect-error
import textSource from './examples/toggle-group-text.example' with { loader: 'text' };
// @ts-expect-error
import readonlySource from './examples/toggle-group-readonly.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Toggle Group (tarea G2.1). */
@Component({
  selector: 'app-toggle-group-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    ToggleGroupTextExample,
    ToggleGroupIconsExample,
    ToggleGroupMultipleExample,
    ToggleGroupSolidExample,
    ToggleGroupDisabledExample,
    ToggleGroupReadonlyExample,
    ToggleGroupFormsExample,
    ToggleGroupCustomExample,
  ],
  templateUrl: './toggle-group-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupPage {
  protected readonly source = {
    text: textSource as string,
    icons: iconsSource as string,
    multiple: multipleSource as string,
    solid: solidSource as string,
    disabled: disabledSource as string,
    readonly: readonlySource as string,
    forms: formsSource as string,
    custom: customSource as string,
  };

  protected readonly usage = [
    "import { MimiToggleGroupImports } from '@/components/ui/toggle-group';",
    '',
    '@Component({',
    '  imports: [MimiToggleGroupImports],',
    '  template: `',
    '    <mimi-toggle-group aria-label="Periodo" [(value)]="period">',
    '      <button mimiToggleGroupItem="week">Semanal</button>',
    '      <button mimiToggleGroupItem="month">Mensual</button>',
    '    </mimi-toggle-group>',
    '  `,',
    '})',
    'export class ReportComponent {',
    "  period = signal<string | null>('week');",
    '}',
  ].join('\n');

  protected readonly groupApi: ApiRow[] = [
    {
      name: 'aria-label / aria-labelledby',
      type: 'string',
      default: '—',
      description: 'Nombre del grupo (obligatorio: en desarrollo avisa si falta).',
    },
    {
      name: 'value',
      type: 'T | null (T[] con multiple)',
      default: 'null',
      description:
        'El elegido o, con multiple, los elegidos. Admite [(value)], [formField], formControlName y [(ngModel)]. Un valor sin botón se conserva.',
    },
    {
      name: 'multiple',
      type: 'boolean',
      default: 'false',
      description:
        'Varios elegidos a la vez (botones con aria-pressed). Sin él, uno solo, como una radio: volver a pulsar el elegido no lo quita.',
    },
    {
      name: 'variant',
      type: "'default' | 'solid'",
      default: "'default'",
      description: 'solid: el elegido en primary.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Deshabilita el grupo entero (también desde el formulario).',
    },
    {
      name: 'readonly',
      type: 'boolean',
      default: 'false',
      description:
        'Solo lectura: se ve lo elegido y las flechas mueven el foco, pero no cambia. aria-readonly en el modo simple.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del grupo, mezcladas con cn(): tus clases ganan.',
    },
    {
      name: '(touch)',
      type: 'void',
      default: '—',
      description: 'Cuando el foco sale del grupo entero (lo usa el formulario para «tocado»).',
    },
  ];

  protected readonly itemApi: ApiRow[] = [
    {
      name: 'mimiToggleGroupItem',
      type: 'unknown',
      default: '—',
      description: 'El valor del botón (único en el grupo). Va en un <button>.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del botón, mezcladas con cn().',
    },
  ];
}
