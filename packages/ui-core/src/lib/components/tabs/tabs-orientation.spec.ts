import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiTabsImports, type MimiTabsOrientation, type MimiTabsVariant } from './tabs';

/**
 * Tabs con orientación vertical (B.10). Las pruebas de antes (tabs.spec.ts) siguen sin tocar: lo
 * horizontal no cambia.
 */
@Component({
  imports: [MimiTabsImports],
  template: `
    <mimi-tabs
      [(value)]="value"
      [orientation]="orientation()"
      [variant]="variant()"
      aria-label="Ajustes"
    >
      <ng-template mimiTab="perfil" label="Perfil">Perfil</ng-template>
      <ng-template mimiTab="avisos" label="Avisos">Avisos</ng-template>
      <ng-template mimiTab="seguridad" label="Seguridad">Seguridad</ng-template>
    </mimi-tabs>
  `,
})
class Host {
  readonly value = signal<string | undefined>('perfil');
  readonly orientation = signal<MimiTabsOrientation>('vertical');
  readonly variant = signal<MimiTabsVariant>('underline');
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('MimiTabs: orientation (B.10)', { timeout: 20_000 }, () => {
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const host = root.querySelector<HTMLElement>('mimi-tabs')!;
    const tab = (value: string) =>
      root.querySelector<HTMLButtonElement>(`[role="tab"][data-value="${value}"]`)!;
    const tablist = () => root.querySelector<HTMLElement>('[role="tablist"]')!;
    const indicator = () => root.querySelector<HTMLElement>('[data-slot="indicator"]')!;
    const container = () => root.querySelector<HTMLElement>('[data-slot="list"]')!;
    const key = async (key: string) => {
      (document.activeElement as HTMLElement).dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
      );
      await settle(fixture);
    };
    return { fixture, h: fixture.componentInstance, host, tab, tablist, indicator, container, key };
  }

  it('vertical: aria-orientation, data-orientation, fila al lado del panel y filas iguales', async () => {
    const { host, tablist, container } = await setup();
    expect(tablist().getAttribute('aria-orientation')).toBe('vertical');
    expect(host.getAttribute('data-orientation')).toBe('vertical');
    expect(host.style.flexDirection).toBe('row');
    expect(tablist().classList).toContain(
      'grid-rows-[repeat(var(--mimi-tabs-count),minmax(0,1fr))]',
    );
    expect(container().classList).toContain('border-s');
    expect(container().classList).not.toContain('border-b');
    // El texto al inicio: justify-start reemplaza a justify-center (cn).
    const firstTab = tablist().querySelector('[role="tab"]')!;
    expect(firstTab.classList).toContain('justify-start');
    expect(firstTab.classList).not.toContain('justify-center');
  });

  it('vertical: ↑/↓ eligen; ←/→ no hacen nada; Inicio y Fin', async () => {
    const { h, tab, key } = await setup();
    tab('perfil').focus();
    await key('ArrowDown');
    expect(h.value()).toBe('avisos');
    await key('ArrowRight');
    expect(h.value()).toBe('avisos');
    await key('ArrowLeft');
    expect(h.value()).toBe('avisos');
    await key('ArrowUp');
    expect(h.value()).toBe('perfil');
    await key('End');
    expect(h.value()).toBe('seguridad');
    await key('Home');
    expect(h.value()).toBe('perfil');
  });

  it('el indicador se desplaza en vertical (underline: barra al inicio; pill: el fondo)', async () => {
    const { h, fixture, indicator, container } = await setup();
    expect(indicator().classList).toContain('translate-y-[calc(100%_*_var(--mimi-tabs-index))]');
    expect(indicator().classList).toContain('w-0.5');
    expect(indicator().classList).toContain('h-[calc(100%_/_var(--mimi-tabs-count))]');
    h.value.set('seguridad');
    await settle(fixture);
    expect(container().style.getPropertyValue('--mimi-tabs-index')).toBe('2');
    h.variant.set('pill');
    await settle(fixture);
    expect(indicator().classList).toContain('h-[calc((100%_-_8px)_/_var(--mimi-tabs-count))]');
    expect(indicator().classList).toContain('end-[4px]');
    expect(container().classList).not.toContain('max-w-[520px]');
  });

  it('cambia en vivo: a horizontal (←/→) y de vuelta a vertical (↑/↓)', async () => {
    const { h, fixture, tab, tablist, key, host } = await setup();
    h.orientation.set('horizontal');
    await settle(fixture);
    expect(tablist().getAttribute('aria-orientation')).toBe('horizontal');
    // En horizontal, la columna de siempre (con null, Angular la quitaba).
    expect(host.style.flexDirection).toBe('column');
    tab('perfil').focus();
    await key('ArrowRight');
    expect(h.value()).toBe('avisos');
    await key('ArrowDown');
    expect(h.value()).toBe('avisos');

    h.orientation.set('vertical');
    await settle(fixture);
    expect(tablist().getAttribute('aria-orientation')).toBe('vertical');
    tab('avisos').focus();
    await key('ArrowDown');
    expect(h.value()).toBe('seguridad');
    // La elegida sigue siendo la única con tabindex="0".
    const focusable = [...document.querySelectorAll('[role="tab"][tabindex="0"]')];
    expect(focusable).toEqual([tab('seguridad')]);
  });

  it('horizontal por defecto: sin data-orientation vertical ni dirección de fila', async () => {
    const { h, fixture, host, tablist } = await setup();
    h.orientation.set('horizontal');
    await settle(fixture);
    expect(host.getAttribute('data-orientation')).toBe('horizontal');
    expect(host.style.flexDirection).toBe('column');
    expect(host.style.alignItems).toBe('');
    expect(tablist().classList).toContain(
      'grid-cols-[repeat(var(--mimi-tabs-count),minmax(0,1fr))]',
    );
  });
});
