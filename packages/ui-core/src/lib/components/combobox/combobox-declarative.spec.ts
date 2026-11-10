import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiComboboxImports } from './combobox';

/** R.16: el Combobox con la misma API que Select: `<mimi-option>`, `<mimi-optgroup>`, `clearable`
 *  y el icono de limpiar o cargar en el sitio del chevron. */
@Component({
  imports: [MimiComboboxImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-combobox aria-label="País" [(value)]="value" [clearable]="true" [loading]="loading()">
      <mimi-option value="ar">Argentina</mimi-option>
      <mimi-optgroup label="Europa">
        <mimi-option value="es" hint="UE">España</mimi-option>
        <mimi-option value="fr" [disabled]="true">Francia</mimi-option>
      </mimi-optgroup>
    </mimi-combobox>
  `,
})
class Host {
  readonly value = signal<string | string[] | null>('es');
  readonly loading = signal(false);
}

describe('Combobox con la API de Select (R.16)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    return { fixture, el: fixture.nativeElement as HTMLElement, host: fixture.componentInstance };
  }
  const tick = () => new Promise((r) => setTimeout(r, 30));

  it('el campo muestra el texto de la opción elegida', async () => {
    const { el } = await setup();
    expect(el.querySelector<HTMLInputElement>('input')!.value).toBe('España');
  });

  it('el panel lista las opciones, el grupo y la opción deshabilitada', async () => {
    const { el, fixture } = await setup();
    el.querySelector<HTMLElement>('input')!.click();
    await tick();
    await fixture.whenStable();
    const options = Array.from(document.querySelectorAll('[role="option"]'));
    expect(options.length).toBe(3);
    expect(options[2].getAttribute('aria-disabled')).toBe('true');
    expect(document.body.textContent).toContain('Europa');
  });

  it('limpiar y cargando ocupan el sitio del chevron, y limpiar vacía el valor', async () => {
    const { el, fixture, host } = await setup();
    const slot = el.querySelector('[data-slot="end-icon"]')!;
    expect(slot.getAttribute('data-icon')).toBe('clear');
    host.loading.set(true);
    await fixture.whenStable();
    expect(slot.getAttribute('data-icon')).toBe('loading');
    host.loading.set(false);
    await fixture.whenStable();
    slot.querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    expect(host.value()).toBeNull();
    expect(slot.getAttribute('data-icon')).toBe('chevron');
  });
});
