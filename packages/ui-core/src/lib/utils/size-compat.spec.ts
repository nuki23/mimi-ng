import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type MimiSizeInput, MimiSizeScope, injectMimiSize, normalizeMimiSize } from './size';

/*
 * Compatibilidad con las copias de la 0.6.0 que la CLI no actualiza (puerta R.P7, escenario 4 del
 * .tgz): si modificaste Button o Pagination, `ng g mimi` los deja en la 0.6.0 pero actualiza
 * `utils/size`. Estos archivos de la 0.6.0 importan `MimiSizeInput` y `normalizeMimiSize` y llaman
 * a `injectMimiSize(señal, 'Nombre')`: tienen que seguir compilando hasta la 1.0. Los componentes
 * de la 0.7.0 no los usan (R.32: `size="default"` no compila en ellos).
 */

/** Lo que hace el Button de la 0.6.0 con `utils/size`, tal cual. */
@Component({
  selector: 'app-old-button',
  template: '',
  host: { '[attr.data-size]': 'own()', '[attr.data-resolved]': 'resolved()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OldButton {
  readonly size = input<MimiSizeInput | 'icon'>();
  protected readonly resolved = injectMimiSize(
    computed(() => (this.size() === 'icon' ? undefined : (this.size() as MimiSizeInput))),
    'MimiButton',
  );
  protected readonly own = computed(() =>
    this.size() === 'icon'
      ? 'icon'
      : (normalizeMimiSize(this.size() as MimiSizeInput, 'MimiButton') ?? null),
  );
}

@Component({
  imports: [OldButton, MimiSizeScope],
  template: `
    <app-old-button data-test="default" size="default" />
    <app-old-button data-test="lg" size="lg" />
    <div mimiSize="sm"><app-old-button data-test="inherited" /></div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('utils/size: compatibilidad con las copias de la 0.6.0 (R.P7)', () => {
  it('el Button de la 0.6.0 compila y funciona: default → md con un aviso; lg; heredado de mimiSize', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = (id: string) =>
      (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(`[data-test="${id}"]`)!;
    expect(el('default').dataset['size']).toBe('md');
    expect(el('default').dataset['resolved']).toBe('md');
    expect(el('lg').dataset['resolved']).toBe('lg');
    expect(el('inherited').dataset['resolved']).toBe('sm');
    expect(warn.mock.calls.some(([m]) => String(m).includes('size="default"'))).toBe(true);
    warn.mockRestore();
  });

  it('normalizeMimiSize: lo que no es default pasa tal cual', () => {
    expect(normalizeMimiSize('sm', 'X')).toBe('sm');
    expect(normalizeMimiSize(undefined, 'X')).toBeUndefined();
    expect(normalizeMimiSize(null, 'X')).toBeUndefined();
  });
});
