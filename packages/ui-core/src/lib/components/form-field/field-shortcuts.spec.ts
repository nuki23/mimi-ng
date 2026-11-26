import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiInput } from '@/components/ui/input';
import { MimiFormFieldImports } from './form-field';

/** R.14: atajos `description`, `hint` y `required` de mimi-form-field. */
@Component({
  imports: [MimiFormFieldImports, MimiInput, MimiDatePicker, ReactiveFormsModule],
  template: `
    <mimi-form-field
      data-test="full"
      label="Correo"
      description="Lo usamos para avisarte de cambios."
      hint="Sin spam."
      required
    >
      <input mimiInput [formControl]="control" />
    </mimi-form-field>
    <mimi-form-field data-test="plain" label="Nombre">
      <input mimiInput [formControl]="other" />
    </mimi-form-field>
    <mimi-form-field data-test="button" label="Entrega" required>
      <mimi-date-picker [formControl]="date" />
    </mimi-form-field>
    <mimi-form-field data-test="toggle" label="Salida" hint="Cualquier día.">
      <mimi-date-picker [required]="req()" />
    </mimi-form-field>
  `,
})
class Host {
  readonly control = new FormControl('');
  readonly other = new FormControl('');
  readonly date = new FormControl<string | null>(null);
  readonly req = signal(false);
}

describe('mimi-form-field: description, hint y required (R.14)', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const q = (t: string) => el.querySelector<HTMLElement>(`[data-test="${t}"]`)!;
    return { fixture, q };
  }

  it('si cambia el required de un control que es un <button>, no se pierden la ayuda ni el error (revisor)', async () => {
    const { q, fixture } = await setup();
    const button = () => q('toggle').querySelector('button')!;
    const texts = () =>
      (button().getAttribute('aria-describedby') ?? '')
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent?.trim() ?? '');
    expect(texts()).toContain('Cualquier día.');
    fixture.componentInstance.req.set(true);
    await fixture.whenStable();
    expect(texts()).toContain('Cualquier día.');
    expect(texts().filter((t) => /obligatorio|required/i.test(t)).length).toBe(1);
  });

  it('required: asterisco que los lectores no leen, y aria-required en el control', async () => {
    const { q } = await setup();
    const label = q('full').querySelector('label')!;
    const star = label.querySelector('[data-slot="required"]')!;
    expect(star.textContent!.trim()).toBe('*');
    expect(star.getAttribute('aria-hidden')).toBe('true');
    expect(q('full').querySelector('input')!.getAttribute('aria-required')).toBe('true');
    expect(q('plain').querySelector('[data-slot="required"]')).toBeNull();
    expect(q('plain').querySelector('input')!.hasAttribute('aria-required')).toBe(false);
  });

  it('required con un control que es un <button>: sin aria-required, «obligatorio» en la descripción (M.15)', async () => {
    const { q, fixture } = await setup();
    await fixture.whenStable();
    const button = q('button').querySelector('button')!;
    expect(button.hasAttribute('aria-required')).toBe(false);
    const described = (button.getAttribute('aria-describedby') ?? '').split(/\s+/);
    expect(described.map((id) => document.getElementById(id)?.textContent?.trim())).toContain(
      'This field is required.',
    );
  });

  it('description va entre la etiqueta y el control; hint, debajo del control; los dos en aria-describedby', async () => {
    const { q } = await setup();
    const field = q('full');
    const description = field.querySelector<HTMLElement>('[data-slot="description"]')!;
    const hint = field.querySelector<HTMLElement>('[data-slot="hint"]')!;
    const input = field.querySelector('input')!;
    expect(description.textContent).toContain('Lo usamos');
    expect(hint.textContent).toContain('Sin spam');
    const order = Array.from(field.children).map(
      (c) => c.getAttribute('data-slot') ?? c.tagName.toLowerCase(),
    );
    expect(order.indexOf('description')).toBeGreaterThan(order.indexOf('label'));
    expect(order.indexOf('description')).toBeLessThan(order.indexOf('input'));
    expect(order.indexOf('hint')).toBeGreaterThan(order.indexOf('input'));
    const described = (input.getAttribute('aria-describedby') ?? '').split(/\s+/);
    expect(described).toContain(description.id);
    expect(described).toContain(hint.id);
    // Sin ellos, el otro campo solo tiene el del error.
    expect(q('plain').querySelector('[data-slot="description"], [data-slot="hint"]')).toBeNull();
  });
});
