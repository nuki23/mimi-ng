import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
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
      // Los componentes irán en components/<nombre> (Fase 2).
    ],
  },
  // Uso interno: no aparecen en el menú.
  {
    path: 'dev/tokens',
    loadComponent: () => import('./dev/tokens-page').then((m) => m.TokensPage),
  },
  {
    path: 'dev/theme',
    loadComponent: () => import('./dev/theme-page').then((m) => m.ThemePage),
  },
  {
    path: 'dev/code',
    loadComponent: () => import('./dev/code-page').then((m) => m.CodePage),
  },
  {
    path: '**',
    title: 'Página no encontrada · Mimi',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPage),
  },
];
