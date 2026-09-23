import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../code/code-block';
import type { CodeLang } from '../../code/highlighter.service';
import { InstallCommand } from '../../code/install-command';

interface Snippet {
  code: string;
  lang: CodeLang;
  /** `$` delante de un comando de una línea. */
  prompt?: string;
}

interface InstallDetail {
  id: string;
  title: string;
  description: string;
  snippet?: Snippet;
}

interface InstallStep {
  id: string;
  title: string;
  description: string;
  snippet: Snippet;
  /** Muestra las pestañas pnpm / Angular CLI para este componente. */
  installName?: string;
  /** Todavía no existe en la CLI: se marca como disponible en una versión futura. */
  future?: boolean;
  details?: InstallDetail[];
}

/**
 * Instalación. Pasos de docs/design/Mimi Sitio.dc.html y comandos de docs/spec.md (sección 5).
 * Se revisará contra la CLI real en la Fase 3.
 */
@Component({
  selector: 'app-installation-page',
  imports: [CodeBlock, InstallCommand],
  templateUrl: './installation-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallationPage {
  protected readonly steps: InstallStep[] = [
    {
      id: 'step-1',
      title: 'Crea un proyecto Angular 22',
      description: 'Si ya tienes uno, salta al paso 2.',
      snippet: { code: 'ng new mi-app --style=css', lang: 'bash', prompt: '$' },
    },
    {
      id: 'step-2',
      title: 'Añade Tailwind CSS 4',
      description:
        'Instala Tailwind y su plugin de PostCSS. Luego agrega @import "tailwindcss"; al inicio de src/styles.css.',
      snippet: {
        code: 'pnpm add tailwindcss @tailwindcss/postcss postcss',
        lang: 'bash',
        prompt: '$',
      },
      details: [
        {
          id: 'step-2-postcss',
          title: 'Configura PostCSS',
          description: 'Crea .postcssrc.json en la raíz del proyecto con el plugin de Tailwind.',
          snippet: { code: '{\n  "plugins": { "@tailwindcss/postcss": {} }\n}', lang: 'json' },
        },
      ],
    },
    {
      id: 'step-3',
      title: 'Inicializa Mimi',
      description:
        'Instala la CLI y ejecuta init: crea mimi.json, agrega las variables --mimi-* a styles.css y configura el alias @/components/ui.',
      snippet: { code: 'ng add @mimi-ng/cli', lang: 'bash', prompt: '$' },
      details: [
        {
          id: 'step-3-dependencies',
          title: 'Dependencias',
          description:
            'Instala clsx, tailwind-merge y class-variance-authority como dependencias normales.',
        },
        {
          id: 'step-3-files',
          title: 'Archivos que crea',
          description:
            'utils/cn.ts, utils/control-styles.ts y mimi.json. Registra @mimi-ng/cli en angular.json y pregunta si quieres instalar @lucide/angular para tus íconos.',
        },
      ],
    },
    {
      id: 'step-4',
      title: 'Agrega componentes',
      description:
        'Cada componente se copia a src/app/components/ui. Puedes pedir uno o varios a la vez.',
      snippet: { code: 'pnpm mimi add button input card', lang: 'bash', prompt: '$' },
      installName: 'button',
      details: [
        {
          id: 'step-4-more',
          title: 'Otros comandos',
          description:
            'Sin nombres, la CLI muestra un menú para elegir. También puedes listar los disponibles.',
          snippet: {
            code: 'pnpm mimi add    # menú para elegir\npnpm mimi list   # disponibles e instalados',
            lang: 'bash',
          },
        },
        {
          id: 'step-4-angular-cli',
          title: 'Con Angular CLI',
          description:
            'Los mismos schematics funcionan con ng generate. Después de init, basta con ng g ui.',
          snippet: {
            code: 'ng g @mimi-ng/cli:ui button\nng g ui button   # tras init (schematicCollections)',
            lang: 'bash',
          },
        },
      ],
    },
    {
      id: 'step-5',
      title: 'Úsalos',
      description: 'Importa el componente o la directiva en tu componente standalone.',
      snippet: { code: '<button mimiBtn>Hola, Mimi</button>', lang: 'angular-html' },
    },
    {
      id: 'step-6',
      title: 'Actualiza cuando quieras',
      description:
        'Mimi compara tu copia con la versión original y la nueva. Solo aplica lo que no tocaste y te avisa si hay conflictos.',
      snippet: { code: 'pnpm mimi update button', lang: 'bash', prompt: '$' },
      future: true,
    },
  ];
}
