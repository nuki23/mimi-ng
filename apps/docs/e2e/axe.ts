import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '@playwright/test';

/**
 * axe-core en la página (M.15; axe-core aprobado por el usuario el 05/11/2026 solo como
 * devDependency del repo). Se inyecta el archivo de axe-core tal cual, sin envoltorios.
 * Playwright corre desde la raíz del repo (donde está `playwright.config.ts`).
 */
const AXE_SOURCE = readFileSync(join(process.cwd(), 'node_modules/axe-core/axe.min.js'), 'utf8');

/**
 * Reglas desactivadas, cada una con su motivo (M.15: «una por una, con su motivo escrito»).
 */
// Ninguna. `label-content-name-mismatch` (2.5.3, experimental en axe) estuvo desactivada en la
// tanda 1 de la 0.9.0; el usuario la volvió a activar el 26/11/2026 y los disparadores de Date
// Picker, Date Range y Color Picker y la zona de File Upload llevan ahora el texto visible en su
// nombre. Una excepción nueva va aquí, una por una, con su motivo.
export const DISABLED_RULES: Record<string, string> = {};

export interface AxeViolation {
  id: string;
  impact: string | null;
  help: string;
  nodes: string[];
}

/**
 * Lo que el contraste no mira: los componentes deshabilitados de Mimi (`data-disabled`). El
 * criterio 1.4.3 exime el texto de un componente inactivo; axe ya salta `:disabled` y
 * `aria-disabled`, pero no el texto que no es el control (los chips de un Tags Input
 * deshabilitado, por ejemplo). Solo para `color-contrast`: el resto de las reglas sí los mira.
 */
const CONTRAST_EXCLUDE = ['[data-disabled]'];

/** Corre axe sobre `include` (por defecto, el documento) con WCAG 2.0 a 2.2, A y AA. */
export async function runAxe(page: Page, include?: string): Promise<AxeViolation[]> {
  await page.evaluate(AXE_SOURCE);
  return page.evaluate(
    async ({ include, disabled, contrastExclude }) => {
      const axe = (window as unknown as { axe: any }).axe;
      const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
      const off = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, { enabled: false }]));
      const context = include ? { include: [include] } : { include: [document] };
      const all = await axe.run(context, {
        runOnly: { type: 'tag', values: tags },
        rules: off([...disabled, 'color-contrast']),
        resultTypes: ['violations'],
      });
      const contrast = await axe.run(
        { ...context, exclude: contrastExclude.map((s: string) => [s]) },
        { runOnly: { type: 'rule', values: ['color-contrast'] }, resultTypes: ['violations'] },
      );
      const result = { violations: [...all.violations, ...contrast.violations] };
      return result.violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes
          .slice(0, 5)
          .map(
            (n: any) =>
              `${n.target.join(' ')}\n    ${n.html.slice(0, 160)}\n    ${n.failureSummary}`,
          ),
      }));
    },
    { include, disabled: Object.keys(DISABLED_RULES), contrastExclude: CONTRAST_EXCLUDE },
  );
}

/** Un resumen legible para el mensaje de la prueba. */
export function describeViolations(violations: AxeViolation[]): string {
  return violations
    .map((v) => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.join('\n  ')}`)
    .join('\n');
}
