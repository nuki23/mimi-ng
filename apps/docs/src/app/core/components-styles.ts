import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';
import type { CanActivateChildFn } from '@angular/router';

/** Hoja de las páginas de componentes (angular.json, `inject: false`; M.23). */
export const COMPONENTS_STYLESHEET = 'components.css';

/**
 * Cuánto se espera a la hoja, como máximo (ms). Si no llega en ese tiempo la página se pinta igual.
 * Las pruebas lo ponen en 0: jsdom no carga hojas y no dispara `load`.
 */
export const COMPONENTS_STYLES_WAIT_MS = new InjectionToken<number>('COMPONENTS_STYLES_WAIT_MS', {
  providedIn: 'root',
  factory: () => 3000,
});

/** Páginas que necesitan la hoja. */
const COMPONENTS_PREFIX = '/docs/components';

/**
 * Pide `components.css` la primera vez que se entra en una página de componentes y espera a que
 * llegue (o falle) antes de pintarla: así no hay un parpadeo sin estilos. Va como
 * `canActivateChild` de /docs (app.routes.ts); el resto de /docs no la pide.
 */
export const loadComponentsStyles: CanActivateChildFn = (_route, state) => {
  if (!state.url.startsWith(COMPONENTS_PREFIX)) return true;
  const document = inject(DOCUMENT);
  const existing = document.head.querySelector<HTMLLinkElement>('link[data-mimi-components]');
  if (existing) return true;
  const wait = inject(COMPONENTS_STYLES_WAIT_MS);
  return new Promise<boolean>((resolve) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = COMPONENTS_STYLESHEET;
    link.dataset['mimiComponents'] = '';
    // Si no llega (error o demora), la página se pinta igual en vez de quedarse en blanco.
    link.onload = () => resolve(true);
    link.onerror = () => resolve(true);
    document.head.appendChild(link);
    setTimeout(() => resolve(true), wait);
  });
};
