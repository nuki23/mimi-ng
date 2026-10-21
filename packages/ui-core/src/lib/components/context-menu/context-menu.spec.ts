import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiContextMenuImports } from './context-menu';

interface Row {
  id: number;
  name: string;
}

@Component({
  imports: [MimiContextMenuImports],
  template: `
    <button data-test="outside">Fuera</button>
    <mimi-context-menu
      [(open)]="open"
      [aria-label]="label()"
      [disabled]="disabled()"
      [class]="extra()"
    >
      @for (row of rows; track row.id) {
        <div
          [attr.data-test]="'row-' + row.id"
          tabindex="0"
          mimiContextMenuTrigger
          [mimiContextMenuTriggerData]="row"
        >
          {{ row.name }}
        </div>
      }
      <ng-template mimiContextMenuContent let-row>
        <mimi-menu-label>{{ row.name }}</mimi-menu-label>
        <mimi-menu-item (selected)="picked.set('abrir ' + row.name)">Abrir</mimi-menu-item>
        <mimi-menu-checkbox-item [(checked)]="starred">Destacado</mimi-menu-checkbox-item>
        <mimi-menu-sub>
          <mimi-menu-sub-trigger>Mover a</mimi-menu-sub-trigger>
          <ng-template mimiMenuSubContent>
            <mimi-menu-item (selected)="picked.set('archivo ' + row.name)">Archivo</mimi-menu-item>
          </ng-template>
        </mimi-menu-sub>
        <mimi-menu-separator />
        <mimi-menu-item tone="danger" (selected)="picked.set('eliminar ' + row.name)">
          Eliminar
        </mimi-menu-item>
      </ng-template>
    </mimi-context-menu>
  `,
})
class Host {
  readonly rows: Row[] = [
    { id: 1, name: 'informe.pdf' },
    { id: 2, name: 'fotos.zip' },
  ];
  readonly open = signal(false);
  readonly label = signal('Acciones del archivo');
  readonly disabled = signal(false);
  readonly extra = signal('');
  readonly starred = signal(false);
  readonly picked = signal<string | null>(null);
}

/** El cierre espera la animación (en jsdom no hay) en una microtarea después del render. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
};

const key = (target: Element, k: string, init: KeyboardEventInit = {}) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }),
  );

/** Clic derecho en (x, y). Devuelve el evento para ver si se canceló. */
const rightClick = (target: Element, x = 120, y = 80, button = 2) => {
  const event = new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button,
  });
  target.dispatchEvent(event);
  return event;
};

describe('MimiContextMenu', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    await settle(fixture);
    const row = (id: number) => root.querySelector<HTMLElement>(`[data-test=row-${id}]`)!;
    const menu = () => document.querySelector<HTMLElement>('[data-mimi-overlay-panel][role=menu]');
    const item = (text: string) =>
      Array.from(document.querySelectorAll<HTMLElement>('[role^=menuitem]')).find((el) =>
        el.textContent?.trim().startsWith(text),
      )!;
    const focused = () => document.activeElement?.textContent?.trim() ?? '';
    const press = async (k: string) => {
      key(document.activeElement!, k);
      await settle(fixture);
    };
    const openAt = async (el: Element, x?: number, y?: number) => {
      const event = rightClick(el, x, y);
      await settle(fixture);
      return event;
    };
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      row,
      menu,
      item,
      focused,
      press,
      openAt,
    };
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => c.remove());
    document.body.innerHTML = '';
  });

  it('cerrado: sin menú y sin ARIA en la zona; data-state en el host y en los triggers', async () => {
    const { root, row, menu } = await setup();
    expect(menu()).toBeNull();
    expect(row(1).getAttribute('data-state')).toBe('closed');
    expect(row(1).hasAttribute('aria-haspopup')).toBe(false);
    expect(root.querySelector('mimi-context-menu')!.getAttribute('data-state')).toBe('closed');
  });

  it('clic derecho: cancela el menú del navegador y abre con nombre, foco en el primer ítem y el dato de la fila', async () => {
    const { row, menu, focused, openAt, host } = await setup();
    const event = await openAt(row(1));
    expect(event.defaultPrevented).toBe(true);
    expect(host.open()).toBe(true);
    expect(menu()!.getAttribute('aria-label')).toBe('Acciones del archivo');
    expect(menu()!.textContent).toContain('informe.pdf');
    expect(focused()).toBe('Abrir');
    expect(row(1).getAttribute('data-state')).toBe('open');
    expect(row(2).getAttribute('data-state')).toBe('closed');
  });

  it('elegir un ítem cierra y devuelve el foco al elemento que lo tenía', async () => {
    const { fixture, row, openAt, press, host, menu } = await setup();
    row(2).focus();
    await openAt(row(2));
    await press('Enter');
    expect(host.picked()).toBe('abrir fotos.zip');
    expect(host.open()).toBe(false);
    await settle(fixture);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(row(2));
  });

  it('Escape cierra y devuelve el foco; Tab y clic fuera cierran sin moverlo', async () => {
    const { fixture, root, row, openAt, press, host } = await setup();
    row(1).focus();
    await openAt(row(1));
    await press('Escape');
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(row(1));

    await openAt(row(1));
    const outside = root.querySelector<HTMLElement>('[data-test=outside]')!;
    outside.focus();
    await settle(fixture);
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(outside);

    await openAt(row(1));
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await settle(fixture);
    expect(host.open()).toBe(false);
  });

  it('teclado: Shift+F10 o la tecla de menú, y el contextmenu que sigue, abren una sola vez', async () => {
    const { fixture, row, focused, host } = await setup();
    row(2).focus();
    key(row(2), 'F10', { shiftKey: true });
    rightClick(row(2), 0, 0, 0);
    await settle(fixture);
    expect(host.open()).toBe(true);
    expect(focused()).toBe('Abrir');
    host.open.set(false);
    await settle(fixture);
    key(row(2), 'ContextMenu');
    rightClick(row(2), 0, 0, 0);
    await settle(fixture);
    expect(host.open()).toBe(true);
  });

  it('otro clic derecho con el menú abierto lo recrea: submenú cerrado, foco al primero y el dato nuevo', async () => {
    const { row, menu, openAt, press, focused, item } = await setup();
    await openAt(row(1));
    await press('m');
    await press('ArrowRight');
    expect(focused()).toBe('Archivo');
    await openAt(row(2), 300, 200);
    expect(menu()!.textContent).toContain('fotos.zip');
    expect(menu()!.textContent).not.toContain('informe.pdf');
    expect(item('Mover a').getAttribute('aria-expanded')).toBe('false');
    expect(focused()).toBe('Abrir');
    expect(row(2).getAttribute('data-state')).toBe('open');
    expect(row(1).getAttribute('data-state')).toBe('closed');
  });

  it('elegir en un submenú usa el dato de la fila y cierra todo', async () => {
    const { row, openAt, press, item, host } = await setup();
    await openAt(row(2));
    await press('m');
    await press('ArrowRight');
    item('Archivo').click();
    expect(host.picked()).toBe('archivo fotos.zip');
    expect(host.open()).toBe(false);
  });

  it('scroll: abierto con el puntero se cierra (el foco vuelve); con el teclado sigue abierto', async () => {
    const { fixture, row, openAt, host } = await setup();
    const scroll = async () => {
      document.dispatchEvent(new Event('scroll'));
      await new Promise((r) => setTimeout(r, 50));
      await settle(fixture);
    };
    row(1).focus();
    await openAt(row(1));
    await scroll();
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(row(1));

    key(row(1), 'ContextMenu');
    rightClick(row(1), 0, 0, 0);
    await settle(fixture);
    expect(host.open()).toBe(true);
    await scroll();
    expect(host.open()).toBe(true);
  });

  it('checkbox: [(checked)] y cierra', async () => {
    const { row, openAt, item, host } = await setup();
    await openAt(row(1));
    item('Destacado').click();
    expect(host.starred()).toBe(true);
    expect(host.open()).toBe(false);
  });

  it('clic derecho dentro del menú: sin menú del navegador y sin reabrir', async () => {
    const { row, menu, openAt, item, host } = await setup();
    await openAt(row(1));
    const event = rightClick(item('Abrir'));
    expect(event.defaultPrevented).toBe(true);
    expect(host.open()).toBe(true);
    expect(menu()!.textContent).toContain('informe.pdf');
  });

  it('disabled: no cancela el menú del navegador y cierra el que estaba abierto', async () => {
    const { fixture, root, row, openAt, host, menu } = await setup();
    await openAt(row(1));
    host.disabled.set(true);
    await settle(fixture);
    expect(host.open()).toBe(false);
    expect(menu()).toBeNull();
    const event = await openAt(row(1));
    expect(event.defaultPrevented).toBe(false);
    expect(host.open()).toBe(false);
    expect(root.querySelector('mimi-context-menu')!.hasAttribute('data-disabled')).toBe(true);
  });

  it('[(open)] desde el código abre junto al primer trigger, con su dato', async () => {
    const { fixture, host, menu, row } = await setup();
    host.open.set(true);
    await settle(fixture);
    expect(menu()!.textContent).toContain('informe.pdf');
    expect(row(1).getAttribute('data-state')).toBe('open');
    host.open.set(false);
    await settle(fixture);
    expect(menu()).toBeNull();
  });

  it('sin label avisa en modo desarrollo', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture, row, openAt, host } = await setup();
    host.label.set('');
    await settle(fixture);
    await openAt(row(1));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no tiene nombre accesible'));
    warn.mockRestore();
  });

  it('class del usuario va al panel (gana con cn)', async () => {
    const { fixture, row, openAt, menu, host, root } = await setup();
    host.extra.set('w-72');
    await settle(fixture);
    await openAt(row(1));
    expect(menu()!.className).toContain('w-72');
    expect(menu()!.className).not.toContain('w-[var(--mimi-menu-width,240px)]');
    expect(root.querySelector('mimi-context-menu')!.hasAttribute('class')).toBe(false);
  });
});
