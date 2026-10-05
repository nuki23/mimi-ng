import { Routes } from '@angular/router';

/**
 * Páginas internas (/dev): solo en desarrollo. En producción, angular.json reemplaza este
 * archivo por dev.routes.prod.ts (lista vacía), y styles.prod.css excluye esta carpeta del
 * escaneo de Tailwind: así sus clases no llegan al CSS del sitio.
 */
export const DEV_ROUTES: Routes = [
  {
    path: 'dev/tokens',
    loadComponent: () => import('./tokens-page').then((m) => m.TokensPage),
  },
  {
    path: 'dev/theme',
    loadComponent: () => import('./theme-page').then((m) => m.ThemePage),
  },
  {
    path: 'dev/code',
    loadComponent: () => import('./code-page').then((m) => m.CodePage),
  },
];
