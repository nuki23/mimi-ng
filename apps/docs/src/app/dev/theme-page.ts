import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import {
  MIMI_THEME,
  applyMimiTheme,
  cn,
  controlInvalidStyles,
  controlSizes,
  fieldFocusStyles,
  type MimiThemePreset,
} from '@mimi-ng/ui-core';
import { ThemeService } from '../core/theme.service';

interface DemoPreset {
  id: string;
  label: string;
  description: string;
  preset: MimiThemePreset | null;
}

interface Sample {
  name: string;
  class: string;
}

/** Página interna (/dev/theme) para probar applyMimiTheme con presets. No aparece en el menú. */
@Component({
  selector: 'app-theme-page',
  templateUrl: './theme-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePage {
  private readonly document = inject(DOCUMENT);
  /** Preset de la app (provideMimiTheme), si lo hay: se restaura al salir de la página. */
  private readonly appPreset = inject(MIMI_THEME, { optional: true });

  private readonly theme = inject(ThemeService);
  protected readonly isDark = this.theme.isDark;
  protected readonly activeId = signal('base');
  protected readonly css = signal('');

  /** Al salir de la página vuelve al tema de la app. */
  private readonly restoreOnDestroy = inject(DestroyRef).onDestroy(() =>
    applyMimiTheme(this.document, this.appPreset),
  );

  // Valores del personalizador de docs/design/Mimi Sitio.dc.html.
  protected readonly presets: DemoPreset[] = [
    {
      id: 'base',
      label: 'Base',
      description: 'Sin preset: theme-base.css tal cual.',
      preset: null,
    },
    {
      id: 'violeta',
      label: 'Violeta',
      description:
        'Solo colors (el modo oscuro conserva el primario de la base), radio 4px, controles de 36px.',
      preset: {
        name: 'Violeta',
        radius: '4px',
        colors: {
          primary: 'oklch(0.54 0.24 292)',
          primaryForeground: 'oklch(0.99 0 0)',
          ring: 'oklch(0.54 0.24 292)',
        },
        controls: { height: '36px' },
      },
    },
    {
      id: 'esmeralda',
      label: 'Esmeralda',
      description: 'colors y darkColors, radio 8px, controles de 44px.',
      preset: {
        name: 'Esmeralda',
        radius: '8px',
        colors: {
          primary: 'oklch(0.52 0.13 160)',
          primaryForeground: 'oklch(0.99 0 0)',
          ring: 'oklch(0.52 0.13 160)',
        },
        darkColors: {
          primary: 'oklch(0.52 0.13 160)',
          primaryForeground: 'oklch(0.99 0 0)',
          ring: 'oklch(0.52 0.13 160)',
        },
        controls: { height: '44px' },
      },
    },
  ];

  protected readonly swatches: Sample[] = [
    { name: 'primary', class: 'bg-primary' },
    { name: 'primary-hover', class: 'bg-primary-hover' },
    { name: 'primary-foreground', class: 'bg-primary-foreground' },
    { name: 'ring', class: 'bg-ring' },
    { name: 'ring-soft', class: 'bg-ring-soft' },
    { name: 'secondary', class: 'bg-secondary' },
    { name: 'destructive', class: 'bg-destructive' },
    { name: 'destructive-soft', class: 'bg-destructive-soft' },
  ];

  protected readonly inputClasses = cn(
    'w-full rounded-lg border border-input bg-input-background px-3 text-foreground placeholder:text-muted-foreground mimi-transition',
    controlSizes.default,
    fieldFocusStyles,
    controlInvalidStyles,
  );

  protected apply(demo: DemoPreset): void {
    applyMimiTheme(this.document, demo.preset);
    this.activeId.set(demo.id);
    this.css.set(this.document.getElementById('mimi-theme')?.textContent ?? '');
  }

  protected toggleDark(): void {
    this.theme.toggle();
  }
}
