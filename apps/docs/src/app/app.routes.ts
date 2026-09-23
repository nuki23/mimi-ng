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
    path: '**',
    title: 'Página no encontrada · Mimi',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPage),
  },
];
