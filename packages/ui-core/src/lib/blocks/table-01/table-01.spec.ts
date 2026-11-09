import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TABLE_01_CUSTOMERS, Table01, type Table01Customer } from './table-01';

@Component({
  imports: [Table01],
  template: `<mimi-table-01
    class="bg-muted"
    locale="en-US"
    [customers]="customers()"
    [(selection)]="selection"
    (newCustomer)="events.push('new')"
    (importCsv)="events.push('import')"
    (exported)="events.push('export:' + $event.join())"
    (deleted)="events.push('delete:' + $event.join())"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly customers = signal<readonly Table01Customer[]>(TABLE_01_CUSTOMERS);
  readonly selection = signal<unknown[]>([]);
  readonly events: string[] = [];
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

/** table-01 (B.9). */
describe('Table01', { timeout: 20_000 }, () => {
  afterEach(() => document.body.replaceChildren());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const table = el.querySelector('mimi-data-table')!;
    const mobile = el.querySelector<HTMLElement>('.md\\:hidden:not(header *)')!;
    return { fixture, host: fixture.componentInstance, el, table, mobile };
  }

  it('cabecera con el total y el ingreso mensual; un solo h1; el resto sin landmarks', async () => {
    const { el } = await setup();
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(el.querySelector('h1')!.textContent).toBe('Customers');
    const total = TABLE_01_CUSTOMERS.reduce((sum, c) => sum + c.mrr, 0);
    expect(el.querySelector('header p')!.textContent).toBe(
      `36 accounts · $${total.toLocaleString('en-US')} MRR`,
    );
    expect(el.querySelector('main')).toBeNull();
    const block = el.querySelector('mimi-table-01')!;
    // La clase del usuario gana sobre la del Block (cn()).
    expect(block.className).toContain('bg-muted');
    expect(block.className).not.toContain('bg-background');
  });

  it('el resumen cuenta los clientes por estado', async () => {
    const { el } = await setup();
    const counts = [...el.querySelectorAll('ul[aria-label="Customers by status"] li')].map((li) =>
      li.textContent!.replace(/\s+/g, ' ').trim(),
    );
    const n = (s: string) => TABLE_01_CUSTOMERS.filter((c) => c.status === s).length;
    expect(counts).toEqual([
      `Active${n('active')}`,
      `Trial${n('trial')}`,
      `Past due${n('past-due')}`,
      `Canceled${n('canceled')}`,
    ]);
  });

  it('la Data Table: filas con su estado y su ingreso, y filtros por estado y plan', async () => {
    const { table } = await setup();
    expect(table.getAttribute('aria-label')).toBeNull();
    expect(table.querySelector('table')!.getAttribute('aria-label')).toBe('Customers');
    const first = table.querySelector('tbody tr')!;
    expect(first.querySelector('[mimibadge]')!.textContent!.trim()).toBe('Active');
    expect(first.textContent).toContain('$');
    const filters = [...table.querySelectorAll('[data-slot="filter"]')].map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(filters).toEqual(['Filter Status', 'Filter Plan']);
  });

  it('las acciones de la selección salen por deleted y exported con los ids', async () => {
    const { table, host, fixture } = await setup();
    table.querySelector<HTMLElement>('tbody [role="checkbox"]')!.click();
    await settle(fixture);
    expect(host.selection()).toEqual([1]);
    const bulk = [...table.querySelectorAll<HTMLButtonElement>('[data-slot="selection"] button')];
    bulk.find((b) => b.textContent!.includes('Export'))!.click();
    bulk.find((b) => b.textContent!.includes('Delete'))!.click();
    expect(host.events).toEqual(['export:1', 'delete:1']);
  });

  it('New customer e Import CSV salen como eventos', async () => {
    const { el, host } = await setup();
    el.querySelector<HTMLButtonElement>('button[aria-label="New customer"]')!.click();
    [...el.querySelectorAll<HTMLButtonElement>('header button')]
      .find((b) => b.textContent!.includes('Import CSV'))!
      .click();
    expect(host.events).toEqual(['new', 'import']);
  });

  it('móvil: la búsqueda (sin tildes) y las píldoras de estado filtran la lista', async () => {
    const { el, fixture, mobile } = await setup();
    const rows = () => mobile.querySelectorAll('ul > li');
    expect(rows().length).toBe(36);
    const search = mobile.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.value = 'cafe';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await settle(fixture);
    expect(rows().length).toBe(4);
    expect(mobile.querySelector('[role="status"]')!.textContent).toBe('4 results');
    search.value = 'zzz';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    await settle(fixture);
    expect(mobile.querySelector('ul')!.textContent).toContain('No customers match.');
    search.value = '';
    search.dispatchEvent(new Event('input', { bubbles: true }));
    const pills = [...mobile.querySelectorAll<HTMLButtonElement>('[role="group"] button')];
    expect(pills[0].getAttribute('aria-pressed')).toBe('true');
    pills.find((b) => b.textContent!.includes('Trial'))!.click();
    await settle(fixture);
    expect(rows().length).toBe(TABLE_01_CUSTOMERS.filter((c) => c.status === 'trial').length);
    expect(el.querySelectorAll('[role="group"] button[aria-pressed="true"]').length).toBe(1);
  });

  it('móvil: elegir muestra la barra de acciones; seleccionar todos marca la lista visible', async () => {
    const { mobile, host, fixture } = await setup();
    mobile.querySelector<HTMLElement>('ul [role="checkbox"]')!.click();
    await settle(fixture);
    expect(host.selection()).toEqual([1]);
    const bar = mobile.querySelector('[role="toolbar"]')!;
    expect(bar.getAttribute('aria-label')).toBe('Bulk actions');
    expect(bar.textContent).toContain('1 selected');
    mobile.querySelector<HTMLElement>('label [role="checkbox"]')!.click();
    await settle(fixture);
    expect(host.selection().length).toBe(36);
    [...bar.querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => b.textContent!.includes('Clear'))!
      .click();
    await settle(fixture);
    expect(host.selection()).toEqual([]);
    expect(mobile.querySelector('[role="toolbar"]')).toBeNull();
  });

  it('sin datos propios usa los de ejemplo; con customers, los suyos', async () => {
    const { host, el, fixture } = await setup();
    host.customers.set([TABLE_01_CUSTOMERS[0]]);
    await settle(fixture);
    expect(el.querySelector('header p')!.textContent).toContain('1 accounts');
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
  });
});
