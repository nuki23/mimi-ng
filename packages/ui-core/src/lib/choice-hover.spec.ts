import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiSwitch } from '@/components/ui/switch';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';

/**
 * Hover sutil de los controles de elegir (13/11/2026), con los tokens de los campos: el borde de
 * la casilla se oscurece (`--mimi-input-border-hover`), la pista del interruptor se intensifica y
 * la opción no elegida del grupo toma un fondo suave. Con el ratón sobre todo el control (también
 * la etiqueta), no solo sobre la casilla o la pista. Nunca en deshabilitado ni en solo lectura.
 */
@Component({
  imports: [MimiCheckbox, MimiSwitch, MimiToggleGroupImports],
  template: `
    <mimi-checkbox>Acepto</mimi-checkbox>
    <mimi-switch>Avisos</mimi-switch>
    <mimi-toggle-group aria-label="Vista" value="list">
      <button mimiToggleGroupItem="list">Lista</button>
      <button mimiToggleGroupItem="table">Tabla</button>
    </mimi-toggle-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HoverHost {}

async function setup() {
  const fixture = TestBed.createComponent(HoverHost);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Hover de Checkbox, Switch y Toggle Group', () => {
  it('Checkbox: con el ratón sobre todo el control, el borde de hover de los campos', async () => {
    const el = await setup();
    const host = el.querySelector<HTMLElement>('mimi-checkbox')!;
    const box = host.querySelector<HTMLElement>('button[role="checkbox"]')!;
    expect(host.className).toContain('group/checkbox');
    expect(box.className).toContain(
      'group-hover/checkbox:not-disabled:not-aria-readonly:data-[state=unchecked]:border-[color:var(--mimi-input-border-hover,var(--mimi-input-hover))]',
    );
    // Marcada: el relleno se intensifica, como la pista del Switch.
    expect(box.className).toContain(
      'group-hover/checkbox:not-disabled:not-aria-readonly:data-[state=checked]:bg-[color:color-mix(in_oklab,var(--mimi-checkbox-checked-bg,var(--mimi-primary))_88%,var(--mimi-foreground))]',
    );
  });

  it('Switch: la pista se intensifica (apagada y encendida)', async () => {
    const el = await setup();
    const host = el.querySelector<HTMLElement>('mimi-switch')!;
    const track = host.querySelector<HTMLElement>('button[role="switch"]')!;
    expect(host.className).toContain('group/switch');
    expect(track.className).toContain(
      'group-hover/switch:not-disabled:not-aria-readonly:data-[state=unchecked]:bg-[color:color-mix(in_oklab,var(--mimi-switch-track-off,var(--mimi-switch-off))_82%,var(--mimi-foreground))]',
    );
    expect(track.className).toContain(
      'group-hover/switch:not-disabled:not-aria-readonly:data-[state=checked]:bg-[color:color-mix(in_oklab,var(--mimi-switch-track-on,var(--mimi-primary))_88%,var(--mimi-foreground))]',
    );
  });

  it('Toggle Group: la opción no elegida toma un fondo suave', async () => {
    const el = await setup();
    const off = el.querySelector<HTMLElement>('[mimiToggleGroupItem="table"]')!;
    expect(off.getAttribute('data-state')).toBe('off');
    expect(off.className).toContain(
      'enabled:not-in-data-readonly:data-[state=off]:hover:bg-[color:color-mix(in_oklab,var(--mimi-foreground)_6%,transparent)]',
    );
  });
});
