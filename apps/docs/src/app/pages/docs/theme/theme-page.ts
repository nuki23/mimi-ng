import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MimiBadge } from '@/components/ui/badge';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiInput } from '@/components/ui/input';
import { MimiSwitch } from '@/components/ui/switch';
import { MIMI_THEME, applyMimiTheme, mimiThemeToCss } from '@/components/ui/theme/provider';
import type { MimiThemePreset } from '@/components/ui/theme/types';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';
import { CodeBlock } from '../../../code/code-block';
import { CopyButton } from '../../../code/copy-button';
import { ThemeService } from '../../../core/theme.service';
import { bestText } from './theme-color';

/** Muestras del diseño (`Mimi Sitio.dc.html`, vista «Temas», `SWATCHES`). `base` es el neutro. */
export const THEME_SWATCHES: readonly { value: string; label: string }[] = [
  { value: 'base', label: 'Neutro' },
  { value: 'oklch(0.54 0.24 292)', label: 'Violeta' },
  { value: 'oklch(0.52 0.13 160)', label: 'Esmeralda' },
  { value: 'oklch(0.52 0.2 262)', label: 'Azul' },
  { value: 'oklch(0.55 0.17 45)', label: 'Naranja' },
];

/** Radios del diseño (`RADII`); 12px es el de fábrica. */
export const THEME_RADII: readonly { value: string; label: string; css: string }[] = [
  { value: '0', label: '0', css: '0px' },
  { value: '4', label: '4', css: '4px' },
  { value: '8', label: '8', css: '8px' },
  { value: '12', label: '12', css: '12px' },
  { value: 'full', label: 'Total', css: '9999px' },
];

/** Densidades del diseño (`HEIGHTS`): el alto de control; 40px es el de fábrica. */
export const THEME_DENSITIES: readonly { value: string; label: string; css: string }[] = [
  { value: 'compact', label: 'Compacta', css: '36px' },
  { value: 'normal', label: 'Normal', css: '40px' },
  { value: 'comfy', label: 'Cómoda', css: '44px' },
];

/** Valor propio del `<input type="color">` antes de elegir uno. */
const CUSTOM_START = '#4f46e5';

/**
 * Preset de la página: solo globales (spec 11). El estado de fábrica da un preset vacío, y cada
 * elección agrega lo suyo. Mismos nombres que `theme/types.ts`.
 */
export function themePagePreset(choice: {
  primary: string;
  radius: string;
  density: string;
}): MimiThemePreset {
  const preset: MimiThemePreset = {};
  const radius = THEME_RADII.find((r) => r.value === choice.radius);
  if (radius && radius.value !== '12') preset.radius = radius.css;
  if (choice.primary !== 'base') {
    const { text } = bestText(choice.primary);
    const colors = { primary: choice.primary, primaryForeground: text, ring: choice.primary };
    preset.colors = colors;
    preset.darkColors = { ...colors };
  }
  const density = THEME_DENSITIES.find((d) => d.value === choice.density);
  if (density && density.value !== 'normal') preset.controls = { height: density.css };
  return preset;
}

/** El preset como código para `app.config.ts`: solo `provideMimiTheme` y `MimiThemePreset`. */
export function themePresetCode(preset: MimiThemePreset): string {
  const body = JSON.stringify(preset, null, 2)
    .replace(/"([a-zA-Z]+)":/g, '$1:')
    .replace(/"/g, "'");
  return [
    '// app.config.ts',
    "import type { ApplicationConfig } from '@angular/core';",
    "import { provideMimiTheme } from '@/components/ui/theme';",
    "import type { MimiThemePreset } from '@/components/ui/theme';",
    '',
    `const myTheme: MimiThemePreset = ${body};`,
    '',
    'export const appConfig: ApplicationConfig = {',
    '  providers: [provideMimiTheme(myTheme)],',
    '};',
  ].join('\n');
}

/** Página «Tema» (plan 5.2; spec 11). */
@Component({
  selector: 'app-theme-page',
  imports: [
    MimiToggleGroupImports,
    MimiButton,
    MimiBadge,
    MimiInput,
    MimiSwitch,
    MimiCheckbox,
    MimiCardImports,
    CodeBlock,
    CopyButton,
  ],
  templateUrl: './theme-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemePage {
  private readonly document = inject(DOCUMENT);
  /** Preset de la app (provideMimiTheme), si lo hay: es el tema «de fábrica» y se restaura al salir. */
  private readonly appPreset = inject(MIMI_THEME, { optional: true });
  /** El modo del sitio: la vista previa solo puede forzar el oscuro (ver la plantilla). */
  protected readonly siteDark = inject(ThemeService).isDark;

  protected readonly swatches = THEME_SWATCHES;
  protected readonly radii = THEME_RADII;
  protected readonly densities = THEME_DENSITIES;

  /** `base`, una muestra o un `#rrggbb` del selector nativo. */
  protected readonly primary = signal<string | null>('base');
  protected readonly custom = signal(CUSTOM_START);
  protected readonly radius = signal<string | null>('12');
  protected readonly density = signal<string | null>('normal');
  protected readonly previewMode = signal<string | null>('light');
  /** La vista previa en oscuro: lo pidió el usuario o el sitio ya está en oscuro. */
  protected readonly previewDark = computed(() => this.siteDark() || this.previewMode() === 'dark');

  readonly preset = computed(() =>
    themePagePreset({
      primary: this.primary() ?? 'base',
      radius: this.radius() ?? '12',
      density: this.density() ?? 'normal',
    }),
  );
  protected readonly isFactory = computed(() => Object.keys(this.preset()).length === 0);
  protected readonly css = computed(
    () => mimiThemeToCss(this.preset()) || '/* Sin cambios: el tema de fábrica. */\n',
  );
  protected readonly code = computed(() => themePresetCode(this.preset()));

  /** Contraste del texto sobre el principal (null con el neutro, que ya pasa en la base). */
  protected readonly contrast = computed(() => {
    const primary = this.primary();
    return !primary || primary === 'base' ? null : bestText(primary);
  });
  /** Ni el texto claro ni el oscuro llegan a 4,5:1 (spec 13, «Colores»). */
  protected readonly lowContrast = computed(() => (this.contrast()?.ratio ?? 21) < 4.5);
  protected readonly ratioText = computed(() => this.contrast()?.ratio.toFixed(2) ?? '');

  constructor() {
    effect(() => applyMimiTheme(this.document, this.isFactory() ? this.appPreset : this.preset()));
    // Al salir de la página (otra ruta o el componente se destruye) vuelve al tema de la app.
    inject(DestroyRef).onDestroy(() => applyMimiTheme(this.document, this.appPreset));
  }

  protected pickCustom(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.custom.set(value);
    this.primary.set(value);
  }
}
