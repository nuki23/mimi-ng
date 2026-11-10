import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiCombobox } from '@/components/ui/combobox';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { MimiPassword } from '@/components/ui/password';

/** Hallazgos del revisor independiente de la puerta de la 0.6.0 (10/11/2026). */
@Component({
  imports: [MimiCombobox, MimiPassword, MimiInput, MimiFormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mimi-combobox
      data-test="multi"
      aria-label="m"
      multiple
      readonly
      [options]="options"
      [(value)]="many"
    />
    <mimi-combobox data-test="single" aria-label="s" readonly [options]="options" [(value)]="one" />
    <mimi-password data-test="password" [readonly]="locked()">
      <input mimiInput type="password" aria-label="p" />
    </mimi-password>
    <mimi-form-field data-test="field" label="Campo" [hint]="hint()">
      <input mimiInput aria-label="f" />
    </mimi-form-field>
  `,
})
class Host {
  readonly options = [
    { label: 'Uno', value: 'a' },
    { label: 'Dos', value: 'b' },
  ];
  readonly many = signal<string | string[] | null>(['a', 'b']);
  readonly one = signal<string | string[] | null>('a');
  readonly locked = signal(true);
  readonly hint = signal('Ayuda');
}

describe('arreglos de la puerta de la 0.6.0', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    return { fixture, host: fixture.componentInstance, el };
  }

  it('Combobox readonly: ni los chips, ni Backspace, ni Escape cambian el valor', async () => {
    const { fixture, host, el } = await setup();
    // Los chips no se pueden quitar.
    expect(el.querySelectorAll('[data-test="multi"] [data-slot="remove"]').length).toBe(0);
    const multiInput = el.querySelector<HTMLInputElement>('[data-test="multi"] input')!;
    multiInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    await fixture.whenStable();
    expect(host.many()).toEqual(['a', 'b']);
    const singleInput = el.querySelector<HTMLInputElement>('[data-test="single"] input')!;
    singleInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(host.one()).toBe('a');
  });

  it('Combobox múltiple: el campo sigue la altura del chip (la escala), no un alto fijo', async () => {
    const { el } = await setup();
    const input = el.querySelector<HTMLInputElement>('[data-test="multi"] input')!;
    expect(input.className).toContain('h-[var(--mimi-chip-h,');
    expect(input.className).not.toContain('h-7');
  });

  it('Password: quitar readonly vuelve a dejar escribir', async () => {
    const { fixture, host, el } = await setup();
    const input = el.querySelector<HTMLInputElement>('[data-test="password"] input')!;
    expect(input.readOnly).toBe(true);
    host.locked.set(false);
    await fixture.whenStable();
    expect(input.readOnly).toBe(false);
  });

  it('Password: un readonly escrito en el propio input se respeta', async () => {
    const fixture = TestBed.createComponent(PasswordNative);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const input = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input')!;
    expect(input.readOnly).toBe(true);
  });

  it('Form Field: si la ayuda desaparece, su id sale del aria-describedby', async () => {
    const { fixture, host, el } = await setup();
    const input = el.querySelector<HTMLInputElement>('[data-test="field"] input')!;
    expect(input.getAttribute('aria-describedby')).toContain('-hint');
    host.hint.set('');
    await fixture.whenStable();
    expect(input.getAttribute('aria-describedby') ?? '').not.toContain('-hint');
  });
});

@Component({
  imports: [MimiPassword, MimiInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mimi-password
    ><input mimiInput type="password" aria-label="p" readonly
  /></mimi-password>`,
})
class PasswordNative {}
