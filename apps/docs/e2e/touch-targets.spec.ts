import { expect, openDoc, test } from './fixtures';

/**
 * Parte B, punto 7 (M.31): con el dedo, los controles principales tienen un área táctil de 44 px
 * como mínimo, sin cambiar su aspecto. Los `md` (Button, Input…) miden 44 px con puntero grueso
 * (`--mimi-control-height`), y los pequeños llevan `mimi-touch` (un `::after` de 44 × 44). Se mide
 * el elemento o su `::after`, lo que sea mayor, en la demo de cada página.
 */
test.describe('con ratón', () => {
  test('nada cambia: Button md sigue en 40 px y el Checkbox sin área extra', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'solo en escritorio');
    await openDoc(page, '/docs/components/checkbox');
    const demo = page.locator('[data-slot="doc-page"] [data-slot="example"]').first();
    const box = demo.locator('[role="checkbox"]').first();
    expect(await box.evaluate((el) => getComputedStyle(el, '::after').content)).toBe('none');
    await openDoc(page, '/docs/components/button');
    const button = page.locator('[data-slot="doc-page"] [data-slot="example"] button').first();
    expect((await button.boundingBox())!.height).toBe(40);
  });
});

const CASES: { page: string; selector: string }[] = [
  { page: 'button', selector: 'button[mimiBtn]' },
  { page: 'input', selector: 'input[mimiInput]' },
  { page: 'checkbox', selector: '[role="checkbox"]' },
  { page: 'switch', selector: '[role="switch"]' },
  { page: 'slider', selector: '[role="slider"]' },
  { page: 'pagination', selector: 'mimi-pagination button' },
  { page: 'toggle-group', selector: '[mimiToggleGroupItem]' },
  { page: 'tabs', selector: '[role="tab"]' },
  { page: 'toolbar', selector: '[mimiToolbarItem]' },
  { page: 'number-input', selector: '[data-slot="increment"]' },
  { page: 'password', selector: '[data-slot="toggle"]' },
  { page: 'tags-input', selector: '[data-slot="remove"], mimi-chip button' },
  // El disparador entero (la caja con borde); el `combobox` de aria va dentro, sin el borde.
  { page: 'select', selector: 'mimi-select [class*="group/select"]' },
  { page: 'sortable-list', selector: '[data-slot="handle"]' },
  { page: 'table', selector: 'th [data-slot="sort"]' },
];

for (const c of CASES) {
  test(`área táctil de 44 px: ${c.page}`, async ({ page, isMobile }) => {
    test.skip(!isMobile, 'solo en los teléfonos');
    await openDoc(page, `/docs/components/${c.page}`);
    // La demo (el primer ejemplo de la página, sin encabezado propio).
    const demo = page.locator('[data-slot="doc-page"] [data-slot="example"]').first();
    const target = demo.locator(c.selector).first();
    await target.scrollIntoViewIfNeeded();
    const size = await target.evaluate((el) => {
      const r = el.getBoundingClientRect();
      let w = r.width;
      let h = r.height;
      const after = getComputedStyle(el, '::after');
      if (after.content !== 'none' && after.position === 'absolute') {
        w = Math.max(w, parseFloat(after.width) || 0);
        h = Math.max(h, parseFloat(after.height) || 0);
      }
      return Math.round(Math.min(w, h));
    });
    expect(size).toBeGreaterThanOrEqual(44);
  });
}
