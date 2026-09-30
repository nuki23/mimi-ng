import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../code/code-block';

/**
 * Instalación, contra lo que la CLI hace de verdad (tareas 3.7 y 3.9; spec, sección 5).
 * `mimi update` sigue marcado como versión futura (tarea 5.4).
 */
@Component({
  selector: 'app-installation-page',
  imports: [CodeBlock],
  templateUrl: './installation-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallationPage {
  protected readonly tailwindGuide =
    'https://tailwindcss.com/docs/installation/framework-guides/angular';

  /** Qué modifica `ng add @mimi-ng/cli` (init), archivo por archivo. */
  protected readonly changes = [
    {
      file: 'src/styles.css',
      what: 'Importa el tema de Mimi justo después de @import "tailwindcss".',
    },
    {
      file: 'tsconfig.json',
      what: 'Agrega el alias @/components/ui/* apuntando a la carpeta de componentes, sin borrar tus comentarios ni tus paths. Si tsconfig.app.json tiene sus propios paths, también ahí.',
    },
    {
      file: 'angular.json',
      what: 'Agrega @mimi-ng/cli a cli.schematicCollections, después de @schematics/angular: así funcionan ng g ui y también ng g component.',
    },
    {
      file: 'package.json',
      what: 'Agrega clsx, tailwind-merge y class-variance-authority, y los instala con tu gestor de paquetes (pnpm, npm, yarn o bun).',
    },
    {
      file: 'src/app/components/ui/',
      what: 'Copia el tema (theme/) y las utilidades base (utils/cn.ts y utils/control-styles.ts).',
    },
    { file: 'mimi.json', what: 'Crea la configuración de Mimi.' },
    { file: '.mimi/', what: 'Guarda las copias originales de los archivos y sus versiones.' },
  ];

  protected readonly options = [
    {
      name: '--icons',
      what: 'Instala @lucide/angular para tus íconos. Si la terminal es interactiva, lo pregunta; si no, no lo instala.',
    },
    {
      name: '--project',
      what: 'Elige la aplicación si el workspace tiene varias.',
    },
    {
      name: '--overwrite',
      what: 'Reemplaza los archivos de Mimi que modificaste (pierdes tus cambios).',
    },
  ];

  protected readonly usage = [
    "import { MimiButton } from '@/components/ui/button';",
    '',
    '@Component({',
    "  selector: 'app-root',",
    '  imports: [MimiButton],',
    '  template: `<button mimiBtn>Hola, Mimi</button>`,',
    '})',
    'export class App {}',
  ].join('\n');

  protected readonly mimiJson = [
    '{',
    '  "style": "vivid",',
    '  "tailwind": { "css": "src/styles.css" },',
    '  "aliases": {',
    '    "components": "src/app/components/ui",',
    '    "utils": "src/app/components/ui/utils",',
    '    "theme": "src/app/mimi.preset.ts"',
    '  },',
    '  "components": {',
    '    "button": { "version": "0.1.0" }',
    '  }',
    '}',
  ].join('\n');

  protected readonly pnpmError = [
    'ERR_PNPM_IGNORED_BUILDS',
    'Ignored build scripts: @parcel/watcher, esbuild, lmdb, msgpackr-extract',
  ].join('\n');

  protected readonly pnpmAllowBuilds = [
    '# pnpm-workspace.yaml',
    'allowBuilds:',
    "  '@parcel/watcher': true",
    '  esbuild: true',
    '  lmdb: true',
    '  msgpackr-extract: true',
  ].join('\n');
}
