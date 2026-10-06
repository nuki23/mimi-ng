import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiPopoverImports, type MimiPopoverAlign, type MimiPopoverSide } from './popover';

@Component({
  imports: [MimiPopoverImports],
  template: `
    <button data-test="before">Antes</button>
    <mimi-popover
      [(open)]="open"
      [side]="side()"
      [align]="align()"
      [arrow]="arrow()"
      [class]="extra()"
      [label]="label()"
    >
      <button data-test="trigger" mimiPopoverTrigger>Invitar</button>
      <ng-template mimiPopoverContent>
        @if (withTitle()) {
          <h4 mimiPopoverTitle>Invitar al proyecto</h4>
          <p mimiPopoverDescription>Recibirá un enlace por correo.</p>
        }
        <input data-test="email" aria-label="Correo" />
        <button data-test="close" mimiPopoverClose>Enviar</button>
      </ng-template>
    </mimi-popover>
    <button data-test="after">Después</button>
  `,
})
class Host {
  readonly open = signal(false);
  readonly side = signal<MimiPopoverSide>('bottom');
  readonly align = signal<MimiPopoverAlign>('center');
  readonly arrow = signal(true);
  readonly extra = signal('');
  readonly label = signal('');
  readonly withTitle = signal(true);
}

/** El cierre espera la animación (en jsdom no hay) en una microtarea después del render. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
};

describe('MimiPopover', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    document.body.appendChild(root);
    const trigger = root.querySelector<HTMLButtonElement>('[data-test=trigger]')!;
    const panel = () => document.querySelector<HTMLElement>('[role=dialog]');
    const open = async () => {
      trigger.click();
      await settle(fixture);
    };
    return { fixture, host: fixture.componentInstance, root, trigger, panel, open };
  }

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((c) => c.remove()));

  it('cerrado: el trigger lleva aria-haspopup y aria-expanded, sin aria-controls ni panel', async () => {
    const { trigger, panel, root } = await setup();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.hasAttribute('aria-controls')).toBe(false);
    expect(trigger.dataset['state']).toBe('closed');
    expect(root.querySelector('mimi-popover')!.getAttribute('data-state')).toBe('closed');
    expect(panel()).toBeNull();
  });

  it('el clic en el trigger abre: role="dialog" con aria-controls, aria-expanded y [(open)]', async () => {
    const { trigger, panel, open, host } = await setup();
    await open();
    expect(host.open()).toBe(true);
    expect(panel()).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel()!.id);
    expect(panel()!.dataset['state']).toBe('open');
    expect(trigger.dataset['state']).toBe('open');
  });

  it('el clic en el trigger abierto cierra (no cuenta como clic fuera)', async () => {
    const { panel, open, host } = await setup();
    await open();
    await open();
    expect(host.open()).toBe(false);
    expect(panel()).toBeNull();
  });

  it('nombre accesible: mimiPopoverTitle (aria-labelledby) y mimiPopoverDescription', async () => {
    const { panel, open } = await setup();
    await open();
    const title = panel()!.querySelector('[mimiPopoverTitle]')!;
    const description = panel()!.querySelector('[mimiPopoverDescription]')!;
    expect(panel()!.getAttribute('aria-labelledby')).toBe(title.id);
    expect(panel()!.getAttribute('aria-describedby')).toBe(description.id);
    expect(panel()!.hasAttribute('aria-label')).toBe(false);
    expect(title.className).toContain('font-bold');
    expect(description.className).toContain('text-muted-foreground');
  });

  it('label="…" da el aria-label y le gana al título', async () => {
    const { fixture, panel, open, host } = await setup();
    host.label.set('Invitar');
    await settle(fixture);
    await open();
    expect(panel()!.getAttribute('aria-label')).toBe('Invitar');
    expect(panel()!.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('sin nombre accesible avisa en modo desarrollo', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { fixture, open, host } = await setup();
    host.withTitle.set(false);
    await settle(fixture);
    await open();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no tiene nombre accesible'));
    warn.mockRestore();
  });

  it('al abrir, el foco entra al panel', async () => {
    const { panel, open } = await setup();
    await open();
    expect(panel()!.contains(document.activeElement)).toBe(true);
  });

  it('Escape cierra y el foco vuelve al trigger', async () => {
    const { fixture, trigger, panel, open, host } = await setup();
    await open();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle(fixture);
    expect(host.open()).toBe(false);
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('el clic fuera cierra', async () => {
    const { fixture, root, panel, open, host } = await setup();
    await open();
    const outside = root.querySelector<HTMLElement>('[data-test=after]')!;
    outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    outside.click();
    await settle(fixture);
    expect(host.open()).toBe(false);
    expect(panel()).toBeNull();
  });

  it('el clic dentro no cierra', async () => {
    const { fixture, panel, open, host } = await setup();
    await open();
    const email = panel()!.querySelector<HTMLElement>('[data-test=email]')!;
    email.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    email.click();
    await settle(fixture);
    expect(host.open()).toBe(true);
  });

  it('mimiPopoverClose cierra y devuelve el foco al trigger', async () => {
    const { fixture, trigger, panel, open, host } = await setup();
    await open();
    const close = panel()!.querySelector<HTMLButtonElement>('[data-test=close]')!;
    close.focus();
    close.click();
    await settle(fixture);
    expect(host.open()).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('controlado: abre y cierra desde [(open)]', async () => {
    const { fixture, panel, host, trigger } = await setup();
    host.open.set(true);
    await settle(fixture);
    expect(panel()).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    host.open.set(false);
    await settle(fixture);
    expect(panel()).toBeNull();
  });

  it('lado y alineación en data-*', async () => {
    const { fixture, root, panel, open, host } = await setup();
    host.side.set('top');
    host.align.set('start');
    await settle(fixture);
    const popover = root.querySelector('mimi-popover')!;
    expect(popover.getAttribute('data-side')).toBe('top');
    expect(popover.getAttribute('data-align')).toBe('start');
    await open();
    expect(panel()!.dataset['align']).toBe('start');
    expect(['top', 'bottom', 'left', 'right']).toContain(panel()!.dataset['side']);
  });

  it('flecha decorativa por defecto (aria-hidden, sin foco); arrow=false la quita', async () => {
    const { fixture, panel, open, host } = await setup();
    await open();
    const arrow = panel()!.querySelector('span[aria-hidden="true"]')!;
    expect(arrow).not.toBeNull();
    expect(arrow.hasAttribute('tabindex')).toBe(false);
    expect(arrow.getAttribute('data-side')).toBe(panel()!.dataset['side']);
    host.open.set(false);
    host.arrow.set(false);
    await settle(fixture);
    await open();
    expect(panel()!.querySelector('span[aria-hidden="true"]')).toBeNull();
  });

  it('class de mimi-popover se mezcla con las del panel (gana la del usuario)', async () => {
    const { fixture, panel, open, host } = await setup();
    host.extra.set('w-80 p-2 shadow-none rounded-none border-[color:var(--x)]');
    await settle(fixture);
    await open();
    const classes = panel()!.className.split(' ');
    expect(classes).toEqual(expect.arrayContaining(['w-80', 'p-2', 'shadow-none', 'rounded-none']));
    expect(classes).not.toContain('w-[300px]');
    expect(classes).not.toContain('p-[var(--mimi-popover-padding,16px)]');
    expect(classes).not.toContain(
      'shadow-[shadow:var(--mimi-popover-shadow,var(--mimi-shadow-popover))]',
    );
    expect(classes).not.toContain('rounded-[var(--mimi-popover-radius,var(--mimi-radius))]');
    expect(classes).not.toContain('border-[color:var(--mimi-popover-border,var(--mimi-border))]');
  });

  it('class y label estáticos van al panel, no al host', async () => {
    @Component({
      imports: [MimiPopoverImports],
      template: `
        <mimi-popover [open]="true" class="w-96 text-lg" label="Prueba">
          <button mimiPopoverTrigger>Abrir</button>
          <ng-template mimiPopoverContent>Hola</ng-template>
        </mimi-popover>
      `,
    })
    class StaticHost {}
    const fixture = TestBed.createComponent(StaticHost);
    await settle(fixture);
    const panel = document.querySelector<HTMLElement>('[role=dialog]')!;
    expect(panel.className.split(' ')).toEqual(expect.arrayContaining(['w-96', 'text-lg']));
    expect(panel.className).not.toContain('w-[300px]');
    expect(panel.getAttribute('aria-label')).toBe('Prueba');
    // Si quedara en el host (display: contents), text-lg se heredaría al trigger.
    const host = (fixture.nativeElement as HTMLElement).querySelector('mimi-popover')!;
    expect(host.hasAttribute('class')).toBe(false);
    fixture.destroy();
  });

  /*
   * Alarma, no garantía: la guía del CDK pide importar @angular/cdk/overlay-prebuilt.css y la CLI
   * lo agrega (spec 4.3). Hoy el CDK además carga esos estilos solo al abrir el primer overlay;
   * si una versión nueva deja de hacerlo, esta prueba avisa para revisar la spec.
   */
  it('alarma: el CDK sigue cargando solo los estilos del overlay', async () => {
    const { open } = await setup();
    await open();
    const css = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n');
    expect(css).toContain('.cdk-overlay-pane');
  });
});
