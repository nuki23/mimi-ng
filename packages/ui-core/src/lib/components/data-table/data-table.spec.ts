import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MimiDataTableImports,
  type MimiTableColumn,
  type MimiTableFilters,
  type MimiTableSort,
} from './data-table';
import { MIMI_DATA_TABLE_TEXT_ES, provideMimiDataTableText } from './data-table-texts';

interface Client {
  id: number;
  name: string;
  status: 'active' | 'trial' | 'paused';
  mrr: number;
}

const CLIENTS: Client[] = [
  { id: 1, name: 'Acme', status: 'active', mrr: 1200 },
  { id: 2, name: 'Bogotá Labs', status: 'trial', mrr: 0 },
  { id: 3, name: 'Cóndor', status: 'active', mrr: 640 },
  { id: 4, name: 'Delta', status: 'paused', mrr: 90 },
  { id: 5, name: 'Énfasis', status: 'active', mrr: 2400 },
];

const COLUMNS: MimiTableColumn<Client>[] = [
  { id: 'name', header: 'Cliente', sortable: true, sticky: true, width: '200px' },
  {
    id: 'status',
    header: 'Estado',
    filterOptions: [
      { label: 'Activo', value: 'active' },
      { label: 'Prueba', value: 'trial' },
      { label: 'Pausado', value: 'paused' },
    ],
  },
  { id: 'mrr', header: 'MRR', sortable: true, align: 'end', searchable: false },
];

@Component({
  imports: [MimiDataTableImports],
  template: `
    <mimi-data-table
      data-test="full"
      aria-label="Clientes"
      selectable
      [data]="data()"
      [columns]="columns"
      [loading]="loading()"
      [total]="total()"
      [pageSizeOptions]="[2, 5]"
      [class]="extra()"
      [(selection)]="selection"
      [(sort)]="sort"
      [(query)]="query"
      [(filters)]="filters"
      [(page)]="page"
      [(pageSize)]="pageSize"
      [(expanded)]="expanded"
      [(density)]="density"
    >
      <ng-template mimiTableCell="status" let-row let-value="value" let-density="density">
        <b data-test="status">{{ value }}·{{ row.id }}·{{ density }}</b>
      </ng-template>
      <ng-template mimiTableDetail let-row>
        <p data-test="detail">Detalle {{ row.name }}</p>
      </ng-template>
      <ng-template mimiTableActions let-row>
        <button data-test="action">{{ row.name }}</button>
      </ng-template>
      <ng-template mimiTableBulk let-ids>
        <button data-test="bulk">Borrar {{ ids.length }}</button>
      </ng-template>
      <button data-test="empty-action" mimiTableEmpty>Nuevo cliente</button>
    </mimi-data-table>
    <mimi-data-table
      data-test="plain"
      aria-label="Simple"
      [toolbar]="false"
      [data]="small"
      [columns]="plain"
    />
  `,
})
class Host {
  readonly columns = COLUMNS;
  readonly plain: MimiTableColumn<{ id: string; label: string }>[] = [
    { id: 'label', header: 'Nombre' },
  ];
  readonly small = [
    { id: 'a', label: 'Uno' },
    { id: 'b', label: 'Dos' },
  ];
  readonly data = signal<Client[]>(CLIENTS);
  readonly loading = signal(false);
  readonly total = signal<number | null>(null);
  readonly extra = signal('');
  readonly selection = signal<unknown[]>([]);
  readonly sort = signal<MimiTableSort | null>(null);
  readonly query = signal('');
  readonly filters = signal<MimiTableFilters>({});
  readonly page = signal(1);
  readonly pageSize = signal(2);
  readonly expanded = signal<unknown[]>([]);
  readonly density = signal<'compact' | 'comfortable'>('compact');
}

@Component({
  imports: [MimiDataTableImports],
  template: `
    <mimi-data-table
      aria-label="Sin id"
      selectable
      [data]="rows"
      [columns]="columns"
      [(selection)]="selection"
    />
  `,
})
class NoIdHost {
  readonly rows = [{ name: 'Ana' }, { name: 'Beto' }, { name: 'Cris' }];
  readonly columns: MimiTableColumn<{ name: string }>[] = [{ id: 'name', header: 'Nombre' }];
  readonly selection = signal<unknown[]>([]);
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('MimiDataTable', { timeout: 20_000 }, () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const table = root.querySelector<HTMLElement>('[data-test="full"]')!;
    const rows = () =>
      Array.from(table.querySelectorAll<HTMLTableRowElement>('tbody tr:not([data-slot])'));
    const names = () =>
      rows()
        .filter((r) => r.querySelectorAll('td').length > 1)
        .map((r) => r.querySelectorAll('td')[2].textContent!.trim());
    const head = (text: string) =>
      Array.from(table.querySelectorAll<HTMLElement>('th')).find((th) =>
        th.textContent!.includes(text),
      )!;
    const live = () => table.querySelector('[role="status"]')!.textContent!.trim();
    const type = async (text: string) => {
      const input = table.querySelector<HTMLInputElement>('[data-slot="search"]')!;
      input.value = text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, root, table, rows, names, head, live, type };
  }

  afterEach(() => document.body.replaceChildren());

  it('tabla con nombre, encabezados con scope, primera página y rango', async () => {
    const { table, names } = await setup();
    const el = table.querySelector('table')!;
    expect(el.getAttribute('aria-label')).toBe('Clientes');
    expect(table.getAttribute('aria-label')).toBeNull();
    const ths = Array.from(table.querySelectorAll('th'));
    expect(ths.every((th) => th.getAttribute('scope') === 'col')).toBe(true);
    // Casilla, expandir, 3 columnas y acciones.
    expect(ths.length).toBe(6);
    expect(names()).toEqual(['Acme', 'Bogotá Labs']);
    expect(table.querySelector('[data-slot="range"]')!.textContent).toBe('1–2 of 5');
    expect(table.querySelector('mimi-pagination')).not.toBeNull();
  });

  it('ordena con el ciclo asc → desc → ninguno y aria-sort', async () => {
    const { table, head, names, host, fixture } = await setup();
    const sortBtn = () => head('MRR').querySelector<HTMLButtonElement>('[data-slot="sort"]')!;
    expect(head('MRR').getAttribute('aria-sort')).toBe('none');
    expect(head('Estado').getAttribute('aria-sort')).toBeNull();
    sortBtn().click();
    await settle(fixture);
    expect(host.sort()).toEqual({ column: 'mrr', direction: 'asc' });
    expect(head('MRR').getAttribute('aria-sort')).toBe('ascending');
    expect(names()).toEqual(['Bogotá Labs', 'Delta']);
    sortBtn().click();
    await settle(fixture);
    expect(head('MRR').getAttribute('aria-sort')).toBe('descending');
    expect(names()).toEqual(['Énfasis', 'Acme']);
    sortBtn().click();
    await settle(fixture);
    expect(host.sort()).toBeNull();
    expect(table.querySelector('th[aria-sort="none"]')).not.toBeNull();
  });

  it('busca sin tildes (solo en columnas buscables) y vuelve a la página 1', async () => {
    const { host, names, type, live, table, fixture } = await setup();
    host.page.set(2);
    await settle(fixture);
    await type('condor');
    expect(host.query()).toBe('condor');
    expect(host.page()).toBe(1);
    expect(names()).toEqual(['Cóndor']);
    expect(live()).toBe('1–1 of 1');
    await type('2400');
    expect(names()).toEqual([]);
    expect(table.querySelector('[data-slot="empty"]')!.textContent).toContain('No results');
    expect(live()).toBe('No results');
    table.querySelector<HTMLButtonElement>('[data-slot="clear-all"]')!.click();
    await settle(fixture);
    expect(host.query()).toBe('');
    expect(names().length).toBe(2);
  });

  it('filtro por columna: chips con su botón de quitar y «Limpiar filtros»', async () => {
    const { host, names, table, fixture, head } = await setup();
    host.filters.set({ status: ['active'] });
    host.pageSize.set(5);
    await settle(fixture);
    expect(names()).toEqual(['Acme', 'Cóndor', 'Énfasis']);
    const filterBtn = head('Estado').querySelector('[data-slot="filter"]')!;
    expect(filterBtn.getAttribute('aria-label')).toBe('Filter Estado');
    expect(filterBtn.hasAttribute('data-active')).toBe(true);
    const chips = Array.from(table.querySelectorAll('mimi-chip'));
    expect(chips.map((c) => c.textContent!.trim())).toEqual(['Estado: Activo']);
    chips[0].querySelector<HTMLButtonElement>('[data-slot="remove"]')!.click();
    await settle(fixture);
    expect(host.filters()).toEqual({ status: [] });
    expect(names().length).toBe(5);
    host.filters.set({ status: ['trial', 'paused'] });
    await settle(fixture);
    expect(names()).toEqual(['Bogotá Labs', 'Delta']);
    table.querySelector<HTMLButtonElement>('[data-slot="clear-filters"]')!.click();
    await settle(fixture);
    expect(host.filters()).toEqual({});
  });

  it('el menú del filtro marca y desmarca con casillas de menú', async () => {
    const { head, host, fixture } = await setup();
    head('Estado').querySelector<HTMLButtonElement>('[data-slot="filter"]')!.click();
    await settle(fixture);
    const items = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]'));
    expect(items.map((i) => i.textContent!.trim())).toEqual(['Activo', 'Prueba', 'Pausado']);
    items[2].click();
    await settle(fixture);
    expect(host.filters()).toEqual({ status: ['paused'] });
  });

  it('selección: fila, toda la página (parcial), barra con contador y acciones', async () => {
    const { table, rows, host, fixture, live } = await setup();
    const boxes = () => Array.from(table.querySelectorAll<HTMLElement>('[role="checkbox"]'));
    expect(boxes()[0].getAttribute('aria-label')).toBe('Select all rows on this page');
    expect(boxes()[1].getAttribute('aria-label')).toBe('Select Acme');
    boxes()[1].click();
    await settle(fixture);
    expect(host.selection()).toEqual([1]);
    // En una `<table>` el rol `row` no admite aria-selected: la fila elegida lo dice su casilla.
    expect(rows()[0].hasAttribute('aria-selected')).toBe(false);
    expect(rows()[0].hasAttribute('data-selected')).toBe(true);
    expect(boxes()[0].getAttribute('aria-checked')).toBe('mixed');
    expect(table.querySelector('[data-slot="selection"]')!.textContent).toContain('1 selected');
    expect(live()).toBe('1 selected');
    expect(table.querySelector('[data-test="bulk"]')!.textContent).toBe('Borrar 1');
    boxes()[0].click();
    await settle(fixture);
    expect(host.selection()).toEqual([1, 2]);
    // En la página 2, la casilla del encabezado mira solo esa página.
    host.page.set(2);
    await settle(fixture);
    expect(boxes()[0].getAttribute('aria-checked')).toBe('false');
    table.querySelector<HTMLButtonElement>('[data-slot="clear-selection"]')!.click();
    await settle(fixture);
    expect(host.selection()).toEqual([]);
    expect(table.querySelector('[data-slot="search"]')).not.toBeNull();
  });

  it('al buscar o filtrar, la selección pierde las filas que ya no se ven (G3.P)', async () => {
    // Con filas elegidas la barra reemplaza al buscador: la búsqueda y los filtros cambian desde
    // fuera (los modelos `query` y `filters`).
    const { table, host, fixture } = await setup();
    host.selection.set([1, 4, 5]);
    await settle(fixture);
    // Buscar «delta»: solo la fila 4 se ve; la barra no cuenta ni entrega la 1 y la 5.
    host.query.set('delta');
    await settle(fixture);
    expect(host.selection()).toEqual([4]);
    expect(table.querySelector('[data-slot="selection"]')!.textContent).toContain('1 selected');
    expect(table.querySelector('[data-test="bulk"]')!.textContent).toBe('Borrar 1');
    // Quitar la búsqueda no devuelve lo podado.
    host.query.set('');
    await settle(fixture);
    expect(host.selection()).toEqual([4]);
    // Un filtro por columna poda igual: «Activo» deja fuera la 4.
    host.selection.set([1, 4]);
    host.filters.set({ status: ['active'] });
    await settle(fixture);
    expect(host.selection()).toEqual([1]);
  });

  it('expandir: aria-expanded y aria-controls al detalle; acciones y celdas propias', async () => {
    const { table, host, fixture } = await setup();
    const expand = table.querySelector<HTMLButtonElement>('[data-slot="expand"]')!;
    expect(expand.getAttribute('aria-label')).toBe('Details of Acme');
    expect(expand.getAttribute('aria-expanded')).toBe('false');
    expand.click();
    await settle(fixture);
    expect(host.expanded()).toEqual([1]);
    expect(expand.getAttribute('aria-expanded')).toBe('true');
    const detail = document.getElementById(expand.getAttribute('aria-controls')!)!;
    expect(detail.textContent).toContain('Detalle Acme');
    expect(table.querySelectorAll('[data-test="action"]').length).toBe(2);
    expect(table.querySelector('[data-test="status"]')!.textContent).toBe('active·1·compact');
  });

  it('densidad: el grupo de la barra cambia el modelo, la plantilla y los tokens', async () => {
    const { table, host, fixture } = await setup();
    const td = table.querySelector('tbody td')!;
    expect(td.className).toContain('h-[var(--mimi-table-row-h,var(--mimi-table-row-height,42px))]');
    expect(td.className).toContain(
      'group-data-[density=comfortable]/data-table:h-[var(--mimi-table-row-height-comfortable,60px)]',
    );
    const comfortable = table.querySelector<HTMLButtonElement>(
      '[data-slot="density"] [aria-label="Comfortable"]',
    )!;
    comfortable.click();
    await settle(fixture);
    expect(host.density()).toBe('comfortable');
    expect(table.getAttribute('data-density')).toBe('comfortable');
    expect(table.querySelector('[data-test="status"]')!.textContent).toBe('active·1·comfortable');
  });

  it('columnas fijas: la casilla, el expandir y la primera columna con su left', async () => {
    const { table } = await setup();
    const cells = table.querySelector('tbody tr')!.querySelectorAll<HTMLElement>('td');
    expect(cells[0].className).toContain('sticky');
    // Lógico (RTL): inset-inline-start y no left.
    const start = (el: HTMLElement) => el.style.getPropertyValue('inset-inline-start');
    expect(start(cells[1])).toBe('44px');
    expect(cells[0].className).toContain('start-0');
    expect(cells[0].className).not.toMatch(/(^| )left-0/);
    expect(cells[2].className).toContain('sticky');
    // Anchos fijos: sin ellos el navegador reparte el ancho y los left de las fijas no coinciden.
    expect(cells[0].className).toContain('min-w-11');
    expect(cells[0].className).toContain('max-w-11');
    expect(cells[2].style.minWidth).toBe('200px');
    expect(cells[2].style.maxWidth).toBe('200px');
    // jsdom simplifica el calc() de la casilla (44px) y el expandir (36px).
    expect(start(cells[2])).toMatch(/^calc\((44px \+ 36px|80px)\)$/);
    expect(cells[2].className).toContain('group-data-[scrolled]/data-table:shadow-');
    // RTL (G3.P): la sombra se invierte con una variable que vale -1 en RTL, no con un lado fijo.
    expect(cells[2].className).toContain('rtl:[--sticky-dir:-1]');
    expect(cells[2].className).toContain('calc(6px_*_var(--sticky-dir,1))');
    expect(cells[3].className).not.toContain('sticky');
    expect(cells[4].className).toContain('text-end');
    // La región de desplazamiento se alcanza con el teclado (Firefox y Safari) y tiene nombre.
    const scroll = table.querySelector('[data-slot="scroll"]')!;
    expect(scroll.getAttribute('tabindex')).toBe('0');
    expect(scroll.getAttribute('role')).toBe('region');
    expect(scroll.getAttribute('aria-label')).toBe('Clientes');
  });

  it('cargando: esqueleto con aria-busy y sin pie; vacío sin datos con la acción propia', async () => {
    const { table, host, fixture, live } = await setup();
    host.loading.set(true);
    await settle(fixture);
    expect(table.querySelector('table')!.getAttribute('aria-busy')).toBe('true');
    expect(table.querySelectorAll('[data-slot="skeleton"]').length).toBe(2);
    expect(table.querySelector('[data-slot="footer"]')).toBeNull();
    expect(live()).toBe('Loading…');
    host.loading.set(false);
    host.data.set([]);
    await settle(fixture);
    const empty = table.querySelector('[data-slot="empty"]')!;
    expect(empty.textContent).toContain('No data yet');
    expect(empty.querySelector('[data-test="empty-action"]')).not.toBeNull();
    expect(empty.querySelector('[data-slot="clear-all"]')).toBeNull();
  });

  it('modo servidor: con total, no procesa data y emite los cambios', async () => {
    const { host, names, table, fixture, type } = await setup();
    host.total.set(42);
    host.data.set([CLIENTS[3], CLIENTS[0], CLIENTS[4]]);
    await settle(fixture);
    expect(names()).toEqual(['Delta', 'Acme', 'Énfasis']);
    expect(table.querySelector('[data-slot="range"]')!.textContent).toBe('1–3 of 42');
    await type('zzz');
    expect(host.query()).toBe('zzz');
    expect(names()).toEqual(['Delta', 'Acme', 'Énfasis']);
  });

  it('modo servidor: si el total baja y la página queda fuera de rango, se ajusta (G3.P)', async () => {
    const { host, table, fixture } = await setup();
    const range = () => table.querySelector('[data-slot="range"]')!.textContent!;
    const bounds = () =>
      range()
        .match(/(\d+)–(\d+) of (\d+)/)!
        .slice(1)
        .map(Number);
    host.total.set(42);
    host.data.set([CLIENTS[0], CLIENTS[1]]);
    host.page.set(21);
    await settle(fixture);
    expect(range()).toBe('41–42 of 42');
    // Llega un total menor y, todavía, la página vieja sin filas.
    host.data.set([]);
    host.total.set(5);
    await settle(fixture);
    expect(host.page()).toBe(3);
    const [from, to, total] = bounds();
    expect(from).toBeLessThanOrEqual(to);
    expect(total).toBe(5);
  });

  it('desplazada en RTL (scrollLeft negativo) también marca data-scrolled (G3.P)', async () => {
    const { table, fixture } = await setup();
    const scroller = table.querySelector<HTMLElement>('[data-slot="scroll"]')!;
    Object.defineProperty(scroller, 'scrollLeft', { value: -24, configurable: true });
    scroller.dispatchEvent(new Event('scroll'));
    await settle(fixture);
    expect(table.hasAttribute('data-scrolled')).toBe(true);
    Object.defineProperty(scroller, 'scrollLeft', { value: 0, configurable: true });
    scroller.dispatchEvent(new Event('scroll'));
    await settle(fixture);
    expect(table.hasAttribute('data-scrolled')).toBe(false);
  });

  it('sin rowId y sin id en las filas: sin NG0955, cada fila se elige sola y avisa en desarrollo (G3.P)', async () => {
    const errors = vi.spyOn(console, 'error');
    const warns = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(NoIdHost);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const boxes = () => Array.from(el.querySelectorAll<HTMLElement>('tbody [role="checkbox"]'));
    expect(boxes()).toHaveLength(3);
    boxes()[1].click();
    await settle(fixture);
    expect(fixture.componentInstance.selection()).toHaveLength(1);
    expect(
      Array.from(el.querySelectorAll('tbody tr[data-selected]')).map((r) => r.textContent!.trim()),
    ).toEqual(['Beto']);
    // El aviso en modo desarrollo dice qué falta.
    expect(warns.mock.calls.flat().join(' ')).toMatch(/\[Mimi\] Data Table: .*rowId/);
    // Angular registra NG0955 (claves repetidas) con console.warn o console.error.
    const calls = [...errors.mock.calls, ...warns.mock.calls];
    expect(calls.filter((args) => args.map(String).join(' ').includes('NG0955'))).toEqual([]);
    errors.mockRestore();
    warns.mockRestore();
    fixture.nativeElement.remove();
  });

  it('el id del detalle sigue a la fila, no a su lugar en la página (G3.P)', async () => {
    const { table, host, fixture } = await setup();
    host.pageSize.set(5);
    await settle(fixture);
    const expand = () =>
      Array.from(table.querySelectorAll<HTMLButtonElement>('[data-slot="expand"]')).find((b) =>
        b.getAttribute('aria-label')!.includes('Acme'),
      )!;
    expand().click();
    await settle(fixture);
    const before = expand().getAttribute('aria-controls')!;
    expect(document.getElementById(before)!.textContent).toContain('Detalle Acme');
    // Ordenar de la Z a la A mueve la fila: su id no cambia.
    host.sort.set({ column: 'name', direction: 'desc' });
    await settle(fixture);
    const after = expand().getAttribute('aria-controls')!;
    expect(after).toBe(before);
    expect(document.getElementById(after)!.textContent).toContain('Detalle Acme');
    // Y es válido como id (sin espacios) y distinto al de otra fila.
    expect(after).not.toMatch(/\s/);
    host.expanded.set([1, 2]);
    await settle(fixture);
    const ids = Array.from(table.querySelectorAll<HTMLElement>('[data-slot="detail"] [id]')).map(
      (d) => d.id,
    );
    expect(new Set(ids).size).toBe(2);
  });

  it('sin barra, sin casillas ni columnas extra; class del usuario con cn() y tokens', async () => {
    const { root, table, host, fixture } = await setup();
    const plain = root.querySelector('[data-test="plain"]')!;
    expect(plain.querySelector('[data-slot="toolbar"]')).toBeNull();
    expect(plain.querySelectorAll('th').length).toBe(1);
    expect(plain.querySelector('[role="checkbox"]')).toBeNull();
    expect(table.className).toContain('rounded-[var(--mimi-radius-card)]');
    expect(table.querySelector('[data-slot="toolbar"]')!.className).toContain(
      'min-h-[var(--mimi-table-toolbar-height,56px)]',
    );
    expect(table.querySelector('th')!.className).toContain(
      'bg-[color:var(--mimi-table-head-bg,var(--mimi-muted))]',
    );
    host.extra.set('rounded-none shadow-none');
    await settle(fixture);
    expect(table.className).toContain('rounded-none');
    expect(table.className).not.toContain('rounded-[var(--mimi-radius-card)]');
  });

  it('textos en español', async () => {
    TestBed.configureTestingModule({
      providers: [provideMimiDataTableText(MIMI_DATA_TABLE_TEXT_ES)],
    });
    const { table } = await setup();
    expect(table.querySelector('[data-slot="search"]')!.getAttribute('placeholder')).toBe(
      'Buscar…',
    );
    expect(table.querySelector('[role="checkbox"]')!.getAttribute('aria-label')).toBe(
      'Seleccionar todas las filas de la página',
    );
    expect(table.querySelector('[data-slot="range"]')!.textContent).toBe('1–2 de 5');
  });

  it('regresión NG0103: las plantillas propias no repiten la detección de cambios', async () => {
    const errors = vi.spyOn(console, 'error');
    const { table, host, fixture } = await setup();
    table.querySelector<HTMLButtonElement>('[data-slot="expand"]')!.click();
    host.density.set('comfortable');
    host.selection.set([1]);
    await settle(fixture);
    host.extra.set('max-w-4xl');
    await settle(fixture);
    // Angular lo registra como console.error('ERROR', error): se miran todos los argumentos.
    const ng0103 = errors.mock.calls.filter((args) =>
      args.map(String).join(' ').includes('NG0103'),
    );
    expect(ng0103).toEqual([]);
    errors.mockRestore();
  });
});
