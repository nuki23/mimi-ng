import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { InstallCommand } from '../../../../code/install-command';
import { ButtonAsLinkExample } from './examples/button-as-link.example';
import { ButtonCustomClassExample } from './examples/button-custom-class.example';
import { ButtonMatrixExample } from './examples/button-matrix.example';
import { ButtonSizesExample } from './examples/button-sizes.example';
import { ButtonStatesExample } from './examples/button-states.example';
import { ButtonTonesExample } from './examples/button-tones.example';
import { ButtonVariantsExample } from './examples/button-variants.example';
import { ButtonWithIconExample } from './examples/button-with-icon.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import buttonAsLinkSource from './examples/button-as-link.example' with { loader: 'text' };
// @ts-expect-error
import buttonCustomClassSource from './examples/button-custom-class.example' with {
  loader: 'text',
};
// @ts-expect-error
import buttonMatrixSource from './examples/button-matrix.example' with { loader: 'text' };
// @ts-expect-error
import buttonSizesSource from './examples/button-sizes.example' with { loader: 'text' };
// @ts-expect-error
import buttonStatesSource from './examples/button-states.example' with { loader: 'text' };
// @ts-expect-error
import buttonTonesSource from './examples/button-tones.example' with { loader: 'text' };
// @ts-expect-error
import buttonVariantsSource from './examples/button-variants.example' with { loader: 'text' };
// @ts-expect-error
import buttonWithIconSource from './examples/button-with-icon.example' with { loader: 'text' };

interface ApiRow {
  name: string;
  type: string;
  default: string;
  description: string;
}

/** Documentación de Button (tarea 2.1). */
@Component({
  selector: 'app-button-page',
  imports: [
    CodeBlock,
    CodePreview,
    InstallCommand,
    ButtonAsLinkExample,
    ButtonCustomClassExample,
    ButtonMatrixExample,
    ButtonSizesExample,
    ButtonStatesExample,
    ButtonTonesExample,
    ButtonVariantsExample,
    ButtonWithIconExample,
  ],
  templateUrl: './button-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonPage {
  protected readonly source = {
    asLink: buttonAsLinkSource as string,
    customClass: buttonCustomClassSource as string,
    matrix: buttonMatrixSource as string,
    sizes: buttonSizesSource as string,
    states: buttonStatesSource as string,
    tones: buttonTonesSource as string,
    variants: buttonVariantsSource as string,
    withIcon: buttonWithIconSource as string,
  };

  protected readonly usage = [
    "import { MimiButton } from '@/components/ui/button';",
    '',
    '@Component({',
    "  selector: 'app-save',",
    '  imports: [MimiButton],',
    '  template: `<button mimiBtn>Guardar</button>`,',
    '})',
    'export class SaveComponent {}',
  ].join('\n');

  protected readonly api: ApiRow[] = [
    {
      name: 'variant',
      type: "'solid' | 'soft' | 'outline' | 'ghost' | 'link'",
      default: "'solid'",
      description:
        'Cómo se ve. Atajos de la 0.1.0 (se quitan en la 1.0): default = solid + primary, secondary = solid + secondary, destructive = solid + danger; si además pasas tone, gana el atajo.',
    },
    {
      name: 'tone',
      type: "'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger'",
      default: 'tono natural',
      description:
        'De qué color es. Sin tone, cada variante usa su tono natural: outline y ghost, secondary (neutro); solid, soft y link, primary. danger usa los colores destructive.',
    },
    {
      name: 'size',
      type: "'default' | 'sm' | 'lg' | 'icon'",
      default: "'default'",
      description: 'Tamaño. icon es cuadrado y necesita aria-label.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Deshabilita: disabled nativo en <button>; aria-disabled y tabindex="-1" en <a>.',
    },
    {
      name: 'loading',
      type: 'boolean',
      default: 'false',
      description: 'Muestra el spinner, deshabilita y agrega aria-busy. No cambia el ancho.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases propias. Se mezclan con cn(): las tuyas ganan.',
    },
  ];

  protected readonly tokens: { name: string; description: string }[] = [
    {
      name: '--mimi-btn-height',
      description: 'Alto (tamaño default e icon). Si no, --mimi-control-height.',
    },
    {
      name: '--mimi-btn-height-sm',
      description: 'Alto del tamaño sm. Si no, --mimi-control-height-sm.',
    },
    {
      name: '--mimi-btn-height-lg',
      description: 'Alto del tamaño lg. Si no, --mimi-control-height-lg.',
    },
    { name: '--mimi-btn-radius', description: 'Radio. Si no, --mimi-radius.' },
    { name: '--mimi-btn-padding-x', description: 'Padding horizontal del tamaño default (1rem).' },
    { name: '--mimi-btn-font-size', description: 'Tamaño de letra del tamaño default (0.875rem).' },
    { name: '--mimi-btn-font-weight', description: 'Peso de la letra (500).' },
    { name: '--mimi-btn-letter-spacing', description: 'Espaciado entre letras (normal).' },
    { name: '--mimi-btn-border-width', description: 'Grosor del borde (1px).' },
    { name: '--mimi-btn-focus-ring-width', description: 'Grosor del contorno de foco (2px).' },
  ];
}
