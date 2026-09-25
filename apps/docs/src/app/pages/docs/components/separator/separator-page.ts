import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { InstallCommand } from '../../../../code/install-command';
import { SeparatorCustomClassExample } from './examples/separator-custom-class.example';
import { SeparatorHorizontalExample } from './examples/separator-horizontal.example';
import { SeparatorSemanticExample } from './examples/separator-semantic.example';
import { SeparatorVerticalExample } from './examples/separator-vertical.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import separatorCustomClassSource from './examples/separator-custom-class.example' with {
  loader: 'text',
};
// @ts-expect-error
import separatorHorizontalSource from './examples/separator-horizontal.example' with {
  loader: 'text',
};
// @ts-expect-error
import separatorSemanticSource from './examples/separator-semantic.example' with { loader: 'text' };
// @ts-expect-error
import separatorVerticalSource from './examples/separator-vertical.example' with { loader: 'text' };

/** Documentación de Separator (tarea 2.6). */
@Component({
  selector: 'app-separator-page',
  imports: [
    CodeBlock,
    CodePreview,
    InstallCommand,
    SeparatorCustomClassExample,
    SeparatorHorizontalExample,
    SeparatorSemanticExample,
    SeparatorVerticalExample,
  ],
  templateUrl: './separator-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorPage {
  protected readonly source = {
    customClass: separatorCustomClassSource as string,
    horizontal: separatorHorizontalSource as string,
    semantic: separatorSemanticSource as string,
    vertical: separatorVerticalSource as string,
  };

  protected readonly usage = [
    "import { MimiSeparator } from '@/components/ui/separator';",
    '',
    '@Component({',
    "  selector: 'app-perfil',",
    '  imports: [MimiSeparator],',
    '  template: `',
    '    <h2>Perfil</h2>',
    '    <mimi-separator />',
    '    <p>Tus datos públicos.</p>',
    '  `,',
    '})',
    'export class PerfilComponent {}',
  ].join('\n');

  protected readonly api = [
    {
      name: 'orientation',
      type: "'horizontal' | 'vertical'",
      default: "'horizontal'",
      description:
        'Dirección de la línea. La vertical toma el alto de su fila: el contenedor necesita flex y un alto.',
    },
    {
      name: 'decorative',
      type: 'boolean',
      default: 'true',
      description:
        'Solo visual (role="none"). En false usa role="separator" con aria-orientation y los lectores de pantalla la anuncian.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases propias. Se mezclan con cn(): las tuyas ganan.',
    },
  ];
}
