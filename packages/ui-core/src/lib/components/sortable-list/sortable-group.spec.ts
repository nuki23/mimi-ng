import { CdkDropList } from '@angular/cdk/drag-drop';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import type { MimiSortableMove } from './sortable-group';
import { MimiSortableListImports, type MimiSortableReorder } from './sortable-list';

interface Card {
  id: string;
  title: string;
}

const make = (ids: string) => ids.split('').map((id) => ({ id, title: `T${id}` }));

@Component({
  imports: [MimiSortableListImports],
  template: `
    <div [attr.dir]="dir()">
      <mimi-sortable-group data-test="group" (moved)="groupMoves.push($event)">
        <mimi-sortable-list
          data-test="todo"
          listId="todo"
          aria-label="Pendiente"
          [(items)]="todo"
          [itemLabel]="title"
          [trackBy]="byId"
          (reordered)="reorders.push($event)"
        />
        <mimi-sortable-list
          data-test="doing"
          listId="doing"
          aria-label="En curso"
          [(items)]="doing"
          [itemLabel]="title"
          [trackBy]="byId"
          [accepts]="limit"
          (moved)="listMoves.push($event)"
        />
        <mimi-sortable-list
          data-test="done"
          listId="done"
          aria-label="Completado"
          [(items)]="done"
          [itemLabel]="title"
          [trackBy]="byId"
        />
      </mimi-sortable-group>
    </div>
  `,
})
class Host {
  readonly dir = signal<'ltr' | 'rtl'>('ltr');
  readonly todo = signal<Card[]>(make('abc'));
  readonly doing = signal<Card[]>(make('d'));
  readonly done = signal<Card[]>([]);
  readonly max = signal(3);
  readonly groupMoves: MimiSortableMove<unknown>[] = [];
  readonly listMoves: MimiSortableMove<Card>[] = [];
  readonly reorders: MimiSortableReorder<Card>[] = [];
  readonly title = (card: Card) => card.title;
  readonly byId = (card: Card) => card.id;
  /** «No más de max en curso». */
  readonly limit = () => this.doing().length < this.max();
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

const press = (target: Element, key: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

describe('Sortable List: listas conectadas (R.21)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const list = (name: string) => el.querySelector<HTMLElement>(`[data-test="${name}"]`)!;
    const handles = (name: string) => [
      ...list(name).querySelectorAll<HTMLButtonElement>('[data-slot="handle"]'),
    ];
    const ids = () => ({
      todo: fixture.componentInstance
        .todo()
        .map((c) => c.id)
        .join(''),
      doing: fixture.componentInstance
        .doing()
        .map((c) => c.id)
        .join(''),
      done: fixture.componentInstance
        .done()
        .map((c) => c.id)
        .join(''),
    });
    const status = (name: string) =>
      list(name).querySelector('[role="status"]')!.textContent!.trim();
    const key = async (target: Element, k: string) => {
      press(target, k);
      await settle(fixture);
    };
    const dropList = (name: string) =>
      fixture.debugElement.query(By.css(`[data-test="${name}"] ul`)).injector.get(CdkDropList);
    return {
      fixture,
      host: fixture.componentInstance,
      el,
      list,
      handles,
      ids,
      status,
      key,
      dropList,
    };
  }

  it('dentro de un grupo: instrucciones con ← → y una lista vacía con su zona de soltar', async () => {
    const { list, handles } = await setup();
    const help = handles('todo')[0].getAttribute('aria-describedby')!;
    expect(list('todo').querySelector(`#${help}`)!.textContent).toContain('left and right arrows');
    const empty = list('done').querySelector('[data-slot="empty"]')!;
    expect(empty.textContent!.trim()).toBe('Drop here');
    expect(empty.getAttribute('aria-hidden')).toBe('true');
    expect(list('done').querySelector('ul')!.hasAttribute('data-empty')).toBe(true);
    // Posicionada: sus textos sr-only no se escapan de una columna con desplazamiento.
    expect(list('todo').classList).toContain('relative');
  });

  it('teclado: → pasa a la lista siguiente, al mismo lugar o al último, con anuncio y el foco', async () => {
    const { handles, ids, status, key } = await setup();
    await key(handles('todo')[1], 'Enter'); // agarra «Tb»
    await key(handles('todo')[1], 'ArrowRight');
    expect(ids()).toEqual({ todo: 'ac', doing: 'db', done: '' });
    expect(status('doing')).toBe('Tb moved to En curso, position 2 of 2.');
    expect(document.activeElement).toBe(handles('doing')[1]);
    expect(handles('doing')[1].getAttribute('aria-pressed')).toBe('true');
    await key(handles('doing')[1], 'ArrowRight');
    expect(ids()).toEqual({ todo: 'ac', doing: 'd', done: 'b' });
    expect(document.activeElement).toBe(handles('done')[0]);
  });

  it('teclado: soltar en otra lista emite moved en la lista y en el grupo; Escape lo devuelve todo', async () => {
    const { host, handles, ids, status, key } = await setup();
    await key(handles('todo')[0], ' ');
    await key(handles('todo')[0], 'ArrowRight');
    await key(handles('doing')[0], 'ArrowDown');
    await key(handles('doing')[1], 'Enter');
    expect(ids()).toEqual({ todo: 'bc', doing: 'da', done: '' });
    const move = {
      item: { id: 'a', title: 'Ta' },
      from: { list: 'todo', index: 0 },
      to: { list: 'doing', index: 1 },
    };
    expect(host.listMoves).toEqual([move]);
    expect(host.groupMoves).toEqual([move]);
    expect(status('doing')).toBe('Ta dropped in En curso, position 2 of 2.');

    // Escape tras pasar por dos listas: todo vuelve a como estaba al agarrar.
    await key(handles('todo')[1], 'Enter');
    await key(handles('todo')[1], 'ArrowRight');
    await key(handles('doing')[1], 'ArrowRight');
    expect(ids()).toEqual({ todo: 'b', doing: 'da', done: 'c' });
    await key(handles('done')[0], 'Escape');
    expect(ids()).toEqual({ todo: 'bc', doing: 'da', done: '' });
    expect(status('todo')).toContain('Tc is back at position 2 of 2');
    expect(document.activeElement).toBe(handles('todo')[1]);
    expect(host.groupMoves).toHaveLength(1);
  });

  it('volver con el teclado a la lista de origen cuenta como reorden, no como moved', async () => {
    const { host, handles, ids, key } = await setup();
    await key(handles('todo')[0], 'Enter');
    await key(handles('todo')[0], 'ArrowRight');
    await key(handles('doing')[0], 'ArrowLeft');
    await key(handles('todo')[0], 'ArrowDown');
    await key(handles('todo')[1], 'Enter');
    expect(ids().todo).toBe('bac');
    expect(host.reorders).toEqual([
      { item: { id: 'a', title: 'Ta' }, previousIndex: 0, currentIndex: 1 },
    ]);
    expect(host.groupMoves).toEqual([]);
  });

  it('con solo toques, sin arrastrar (WCAG 2.5.7): asa de origen y asa o zona de destino', async () => {
    const { fixture, handles, ids, list, status } = await setup();
    const tap = async (el: HTMLElement) => {
      el.click();
      await settle(fixture);
    };
    await tap(handles('todo')[0]); // agarra «Ta»
    expect(handles('todo')[0].getAttribute('aria-pressed')).toBe('true');
    await tap(handles('doing')[0]); // la pone donde está «Td»
    expect(ids()).toEqual({ todo: 'bc', doing: 'ad', done: '' });
    expect(status('doing')).toBe('Ta dropped in En curso, position 1 of 2.');
    // A una lista vacía, tocando su zona de soltar.
    await tap(handles('todo')[0]);
    await tap(list('done').querySelector<HTMLElement>('[data-slot="empty"]')!);
    expect(ids()).toEqual({ todo: 'c', doing: 'ad', done: 'b' });
    // Tocar otra vez la misma asa la suelta donde está.
    await tap(handles('todo')[0]);
    await tap(handles('todo')[0]);
    expect(handles('todo')[0].getAttribute('aria-pressed')).toBe('false');
    expect(ids().todo).toBe('c');
  });

  it('un toque rechazado (accepts) termina el agarre y deja el aviso, aunque el foco cambie de asa', async () => {
    const { host, fixture, handles, ids, list } = await setup();
    host.max.set(1);
    await settle(fixture);
    handles('todo')[0].focus();
    handles('todo')[0].click();
    await settle(fixture);
    // El clic enfoca el asa de destino: el blur del origen no debe soltar encima del aviso.
    handles('doing')[0].focus();
    handles('doing')[0].click();
    await settle(fixture);
    expect(ids()).toEqual({ todo: 'abc', doing: 'd', done: '' });
    expect(handles('todo')[0].getAttribute('aria-pressed')).toBe('false');
    expect(list('todo').querySelector('[role="status"]')!.textContent).toContain(
      "En curso doesn't accept Ta.",
    );
  });

  it('el anuncio se repite aunque el texto sea el mismo; el rechazo se anuncia; las demás regiones se limpian', async () => {
    const { host, fixture, handles, list, key } = await setup();
    const region = (name: string) => list(name).querySelector('[role="status"]')!;
    await key(handles('todo')[0], 'Enter');
    await key(handles('todo')[0], 'ArrowRight');
    const first = region('doing').textContent;
    await key(handles('doing')[0], 'ArrowLeft');
    await key(handles('todo')[0], 'ArrowRight');
    // Mismo mensaje, pero el DOM cambia (si no, el lector no lo vuelve a leer).
    expect(region('doing').textContent).not.toBe(first);
    expect(region('doing').textContent!.trim()).toBe(first!.trim());
    await key(handles('doing')[0], 'Escape');
    // Tras cancelar, solo la lista de origen dice algo.
    expect(region('doing').textContent!.trim()).toBe('');
    expect(region('todo').textContent).toContain('is back');
    // Rechazo por `accepts`: se anuncia en la lista de origen.
    host.max.set(1);
    await settle(fixture);
    await key(handles('todo')[0], 'Enter');
    await key(handles('todo')[0], 'ArrowRight');
    expect(region('todo').textContent).toContain("En curso doesn't accept Ta.");
    await key(handles('todo')[0], 'Escape');
    // La región es educada (status), sin assertive; las instrucciones, fuera del orden de lectura.
    expect(region('todo').hasAttribute('aria-live')).toBe(false);
    const help = handles('todo')[0].getAttribute('aria-describedby')!;
    expect(list('todo').querySelector(`#${help}`)!.hasAttribute('hidden')).toBe(true);
  });

  it('accepts rechaza (no más de max): el elemento se queda; RTL invierte ← →', async () => {
    const { host, fixture, handles, ids, key } = await setup();
    host.max.set(1);
    await settle(fixture);
    await key(handles('todo')[0], 'Enter');
    await key(handles('todo')[0], 'ArrowRight');
    expect(ids()).toEqual({ todo: 'abc', doing: 'd', done: '' });
    await key(handles('todo')[0], 'Escape');

    host.max.set(3);
    host.dir.set('rtl');
    await settle(fixture);
    await key(handles('todo')[0], 'Enter');
    await key(handles('todo')[0], 'ArrowLeft'); // en RTL, ← es «la siguiente»
    expect(ids()).toEqual({ todo: 'bc', doing: 'ad', done: '' });
  });

  it('puntero o dedo: el soltado del cdk entre listas cambia los dos modelos a la vez y emite moved', async () => {
    const { host, ids, status, dropList } = await setup();
    const from = dropList('todo');
    const to = dropList('done');
    to.dropped.emit({
      previousIndex: 2,
      currentIndex: 0,
      previousContainer: from,
      container: to,
    } as never);
    await new Promise((r) => setTimeout(r));
    expect(ids()).toEqual({ todo: 'ab', doing: 'd', done: 'c' });
    expect(host.groupMoves).toEqual([
      {
        item: { id: 'c', title: 'Tc' },
        from: { list: 'todo', index: 2 },
        to: { list: 'done', index: 0 },
      },
    ]);
    expect(status('done')).toBe('Tc dropped in Completado, position 1 of 1.');
    // El cdk pregunta a la lista de destino si acepta el elemento.
    host.max.set(1);
    expect(
      dropList('doing').enterPredicate(
        { data: { id: 'x', title: 'Tx' } } as never,
        dropList('doing'),
      ),
    ).toBe(false);
  });

  // Con su propio límite: son unas 60 pulsaciones con su detección de cambios (determinista: semilla fija).
  it(
    'propiedad: con movimientos al azar por teclado no se pierde ni se duplica ningún elemento',
    { timeout: 30_000 },
    async () => {
      const { host, handles, ids, key, fixture } = await setup();
      let seed = 7;
      const rand = (n: number) => (seed = (seed * 16807) % 2147483647) % n;
      const lists = ['todo', 'doing', 'done'] as const;
      for (let round = 0; round < 12; round++) {
        const withItems = lists.filter((l) => handles(l).length);
        const hs = handles(withItems[rand(withItems.length)]);
        await key(hs[rand(hs.length)], 'Enter');
        const grabbed = () =>
          lists
            .map((l) => handles(l).find((h) => h.getAttribute('aria-pressed') === 'true'))
            .find(Boolean)!;
        for (let step = 0; step < 3; step++) {
          await key(grabbed(), ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'][rand(4)]);
        }
        await key(grabbed(), rand(5) === 0 ? 'Escape' : 'Enter');
        const all = Object.values(ids()).join('').split('').sort().join('');
        expect(all, `ronda ${round}`).toBe('abcd');
      }
      expect(fixture.componentInstance).toBe(host);
    },
  );
});
