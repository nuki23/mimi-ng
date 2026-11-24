import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiTableImports } from './table';
import { type MimiTableMobile, provideMimiTable } from './table-config';

/**
 * Table en el teléfono (tanda 1 de la 0.9.0, punto 6): `mobile="scroll"` por defecto (scroll
 * lateral con la primera columna fija) y `mobile="stack"` (cada fila, una tarjeta con «etiqueta:
 * valor»). Los estilos son `max-sm:` (CSS); aquí se prueban las clases, los roles y las etiquetas.
 * La maquetación real, en Playwright (`apps/docs/e2e/mobile-tables.spec.ts`).
 */
@Component({
  imports: [MimiTableImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table mimiTable [mobile]="mobile()">
      <thead mimiThead>
        <tr>
          <th mimiTh>Cliente</th>
          <th mimiTh>Estado</th>
          <th mimiTh><span class="sr-only">Acciones</span></th>
        </tr>
      </thead>
      <tbody mimiTbody>
        @for (row of rows(); track row) {
          <tr mimiTr>
            <td mimiTd>{{ row }}</td>
            <td mimiTd label="Situación">Activo</td>
            <td mimiTd><button type="button">Editar</button></td>
          </tr>
        }
        <tr mimiTr>
          <td mimiTd colspan="3">Detalle</td>
        </tr>
      </tbody>
    </table>
  `,
})
class Host {
  readonly mobile = signal<MimiTableMobile | undefined>(undefined);
  readonly rows = signal(['Ana', 'Bruno']);
}

async function setup(providers: unknown[] = []) {
  TestBed.configureTestingModule({ providers: providers as never[] });
  const fixture = TestBed.createComponent(Host);
  document.body.appendChild(fixture.nativeElement);
  await fixture.whenStable();
  const el = fixture.nativeElement as HTMLElement;
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  };
  await settle();
  return { fixture, el, settle, table: el.querySelector('table')! };
}

describe('Table en el teléfono (mobile)', () => {
  afterEach(() => document.body.replaceChildren());

  it('por defecto, scroll: la primera columna fija y sin roles extra', async () => {
    const { table } = await setup();
    expect(table.dataset['mobile']).toBe('scroll');
    expect(table.hasAttribute('role')).toBe(false);
    const first = table.querySelector('td')!;
    expect(first.className).toContain('max-sm:first:sticky');
    expect(first.className).toContain('max-sm:whitespace-nowrap');
  });

  it('stack: tarjetas, encabezados ocultos a la vista y roles de tabla explícitos', async () => {
    const { fixture, table, settle } = await setup();
    fixture.componentInstance.mobile.set('stack');
    await settle();
    expect(table.dataset['mobile']).toBe('stack');
    expect(table.getAttribute('role')).toBe('table');
    expect(table.querySelector('thead')!.getAttribute('role')).toBe('rowgroup');
    expect(table.querySelector('thead')!.className).toContain('max-sm:sr-only');
    expect(table.querySelector('tbody')!.getAttribute('role')).toBe('rowgroup');
    expect(table.querySelector('tr')!.getAttribute('role')).toBe('row');
    expect(table.querySelector('th')!.getAttribute('role')).toBe('columnheader');
    const cell = table.querySelector('tbody td')!;
    expect(cell.getAttribute('role')).toBe('cell');
    expect(cell.className).toContain('max-sm:flex');
    expect(table.querySelector('tbody tr')!.className).toContain('max-sm:rounded-card');
  });

  it('stack: cada celda lleva la etiqueta de su columna (data-label), también las filas nuevas', async () => {
    const { fixture, table, settle } = await setup();
    fixture.componentInstance.mobile.set('stack');
    await settle();
    const cells = () => [...table.querySelectorAll('tbody tr')].map((tr) => [...tr.children]);
    const [ana] = cells();
    expect(ana[0].getAttribute('data-label')).toBe('Cliente');
    // La etiqueta propia (`label`) gana a la del encabezado.
    expect(ana[1].getAttribute('data-label')).toBe('Situación');
    expect(ana[2].getAttribute('data-label')).toBe('Acciones');
    // Una celda que ocupa varias columnas no lleva etiqueta.
    expect(cells().at(-1)![0].hasAttribute('data-label')).toBe(false);
    fixture.componentInstance.rows.set(['Ana', 'Bruno', 'Carla']);
    await settle();
    expect(cells()[2][0].getAttribute('data-label')).toBe('Cliente');
  });

  it('provideMimiTable cambia el modo por defecto; la entrada gana', async () => {
    const { fixture, table, settle } = await setup([provideMimiTable({ table: 'stack' })]);
    expect(table.dataset['mobile']).toBe('stack');
    fixture.componentInstance.mobile.set('scroll');
    await settle();
    expect(table.dataset['mobile']).toBe('scroll');
  });
});
