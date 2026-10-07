import { Routes } from '@angular/router';
import { DEV_ROUTES } from './dev/dev.routes';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Mimi · Componentes para Angular y Tailwind CSS',
    loadComponent: () => import('./pages/home-page').then((m) => m.HomePage),
  },
  {
    path: 'docs',
    loadComponent: () => import('./layout/docs-layout').then((m) => m.DocsLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'introduction' },
      {
        path: 'introduction',
        title: 'Introducción · Mimi',
        loadComponent: () =>
          import('./pages/docs/introduction-page').then((m) => m.IntroductionPage),
      },
      {
        path: 'installation',
        title: 'Instalación · Mimi',
        loadComponent: () =>
          import('./pages/docs/installation-page').then((m) => m.InstallationPage),
      },
      {
        path: 'components/button',
        title: 'Button · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/button/button-page').then((m) => m.ButtonPage),
      },
      {
        path: 'components/input',
        title: 'Input y Textarea · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/input/input-page').then((m) => m.InputPage),
      },
      {
        path: 'components/badge',
        title: 'Badge · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/badge/badge-page').then((m) => m.BadgePage),
      },
      {
        path: 'components/card',
        title: 'Card · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/card/card-page').then((m) => m.CardPage),
      },
      {
        path: 'components/popover',
        title: 'Popover · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/popover/popover-page').then((m) => m.PopoverPage),
      },
      {
        path: 'components/tooltip',
        title: 'Tooltip · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/tooltip/tooltip-page').then((m) => m.TooltipPage),
      },
      {
        path: 'components/separator',
        title: 'Separator · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/separator/separator-page').then((m) => m.SeparatorPage),
      },
      {
        path: 'components/skeleton',
        title: 'Skeleton · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/skeleton/skeleton-page').then((m) => m.SkeletonPage),
      },
      {
        path: 'components/avatar',
        title: 'Avatar · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/avatar/avatar-page').then((m) => m.AvatarPage),
      },
      {
        path: 'components/switch',
        title: 'Switch y Checkbox · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/switch/switch-page').then((m) => m.SwitchPage),
      },
      {
        path: 'components/form-field',
        title: 'FormField · Mimi',
        loadComponent: () =>
          import('./pages/docs/components/form-field/form-field-page').then((m) => m.FormFieldPage),
      },
      // Los componentes irán en components/<nombre> (Fase 2).
    ],
  },
  // Uso interno, solo en desarrollo: no aparecen en el menú (dev/dev.routes.ts).
  ...DEV_ROUTES,
  {
    path: '**',
    title: 'Página no encontrada · Mimi',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPage),
  },
];
