import { Component, TemplateRef, inject, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MIMI_DIALOG_DATA,
  type MimiDialogConfig,
  MimiDialogImports,
  MimiDialogRef,
  MimiDialogService,
} from './dialog';
import { MIMI_DIALOG_TEXT_ES, provideMimiDialogText } from './dialog-texts';

@Component({
  selector: 'test-user-form',
  imports: [MimiDialogImports],
  template: `
    <mimi-dialog-header>
      <h2 mimiDialogTitle>Editar a {{ data.name }}</h2>
      @if (data.description) {
        <p mimiDialogDescription>{{ data.description }}</p>
      }
    </mimi-dialog-header>
    <mimi-dialog-body>
      <input data-test="first" />
      <input data-test="second" />
    </mimi-dialog-body>
    <mimi-dialog-footer>
      <button type="button" data-test="cancel" mimiDialogClose>Cancelar</button>
      <button type="button" data-test="save" [mimiDialogClose]="{ saved: true }">Guardar</button>
    </mimi-dialog-footer>
  `,
})
class UserForm {
  readonly data = inject<{ name: string; description?: string }>(MIMI_DIALOG_DATA);
  readonly ref = inject(MimiDialogRef);
}

@Component({ selector: 'test-untitled', template: '<p>Sin título</p>' })
class Untitled {}

@Component({
  imports: [MimiDialogImports],
  template: `
    <button data-test="opener">Abrir con el servicio</button>
    <mimi-dialog
      [(open)]="open"
      [class]="extra()"
      [disableClose]="locked()"
      (closed)="results.push($event)"
    >
      <button data-test="trigger" mimiDialogTrigger>Editar usuario</button>
      <ng-template mimiDialogContent>
        <mimi-dialog-header>
          <h2 mimiDialogTitle>Editar usuario</h2>
          <p mimiDialogDescription>Los cambios se aplican al guardar.</p>
        </mimi-dialog-header>
        <mimi-dialog-body>
          <input data-test="name" [value]="name()" />
        </mimi-dialog-body>
        <mimi-dialog-footer>
          <button type="button" data-test="cancel" mimiDialogClose>Cancelar</button>
          <button type="button" data-test="save" [mimiDialogClose]="'guardado'">Guardar</button>
        </mimi-dialog-footer>
      </ng-template>
    </mimi-dialog>
    <ng-template #tpl let-data>
      <h2 mimiDialogTitle>Plantilla de {{ data }}</h2>
      <button type="button" data-test="tpl-close" mimiDialogClose>Listo</button>
    </ng-template>
    @if (second()) {
      <mimi-dialog [open]="true" aria-label="Efímero">
        <ng-template mimiDialogContent><p data-test="ephemeral">Efímero</p></ng-template>
      </mimi-dialog>
    }
  `,
})
class Host {
  readonly open = signal(false);
  readonly extra = signal('');
  readonly locked = signal(false);
  readonly name = signal('Ana');
  readonly second = signal(false);
  readonly results: unknown[] = [];
  readonly tpl = viewChild.required<TemplateRef<unknown>>('tpl');
}

/** El cierre espera la animación (en jsdom no hay) en una microtarea después del render. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('MimiDialog', () => {
  async function setup() {
    TestBed.configureTestingModule({ providers: [provideMimiDialogText(MIMI_DIALOG_TEXT_ES)] });
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const service = TestBed.inject(MimiDialogService);
    const opener = root.querySelector<HTMLElement>('[data-test="opener"]')!;
    const containers = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.cdk-dialog-container'));
    const container = () => containers().at(-1) ?? null;
    const panel = () =>
      container()?.querySelector<HTMLElement>('[data-mimi-overlay-panel]') ?? null;
    const backdrop = () =>
      Array.from(document.querySelectorAll<HTMLElement>('.cdk-overlay-backdrop')).at(-1)!;
    const inDialog = <T extends HTMLElement = HTMLElement>(test: string) =>
      container()!.querySelector<T>(`[data-test="${test}"]`)!;
    const closeX = () =>
      container()?.querySelector<HTMLButtonElement>('[data-slot="close"]') ?? null;
    const escape = async (init: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
        ...init,
      });
      (document.activeElement ?? document.body).dispatchEvent(event);
      await settle(fixture);
      return event;
    };
    const openWith = async <R = unknown>(config: MimiDialogConfig = {}, content = UserForm) => {
      opener.focus();
      const ref = service.open<R>(content, { data: { name: 'Ana' }, ...config });
      const closed: (R | undefined)[] = [];
      ref.afterClosed().subscribe((result) => closed.push(result));
      await settle(fixture);
      return { ref, closed };
    };
    return {
      fixture,
      root,
      h: fixture.componentInstance,
      service,
      opener,
      containers,
      container,
      panel,
      backdrop,
      inDialog,
      closeX,
      escape,
      openWith,
    };
  }

  afterEach(async () => {
    TestBed.inject(MimiDialogService).closeAll();
    await new Promise((r) => setTimeout(r));
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
  });

  it('servicio: role="dialog", aria-modal, nombre por el título, datos y las medidas del diseño', async () => {
    const { openWith, container, panel, closeX } = await setup();
    await openWith();
    const dialog = container()!;
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const title = dialog.querySelector('h2')!;
    expect(title.textContent).toBe('Editar a Ana');
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.hasAttribute('aria-describedby')).toBe(false);
    for (const cls of [
      'w-[var(--mimi-dialog-width,420px)]',
      'max-w-[calc(100vw_-_32px)]',
      'max-h-[calc(100dvh_-_32px)]',
      'rounded-[var(--mimi-dialog-radius,var(--mimi-radius-card))]',
      'bg-[color:var(--mimi-dialog-bg,var(--mimi-popover))]',
      'shadow-[shadow:var(--mimi-dialog-shadow,var(--mimi-shadow-popover))]',
      'text-popover-foreground',
    ]) {
      expect(panel()!.classList).toContain(cls);
    }
    expect(panel()!.dataset['state']).toBe('open');
    expect(title.classList).toContain('text-[18px]');
    const header = dialog.querySelector('mimi-dialog-header')!;
    expect(header.classList).toContain('px-[var(--mimi-dialog-padding,24px)]');
    expect(header.classList).toContain(
      'group-data-[close-button]/dialog:pr-[calc(var(--mimi-dialog-padding,24px)_+_var(--mimi-dialog-close-size,32px))]',
    );
    expect(dialog.querySelector('mimi-dialog-body')!.classList).toContain('overflow-y-auto');
    expect(dialog.querySelector('mimi-dialog-footer')!.classList).toContain('justify-end');
    expect(closeX()!.classList).toContain('size-[var(--mimi-dialog-close-size,32px)]');
  });

  it('fondo: color y desenfoque de los tokens, con la duración de la animación del panel', async () => {
    const { openWith, backdrop } = await setup();
    await openWith();
    for (const cls of [
      'bg-[color:var(--mimi-dialog-overlay,var(--mimi-overlay))]',
      'backdrop-blur-[var(--mimi-dialog-overlay-blur,var(--mimi-overlay-blur))]',
      'duration-150!',
    ]) {
      expect(backdrop().classList).toContain(cls);
    }
    expect(backdrop().classList).not.toContain('cdk-overlay-dark-backdrop');
  });

  it('la X: siempre, con nombre, después del contenido; el foco inicial queda dentro', async () => {
    const { openWith, closeX, panel, container } = await setup();
    await openWith();
    const x = closeX()!;
    expect(x.getAttribute('aria-label')).toBe('Cerrar');
    expect(x.getAttribute('type')).toBe('button');
    expect(panel()!.lastElementChild).toBe(x);
    expect(panel()!.hasAttribute('data-close-button')).toBe(true);
    // Que sea el primer campo y no la X depende del orden en el DOM (arriba) y del layout real:
    // jsdom no calcula visibilidad, así que el CDK no encuentra elementos «tabulables». Se
    // comprueba en Chrome (plan, G1.6).
    expect(container()!.contains(document.activeElement)).toBe(true);
  });

  it('la X cierra, y el foco vuelve al elemento que abrió', async () => {
    const { fixture, openWith, closeX, container, opener } = await setup();
    const { closed } = await openWith();
    closeX()!.click();
    await settle(fixture);
    expect(container()).toBeNull();
    expect(closed).toEqual([undefined]);
    expect(document.activeElement).toBe(opener);
  });

  it('mimiDialogClose cierra, con o sin resultado', async () => {
    const { fixture, openWith, inDialog, container } = await setup();
    const first = await openWith();
    inDialog('save').click();
    await settle(fixture);
    expect(first.closed).toEqual([{ saved: true }]);
    expect(container()).toBeNull();
    const second = await openWith();
    inDialog('cancel').click();
    await settle(fixture);
    expect(second.closed).toEqual([undefined]);
  });

  it('Escape y el clic en el fondo cierran; Escape con un modificador, no', async () => {
    const { fixture, openWith, escape, backdrop, container } = await setup();
    const first = await openWith();
    await escape({ ctrlKey: true });
    expect(container()).not.toBeNull();
    const event = await escape();
    expect(event.defaultPrevented).toBe(true);
    expect(container()).toBeNull();
    expect(first.closed).toEqual([undefined]);

    await openWith();
    backdrop().click();
    await settle(fixture);
    expect(container()).toBeNull();
  });

  it('closeOnEscape y closeOnBackdropClick se desactivan por separado; la X sigue cerrando', async () => {
    const { fixture, openWith, escape, backdrop, container, closeX } = await setup();
    await openWith({ closeOnEscape: false });
    await escape();
    expect(container()).not.toBeNull();
    backdrop().click();
    await settle(fixture);
    expect(container()).toBeNull();

    await openWith({ closeOnBackdropClick: false });
    backdrop().click();
    await settle(fixture);
    expect(container()).not.toBeNull();
    await escape();
    expect(container()).toBeNull();

    await openWith({ disableClose: true, closeOnEscape: true });
    await escape();
    backdrop().click();
    await settle(fixture);
    expect(container()).not.toBeNull();
    closeX()!.click();
    await settle(fixture);
    expect(container()).toBeNull();
  });

  it('closeButton: false quita la X (y su sitio en el encabezado)', async () => {
    const { openWith, closeX, panel } = await setup();
    await openWith({ closeButton: false });
    expect(closeX()).toBeNull();
    expect(panel()!.hasAttribute('data-close-button')).toBe(false);
  });

  it('descripción: aria-describedby; role alertdialog; ariaLabel en vez del título', async () => {
    const { fixture, openWith, container, service } = await setup();
    await openWith({ data: { name: 'Ana', description: 'Se aplica al guardar.' } });
    const description = container()!.querySelector('p')!;
    expect(container()!.getAttribute('aria-describedby')).toBe(description.id);
    service.closeAll();
    await settle(fixture);

    await openWith({ role: 'alertdialog', ariaLabel: 'Confirmación' });
    expect(container()!.getAttribute('role')).toBe('alertdialog');
    expect(container()!.getAttribute('aria-label')).toBe('Confirmación');
    expect(container()!.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('sin título avisa en modo desarrollo; con ariaLabel, no', async () => {
    const { fixture, openWith, service } = await setup();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await openWith({ ariaLabel: 'Aviso' }, Untitled as never);
    expect(warn).not.toHaveBeenCalled();
    service.closeAll();
    await settle(fixture);
    await openWith({}, Untitled as never);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no tiene nombre accesible'));
    warn.mockRestore();
  });

  it('autoFocus: un selector, el panel, o el panel si el selector no encuentra nada', async () => {
    const { fixture, openWith, inDialog, container, service } = await setup();
    await openWith({ autoFocus: '[data-test="second"]' });
    expect(document.activeElement).toBe(inDialog('second'));
    service.closeAll();
    await settle(fixture);

    await openWith({ autoFocus: 'dialog' });
    expect(document.activeElement).toBe(container());
    service.closeAll();
    await settle(fixture);

    await openWith({ autoFocus: '.no-existe' });
    expect(document.activeElement).toBe(container());
  });

  it('class, width y maxWidth van al panel; gana la clase del usuario', async () => {
    const { openWith, panel } = await setup();
    await openWith({ class: 'rounded-none shadow-none w-auto', width: '640px', maxWidth: '90vw' });
    const el = panel()!;
    for (const cls of ['rounded-none', 'shadow-none', 'w-auto'])
      expect(el.classList).toContain(cls);
    expect(el.classList).not.toContain('w-[var(--mimi-dialog-width,420px)]');
    expect(el.classList).not.toContain(
      'shadow-[shadow:var(--mimi-dialog-shadow,var(--mimi-shadow-popover))]',
    );
    expect(el.style.width).toBe('640px');
    expect(el.style.maxWidth).toBe('min(90vw, calc(100vw - 32px))');
  });

  it('el host del componente del usuario no dibuja caja (display: contents)', async () => {
    const { openWith, panel } = await setup();
    await openWith();
    const host = panel()!.querySelector<HTMLElement>('test-user-form')!;
    expect(host.style.display).toBe('contents');
  });

  it('salida animada: el panel sigue montado hasta que termina; cerrar dos veces emite una', async () => {
    const { fixture, openWith, panel, container, backdrop } = await setup();
    const { ref, closed } = await openWith<string>();
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => (finish = resolve));
    panel()!.getAnimations = () => [{ finished } as unknown as Animation];
    ref.close('uno');
    ref.close('dos');
    await settle(fixture);
    expect(container()).not.toBeNull();
    expect(panel()!.dataset['state']).toBe('closed');
    expect(panel()!.hasAttribute('inert')).toBe(true);
    expect(backdrop().classList).not.toContain('cdk-overlay-backdrop-showing');
    expect(closed).toEqual([]);
    finish();
    await settle(fixture);
    expect(container()).toBeNull();
    expect(closed).toEqual(['uno']);
  });

  it('apilados: Escape cierra solo el de arriba; closeAll cierra todos', async () => {
    const { fixture, openWith, escape, containers, service } = await setup();
    const first = await openWith();
    const second = await openWith({ data: { name: 'Bruno' } });
    expect(containers().length).toBe(2);
    await escape();
    expect(containers().length).toBe(1);
    expect(second.closed.length).toBe(1);
    expect(first.closed.length).toBe(0);
    await openWith();
    service.closeAll();
    await settle(fixture);
    expect(containers().length).toBe(0);
    expect(first.closed.length).toBe(1);
  });

  it('apilados: los de abajo quedan ocultos a los lectores hasta que se cierra el de arriba', async () => {
    const { fixture, openWith, escape, containers, root } = await setup();
    const host = (container: HTMLElement) => container.closest('.cdk-global-overlay-wrapper')!;
    await openWith();
    const [first] = containers();
    expect(host(first).hasAttribute('aria-hidden')).toBe(false);

    await openWith({ data: { name: 'Bruno' } });
    const second = containers()[1];
    expect(host(first).getAttribute('aria-hidden')).toBe('true');
    expect(host(second).hasAttribute('aria-hidden')).toBe(false);
    await openWith({ data: { name: 'Carla' } });
    const third = containers()[2];
    expect(host(first).getAttribute('aria-hidden')).toBe('true');
    expect(host(second).getAttribute('aria-hidden')).toBe('true');
    expect(third.contains(document.activeElement)).toBe(true);

    // Al empezar a cerrarse el de arriba, el de abajo vuelve antes de recibir el foco.
    let finish!: () => void;
    const finished = new Promise<void>((resolve) => (finish = resolve));
    third.querySelector<HTMLElement>('[data-mimi-overlay-panel]')!.getAnimations = () => [
      { finished } as unknown as Animation,
    ];
    await escape();
    expect(containers().length).toBe(3);
    expect(host(second).hasAttribute('aria-hidden')).toBe(false);
    expect(host(first).getAttribute('aria-hidden')).toBe('true');
    finish();
    await settle(fixture);
    expect(containers().length).toBe(2);
    await escape();
    expect(host(first).hasAttribute('aria-hidden')).toBe(false);
    expect(root.getAttribute('aria-hidden')).toBe('true');
  });

  it('se abre después del render en curso: el foco vuelve a donde estaba entonces (menús)', async () => {
    const { fixture, service, opener, container, inDialog } = await setup();
    // Un ítem de menú: pide el diálogo en su evento y enseguida el menú lo quita y devuelve el
    // foco a su botón (opener). El diálogo debe recordar el botón, no el ítem.
    const item = document.createElement('button');
    document.body.appendChild(item);
    item.focus();
    const ref = service.open(UserForm, { data: { name: 'Ana' } });
    expect(container()).toBeNull();
    opener.focus();
    item.remove();
    const closed: unknown[] = [];
    ref.afterClosed().subscribe((result) => closed.push(result));
    await settle(fixture);
    expect(container()).not.toBeNull();
    inDialog('cancel').click();
    await settle(fixture);
    expect(closed).toEqual([undefined]);
    expect(document.activeElement).toBe(opener);
  });

  it('cerrado antes de abrirse: no se abre y afterClosed emite el resultado', async () => {
    const { fixture, service, container } = await setup();
    const ref = service.open<string>(UserForm, { data: { name: 'Ana' } });
    const closed: unknown[] = [];
    ref.afterClosed().subscribe((result) => closed.push(result));
    ref.close('nada');
    await settle(fixture);
    expect(container()).toBeNull();
    expect(closed).toEqual(['nada']);

    const other = service.open(UserForm, { data: { name: 'Ana' } });
    const otherClosed: unknown[] = [];
    other.afterClosed().subscribe((result) => otherClosed.push(result));
    service.closeAll();
    await settle(fixture);
    expect(container()).toBeNull();
    expect(otherClosed).toEqual([undefined]);
  });

  it('el resto de la página queda oculto a los lectores mientras está abierto', async () => {
    const { fixture, root, openWith, service } = await setup();
    expect(root.hasAttribute('aria-hidden')).toBe(false);
    await openWith();
    expect(root.getAttribute('aria-hidden')).toBe('true');
    service.closeAll();
    await settle(fixture);
    expect(root.hasAttribute('aria-hidden')).toBe(false);
  });

  it('plantilla con el servicio: recibe los datos como let-data y encuentra su MimiDialogRef', async () => {
    const { fixture, h, service, container, inDialog } = await setup();
    const ref = service.open(h.tpl(), { data: 'Ana' });
    const closed: unknown[] = [];
    ref.afterClosed().subscribe((result) => closed.push(result));
    await settle(fixture);
    const title = container()!.querySelector('h2')!;
    expect(title.textContent).toBe('Plantilla de Ana');
    expect(container()!.getAttribute('aria-labelledby')).toBe(title.id);
    inDialog('tpl-close').click();
    await settle(fixture);
    expect(closed).toEqual([undefined]);
  });

  it('declarativo: el trigger abre, [(open)] se sincroniza y (closed) trae el resultado', async () => {
    const { fixture, h, root, container, inDialog } = await setup();
    const trigger = root.querySelector<HTMLElement>('[data-test="trigger"]')!;
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.dataset['state']).toBe('closed');
    trigger.focus();
    trigger.click();
    await settle(fixture);
    expect(h.open()).toBe(true);
    expect(trigger.dataset['state']).toBe('open');
    const dialog = container()!;
    expect(dialog.getAttribute('aria-labelledby')).toBe(dialog.querySelector('h2')!.id);
    expect(dialog.getAttribute('aria-describedby')).toBe(dialog.querySelector('p')!.id);
    // El contenido usa los signals del componente que lo declara.
    expect(inDialog<HTMLInputElement>('name').value).toBe('Ana');
    h.name.set('Bruno');
    await settle(fixture);
    expect(inDialog<HTMLInputElement>('name').value).toBe('Bruno');

    inDialog('save').click();
    await settle(fixture);
    expect(container()).toBeNull();
    expect(h.open()).toBe(false);
    expect(h.results).toEqual(['guardado']);
    expect(document.activeElement).toBe(trigger);
  });

  it('declarativo: open desde fuera abre y cierra; class va al panel y disableClose se respeta', async () => {
    const { fixture, h, root, container, panel, escape } = await setup();
    h.extra.set('w-[560px]');
    h.locked.set(true);
    h.open.set(true);
    await settle(fixture);
    expect(root.querySelector('mimi-dialog')!.hasAttribute('class')).toBe(false);
    expect(panel()!.classList).toContain('w-[560px]');
    expect(panel()!.classList).not.toContain('w-[var(--mimi-dialog-width,420px)]');
    await escape();
    expect(container()).not.toBeNull();
    h.open.set(false);
    await settle(fixture);
    expect(container()).toBeNull();
    expect(h.results).toEqual([undefined]);
  });

  it('declarativo: si se destruye abierto, se cierra', async () => {
    const { fixture, h, container } = await setup();
    h.second.set(true);
    await settle(fixture);
    expect(container()!.getAttribute('aria-label')).toBe('Efímero');
    h.second.set(false);
    await settle(fixture);
    expect(container()).toBeNull();
  });
});
