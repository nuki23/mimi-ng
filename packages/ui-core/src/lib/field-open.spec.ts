import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiButton } from '@/components/ui/button';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';
import { MimiSelectImports } from '@/components/ui/select';

/**
 * Con el panel abierto, el control mantiene el borde y el anillo de la marca (como Combobox, que
 * los tiene por el foco en su input), aunque se haya abierto con el ratón (13/11/2026). Select lo
 * lee de `data-state="open"` de su caja; Date Picker, Date Range y Color Picker, de
 * `aria-expanded` de su botón; el disparador de un menú, de `aria-expanded`.
 */
@Component({
  imports: [MimiSelectImports, MimiDatePicker, MimiButton, MimiDropdownMenuImports],
  template: `
    <mimi-select aria-label="Talla"><mimi-option value="m">M</mimi-option></mimi-select>
    <mimi-date-picker aria-label="Fecha" />
    <mimi-dropdown-menu>
      <button mimiBtn mimiDropdownMenuTrigger>Acciones</button>
      <ng-template mimiDropdownMenuContent><mimi-menu-item>Uno</mimi-menu-item></ng-template>
    </mimi-dropdown-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OpenHost {}

const settle = async (fixture: { whenStable(): Promise<unknown>; detectChanges(): void }) => {
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
};

describe('Controles con panel: abiertos, con el borde y el anillo de la marca', () => {
  it('Select: la caja abierta tiene el borde y el anillo del foco', async () => {
    const fixture = TestBed.createComponent(OpenHost);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const box = el.querySelector<HTMLElement>('mimi-select > div')!;
    expect(box.className).toContain(
      'data-[state=open]:border-[color:var(--mimi-input-border-focus,var(--mimi-ring))]',
    );
    expect(box.className).toContain('data-[state=open]:ring-ring-soft');
    // Con error, el rojo también con el panel abierto.
    expect(box.className).toContain('data-[invalid]:data-[state=open]:ring-destructive-ring');
    el.querySelector<HTMLButtonElement>('mimi-select button[role="combobox"]')!.click();
    await settle(fixture);
    expect(box.getAttribute('data-state')).toBe('open');
  });

  it('Date Picker (y Date Range y Color Picker, con la misma pieza): el botón abierto', async () => {
    const fixture = TestBed.createComponent(OpenHost);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector<HTMLButtonElement>('mimi-date-picker button')!;
    expect(trigger.className).toContain(
      'aria-expanded:border-[color:var(--mimi-input-border-focus,var(--mimi-ring))]',
    );
    expect(trigger.className).toContain('aria-expanded:ring-ring-soft');
    expect(trigger.className).toContain('aria-invalid:aria-expanded:ring-destructive-ring');
    trigger.click();
    await settle(fixture);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('disparador de un menú: el contorno del foco mientras el menú está abierto', async () => {
    const fixture = TestBed.createComponent(OpenHost);
    await settle(fixture);
    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
      '[mimiDropdownMenuTrigger]',
    )!;
    expect(trigger.className).toContain('aria-expanded:outline-ring');
    // Las clases de Button siguen ahí (la del disparador se suma, no las reemplaza).
    expect(trigger.className).toContain('inline-flex');
  });
});
