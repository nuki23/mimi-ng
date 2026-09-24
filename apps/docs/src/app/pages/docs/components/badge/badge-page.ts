import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { InstallCommand } from '../../../../code/install-command';
import { BadgeCustomClassExample } from './examples/badge-custom-class.example';
import { BadgeVariantsExample } from './examples/badge-variants.example';
import { BadgeWithIconExample } from './examples/badge-with-icon.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import badgeCustomClassSource from './examples/badge-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import badgeVariantsSource from './examples/badge-variants.example' with { loader: 'text' };
// @ts-expect-error
import badgeWithIconSource from './examples/badge-with-icon.example' with { loader: 'text' };

/** Documentación de Badge (tarea 2.4). */
@Component({
  selector: 'app-badge-page',
  imports: [
    CodeBlock,
    CodePreview,
    InstallCommand,
    BadgeCustomClassExample,
    BadgeVariantsExample,
    BadgeWithIconExample,
  ],
  templateUrl: './badge-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgePage {
  protected readonly source = {
    customClass: badgeCustomClassSource as string,
    variants: badgeVariantsSource as string,
    withIcon: badgeWithIconSource as string,
  };

  protected readonly usage = [
    "import { MimiBadge } from '@/components/ui/badge';",
    '',
    '@Component({',
    "  selector: 'app-plan',",
    '  imports: [MimiBadge],',
    '  template: `<span mimiBadge variant="secondary">Nuevo</span>`,',
    '})',
    'export class PlanComponent {}',
  ].join('\n');

  protected readonly api = [
    {
      name: 'variant',
      type: "'default' | 'secondary' | 'outline' | 'destructive'",
      default: "'default'",
      description: 'Estilo de la etiqueta.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases propias. Se mezclan con cn(): las tuyas ganan.',
    },
  ];
}
