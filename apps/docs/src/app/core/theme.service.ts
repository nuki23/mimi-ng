import { DOCUMENT, DestroyRef, Injectable, computed, inject, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark';

/** Clave de localStorage. El script de index.html usa la misma. */
export const THEME_STORAGE_KEY = 'mimi-docs-theme';

/**
 * Modo claro/oscuro del showcase. Si el usuario no eligió, sigue la preferencia del
 * sistema. La clase .dark en <html> la pone primero el script de index.html (para evitar el
 * parpadeo) y después la mantiene este servicio.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly media = this.window?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  /** Elección del usuario; null = sigue al sistema. */
  readonly preference = signal<ThemePreference | null>(this.readStored());
  private readonly systemDark = signal(this.media?.matches ?? false);

  readonly isDark = computed(
    () => (this.preference() ?? (this.systemDark() ? 'dark' : 'light')) === 'dark',
  );

  private readonly listenSystem = (() => {
    const onChange = (event: MediaQueryListEvent) => {
      this.systemDark.set(event.matches);
      this.applyClass();
    };
    this.media?.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => this.media?.removeEventListener('change', onChange));
    this.applyClass();
  })();

  toggle(): void {
    this.setPreference(this.isDark() ? 'light' : 'dark');
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    try {
      this.window?.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Sin acceso a localStorage (modo privado, cookies bloqueadas): la elección dura la sesión.
    }
    this.applyClass();
  }

  private applyClass(): void {
    this.document.documentElement.classList.toggle('dark', this.isDark());
  }

  private readStored(): ThemePreference | null {
    try {
      const value = this.window?.localStorage.getItem(THEME_STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }
}
