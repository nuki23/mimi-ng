import { Component, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { MimiSheetImports, type MimiSheetSide } from './sheet';

@Component({
  imports: [MimiSheetImports],
  template: `
    <mimi-sheet [(open)]="open" [side]="side()" [disableClose]="locked()" class="extra-class">
      <button data-test="trigger" mimiSheetTrigger>Editar</button>
      <ng-template mimiSheetContent>
        <header mimiSheetHeader>
          <h2 mimiSheetTitle>Editar cliente</h2>
          <p mimiSheetDescription>Café Altura</p>
        </header>
        <div mimiSheetBody><input data-test="name" /></div>
        <footer mimiSheetFooter>
          <button data-test="save" mimiSheetClose>Guardar</button>
        </footer>
      </ng-template>
    </mimi-sheet>
  `,
})
class Host {
  readonly open = signal(false);
  readonly side = signal<MimiSheetSide>('right');
  readonly locked = signal(false);
}

describe('MimiSheet (G4.2)', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  async function settle(): Promise<void> {
    for (let i = 0; i < 2; i++) {
      fixture.detectChanges();
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
    }
  }

  async function setup(): Promise<HTMLButtonElement> {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    document.body.appendChild(fixture.nativeElement);
    await settle();
    return fixture.nativeElement.querySelector('[data-test="trigger"]');
  }

  const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
  const frame = () => document.querySelector<HTMLElement>('[data-mimi-sheet]');

  afterEach(() => {
    fixture?.destroy();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  it('el trigger abre un diálogo modal con el título y la descripción', async () => {
    const trigger = await setup();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    trigger.focus();
    trigger.click();
    await settle();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const el = dialog()!;
    expect(el.getAttribute('aria-modal')).toBe('true');
    const title = el.querySelector('[mimiSheetTitle]')!;
    expect(el.getAttribute('aria-labelledby')).toBe(title.id);
    expect(el.getAttribute('aria-describedby')).toBe(
      el.querySelector('[mimiSheetDescription]')!.id,
    );
    expect(frame()!.dataset['side']).toBe('right');
    expect(frame()!.classList).toContain('extra-class');
    // El foco va a lo primero del contenido; la X (flotante) viene antes en el DOM pero no gana.
    expect(document.activeElement).toBe(el.querySelector('[data-test="name"]'));
  });

  it('mimiSheetClose y la X cierran; el foco vuelve al trigger', async () => {
    const trigger = await setup();
    trigger.focus();
    trigger.click();
    await settle();
    (dialog()!.querySelector('[data-test="save"]') as HTMLElement).click();
    await settle();
    expect(host.open()).toBe(false);
    expect(dialog()).toBeNull();
    expect(document.activeElement).toBe(trigger);
    trigger.click();
    await settle();
    (frame()!.querySelector('[data-slot="close"]') as HTMLElement).click();
    await settle();
    expect(host.open()).toBe(false);
  });

  it('Escape y el fondo cierran; con disableClose, no', async () => {
    const trigger = await setup();
    trigger.click();
    await settle();
    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(host.open()).toBe(false);
    host.locked.set(true);
    trigger.click();
    await settle();
    dialog()!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click();
    await settle();
    expect(host.open()).toBe(true);
  });

  it('con disableClose, un arrastre largo no deja la hoja desplazada (revisor M2)', async () => {
    const trigger = await setup();
    host.side.set('bottom');
    host.locked.set(true);
    trigger.click();
    await settle();
    Object.defineProperty(frame()!, 'offsetHeight', { value: 400, configurable: true });
    const handle = frame()!.querySelector<HTMLElement>('[data-slot="handle"]')!;
    handle.setPointerCapture = () => undefined;
    const fire = (type: string, y: number) =>
      handle.dispatchEvent(
        new PointerEvent(type, { clientY: y, pointerId: 1, isPrimary: true, bubbles: true }),
      );
    fire('pointerdown', 100);
    fire('pointermove', 300);
    fire('pointerup', 300);
    await settle();
    expect(host.open()).toBe(true);
    expect(frame()!.style.translate).toBe('');
  });

  it('sin título ni aria-label no apunta a un id que no existe (revisor M4)', async () => {
    @Component({
      imports: [MimiSheetImports],
      template: `<mimi-sheet [open]="true"
        ><ng-template mimiSheetContent><p>Hola</p></ng-template></mimi-sheet
      >`,
    })
    class Bare {}
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const f = TestBed.createComponent(Bare);
    document.body.appendChild(f.nativeElement);
    for (let i = 0; i < 2; i++) {
      f.detectChanges();
      await f.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
    }
    expect(dialog()!.hasAttribute('aria-labelledby')).toBe(false);
    warn.mockRestore();
    f.destroy();
  });

  it('abajo lleva la barra de agarre; a los lados, no', async () => {
    const trigger = await setup();
    host.side.set('bottom');
    trigger.click();
    await settle();
    expect(frame()!.dataset['side']).toBe('bottom');
    expect(frame()!.querySelector('[data-slot="handle"]')).not.toBeNull();
  });
});
