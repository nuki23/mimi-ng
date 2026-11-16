import { CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { MimiSortableMove } from '@/components/ui/sortable-list';
import { KANBAN_01_COLUMNS, Kanban01, type Kanban01Card, type Kanban01Column } from './kanban-01';

@Component({
  imports: [Kanban01],
  template: `<mimi-kanban-01
    class="bg-muted"
    [(columns)]="board"
    [loading]="loading()"
    (moved)="moves.push($event)"
    (reordered)="reorders.push($event)"
    (addCard)="adds.push($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly board = signal<Kanban01Column[]>(KANBAN_01_COLUMNS);
  readonly loading = signal(false);
  readonly moves: MimiSortableMove<Kanban01Card>[] = [];
  readonly reorders: { column: string; from: number; to: number }[] = [];
  readonly adds: string[] = [];
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

const press = (target: Element, key: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

/** kanban-01 (R.22). */
describe('Kanban01', { timeout: 20_000 }, () => {
  afterEach(() => document.body.replaceChildren());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const column = (id: string) => el.querySelector<HTMLElement>(`[data-column="${id}"]`)!;
    const handles = (id: string) => [
      ...column(id).querySelectorAll<HTMLButtonElement>('[data-slot="handle"]'),
    ];
    const ids = (id: string) =>
      fixture.componentInstance
        .board()
        .find((c) => c.id === id)!
        .cards.map((c) => c.id);
    const key = async (target: Element, k: string) => {
      press(target, k);
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, el, column, handles, ids, key };
  }

  it('tres columnas con título, contador y nombre; tarjetas con etiqueta y responsable; un solo h1', async () => {
    const { el, column } = await setup();
    expect(el.querySelectorAll('h1').length).toBe(1);
    // El título con el número de tarjetas para los lectores (el contador visible es aria-hidden).
    // Con `aria-label` en el h2 (un span sr-only absoluto metía un espacio: «To do , 3 cards»).
    const headings = [...el.querySelectorAll('[data-slot="column"] h2')];
    expect(headings.map((h) => h.getAttribute('aria-label'))).toEqual([
      'To do, 3 cards',
      'In progress, 1 of 3 cards',
      'Done, 1 card',
    ]);
    expect(headings.map((h) => h.textContent!.trim())).toEqual(['To do', 'In progress', 'Done']);
    expect(column('doing').querySelector('[mimiBadge]')!.textContent!.trim()).toBe('1 / 3');
    // La lista se llama como la columna: es el nombre que se anuncia al pasar una tarjeta.
    expect(column('todo').querySelector('ul')!.getAttribute('aria-label')).toBe('To do');
    expect(column('doing').querySelector('ul')!.getAttribute('aria-label')).toBe('In progress');
    const first = column('todo').querySelector('li[data-index="0"]')!;
    expect(first.textContent).toContain('Audit color contrast');
    expect(first.textContent).toContain('Design');
    expect(first.querySelector('mimi-avatar-fallback')!.getAttribute('aria-label')).toBe(
      'Ana Torres',
    );
    // El tablero se desplaza en móvil y está posicionado: los textos sr-only (absolutos) de dentro
    // no se escapan y no desbordan la página (visto en Chrome a 360 px: 690 px de ancho).
    expect(el.querySelector('[data-slot="board"]')!.classList).toContain('relative');
    // La clase del usuario se mezcla con cn().
    expect(el.querySelector('mimi-kanban-01')!.className).toContain('bg-muted');
  });

  it('tiene el contenedor de los Blocks de página: margen lateral y ancho máximo (16/11/2026)', async () => {
    const { el } = await setup();
    const block = el.querySelector('mimi-kanban-01')!.classList;
    // El de table-01 (px-4 / md:px-8, pt-5 / md:pt-7) con el ancho del contenido de pricing-01.
    for (const c of ['mx-auto', 'max-w-[1080px]', 'px-4', 'md:px-8', 'pt-5', 'md:pt-7', 'pb-8']) {
      expect(block, c).toContain(c);
    }
  });

  it('mover una tarjeta con el teclado (→) cambia [(columns)] y emite moved con los id de las columnas', async () => {
    const { host, handles, ids, key } = await setup();
    await key(handles('todo')[0], 'Enter');
    await key(handles('todo')[0], 'ArrowRight');
    await key(handles('doing')[0], 'Enter');
    expect(ids('todo')).toEqual([2, 3]);
    expect(ids('doing')).toEqual([1, 4]);
    expect(host.moves).toEqual([
      {
        item: KANBAN_01_COLUMNS[0].cards[0],
        from: { list: 'todo', index: 0 },
        to: { list: 'doing', index: 0 },
      },
    ]);
  });

  it('con el puntero o el dedo (soltado del cdk) también; y reordenar dentro de una columna emite reordered', async () => {
    const { fixture, host, ids } = await setup();
    const list = (id: string) =>
      fixture.debugElement.query(By.css(`[data-column="${id}"] ul`)).injector.get(CdkDropList);
    list('done').dropped.emit({
      previousIndex: 1,
      currentIndex: 1,
      previousContainer: list('todo'),
      container: list('done'),
    } as never);
    await settle(fixture);
    expect(ids('todo')).toEqual([1, 3]);
    expect(ids('done')).toEqual([5, 2]);
    expect(host.moves.at(-1)!.to).toEqual({ list: 'done', index: 1 });
    list('todo').dropped.emit({ previousIndex: 0, currentIndex: 1 } as never);
    await settle(fixture);
    expect(ids('todo')).toEqual([3, 1]);
    expect(host.reorders).toEqual([
      { column: 'todo', card: KANBAN_01_COLUMNS[0].cards[0], from: 0, to: 1 },
    ]);
  });

  it('«In progress» con su tope lleno no acepta otra tarjeta', async () => {
    const { host, fixture, handles, ids, key } = await setup();
    host.board.update((cols) =>
      cols.map((c) =>
        c.id === 'doing'
          ? { ...c, cards: [...c.cards, { id: 8, title: 'A' }, { id: 9, title: 'B' }] }
          : c,
      ),
    );
    await settle(fixture);
    await key(handles('todo')[0], 'Enter');
    await key(handles('todo')[0], 'ArrowRight');
    expect(ids('doing')).toEqual([4, 8, 9]);
    expect(ids('todo')).toEqual([1, 2, 3]);
    await key(handles('todo')[0], 'Escape');
  });

  it('«Add card» emite el id de su columna', async () => {
    const { host, column } = await setup();
    const add = [...column('done').querySelectorAll('button')].find((b) =>
      b.textContent!.includes('Add card'),
    )!;
    add.click();
    expect(host.adds).toEqual(['done']);
    expect(add.getAttribute('aria-describedby')).toBe('kanban-done');
  });

  it('cargando: inerte y con aria-busy (R.11)', async () => {
    const { host, fixture, el } = await setup();
    host.loading.set(true);
    await settle(fixture);
    const block = el.querySelector('mimi-kanban-01')!;
    expect(block.hasAttribute('inert')).toBe(true);
    expect(block.getAttribute('aria-busy')).toBe('true');
  });
});
