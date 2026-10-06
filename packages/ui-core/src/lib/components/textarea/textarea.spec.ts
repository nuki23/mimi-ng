import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, form, minLength } from '@angular/forms/signals';
import { MimiTextarea } from './textarea';

@Component({
  imports: [MimiTextarea, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <textarea
      mimiTextarea
      id="plain"
      rows="1"
      [showError]="showError()"
      [class]="extra()"
    ></textarea>
    <textarea mimiTextarea id="reactive" [formControl]="bio"></textarea>
    <textarea mimiTextarea id="signal" [formField]="signalForm.bio"></textarea>
    <textarea mimiTextarea id="ng-model" name="nota" required [(ngModel)]="nota"></textarea>
  `,
})
class Host {
  readonly showError = signal<boolean | undefined>(undefined);
  readonly extra = signal('');
  readonly bio = new FormControl('', Validators.minLength(20));
  readonly model = signal({ bio: '' });
  readonly signalForm = form(this.model, (p) => minLength(p.bio, 20));
  nota = '';
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
};

function type(el: HTMLTextAreaElement, value: string) {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('MimiTextarea', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const get = (id: string) => root.querySelector<HTMLTextAreaElement>(`#${id}`)!;
    return { fixture, host: fixture.componentInstance, get };
  }

  it('con una fila mide lo mismo que Input y Button (alto del control)', async () => {
    const { get } = await setup();
    const el = get('plain');
    expect(el.tagName).toBe('TEXTAREA');
    // Alto mínimo = alto del control; interlineado 20px; padding = (alto − 20px − 2 bordes) / 2.
    // Con border-box: padding×2 + 20px + bordes×2 = alto del control.
    expect(el.classList).toContain(
      'min-h-[var(--mimi-textarea-min-height,var(--mimi-input-height,var(--mimi-control-height,2.5rem)))]',
    );
    expect(el.classList).toContain('leading-[var(--mimi-textarea-line-height,1.25rem)]');
    expect(el.classList).toContain(
      'py-[var(--mimi-textarea-py,calc((var(--mimi-textarea-min-height,var(--mimi-input-height,var(--mimi-control-height,2.5rem)))_-_var(--mimi-textarea-line-height,1.25rem)_-_2*var(--mimi-input-border-width,1px))/2))]',
    );
    expect(el.classList).toContain('border-[length:var(--mimi-input-border-width,1px)]');
    expect(el.classList).toContain('resize-y');
    expect(el.classList).toContain('disabled:resize-none');
  });

  it('la clase del usuario gana', async () => {
    const { fixture, host, get } = await setup();
    host.extra.set('min-h-32 resize-none');
    await settle(fixture);
    expect(get('plain').classList).toContain('min-h-32');
    expect(get('plain').classList).toContain('resize-none');
    expect(get('plain').classList).not.toContain('resize-y');
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

  it('showError con tres estados', async () => {
    const { fixture, host, get } = await setup();
    expect(get('plain').hasAttribute('aria-invalid')).toBe(false);
    host.showError.set(true);
    await settle(fixture);
    expect(get('plain').getAttribute('aria-invalid')).toBe('true');
    host.showError.set(false);
    await settle(fixture);
    expect(get('plain').hasAttribute('aria-invalid')).toBe(false);
  });

  it('funciona con [formControl], [formField] y ngModel', async () => {
    const { fixture, host, get } = await setup();

    type(get('reactive'), 'corto');
    type(get('signal'), 'corto');
    type(get('ng-model'), 'x');
    await settle(fixture);
    type(get('ng-model'), '');
    get('signal').dispatchEvent(new Event('blur'));
    await settle(fixture);

    expect(host.bio.value).toBe('corto');
    expect(get('reactive').getAttribute('aria-invalid')).toBe('true');
    expect(host.model().bio).toBe('corto');
    expect(get('signal').getAttribute('aria-invalid')).toBe('true');
    expect(get('ng-model').getAttribute('aria-invalid')).toBe('true');

    host.bio.setValue('Una biografía lo bastante larga.');
    await settle(fixture);
    expect(get('reactive').value).toBe('Una biografía lo bastante larga.');
    expect(get('reactive').hasAttribute('aria-invalid')).toBe(false);
  });
});
