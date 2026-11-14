import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiTabsImports } from './tabs';

/**
 * Revisión independiente de la 0.6.0, sospecha 1: el valor por defecto de `<mimi-tab>` salía del
 * label. Un label sin letras latinas daba '' (la pestaña no se podía elegir) y dos labels que
 * normalizan igual daban valores repetidos.
 */
@Component({
  imports: [MimiTabsImports],
  template: `
    <mimi-tabs [(value)]="value" aria-label="Secciones">
      <mimi-tab label="日本">uno</mimi-tab>
      <mimi-tab label="🔥">dos</mimi-tab>
      <mimi-tab label="Facturación">tres</mimi-tab>
      <mimi-tab label="Facturacion">cuatro</mimi-tab>
      <mimi-tab label="Facturación">cinco</mimi-tab>
      <mimi-tab label="Con valor" value="fijo">seis</mimi-tab>
    </mimi-tabs>
  `,
})
class Host {
  readonly value = signal<string | undefined>(undefined);
}

describe('<mimi-tab>: valor por defecto válido y único', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const tabs = () => [
      ...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]'),
    ];
    return { fixture, host: fixture.componentInstance, tabs };
  }

  it('un label sin letras latinas usa el índice y se puede elegir', async () => {
    const { tabs, fixture, host } = await setup();
    tabs()[0].click();
    await fixture.whenStable();
    expect(host.value()).toBe('0');
    tabs()[1].click();
    await fixture.whenStable();
    expect(host.value()).toBe('1');
  });

  it('los valores repetidos llevan un sufijo y cada pestaña se elige por separado', async () => {
    const { tabs, fixture, host } = await setup();
    const picked: (string | undefined)[] = [];
    for (const i of [2, 3, 4, 5]) {
      tabs()[i].click();
      await fixture.whenStable();
      picked.push(host.value());
    }
    expect(picked).toEqual(['facturacion', 'facturacion-2', 'facturacion-3', 'fijo']);
  });

  it('avisa en desarrollo cuando falta value y el valor sale del índice o lleva sufijo', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await setup();
    const calls = warn.mock.calls.map(([m]) => String(m)).filter((m) => m.includes('Tabs'));
    warn.mockRestore();
    expect(calls.length).toBe(1);
    expect(calls[0]).toContain('value');
  });
});
