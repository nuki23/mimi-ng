import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

type ChangeListener = (event: MediaQueryListEvent) => void;

/** matchMedia simulado: jsdom no lo implementa. */
function mockSystemPreference(dark: boolean) {
  const listeners = new Set<ChangeListener>();
  const media = {
    matches: dark,
    addEventListener: (_: string, fn: ChangeListener) => listeners.add(fn),
    removeEventListener: (_: string, fn: ChangeListener) => listeners.delete(fn),
  };
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => media),
  );
  return {
    change(value: boolean) {
      media.matches = value;
      listeners.forEach((fn) => fn({ matches: value } as MediaQueryListEvent));
    },
  };
}

describe('ThemeService', () => {
  let html: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    html = TestBed.inject(DOCUMENT).documentElement;
    html.classList.remove('dark');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    html.classList.remove('dark');
  });

  it('sin elección sigue la preferencia del sistema, también si cambia', () => {
    const system = mockSystemPreference(true);
    const theme = TestBed.inject(ThemeService);

    expect(theme.preference()).toBeNull();
    expect(theme.isDark()).toBe(true);
    expect(html.classList.contains('dark')).toBe(true);

    system.change(false);
    expect(theme.isDark()).toBe(false);
    expect(html.classList.contains('dark')).toBe(false);
  });

  it('toggle() guarda la elección en localStorage y alterna .dark', () => {
    mockSystemPreference(false);
    const theme = TestBed.inject(ThemeService);

    theme.toggle();
    expect(theme.isDark()).toBe(true);
    expect(html.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');

    theme.toggle();
    expect(theme.isDark()).toBe(false);
    expect(html.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('una elección guardada gana a la preferencia del sistema', () => {
    const system = mockSystemPreference(true);
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const theme = TestBed.inject(ThemeService);

    expect(theme.isDark()).toBe(false);
    system.change(true);
    expect(theme.isDark()).toBe(false);
    expect(html.classList.contains('dark')).toBe(false);
  });

  it('funciona aunque localStorage lance error', () => {
    mockSystemPreference(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('bloqueado');
    });
    const theme = TestBed.inject(ThemeService);

    expect(theme.isDark()).toBe(false);
    expect(() => theme.toggle()).not.toThrow();
    expect(theme.isDark()).toBe(true);
    expect(html.classList.contains('dark')).toBe(true);
  });
});
