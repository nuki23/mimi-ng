import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiSelectImports } from './select';

/** El chevron y el spinner no deben tapar el ::after del disparador: un clic encima abre el panel. */
@Component({
  imports: [MimiSelectImports],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mimi-select
    aria-label="s"
    [(value)]="value"
    [clearable]="true"
    [loading]="loading()"
    [options]="[{ label: 'A', value: 'a' }]"
  />`,
})
class Host {
  readonly value = signal<string | null>(null);
  readonly loading = signal(false);
}

describe('Select: icono del final y clics', () => {
  it('el sitio del icono no captura el ratón salvo el botón de limpiar', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const slot = el.querySelector<HTMLElement>('[data-slot="end-icon"]')!;
    expect(slot.className).toContain('pointer-events-none');
    fixture.componentInstance.value.set('a');
    await fixture.whenStable();
    const clear = slot.querySelector('button')!;
    expect(clear.className).toContain('pointer-events-auto');
  });
});
