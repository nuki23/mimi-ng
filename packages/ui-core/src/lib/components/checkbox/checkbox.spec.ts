import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormField, disabled, form } from '@angular/forms/signals';
import { MimiCheckbox } from './checkbox';

@Component({
  imports: [MimiCheckbox, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <mimi-checkbox
      data-test="plain"
      [(checked)]="on"
      [(indeterminate)]="mixed"
      [disabled]="off()"
      [class]="extra()"
    >
      Recordarme
    </mimi-checkbox>
    <mimi-checkbox data-test="bare" aria-label="Seleccionar fila" />
    <label for="external">Fila 2</label>
    <mimi-checkbox data-test="external" id="external" />
    <form (submit)="submitted = true">
      <mimi-checkbox data-test="in-form">Dentro de un form</mimi-checkbox>
    </form>
    <form [formGroup]="group">
      <mimi-checkbox data-test="reactive" formControlName="terms">Acepto</mimi-checkbox>
    </form>
    <mimi-checkbox data-test="signal" [formField]="signalForm.news">Novedades</mimi-checkbox>
    <mimi-checkbox data-test="ng-model" name="remember" [(ngModel)]="remember">
      Recordar
    </mimi-checkbox>
  `,
})
class Host {
  readonly on = signal(false);
  readonly mixed = signal(false);
  readonly off = signal(false);
  readonly extra = signal('');
  submitted = false;
  readonly group = new FormGroup({
    terms: new FormControl(false, { nonNullable: true, validators: Validators.requiredTrue }),
  });
  readonly locked = signal(false);
  readonly model = signal({ news: false });
  readonly signalForm = form(this.model, (p) => {
    disabled(p.news, () => this.locked());
  });
  readonly remember = signal(false);
}

/** Las actualizaciones de ngModel y de los eventos llegan en microtareas. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
};

describe('MimiCheckbox', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const host = (id: string) =>
      root.querySelector<HTMLElement>(`mimi-checkbox[data-test="${id}"]`)!;
    const control = (id: string) => host(id).querySelector('button')!;
    const label = (id: string) => host(id).querySelector('label')!;
    return { fixture, root, h: fixture.componentInstance, host, control, label };
  }

  it('es un <button type="button" role="checkbox"> con las medidas del diseño', async () => {
    const { control, host } = await setup();
    const btn = control('plain');
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.getAttribute('role')).toBe('checkbox');
    expect(btn.getAttribute('aria-checked')).toBe('false');
    for (const cls of ['size-4', 'rounded-sm', 'border', 'border-input', 'bg-input-background']) {
      expect(btn.classList).toContain(cls);
    }
    expect(btn.classList).toContain('active:scale-(--mimi-press-scale-sm)');
    expect(btn.classList).toContain('focus-visible:outline-ring');
    expect(btn.classList).toContain('data-[state=unchecked]:focus-visible:border-ring');
    expect(btn.classList).toContain('data-[state=checked]:bg-primary');
    expect(btn.classList).toContain('data-[state=checked]:shadow-primary');
    expect(btn.querySelector('svg')).toBeNull();
    expect(host('plain').classList).toContain('gap-2.5');
  });

  it('marcada: check de 12px y aria-checked="true"', async () => {
    const { fixture, h, host, control, label } = await setup();
    label('plain').click();
    await settle(fixture);
    expect(h.on()).toBe(true);
    const btn = control('plain');
    expect(btn.getAttribute('aria-checked')).toBe('true');
    expect(btn.dataset['state']).toBe('checked');
    expect(host('plain').dataset['state']).toBe('checked');
    const svg = btn.querySelector('svg')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.classList).toContain('size-3');
    expect(svg.getAttribute('stroke-width')).toBe('3');
    expect(svg.querySelector('path')!.getAttribute('d')).toBe('M20 6 9 17l-5-5');

    btn.click();
    await settle(fixture);
    expect(h.on()).toBe(false);
    expect(btn.querySelector('svg')).toBeNull();
  });

  it('indeterminada: aria-checked="mixed", guion; al hacer clic se marca', async () => {
    const { fixture, h, control } = await setup();
    h.mixed.set(true);
    await settle(fixture);
    const btn = control('plain');
    expect(btn.getAttribute('aria-checked')).toBe('mixed');
    expect(btn.dataset['state']).toBe('indeterminate');
    expect(btn.querySelector('path')!.getAttribute('d')).toBe('M5 12h14');
    expect(btn.classList).toContain('data-[state=indeterminate]:bg-primary');

    btn.click();
    await settle(fixture);
    expect(h.mixed()).toBe(false);
    expect(h.on()).toBe(true);
    expect(btn.getAttribute('aria-checked')).toBe('true');
  });

  it('Enter no la alterna (patrón WAI); Espacio es el clic nativo del botón', async () => {
    const { control } = await setup();
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    control('plain').dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(true);
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    control('plain').dispatchEvent(space);
    expect(space.defaultPrevented).toBe(false);
  });

  it('no envía el <form> que la contiene', async () => {
    const { fixture, h, control } = await setup();
    control('in-form').click();
    await settle(fixture);
    expect(h.submitted).toBe(false);
    expect(control('in-form').getAttribute('aria-checked')).toBe('true');
  });

  it('deshabilitada: disabled nativo, sin cambios al hacer clic', async () => {
    const { fixture, h, host, control } = await setup();
    h.off.set(true);
    await settle(fixture);
    expect(control('plain').disabled).toBe(true);
    expect(host('plain').hasAttribute('data-disabled')).toBe(true);
    expect(control('plain').classList).toContain('disabled:opacity-50');
    control('plain').click();
    await settle(fixture);
    expect(h.on()).toBe(false);
  });

  it('el texto es la etiqueta; sin texto se oculta y vale aria-label o una etiqueta externa', async () => {
    const { label, control, host } = await setup();
    expect(label('plain').getAttribute('for')).toBe(control('plain').id);
    expect(label('bare').childNodes.length).toBe(0);
    expect(label('bare').classList).toContain('empty:hidden');
    expect(control('bare').getAttribute('aria-label')).toBe('Seleccionar fila');
    expect(host('bare').hasAttribute('aria-label')).toBe(false);
    expect(control('external').id).toBe('external');
    expect(host('external').hasAttribute('id')).toBe(false);
    expect(document.querySelectorAll('#external').length).toBe(1);
  });

  it('Reactive Forms: valor, touch, aria-invalid (borde destructive) y disabled', async () => {
    const { fixture, h, control } = await setup();
    const btn = control('reactive');
    expect(btn.classList).toContain('data-[state=unchecked]:aria-invalid:border-destructive');
    expect(btn.hasAttribute('aria-invalid')).toBe(false);
    btn.dispatchEvent(new Event('blur'));
    await settle(fixture);
    expect(h.group.controls.terms.touched).toBe(true);
    expect(btn.getAttribute('aria-invalid')).toBe('true');
    btn.click();
    await settle(fixture);
    expect(h.group.controls.terms.value).toBe(true);
    expect(btn.hasAttribute('aria-invalid')).toBe(false);
    h.group.controls.terms.disable();
    await settle(fixture);
    expect(btn.disabled).toBe(true);
  });

  it('Signal Forms: valor, touched y disabled', async () => {
    const { fixture, h, control } = await setup();
    const btn = control('signal');
    btn.click();
    await settle(fixture);
    expect(h.model().news).toBe(true);
    btn.dispatchEvent(new Event('blur'));
    await settle(fixture);
    expect(h.signalForm.news().touched()).toBe(true);
    h.locked.set(true);
    await settle(fixture);
    expect(btn.disabled).toBe(true);
  });

  it('ngModel: en los dos sentidos', async () => {
    const { fixture, h, control } = await setup();
    control('ng-model').click();
    await settle(fixture);
    expect(h.remember()).toBe(true);
    h.remember.set(false);
    await settle(fixture);
    expect(control('ng-model').getAttribute('aria-checked')).toBe('false');
  });

  it('la clase del usuario gana (en el envoltorio)', async () => {
    const { fixture, h, host } = await setup();
    h.extra.set('flex gap-3 text-base');
    await settle(fixture);
    for (const cls of ['flex', 'gap-3', 'text-base']) {
      expect(host('plain').classList).toContain(cls);
    }
    for (const cls of ['inline-flex', 'gap-2.5', 'text-sm']) {
      expect(host('plain').classList).not.toContain(cls);
    }
  });
});
