import { TestBed } from '@angular/core/testing';
import { Dashboard01, DASHBOARD_01_CUSTOMERS, DASHBOARD_01_STATS } from './dashboard-01';

async function setup() {
  const fixture = TestBed.createComponent(Dashboard01);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  return { fixture, el, block: fixture.componentInstance, stable: () => fixture.whenStable() };
}

describe('dashboard-01', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  it('una sola h1; menú lateral con nombre, el activo con aria-current="page"', async () => {
    const { el } = await setup();
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('h1')!.textContent).toContain('Hi, Ana');
    const aside = el.querySelector<HTMLElement>('[data-slot="sidebar"]')!;
    const nav = aside.querySelector('nav')!;
    expect(nav.getAttribute('aria-label')).toBe('Main');
    const current = nav.querySelectorAll('[aria-current="page"]');
    expect(current.length).toBe(1);
    expect(current[0].textContent).toContain('Home');
    // El menú del lateral se esconde en el teléfono (el Sheet lo reemplaza).
    expect(aside.className).toContain('hidden');
    expect(aside.className).toContain('md:flex');
  });

  // Revisión de accesibilidad de la tanda 2: D1 (cargando también se ve), D2 (sin un aside con
  // nombre alrededor del nav), D3 (los grupos del menú no son encabezados antes de la h1) y D4
  // (sin header suelto, que sería el «banner» de la página).
  it('landmarks y encabezados en orden; cargando también se ve', async () => {
    const { fixture, el, stable } = await setup();
    expect(el.querySelector('aside')).toBeNull();
    expect(el.querySelectorAll('nav').length).toBe(1);
    // Un header fuera de una sección sería el «banner»; los de las tarjetas van en su section.
    for (const header of Array.from(el.querySelectorAll('header'))) {
      expect(header.closest('section')).not.toBeNull();
    }
    const headings = Array.from(el.querySelectorAll('h1, h2'));
    expect(headings[0].tagName).toBe('H1');
    // Cada grupo del menú nombra su lista, con ids únicos.
    const lists = Array.from(el.querySelectorAll<HTMLElement>('nav ul[aria-labelledby]'));
    expect(lists.length).toBe(2);
    expect(
      el.querySelector(`[id="${lists[1].getAttribute('aria-labelledby')}"]`)!.textContent,
    ).toContain('Team');
    expect(el.className).toContain('data-[state=loading]:opacity-60');
    fixture.componentRef.setInput('loading', true);
    await stable();
    expect(el.dataset['state']).toBe('loading');
  });

  it('elegir en el menú cambia active (de dos vías)', async () => {
    const { el, block, stable } = await setup();
    const items = el.querySelectorAll<HTMLButtonElement>(
      '[data-slot="sidebar"] [data-slot="nav-item"]',
    );
    items[1].click();
    await stable();
    expect(block.active()).toBe('customers');
    expect(items[1].getAttribute('aria-current')).toBe('page');
    expect(items[0].hasAttribute('aria-current')).toBe(false);
  });

  it('en el teléfono, «Open menu» abre el menú en un Sheet desde la izquierda; elegir lo cierra', async () => {
    const { el, block, stable } = await setup();
    const trigger = el.querySelector<HTMLButtonElement>('button[aria-label="Open menu"]')!;
    expect(trigger.closest('.md\\:hidden')).not.toBeNull();
    // 40 px para el dedo: md propio (sin él, heredaría el sm del Sheet).
    expect(trigger.getAttribute('data-size')).toBe('md');
    trigger.click();
    await stable();
    await new Promise((r) => setTimeout(r));
    await stable();
    const sheet = document.querySelector<HTMLElement>('[data-mimi-sheet]');
    expect(sheet).not.toBeNull();
    expect(sheet!.dataset['side']).toBe('left');
    const item = sheet!.querySelectorAll<HTMLButtonElement>('[data-slot="nav-item"]')[3];
    item.click();
    await stable();
    expect(block.active()).toBe('reports');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('métricas en tarjetas, gráfico con sus valores para los lectores, tabla y actividad', async () => {
    const { el } = await setup();
    const stats = el.querySelectorAll('[data-slot="stat"]');
    expect(stats.length).toBe(DASHBOARD_01_STATS.length);
    expect(stats[0].textContent).toContain('$412,380');
    expect(el.querySelector('ul[aria-label="Key metrics"]')).not.toBeNull();
    // Barras decorativas; los valores, en una lista sr-only.
    expect(el.querySelector('[data-slot="chart"]')!.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('ul.sr-only')!.textContent).toContain('Sep: 412');
    // Tabla de clientes recientes, con su nombre.
    const table = el.querySelector('table')!;
    expect(table.getAttribute('aria-labelledby')).toBe('dashboard-01-customers');
    expect(table.querySelectorAll('tbody tr').length).toBe(DASHBOARD_01_CUSTOMERS.length);
    expect(table.textContent).toContain('Past due');
    // Actividad: lista ordenada.
    expect(el.querySelectorAll('section ol li').length).toBe(4);
  });

  it('vacío: la tabla y la actividad lo dicen', async () => {
    const { fixture, el, stable } = await setup();
    fixture.componentRef.setInput('customers', []);
    fixture.componentRef.setInput('activity', []);
    await stable();
    expect(el.querySelector('table tbody')!.textContent).toContain('No customers yet');
    expect(el.textContent).toContain('No activity yet.');
  });

  it('salidas: New customer y View all', async () => {
    const { el, block } = await setup();
    const created = vi.fn();
    const viewed = vi.fn();
    block.newCustomer.subscribe(created);
    block.viewAllCustomers.subscribe(viewed);
    const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('button'));
    buttons.find((b) => b.textContent!.trim() === 'New customer')!.click();
    buttons.find((b) => b.textContent!.trim() === 'View all')!.click();
    expect(created).toHaveBeenCalledTimes(1);
    expect(viewed).toHaveBeenCalledTimes(1);
  });

  it('class del usuario con cn()', async () => {
    const { fixture, el, stable } = await setup();
    fixture.componentRef.setInput('class', 'min-h-0');
    await stable();
    const classes = el.className.split(/\s+/);
    expect(classes).toContain('min-h-0');
    expect(classes).not.toContain('min-h-dvh');
  });
});
