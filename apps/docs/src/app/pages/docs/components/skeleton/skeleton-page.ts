import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { SkeletonCardExample } from './examples/skeleton-card.example';
import { SkeletonCustomClassExample } from './examples/skeleton-custom-class.example';
import { SkeletonLoadingExample } from './examples/skeleton-loading.example';
import { SkeletonShapesExample } from './examples/skeleton-shapes.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import skeletonCardSource from './examples/skeleton-card.example' with { loader: 'text' };
// @ts-expect-error
import skeletonCustomClassSource from './examples/skeleton-custom-class.example' with {
  loader: 'text',
};
// @ts-expect-error
import skeletonLoadingSource from './examples/skeleton-loading.example' with { loader: 'text' };
// @ts-expect-error
import skeletonShapesSource from './examples/skeleton-shapes.example' with { loader: 'text' };

/** Documentación de Skeleton (tarea 2.7). */
@Component({
  selector: 'app-skeleton-page',
  imports: [
    CodeBlock,
    CssVariables,
    CodePreview,
    InstallCommand,
    SkeletonCardExample,
    SkeletonCustomClassExample,
    SkeletonLoadingExample,
    SkeletonShapesExample,
  ],
  templateUrl: './skeleton-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonPage {
  protected readonly source = {
    card: skeletonCardSource as string,
    customClass: skeletonCustomClassSource as string,
    loading: skeletonLoadingSource as string,
    shapes: skeletonShapesSource as string,
  };

  protected readonly usage = [
    "import { MimiSkeleton } from '@/components/ui/skeleton';",
    '',
    '@Component({',
    "  selector: 'app-perfil',",
    '  imports: [MimiSkeleton],',
    '  template: `',
    '    <div aria-busy="true">',
    '      <span class="sr-only">Cargando…</span>',
    '      <mimi-skeleton class="h-3 w-2/3" />',
    '    </div>',
    '  `,',
    '})',
    'export class PerfilComponent {}',
  ].join('\n');

  protected readonly api = [
    {
      name: 'class',
      type: 'string',
      default: "''",
      description:
        'Tamaño y forma del bloque (h-3 w-2/3, size-12 rounded-full…). Se mezcla con cn(): las tuyas ganan.',
    },
  ];
}
