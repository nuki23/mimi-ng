import { test as base, expect, type Locator, type Page } from '@playwright/test';
import { DOCS_NAV } from '../src/app/layout/docs-nav';

/**
 * Base común de las pruebas de extremo a extremo (M.18).
 *
 * - Sin recursos externos: toda petición que no vaya al sitio se corta (las fuentes de Google
 *   caen a la fuente de respaldo, igual en todas las ejecuciones).
 * - Fecha fija (`page.clock.setFixedTime`): los calendarios y lo que muestra «hoy» no cambian con
 *   el día en que corre la CI. Los temporizadores siguen siendo reales; las pruebas esperan
 *   condiciones (`expect.poll`, `toBeVisible`…), nunca un tiempo fijo.
 * - Recoge los errores de la consola y de la página: `errors` (cada prueba decide si los mira).
 */
export const FIXED_NOW = new Date('2026-11-16T15:00:00Z');

type Fixtures = { errors: string[] };

const BLOCKED_RESOURCE =
  /Failed to load resource|ERR_BLOCKED_BY_CLIENT|downloadable font|fonts\.googleapis|fonts\.gstatic/i;

export const test = base.extend<Fixtures>({
  errors: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => {
      // Las peticiones externas que corta `page` (abajo) dejan su aviso en la consola.
      if (message.type() === 'error' && !BLOCKED_RESOURCE.test(message.text())) {
        errors.push(`console: ${message.text()}`);
      }
    });
    await use(errors);
  },
  page: async ({ page, baseURL }, use) => {
    const origin = new URL(baseURL!).origin;
    await page.route(
      (url) => url.origin !== origin && url.protocol.startsWith('http'),
      (route) => route.abort('blockedbyclient'),
    );
    await page.clock.setFixedTime(FIXED_NOW);
    await use(page);
  },
});

export { expect };

/** Las páginas que existen (`status: 'ready'`) de una sección del menú, por su título. */
export function navPaths(section?: 'Primeros pasos' | 'Componentes' | 'Blocks'): string[] {
  return DOCS_NAV.filter((s) => !section || s.title === section)
    .flatMap((s) => s.items)
    .filter((item) => item.status === 'ready')
    .map((item) => item.path);
}

/** Abre una página del sitio y espera a que la página de documentación esté pintada. */
export async function openDoc(page: Page, path: string, scheme: 'light' | 'dark' = 'light') {
  await page.emulateMedia({ colorScheme: scheme });
  await page.goto(path);
  // La primera carga de una página (sus chunks diferidos) es lo más lento, sobre todo en WebKit
  // con todos los workers ocupados: 20 s para que aparezca, y después los 7 s de siempre.
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 20_000 });
  // Las páginas de componentes cargan components.css aparte (M.23): esperar a que aplique.
  await page.waitForLoadState('load');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/** La vista previa de un ejemplo de la plantilla, por el id de su encabezado (`h3#id`). */
export function example(page: Page, id: string): Locator {
  return page.locator(`[id="${id}"] + app-doc-example app-code-preview`);
}

export const isPhone = (projectName: string) =>
  projectName === 'android' || projectName === 'iphone';
