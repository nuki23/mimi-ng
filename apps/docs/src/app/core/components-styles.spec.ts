import { TestBed } from '@angular/core/testing';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {
  COMPONENTS_STYLESHEET,
  COMPONENTS_STYLES_WAIT_MS,
  loadComponentsStyles,
} from './components-styles';

const state = (url: string) => ({ url }) as RouterStateSnapshot;
const route = {} as ActivatedRouteSnapshot;
const run = (url: string) =>
  TestBed.runInInjectionContext(() => loadComponentsStyles(route, state(url)));

describe('hoja de las páginas de componentes (M.23)', () => {
  afterEach(() => {
    document.head.querySelectorAll('link[data-mimi-components]').forEach((l) => l.remove());
  });

  it('el resto de /docs no la pide', () => {
    expect(run('/docs/introduction')).toBe(true);
    expect(run('/docs/blocks/login-01')).toBe(true);
    expect(document.head.querySelector('link[data-mimi-components]')).toBeNull();
  });

  it('una página de componentes la pide una vez y espera a que cargue', async () => {
    const pending = run('/docs/components/button') as Promise<boolean>;
    const link = document.head.querySelector<HTMLLinkElement>('link[data-mimi-components]')!;
    expect(link.getAttribute('href')).toBe(COMPONENTS_STYLESHEET);
    link.dispatchEvent(new Event('load'));
    await expect(pending).resolves.toBe(true);
    // Ya está: la siguiente página no vuelve a pedirla.
    expect(run('/docs/components/select')).toBe(true);
    expect(document.head.querySelectorAll('link[data-mimi-components]').length).toBe(1);
  });

  it('si la hoja se demora más que el tope, la página se pinta igual', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: COMPONENTS_STYLES_WAIT_MS, useValue: 20 }],
    });
    await expect(run('/docs/components/chip') as Promise<boolean>).resolves.toBe(true);
  });

  it('si la hoja no llega, la página se pinta igual', async () => {
    const pending = run('/docs/components/tree') as Promise<boolean>;
    document.head
      .querySelector<HTMLLinkElement>('link[data-mimi-components]')!
      .dispatchEvent(new Event('error'));
    await expect(pending).resolves.toBe(true);
  });
});
