import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MIMI_TABLE_CELL, MIMI_TABLE_HEAD, MimiTableImports } from './table';
import { mimiTableState } from './table-state';

interface Row {
  id: number;
  name: string;
  late: boolean;
}

@Component({
  imports: [MimiTableImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table mimiTable [size]="size()" [class]="extra()">
      <caption mimiCaption>
        Clientes
      </caption>
      <thead mimiThead>
        <tr>
          <th mimiTh [sort]="table.sort('name')">Nombre</th>
          <th mimiTh>Estado</th>
          <th mimiTh align="end">Detalle</th>
        </tr>
      </thead>
      <tbody mimiTbody>
        @for (row of table.rows(); track row.id) {
          <tr mimiTr [selected]="row.selected()" [attr.data-row]="row.id">
            <td mimiTd>{{ row.data.name }}</td>
            <td mimiTd>
              @if (row.data.late) {
                Moroso
              } @else {
                Activo
              }
            </td>
            <td mimiTd align="end">
              <button type="button" mimiRowToggle [row]="row" [controls]="'d-' + row.id">
                Ver
              </button>
            </td>
          </tr>
          @if (row.expanded()) {
            <tr mimiTr data-detail>
              <td mimiTd colspan="3" [id]="'d-' + row.id">Detalle de {{ row.data.name }}</td>
            </tr>
          }
        }
        <tr mimiTr data-total>
          <th mimiTh scope="row">Total</th>
          <td mimiTd colspan="2">{{ table.count() }}</td>
        </tr>
      </tbody>
    </table>
  `,
})
class Host {
  readonly size = signal<'sm' | 'md' | 'lg' | undefined>(undefined);
  readonly extra = signal('');
  readonly data = signal<Row[]>([
    { id: 1, name: 'Cobre', late: false },
    { id: 2, name: 'Acme', late: true },
  ]);
  readonly table = mimiTableState(this.data, { columns: ['name'] });
}

describe('Table (R.20): directivas de estilo sobre la tabla nativa', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const q = <E extends Element = HTMLElement>(s: string) => root.querySelector<E>(s)!;
    const all = (s: string) => [...root.querySelectorAll<HTMLElement>(s)];
    const update = async (fn: () => void) => {
      fn();
      await fixture.whenStable();
    };
    return { host: fixture.componentInstance, q, all, update, fixture };
  }

  it('es la tabla nativa con el aspecto de Mimi: celdas, encabezados, caption y class', async () => {
    const { host, q, all, update } = await setup();
    const table = q('table');
    expect(table.classList).toContain('border-separate');
    for (const th of all('thead th')) expect(th.getAttribute('scope')).toBe('col');
    for (const th of all('thead th').slice(0, 2)) {
      for (const cls of MIMI_TABLE_HEAD.split(' ')) expect(th.classList).toContain(cls);
    }
    for (const cls of MIMI_TABLE_CELL.split(' ')) expect(q('tbody td').classList).toContain(cls);
    expect(q('caption').textContent!.trim()).toBe('Clientes');
    expect(all('thead th')[2].classList).toContain('text-end');
    await update(() => host.extra.set('text-base'));
    expect(table.classList).toContain('text-base');
    expect(table.classList).not.toContain('text-[length:var(--mimi-table-font-size,13px)]');
  });

  it('@for y @if libres, y filas de otro tipo (la de totales, con th scope="row")', async () => {
    const { all, q } = await setup();
    expect(all('tr[data-row]').length).toBe(2);
    expect(all('tr[data-row] td')[1].textContent!.trim()).toBe('Activo');
    expect(all('tr[data-row] td')[4].textContent!.trim()).toBe('Moroso');
    expect(q('tr[data-total] th').getAttribute('scope')).toBe('row');
    expect(q('tr[data-total] td').textContent!.trim()).toBe('2');
  });

  it('size: data-size en la tabla (la escala da el alto de fila y de cabecera)', async () => {
    const { host, q, update } = await setup();
    expect(q('table').hasAttribute('data-size')).toBe(false);
    await update(() => host.size.set('lg'));
    expect(q('table').dataset['size']).toBe('lg');
  });

  it('el encabezado que ordena: un botón con aria-sort que cambia', async () => {
    const { q, all, update, host } = await setup();
    const th = all('thead th')[0];
    // APG: aria-sort solo en la columna ordenada (revisión de accesibilidad, tanda 2).
    expect(th.hasAttribute('aria-sort')).toBe(false);
    expect(all('thead th')[1].hasAttribute('aria-sort')).toBe(false);
    // El ícono de «se puede ordenar», sin opacidad (3:1, WCAG 1.4.11).
    expect(th.querySelector('svg')!.getAttribute('class')).not.toContain('opacity');
    const button = th.querySelector<HTMLButtonElement>('button[data-slot="sort"]')!;
    expect(button.getAttribute('type')).toBe('button');
    expect(button.textContent!.trim()).toBe('Nombre');
    expect(all('thead th')[1].querySelector('button')).toBeNull();
    await update(() => button.click());
    expect(th.getAttribute('aria-sort')).toBe('ascending');
    expect(th.hasAttribute('data-sorted')).toBe(true);
    expect(all('tr[data-row] td:first-child').map((td) => td.textContent!.trim())).toEqual([
      'Acme',
      'Cobre',
    ]);
    await update(() => button.click());
    expect(th.getAttribute('aria-sort')).toBe('descending');
    await update(() => host.table.sorting.set(null));
    expect(th.hasAttribute('aria-sort')).toBe(false);
    expect(q('thead th svg').getAttribute('aria-hidden')).toBe('true');
  });

  it('mimiRowToggle abre la fila: aria-expanded y aria-controls al detalle', async () => {
    const { q, update } = await setup();
    const toggle = q<HTMLButtonElement>('tr[data-row="1"] [mimiRowToggle]');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.hasAttribute('aria-controls')).toBe(false);
    await update(() => toggle.click());
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(toggle.getAttribute('aria-controls')).toBe('d-1');
    expect(q('#d-1').textContent!.trim()).toBe('Detalle de Cobre');
    await update(() => toggle.click());
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('una fila elegida lleva data-selected', async () => {
    const { host, q, update } = await setup();
    await update(() => host.table.rows()[0].toggleSelected());
    expect(q('tr[data-row="1"]').hasAttribute('data-selected')).toBe(true);
    expect(q('tr[data-row="2"]').hasAttribute('data-selected')).toBe(false);
  });
});
