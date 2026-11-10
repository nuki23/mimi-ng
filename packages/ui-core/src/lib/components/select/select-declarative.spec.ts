import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiSelectImports } from './select';

/** R.15: `<mimi-option>` y `<mimi-optgroup>` como alternativa a `[options]`, y los iconos de
 *  limpiar y cargar en el sitio del chevron. */
@Component({
  imports: [MimiSelectImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-select
      data-test="s"
      aria-label="País"
      [(value)]="value"
      [clearable]="true"
      [loading]="loading()"
    >
      <mimi-option value="ar">Argentina</mimi-option>
      <mimi-optgroup label="Europa">
        <mimi-option value="es" hint="UE">España</mimi-option>
        <mimi-option value="fr" [disabled]="true">Francia</mimi-option>
      </mimi-optgroup>
    </mimi-select>
  `,
})
class Host {
  readonly value = signal<string | null>('es');
  readonly loading = signal(false);
}

describe('Select con mimi-option (R.15)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, el, host: fixture.componentInstance };
  }
  const tick = () => new Promise((r) => setTimeout(r, 30));

  it('el disparador muestra el texto de la opción elegida', async () => {
    const { el } = await setup();
    expect(el.querySelector('[role="combobox"]')!.textContent).toContain('España');
  });

  it('el panel lista las opciones, el grupo, el hint y la opción deshabilitada', async () => {
    const { el, fixture } = await setup();
    el.querySelector<HTMLElement>('[role="combobox"]')!.click();
    await tick();
    await fixture.whenStable();
    const options = Array.from(document.querySelectorAll('[role="option"]'));
    expect(options.map((o) => o.textContent!.trim())).toEqual([
      expect.stringContaining('Argentina'),
      expect.stringContaining('España'),
      expect.stringContaining('Francia'),
    ]);
    expect(options[2].getAttribute('aria-disabled')).toBe('true');
    expect(document.querySelector('[role="group"]')).not.toBeNull();
    expect(document.body.textContent).toContain('Europa');
  });

  it('limpiar y el spinner ocupan el sitio del chevron (un solo icono final a la vez)', async () => {
    const { el, fixture, host } = await setup();
    const slot = el.querySelector('[data-slot="end-icon"]')!;
    expect(slot.getAttribute('data-icon')).toBe('clear');
    host.loading.set(true);
    await fixture.whenStable();
    expect(slot.getAttribute('data-icon')).toBe('loading');
    host.loading.set(false);
    host.value.set(null);
    await fixture.whenStable();
    expect(slot.getAttribute('data-icon')).toBe('chevron');
  });
});
