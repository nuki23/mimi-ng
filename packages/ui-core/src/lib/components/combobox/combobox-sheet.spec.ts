import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { MimiListOption } from '@/components/ui/option-list/option-list';
import type { MimiOverlayPresentation } from '@/components/ui/utils/overlay-config';
import { MimiComboboxImports } from './combobox';

// R.34: Combobox en el teléfono abre un diálogo a pantalla completa con su propio campo de
// búsqueda arriba y la lista debajo. El valor, el múltiple, crear y los textos son los de escritorio.
@Component({
  imports: [MimiComboboxImports],
  template: `
    <mimi-combobox
      data-test="single"
      aria-label="Ciudad"
      creatable
      [presentation]="presentation()"
      [options]="options()"
      [(value)]="single"
      (create)="created.push($event)"
      (searchChange)="queries.push($event)"
    />
    <mimi-combobox
      data-test="multi"
      aria-label="Etiquetas"
      multiple
      [options]="options()"
      [(value)]="multi"
    />
  `,
})
class Host {
  readonly presentation = signal<MimiOverlayPresentation>('auto');
  readonly single = signal<string | null>(null);
  readonly multi = signal<string[]>(['ba']);
  readonly created: string[] = [];
  readonly queries: string[] = [];
  readonly options = signal<MimiListOption<string>[]>([
    { label: 'Buenos Aires', value: 'ba' },
    { label: 'Bogotá', value: 'bo' },
    { label: 'Lima', value: 'li' },
  ]);
}

describe('Combobox a pantalla completa (R.34)', { timeout: 20_000 }, () => {
  let narrow = false;
  const original = window.matchMedia;
  beforeAll(() => {
    Element.prototype.scrollIntoView ??= () => undefined;
  });
  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      matches: narrow && query === '(max-width: 639.98px)',
    })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = original;
    narrow = false;
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => {
      for (let i = 0; i < 3; i++) {
        fixture.detectChanges();
        await fixture.whenStable();
        await new Promise((resolve) => setTimeout(resolve));
      }
    };
    await settle();
    const el = fixture.nativeElement as HTMLElement;
    const field = (id: string) =>
      el.querySelector<HTMLInputElement>(`mimi-combobox[data-test="${id}"] input`)!;
    const open = async (id: string) => {
      field(id).focus();
      field(id).click();
      await settle();
    };
    const type = async (input: HTMLInputElement, text: string) => {
      input.value = text;
      input.dispatchEvent(new InputEvent('input', { bubbles: true }));
      await settle();
    };
    const press = async (target: Element, key: string) => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await settle();
    };
    return { host: fixture.componentInstance, settle, field, open, type, press };
  }

  const sheet = () => document.querySelector<HTMLElement>('[data-mimi-sheet]');
  const search = () => sheet()!.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  const options = () => Array.from(sheet()!.querySelectorAll<HTMLElement>('[role="option"]'));

  it('en el teléfono abre a pantalla completa con su buscador arriba y el foco en él', async () => {
    narrow = true;
    const { open } = await setup();
    await open('single');
    expect(sheet()?.dataset['side']).toBe('full');
    expect(document.querySelector('[data-mimi-overlay-panel]')).toBeNull();
    expect(sheet()!.querySelector('[data-slot="title"]')!.textContent?.trim()).toBe('Ciudad');
    expect(search().getAttribute('aria-label')).toBe('Ciudad');
    expect(document.activeElement).toBe(search());
    const listbox = sheet()!.querySelector<HTMLElement>('[role="listbox"]')!;
    expect(search().getAttribute('aria-controls')).toBe(listbox.id);
    expect(options()).toHaveLength(3);
  });

  it('escribir filtra y avisa; Enter elige, cierra y el campo muestra la opción', async () => {
    narrow = true;
    const { host, open, type, press, field } = await setup();
    await open('single');
    await type(search(), 'bog');
    expect(host.queries).toContain('bog');
    // Bogotá y la fila «Crear» (creatable).
    expect(options().map((o) => o.textContent?.trim())).toEqual(['Bogotá', 'Create “bog”']);
    // Tab no cierra (el foco queda atrapado en la hoja).
    await press(search(), 'Tab');
    expect(sheet()?.dataset['state']).toBe('open');
    await press(search(), 'Enter');
    expect(host.single()).toBe('bo');
    expect(sheet()).toBeNull();
    expect(field('single').value).toBe('Bogotá');
  });

  it('crear desde la hoja emite (create); cerrar con la X descarta lo escrito', async () => {
    narrow = true;
    const { host, open, type, settle, field } = await setup();
    await open('single');
    await type(search(), 'Quito');
    const create = sheet()!.querySelector<HTMLElement>('[data-slot="create"]')!;
    expect(create.textContent).toContain('Quito');
    create.click();
    await settle();
    expect(host.created).toEqual(['Quito']);
    await open('single');
    await type(search(), 'xx');
    sheet()!.querySelector<HTMLElement>('[data-slot="close"]')!.click();
    await settle();
    expect(sheet()).toBeNull();
    expect(field('single').value).toBe('');
    expect(host.single()).toBeNull();
  });

  it('múltiple: los chips van debajo del buscador; elegir agrega sin cerrar; quitar un chip', async () => {
    narrow = true;
    const { host, open, settle } = await setup();
    await open('multi');
    const chips = () =>
      Array.from(sheet()!.querySelectorAll('[data-slot="sheet-chips"] mimi-chip'));
    expect(chips().map((c) => c.textContent?.trim())).toEqual(['Buenos Aires']);
    options()
      .find((o) => o.textContent?.includes('Lima'))!
      .click();
    await settle();
    expect(host.multi()).toEqual(['ba', 'li']);
    expect(sheet()?.dataset['state']).toBe('open');
    expect(chips()).toHaveLength(2);
    chips()[0].querySelector<HTMLElement>('button')!.click();
    await settle();
    expect(host.multi()).toEqual(['li']);
    expect(document.activeElement).toBe(search());
  });

  it('Escape en el buscador la cierra y descarta lo escrito (a11y H1)', async () => {
    narrow = true;
    const { host, open, type, press, field } = await setup();
    await open('single');
    await type(search(), 'li');
    await press(search(), 'Escape');
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(sheet()?.dataset['state'] ?? 'closed').not.toBe('open');
    expect(field('single').value).toBe('');
    expect(host.single()).toBeNull();
  });

  it('el buscador lleva aria-invalid y la descripción del campo (a11y H7)', async () => {
    narrow = true;
    const { open, field, settle } = await setup();
    field('single').setAttribute('aria-describedby', 'mensaje-de-error');
    await settle();
    await open('single');
    expect(search().getAttribute('aria-describedby')).toContain('mensaje-de-error');
  });

  it('en escritorio, el panel de siempre; presentation="popover" lo mantiene en el teléfono', async () => {
    const { host, open, settle } = await setup();
    await open('single');
    expect(sheet()).toBeNull();
    expect(document.querySelector('[data-mimi-overlay-panel]')).not.toBeNull();
    narrow = true;
    host.presentation.set('popover');
    await settle();
    expect(sheet()).toBeNull();
  });
});
