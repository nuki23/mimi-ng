import { describeViolations, runAxe } from './axe';
import { example, expect, openDoc, test } from './fixtures';

/**
 * Parte B, punto 6 (tanda 1 de la 0.9.0): Table y Data Table en el teléfono. `stack`: cada fila,
 * una tarjeta con «etiqueta: valor», que sigue siendo una tabla para el lector; `scroll`: scroll
 * lateral con la primera columna fija. En Data Table, la búsqueda, los filtros y el orden van en
 * una hoja y la paginación se compacta.
 */
test.skip(({ isMobile }) => !isMobile, 'solo en los teléfonos');

test('Table, stack: tarjetas con la etiqueta de cada columna, dentro de la pantalla', async ({
  page,
}) => {
  await openDoc(page, '/docs/components/table');
  const stack = example(page, 'phone').locator('table[data-mobile="stack"]');
  await stack.scrollIntoViewIfNeeded();
  const cards = await stack.evaluate((table) => {
    const vw = document.documentElement.clientWidth;
    return [...table.querySelectorAll('tbody tr')].map((tr) => {
      const r = tr.getBoundingClientRect();
      const cells = [...tr.querySelectorAll('td')].map((td) => ({
        label: getComputedStyle(td, '::before').content,
        display: getComputedStyle(td).display,
      }));
      return { display: getComputedStyle(tr).display, inside: r.left >= 0 && r.right <= vw, cells };
    });
  });
  expect(cards.length).toBe(3);
  for (const card of cards) {
    expect(card.display).toBe('flex');
    expect(card.inside).toBe(true);
    expect(card.cells.map((c) => c.display)).toEqual(['flex', 'flex', 'flex', 'flex']);
    expect(card.cells[1].label).toContain('Cliente');
  }
  // Para el lector, sigue siendo una tabla con sus encabezados.
  await expect(page.getByRole('table', { name: 'Pedidos (stack)' })).toBeVisible();
  const headers = page.getByRole('table', { name: 'Pedidos (stack)' }).getByRole('columnheader');
  await expect(headers).toHaveCount(4);
});

test('Table, scroll: la tabla se desliza y la primera columna queda fija', async ({ page }) => {
  await openDoc(page, '/docs/components/table');
  const scroller = example(page, 'phone').locator('[mimicard]').first();
  await scroller.scrollIntoViewIfNeeded();
  const before = await scroller.evaluate((el) => {
    const first = el.querySelector('tbody td')!.getBoundingClientRect().left;
    const second = el.querySelectorAll('tbody td')[1].getBoundingClientRect().left;
    return { first, second, overflow: el.scrollWidth - el.clientWidth };
  });
  expect(before.overflow).toBeGreaterThan(0);
  await scroller.evaluate((el) => (el.scrollLeft = 80));
  await expect
    .poll(() =>
      scroller.evaluate((el) => el.querySelector('tbody td')!.getBoundingClientRect().left),
    )
    .toBeCloseTo(before.first, 0);
  const second = await scroller.evaluate(
    (el) => el.querySelectorAll('tbody td')[1].getBoundingClientRect().left,
  );
  expect(second).toBeLessThan(before.second - 40);
});

test('Data Table: tarjetas con casilla y acciones; buscar, filtrar y ordenar en una hoja', async ({
  page,
}) => {
  await openDoc(page, '/docs/components/data-table');
  const table = example(page, 'phone').locator('mimi-data-table');
  await table.scrollIntoViewIfNeeded();
  await expect(table).toHaveAttribute('data-mobile', 'stack');
  const rows = table.locator('tbody tr[role="row"]');
  await expect(rows).toHaveCount(4);
  await expect(rows.first().getByRole('checkbox')).toBeVisible();
  await expect(rows.first().getByRole('button', { name: 'Abrir' })).toBeVisible();
  // Nada se sale de la tarjeta ni de la pantalla.
  const out = await table.evaluate((el) => {
    const vw = document.documentElement.clientWidth;
    return [...el.querySelectorAll('tbody tr')].some((tr) => tr.getBoundingClientRect().right > vw);
  });
  expect(out).toBe(false);
  // La paginación, sin «filas por página».
  await expect(table.locator('[data-slot="footer"] mimi-pagination')).toBeVisible();

  const refine = table.locator('[data-slot="refine"]');
  const box = (await refine.boundingBox())!;
  expect(box.height).toBeGreaterThanOrEqual(44);
  await refine.focus();
  await page.keyboard.press('Enter');
  const sheet = page.locator('mimi-sheet-frame');
  await expect(sheet).toHaveAttribute('data-state', 'open');
  await sheet.locator('input[type="search"]').fill('a');
  await sheet.locator('[data-slot="sort-option"]').first().click();
  await expect(sheet.locator('[data-slot="sort-option"]').first()).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const violations = await runAxe(page);
  expect(violations, describeViolations(violations)).toEqual([]);
  await sheet.locator('[data-slot="show-results"]').click();
  await expect(sheet).toHaveCount(0);
  await expect(refine).toBeFocused();
  await expect(table.locator('[data-slot="refine-count"]')).toHaveText('1');
});
