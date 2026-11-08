import { CdkDropList } from '@angular/cdk/drag-drop';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MimiSortableListImports, type MimiSortableReorder } from './sortable-list';
import { MIMI_SORTABLE_TEXT_ES, provideMimiSortableText } from './sortable-list-texts';

interface Task {
  id: string;
  title: string;
}

const TASKS: Task[] = [
  { id: 'a', title: 'Revisar contraste' },
  { id: 'b', title: 'Diseñar Tabs' },
  { id: 'c', title: 'Migrar Select' },
  { id: 'd', title: 'Escribir docs' },
];

@Component({
  imports: [MimiSortableListImports],
  template: `
    <mimi-sortable-list
      data-test="tasks"
      aria-label="Prioridades"
      [(items)]="tasks"
      [itemLabel]="title"
      [trackBy]="byId"
      [disabled]="off()"
      [class]="extra()"
      (reordered)="events.push($event)"
    >
      <ng-template mimiSortableItem let-task let-index="index" let-grabbed="grabbed">
        <span data-test="content">{{ index + 1 }}·{{ task.title }}·{{ grabbed }}</span>
      </ng-template>
    </mimi-sortable-list>
    <mimi-sortable-list data-test="plain" aria-label="Simple" [(items)]="words" />
    <button data-test="out">Fuera</button>
  `,
})
class Host {
  readonly tasks = signal<Task[]>(TASKS);
  readonly words = signal(['uno', 'dos']);
  readonly off = signal(false);
  readonly extra = signal('');
  readonly events: MimiSortableReorder<Task>[] = [];
  readonly title = (task: Task) => task.title;
  readonly byId = (task: Task) => task.id;
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

const press = (target: Element, key: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await settle(fixture);
  const el = fixture.nativeElement as HTMLElement;
  const list = el.querySelector('[data-test="tasks"]') as HTMLElement;
  const handles = () =>
    Array.from(list.querySelectorAll<HTMLButtonElement>('[data-slot="handle"]'));
  const order = () => fixture.componentInstance.tasks().map((t) => t.id);
  const status = () => list.querySelector('[role="status"]')!.textContent!.trim();
  return { fixture, host: fixture.componentInstance, el, list, handles, order, status };
}

describe('MimiSortableList', () => {
  it('lista con nombre, elementos ordenables, asas con nombre e instrucciones', async () => {
    const { list, handles } = await setup();
    const ul = list.querySelector('ul')!;
    expect(ul.getAttribute('aria-label')).toBe('Prioridades');
    expect(list.getAttribute('aria-label')).toBeNull();
    const items = Array.from(ul.querySelectorAll(':scope > li'));
    expect(items).toHaveLength(4);
    expect(items[0].getAttribute('aria-roledescription')).toBe('sortable item');
    const [first] = handles();
    expect(first.getAttribute('aria-label')).toBe('Reorder Revisar contraste');
    expect(first.getAttribute('aria-pressed')).toBe('false');
    const help = list.querySelector(`#${first.getAttribute('aria-describedby')}`)!;
    expect(help.textContent).toContain('Press Space or Enter to grab');
    expect(list.querySelector('[role="status"]')!.getAttribute('aria-live')).toBe('assertive');
    // La plantilla recibe el elemento y su índice.
    expect(list.querySelector('[data-test="content"]')!.textContent).toBe(
      '1·Revisar contraste·false',
    );
  });

  it('teclado: agarra, mueve con ↓ ↑ Fin Inicio y suelta, con anuncios y el foco en el asa', async () => {
    const { fixture, host, handles, order, status } = await setup();
    handles()[1].focus();
    press(handles()[1], ' ');
    await settle(fixture);
    expect(handles()[1].getAttribute('aria-pressed')).toBe('true');
    expect(status()).toBe('Diseñar Tabs grabbed. Position 2 of 4. Use the arrow keys to move it.');

    press(handles()[1], 'ArrowDown');
    await settle(fixture);
    expect(order()).toEqual(['a', 'c', 'b', 'd']);
    expect(status()).toBe('Diseñar Tabs: position 3 of 4.');
    expect(document.activeElement).toBe(handles()[2]);
    expect(handles()[2].getAttribute('aria-pressed')).toBe('true');

    press(handles()[2], 'End');
    await settle(fixture);
    expect(order()).toEqual(['a', 'c', 'd', 'b']);
    press(handles()[3], 'Home');
    await settle(fixture);
    expect(order()).toEqual(['b', 'a', 'c', 'd']);
    expect(document.activeElement).toBe(handles()[0]);

    press(handles()[0], 'Enter');
    await settle(fixture);
    expect(handles()[0].getAttribute('aria-pressed')).toBe('false');
    expect(status()).toBe('Diseñar Tabs dropped at position 1 of 4.');
    expect(host.events).toEqual([{ item: TASKS[1], previousIndex: 1, currentIndex: 0 }]);
  });

  it('Escape devuelve el elemento a su lugar y no emite reordered', async () => {
    const { fixture, host, handles, order, status } = await setup();
    handles()[0].focus();
    press(handles()[0], 'Enter');
    press(handles()[0], 'ArrowDown');
    await settle(fixture);
    press(handles()[1], 'ArrowDown');
    await settle(fixture);
    expect(order()).toEqual(['b', 'c', 'a', 'd']);
    press(handles()[2], 'Escape');
    await settle(fixture);
    expect(order()).toEqual(['a', 'b', 'c', 'd']);
    expect(status()).toBe('Reordering canceled. Revisar contraste is back at position 1 of 4.');
    expect(document.activeElement).toBe(handles()[0]);
    expect(host.events).toEqual([]);
  });

  it('si el foco sale del asa con el elemento agarrado, se suelta donde está', async () => {
    const { fixture, el, host, handles, status } = await setup();
    handles()[3].focus();
    press(handles()[3], ' ');
    press(handles()[3], 'ArrowUp');
    await settle(fixture);
    el.querySelector<HTMLElement>('[data-test="out"]')!.focus();
    await settle(fixture);
    expect(status()).toBe('Escribir docs dropped at position 3 of 4.');
    expect(host.events).toEqual([{ item: TASKS[3], previousIndex: 3, currentIndex: 2 }]);
    expect(handles().every((h) => h.getAttribute('aria-pressed') === 'false')).toBe(true);
  });

  it('el soltado del cdk (puntero o dedo) reordena, emite y anuncia', async () => {
    const { fixture, host, order, status } = await setup();
    const dropList = fixture.debugElement
      .query(By.css('[data-test="tasks"] ul'))
      .injector.get(CdkDropList);
    dropList.dropped.emit({ previousIndex: 0, currentIndex: 2 } as never);
    await settle(fixture);
    expect(order()).toEqual(['b', 'c', 'a', 'd']);
    expect(host.events).toEqual([{ item: TASKS[0], previousIndex: 0, currentIndex: 2 }]);
    expect(status()).toBe('Revisar contraste dropped at position 3 of 4.');
    // Soltar en el mismo lugar no cambia nada.
    dropList.dropped.emit({ previousIndex: 1, currentIndex: 1 } as never);
    await settle(fixture);
    expect(host.events).toHaveLength(1);
  });

  it('deshabilitada: asas deshabilitadas, el teclado no agarra', async () => {
    const { fixture, host, list, handles } = await setup();
    host.off.set(true);
    await settle(fixture);
    expect(list.hasAttribute('data-disabled')).toBe(true);
    expect(handles().every((h) => h.disabled)).toBe(true);
    press(handles()[0], ' ');
    await settle(fixture);
    expect(handles()[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('sin plantilla muestra la etiqueta; class del usuario con cn() y tokens', async () => {
    const { fixture, host, el, list } = await setup();
    const plain = el.querySelector('[data-test="plain"]')!;
    expect(Array.from(plain.querySelectorAll('li')).map((li) => li.textContent!.trim())).toEqual([
      'uno',
      'dos',
    ]);
    expect(plain.querySelector('[data-slot="handle"]')!.getAttribute('aria-label')).toBe(
      'Reorder uno',
    );
    const ul = list.querySelector('ul')!;
    expect(ul.className).toContain('gap-[var(--mimi-sortable-gap,8px)]');
    const li = ul.querySelector('li')!;
    expect(li.className).toContain('min-h-[var(--mimi-sortable-item-height,56px)]');
    expect(li.className).toContain('rounded-[var(--mimi-sortable-radius,var(--mimi-radius))]');
    expect(li.className).toContain('bg-[color:var(--mimi-sortable-bg,var(--mimi-card))]');
    host.extra.set('gap-4 max-w-md');
    await settle(fixture);
    expect(list.className).toContain('gap-4');
    expect(list.className).not.toContain('gap-2');
    expect(list.className).toContain('max-w-md');
  });

  it('regresión NG0103: la plantilla propia sigue el índice y el agarre sin repetir la detección', async () => {
    // MimiSortableOutlet recibía un objeto de contexto nuevo en cada detección de cambios y su
    // efecto se repetía sin fin (NG0103, G3.2). Recibe cada dato por separado.
    const errors = vi.spyOn(console, 'error');
    const { fixture, host, list, handles } = await setup();
    const contents = () =>
      Array.from(list.querySelectorAll('[data-test="content"]')).map((s) => s.textContent);
    handles()[1].focus();
    press(handles()[1], ' ');
    await settle(fixture);
    press(handles()[1], 'ArrowDown');
    await settle(fixture);
    host.extra.set('gap-4');
    await settle(fixture);
    expect(contents()).toEqual([
      '1·Revisar contraste·false',
      '2·Migrar Select·false',
      '3·Diseñar Tabs·true',
      '4·Escribir docs·false',
    ]);
    // Angular lo registra como console.error('ERROR', error): se miran todos los argumentos.
    const ng0103 = errors.mock.calls.filter((args) =>
      args.map(String).join(' ').includes('NG0103'),
    );
    expect(ng0103).toEqual([]);
    errors.mockRestore();
  });

  it('textos en español', async () => {
    TestBed.configureTestingModule({ providers: [provideMimiSortableText(MIMI_SORTABLE_TEXT_ES)] });
    const { fixture, list, handles, status } = await setup();
    expect(list.querySelector('li')!.getAttribute('aria-roledescription')).toBe(
      'elemento ordenable',
    );
    expect(handles()[0].getAttribute('aria-label')).toBe('Reordenar Revisar contraste');
    handles()[0].focus();
    press(handles()[0], ' ');
    await settle(fixture);
    expect(status()).toBe(
      'Revisar contraste agarrado. Lugar 1 de 4. Usa las flechas para moverlo.',
    );
  });
});
