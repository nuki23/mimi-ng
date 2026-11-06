import { DOCUMENT } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, RouterOutlet } from '@angular/router';
import { MIMI_THEME_STYLE_ID, mimiThemeToCss } from '@/components/ui/theme/provider';
import type { MimiThemePreset } from '@/components/ui/theme/types';
import { HighlighterService } from '../../../code/highlighter.service';
import { bestText, contrast, DARK_TEXT, LIGHT_TEXT } from './theme-color';
import {
  THEME_DENSITIES,
  THEME_RADII,
  THEME_SWATCHES,
  ThemePage,
  themePagePreset,
  themePresetCode,
} from './theme-page';

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

/** Lo que el showcase pone en `app.config.ts` si tuviera un preset (aquí, ninguno). */
const providers = [
  provideRouter([]),
  { provide: HighlighterService, useValue: { highlight: () => new Promise(() => undefined) } },
];

describe('theme-color', () => {
  it('reproduce el contraste de los tokens de fábrica', () => {
    // primary-foreground sobre primary del tema claro: 0.985 sobre 0.205 (≈ 17:1).
    expect(contrast('oklch(0.985 0 0)', 'oklch(0.205 0 0)')).toBeGreaterThan(15);
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 1);
  });

  it('elige el texto que más contrasta: claro sobre oscuro y oscuro sobre claro', () => {
    expect(bestText('oklch(0.52 0.2 262)').text).toBe(LIGHT_TEXT);
    expect(bestText('#fde047').text).toBe(DARK_TEXT);
    // Un gris medio no llega a 4,5:1 con ninguno de los dos.
    expect(bestText('#777777').ratio).toBeLessThan(4.6);
  });
});

describe('themePagePreset y themePresetCode', () => {
  it('el estado de fábrica es un preset vacío', () => {
    expect(themePagePreset({ primary: 'base', radius: '12', density: 'normal' })).toEqual({});
  });

  it('cada elección agrega solo globales con los nombres de theme/types.ts', () => {
    const preset = themePagePreset({
      primary: 'oklch(0.54 0.24 292)',
      radius: 'full',
      density: 'compact',
    });
    expect(preset).toEqual({
      radius: '9999px',
      colors: {
        primary: 'oklch(0.54 0.24 292)',
        primaryForeground: LIGHT_TEXT,
        ring: 'oklch(0.54 0.24 292)',
      },
      darkColors: {
        primary: 'oklch(0.54 0.24 292)',
        primaryForeground: LIGHT_TEXT,
        ring: 'oklch(0.54 0.24 292)',
      },
      controls: { height: '36px' },
    } satisfies MimiThemePreset);
    expect(preset.components).toBeUndefined();
    // Un color claro del selector nativo lleva texto oscuro.
    expect(themePagePreset({ primary: '#fde047', radius: '4', density: 'comfy' })).toMatchObject({
      radius: '4px',
      colors: { primaryForeground: DARK_TEXT },
      controls: { height: '44px' },
    });
  });

  it('el código copiado usa solo provideMimiTheme y MimiThemePreset, y su objeto es el preset', () => {
    const preset = themePagePreset({ primary: '#2563eb', radius: '8', density: 'comfy' });
    const code = themePresetCode(preset);
    expect(code).toContain("import { provideMimiTheme } from '@/components/ui/theme';");
    expect(code).toContain("import type { MimiThemePreset } from '@/components/ui/theme';");
    expect(code).toContain('provideMimiTheme(myTheme)');
    expect(code).not.toContain('definePreset');
    // El literal del objeto es JavaScript válido y da el mismo preset.
    const literal = /const myTheme: MimiThemePreset = (\{[\s\S]*?\});/.exec(code)![1];
    expect(new Function(`return (${literal});`)()).toEqual(preset);
  });
});

describe('ThemePage', () => {
  afterEach(() => {
    TestBed.inject(DOCUMENT).getElementById(MIMI_THEME_STYLE_ID)?.remove();
    TestBed.inject(DOCUMENT).documentElement.classList.remove('dark');
  });

  async function setup() {
    TestBed.configureTestingModule({ providers });
    const fixture = TestBed.createComponent(ThemePage);
    document.body.appendChild(fixture.nativeElement);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const doc = TestBed.inject(DOCUMENT);
    const style = () => doc.getElementById(MIMI_THEME_STYLE_ID)?.textContent ?? null;
    // Los botones se crean con [mimiToggleGroupItem]="valor" (sin atributo): se buscan por posición.
    const lists: Record<string, readonly { value: string }[]> = {
      'theme-primary': THEME_SWATCHES,
      'theme-radius': THEME_RADII,
      'theme-density': THEME_DENSITIES,
    };
    const button = (group: string, value: string) =>
      el.querySelectorAll<HTMLButtonElement>(
        `mimi-toggle-group[aria-labelledby="${group}"] button`,
      )[lists[group].findIndex((item) => item.value === value)];
    return { fixture, el, doc, style, button };
  }

  it('de fábrica no aplica nada; cada elección cambia el tema al instante', async () => {
    const { fixture, style, button } = await setup();
    expect(style()).toBeNull();
    button('theme-primary', 'oklch(0.52 0.2 262)').click();
    button('theme-radius', '4').click();
    button('theme-density', 'comfy').click();
    await settle(fixture);
    const preset = fixture.componentInstance.preset();
    expect(style()).toBe(mimiThemeToCss(preset));
    expect(style()).toContain('--mimi-primary: oklch(0.52 0.2 262);');
    expect(style()).toContain('--mimi-radius: 4px;');
    expect(style()).toContain('--mimi-control-height: 44px;');
    // Claro y oscuro: el mismo principal en :root:not(.dark) y en .dark.
    expect(style()).toContain(':root:not(.dark) {');
    expect(style()).toContain('.dark {');
  });

  it('un color propio del selector nativo es el principal', async () => {
    const { fixture, el, style } = await setup();
    const input = el.querySelector<HTMLInputElement>('input[type="color"]')!;
    expect(input.closest('label')?.textContent).toContain('Otro color');
    input.value = '#16a34a';
    input.dispatchEvent(new Event('input'));
    await settle(fixture);
    expect(style()).toContain('--mimi-primary: #16a34a;');
  });

  it('el CSS mostrado y copiado es exactamente mimiThemeToCss del preset', async () => {
    const { fixture, el, button } = await setup();
    button('theme-radius', '0').click();
    await settle(fixture);
    const copy = Array.from(el.querySelectorAll('app-copy-button button')).map((b) =>
      b.getAttribute('aria-label'),
    );
    expect(copy).toEqual(['Copiar preset', 'Copiar CSS']);
    const page = fixture.componentInstance as unknown as { css(): string; code(): string };
    expect(page.css()).toBe(mimiThemeToCss(fixture.componentInstance.preset()));
    expect(page.code()).toBe(themePresetCode(fixture.componentInstance.preset()));
  });

  it('al destruirse vuelve al tema de la app (sin preset: quita el <style>)', async () => {
    const { fixture, style, button } = await setup();
    button('theme-radius', '8').click();
    await settle(fixture);
    expect(style()).not.toBeNull();
    fixture.destroy();
    expect(style()).toBeNull();
  });

  it('al navegar a otra ruta también restaura el tema', async () => {
    @Component({ template: '' })
    class Other {}
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'theme', component: ThemePage },
          { path: 'other', component: Other },
        ]),
        providers[1],
      ],
    });
    @Component({
      imports: [RouterOutlet],
      template: '<router-outlet />',
    })
    class Shell {}
    const fixture = TestBed.createComponent(Shell);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/theme');
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    // El primer radio es 0.
    el.querySelector<HTMLButtonElement>('[aria-labelledby="theme-radius"] button')!.click();
    await settle(fixture);
    const doc = TestBed.inject(DOCUMENT);
    expect(doc.getElementById(MIMI_THEME_STYLE_ID)).not.toBeNull();
    await router.navigateByUrl('/other');
    await settle(fixture);
    expect(doc.getElementById(MIMI_THEME_STYLE_ID)).toBeNull();
  });

  it('no guarda nada en localStorage ni en la URL', async () => {
    const set = vi.spyOn(Storage.prototype, 'setItem');
    const href = location.href;
    const { fixture, button } = await setup();
    button('theme-primary', 'oklch(0.55 0.17 45)').click();
    button('theme-radius', 'full').click();
    await settle(fixture);
    expect(set).not.toHaveBeenCalled();
    expect(location.href).toBe(href);
    set.mockRestore();
  });

  it('con poco contraste, el aviso está a la vista en la sección Exportar, antes de copiar', async () => {
    const { fixture, el } = await setup();
    const input = el.querySelector<HTMLInputElement>('input[type="color"]')!;
    input.value = '#777777';
    input.dispatchEvent(new Event('input'));
    await settle(fixture);
    const warning = el.querySelector<HTMLElement>('[data-slot="contrast-warning"]')!;
    expect(warning).not.toBeNull();
    expect(warning.hidden).toBe(false);
    expect(warning.textContent).toContain('4,5:1');
    // Va en «Exportar», antes de los botones de copiar.
    const exportTitle = el.querySelector('#export')!;
    const firstCopy = el.querySelector('app-copy-button')!;
    expect(
      exportTitle.compareDocumentPosition(warning) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      warning.compareDocumentPosition(firstCopy) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // Con un color que contrasta, no hay aviso.
    input.value = '#1d4ed8';
    input.dispatchEvent(new Event('input'));
    await settle(fixture);
    expect(el.querySelector('[data-slot="contrast-warning"]')).toBeNull();
  });

  it('la vista previa: oscuro solo en su contenedor, sin tocar el modo del sitio', async () => {
    const { fixture, el, doc } = await setup();
    const preview = el.querySelector<HTMLElement>('[data-slot="theme-preview"]')!;
    expect(preview.classList.contains('dark')).toBe(false);
    el.querySelector<HTMLButtonElement>(
      '[aria-label="Modo de la vista previa"] [mimiToggleGroupItem="dark"]',
    )!.click();
    await settle(fixture);
    expect(preview.classList.contains('dark')).toBe(true);
    expect(doc.documentElement.classList.contains('dark')).toBe(false);
  });

  it('cambia solo globales: el CSS no tiene variables de componente', async () => {
    const { fixture, style, button } = await setup();
    button('theme-primary', 'oklch(0.52 0.13 160)').click();
    button('theme-radius', 'full').click();
    button('theme-density', 'compact').click();
    await settle(fixture);
    const names = [...(style() ?? '').matchAll(/--mimi-([a-z-]+):/g)].map((m) => m[1]);
    expect(new Set(names)).toEqual(
      new Set(['radius', 'control-height', 'primary', 'primary-foreground', 'ring']),
    );
  });

  it('los grupos tienen nombre y el título de la sección', async () => {
    const { el } = await setup();
    for (const group of Array.from(el.querySelectorAll('mimi-toggle-group'))) {
      const name = group.getAttribute('aria-label') ?? group.getAttribute('aria-labelledby');
      expect(name, group.outerHTML.slice(0, 80)).toBeTruthy();
    }
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'customize',
      'preview',
      'export',
    ]);
  });
});
