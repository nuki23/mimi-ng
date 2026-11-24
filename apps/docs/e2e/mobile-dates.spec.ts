import type { Page } from '@playwright/test';
import { expect, openDoc, test } from './fixtures';

/**
 * Parte B, punto 5 (tanda 1 de la 0.9.0): en el teléfono, Date Picker y Date Range son de la
 * misma familia: la misma hoja inferior, la misma cabecera (título y X), el calendario a todo el
 * ancho con el mismo margen, el mismo pie («Hoy» e «Ir a hoy») y, en Date Range, los atajos en
 * una sola fila que se desliza, sin romper esa estructura.
 */
test.skip(({ isMobile }) => !isMobile, 'solo en los teléfonos');

async function openSheet(page: Page, path: string, trigger: string) {
  await openDoc(page, path);
  const button = page.locator(trigger).first();
  await button.scrollIntoViewIfNeeded();
  await button.focus();
  await page.keyboard.press('Enter');
  const sheet = page.locator('mimi-sheet-frame');
  await expect(sheet).toHaveAttribute('data-state', 'open');
  return sheet.evaluate((frame) => {
    const box = (el: Element | null) => {
      const r = el!.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    };
    const calendar = frame.querySelector('mimi-calendar')!;
    const presets = frame.querySelector('[data-slot="presets"]');
    return {
      side: frame.getAttribute('data-side'),
      handle: !!frame.querySelector('[data-slot="handle"]'),
      title: frame.querySelector('[data-slot="title"]')?.textContent?.trim() ?? '',
      close: box(frame.querySelector('[data-slot="close"]')),
      frame: box(frame),
      calendar: box(calendar),
      fill: calendar.hasAttribute('data-fill'),
      footer: !!frame.querySelector('[data-slot="go-today"]'),
      presets: presets ? { ...box(presets), oneRow: presets.scrollHeight <= 48 } : null,
      viewport: window.innerHeight,
    };
  });
}

test('Date Picker y Date Range: la misma hoja, cabecera, calendario y pie', async ({ page }) => {
  const date = await openSheet(page, '/docs/components/date-picker', 'mimi-date-picker button');
  await page.keyboard.press('Escape');
  const range = await openSheet(page, '/docs/components/date-range', 'mimi-date-range button');

  for (const s of [date, range]) {
    expect(s.side).toBe('bottom');
    expect(s.handle).toBe(true);
    expect(s.title.length).toBeGreaterThan(0);
    expect(Math.min(s.close.w, s.close.h)).toBeGreaterThanOrEqual(40);
    expect(s.fill).toBe(true);
    expect(s.footer).toBe(true);
    // Entera en la pantalla.
    expect(s.frame.y).toBeGreaterThanOrEqual(0);
    expect(s.frame.y + s.frame.h).toBeLessThanOrEqual(s.viewport + 1);
  }
  // El calendario, con el mismo ancho y el mismo margen en los dos.
  expect(Math.abs(date.calendar.w - range.calendar.w)).toBeLessThanOrEqual(2);
  expect(Math.abs(date.calendar.x - range.calendar.x)).toBeLessThanOrEqual(2);
  expect(Math.abs(date.close.x - range.close.x)).toBeLessThanOrEqual(1);
  // Los atajos: una fila, encima del calendario, del ancho de la hoja.
  expect(range.presets).not.toBeNull();
  expect(range.presets!.oneRow).toBe(true);
  expect(range.presets!.y + range.presets!.h).toBeLessThanOrEqual(range.calendar.y);
});
