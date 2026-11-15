import { signal } from '@angular/core';
import { mimiCompareValues, mimiFilterSortRows, mimiNextSort, mimiTableState } from './table-state';

interface Client {
  id: number;
  company: string;
  status: 'Activo' | 'Moroso';
  amount: number;
}

const CLIENTS: Client[] = [
  { id: 1, company: 'Ñandú', status: 'Activo', amount: 300 },
  { id: 2, company: 'acme', status: 'Moroso', amount: 50 },
  { id: 3, company: 'Bravo', status: 'Activo', amount: 1200 },
  { id: 4, company: 'Árbol', status: 'Moroso', amount: 9 },
  { id: 5, company: 'Cobre', status: 'Activo', amount: 75 },
];

describe('mimiTableState (R.20, PD-2 opción C)', () => {
  it('sin opciones: todas las filas, una página, con los mismos objetos', () => {
    const table = mimiTableState(CLIENTS);
    expect(table.rows().map((r) => r.data)).toEqual(CLIENTS);
    expect(table.rows()[0].data).toBe(CLIENTS[0]);
    expect(table.count()).toBe(5);
    expect(table.pageCount()).toBe(1);
  });

  it('busca sin tildes ni mayúsculas en las columnas y vuelve a la página 1', () => {
    const table = mimiTableState(CLIENTS, { columns: ['company'], pageSize: 2 });
    table.page.set(2);
    table.search('ARBOL');
    expect(table.page()).toBe(1);
    expect(table.rows().map((r) => r.id)).toEqual([4]);
    expect(table.narrowed()).toBe(true);
    table.clear();
    expect(table.narrowed()).toBe(false);
    expect(table.count()).toBe(5);
  });

  it('filtra por los valores elegidos de una columna', () => {
    const table = mimiTableState(CLIENTS, { columns: ['company', 'status'] });
    table.toggleFilter('status', 'Moroso');
    expect(table.rows().map((r) => r.id)).toEqual([2, 4]);
    table.toggleFilter('status', 'Moroso');
    expect(table.count()).toBe(5);
  });

  it('ordena con el encabezado: ascendente, descendente y sin orden; texto y números', () => {
    const table = mimiTableState(CLIENTS, { columns: ['company', 'amount'] });
    const company = table.sort('company');
    expect(table.sort('company')).toBe(company);
    company.toggle();
    expect(company.direction()).toBe('asc');
    expect(table.rows().map((r) => r.data.company)).toEqual([
      'acme',
      'Árbol',
      'Bravo',
      'Cobre',
      'Ñandú',
    ]);
    company.toggle();
    expect(company.direction()).toBe('desc');
    company.toggle();
    expect(company.direction()).toBeNull();
    table.sort('amount').toggle();
    expect(table.rows().map((r) => r.data.amount)).toEqual([9, 50, 75, 300, 1200]);
    expect(company.direction()).toBeNull();
  });

  it('una comparación propia por columna', () => {
    const table = mimiTableState(CLIENTS, {
      columns: {
        status: {
          compare: (a, b) => (a.status === 'Moroso' ? -1 : 0) - (b.status === 'Moroso' ? -1 : 0),
        },
      },
    });
    table.sort('status').toggle();
    expect(
      table
        .rows()
        .slice(0, 2)
        .map((r) => r.data.status),
    ).toEqual(['Moroso', 'Moroso']);
  });

  it('pagina y nunca pasa de la última página (currentPage)', () => {
    const table = mimiTableState(CLIENTS, { pageSize: 2 });
    expect(table.pageCount()).toBe(3);
    table.page.set(3);
    expect(table.rows().map((r) => r.id)).toEqual([5]);
    expect(table.rows()[0].index).toBe(4);
    table.page.set(9);
    expect(table.currentPage()).toBe(3);
    table.pageSize.set(10);
    expect(table.currentPage()).toBe(1);
  });

  it('expandir con row.toggle(); en single se cierran las demás', () => {
    const multiple = mimiTableState(CLIENTS);
    const [a, b] = multiple.rows();
    a.toggle();
    b.toggle();
    expect(multiple.expanded()).toEqual([1, 2]);
    expect(a.expanded()).toBe(true);
    a.toggle();
    expect(a.expanded()).toBe(false);
    b.toggle(true);
    expect(multiple.expanded()).toEqual([2]);

    const single = mimiTableState(CLIENTS, { expandMode: 'single' });
    const [x, y] = single.rows();
    x.toggle();
    y.toggle();
    expect(single.expanded()).toEqual([2]);
    expect(x.expanded()).toBe(false);
  });

  it('selección por fila y por página (todas, algunas, ninguna)', () => {
    const table = mimiTableState(CLIENTS, { pageSize: 2 });
    expect(table.pageSelection()).toBe('none');
    table.rows()[0].toggleSelected();
    expect(table.pageSelection()).toBe('some');
    table.togglePage(true);
    expect(table.pageSelection()).toBe('all');
    expect(table.selection()).toEqual([1, 2]);
    table.page.set(2);
    expect(table.pageSelection()).toBe('none');
    table.togglePage(true);
    table.page.set(1);
    table.togglePage(false);
    expect(table.selection()).toEqual([3, 4]);
  });

  it('sigue a una señal de datos y conserva el estado por id', () => {
    const data = signal<Client[]>(CLIENTS.slice(0, 2));
    const table = mimiTableState(data);
    table.rows()[1].toggle();
    data.set([...CLIENTS]);
    expect(table.count()).toBe(5);
    expect(table.rows()[1].expanded()).toBe(true);
  });

  it('rowId propio; modo servidor con total (no busca ni pagina)', () => {
    const total = signal<number | null>(120);
    const table = mimiTableState(CLIENTS, {
      rowId: (c) => c.company,
      columns: ['company'],
      pageSize: 2,
      total,
    });
    table.search('zzz');
    expect(table.rows().length).toBe(5);
    expect(table.rows()[0].id).toBe('Ñandú');
    expect(table.count()).toBe(120);
    expect(table.pageCount()).toBe(60);
    expect(table.query()).toBe('zzz');
  });

  it('funciones compartidas con la Data Table', () => {
    expect(mimiCompareValues('', 'a')).toBe(1);
    expect(mimiCompareValues(2, 10)).toBeLessThan(0);
    expect(mimiCompareValues('item 2', 'item 10')).toBeLessThan(0);
    expect(mimiNextSort(null, 'a')).toEqual({ column: 'a', direction: 'asc' });
    expect(mimiNextSort({ column: 'a', direction: 'asc' }, 'a')).toEqual({
      column: 'a',
      direction: 'desc',
    });
    expect(mimiNextSort({ column: 'a', direction: 'desc' }, 'a')).toBeNull();
    expect(mimiNextSort({ column: 'a', direction: 'desc' }, 'b')).toEqual({
      column: 'b',
      direction: 'asc',
    });
    const rows = mimiFilterSortRows(
      CLIENTS,
      [{ id: 'company', searchable: false }, { id: 'status' }],
      'activo',
      {},
      null,
    );
    expect(rows.map((r) => r.id)).toEqual([1, 3, 5]);
  });
});
