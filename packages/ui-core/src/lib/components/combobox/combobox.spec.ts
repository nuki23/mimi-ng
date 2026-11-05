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
import type { MimiListOption } from '@/components/ui/option-list';
import { MimiCombobox, MimiComboboxImports } from './combobox';
import { MIMI_COMBOBOX_TEXT_ES, provideMimiComboboxText } from './combobox-texts';

const CITIES: MimiListOption<string>[] = [
  { label: 'Bogotá', value: 'bog', hint: 'Colombia' },
  { label: 'Buenos Aires', value: 'bue', hint: 'Argentina' },
  { label: 'Ciudad de México', value: 'mex', hint: 'México' },
  { label: 'Lima', value: 'lim', hint: 'Perú', disabled: true },
  { label: 'Medellín', value: 'med', hint: 'Colombia' },
  { label: 'Montevideo', value: 'mvd', hint: 'Uruguay' },
];

const FLAT: MimiListOption<string>[] = [
  { label: 'Uno', value: '1' },
  { label: 'Dos', value: '2' },
];

@Component({
  imports: [MimiComboboxImports, MimiFormField, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <button data-test="before">Antes</button>
    <mimi-combobox
      data-test="plain"
      aria-label="Ciudad"
      placeholder="Busca una ciudad"
      [(value)]="city"
      [options]="cities()"
      [creatable]="creatable()"
      [loading]="loading()"
      [disabled]="off()"
      [class]="extra()"
      [panelClass]="panelExtra()"
      (searchChange)="queries.push($event)"
      (create)="onCreate($event)"
      (touch)="touches = touches + 1"
    >
      <svg mimiComboboxStart data-test="pin"></svg>
    </mimi-combobox>
    <button data-test="after">Después</button>

    <mimi-combobox data-test="custom" aria-label="Personalizada" [options]="flat">
      <ng-template mimiComboboxOption let-option let-query="query">
        <span data-test="tpl">{{ option.label }}·{{ query }}</span>
      </ng-template>
    </mimi-combobox>

    <form [formGroup]="group">
      <mimi-form-field label="Número">
        <mimi-combobox data-test="reactive" formControlName="number" [options]="flat" />
      </mimi-form-field>
    </form>
    <mimi-combobox
      data-test="signal"
      aria-label="Señal"
      [formField]="signalForm.number"
      [options]="flat"
    />
    <mimi-combobox
      data-test="ng-model"
      aria-label="Modelo"
      name="n"
      [(ngModel)]="model"
      [options]="flat"
    />
  `,
})
class Host {
  readonly cities = signal<MimiListOption<string>[]>(CITIES);
  readonly flat = FLAT;
  readonly city = signal<string | null>(null);
  readonly creatable = signal(false);
  readonly loading = signal(false);
  readonly off = signal(false);
  readonly extra = signal('');
  readonly panelExtra = signal('');
  readonly queries: string[] = [];
  readonly created: string[] = [];
  addOnCreate = true;
  touches = 0;

  onCreate(text: string): void {
    this.created.push(text);
    if (this.addOnCreate) this.cities.update((list) => [...list, { label: text, value: text }]);
  }

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

describe('MimiCombobox', () => {
  beforeAll(() => {
    // jsdom no lo implementa; aria lo usa para traer la opción activa a la vista.
    Element.prototype.scrollIntoView ??= () => undefined;
  });

  async function setup() {
    TestBed.configureTestingModule({
      providers: [provideMimiComboboxText(MIMI_COMBOBOX_TEXT_ES)],
    });
    const fixture = TestBed.createComponent(Host);
    await settle(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const host = (id: string) =>
      root.querySelector<HTMLElement>(`mimi-combobox[data-test="${id}"]`)!;
    const box = (id: string) => host(id).querySelector<HTMLElement>('[data-slot="box"]')!;
    const input = (id: string) => host(id).querySelector<HTMLInputElement>('input')!;
    const panel = () => document.querySelector<HTMLElement>('[data-mimi-overlay-panel]');
    const listbox = () => panel()!.querySelector<HTMLElement>('[role="listbox"]')!;
    const options = () => Array.from(panel()!.querySelectorAll<HTMLElement>('[role="option"]'));
    const option = (label: string) => options().find((o) => o.textContent?.includes(label))!;
    const status = () => panel()!.querySelector<HTMLElement>('[role="status"]')!;
    const active = (el: Element) =>
      document.getElementById(el.getAttribute('aria-activedescendant') ?? '-')?.textContent?.trim();
    const press = async (target: Element, k: string, init: KeyboardEventInit = {}) => {
      target.dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }),
      );
      await settle(fixture);
    };
    const type = async (id: string, text: string) => {
      const el = input(id);
      el.focus();
      el.value = text;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
      await settle(fixture);
    };
    const blur = async (id: string) => {
      const next = root.querySelector<HTMLElement>('[data-test="after"]')!;
      input(id).dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: next }));
      next.focus();
      await settle(fixture);
    };
    return {
      fixture,
      root,
      h: fixture.componentInstance,
      host,
      box,
      input,
      panel,
      listbox,
      options,
      option,
      status,
      active,
      press,
      type,
      blur,
    };
  }

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((el) => el.replaceChildren());
  });

  it('cerrado: un <input> con role="combobox", lista, autocomplete="off" y la caja de Input', async () => {
    const { input, box, host, panel } = await setup();
    const el = input('plain');
    expect(el.getAttribute('role')).toBe('combobox');
    expect(el.getAttribute('aria-autocomplete')).toBe('list');
    expect(el.getAttribute('aria-haspopup')).toBe('listbox');
    expect(el.getAttribute('aria-expanded')).toBe('false');
    expect(el.getAttribute('autocomplete')).toBe('off');
    expect(el.getAttribute('aria-label')).toBe('Ciudad');
    expect(el.getAttribute('placeholder')).toBe('Busca una ciudad');
    expect(host('plain').hasAttribute('aria-label')).toBe(false);
    expect(panel()).toBeNull();
    for (const cls of [
      'h-[var(--mimi-combobox-height,var(--mimi-control-height,2.5rem))]',
      'rounded-[var(--mimi-combobox-radius,var(--mimi-radius,0.75rem))]',
      'border-input',
      'bg-input-background',
      'focus-within:ring-ring-soft',
      'data-[invalid]:border-destructive',
    ]) {
      expect(box('plain').classList).toContain(cls);
    }
    expect(box('plain').dataset['state']).toBe('closed');
    // El ícono del principio va dentro de la caja, oculto para los lectores.
    const pin = box('plain').querySelector('[data-test="pin"]')!;
    expect(pin.getAttribute('data-slot')).toBe('start');
    expect(pin.getAttribute('aria-hidden')).toBe('true');
  });

  it('↓ abre la lista con todas las opciones, la deshabilitada y su texto secundario', async () => {
    const { input, press, listbox, options, option, panel, box } = await setup();
    const el = input('plain');
    el.focus();
    await press(el, 'ArrowDown');
    expect(el.getAttribute('aria-expanded')).toBe('true');
    expect(el.getAttribute('aria-controls')).toBe(listbox().id);
    expect(box('plain').dataset['state']).toBe('open');
    expect(listbox().getAttribute('aria-label')).toBe('Ciudad');
    expect(options().length).toBe(6);
    expect(option('Lima').getAttribute('aria-disabled')).toBe('true');
    expect(option('Bogotá').textContent).toContain('Colombia');
    expect(option('Bogotá').classList).toContain('min-h-[var(--mimi-combobox-option-height,34px)]');
    expect(panel()!.classList).toContain(
      'shadow-[shadow:var(--mimi-combobox-menu-shadow,var(--mimi-shadow-popover))]',
    );
    expect(listbox().classList).toContain('max-h-[var(--mimi-combobox-menu-max-height,228px)]');
  });

  it('escribir filtra sin tildes ni mayúsculas, resalta, activa la primera y emite searchChange', async () => {
    const { h, input, type, options, option, active, status } = await setup();
    await type('plain', 'MEDE');
    const el = input('plain');
    expect(el.getAttribute('aria-expanded')).toBe('true');
    expect(options().length).toBe(1);
    expect(options()[0].textContent).toContain('Medellín');
    expect(option('Medellín').querySelector('mark')?.textContent).toBe('Mede');
    expect(active(el)).toContain('Medellín');
    expect(h.queries).toEqual(['MEDE']);
    // El anuncio de la cantidad de resultados, en la región status.
    expect(status().textContent?.trim()).toBe('1 resultado');
    await type('plain', 'o');
    expect(options().length).toBe(4);
    expect(status().textContent?.trim()).toBe('4 resultados');
  });

  it('Enter elige la activa, cierra y deja el texto de la opción; el foco sigue en el campo', async () => {
    const { h, input, type, press, panel } = await setup();
    await type('plain', 'monte');
    const el = input('plain');
    await press(el, 'Enter');
    expect(h.city()).toBe('mvd');
    expect(el.getAttribute('aria-expanded')).toBe('false');
    expect(panel()).toBeNull();
    expect(el.value).toBe('Montevideo');
    expect(document.activeElement).toBe(el);
  });

  it('las flechas se mueven por la lista y saltan la deshabilitada', async () => {
    const { h, input, press, active } = await setup();
    const el = input('plain');
    el.focus();
    await press(el, 'ArrowDown');
    expect(active(el)).toContain('Bogotá');
    await press(el, 'ArrowDown');
    await press(el, 'ArrowDown');
    expect(active(el)).toContain('Ciudad de México');
    await press(el, 'ArrowDown');
    expect(active(el)).toContain('Medellín');
    await press(el, 'Enter');
    expect(h.city()).toBe('med');
  });

  it('clic: elige una habilitada; en la deshabilitada no elige ni cierra', async () => {
    const { h, fixture, input, option, panel } = await setup();
    input('plain').focus();
    input('plain').click();
    await settle(fixture);
    option('Lima').click();
    await settle(fixture);
    expect(h.city()).toBeNull();
    expect(panel()).not.toBeNull();
    option('Bogotá').click();
    await settle(fixture);
    expect(h.city()).toBe('bog');
    expect(panel()).toBeNull();
    expect(input('plain').value).toBe('Bogotá');
  });

  it('un clic en la caja (fuera del campo) enfoca el campo y abre; otro cierra', async () => {
    const { fixture, box, input, panel } = await setup();
    const chevron = box('plain').querySelector('[data-slot="chevron"]')!;
    chevron.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    await settle(fixture);
    expect(document.activeElement).toBe(input('plain'));
    expect(panel()).not.toBeNull();
    chevron.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    await settle(fixture);
    expect(panel()).toBeNull();
  });

  it('el valor desde fuera pone el texto de la opción; elegir la elegida no la desmarca', async () => {
    const { h, fixture, input, press, option, panel } = await setup();
    h.city.set('bue');
    await settle(fixture);
    const el = input('plain');
    expect(el.value).toBe('Buenos Aires');
    el.focus();
    await press(el, 'ArrowDown');
    // Sin escribir, la lista no se filtra: la elegida está marcada.
    expect(option('Buenos Aires').getAttribute('aria-selected')).toBe('true');
    expect(option('Bogotá').getAttribute('aria-selected')).toBe('false');
    option('Buenos Aires').click();
    await settle(fixture);
    expect(h.city()).toBe('bue');
    expect(panel()).toBeNull();
  });

  it('Escape con el panel abierto cierra y deja lo escrito; cerrado, vacía el campo y el valor', async () => {
    const { h, fixture, input, type, press } = await setup();
    h.city.set('bog');
    await settle(fixture);
    await type('plain', 'Bo');
    const el = input('plain');
    await press(el, 'Escape');
    expect(el.getAttribute('aria-expanded')).toBe('false');
    expect(el.value).toBe('Bo');
    expect(h.city()).toBe('bog');
    await press(el, 'Escape');
    expect(el.value).toBe('');
    expect(h.city()).toBeNull();
    expect(h.queries.at(-1)).toBe('');
  });

  it('al salir, lo escrito sin elegir se descarta y vuelve el texto elegido; vacío quita el valor', async () => {
    const { h, fixture, input, type, blur } = await setup();
    h.city.set('mex');
    await settle(fixture);
    await type('plain', 'zzz');
    await blur('plain');
    expect(input('plain').value).toBe('Ciudad de México');
    expect(h.city()).toBe('mex');
    expect(h.touches).toBeGreaterThan(0);
    await type('plain', '');
    await blur('plain');
    expect(input('plain').value).toBe('');
    expect(h.city()).toBeNull();
  });

  it('↑ y Alt+↓ abren con el panel cerrado; Alt+↑ cierra', async () => {
    const { input, press } = await setup();
    const el = input('plain');
    el.focus();
    await press(el, 'ArrowUp');
    expect(el.getAttribute('aria-expanded')).toBe('true');
    await press(el, 'ArrowUp', { altKey: true });
    expect(el.getAttribute('aria-expanded')).toBe('false');
    await press(el, 'ArrowDown', { altKey: true });
    expect(el.getAttribute('aria-expanded')).toBe('true');
  });

  it('sin resultados: región status con el título, el detalle y sin lista', async () => {
    const { type, status, listbox } = await setup();
    await type('plain', 'Tokio');
    expect(status().textContent).toContain('Sin resultados para «Tokio»');
    expect(status().textContent).toContain('Revisa la ortografía');
    expect(listbox().classList).toContain('hidden');
  });

  it('creatable: «Crear» al final; elegirla emite (create) y elige la opción cuando llega', async () => {
    const { h, fixture, input, type, press, options, option } = await setup();
    h.creatable.set(true);
    await settle(fixture);
    await type('plain', '  Tokio ');
    const create = option('Crear «Tokio»');
    expect(create.getAttribute('data-slot')).toBe('create');
    expect(options().at(-1)).toBe(create);
    expect(create.classList).toContain('text-info-soft-foreground');
    const el = input('plain');
    await press(el, 'Enter');
    expect(h.created).toEqual(['Tokio']);
    expect(h.city()).toBe('Tokio');
    expect(el.value).toBe('Tokio');
    // Si ya existe una opción con ese texto (sin tildes ni mayúsculas), no se ofrece crear.
    await type('plain', 'bogota');
    expect(options().some((o) => o.dataset['slot'] === 'create')).toBe(false);
  });

  it('creatable: si la app no agrega la opción, el valor no cambia', async () => {
    const { h, fixture, type, press, input, blur } = await setup();
    h.creatable.set(true);
    h.addOnCreate = false;
    await settle(fixture);
    await type('plain', 'Quito');
    await press(input('plain'), 'Enter');
    expect(h.created).toEqual(['Quito']);
    expect(h.city()).toBeNull();
    await blur('plain');
    expect(input('plain').value).toBe('');
  });

  it('loading: spinner en el campo, aria-busy y el texto de carga en vez de la lista', async () => {
    const { h, fixture, box, input, press, panel, options } = await setup();
    h.loading.set(true);
    await settle(fixture);
    expect(box('plain').querySelector('[data-slot="spinner"]')).not.toBeNull();
    input('plain').focus();
    await press(input('plain'), 'ArrowDown');
    expect(options().length).toBe(0);
    expect(panel()!.querySelector('[role="listbox"]')!.getAttribute('aria-busy')).toBe('true');
    expect(panel()!.querySelector('[data-slot="loading"]')?.textContent).toContain('Buscando…');
    h.loading.set(false);
    await settle(fixture);
    expect(options().length).toBe(6);
  });

  it('búsqueda en el servidor: la elegida conserva su texto aunque salga de options', async () => {
    const { h, fixture, input } = await setup();
    h.city.set('lim');
    await settle(fixture);
    h.cities.set([{ label: 'Quito', value: 'uio' }]);
    await settle(fixture);
    expect(input('plain').value).toBe('Lima');
  });

  it('plantilla propia de la opción con lo escrito', async () => {
    const { type, panel } = await setup();
    await type('custom', 'u');
    const tpl = panel()!.querySelector('[data-test="tpl"]')!;
    expect(tpl.textContent).toBe('Uno·u');
  });

  it('deshabilitado: el campo no se enfoca ni abre, con data-disabled', async () => {
    const { h, fixture, box, input, panel } = await setup();
    h.off.set(true);
    await settle(fixture);
    expect(input('plain').disabled).toBe(true);
    expect(box('plain').hasAttribute('data-disabled')).toBe(true);
    box('plain').dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    await settle(fixture);
    expect(panel()).toBeNull();
  });

  it('class va a la caja y panelClass al panel, mezcladas con cn()', async () => {
    const { h, fixture, box, input, press, panel } = await setup();
    h.extra.set('h-12 rounded-none');
    h.panelExtra.set('shadow-[shadow:var(--x)]');
    await settle(fixture);
    expect(box('plain').classList).toContain('h-12');
    expect(box('plain').classList).toContain('rounded-none');
    expect(box('plain').className).not.toContain('h-[var(--mimi-combobox-height');
    input('plain').focus();
    await press(input('plain'), 'ArrowDown');
    expect(panel()!.classList).toContain('shadow-[shadow:var(--x)]');
    expect(panel()!.className).not.toContain('--mimi-combobox-menu-shadow');
  });

  it('Reactive Forms: elige, marca tocado al salir y muestra el error de requerido', async () => {
    const { h, fixture, host, input, box, type, press, blur } = await setup();
    await type('reactive', 'dos');
    await press(input('reactive'), 'Enter');
    expect(h.group.value.number).toBe('2');
    h.group.controls.number.setValue(null);
    await settle(fixture);
    expect(input('reactive').value).toBe('');
    await blur('reactive');
    expect(h.group.controls.number.touched).toBe(true);
    expect(box('reactive').hasAttribute('data-invalid')).toBe(true);
    expect(input('reactive').getAttribute('aria-invalid')).toBe('true');
    expect(host('reactive').closest('mimi-form-field')!.textContent).toBeTruthy();
    h.group.controls.number.disable();
    await settle(fixture);
    expect(input('reactive').disabled).toBe(true);
  });

  it('Signal Forms: elige, required y disabled desde el esquema', async () => {
    const { h, fixture, input, type, press } = await setup();
    expect(input('signal').getAttribute('aria-required')).toBe('true');
    await type('signal', 'uno');
    await press(input('signal'), 'Enter');
    expect(h.data().number).toBe('1');
    h.locked.set(true);
    await settle(fixture);
    expect(input('signal').disabled).toBe(true);
  });

  it('ngModel: en las dos direcciones', async () => {
    const { h, fixture, input, type, press } = await setup();
    h.model.set('2');
    await settle(fixture);
    expect(input('ng-model').value).toBe('Dos');
    await type('ng-model', 'un');
    await press(input('ng-model'), 'Enter');
    expect(h.model()).toBe('1');
  });

  it('expone focus() para el formulario', async () => {
    const { fixture, input } = await setup();
    const combobox = fixture.debugElement.queryAll(
      (de) => de.componentInstance instanceof MimiCombobox,
    )[0].componentInstance as MimiCombobox;
    combobox.focus();
    expect(document.activeElement).toBe(input('plain'));
  });

  describe('alarmas de aria (rodeos, spec 4)', () => {
    it('alarma: el listbox no avisa al elegir: Mimi elige con Enter y con el clic', async () => {
      const { h, input, type, press } = await setup();
      await type('plain', 'bue');
      await press(input('plain'), 'Enter');
      expect(h.city()).toBe('bue');
    });

    it('alarma: aria vacía su valor al filtrar; la elegida sigue marcada al volver a mostrarse', async () => {
      const { h, fixture, input, type, option } = await setup();
      h.city.set('bog');
      await settle(fixture);
      await type('plain', 'monte');
      await type('plain', 'bog');
      expect(option('Bogotá').getAttribute('aria-selected')).toBe('true');
      expect(h.city()).toBe('bog');
      expect(input('plain').value).toBe('bog');
    });

    it('alarma: al escribir, la primera coincidencia queda activa aunque la elegida siga en la lista (gotoFirst)', async () => {
      const { h, fixture, input, type, active } = await setup();
      h.city.set('med');
      await settle(fixture);
      await type('plain', 'e');
      expect(active(input('plain'))).toContain('Buenos Aires');
    });

    it('alarma: el puntero activa la opción (aria solo con el teclado)', async () => {
      const { input, press, option, active, fixture } = await setup();
      const el = input('plain');
      el.focus();
      await press(el, 'ArrowDown');
      option('Montevideo').dispatchEvent(new PointerEvent('pointermove', { bubbles: true }));
      await settle(fixture);
      expect(active(el)).toContain('Montevideo');
    });

    it('alarma #33974: abrir y cerrar en el mismo ciclo, y destruir con el panel abierto, no lanza NG0950', async () => {
      const { h, fixture, input, type, press } = await setup();
      const el = input('plain');
      el.focus();
      // Abrir y cerrar antes de la primera detección de cambios del panel.
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await settle(fixture);
      // Resultados que llegan y se van mientras está abierto.
      await type('plain', 'b');
      h.loading.set(true);
      await settle(fixture);
      h.loading.set(false);
      h.cities.set([]);
      await settle(fixture);
      await press(el, 'Escape');
      await type('plain', 'x');
      expect(() => fixture.destroy()).not.toThrow();
    });
  });
});
