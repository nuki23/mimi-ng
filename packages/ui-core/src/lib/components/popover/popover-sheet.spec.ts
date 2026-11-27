import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiColorInput } from '@/components/ui/color-picker';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiDateRangePicker } from '@/components/ui/date-range';
import {
  provideMimiOverlay,
  type MimiOverlayPresentation,
} from '@/components/ui/utils/overlay-config';
import { MimiPopoverImports } from './popover';

// R.34: Popover en la hoja (pedida con `presentation`) y, en el teléfono, los selectores que lo usan.
@Component({
  imports: [MimiPopoverImports, MimiDatePicker, MimiDateRangePicker, MimiColorInput],
  template: `
    <mimi-popover [presentation]="presentation()" [(open)]="open" aria-label="Invitar">
      <button data-test="popover" mimiPopoverTrigger>Invitar</button>
      <ng-template mimiPopoverContent><input data-test="email" /></ng-template>
    </mimi-popover>
    <mimi-date-picker data-test="date" aria-label="Entrega" />
    <mimi-date-range-picker data-test="range" aria-label="Viaje" [presets]="presets" />
    <mimi-color-input data-test="color" aria-label="Color" />
    <label for="due">Vencimiento</label>
    <mimi-date-picker data-test="labelled" id="due" />
    <mimi-date-range-picker data-test="titled" aria-label="Viaje" sheetTitle="Fechas del viaje" />
    <label for="brand">Marca</label>
    <mimi-color-input data-test="color-labelled" id="brand" />
  `,
})
class Host {
  readonly presentation = signal<MimiOverlayPresentation>('auto');
  readonly open = signal(false);
  readonly presets = [
    { label: 'Hoy', range: { start: '2026-11-18', end: '2026-11-18' } },
    { label: 'Esta semana', range: { start: '2026-11-16', end: '2026-11-22' } },
  ];
}

describe('Popover y los selectores en la hoja (R.34)', () => {
  let narrow = false;
  const original = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = ((query: string) => ({
      matches: narrow && query === '(max-width: 639.98px)',
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = original;
    narrow = false;
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  async function setup(providers: unknown[] = []) {
    TestBed.configureTestingModule({ providers: providers as never[] });
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    const settle = async () => {
      for (let i = 0; i < 2; i++) {
        fixture.detectChanges();
        await fixture.whenStable();
        await new Promise((resolve) => setTimeout(resolve));
      }
    };
    await settle();
    const el = fixture.nativeElement as HTMLElement;
    const open = async (selector: string) => {
      el.querySelector<HTMLElement>(`${selector}`)!.click();
      await settle();
    };
    return { fixture, host: fixture.componentInstance, el, settle, open };
  }

  const sheet = () => document.querySelector<HTMLElement>('[data-mimi-sheet]');

  it('presentation="sheet": el contenido va en la hoja, con el aria-label como título', async () => {
    const { host, el, settle, open } = await setup();
    host.presentation.set('sheet');
    await settle();
    await open('[data-test="popover"]');
    expect(sheet()).not.toBeNull();
    expect(sheet()!.dataset['side']).toBe('bottom');
    expect(sheet()!.querySelector('[data-test="email"]')).not.toBeNull();
    expect(sheet()!.querySelector('[data-slot="title"]')!.textContent?.trim()).toBe('Invitar');
    expect(el.querySelector('mimi-popover')!.getAttribute('data-presentation')).toBe('sheet');
    expect(document.querySelector('[data-mimi-overlay-panel]')).toBeNull();
    // La X de la hoja cierra el popover.
    sheet()!.querySelector<HTMLElement>('[data-slot="close"]')!.click();
    await settle();
    expect(host.open()).toBe(false);
    expect(sheet()).toBeNull();
  });

  it('auto: Popover sigue siendo popover también en el teléfono', async () => {
    narrow = true;
    const { open } = await setup();
    await open('[data-test="popover"]');
    expect(sheet()).toBeNull();
    expect(document.querySelector('[data-mimi-overlay-panel]')).not.toBeNull();
  });

  it('el título de la hoja: sheetTitle, o el aria-label, o el <label for> (api-1.0, C9)', async () => {
    narrow = true;
    const { settle, open } = await setup();
    const title = () => sheet()!.querySelector('[data-slot="title"]')!.textContent?.trim();
    const close = async () => {
      sheet()!.querySelector<HTMLElement>('[data-slot="close"]')!.click();
      await settle();
    };
    await open('[data-test="labelled"] [mimiPopoverTrigger]');
    expect(title()).toBe('Vencimiento');
    await close();
    await open('[data-test="titled"] [mimiPopoverTrigger]');
    expect(title()).toBe('Fechas del viaje');
    await close();
    await open('[data-test="color-labelled"] [mimiPopoverTrigger]');
    expect(title()).toBe('Marca');
  });

  it('auto en el teléfono: Date Picker, Date Range y Color Picker en hoja inferior', async () => {
    narrow = true;
    const { settle, open } = await setup();
    await open('[data-test="date"] [mimiPopoverTrigger]');
    expect(sheet()?.dataset['side']).toBe('bottom');
    expect(sheet()!.querySelector('[data-slot="title"]')!.textContent?.trim()).toBe('Entrega');
    sheet()!.querySelector<HTMLElement>('[data-slot="close"]')!.click();
    await settle();
    await open('[data-test="range"] [mimiPopoverTrigger]');
    // La misma presentación que Date Picker (23/11/2026; hasta la 0.8.0, pantalla completa).
    expect(sheet()?.dataset['side']).toBe('bottom');
    expect(sheet()!.querySelector('[data-slot="title"]')!.textContent?.trim()).toBe('Viaje');
    sheet()!.querySelector<HTMLElement>('[data-slot="close"]')!.click();
    await settle();
    await open('[data-test="color"] [mimiPopoverTrigger]');
    expect(sheet()?.dataset['side']).toBe('bottom');
  });

  it('en la hoja, el calendario se estira a lo ancho y los atajos de Date Range van en una fila', async () => {
    narrow = true;
    const { settle, open } = await setup();
    await open('[data-test="date"] [mimiPopoverTrigger]');
    const calendar = sheet()!.querySelector<HTMLElement>('mimi-calendar')!;
    expect(calendar.hasAttribute('data-fill')).toBe(true);
    expect(calendar.classList).toContain('w-full');
    expect(calendar.querySelector('[role="grid"]')!.className).toContain(
      'grid-cols-[repeat(7,minmax(0,1fr))]',
    );
    sheet()!.querySelector<HTMLElement>('[data-slot="close"]')!.click();
    await settle();
    // Date Range en la hoja: los atajos, una sola fila que se desliza de lado, encima del
    // calendario; el mismo pie que Date Picker.
    await open('[data-test="range"] [mimiPopoverTrigger]');
    const presets = sheet()!.querySelector<HTMLElement>('[data-slot="presets"]')!;
    expect(presets.classList).toContain('w-full');
    expect(presets.classList).toContain('flex-row');
    expect(presets.classList).toContain('flex-nowrap');
    expect(presets.classList).toContain('overflow-x-auto');
    expect(presets.classList).not.toContain('border-e');
    expect(sheet()!.querySelector('[data-slot="go-today"]')).not.toBeNull();
    // El panel de Date Range no tiene relleno: los atajos y el calendario llevan el suyo.
    // El mismo relleno que el panel de Date Picker (--mimi-date-padding).
    expect(presets.classList).toContain('px-[var(--mimi-date-padding,12px)]');
    const rangeCalendar = sheet()!.querySelector('mimi-calendar')!;
    expect(rangeCalendar.hasAttribute('data-fill')).toBe(true);
    expect(rangeCalendar.parentElement!.classList).toContain('px-[var(--mimi-date-padding,12px)]');
    sheet()!.querySelector<HTMLElement>('[data-slot="close"]')!.click();
    await settle();
    // En escritorio (popover), el calendario sigue con su ancho propio.
    narrow = false;
    await open('[data-test="date"] [mimiPopoverTrigger]');
    const inPopover = document.querySelector<HTMLElement>(
      '[data-mimi-overlay-panel] mimi-calendar',
    )!;
    expect(inPopover.hasAttribute('data-fill')).toBe(false);
  });

  it('en escritorio, y con mobileBreakpoint 0, los selectores siguen en popover', async () => {
    const { open } = await setup();
    await open('[data-test="date"] [mimiPopoverTrigger]');
    expect(sheet()).toBeNull();
    TestBed.resetTestingModule();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
    narrow = true;
    const off = await setup([provideMimiOverlay({ mobileBreakpoint: 0 })]);
    await off.open('[data-test="date"] [mimiPopoverTrigger]');
    expect(sheet()).toBeNull();
  });
});
