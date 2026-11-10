import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MimiInput } from '@/components/ui/input';
import { MimiFormFieldImports } from './form-field';

/** R.14: atajos `description`, `hint` y `required` de mimi-form-field. */
@Component({
  imports: [MimiFormFieldImports, MimiInput, ReactiveFormsModule],
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
  `,
})
class Host {
  readonly control = new FormControl('');
  readonly other = new FormControl('');
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
