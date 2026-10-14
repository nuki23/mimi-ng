import { Component, ErrorHandler, Injectable, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiDialogService } from '@/components/ui/dialog';
import { injectMimiToast } from './toast';
import { provideMimiToast } from './toast-config';
import { MIMI_TOAST_TEXT_ES, provideMimiToastText } from './toast-texts';

@Component({
  selector: 'test-host',
  template: `
    <button data-test="opener">Abrir</button>
    <ng-template #icon><svg data-test="svg"></svg></ng-template>
  `,
})
class Host {
  readonly toast = injectMimiToast();
  readonly icon = viewChild.required<TemplateRef<unknown>>('icon');
}

/** La X en español sale de los providers del componente que llama. */
@Component({
  selector: 'test-spanish-host',
  template: '',
  providers: [provideMimiToastText(MIMI_TOAST_TEXT_ES)],
})
class SpanishHost {
  readonly toast = injectMimiToast();
}

@Component({ selector: 'test-dialog-content', template: '<h2 mimiDialogTitle>Diálogo</h2>' })
class DialogContent {}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('injectMimiToast', () => {
  async function setup(providers: unknown[] = []) {
    TestBed.configureTestingModule({ providers: providers as never[] });
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => {
      for (let i = 0; i < 3; i++) {
        await wait(0);
        await fixture.whenStable();
      }
    };
    await settle();
    /** Espera a que se cumpla (los tiempos reales varían con la carga de la máquina). */
    const until = async (condition: () => boolean, timeout = 2000) => {
      const start = Date.now();
      while (!condition()) {
        if (Date.now() - start > timeout) throw new Error('No se cumplió a tiempo');
        await wait(20);
        await fixture.whenStable();
      }
    };
    const toast = fixture.componentInstance.toast;
    const toaster = () => document.querySelector<HTMLElement>('mimi-toaster');
    const items = () => Array.from(document.querySelectorAll<HTMLElement>('li[mimiToastItem]'));
    const open = () => items().filter((li) => li.dataset['state'] === 'open');
    const row = (li: HTMLElement) => li.querySelector<HTMLElement>('[data-slot="toast"]')!;
    const slot = (li: HTMLElement, name: string) =>
      li.querySelector<HTMLElement>(`[data-slot="${name}"]`);
    const list = () => toaster()!.querySelector<HTMLElement>('ol')!;
    const announcer = () => document.querySelector<HTMLElement>('.cdk-live-announcer-element');
    const key = (target: EventTarget, init: KeyboardEventInit) => {
      const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
      target.dispatchEvent(event);
      return event;
    };
    return {
      fixture,
      toast,
      settle,
      until,
      toaster,
      items,
      open,
      row,
      slot,
      list,
      announcer,
      key,
      icon: () => fixture.componentInstance.icon(),
      opener: (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
        '[data-test="opener"]',
      )!,
    };
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
    (document.activeElement as HTMLElement | null)?.blur?.();
  });

  it('la región de los anuncios existe desde injectMimiToast(); la pila, desde el primer toast', async () => {
    const { toast, settle, toaster, announcer, items } = await setup();
    expect(announcer()).not.toBeNull();
    expect(announcer()!.textContent).toBe('');
    expect(toaster()).toBeNull();
    toast('Evento creado');
    await settle();
    const host = toaster()!;
    expect(host.getAttribute('popover')).toBe('manual');
    expect(host.parentElement).toBe(document.body);
    expect(host.dataset['position']).toBe('bottom-right');
    expect(host.querySelector('section')!.getAttribute('aria-label')).toBe('Notifications (F8)');
    expect(items().length).toBe(1);
  });

  it('anuncia «Título. Descripción»: polite, assertive para error, y juntos si llegan seguidos', async () => {
    const { toast, announcer } = await setup();
    toast('Evento creado', { description: 'Viernes 3 de octubre' });
    await wait(150);
    expect(announcer()!.textContent).toBe('Evento creado. Viernes 3 de octubre');
    expect(announcer()!.getAttribute('aria-live')).toBe('polite');

    toast.error('No se pudo guardar');
    await wait(150);
    expect(announcer()!.getAttribute('aria-live')).toBe('assertive');

    toast.success('Uno');
    toast.info('Dos');
    await wait(150);
    expect(announcer()!.textContent).toBe('Uno Dos');
  });

  it('medidas del diseño: tarjeta, título, descripción, acción de 28px y X de 24px con nombre', async () => {
    const { toast, settle, items, row, slot } = await setup();
    toast('Conversación archivada', {
      description: 'Se movió a Archivados.',
      action: { label: 'Deshacer', onClick: () => undefined },
    });
    await settle();
    const li = items()[0];
    for (const cls of [
      'min-h-[68px]',
      'py-3',
      'pr-10',
      'pl-3.5',
      'gap-3',
      'border',
      'bg-[color:var(--mimi-toast-bg,var(--mimi-popover))]',
      'border-[color:var(--mimi-toast-border,var(--mimi-border))]',
      'shadow-[shadow:var(--mimi-toast-shadow,var(--mimi-shadow-popover))]',
      'rounded-[var(--mimi-toast-radius,var(--mimi-radius))]',
      'text-popover-foreground',
    ]) {
      expect(row(li).classList).toContain(cls);
    }
    expect(slot(li, 'title')!.classList).toContain('font-semibold');
    expect(slot(li, 'description')!.classList).toContain('text-muted-foreground');
    const action = slot(li, 'action')!;
    for (const cls of ['h-7', 'px-2.5', 'text-[12.5px]', 'font-semibold']) {
      expect(action.classList).toContain(cls);
    }
    const close = slot(li, 'close')!;
    expect(close.getAttribute('aria-label')).toBe('Close notification');
    for (const cls of ['size-6', 'top-2', 'right-2', 'active:scale-(--mimi-press-scale-sm)']) {
      expect(close.classList).toContain(cls);
    }
    expect(slot(li, 'icon')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('tonos: ícono y color de cada uno; sin tono, neutro y sin data-tone', async () => {
    const { toast, settle, items, slot } = await setup();
    toast('Neutro');
    toast.success('Éxito');
    toast.warning('Aviso');
    toast.info('Info');
    toast.error('Error');
    await settle();
    const [danger, info, warning, success, neutral] = items();
    expect(neutral.hasAttribute('data-tone')).toBe(false);
    expect(slot(neutral, 'icon')!.classList).toContain('text-foreground');
    expect(success.dataset['tone']).toBe('success');
    expect(slot(success, 'icon')!.classList).toContain('text-success-soft-foreground');
    expect(slot(warning, 'icon')!.classList).toContain('text-warning-soft-foreground');
    expect(slot(info, 'icon')!.classList).toContain('text-info-soft-foreground');
    expect(danger.dataset['tone']).toBe('danger');
    expect(slot(danger, 'icon')!.classList).toContain('text-destructive-soft-foreground');
  });

  it('variante solid con tono; sin tono se ve como la tarjeta; ícono propio o ninguno', async () => {
    const { toast, settle, items, row, slot, icon } = await setup();
    toast.success('Sólido', { variant: 'solid' });
    await settle();
    let li = items()[0];
    expect(li.dataset['variant']).toBe('solid');
    for (const cls of ['bg-success', 'text-success-foreground', 'shadow-success-hover']) {
      expect(row(li).classList).toContain(cls);
    }
    expect(slot(li, 'icon')!.classList).toContain('size-[34px]');

    toast('Sin tono', { variant: 'solid' });
    toast('Propio', { icon: icon() });
    toast('Sin ícono', { icon: false });
    await settle();
    const [none, own, neutral] = items();
    expect(neutral.dataset['variant']).toBe('outline');
    expect(slot(own, 'icon')!.querySelector('[data-test="svg"]')).not.toBeNull();
    expect(slot(none, 'icon')).toBeNull();
    li = neutral;
    expect(row(li).classList).toContain('border');
  });

  it('class va al toast y gana', async () => {
    const { toast, settle, items, row } = await setup();
    toast('Propio', { class: 'rounded-none border-0' });
    await settle();
    const classes = row(items()[0]).classList;
    expect(classes).toContain('rounded-none');
    expect(classes).not.toContain('rounded-[var(--mimi-toast-radius,var(--mimi-radius))]');
  });

  it('se cierra solo; con acción, Infinity o un valor enorme, no', async () => {
    const { toast, settle, until, open, items } = await setup();
    toast('Corto', { duration: 400 });
    toast('Sin fin', { duration: Infinity });
    toast('Enorme', { duration: 2 ** 40 });
    toast('Con acción', { action: { label: 'Ver', onClick: () => undefined } });
    await settle();
    expect(open().length).toBe(4);
    await until(() => !items().some((li) => li.textContent!.includes('Corto')));
    await wait(100);
    expect(open().map((li) => li.textContent!.trim().split(/\s+/)[0])).toEqual([
      'Con',
      'Enorme',
      'Sin',
    ]);
    expect(items().some((li) => li.textContent!.includes('Corto'))).toBe(false);
  });

  it('la acción se ejecuta y cierra; la X cierra; dismiss(id) y dismiss()', async () => {
    const { toast, settle, open, slot } = await setup();
    const clicks: string[] = [];
    toast('Archivado', { action: { label: 'Deshacer', onClick: () => clicks.push('deshacer') } });
    await settle();
    slot(open()[0], 'action')!.click();
    await settle();
    expect(clicks).toEqual(['deshacer']);
    expect(open().length).toBe(0);

    toast('X');
    await settle();
    slot(open()[0], 'close')!.click();
    await settle();
    expect(open().length).toBe(0);

    const id = toast('Uno', { duration: Infinity });
    toast('Dos', { duration: Infinity });
    toast('Tres', { duration: Infinity });
    await settle();
    toast.dismiss(id);
    await settle();
    expect(open().length).toBe(2);
    toast.dismiss();
    await settle();
    expect(open().length).toBe(0);
  });

  it('con el mismo id reemplaza al toast abierto', async () => {
    const { toast, settle, open, slot } = await setup();
    const id = toast('Subiendo…', { duration: Infinity });
    toast.success('Subido', { id });
    await settle();
    expect(open().length).toBe(1);
    expect(slot(open()[0], 'title')!.textContent).toBe('Subido');
    expect(open()[0].dataset['tone']).toBe('success');
  });

  it('el tiempo se detiene con el puntero, con el foco y con la pestaña oculta', async () => {
    const { toast, settle, until, open, list, items } = await setup();
    toast('Pausa', { duration: 80 });
    await settle();
    list().dispatchEvent(new MouseEvent('mouseenter'));
    await wait(200);
    expect(open().length).toBe(1);
    expect(document.querySelector('mimi-toaster')!.hasAttribute('data-expanded')).toBe(true);
    list().dispatchEvent(new MouseEvent('mouseleave'));
    await until(() => open().length === 0);

    toast('Foco', { duration: 80 });
    await settle();
    items()[0].dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    await wait(200);
    expect(open().length).toBe(1);
    items()[0].dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    await until(() => open().length === 0);

    const state = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState')!;
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    try {
      toast('Oculta', { duration: 80 });
      await settle();
      document.dispatchEvent(new Event('visibilitychange'));
      await wait(200);
      expect(open().length).toBe(1);
      Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
      await until(() => open().length === 0);
    } finally {
      delete (document as { visibilityState?: unknown }).visibilityState;
      Object.defineProperty(Document.prototype, 'visibilityState', state);
    }
  });

  it('pila: tres visibles colapsada (los de atrás inertes), cinco en total; sale el más viejo sin acción', async () => {
    const { toast, settle, open, items } = await setup();
    toast('Con acción', { action: { label: 'Ver', onClick: () => undefined } });
    for (const n of [1, 2, 3, 4, 5]) toast(`Toast ${n}`, { duration: Infinity });
    await settle();
    const titles = open().map((li) => li.querySelector('[data-slot="title"]')!.textContent);
    expect(titles).toEqual(['Toast 5', 'Toast 4', 'Toast 3', 'Toast 2', 'Con acción']);
    const visible = open();
    expect(visible[0].hasAttribute('data-front')).toBe(true);
    for (const li of visible.slice(0, 3)) expect(li.hasAttribute('inert')).toBe(false);
    for (const li of visible.slice(3)) {
      expect(li.hasAttribute('inert')).toBe(true);
      expect(li.style.opacity).toBe('0');
    }
    expect(visible[1].style.transform).toContain('var(--mimi-toast-stack-gap, 12px)');
    expect(visible[1].style.transform).toContain('scale(0.95)');
    expect(items().length).toBeGreaterThanOrEqual(5);
  });

  it('promesa: cargando y después éxito o error; devuelve la misma promesa', async () => {
    const { toast, settle, open, slot } = await setup();
    let resolve!: (value: number) => void;
    const pending = new Promise<number>((r) => (resolve = r));
    const returned = toast.promise(pending, {
      loading: 'Guardando…',
      success: (n) => ({ title: 'Guardado', description: `${n} archivos` }),
      error: 'No se pudo',
    });
    expect(returned).toBe(pending);
    await settle();
    expect(slot(open()[0], 'title')!.textContent).toBe('Guardando…');
    expect(
      open()[0].querySelector('.animate-\\[mimi-spin_0\\.8s_linear_infinite\\]'),
    ).not.toBeNull();
    resolve(3);
    await pending;
    await settle();
    expect(open().length).toBe(1);
    expect(slot(open()[0], 'title')!.textContent).toBe('Guardado');
    expect(open()[0].dataset['tone']).toBe('success');

    const failing = toast.promise(() => Promise.reject(new Error('red')), {
      loading: 'Guardando…',
      success: 'Guardado',
      error: (e) => `Falló: ${(e as Error).message}`,
    });
    await expect(failing).rejects.toThrow('red');
    await settle();
    expect(slot(open()[0], 'title')!.textContent).toBe('Falló: red');
    expect(open()[0].dataset['tone']).toBe('danger');
  });

  it('F8 lleva el foco al toast más nuevo y Escape lo devuelve; con modificadores o sin toasts, nada', async () => {
    const { toast, settle, items, opener, key } = await setup();
    opener.focus();
    expect(key(document.body, { key: 'F8' }).defaultPrevented).toBe(false);
    toast('Uno', { duration: Infinity });
    toast('Dos', { duration: Infinity });
    await settle();
    expect(key(document.body, { key: 'F8', ctrlKey: true }).defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(opener);
    expect(key(document.body, { key: 'F8' }).defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(items()[0]);
    const escape = key(items()[0], { key: 'Escape' });
    expect(escape.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(opener);
  });

  it('al cerrarse el toast con el foco, pasa al vecino; sin vecinos, vuelve a donde estaba', async () => {
    const { toast, settle, open, slot, opener, key } = await setup();
    opener.focus();
    toast('Uno', { duration: Infinity });
    toast('Dos', { duration: Infinity });
    await settle();
    key(document.body, { key: 'F8' });
    slot(open()[0], 'close')!.focus();
    slot(open()[0], 'close')!.click();
    await settle();
    expect(open().length).toBe(1);
    expect(document.activeElement).toBe(open()[0]);
    slot(open()[0], 'close')!.click();
    await settle();
    expect(document.activeElement).toBe(opener);
  });

  it('si la acción abre otro toast, el foco pasa al nuevo cuando se pinta', async () => {
    const { toast, settle, open, slot, opener, key } = await setup();
    opener.focus();
    toast('Falló', {
      action: {
        label: 'Reintentar',
        onClick: () => toast('Falló otra vez', { duration: Infinity }),
      },
    });
    await settle();
    key(document.body, { key: 'F8' });
    slot(open()[0], 'action')!.focus();
    slot(open()[0], 'action')!.click();
    await settle();
    expect(open().length).toBe(1);
    expect(document.activeElement).toBe(open()[0]);
  });

  it('textos: la región sale de la raíz y la X, de quien llama', async () => {
    const { settle, toaster } = await setup([provideMimiToastText(MIMI_TOAST_TEXT_ES)]);
    const spanish = TestBed.createComponent(SpanishHost);
    spanish.componentInstance.toast('Hola');
    await settle();
    expect(toaster()!.querySelector('section')!.getAttribute('aria-label')).toBe(
      'Notificaciones (F8)',
    );
    expect(toaster()!.querySelector('[data-slot="close"]')!.getAttribute('aria-label')).toBe(
      'Cerrar notificación',
    );
  });

  it('provideMimiToast: posición arriba (la pila crece hacia abajo) y otra tecla', async () => {
    const { toast, settle, toaster, items, key } = await setup([
      provideMimiToast({ position: 'top-center', hotkey: 'F6' }),
    ]);
    toast('Arriba', { duration: Infinity });
    toast('Otro', { duration: Infinity });
    await settle();
    const host = toaster()!;
    expect(host.dataset['position']).toBe('top-center');
    expect(host.classList).toContain('top-[var(--mimi-toast-offset,16px)]');
    expect(host.classList).toContain('-translate-x-1/2');
    expect(items()[0].classList).toContain('top-0');
    expect(items()[1].style.transform).toContain('translateY(calc(1 *');
    expect(host.querySelector('section')!.getAttribute('aria-label')).toBe('Notifications (F6)');
    expect(key(document.body, { key: 'F8' }).defaultPrevented).toBe(false);
    expect(key(document.body, { key: 'F6' }).defaultPrevented).toBe(true);
  });

  it('alarma: con un Dialog abierto, el CDK no oculta la pila ni la región de anuncios; Escape en un toast no cierra el diálogo', async () => {
    const { toast, settle, toaster, announcer, items, key } = await setup();
    toast('Antes', { duration: Infinity });
    await settle();
    TestBed.inject(MimiDialogService).open(DialogContent, { ariaLabel: 'Diálogo' });
    await settle();
    expect(document.querySelector('.cdk-dialog-container')).not.toBeNull();
    // El CDK salta los hermanos con popover o aria-live (detalle interno: spec 4).
    expect(toaster()!.getAttribute('aria-hidden')).toBeNull();
    expect(announcer()!.closest('[aria-hidden="true"]')).toBeNull();
    key(document.body, { key: 'F8' });
    expect(document.activeElement).toBe(items()[0]);
    key(items()[0], { key: 'Escape' });
    await settle();
    expect(document.querySelector('.cdk-dialog-container')).not.toBeNull();
    TestBed.inject(MimiDialogService).closeAll();
    await settle();
  });

  it('una sola pila por aplicación, que se quita al destruirse la raíz', async () => {
    const { toast, settle } = await setup();
    const other = TestBed.createComponent(SpanishHost);
    toast('Uno');
    other.componentInstance.toast('Dos');
    await settle();
    expect(document.querySelectorAll('mimi-toaster').length).toBe(1);
    TestBed.resetTestingModule();
    expect(document.querySelectorAll('mimi-toaster').length).toBe(0);
  });

  it('un ErrorHandler propio puede mostrar toasts (sin ciclo de inyección)', async () => {
    @Injectable()
    class ToastErrorHandler implements ErrorHandler {
      private readonly toast = injectMimiToast();
      handleError(error: unknown): void {
        this.toast.error(String(error));
      }
    }
    const { settle, open } = await setup([{ provide: ErrorHandler, useClass: ToastErrorHandler }]);
    TestBed.inject(ErrorHandler).handleError('Algo falló');
    await settle();
    expect(open()[0].textContent).toContain('Algo falló');
  });

  it('fuera del contexto de inyección falla con NG0203', () => {
    expect(() => injectMimiToast()).toThrowError(
      /NG0203: injectMimiToast\(\) can only be used within an injection context/,
    );
  });
});
