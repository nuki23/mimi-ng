import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { auditPage } from './audit';
import { expect, navPaths, openDoc, test } from './fixtures';

/**
 * M.18: la auditoría a 360 px de todas las páginas (componentes, Blocks y Primeros pasos), en
 * los dos teléfonos. Falla si algo se sale de la pantalla; los controles pequeños se informan
 * (en el adjunto de cada prueba y en `tmp/e2e/audit/<proyecto>/`), porque el mínimo de 24 px
 * ya lo exige axe (`target-size`, con su excepción de espacio) y los 44 px son una
 * recomendación que se revisa a mano (`docs/proceso/e2e.md`).
 */
test.skip(({ isMobile }) => !isMobile, 'solo en los teléfonos');

for (const path of navPaths()) {
  test(`auditoría a 360 px: ${path}`, async ({ page }, info) => {
    await openDoc(page, path);
    const result = await auditPage(page, path);
    const json = JSON.stringify(result, null, 2);
    await info.attach('auditoria.json', { body: json, contentType: 'application/json' });
    const dir = join('tmp', 'e2e', 'audit', info.project.name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${path.replace(/^\/docs\//, '').replace(/\//g, '_')}.json`), json);
    expect(result.viewport).toBe(360);
    expect(result.outside, 'nada se sale de la pantalla a lo ancho').toEqual([]);
  });
}
