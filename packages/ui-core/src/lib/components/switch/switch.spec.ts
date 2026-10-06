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
import { MimiSwitch } from './switch';

@Component({
  imports: [MimiSwitch, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <mimi-switch data-test="plain" [(checked)]="on" [disabled]="off()" [class]="extra()">
      Modo avión
    </mimi-switch>
    <mimi-switch data-test="bare" aria-label="Wifi" />
    <label for="external">Bluetooth</label>
    <mimi-switch data-test="external" id="external" />
    <form id="form" (submit)="submitted = true">
      <mimi-switch data-test="in-form">Dentro de un form</mimi-switch>
    </form>
    <form [formGroup]="group">
      <mimi-switch data-test="reactive" formControlName="terms">Acepto</mimi-switch>
    </form>
    <mimi-switch data-test="signal" [formField]="signalForm.news">Novedades</mimi-switch>
    <mimi-switch data-test="ng-model" name="dark" [(ngModel)]="dark">Oscuro</mimi-switch>
  `,
})
class Host {
  readonly on = signal(false);
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
  readonly dark = signal(false);
}

/** Las actualizaciones de ngModel y de los eventos llegan en microtareas. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
  await new Promise((r) => setTimeout(r));
  await fixture.whenStable();
};

describe('MimiSwitch', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const host = (id: string) => root.querySelector<HTMLElement>(`mimi-switch[data-test="${id}"]`)!;
    const control = (id: string) => host(id).querySelector('button')!;
    const label = (id: string) => host(id).querySelector('label')!;
    return { fixture, root, h: fixture.componentInstance, host, control, label };
  }

  it('es un <button type="button" role="switch"> con las medidas del diseño', async () => {
    const { control, host } = await setup();
    const btn = control('plain');
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.getAttribute('role')).toBe('switch');
    expect(btn.getAttribute('aria-checked')).toBe('false');
    for (const cls of [
      'h-[var(--mimi-switch-height,1.25rem)]',
      'w-[var(--mimi-switch-width,2.25rem)]',
      'p-0.5',
      'rounded-full',
      'bg-[color:var(--mimi-switch-track-off,var(--mimi-switch-off))]',
    ]) {
      expect(btn.classList).toContain(cls);
    }
    expect(btn.classList).toContain('active:scale-(--mimi-press-scale-sm)');
    expect(btn.classList).toContain('focus-visible:outline-ring');
    expect(btn.classList).toContain(
      'data-[state=checked]:bg-[color:var(--mimi-switch-track-on,var(--mimi-primary))]',
    );
    expect(btn.classList).toContain('data-[state=checked]:shadow-primary');
    const thumb = btn.querySelector('span')!;
    for (const cls of [
      'size-[calc(var(--mimi-switch-height,1.25rem)_-_0.25rem)]',
      'rounded-full',
      'bg-[color:var(--mimi-switch-thumb,var(--mimi-background))]',
      'shadow-thumb',
      'mimi-transition',
    ]) {
      expect(thumb.classList).toContain(cls);
    }
    expect(thumb.classList).toContain(
      'group-data-[state=checked]:translate-x-[calc(var(--mimi-switch-width,2.25rem)_-_var(--mimi-switch-height,1.25rem))]',
    );
    expect(host('plain').classList).toContain('gap-2.5');
  });

  it('clic en el botón o en el texto alterna, con [(checked)]', async () => {
    const { fixture, h, host, control, label } = await setup();
    control('plain').click();
    await settle(fixture);
    expect(h.on()).toBe(true);
    expect(control('plain').getAttribute('aria-checked')).toBe('true');
    expect(control('plain').dataset['state']).toBe('checked');
    expect(host('plain').dataset['state']).toBe('checked');

    label('plain').click();
    await settle(fixture);
    expect(h.on()).toBe(false);
    expect(host('plain').dataset['state']).toBe('unchecked');
  });

  it('el valor del modelo llega al botón', async () => {
    const { fixture, h, control } = await setup();
    h.on.set(true);
    await settle(fixture);
    expect(control('plain').getAttribute('aria-checked')).toBe('true');
  });

  it('no envía el <form> que lo contiene', async () => {
    const { fixture, h, control } = await setup();
    control('in-form').click();
    await settle(fixture);
    expect(h.submitted).toBe(false);
    expect(control('in-form').getAttribute('aria-checked')).toBe('true');
  });

  it('deshabilitado: disabled nativo, sin cambios al hacer clic', async () => {
    const { fixture, h, host, control } = await setup();
    h.off.set(true);
    await settle(fixture);
    expect(control('plain').disabled).toBe(true);
    expect(host('plain').hasAttribute('data-disabled')).toBe(true);
    expect(control('plain').classList).toContain('disabled:opacity-50');
    expect(control('plain').classList).toContain('disabled:cursor-not-allowed');
    (fixture.componentInstance as Host).on.set(false);
    control('plain').click();
    await settle(fixture);
    expect(h.on()).toBe(false);
  });

  it('el texto es la etiqueta; sin texto se oculta y vale aria-label o una etiqueta externa', async () => {
    const { label, control, host } = await setup();
    expect(label('plain').getAttribute('for')).toBe(control('plain').id);
    expect(label('plain').textContent?.trim()).toBe('Modo avión');
    expect(label('bare').childNodes.length).toBe(0);
    expect(label('bare').classList).toContain('empty:hidden');
    expect(control('bare').getAttribute('aria-label')).toBe('Wifi');
    // id pasa al botón, así un <label for> externo lo nombra.
    expect(control('external').id).toBe('external');
    expect(host('external').hasAttribute('id')).toBe(false);
    expect(host('bare').hasAttribute('aria-label')).toBe(false);
    expect(document.querySelectorAll('#external').length).toBe(1);
  });

  it('cada instancia tiene su propio id', async () => {
    const { root } = await setup();
    const ids = Array.from(root.querySelectorAll('mimi-switch button')).map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('Reactive Forms: valor, touch y aria-invalid al tocar', async () => {
    const { fixture, h, control } = await setup();
    const btn = control('reactive');
    expect(btn.hasAttribute('aria-invalid')).toBe(false);
    btn.dispatchEvent(new Event('blur'));
    await settle(fixture);
    expect(h.group.controls.terms.touched).toBe(true);
    expect(btn.getAttribute('aria-invalid')).toBe('true');
    btn.click();
    await settle(fixture);
    expect(h.group.controls.terms.value).toBe(true);
    expect(btn.hasAttribute('aria-invalid')).toBe(false);
    h.group.controls.terms.setValue(false);
    h.group.controls.terms.disable();
    await settle(fixture);
    expect(btn.getAttribute('aria-checked')).toBe('false');
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
    expect(h.dark()).toBe(true);
    h.dark.set(false);
    await settle(fixture);
    expect(control('ng-model').getAttribute('aria-checked')).toBe('false');
  });

  it('focus() enfoca el botón', async () => {
    const { fixture, control } = await setup();
    const sw = fixture.debugElement.query((d) => d.nativeElement.dataset?.test === 'plain')
      .componentInstance as MimiSwitch;
    sw.focus();
    expect(document.activeElement).toBe(control('plain'));
  });

  it('la clase del usuario gana (en el envoltorio)', async () => {
    const { fixture, h, host } = await setup();
    h.extra.set('flex w-full flex-row-reverse justify-between gap-4');
    await settle(fixture);
    for (const cls of ['flex', 'w-full', 'flex-row-reverse', 'justify-between', 'gap-4']) {
      expect(host('plain').classList).toContain(cls);
    }
    expect(host('plain').classList).not.toContain('inline-flex');
    expect(host('plain').classList).not.toContain('gap-2.5');
  });
});
