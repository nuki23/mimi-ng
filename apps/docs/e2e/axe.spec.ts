import { describeViolations, runAxe } from './axe';
import { expect, navPaths, openDoc, test } from './fixtures';

/**
 * M.15: axe-core sobre todas las páginas del sitio (componentes, Blocks y Primeros pasos), en
 * claro y en oscuro. Solo en Chromium de escritorio y en el Android: las reglas de axe no
 * dependen del motor, y así la CI no repite lo mismo cinco veces. Los paneles abiertos, en
 * `axe-panels.spec.ts`.
 */
test.skip(({ browserName }) => browserName !== 'chromium', 'axe corre en chromium y android');

for (const path of navPaths()) {
  for (const scheme of ['light', 'dark'] as const) {
    test(`axe sin violaciones: ${path} (${scheme})`, async ({ page }) => {
      await openDoc(page, path, scheme);
      const violations = await runAxe(page);
      expect(violations, describeViolations(violations)).toEqual([]);
    });
  }
}
