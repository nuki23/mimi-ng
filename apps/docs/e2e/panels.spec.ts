import { describeViolations, runAxe } from './axe';
import { expect, isPhone, openDoc, test } from './fixtures';

/**
 * Los paneles flotantes abiertos (M.15 con los paneles abiertos; antes, `pw-scen.mjs` y
 * `sheet-buttons.mjs`, fuera del repo): se abren desde la demo de cada página, en escritorio como
 * popover y en el teléfono (menos de 640 px) como hoja inferior o pantalla completa (R.34); axe
 * sin violaciones con el panel abierto; Escape lo cierra y el foco vuelve al disparador.
 */
interface Case {
  page: string;
  /** El disparador, dentro de la página. */
  trigger: string;
  /** Lo que se abre (dentro de `.cdk-overlay-pane`). */
  panel: string;
  /** Cómo se presenta en el teléfono: hoja inferior, pantalla completa o igual que en escritorio. */
  phone: 'bottom' | 'full' | 'same';
}

const CASES: Case[] = [
  { page: 'select', trigger: '[role="combobox"]', panel: '[role="listbox"]', phone: 'bottom' },
  { page: 'combobox', trigger: 'input[role="combobox"]', panel: '[role="listbox"]', phone: 'full' },
  {
    page: 'date-picker',
    trigger: 'mimi-date-picker button',
    panel: 'mimi-calendar',
    phone: 'bottom',
  },
  {
    page: 'date-range',
    trigger: 'mimi-date-range button',
    panel: 'mimi-calendar',
    phone: 'bottom',
  },
  {
    page: 'color-picker',
    trigger: 'mimi-color-input button',
    panel: 'mimi-color-picker',
    phone: 'bottom',
  },
  {
    page: 'dropdown-menu',
    trigger: 'button[aria-haspopup="menu"]',
    panel: '[role="menu"]',
    phone: 'bottom',
  },
  {
    page: 'popover',
    trigger: 'button[aria-haspopup="dialog"]',
    panel: '[role="dialog"]',
    phone: 'same',
  },
  {
    page: 'dialog',
    trigger: '[data-slot="example"] button',
    panel: '.cdk-overlay-container [role="dialog"]',
    phone: 'same',
  },
  {
    page: 'sheet',
    trigger: '[data-slot="example"] button',
    panel: '.cdk-overlay-container mimi-sheet-frame',
    phone: 'same',
  },
];

for (const c of CASES) {
  for (const scheme of ['light', 'dark'] as const) {
    test(`${c.page}: el panel abre, pasa axe y Escape lo cierra (${scheme})`, async ({
      page,
      errors,
    }, info) => {
      await openDoc(page, `/docs/components/${c.page}`, scheme);
      const trigger = page.locator(c.trigger).first();
      await trigger.scrollIntoViewIfNeeded();
      // Con el teclado (foco y Enter): Safari no enfoca un botón al hacer clic ni al tocarlo, y
      // el CDK devuelve el foco a lo que lo tenía al abrir; así la vuelta del foco se prueba
      // igual en los cinco proyectos. El campo de Combobox toma el foco con el clic.
      if (c.page === 'combobox') {
        await trigger.click();
      } else {
        await trigger.focus();
        await page.keyboard.press('Enter');
      }
      // El CDK pinta los paneles con el `popover` nativo (en la capa superior), donde esté el
      // componente; la hoja, en el contenedor del CDK.
      const overlay = page.locator('.cdk-overlay-pane');
      const phone = isPhone(info.project.name) && c.phone !== 'same';
      if (phone) {
        const sheet = page.locator(`mimi-sheet-frame[data-side="${c.phone}"]`);
        await expect(sheet).toBeVisible();
        await expect(sheet).toHaveAttribute('data-state', 'open');
        // La X de la hoja: un objetivo táctil de 40 px como mínimo (sheet-buttons.mjs).
        const close = sheet.locator('[data-slot="close"]').first();
        const box = (await close.boundingBox())!;
        expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(40);
      }
      const panel = c.panel.startsWith('.cdk-overlay-container')
        ? page.locator(c.panel)
        : overlay.locator(c.panel);
      await expect(panel.first()).toBeVisible();

      const violations = await runAxe(page);
      expect(violations, describeViolations(violations)).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(panel).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(errors).toEqual([]);
    });
  }
}
