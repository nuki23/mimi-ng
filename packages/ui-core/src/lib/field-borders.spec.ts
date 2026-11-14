import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiInput } from '@/components/ui/input';
import { MimiNumberInput } from '@/components/ui/number-input';
import { MimiPassword } from '@/components/ui/password';
import { MimiTextarea } from '@/components/ui/textarea';

/**
 * Bordes de los campos (informe del usuario, 12/11/2026: «Password no coincide con Input»):
 * Input, Textarea y la caja de Password y Number Input usan los mismos tokens de borde, hover,
 * foco y error de Input (spec 13). Lo que cambia es solo dónde está el foco (en el campo o, en
 * las cajas, en el input de dentro: `focus-within`).
 */
@Component({
  imports: [MimiInput, MimiTextarea, MimiPassword, MimiNumberInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input mimiInput data-test="input" aria-label="a" />
    <textarea mimiTextarea data-test="textarea" aria-label="b"></textarea>
    <mimi-password data-test="password"><input mimiInput aria-label="c" /></mimi-password>
    <mimi-number-input data-test="number" aria-label="d" />
  `,
})
class Host {}

describe('Bordes de los campos: los tokens de Input en todos', () => {
  async function classesOf() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const q = (s: string) => el.querySelector<HTMLElement>(s)!.className;
    return {
      input: q('[data-test="input"]'),
      textarea: q('[data-test="textarea"]'),
      password: q('[data-test="password"] [data-slot="box"]'),
      number: q('[data-test="number"]'),
    };
  }

  it('el mismo color de borde, hover y error, y el mismo ancho del anillo', async () => {
    const c = await classesOf();
    const shared = [
      'border-[length:var(--mimi-input-border-width,1px)]',
      'hover:border-[color:var(--mimi-input-border-hover,var(--mimi-input-hover))]',
      'border-[color:var(--mimi-input-error,var(--mimi-destructive))]',
      'ring-[length:var(--mimi-input-focus-ring-width,3px)]',
    ];
    for (const [name, classes] of Object.entries(c)) {
      for (const token of shared) expect(classes, `${name}: ${token}`).toContain(token);
    }
    // El borde en reposo: el de Input (Textarea lo hereda por su propio token).
    for (const name of ['input', 'password', 'number'] as const) {
      expect(c[name]).toContain('border-[color:var(--mimi-input-border,var(--mimi-input))]');
    }
    expect(c.textarea).toContain('var(--mimi-input-border,var(--mimi-input))');
  });

  it('con error, el hover no tapa el borde rojo', async () => {
    const c = await classesOf();
    expect(c.input).toContain('aria-invalid:hover:border-[color:var(--mimi-input-error');
    expect(c.textarea).toContain('aria-invalid:hover:border-[color:var(--mimi-input-error');
    expect(c.password).toContain('data-[invalid]:hover:border-[color:var(--mimi-input-error');
    expect(c.number).toContain('data-[invalid]:hover:border-[color:var(--mimi-input-error');
  });
});
