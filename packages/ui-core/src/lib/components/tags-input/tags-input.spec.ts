import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiTagsInput } from './tags-input';
import { MIMI_TAGS_INPUT_TEXT_ES, provideMimiTagsInputText } from './tags-input-texts';

@Component({
  imports: [MimiTagsInput, MimiFormField, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <mimi-tags-input
      data-test="plain"
      aria-label="Etiquetas"
      [limit]="limit()"
      [normalize]="normalize()"
      [validate]="validate()"
      [readonly]="ro()"
      [class]="extra()"
      [(value)]="tags"
    />
    <mimi-form-field label="Reactivo">
      <mimi-tags-input data-test="reactive" [formControl]="control" />
    </mimi-form-field>
    <mimi-tags-input data-test="signal" aria-label="Señal" [formField]="signalForm.tags" />
    <mimi-tags-input data-test="ng-model" aria-label="Modelo" name="t" [(ngModel)]="model" />
    <button data-test="out">Fuera</button>
  `,
})
class Host {
  readonly tags = signal<string[]>(['angular']);
  readonly limit = signal<number | undefined>(3);
  readonly normalize = signal((t: string) => t.trim());
  readonly validate = signal<((t: string) => string | null) | undefined>(undefined);
  readonly ro = signal(false);
  readonly extra = signal('');
  readonly control = new FormControl<string[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });
  readonly locked = signal(false);
  readonly data = signal({ tags: [] as string[] });
  readonly signalForm = form(this.data, (p) => {
    required(p.tags);
    disabled(p.tags, () => this.locked());
  });
  model: string[] = [];
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 2; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

describe('MimiTagsInput', () => {
  afterEach(() => (document.activeElement as HTMLElement | null)?.blur?.());

  async function setup() {
    const announce = vi.spyOn(TestBed.inject(LiveAnnouncer), 'announce').mockResolvedValue();
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const part = (name: string) => root.querySelector<HTMLElement>(`[data-test="${name}"]`)!;
    const input = (name: string) => part(name).querySelector<HTMLInputElement>('input')!;
    const box = (name: string) => part(name).querySelector<HTMLElement>('[data-slot="box"]')!;
    const chips = (name: string) =>
      Array.from(part(name).querySelectorAll('mimi-chip')).map((c) => c.textContent!.trim());
    const message = (name: string) =>
      part(name).querySelector('[data-slot="message"]')!.textContent!.trim();
    const type = async (name: string, text: string, inputType = 'insertText') => {
      const el = input(name);
      el.focus();
      el.value = text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType }));
      await settle(fixture);
    };
    const key = async (name: string, k: string) => {
      input(name).dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }),
      );
      await settle(fixture);
    };
    const out = async () => {
      root.querySelector<HTMLElement>('[data-test="out"]')!.focus();
      await settle(fixture);
    };
    return {
      fixture,
      host: fixture.componentInstance,
      root,
      part,
      input,
      box,
      chips,
      message,
      type,
      key,
      announce,
      out,
    };
  }

  it('Enter y coma agregan; se anuncia; el campo se vacía', async () => {
    const { host, type, key, input, chips, announce } = await setup();
    await type('plain', 'diseño');
    await key('plain', 'Enter');
    expect(host.tags()).toEqual(['angular', 'diseño']);
    expect(input('plain').value).toBe('');
    expect(announce).toHaveBeenLastCalledWith('diseño added', 'polite');
    await type('plain', 'ventas,');
    expect(chips('plain')).toEqual(['angular', 'diseño', 'ventas']);
  });

  it('duplicado: no se agrega, mensaje de error y aria-invalid; el chip repetido en rojo', async () => {
    const { host, type, key, message, input, box, part } = await setup();
    await type('plain', 'angular');
    await key('plain', 'Enter');
    expect(host.tags()).toEqual(['angular']);
    expect(message('plain')).toBe('“angular” is already in the list.');
    expect(input('plain').getAttribute('aria-invalid')).toBe('true');
    expect(box('plain').hasAttribute('data-invalid')).toBe(true);
    expect(part('plain').querySelector('mimi-chip')!.hasAttribute('data-invalid')).toBe(true);
    await type('plain', 'angula');
    expect(input('plain').getAttribute('aria-invalid')).toBeNull();
  });

  it('límite: contador, readonly (sin perder el foco), mensaje y borde de aviso', async () => {
    const { type, key, input, box, part, message } = await setup();
    await type('plain', 'a,b,');
    expect(part('plain').querySelector('[data-slot="count"]')!.textContent!.trim()).toBe('3/3');
    expect(box('plain').hasAttribute('data-full')).toBe(true);
    expect(input('plain').readOnly).toBe(true);
    expect(input('plain').disabled).toBe(false);
    expect(document.activeElement).toBe(input('plain'));
    expect(message('plain')).toContain('limit of 3');
    await key('plain', 'Enter');
    expect(input('plain').getAttribute('aria-describedby')).toContain('-count');
  });

  it('Backspace con el campo vacío quita la última; el botón quita y deja el foco en el campo', async () => {
    const { host, type, key, input, part, announce, fixture } = await setup();
    await type('plain', 'b,');
    await type('plain', '');
    await key('plain', 'Backspace');
    expect(host.tags()).toEqual(['angular']);
    expect(announce).toHaveBeenLastCalledWith('b removed', 'polite');
    const remove = part('plain').querySelector<HTMLButtonElement>('[data-slot="remove"]')!;
    remove.focus();
    remove.click();
    await settle(fixture);
    expect(host.tags()).toEqual([]);
    expect(document.activeElement).toBe(input('plain'));
  });

  it('pegar varias etiquetas las agrega todas (respeta duplicados y límite)', async () => {
    const { host, type } = await setup();
    await type('plain', 'diseño, angular, ventas, extra', 'insertFromPaste');
    expect(host.tags()).toEqual(['angular', 'diseño']);
    host.limit.set(undefined);
  });

  it('normalización y validación propias', async () => {
    const { host, fixture, type, key, message } = await setup();
    host.normalize.set((t) => t.trim().toLowerCase().replace(/^#/, ''));
    host.validate.set((t) => (t.length < 3 ? 'Muy corta.' : null));
    await settle(fixture);
    await type('plain', '#Diseño');
    await key('plain', 'Enter');
    expect(host.tags()).toEqual(['angular', 'diseño']);
    await type('plain', 'ab');
    await key('plain', 'Enter');
    expect(message('plain')).toBe('Muy corta.');
  });

  it('solo lectura: sin botones de quitar; class va a la caja', async () => {
    const { host, fixture, part, box } = await setup();
    host.ro.set(true);
    host.extra.set('min-h-12');
    await settle(fixture);
    expect(part('plain').querySelector('[data-slot="remove"]')).toBeNull();
    expect(box('plain').className).toContain('min-h-12');
    expect(box('plain').className).toContain(
      'focus-within:ring-[length:var(--mimi-input-focus-ring-width,3px)]',
    );
    expect(box('plain').hasAttribute('data-readonly')).toBe(true);
  });

  it('Reactive Forms, Signal Forms y ngModel', async () => {
    const { host, type, key, input, out, root, fixture } = await setup();
    expect(root.querySelector(`label[for="${input('reactive').id}"]`)).not.toBeNull();
    await type('reactive', 'uno,');
    expect(host.control.value).toEqual(['uno']);
    host.control.setValue(['x', 'y']);
    await settle(fixture);
    expect(root.querySelectorAll('[data-test="reactive"] mimi-chip').length).toBe(2);
    host.control.disable();
    await settle(fixture);
    expect(input('reactive').disabled).toBe(true);
    await type('signal', 'dos');
    await key('signal', 'Enter');
    expect(host.data().tags).toEqual(['dos']);
    host.locked.set(true);
    await settle(fixture);
    expect(input('signal').disabled).toBe(true);
    await type('ng-model', 'tres,');
    expect(host.model).toEqual(['tres']);
    void out;
  });

  it('textos en español', async () => {
    TestBed.configureTestingModule({
      providers: [provideMimiTagsInputText(MIMI_TAGS_INPUT_TEXT_ES)],
    });
    const { message } = await setup();
    expect(message('plain')).toBe('Enter o coma para agregar · Backspace quita la última');
  });

  it('solo lectura: las etiquetas se distinguen del fondo (fondo del campo y borde)', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const chip = () => root.querySelector<HTMLElement>('[data-test="plain"] mimi-chip')!;
    // Sin solo lectura, el chip de siempre (sin borde).
    expect(chip().className).not.toContain('--mimi-tags-chip-readonly-border');
    fixture.componentInstance.ro.set(true);
    await settle(fixture);
    // El fondo de solo lectura (70 % de muted) es casi el del chip (secondary): el chip toma el
    // fondo del campo y un borde con contraste de 3:1 (lo mide Playwright).
    expect(chip().className).toContain(
      'border-[color:var(--mimi-tags-chip-readonly-border,var(--mimi-muted-foreground))]',
    );
    expect(chip().className).toContain(
      'bg-[color:var(--mimi-input-bg,var(--mimi-input-background))]',
    );
    fixture.destroy();
  });
});
