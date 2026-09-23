import { ChangeDetectionStrategy, Component } from '@angular/core';

interface InstallStep {
  id: string;
  title: string;
  description: string;
  command: string;
  details?: { id: string; title: string; description: string; command?: string }[];
}

/** Instalación (placeholder de la tarea 1.6, pasos de docs/design/Mimi Sitio.dc.html). */
@Component({
  selector: 'app-installation-page',
  templateUrl: './installation-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallationPage {
  protected readonly steps: InstallStep[] = [
    {
      id: 'step-1',
      title: 'Crea un proyecto Angular 22',
      description: 'Si ya tienes uno, salta al paso 2.',
      command: 'ng new mi-app --style=css',
    },
    {
      id: 'step-2',
      title: 'Añade Tailwind CSS 4',
      description:
        'Instala Tailwind y su plugin de PostCSS. Luego agrega @import "tailwindcss"; al inicio de src/styles.css.',
      command: 'pnpm add tailwindcss @tailwindcss/postcss postcss',
      details: [
        {
          id: 'step-2-postcss',
          title: 'Configura PostCSS',
          description: 'Crea .postcssrc.json en la raíz del proyecto con el plugin de Tailwind.',
          command: '{\n  "plugins": { "@tailwindcss/postcss": {} }\n}',
        },
      ],
    },
    {
      id: 'step-3',
      title: 'Inicializa Mimi',
      description:
        'Crea mimi.json, copia las variables --mimi-* a styles.css y configura el alias @/components/ui.',
      command: 'ng add @mimi-ng/cli',
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
        'Cada componente se copia a src/app/components/ui. Puedes pedir varios a la vez.',
      command: 'pnpm mimi add button input card',
    },
    {
      id: 'step-5',
      title: 'Úsalos',
      description: 'Importa el componente o la directiva en tu componente standalone.',
      command: '<button mimiBtn>Hola, Mimi</button>',
    },
    {
      id: 'step-6',
      title: 'Actualiza cuando quieras',
      description:
        'Mimi compara tu copia con la versión original y la nueva. Solo aplica lo que no tocaste y te avisa si hay conflictos.',
      command: 'pnpm mimi update',
    },
  ];
}
