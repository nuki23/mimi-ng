import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { BadgeCustomClassExample } from './examples/badge-custom-class.example';
import { BadgeMatrixExample } from './examples/badge-matrix.example';
import { BadgeTonesExample } from './examples/badge-tones.example';
import { BadgeVariantsExample } from './examples/badge-variants.example';
import { BadgeWithIconExample } from './examples/badge-with-icon.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import badgeCustomClassSource from './examples/badge-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import badgeMatrixSource from './examples/badge-matrix.example' with { loader: 'text' };
// @ts-expect-error
import badgeTonesSource from './examples/badge-tones.example' with { loader: 'text' };
// @ts-expect-error
import badgeVariantsSource from './examples/badge-variants.example' with { loader: 'text' };
// @ts-expect-error
import badgeWithIconSource from './examples/badge-with-icon.example' with { loader: 'text' };

/** Documentación de Badge (tarea 2.4). */
@Component({
  selector: 'app-badge-page',
  imports: [
    CodeBlock,
    CssVariables,
    CodePreview,
    InstallCommand,
    BadgeCustomClassExample,
    BadgeMatrixExample,
    BadgeTonesExample,
    BadgeVariantsExample,
    BadgeWithIconExample,
  ],
  templateUrl: './badge-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgePage {
  protected readonly source = {
    customClass: badgeCustomClassSource as string,
    matrix: badgeMatrixSource as string,
    tones: badgeTonesSource as string,
    variants: badgeVariantsSource as string,
    withIcon: badgeWithIconSource as string,
  };

  protected readonly usage = [
    "import { MimiBadge } from '@/components/ui/badge';",
    '',
    '@Component({',
    "  selector: 'app-plan',",
    '  imports: [MimiBadge],',
    '  template: `<span mimiBadge tone="success">Nuevo</span>`,',
    '})',
    'export class PlanComponent {}',
  ].join('\n');

  protected readonly api = [
    {
      name: 'variant',
      type: "'solid' | 'soft' | 'outline'",
      default: "'solid'",
      description:
        'Cómo se ve. Atajos de la 0.1.0 (se quitan en la 1.0): default = solid + primary, secondary = solid + secondary, destructive = solid + danger; si además pasas tone, gana el atajo.',
    },
    {
      name: 'tone',
      type: "'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger'",
      default: 'tono natural',
      description:
        'De qué color es. Sin tone, cada variante usa su tono natural: outline, secondary (neutro, sin punto); solid y soft, primary. danger usa los colores destructive.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases propias. Se mezclan con cn(): las tuyas ganan.',
    },
  ];
}
