import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiSelectImports } from './select';

/**
 * El anillo de foco del Select (informe del usuario, 12/11/2026): tras elegir con el ratón no se
 * queda; con el teclado sí sale. La caja lleva `data-focus-visible` según el origen del foco
 * (FocusMonitor del cdk), como `:focus-visible`.
 */
@Component({
  imports: [MimiSelectImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button data-test="before">Antes</button>
    <mimi-select aria-label="Talla" [(value)]="size">
      <mimi-option value="s">S</mimi-option>
      <mimi-option value="m">M</mimi-option>
      <mimi-option value="l">L</mimi-option>
    </mimi-select>
  `,
})
class Host {
  readonly size = signal<string | null>(null);
}

describe('Select: anillo de foco solo con el teclado', () => {
  const tick = (ms = 40) => new Promise((r) => setTimeout(r, ms));

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => {
      await fixture.whenStable();
      await tick();
      await fixture.whenStable();
    };
    await settle();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector<HTMLButtonElement>('button[role="combobox"]')!;
    const box = trigger.parentElement!;
    // Un mousedown real (buttons: 1, detail: 1): el cdk toma los de buttons o detail 0 por el
    // clic falso de un lector de pantalla, que cuenta como teclado.
    const mouse = (target: Element) => {
      target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, buttons: 1, detail: 1 }));
      target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      (target as HTMLElement).click();
    };
    const key = (target: Element, k: string) =>
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
      );
    return { fixture, host: fixture.componentInstance, el, trigger, box, mouse, key, settle };
  }

  afterEach(() => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  it('con el ratón: abre, elige y el foco vuelve al disparador sin anillo', async () => {
    const { host, trigger, box, mouse, settle } = await setup();
    mouse(trigger);
    await settle();
    expect(box.hasAttribute('data-focus-visible')).toBe(false);
    const option = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))[1];
    mouse(option);
    await settle();
    expect(host.size()).toBe('m');
    expect(document.activeElement).toBe(trigger);
    expect(box.hasAttribute('data-focus-visible')).toBe(false);
  });

  it('con el teclado: Tab al disparador y elegir con Enter dejan el anillo', async () => {
    const { el, host, trigger, box, key, settle } = await setup();
    const before = el.querySelector<HTMLButtonElement>('[data-test="before"]')!;
    before.focus();
    key(before, 'Tab');
    trigger.focus();
    await settle();
    expect(box.hasAttribute('data-focus-visible')).toBe(true);
    key(trigger, 'ArrowDown');
    await settle();
    key(trigger, 'ArrowDown');
    await settle();
    key(trigger, 'Enter');
    await settle();
    expect(host.size()).not.toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(box.hasAttribute('data-focus-visible')).toBe(true);
  });

  it('la caja pinta el anillo por data-focus-visible, no por :focus', async () => {
    const { box } = await setup();
    expect(box.className).toContain('data-[focus-visible]:ring-3');
    expect(box.className).not.toContain(':focus]:ring-3');
  });
});
