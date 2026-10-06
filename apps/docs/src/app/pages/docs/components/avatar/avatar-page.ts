import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { AvatarCustomClassExample } from './examples/avatar-custom-class.example';
import { AvatarFallbackExample } from './examples/avatar-fallback.example';
import { AvatarSizesExample } from './examples/avatar-sizes.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import avatarCustomClassSource from './examples/avatar-custom-class.example' with {
  loader: 'text',
};
// @ts-expect-error
import avatarFallbackSource from './examples/avatar-fallback.example' with { loader: 'text' };
// @ts-expect-error
import avatarSizesSource from './examples/avatar-sizes.example' with { loader: 'text' };

/** Documentación de Avatar (tarea 2.8). */
@Component({
  selector: 'app-avatar-page',
  imports: [
    CodeBlock,
    CssVariables,
    CodePreview,
    InstallCommand,
    AvatarCustomClassExample,
    AvatarFallbackExample,
    AvatarSizesExample,
  ],
  templateUrl: './avatar-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarPage {
  protected readonly source = {
    customClass: avatarCustomClassSource as string,
    fallback: avatarFallbackSource as string,
    sizes: avatarSizesSource as string,
  };

  protected readonly usage = [
    "import { MimiAvatarImports } from '@/components/ui/avatar';",
    '',
    '@Component({',
    "  selector: 'app-perfil',",
    '  imports: [MimiAvatarImports],',
    '  template: `',
    '    <mimi-avatar>',
    '      <img mimiAvatarImage src="/ana.png" alt="Ana Torres" />',
    '      <mimi-avatar-fallback label="Ana Torres">AT</mimi-avatar-fallback>',
    '    </mimi-avatar>',
    '  `,',
    '})',
    'export class PerfilComponent {}',
  ].join('\n');

  protected readonly api = [
    {
      part: 'mimi-avatar',
      name: 'size',
      type: "'sm' | 'default' | 'lg'",
      default: "'default'",
      description: '32, 40 o 56px. El tamaño de letra de las iniciales va con él.',
    },
    {
      part: 'img[mimiAvatarImage]',
      name: 'src',
      type: 'string | null',
      default: '—',
      description:
        'Dirección de la imagen. Al cambiar, vuelve a cargar; sin src, se ve el fallback. alt, srcset, loading… van como en cualquier <img>.',
    },
    {
      part: 'mimi-avatar-fallback',
      name: 'label',
      type: 'string',
      default: '—',
      description:
        'Nombre completo. Los lectores de pantalla lo anuncian (role="img") en lugar de leer las iniciales.',
    },
    {
      part: 'todas',
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases propias. Se mezclan con cn(): las tuyas ganan.',
    },
  ];
}
