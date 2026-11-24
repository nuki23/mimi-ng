import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type MimiTableMobile, provideMimiTable } from '@/components/ui/table';
import { MimiDataTableImports, type MimiTableColumn, type MimiTableSort } from './data-table';
import { MIMI_DATA_TABLE_TEXT_ES, provideMimiDataTableText } from './data-table-texts';

/**
 * Data Table en el teléfono (tanda 1 de la 0.9.0, punto 6): por debajo de 640 px, `stack` por
 * defecto (cada fila, una tarjeta con «etiqueta: valor», selección y acciones dentro), la
 * búsqueda, los filtros y el orden en una hoja, y la paginación compacta. `scroll`: la tabla con
 * scroll lateral y la primera columna fija. El teléfono se simula con `matchMedia`.
 */
interface Client {
  id: number;
  name: string;
  status: 'active' | 'trial';
}

const DATA: Client[] = [
  { id: 1, name: 'Acme', status: 'active' },
  { id: 2, name: 'Bogotá Labs', status: 'trial' },
  { id: 3, name: 'Cóndor', status: 'active' },
];

const COLUMNS: MimiTableColumn<Client>[] = [
  { id: 'name', header: 'Cliente', sortable: true },
  {
    id: 'status',
    header: 'Estado',
    filterOptions: [
      { label: 'Activo', value: 'active' },
      { label: 'Prueba', value: 'trial' },
    ],
  },
];

@Component({
  imports: [MimiDataTableImports],
  template: `
    <mimi-data-table
      aria-label="Clientes"
      selectable
      [mobile]="mobile()"
      [data]="data"
      [columns]="columns"
      [pageSizeOptions]="[2, 5]"
      [(selection)]="selection"
      [(sort)]="sort"
      [(query)]="query"
      [pageSize]="2"
    >
      <ng-template mimiTableActions let-row>
        <button type="button" data-test="action">Editar {{ row.name }}</button>
      </ng-template>
    </mimi-data-table>
  `,
})
class Host {
  readonly mobile = signal<MimiTableMobile | undefined>(undefined);
  readonly data = DATA;
  readonly columns = COLUMNS;
  readonly selection = signal<unknown[]>([]);
  readonly sort = signal<MimiTableSort | null>(null);
  readonly query = signal('');
}

function fakeMedia(phone: boolean) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: phone && query.includes('max-width'),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
  return () => (window.matchMedia = original);
}

async function setup(phone: boolean, providers: unknown[] = []) {
  const restore = fakeMedia(phone);
  TestBed.configureTestingModule({
    providers: [provideMimiDataTableText(MIMI_DATA_TABLE_TEXT_ES), ...(providers as never[])],
  });
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  const settle = async () => {
    for (let i = 0; i < 3; i++) {
      await fixture.whenStable();
      await new Promise((r) => setTimeout(r));
    }
  };
  await settle();
  const el = fixture.nativeElement as HTMLElement;
  return {
    fixture,
    el,
    settle,
    restore,
    host: () => el.querySelector<HTMLElement>('mimi-data-table')!,
    table: () => el.querySelector('table')!,
  };
}

describe('Data Table en el teléfono (mobile)', () => {
  let restore: () => void = () => undefined;
  afterEach(() => {
    restore();
    document.body.replaceChildren();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => c.replaceChildren());
  });

  it('en escritorio, nada cambia: sin data-mobile, sin la hoja de búsqueda', async () => {
    const t = await setup(false);
    restore = t.restore;
    expect(t.host().hasAttribute('data-mobile')).toBe(false);
    expect(t.el.querySelector('[data-slot="refine"]')).toBeNull();
    expect(t.el.querySelector('[data-slot="search"]')).not.toBeNull();
  });

  it('stack: tarjetas con «etiqueta: valor», tabla para el lector y selección y acciones dentro', async () => {
    const t = await setup(true);
    restore = t.restore;
    expect(t.host().dataset['mobile']).toBe('stack');
    const table = t.table();
    expect(table.getAttribute('role')).toBe('table');
    expect(table.querySelector('thead')!.className).toContain('max-sm:sr-only');
    // En el encabezado oculto no queda nada que se pueda enfocar.
    expect(table.querySelector('thead button, thead input, thead [role="checkbox"]')).toBeNull();
    const row = table.querySelector('tbody tr')!;
    expect(row.getAttribute('role')).toBe('row');
    expect(row.className).toContain('max-sm:rounded-card');
    const labels = [...row.querySelectorAll('td')].map((td) => td.getAttribute('data-label'));
    expect(labels).toEqual([null, 'Cliente', 'Estado', null]);
    expect(row.querySelector('[role="checkbox"]')).not.toBeNull();
    expect(row.querySelector('[data-test="action"]')).not.toBeNull();
    // «Seleccionar todo» pasa a la barra.
    const all = t.el.querySelector('[data-slot="select-all"] [role="checkbox"]')!;
    expect(all.getAttribute('aria-label')).toBe('Seleccionar todas las filas de la página');
  });

  it('la búsqueda, los filtros y el orden van en una hoja; la paginación, compacta', async () => {
    const t = await setup(true);
    restore = t.restore;
    expect(t.el.querySelector('[data-slot="search"]')).toBeNull();
    const refine = t.el.querySelector<HTMLButtonElement>('[data-slot="refine"]')!;
    expect(refine.textContent).toContain('Buscar y filtrar');
    // Paginación sin «filas por página».
    expect(
      t.el.querySelector(
        '[data-slot="footer"] select, [data-slot="footer"] [data-slot="page-size"]',
      ),
    ).toBeNull();
    refine.click();
    await t.settle();
    const sheet = document.querySelector<HTMLElement>('mimi-sheet-frame')!;
    expect(sheet).not.toBeNull();
    const search = sheet.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.value = 'Acme';
    search.dispatchEvent(new Event('input'));
    await t.settle();
    expect(t.fixture.componentInstance.query()).toBe('Acme');
    const sortButton = sheet.querySelector<HTMLButtonElement>('[data-slot="sort-option"]')!;
    expect(sortButton.textContent).toContain('Cliente');
    sortButton.click();
    await t.settle();
    expect(t.fixture.componentInstance.sort()).toEqual({ column: 'name', direction: 'asc' });
    expect(sortButton.getAttribute('aria-pressed')).toBe('true');
    const filter = sheet.querySelector('fieldset[data-slot="filter-group"]')!;
    expect(filter.querySelector('legend')!.textContent).toContain('Estado');
    expect(filter.querySelectorAll('[role="checkbox"]').length).toBe(2);
  });

  it('scroll: la tabla de siempre, con la primera columna de datos fija', async () => {
    const t = await setup(true, [provideMimiTable({ dataTable: 'scroll' })]);
    restore = t.restore;
    expect(t.host().dataset['mobile']).toBe('scroll');
    const table = t.table();
    expect(table.hasAttribute('role')).toBe(false);
    const first = table.querySelectorAll('tbody tr')[0].querySelectorAll('td')[1];
    expect(first.className).toContain('sticky');
    // La búsqueda va en la hoja también aquí (es el teléfono).
    expect(t.el.querySelector('[data-slot="refine"]')).not.toBeNull();
  });

  it('la entrada mobile gana a provideMimiTable', async () => {
    const t = await setup(true, [provideMimiTable({ dataTable: 'scroll' })]);
    restore = t.restore;
    t.fixture.componentInstance.mobile.set('stack');
    await t.settle();
    expect(t.host().dataset['mobile']).toBe('stack');
  });
});
