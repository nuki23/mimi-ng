import { example, expect, isPhone, openDoc, test } from './fixtures';

/**
 * Comprobaciones de maquetación que vivían fuera del repo (M.18): `stepper-lines.mjs`,
 * `sheet-scroll.mjs` y `block-states.mjs` de la puerta de la 0.8.0.
 */

test('Stepper: cada línea va de un círculo al siguiente, con el mismo hueco a los dos lados', async ({
  page,
}) => {
  await openDoc(page, '/docs/components/stepper');
  const steppers = page.locator('mimi-stepper');
  const count = await steppers.count();
  expect(count).toBeGreaterThan(0);
  let measured = 0;
  for (let s = 0; s < count; s++) {
    const stepper = steppers.nth(s);
    await stepper.scrollIntoViewIfNeeded();
    const gaps = await stepper.evaluate((el) => {
      const dots = [...el.querySelectorAll<HTMLElement>('[data-slot="indicator"]')];
      const lines = [...el.querySelectorAll<HTMLElement>('[data-slot="step-line"]')];
      return lines.map((line, i) => {
        const a = dots[i].getBoundingClientRect();
        const b = dots[i + 1].getBoundingClientRect();
        const l = line.getBoundingClientRect();
        const horizontal = Math.abs(b.top - a.top) < 2;
        return horizontal
          ? { start: l.left - a.right, end: b.left - l.right }
          : { start: l.top - a.bottom, end: b.top - l.bottom };
      });
    });
    for (const gap of gaps) {
      expect(
        gap.start,
        `stepper ${s}: la línea empieza después del círculo`,
      ).toBeGreaterThanOrEqual(-0.5);
      expect(gap.end, `stepper ${s}: la línea acaba antes del círculo`).toBeGreaterThanOrEqual(
        -0.5,
      );
      expect(Math.abs(gap.start - gap.end), `stepper ${s}: el mismo hueco`).toBeLessThanOrEqual(2);
      expect(gap.start, `stepper ${s}: la línea llega cerca del círculo`).toBeLessThanOrEqual(12);
      measured++;
    }
  }
  expect(measured).toBeGreaterThan(4);
});

for (const side of ['right', 'left', 'bottom'] as const) {
  test(`Sheet (${side}): abierta, la página no se mueve; el margen es igual; al cerrar, nada salta`, async ({
    page,
  }) => {
    await openDoc(page, '/docs/components/sheet');
    const sides = example(page, 'sides');
    await sides.scrollIntoViewIfNeeded();
    const scrollBefore = await page.evaluate(() => window.scrollY);
    const h1Before = (await page.locator('h1').first().boundingBox())!;
    const labels = { right: /derecha/i, left: /izquierda/i, bottom: /abajo/i };
    const trigger = sides.getByRole('button', { name: labels[side] });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const frame = page.locator(`mimi-sheet-frame[data-side="${side}"]`);
    await expect(frame).toHaveAttribute('data-state', 'open');
    // La página no se desplaza ni se mueve de lado mientras está abierta.
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
    const h1Open = (await page.locator('h1').first().boundingBox())!;
    expect(Math.abs(h1Open.x - h1Before.x)).toBeLessThanOrEqual(0.5);
    // La rueda sobre el fondo no mueve la página (bloqueo de scroll del Sheet).
    if (!isPhone(test.info().project.name)) {
      await page.mouse.move(5, 300);
      await page.mouse.wheel(0, 400);
      expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
    }
    // El mismo margen en los lados que toca.
    const box = (await frame.boundingBox())!;
    const vw = await page.evaluate(() => document.documentElement.clientWidth);
    const vh = await page.evaluate(() => window.innerHeight);
    const margins = { left: box.x, right: vw - box.x - box.width, bottom: vh - box.y - box.height };
    const touches = side === 'bottom' ? ['left', 'right', 'bottom'] : [side, 'bottom'];
    const values = touches.map((t) => margins[t as keyof typeof margins]);
    expect(Math.max(...values) - Math.min(...values), JSON.stringify(margins)).toBeLessThanOrEqual(
      1,
    );
    await page.keyboard.press('Escape');
    await expect(frame).toHaveCount(0);
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
    await expect(trigger).toBeFocused();
  });
}

test('Blocks: a 360 px, cada estado del selector cabe en su botón', async ({ page }, info) => {
  test.skip(!isPhone(info.project.name), 'solo en los teléfonos');
  for (const name of ['dashboard-01', 'kanban-01', 'table-01']) {
    await openDoc(page, `/docs/blocks/${name}`);
    const buttons = page.locator('[data-slot="states"] button');
    expect(await buttons.count()).toBeGreaterThan(1);
    const overflow = await buttons.evaluateAll((els) =>
      els.filter((b) => b.scrollWidth > b.clientWidth + 1).map((b) => b.textContent!.trim()),
    );
    expect(overflow, name).toEqual([]);
  }
});
