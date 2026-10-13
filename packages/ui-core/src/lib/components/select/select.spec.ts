import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormField, disabled, form, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { type MimiOption, type MimiOptionGroup, MimiSelect, MimiSelectImports } from './select';
import { MIMI_SELECT_TEXT_ES, provideMimiSelectText } from './select-texts';

interface City {
  id: number;
  name: string;
}

const COUNTRIES: (MimiOption<string> | MimiOptionGroup<string>)[] = [
  {
    label: 'Latinoamérica y España',
    options: [
      { label: 'Argentina', value: 'AR' },
      { label: 'Brasil', value: 'BR' },
      { label: 'Chile', value: 'CL' },
      { label: 'Colombia', value: 'CO' },
      { label: 'España', value: 'ES' },
      { label: 'México', value: 'MX' },
      { label: 'Perú', value: 'PE', disabled: true, hint: 'Sin cobertura' },
      { label: 'Uruguay', value: 'UY' },
    ],
  },
];

const FLAT: MimiOption<string>[] = [
  { label: 'Uno', value: '1' },
  { label: 'Dos', value: '2' },
  { label: 'Tres', value: '3' },
];

@Component({
  imports: [MimiSelectImports, MimiFormField, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <button data-test="before">Antes</button>
    <mimi-select
      data-test="plain"
      aria-label="País"
      placeholder="Selecciona un país"
      [(value)]="country"
      [options]="countries"
      [clearable]="clearable()"
      [disabled]="off()"
      [loading]="loading()"
      [class]="extra()"
      [panelClass]="panelExtra()"
    />
    <button data-test="after">Después</button>

    <mimi-select
      data-test="search"
      aria-label="País con buscador"
      placeholder="Selecciona un país"
      search
      searchPlaceholder="Buscar país…"
      [(value)]="searched"
      [options]="countries"
      (searchChange)="queries.push($event)"
      (touch)="touches = touches + 1"
    />

    <mimi-select
      data-test="objects"
      aria-label="Ciudad"
      [(value)]="city"
      [options]="cities()"
      [compareWith]="sameCity"
    >
      <ng-template mimiSelectOption let-option let-query="query" let-trigger="trigger">
        <span data-test="custom" [attr.data-trigger]="trigger">{{ option.label }}!</span>
      </ng-template>
    </mimi-select>

    <form [formGroup]="group">
      <mimi-form-field label="Número">
        <mimi-select data-test="reactive" formControlName="number" [options]="flat" />
      </mimi-form-field>
    </form>
    <mimi-select
      data-test="signal"
      aria-label="Señal"
      [formField]="signalForm.number"
      [options]="flat"
    />
    <mimi-select
      data-test="ng-model"
      aria-label="Modelo"
      name="n"
      [(ngModel)]="model"
      [options]="flat"
    />
    <label for="external">Externa</label>
    <mimi-select data-test="external" id="external" [options]="flat" />
  `,
})
class Host {
  readonly countries = COUNTRIES;
  readonly flat = FLAT;
  readonly country = signal<string | null>(null);
  readonly searched = signal<string | null>('MX');
  readonly clearable = signal(false);
  readonly off = signal(false);
  readonly loading = signal(false);
  readonly extra = signal('');
  readonly panelExtra = signal('');
  readonly queries: string[] = [];
  touches = 0;

  readonly cities = signal<MimiOption<City>[]>([
    { label: 'Lima', value: { id: 1, name: 'Lima' } },
    { label: 'Quito', value: { id: 2, name: 'Quito' } },
  ]);
  readonly city = signal<City | null>({ id: 2, name: 'Quito' });
  readonly sameCity = (a: City, b: City) => a.id === b.id;

  readonly group = new FormGroup({
    number: new FormControl<string | null>(null, Validators.required),
  });
  readonly locked = signal(false);
  readonly data = signal<{ number: string | null }>({ number: null });
  readonly signalForm = form(this.data, (p) => {
    required(p.number);
    disabled(p.number, () => this.locked());
  });
  readonly model = signal<string | null>(null);
}

/** aria reenvía las teclas y cierra en tareas posteriores al render. */
const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

const key = (target: Element, k: string, init: KeyboardEventInit = {}) =>
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }),
  );

describe('MimiSelect', () => {
  beforeAll(() => {
    // jsdom no lo implementa; aria lo usa para traer la opción activa a la vista.
    Element.prototype.scrollIntoView ??= () => undefined;
  });

  async function setup() {
    TestBed.configureTestingModule({ providers: [provideMimiSelectText(MIMI_SELECT_TEXT_ES)] });
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const host = (id: string) => root.querySelector<HTMLElement>(`mimi-select[data-test="${id}"]`)!;
    const box = (id: string) => host(id).querySelector<HTMLElement>(':scope > div')!;
    const trigger = (id: string) => host(id).querySelector<HTMLButtonElement>('[role="combobox"]')!;
    const panel = () => document.querySelector<HTMLElement>('[data-mimi-overlay-panel]');
    const listbox = () => panel()!.querySelector<HTMLElement>('[role="listbox"]')!;
    const options = () => Array.from(panel()!.querySelectorAll<HTMLElement>('[role="option"]'));
    const option = (label: string) => options().find((o) => o.textContent?.includes(label))!;
    const active = (el: Element) =>
      document.getElementById(el.getAttribute('aria-activedescendant') ?? '-')?.textContent?.trim();
    const searchInput = () => panel()!.querySelector<HTMLInputElement>('input')!;
    const press = async (target: Element, k: string, init?: KeyboardEventInit) => {
      key(target, k, init);
      await settle(fixture);
    };
    const open = async (id: string) => {
      trigger(id).focus();
      trigger(id).click();
      await settle(fixture);
    };
    const type = async (text: string) => {
      const input = searchInput();
      input.value = text;
      input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      await settle(fixture);
    };
    return {
      fixture,
      root,
      h: fixture.componentInstance,
      host,
      box,
      trigger,
      panel,
      listbox,
      options,
      option,
      active,
      searchInput,
      press,
      open,
      type,
    };
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
  });

  it('cerrado: un button con role="combobox", el placeholder y el alto de los controles', async () => {
    const { trigger, box, host, panel } = await setup();
    const btn = trigger('plain');
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-haspopup')).toBe('listbox');
    expect(btn.getAttribute('aria-label')).toBe('País');
    expect(btn.textContent?.trim()).toBe('Selecciona un país');
    expect(panel()).toBeNull();
    for (const cls of [
      'h-[var(--mimi-select-height,var(--mimi-control-height,2.5rem))]',
      'rounded-[var(--mimi-select-radius,var(--mimi-radius,0.75rem))]',
      'border-[color:var(--mimi-select-border,var(--mimi-input))]',
      'bg-[color:var(--mimi-select-trigger-bg,var(--mimi-input-background))]',
      'has-[[role=combobox]:focus]:border-ring',
      'has-[[role=combobox]:focus]:ring-ring-soft',
      'data-[invalid]:border-destructive',
    ]) {
      expect(box('plain').classList).toContain(cls);
    }
    expect(box('plain').dataset['state']).toBe('closed');
    expect(box('plain').hasAttribute('data-placeholder')).toBe(true);
    expect(host('plain').hasAttribute('aria-label')).toBe(false);
    expect(trigger('search').getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('al abrir: listbox con grupo, opción deshabilitada con su texto y la elegida activa', async () => {
    const { h, fixture, open, trigger, box, listbox, options, option, active, panel } =
      await setup();
    h.country.set('CL');
    await settle(fixture);
    expect(trigger('plain').textContent?.trim()).toBe('Chile');
    await open('plain');
    const btn = trigger('plain');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(btn.getAttribute('aria-controls')).toBe(listbox().id);
    expect(box('plain').dataset['state']).toBe('open');
    expect(listbox().getAttribute('aria-label')).toBe('País');
    expect(options().length).toBe(8);
    const group = listbox().querySelector('[role="group"]')!;
    expect(document.getElementById(group.getAttribute('aria-labelledby')!)?.textContent).toBe(
      'Latinoamérica y España',
    );
    expect(option('Perú').getAttribute('aria-disabled')).toBe('true');
    expect(option('Perú').textContent).toContain('Sin cobertura');
    expect(option('Chile').getAttribute('aria-selected')).toBe('true');
    expect(option('Chile').querySelector('svg')).not.toBeNull();
    expect(option('Brasil').getAttribute('aria-selected')).toBe('false');
    expect(active(btn)).toBe('Chile');
    expect(option('Chile').classList).toContain('h-[var(--mimi-select-option-height,34px)]');
    expect(panel()!.classList).toContain(
      'shadow-[shadow:var(--mimi-select-menu-shadow,var(--mimi-shadow-popover))]',
    );
  });

  it('teclado: ↓ abre, las flechas saltan la deshabilitada, Inicio/Fin, letra y Enter elige', async () => {
    const { h, trigger, press, active, panel } = await setup();
    const btn = trigger('plain');
    btn.focus();
    await press(btn, 'ArrowDown');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(active(btn)).toBe('Argentina');
    await press(btn, 'End');
    expect(active(btn)).toBe('Uruguay');
    await press(btn, 'ArrowUp');
    expect(active(btn)).toBe('México');
    await press(btn, 'ArrowDown');
    await press(btn, 'ArrowDown');
    expect(active(btn)).toBe('Argentina');
    await press(btn, 'Home');
    await press(btn, 'e');
    expect(active(btn)).toBe('España');
    await press(btn, 'Enter');
    expect(h.country()).toBe('ES');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(btn);
    expect(btn.textContent?.trim()).toBe('España');
  });

  it('elegir la opción ya elegida no la desmarca: solo cierra', async () => {
    const { h, fixture, trigger, press, open, option, panel } = await setup();
    h.country.set('CO');
    await settle(fixture);
    const btn = trigger('plain');
    btn.focus();
    await press(btn, 'Enter');
    await press(btn, 'Enter');
    expect(h.country()).toBe('CO');
    expect(panel()).toBeNull();
    await open('plain');
    option('Colombia').click();
    await settle(fixture);
    expect(h.country()).toBe('CO');
    expect(panel()).toBeNull();
  });

  it('clic: elige y devuelve el foco; en una deshabilitada no elige ni cierra', async () => {
    const { h, fixture, trigger, open, option, panel } = await setup();
    await open('plain');
    option('Perú').click();
    await settle(fixture);
    expect(h.country()).toBeNull();
    expect(panel()).not.toBeNull();
    option('Brasil').click();
    await settle(fixture);
    expect(h.country()).toBe('BR');
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger('plain'));
  });

  it('Escape cierra sin cambiar; ↑ y Alt+↓ abren; Alt+↑ elige la activa', async () => {
    const { h, trigger, press, active } = await setup();
    const btn = trigger('plain');
    btn.focus();
    await press(btn, 'ArrowUp');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    await press(btn, 'ArrowDown');
    await press(btn, 'Escape');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(h.country()).toBeNull();
    await press(btn, 'ArrowDown', { altKey: true });
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    await press(btn, 'ArrowDown');
    expect(active(btn)).toBe('Brasil');
    await press(btn, 'ArrowUp', { altKey: true });
    expect(h.country()).toBe('BR');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  it('Espacio abre y elige, pero dentro de una búsqueda por letra es parte del texto', async () => {
    const { h, trigger, press } = await setup();
    const btn = trigger('plain');
    btn.focus();
    await press(btn, ' ');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    await press(btn, 'c');
    await press(btn, ' ');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(h.country()).toBeNull();
  });

  it('Tab (el foco sale) cierra sin elegir y marca el control como tocado', async () => {
    const { fixture, h, root, trigger, press, panel } = await setup();
    const btn = trigger('plain');
    btn.focus();
    await press(btn, 'ArrowDown');
    root.querySelector<HTMLElement>('[data-test="after"]')!.focus();
    await settle(fixture);
    expect(panel()).toBeNull();
    expect(h.country()).toBeNull();
  });

  it('limpiar: aparece con valor, quita el valor y deja el foco en el disparador', async () => {
    const { fixture, h, host, trigger } = await setup();
    const clear = () => host('plain').querySelector<HTMLButtonElement>('button:not([role])');
    h.country.set('AR');
    await settle(fixture);
    expect(clear()).toBeNull();
    h.clearable.set(true);
    await settle(fixture);
    expect(clear()!.getAttribute('aria-label')).toBe('Limpiar selección');
    expect(clear()!.getAttribute('type')).toBe('button');
    clear()!.click();
    await settle(fixture);
    expect(h.country()).toBeNull();
    expect(clear()).toBeNull();
    expect(document.activeElement).toBe(trigger('plain'));
    h.country.set('AR');
    h.off.set(true);
    await settle(fixture);
    expect(clear()).toBeNull();
  });

  it('deshabilitado: disabled nativo, data-disabled y no abre', async () => {
    const { fixture, h, trigger, box, panel } = await setup();
    h.off.set(true);
    await settle(fixture);
    expect(trigger('plain').disabled).toBe(true);
    expect(box('plain').hasAttribute('data-disabled')).toBe(true);
    expect(box('plain').classList).toContain(
      'data-[disabled]:opacity-[var(--mimi-disabled-opacity,0.5)]',
    );
    trigger('plain').click();
    key(trigger('plain'), 'ArrowDown');
    await settle(fixture);
    expect(panel()).toBeNull();
  });

  it('cargando: spinner en el disparador y, en el panel, aria-busy sin opciones', async () => {
    const { fixture, h, host, open, panel, options } = await setup();
    h.loading.set(true);
    await settle(fixture);
    expect(host('plain').querySelector('[data-slot="spinner"]')).not.toBeNull();
    await open('plain');
    expect(options().length).toBe(0);
    const busy = panel()!.querySelector('[aria-busy="true"]')!;
    expect(busy.textContent).toContain('Cargando…');
    h.loading.set(false);
    await settle(fixture);
    expect(panel()!.querySelector('[aria-busy="true"]')).toBeNull();
    expect(options().length).toBe(8);
  });

  it('buscador: panel dialog con nombre, foco en el input (combobox) y la lista filtrada', async () => {
    const { h, open, panel, searchInput, type, options, active, option } = await setup();
    await open('search');
    expect(panel()!.getAttribute('role')).toBe('dialog');
    expect(panel()!.getAttribute('aria-label')).toBe('País con buscador');
    const input = searchInput();
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute('role')).toBe('combobox');
    expect(input.getAttribute('aria-label')).toBe('Buscar país…');
    expect(input.getAttribute('placeholder')).toBe('Buscar país…');
    expect(input.getAttribute('aria-controls')).toBe(
      panel()!.querySelector('[role="listbox"]')!.id,
    );
    expect(active(input)).toBe('México');
    expect(panel()!.querySelector('[data-slot="count"]')).toBeNull();

    await type('col');
    expect(options().map((o) => o.textContent?.trim())).toEqual(['Colombia']);
    expect(panel()!.querySelector('[data-slot="count"]')!.textContent).toBe('1 resultado');
    expect(option('Colombia').querySelector('mark')!.textContent).toBe('Col');
    expect(active(input)).toBe('Colombia');
    // La elegida (México) quedó fuera del filtro: el valor no cambia.
    expect(h.searched()).toBe('MX');
    expect(h.queries).toEqual(['col']);

    await type('');
    expect(options().length).toBe(8);
    expect(option('México').getAttribute('aria-selected')).toBe('true');
    expect(h.searched()).toBe('MX');
  });

  it('buscador: sin tildes ni mayúsculas, sin resultados y Enter elige la activa', async () => {
    const { h, trigger, open, panel, searchInput, type, options, press } = await setup();
    await open('search');
    await type('Japón');
    expect(options().length).toBe(0);
    const status = panel()!.querySelector('[role="status"]')!;
    expect(status.textContent).toContain('Sin resultados');
    expect(status.textContent).toContain('No hay opciones que coincidan con «Japón».');
    await press(searchInput(), 'Enter');
    expect(h.searched()).toBe('MX');
    expect(panel()).not.toBeNull();

    await type('PERU');
    expect(options().map((o) => o.textContent?.trim())).toEqual(['PerúSin cobertura']);
    await type('espana');
    await press(searchInput(), 'Enter');
    expect(h.searched()).toBe('ES');
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger('search'));
    // Al cerrar, la búsqueda se vacía.
    expect(h.queries.at(-1)).toBe('');
    await open('search');
    expect(searchInput().value).toBe('');
    expect(options().length).toBe(8);
  });

  it('buscador: las flechas mueven la activa desde el input; Escape y Tab vuelven al disparador', async () => {
    const { h, trigger, open, panel, searchInput, press, active } = await setup();
    await open('search');
    await press(searchInput(), 'ArrowDown');
    expect(active(searchInput())).toBe('Uruguay');
    expect(document.activeElement).toBe(searchInput());
    await press(searchInput(), 'Escape');
    expect(panel()).toBeNull();
    expect(h.searched()).toBe('MX');
    expect(document.activeElement).toBe(trigger('search'));

    await open('search');
    await press(searchInput(), 'Tab');
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger('search'));
  });

  it('touch: no al pasar el foco al buscador, sí al salir del Select', async () => {
    const { fixture, h, root, open, searchInput, option } = await setup();
    await open('search');
    expect(document.activeElement).toBe(searchInput());
    expect(h.touches).toBe(0);
    option('Chile').click();
    await settle(fixture);
    expect(h.touches).toBe(0);
    root.querySelector<HTMLElement>('[data-test="after"]')!.focus();
    await settle(fixture);
    expect(h.touches).toBe(1);
  });

  it('objetos con compareWith, plantilla propia y un valor que no está en las opciones', async () => {
    const { fixture, h, trigger, open, options, option } = await setup();
    const btn = trigger('objects');
    const custom = btn.querySelector('[data-test="custom"]')!;
    expect(custom.textContent).toBe('Quito!');
    expect(custom.getAttribute('data-trigger')).toBe('true');
    await open('objects');
    expect(option('Quito').getAttribute('aria-selected')).toBe('true');
    expect(options()[0].querySelector('[data-test="custom"]')!.getAttribute('data-trigger')).toBe(
      'false',
    );
    option('Lima').click();
    await settle(fixture);
    expect(h.city()).toEqual({ id: 1, name: 'Lima' });
    // La opción elegida sale de la lista (búsqueda en el servidor): se conserva su texto.
    h.cities.set([{ label: 'Quito', value: { id: 2, name: 'Quito' } }]);
    await settle(fixture);
    expect(trigger('objects').textContent?.trim()).toBe('Lima!');
    h.city.set({ id: 9, name: 'Otra' });
    await settle(fixture);
    expect(trigger('objects').querySelector('[data-test="custom"]')).toBeNull();
  });

  it('Reactive Forms con mimi-form-field: etiqueta, valor, touch, error y deshabilitado', async () => {
    const { fixture, h, root, trigger, box, open, option } = await setup();
    const btn = trigger('reactive');
    const field = root.querySelector('mimi-form-field')!;
    const label = field.querySelector('label')!;
    expect(label.getAttribute('for')).toBe(btn.id);
    const error = field.querySelector('mimi-form-error')!;
    expect(btn.getAttribute('aria-describedby')).toContain(error.id);
    expect(btn.hasAttribute('aria-invalid')).toBe(false);

    btn.focus();
    root.querySelector<HTMLElement>('[data-test="after"]')!.focus();
    await settle(fixture);
    expect(h.group.controls.number.touched).toBe(true);
    expect(btn.getAttribute('aria-invalid')).toBe('true');
    expect(box('reactive').hasAttribute('data-invalid')).toBe(true);
    expect(error.textContent?.trim()).toBe('This field is required.');

    await open('reactive');
    expect(document.querySelector('[role="listbox"]')!.getAttribute('aria-label')).toBe('Número');
    option('Dos').click();
    await settle(fixture);
    expect(h.group.controls.number.value).toBe('2');
    expect(btn.hasAttribute('aria-invalid')).toBe(false);

    h.group.controls.number.setValue('3');
    h.group.controls.number.disable();
    await settle(fixture);
    expect(btn.textContent?.trim()).toBe('Tres');
    expect(btn.disabled).toBe(true);
  });

  it('Signal Forms: valor, required, touched y disabled', async () => {
    const { fixture, h, root, trigger, open, option } = await setup();
    const btn = trigger('signal');
    expect(btn.getAttribute('aria-required')).toBe('true');
    await open('signal');
    option('Uno').click();
    await settle(fixture);
    expect(h.data().number).toBe('1');
    root.querySelector<HTMLElement>('[data-test="after"]')!.focus();
    await settle(fixture);
    expect(h.signalForm.number().touched()).toBe(true);
    h.data.set({ number: '3' });
    h.locked.set(true);
    await settle(fixture);
    expect(btn.textContent?.trim()).toBe('Tres');
    expect(btn.disabled).toBe(true);
  });

  it('ngModel: en los dos sentidos', async () => {
    const { fixture, h, trigger, open, option } = await setup();
    await open('ng-model');
    option('Tres').click();
    await settle(fixture);
    expect(h.model()).toBe('3');
    h.model.set('1');
    await settle(fixture);
    expect(trigger('ng-model').textContent?.trim()).toBe('Uno');
  });

  it('id pasa al botón (etiqueta externa) y focus() lo enfoca', async () => {
    const { fixture, host, trigger } = await setup();
    expect(trigger('external').id).toBe('external');
    expect(host('external').hasAttribute('id')).toBe(false);
    const select = fixture.debugElement.query((d) => d.nativeElement.dataset?.test === 'external')
      .componentInstance as MimiSelect;
    select.focus();
    expect(document.activeElement).toBe(trigger('external'));
  });

  it('class va al disparador y panelClass al panel; ganan las del usuario', async () => {
    const { fixture, h, host, box, open, panel } = await setup();
    h.extra.set('h-12 w-60 rounded-full');
    h.panelExtra.set('rounded-none shadow-none');
    await settle(fixture);
    expect(host('plain').hasAttribute('class')).toBe(false);
    for (const cls of ['h-12', 'w-60', 'rounded-full'])
      expect(box('plain').classList).toContain(cls);
    expect(box('plain').classList).not.toContain('w-full');
    expect(box('plain').classList).not.toContain(
      'h-[var(--mimi-select-height,var(--mimi-control-height,2.5rem))]',
    );
    expect(box('plain').classList).not.toContain(
      'rounded-[var(--mimi-select-radius,var(--mimi-radius,0.75rem))]',
    );
    await open('plain');
    expect(panel()!.classList).toContain('rounded-none');
    expect(panel()!.classList).toContain('shadow-none');
    expect(panel()!.classList).not.toContain(
      'shadow-[shadow:var(--mimi-select-menu-shadow,var(--mimi-shadow-popover))]',
    );
  });
});
