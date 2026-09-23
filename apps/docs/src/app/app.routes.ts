import { Routes } from '@angular/router';

export const routes: Routes = [
  // Uso interno: no aparece en el menú.
  {
    path: 'dev/tokens',
    loadComponent: () => import('./dev/tokens-page').then((m) => m.TokensPage),
  },
];
