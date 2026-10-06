import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormField, email, form, required } from '@angular/forms/signals';
import { MimiInput } from './input';
import type { InputSize } from './input.variants';

@Component({
  imports: [MimiInput, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <input mimiInput id="plain" [size]="size()" [showError]="showError()" [class]="extra()" />
    <form [formGroup]="group">
      <input mimiInput id="reactive" formControlName="email" [showError]="reactiveShowError()" />
    </form>
    <input mimiInput id="signal" [formField]="signalForm.email" />
    <input mimiInput id="ng-model" name="nombre" required [(ngModel)]="nombre" />
  `,
})
class Host {
  readonly size = signal<InputSize>('default');
  readonly showError = signal<boolean | undefined>(undefined);
  readonly reactiveShowError = signal<boolean | undefined>(undefined);
  readonly extra = signal('');
  readonly group = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  readonly model = signal({ email: '' });
  readonly signalForm = form(this.model, (p) => {
    required(p.email);
    email(p.email);
  });
  readonly nombre = signal('');
}

/** Las actualizaciones de ngModel y de los eventos llegan en microtareas. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
};

function type(el: HTMLInputElement, value: string) {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('MimiInput', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const get = (id: string) => root.querySelector<HTMLInputElement>(`#${id}`)!;
    return { fixture, host: fixture.componentInstance, get };
  }

  it('es el <input> nativo con las clases del diseño y el tamaño por defecto', async () => {
    const { get } = await setup();
    const el = get('plain');
    expect(el.tagName).toBe('INPUT');
    expect(el.dataset['size']).toBe('default');
    expect(el.classList).toContain(
      'h-[var(--mimi-input-height,var(--mimi-control-height,2.5rem))]',
    );
    expect(el.classList).toContain('border-[color:var(--mimi-input-border,var(--mimi-input))]');
    expect(el.classList).toContain('bg-[color:var(--mimi-input-bg,var(--mimi-input-background))]');
    expect(el.classList).toContain('px-[var(--mimi-input-px,var(--mimi-input-padding-x,0.75rem))]');
    expect(el.classList).toContain('focus-visible:ring-ring-soft');
    expect(el.classList).toContain(
      'aria-invalid:border-[color:var(--mimi-input-error,var(--mimi-destructive))]',
    );
    expect(el.hasAttribute('aria-invalid')).toBe(false);
  });

  it.each<[InputSize, string]>([
    ['sm', 'h-[var(--mimi-input-height-sm,var(--mimi-control-height-sm,2rem))]'],
    ['lg', 'h-[var(--mimi-input-height-lg,var(--mimi-control-height-lg,3rem))]'],
  ])('tamaño %s', async (size, expected) => {
    const { fixture, host, get } = await setup();
    host.size.set(size);
    await settle(fixture);
    expect(get('plain').dataset['size']).toBe(size);
    expect(get('plain').classList).toContain(expected);
  });

  it('los valores tipados (length, color) ceden ante la clase del usuario', async () => {
    const { fixture, host, get } = await setup();
    host.extra.set('border-2 text-base placeholder:text-foreground focus-visible:ring-1');
    await settle(fixture);
    const el = get('plain');
    for (const cls of [
      'border-2',
      'text-base',
      'placeholder:text-foreground',
      'focus-visible:ring-1',
    ]) {
      expect(el.classList).toContain(cls);
    }
    for (const cls of [
      'border-[length:var(--mimi-input-border-width,1px)]',
      'text-[length:var(--mimi-input-font-size,0.875rem)]',
      'placeholder:text-[color:var(--mimi-input-placeholder,var(--mimi-input-placeholder-color,var(--mimi-muted-foreground)))]',
      'focus-visible:ring-[length:var(--mimi-input-focus-ring-width,3px)]',
    ]) {
      expect(el.classList).not.toContain(cls);
    }
  });

  it('la clase del usuario gana y los tokens reemplazan a los estilos compartidos', async () => {
    const { fixture, host, get } = await setup();
    host.extra.set('h-12 rounded-full');
    await settle(fixture);
    const el = get('plain');
    expect(el.classList).toContain('h-12');
    expect(el.classList).toContain('rounded-full');
    expect(el.classList).not.toContain(
      'h-[var(--mimi-input-height,var(--mimi-control-height,2.5rem))]',
    );
    // El grosor del halo y la opacidad deshabilitada salen de los tokens del input.
    expect(el.classList).toContain(
      'focus-visible:ring-[length:var(--mimi-input-focus-ring-width,3px)]',
    );
    expect(el.classList).not.toContain('focus-visible:ring-3');
    expect(el.classList).toContain(
      'disabled:opacity-[var(--mimi-input-disabled-opacity,var(--mimi-disabled-opacity,0.5))]',
    );
    expect(el.classList).not.toContain('disabled:opacity-50');
  });

  describe('showError con tres estados', () => {
    it('sin formulario: undefined no marca, true fuerza el error', async () => {
      const { fixture, host, get } = await setup();
      expect(get('plain').hasAttribute('aria-invalid')).toBe(false);

      host.showError.set(true);
      await settle(fixture);
      expect(get('plain').getAttribute('aria-invalid')).toBe('true');
      expect(get('plain').hasAttribute('data-invalid')).toBe(true);

      host.showError.set(undefined);
      await settle(fixture);
      expect(get('plain').hasAttribute('aria-invalid')).toBe(false);
    });

    it('con formulario: undefined decide el formulario, false lo oculta, true lo fuerza', async () => {
      const { fixture, host, get } = await setup();
      const control = host.group.controls.email;

      // Inválido pero sin tocar: no se muestra.
      expect(get('reactive').hasAttribute('aria-invalid')).toBe(false);
      control.markAsTouched();
      await settle(fixture);
      expect(get('reactive').getAttribute('aria-invalid')).toBe('true');

      host.reactiveShowError.set(false);
      await settle(fixture);
      expect(get('reactive').hasAttribute('aria-invalid')).toBe(false);

      control.setValue('ana@mimi.dev');
      host.reactiveShowError.set(true);
      await settle(fixture);
      expect(control.valid).toBe(true);
      expect(get('reactive').getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('formularios', () => {
    it('Reactive Forms: valor en los dos sentidos, error al tocar y deshabilitado', async () => {
      const { fixture, host, get } = await setup();
      const el = get('reactive');
      const control = host.group.controls.email;

      type(el, 'ana@');
      await settle(fixture);
      expect(control.value).toBe('ana@');
      expect(el.getAttribute('aria-invalid')).toBe('true');

      control.setValue('ana@mimi.dev');
      await settle(fixture);
      expect(el.value).toBe('ana@mimi.dev');
      expect(el.hasAttribute('aria-invalid')).toBe(false);

      control.disable();
      await settle(fixture);
      expect(el.disabled).toBe(true);
      expect(el.hasAttribute('data-disabled')).toBe(true);
    });

    it('Signal Forms: valor en los dos sentidos y error al tocar', async () => {
      const { fixture, host, get } = await setup();
      const el = get('signal');
      expect(el.hasAttribute('aria-invalid')).toBe(false);

      el.dispatchEvent(new Event('blur'));
      await settle(fixture);
      expect(host.signalForm.email().touched()).toBe(true);
      expect(el.getAttribute('aria-invalid')).toBe('true');

      type(el, 'ana@mimi.dev');
      await settle(fixture);
      expect(host.model().email).toBe('ana@mimi.dev');
      expect(el.hasAttribute('aria-invalid')).toBe(false);

      host.model.set({ email: 'otro@mimi.dev' });
      await settle(fixture);
      expect(el.value).toBe('otro@mimi.dev');
    });

    it('ngModel: valor en los dos sentidos y error al modificar', async () => {
      const { fixture, host, get } = await setup();
      const el = get('ng-model');
      expect(el.hasAttribute('aria-invalid')).toBe(false);

      type(el, 'Ana');
      await settle(fixture);
      expect(host.nombre()).toBe('Ana');
      expect(el.hasAttribute('aria-invalid')).toBe(false);

      type(el, '');
      await settle(fixture);
      expect(el.getAttribute('aria-invalid')).toBe('true');

      host.nombre.set('Diego');
      await settle(fixture);
      expect(el.value).toBe('Diego');
      expect(el.hasAttribute('aria-invalid')).toBe(false);
    });
  });
});
