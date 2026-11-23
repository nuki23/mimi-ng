import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import {
  MIMI_OVERLAY_CONFIG_DEFAULT,
  MIMI_OVERLAY_TEXT_ES,
  mimiResolvePresentation,
  provideMimiOverlayText,
} from './overlay-config';
import { MimiSheetOverlay, type MimiSheetCloseReason, type MimiSheetSide } from './sheet';

@Component({
  imports: [MimiSheetOverlay],
  template: `
    <button data-test="trigger" (click)="open.set(true)">Abrir</button>
    <ng-template
      mimiSheet
      [mimiSheetOpen]="open()"
      [mimiSheetSide]="side()"
      [mimiSheetTitle]="title()"
      [mimiSheetBack]="back()"
      (mimiSheetClose)="onClose($event)"
      (mimiSheetBackClick)="backs.set(backs() + 1)"
      (mimiSheetDetach)="detached.set(detached() + 1)"
    >
      <ul data-test="list">
        <li><button data-test="first">Uno</button></li>
      </ul>
    </ng-template>
  `,
})
class Host {
  readonly open = signal(false);
  readonly side = signal<MimiSheetSide>('bottom');
  readonly title = signal<string | null>('País');
  readonly back = signal(false);
  readonly reasons: MimiSheetCloseReason[] = [];
  readonly backs = signal(0);
  readonly detached = signal(0);
  onClose(reason: MimiSheetCloseReason): void {
    this.reasons.push(reason);
    this.open.set(false);
  }
}

describe('MimiSheetOverlay (R.34)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function setup(providers: unknown[] = []): Promise<void> {
    TestBed.configureTestingModule({ providers: providers as never[] });
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    await settle();
  }

  const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
  const frame = () => document.querySelector<HTMLElement>('[data-mimi-sheet]');
  const slot = (name: string) => frame()?.querySelector<HTMLElement>(`[data-slot="${name}"]`);

  async function openSheet(): Promise<HTMLButtonElement> {
    const trigger = fixture.nativeElement.querySelector(
      '[data-test="trigger"]',
    ) as HTMLButtonElement;
    trigger.focus();
    host.open.set(true);
    await settle();
    return trigger;
  }

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  it('abre un diálogo modal con el título como nombre accesible', async () => {
    await setup();
    await openSheet();
    const el = dialog()!;
    expect(el).not.toBeNull();
    expect(el.getAttribute('aria-modal')).toBe('true');
    const title = slot('title')!;
    expect(title.textContent?.trim()).toBe('País');
    expect(el.getAttribute('aria-labelledby')).toBe(title.id);
    expect(frame()!.dataset['side']).toBe('bottom');
    expect(frame()!.dataset['state']).toBe('open');
    expect(slot('handle')).not.toBeNull();
    // El asa con contraste de 3:1 (WCAG 1.4.11; revisión de accesibilidad H3): muted-foreground.
    expect(slot('handle')!.querySelector('span')!.className).toContain(
      'bg-[color:var(--mimi-sheet-handle,var(--mimi-muted-foreground))]',
    );
    expect(frame()!.querySelector('[data-test="list"]')).not.toBeNull();
  });

  // 23/11/2026, error del usuario: con la hoja abierta, la barra de scroll de la página seguía a
  // la vista (la estrategia `block` del CDK) y la hoja derecha quedaba separada del borde. jsdom
  // no maqueta: se simula una barra de 15 px (clientWidth = innerWidth - 15).
  it('bloquea el scroll de la página sin barra ni salto, y lo devuelve al cerrar', async () => {
    const html = document.documentElement;
    const clientWidth = vi
      .spyOn(html, 'clientWidth', 'get')
      .mockReturnValue(window.innerWidth - 15);
    try {
      await setup();
      await openSheet();
      expect(html.style.overflow).toBe('hidden');
      expect(html.classList.contains('cdk-global-scrollblock')).toBe(false);
      // El ancho de la barra pasa a relleno: el contenido no salta.
      expect(html.style.paddingRight).toBe('15px');
      expect(html.style.getPropertyValue('--mimi-scrollbar-gap')).toBe('15px');
      host.open.set(false);
      await settle();
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(html.style.overflow).toBe('');
      expect(html.style.paddingRight).toBe('');
      expect(html.style.getPropertyValue('--mimi-scrollbar-gap')).toBe('');
    } finally {
      clientWidth.mockRestore();
    }
  });

  it('enfoca lo primero del contenido (no la X) y devuelve el foco al cerrar', async () => {
    await setup();
    const trigger = await openSheet();
    expect(document.activeElement).toBe(frame()!.querySelector('[data-test="first"]'));
    host.open.set(false);
    await settle();
    expect(dialog()).toBeNull();
    expect(host.detached()).toBe(1);
    expect(document.activeElement).toBe(trigger);
  });

  it('Escape, el fondo y la X piden cerrar, cada uno con su motivo', async () => {
    await setup();
    await openSheet();
    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    await openSheet();
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
    await settle();
    await openSheet();
    slot('close')!.click();
    await settle();
    expect(host.reasons).toEqual(['escape', 'backdrop', 'button']);
    expect(dialog()).toBeNull();
  });

  it('reabierta durante la salida, conserva el fondo y el toque en él (revisor D1)', async () => {
    await setup();
    await openSheet();
    const backdrop = document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!;
    host.open.set(false);
    fixture.detectChanges();
    // Durante la salida, el fondo se desvanece y no recibe toques, pero sigue montado.
    expect(backdrop.isConnected).toBe(true);
    expect(backdrop.classList).toContain('pointer-events-none');
    host.open.set(true);
    await settle();
    expect(document.querySelector('.cdk-overlay-backdrop')).toBe(backdrop);
    expect(backdrop.classList).not.toContain('pointer-events-none');
    backdrop.click();
    await settle();
    expect(host.reasons).toEqual(['backdrop']);
  });

  it('el id del título no choca con el del Sheet público (revisor M1)', async () => {
    await setup();
    await openSheet();
    expect(slot('title')!.id).toMatch(/^mimi-sheet-heading-\d+$/);
  });

  it('la X usa los textos de provideMimiOverlayText', async () => {
    await setup([provideMimiOverlayText(MIMI_OVERLAY_TEXT_ES)]);
    host.back.set(true);
    await openSheet();
    expect(slot('close')!.getAttribute('aria-label')).toBe('Cerrar');
    expect(slot('back')!.getAttribute('aria-label')).toBe('Atrás');
    slot('back')!.click();
    expect(host.backs()).toBe(1);
  });

  // 22/11/2026, pedido del usuario: en el teléfono, «Atrás» y la X miden 40px (para el dedo); en
  // escritorio, 30px como Dialog. jsdom no maqueta: se mira la clase; la medida, Playwright.
  it('«Atrás» y la X: 30px en escritorio y 40px por debajo de 640px', async () => {
    await setup();
    host.back.set(true);
    await openSheet();
    for (const name of ['back', 'close']) {
      const classes = slot(name)!.className.split(/\s+/);
      expect(classes, name).toContain('size-[30px]');
      expect(classes, name).toContain('max-sm:size-10');
    }
  });

  function drag(target: HTMLElement, from: number, to: number, ms: number): void {
    const init = (y: number, t: number) => ({
      clientX: 0,
      clientY: y,
      pointerId: 1,
      isPrimary: true,
      button: 0,
      bubbles: true,
      timeStamp: t,
    });
    target.setPointerCapture = () => undefined;
    const fire = (type: string, y: number, t: number) => {
      const event = new PointerEvent(type, init(y, t));
      Object.defineProperty(event, 'timeStamp', { value: t });
      target.dispatchEvent(event);
    };
    fire('pointerdown', from, 0);
    fire('pointermove', to, ms / 2);
    fire('pointerup', to, ms);
  }

  it('arrastrar el asa hacia abajo: sigue al dedo y, pasado el umbral, cierra', async () => {
    await setup();
    await openSheet();
    Object.defineProperty(frame()!, 'offsetHeight', { value: 400, configurable: true });
    // Poco y lento: vuelve.
    drag(slot('handle')!, 100, 150, 1000);
    await settle();
    expect(host.reasons).toEqual([]);
    expect(frame()!.style.translate).toBe('');
    // Más del 30 % del alto: cierra.
    drag(slot('handle')!, 100, 260, 1000);
    await settle();
    expect(host.reasons).toEqual(['drag']);
  });

  it('un arrastre rápido cierra aunque sea corto', async () => {
    await setup();
    await openSheet();
    Object.defineProperty(frame()!, 'offsetHeight', { value: 400, configurable: true });
    drag(slot('handle')!, 100, 160, 50);
    await settle();
    expect(host.reasons).toEqual(['drag']);
  });

  it('el alto sigue al visualViewport (el teclado del móvil)', async () => {
    const listeners: Record<string, () => void> = {};
    const viewport = {
      height: 780,
      offsetTop: 0,
      addEventListener: (type: string, fn: () => void) => (listeners[type] = fn),
      removeEventListener: () => undefined,
    };
    const original = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    Object.defineProperty(window, 'visualViewport', { value: viewport, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 780, configurable: true });
    try {
      await setup();
      await openSheet();
      expect(frame()!.style.getPropertyValue('--mimi-sheet-visible')).toBe('780px');
      expect(frame()!.style.getPropertyValue('--mimi-sheet-keyboard')).toBe('0px');
      viewport.height = 420; // se abre el teclado
      listeners['resize']();
      await settle();
      expect(frame()!.style.getPropertyValue('--mimi-sheet-visible')).toBe('420px');
      expect(frame()!.style.getPropertyValue('--mimi-sheet-keyboard')).toBe('360px');
    } finally {
      if (original) Object.defineProperty(window, 'visualViewport', original);
      else delete (window as { visualViewport?: unknown }).visualViewport;
    }
  });

  it.each<MimiSheetSide>(['left', 'right', 'full'])('lado %s: sin asa', async (side) => {
    await setup();
    host.side.set(side);
    await openSheet();
    expect(frame()!.dataset['side']).toBe(side);
    expect(slot('handle')).toBeNull();
  });
});

describe('mimiResolvePresentation (R.34)', () => {
  const view = (narrow: boolean) =>
    ({
      matchMedia: (query: string) => ({ matches: narrow && query === '(max-width: 639.98px)' }),
    }) as unknown as Window & typeof globalThis;

  it('auto: popover en escritorio y la móvil del componente por debajo de 640 px', () => {
    const config = MIMI_OVERLAY_CONFIG_DEFAULT;
    expect(mimiResolvePresentation('auto', 'sheet', config, view(false))).toBe('popover');
    expect(mimiResolvePresentation('auto', 'sheet', config, view(true))).toBe('sheet');
    expect(mimiResolvePresentation('auto', 'fullscreen', config, view(true))).toBe('fullscreen');
  });

  it('lo pedido gana; mobileBreakpoint 0 apaga el modo móvil; sin matchMedia, popover', () => {
    const config = MIMI_OVERLAY_CONFIG_DEFAULT;
    expect(mimiResolvePresentation('popover', 'sheet', config, view(true))).toBe('popover');
    expect(mimiResolvePresentation('sheet', 'fullscreen', config, view(false))).toBe('sheet');
    const off = { ...config, mobileBreakpoint: 0 };
    expect(mimiResolvePresentation('auto', 'sheet', off, view(true))).toBe('popover');
    const forced = { ...config, presentation: 'fullscreen' as const };
    expect(mimiResolvePresentation('auto', 'sheet', forced, view(false))).toBe('fullscreen');
    expect(mimiResolvePresentation('auto', 'sheet', config, null)).toBe('popover');
  });
});
