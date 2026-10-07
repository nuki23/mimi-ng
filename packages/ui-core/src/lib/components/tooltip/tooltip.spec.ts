import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MIMI_TOOLTIP_SKIP_DELAY, MimiTooltip, type MimiTooltipSide } from './tooltip';

@Component({
  imports: [MimiTooltip],
  template: `
    <button
      data-test="copy"
      mimiTooltip="Copiar"
      mimiTooltipShortcut="⌘C"
      [mimiTooltipDelay]="delay()"
      [mimiTooltipDisabled]="disabled()"
      [mimiTooltipSide]="side()"
      [mimiTooltipArrow]="arrow()"
      [mimiTooltipClass]="extra()"
      aria-describedby="ayuda"
    >
      Copiar al portapapeles
    </button>
    <button data-test="icon" aria-label="Ajustes" mimiTooltip="Ajustes" [mimiTooltipDelay]="0">
      ⚙
    </button>
    <button data-test="token" mimiTooltip="Del tema" style="--mimi-tooltip-delay: 0ms">T</button>
    <button data-test="slow" mimiTooltip="Lento" [mimiTooltipDelay]="10000">L</button>
    <p id="ayuda">Ayuda</p>
    <span data-test="outside">fuera</span>
  `,
})
class Host {
  readonly delay = signal<number | undefined>(0);
  readonly disabled = signal(false);
  readonly side = signal<MimiTooltipSide>('top');
  readonly arrow = signal(true);
  readonly extra = signal('');
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
};

/** El último cierre de otro tooltip abre el siguiente sin retraso: cada prueba empieza lejos. */
let now = 1_000_000;

describe('MimiTooltip', () => {
  beforeEach(() => {
    now += 60_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => c.remove());
  });

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    await settle(fixture);
    const button = (name: string) => root.querySelector<HTMLElement>(`[data-test=${name}]`)!;
    const tooltip = () => document.querySelector<HTMLElement>('[role=tooltip]');
    const hover = async (el: HTMLElement, pointerType = 'mouse') => {
      el.dispatchEvent(new PointerEvent('pointerenter', { pointerType }));
      await settle(fixture);
    };
    const leave = async (el: HTMLElement, relatedTarget: EventTarget | null) => {
      el.dispatchEvent(new PointerEvent('pointerleave', { pointerType: 'mouse', relatedTarget }));
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, root, button, tooltip, hover, leave };
  }

  it('con el puntero: role="tooltip" con el texto, el atajo y aria-describedby', async () => {
    const { button, tooltip, hover } = await setup();
    const copy = button('copy');
    expect(tooltip()).toBeNull();
    await hover(copy);
    expect(tooltip()!.textContent).toContain('Copiar');
    expect(tooltip()!.querySelector('.font-mono')!.textContent).toBe('⌘C');
    expect(tooltip()!.dataset['state']).toBe('open');
    // Conserva el aria-describedby que ya tenía.
    expect(copy.getAttribute('aria-describedby')).toBe(`ayuda ${tooltip()!.id}`);
    expect(copy.dataset['tooltipState']).toBe('open');
  });

  it('al cerrarse quita su id de aria-describedby', async () => {
    const { root, button, tooltip, hover, leave } = await setup();
    await hover(button('copy'));
    await leave(button('copy'), root.querySelector('[data-test=outside]'));
    expect(button('copy').getAttribute('aria-describedby')).toBe('ayuda');
    expect(tooltip()).toBeNull();
  });

  it('espera el retraso antes de abrir', async () => {
    const { fixture, host, button, tooltip, hover } = await setup();
    host.delay.set(80);
    await settle(fixture);
    await hover(button('copy'));
    expect(tooltip()).toBeNull();
    await new Promise((r) => setTimeout(r, 120));
    await settle(fixture);
    expect(tooltip()).not.toBeNull();
  });

  it('sin mimiTooltipDelay usa --mimi-tooltip-delay', async () => {
    const { button, tooltip, hover } = await setup();
    await hover(button('token'));
    expect(tooltip()!.textContent).toContain('Del tema');
  });

  it('en pantallas táctiles no se muestra', async () => {
    const { button, tooltip, hover } = await setup();
    await hover(button('copy'), 'touch');
    expect(tooltip()).toBeNull();
  });

  it('con el foco de teclado se muestra y con blur se oculta', async () => {
    const { fixture, button, tooltip } = await setup();
    button('copy').focus();
    await settle(fixture);
    expect(tooltip()).not.toBeNull();
    button('copy').blur();
    await settle(fixture);
    expect(tooltip()).toBeNull();
  });

  it('Escape lo cierra sin mover el foco', async () => {
    const { fixture, button, tooltip } = await setup();
    button('copy').focus();
    await settle(fixture);
    expect(tooltip()).not.toBeNull();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle(fixture);
    expect(tooltip()).toBeNull();
    expect(document.activeElement).toBe(button('copy'));
  });

  it('sigue abierto si el puntero pasa del trigger al tooltip, y de vuelta', async () => {
    const { root, button, tooltip, hover, leave } = await setup();
    await hover(button('copy'));
    const panel = tooltip()!;
    await leave(button('copy'), panel);
    expect(tooltip()).not.toBeNull();
    await leave(panel, button('copy'));
    expect(tooltip()).not.toBeNull();
    await leave(panel, root.querySelector('[data-test=outside]'));
    expect(tooltip()).toBeNull();
  });

  it('al pulsar el trigger se oculta', async () => {
    const { fixture, button, tooltip, hover } = await setup();
    await hover(button('copy'));
    button('copy').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    await settle(fixture);
    expect(tooltip()).toBeNull();
  });

  it('si el texto es igual al aria-label, no agrega aria-describedby', async () => {
    const { button, tooltip, hover } = await setup();
    await hover(button('icon'));
    expect(tooltip()!.textContent).toContain('Ajustes');
    expect(button('icon').hasAttribute('aria-describedby')).toBe(false);
  });

  it('deshabilitado no se muestra, y deshabilitarlo lo oculta', async () => {
    const { fixture, host, root, button, tooltip, hover, leave } = await setup();
    await hover(button('copy'));
    host.disabled.set(true);
    await settle(fixture);
    expect(tooltip()).toBeNull();
    await leave(button('copy'), root.querySelector('[data-test=outside]'));
    now += 60_000;
    await hover(button('copy'));
    expect(tooltip()).toBeNull();
  });

  it('salto sin retraso: si otro se cerró hace menos de 300 ms, abre enseguida', async () => {
    const { root, button, tooltip, hover, leave } = await setup();
    const outside = root.querySelector('[data-test=outside]');
    await hover(button('icon'));
    await leave(button('icon'), outside);
    // El de 10 s abre al instante porque «Ajustes» se acaba de cerrar.
    now += MIMI_TOOLTIP_SKIP_DELAY - 50;
    await hover(button('slow'));
    expect(tooltip()!.textContent).toContain('Lento');
    await leave(button('slow'), outside);
    // Pasado el margen, vuelve a esperar su retraso.
    now += MIMI_TOOLTIP_SKIP_DELAY + 50;
    await hover(button('slow'));
    expect(tooltip()).toBeNull();
  });

  it('lado, flecha decorativa y class propio', async () => {
    const { fixture, host, button, tooltip, hover } = await setup();
    host.side.set('bottom');
    host.extra.set('max-w-40 px-4');
    await settle(fixture);
    await hover(button('copy'));
    const panel = tooltip()!;
    expect(['top', 'bottom', 'left', 'right']).toContain(panel.dataset['side']);
    const arrow = panel.querySelector('span[aria-hidden="true"]')!;
    expect(arrow).not.toBeNull();
    expect(arrow.hasAttribute('tabindex')).toBe(false);
    const classes = panel.className.split(' ');
    expect(classes).toEqual(expect.arrayContaining(['max-w-40', 'px-4']));
    expect(classes).not.toContain('px-2.5');
    expect(classes).not.toContain('max-w-[calc(100vw_-_16px)]');
  });

  it('sin flecha con mimiTooltipArrow=false', async () => {
    const { fixture, host, button, tooltip, hover } = await setup();
    host.arrow.set(false);
    await settle(fixture);
    await hover(button('copy'));
    expect(tooltip()!.querySelector('span[aria-hidden="true"]')).toBeNull();
  });
});
