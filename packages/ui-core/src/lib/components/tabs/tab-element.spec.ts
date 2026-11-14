import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiTabsImports } from './tabs';

let created: string[] = [];

@Component({ selector: 'test-eager', template: '<p>contenido</p>' })
class Eager {
  constructor() {
    created.push('eager');
  }
}

@Component({ selector: 'test-lazy', template: '<p>perezoso</p>' })
class Lazy {
  constructor() {
    created.push('lazy');
  }
}

@Component({
  imports: [MimiTabsImports, Eager, Lazy],
  template: `
    <mimi-tabs [(value)]="value" aria-label="Secciones">
      <mimi-tab label="Cuenta"><p data-test="cuenta">Datos de la cuenta</p></mimi-tab>
      <mimi-tab label="Facturación" value="billing" [count]="2"><test-eager /></mimi-tab>
      <mimi-tab label="Desactivada" [disabled]="true">No</mimi-tab>
      <ng-template mimiTab="lazy" label="Perezosa"><test-lazy /></ng-template>
    </mimi-tabs>
  `,
})
class Host {
  readonly value = signal<string | undefined>(undefined);
}

/** R.17: `<mimi-tab label>` como atajo de `ng-template[mimiTab]`; las dos formas conviven. */
describe('mimi-tab (R.17)', () => {
  async function setup() {
    created = [];
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const tabs = () => [...el.querySelectorAll<HTMLElement>('[role="tab"]')];
    return { fixture, host: fixture.componentInstance, el, tabs };
  }

  it('las pestañas salen en el orden del DOM, con el valor por defecto del label', async () => {
    const { tabs, host } = await setup();
    expect(tabs().map((t) => t.textContent!.trim().replace(/\s+/g, ' '))).toEqual([
      'Cuenta',
      'Facturación2',
      'Desactivada',
      'Perezosa',
    ]);
    // La primera sin valor dado: el label en minúsculas ('cuenta'); la elegida por defecto.
    expect(host.value() ?? 'cuenta').toBe('cuenta');
    expect(tabs()[0].getAttribute('aria-selected')).toBe('true');
  });

  it('el contenido de un elemento se ve al elegir su pestaña y el de la plantilla es perezoso', async () => {
    const { tabs, fixture, el } = await setup();
    expect(el.querySelector('[data-test="cuenta"]')?.textContent).toContain('Datos de la cuenta');
    // Contenido ansioso: el componente de dentro de un mimi-tab se crea con la página.
    expect(created).toContain('eager');
    // La plantilla no se crea hasta que se elige.
    expect(created).not.toContain('lazy');
    tabs()[3].click();
    await fixture.whenStable();
    expect(created).toContain('lazy');
  });

  it('con value dado, [(value)] usa ese valor; una pestaña deshabilitada no se elige', async () => {
    const { tabs, fixture, host } = await setup();
    tabs()[1].click();
    await fixture.whenStable();
    expect(host.value()).toBe('billing');
    tabs()[2].click();
    await fixture.whenStable();
    expect(host.value()).toBe('billing');
  });
});
