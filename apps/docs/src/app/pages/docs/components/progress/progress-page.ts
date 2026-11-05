import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { ProgressBarExample } from './examples/progress-bar.example';
import { ProgressCircleExample } from './examples/progress-circle.example';
import { ProgressCustomExample } from './examples/progress-custom.example';
import { ProgressIndeterminateExample } from './examples/progress-indeterminate.example';
import { ProgressTonesExample } from './examples/progress-tones.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import barSource from './examples/progress-bar.example' with { loader: 'text' };
// @ts-expect-error
import circleSource from './examples/progress-circle.example' with { loader: 'text' };
// @ts-expect-error
import customSource from './examples/progress-custom.example' with { loader: 'text' };
// @ts-expect-error
import indeterminateSource from './examples/progress-indeterminate.example' with { loader: 'text' };
// @ts-expect-error
import tonesSource from './examples/progress-tones.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Progress (tarea G2.10). */
@Component({
  selector: 'app-progress-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    ProgressBarExample,
    ProgressIndeterminateExample,
    ProgressTonesExample,
    ProgressCircleExample,
    ProgressCustomExample,
  ],
  templateUrl: './progress-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressPage {
  protected readonly source = {
    bar: barSource as string,
    indeterminate: indeterminateSource as string,
    tones: tonesSource as string,
    circle: circleSource as string,
    custom: customSource as string,
  };

  protected readonly usage = [
    "import { MimiProgress } from '@/components/ui/progress';",
    '',
    '@Component({',
    '  imports: [MimiProgress],',
    '  template: `',
    '    <mimi-progress aria-label="Subiendo informe.pdf" [value]="progress()" />',
    '  `,',
    '})',
    'export class UploadComponent {',
    '  progress = signal(64);',
    '}',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'aria-label / aria-labelledby',
      type: 'string',
      default: '—',
      description: 'Nombre de la barra (obligatorio: en desarrollo avisa si falta).',
    },
    {
      name: 'value',
      type: 'number | null',
      default: 'undefined',
      description: 'El avance, entre 0 y max (se acota). Sin valor o null: indeterminado.',
    },
    {
      name: 'max',
      type: 'number',
      default: '100',
      description: 'El total. Un valor no válido (0 o negativo) cuenta como 100.',
    },
    {
      name: 'tone',
      type: "'primary' | 'success' | 'warning' | 'info' | 'danger'",
      default: "'primary'",
      description: 'Color de la parte llena.',
    },
    {
      name: 'shape',
      type: "'bar' | 'circle'",
      default: "'bar'",
      description: 'Barra o círculo (el círculo muestra el valor dentro).',
    },
    {
      name: 'size',
      type: "'default' | 'sm'",
      default: "'default'",
      description: 'Solo el círculo: 76px o 44px.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description:
        'Clases del elemento con el rol (la pista o el círculo), mezcladas con cn(): tus clases ganan.',
    },
  ];
}
