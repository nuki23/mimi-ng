import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { MimiOverlayPresentation } from '@/components/ui/utils/overlay-config';
import { MimiSelectImports, type MimiOption } from './select';

// R.34: Select en el teléfono abre un diálogo (la hoja inferior) con su lista. No mete el panel
// de @angular/aria en la hoja: dentro va la lista (MimiOptionList) con su propio teclado o, con
// buscador, el buscador con su propio combobox.
@Component({
  imports: [MimiSelectImports],
  template: `
    <mimi-select
      data-test="plain"
      aria-label="País"
      clearable
      [presentation]="presentation()"
      [options]="options"
      [loading]="loading()"
      [(value)]="plain"
    />
    <mimi-select
      data-test="search"
      aria-label="Ciudad"
      search
      searchPlaceholder="Buscar ciudad…"
      [options]="options"
      [(value)]="searched"
      (searchChange)="queries.push($event)"
    />
  `,
})
class Host {
  readonly presentation = signal<MimiOverlayPresentation>('auto');
  readonly loading = signal(false);
  readonly plain = signal<string | null>(null);
  readonly searched = signal<string | null>(null);
  readonly queries: string[] = [];
  readonly options: MimiOption<string>[] = [
    { label: 'Argentina', value: 'AR' },
    { label: 'Chile', value: 'CL', disabled: true },
    { label: 'España', value: 'ES' },
    { label: 'México', value: 'MX' },
  ];
}

describe('Select en la hoja (R.34)', { timeout: 20_000 }, () => {
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
    const trigger = (id: string) =>
      el.querySelector<HTMLButtonElement>(`mimi-select[data-test="${id}"] [role="combobox"]`)!;
    const open = async (id: string) => {
      trigger(id).focus();
      trigger(id).click();
      await settle();
    };
    const press = async (target: Element, key: string) => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
      await settle();
    };
    return { host: fixture.componentInstance, el, settle, trigger, open, press };
  }

  const sheet = () => document.querySelector<HTMLElement>('[data-mimi-sheet]');
  const options = () => Array.from(sheet()!.querySelectorAll<HTMLElement>('[role="option"]'));

  it('en el teléfono abre la hoja con la lista, el nombre del campo y el foco en la lista', async () => {
    narrow = true;
    const { host, open } = await setup();
    await open('plain');
    expect(sheet()?.dataset['side']).toBe('bottom');
    expect(document.querySelector('[data-mimi-overlay-panel]')).toBeNull();
    expect(sheet()!.querySelector('[data-slot="title"]')!.textContent?.trim()).toBe('País');
    const listbox = sheet()!.querySelector<HTMLElement>('[role="listbox"]')!;
    expect(listbox.getAttribute('aria-label')).toBe('País');
    expect(document.activeElement).toBe(listbox);
    expect(options().map((o) => o.textContent?.trim())).toEqual([
      'Argentina',
      'Chile',
      'España',
      'México',
    ]);
    // Objetivos táctiles de 44 px.
    expect(options()[0].className).toContain('h-11');
    // Tocar una opción elige y cierra.
    options()[2].click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(host.plain()).toBe('ES');
  });

  it('el teclado de la lista en la hoja: ↓ mueve y Enter elige; la deshabilitada se salta', async () => {
    narrow = true;
    const { host, open, press, settle } = await setup();
    await open('plain');
    const listbox = sheet()!.querySelector<HTMLElement>('[role="listbox"]')!;
    // La activa empieza en la primera (Argentina); ↓ salta Chile (deshabilitada).
    await press(listbox, 'ArrowDown');
    const active = document.getElementById(listbox.getAttribute('aria-activedescendant') ?? '-');
    expect(active?.textContent?.trim()).toBe('España');
    await press(listbox, 'Enter');
    await settle();
    expect(host.plain()).toBe('ES');
    expect(sheet()).toBeNull();
  });

  it('la elegida va marcada; limpiar y cargando son los de escritorio', async () => {
    narrow = true;
    const { host, el, open, settle } = await setup();
    host.plain.set('MX');
    await settle();
    await open('plain');
    const mx = options().find((o) => o.textContent?.includes('México'))!;
    expect(mx.getAttribute('aria-selected')).toBe('true');
    sheet()!.querySelector<HTMLElement>('[data-slot="close"]')!.click();
    await settle();
    expect(sheet()).toBeNull();
    el.querySelector<HTMLElement>('mimi-select[data-test="plain"] [data-slot="clear"]')!.click();
    await settle();
    expect(host.plain()).toBeNull();
    host.loading.set(true);
    await settle();
    await open('plain');
    expect(sheet()!.querySelector('[data-slot="loading"]')).not.toBeNull();
  });

  it('con buscador: el buscador va arriba en la hoja, filtra, avisa al servidor y Enter elige', async () => {
    narrow = true;
    const { host, open, press, settle, trigger } = await setup();
    await open('search');
    const input = sheet()!.querySelector<HTMLInputElement>('input')!;
    expect(input.getAttribute('placeholder')).toBe('Buscar ciudad…');
    expect(input.getAttribute('role')).toBe('combobox');
    expect(document.activeElement).toBe(input);
    input.value = 'mé';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await settle();
    expect(host.queries).toContain('mé');
    expect(options().map((o) => o.textContent?.trim())).toEqual(['México']);
    // La cantidad de resultados se anuncia (a11y H2).
    expect(sheet()!.querySelector('[role="status"]')!.textContent).toMatch(/1\b/);
    // Tab no cierra la hoja (el foco queda atrapado en ella).
    await press(input, 'Tab');
    expect(sheet()?.dataset['state']).toBe('open');
    await press(input, 'Enter');
    await settle();
    expect(host.searched()).toBe('MX');
    expect(sheet()).toBeNull();
    // Al cerrar, la búsqueda vuelve a vacío (como en escritorio).
    expect(host.queries.at(-1)).toBe('');
    expect(trigger('search').textContent).toContain('México');
  });

  it('en escritorio sigue siendo popover; presentation="sheet" pide la hoja siempre', async () => {
    const { host, open, settle, press, trigger } = await setup();
    await open('plain');
    expect(sheet()).toBeNull();
    expect(document.querySelector('[data-mimi-overlay-panel]')).not.toBeNull();
    await press(trigger('plain'), 'Escape');
    await new Promise((resolve) => setTimeout(resolve, 50));
    host.presentation.set('sheet');
    await settle();
    await open('plain');
    await settle();
    expect(sheet()).not.toBeNull();
  });
});
