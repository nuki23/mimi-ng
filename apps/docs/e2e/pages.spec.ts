import { expect, navPaths, openDoc, test } from './fixtures';

/**
 * Cada página del sitio abre en los cinco proyectos (tres motores de escritorio y dos teléfonos)
 * sin errores en la consola y sin scroll lateral de la página.
 */
const PAGES = ['/', ...navPaths()];

for (const path of PAGES) {
  test(`abre sin errores ni scroll lateral: ${path}`, async ({ page, errors }) => {
    await openDoc(page, path);
    if (path !== '/') await expect(page.locator('main article').first()).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, 'la página no se desplaza de lado').toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test('una ruta que no existe muestra la página 404', async ({ page }) => {
  await openDoc(page, '/docs/no-existe');
  await expect(page.locator('h1').first()).toHaveText('Esta página no existe');
});
