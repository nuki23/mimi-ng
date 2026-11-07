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
    // Las páginas de la documentación, en su propio archivo y diferidas: la tabla de rutas no
    // va en main (M.13). Una página nueva se agrega en pages/docs/docs.routes.ts.
    loadChildren: () => import('./pages/docs/docs.routes').then((m) => m.DOCS_ROUTES),
  },
  // Uso interno, solo en desarrollo: no aparecen en el menú (dev/dev.routes.ts).
  ...DEV_ROUTES,
  {
    path: '**',
    title: 'Página no encontrada · Mimi',
    loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPage),
  },
];
