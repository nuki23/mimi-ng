import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MimiColorPicker, mimiHexToRgb } from '@/components/ui/color-picker';

/** La paleta del diseño. Es de la app: el componente no trae una. */
const PALETTE = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#4f46e5',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
];

/** Luminancia relativa (WCAG) de un color sRGB. */
function luminance(hex: string): number {
  const { r, g, b } = mimiHexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const lin = (c: number) => {
    const n = c / 255;
    return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

@Component({
  selector: 'app-color-picker-panel-example',
  imports: [MimiColorPicker],
  template: `
    <div class="flex flex-wrap items-start gap-6">
      <!-- El panel suelto, como en el diseño. -->
      <mimi-color-picker
        class="rounded-[var(--mimi-radius)] border border-border bg-popover p-3 shadow-[shadow:var(--mimi-shadow-popover)]"
        [swatches]="palette"
        [(value)]="color"
        [(recent)]="recent"
      />
      <!-- La vista previa y el contraste son del ejemplo. -->
      <div class="flex flex-col gap-3 text-sm">
        <span
          class="inline-flex h-10 items-center rounded-[var(--mimi-radius)] px-4 font-medium"
          [style.background-color]="color()"
          [style.color]="text()"
          >Botón de ejemplo</span
        >
        <span class="text-muted-foreground">
          Contraste con {{ text() === '#ffffff' ? 'blanco' : 'negro' }}: {{ ratio() }}:1
          {{ ratio() >= 4.5 ? '· AA' : '· no llega a AA' }}
        </span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerPanelExample {
  protected readonly palette = PALETTE;
  protected readonly color = signal('#4f46e5');
  protected readonly recent = signal<string[]>([]);
  /** Texto blanco o negro, el de más contraste. */
  protected readonly text = computed(() =>
    luminance(this.color()) > 0.179 ? '#000000' : '#ffffff',
  );
  protected readonly ratio = computed(() => {
    const l = luminance(this.color());
    const t = this.text() === '#ffffff' ? 1 : 0;
    const [hi, lo] = l > t ? [l, t] : [t, l];
    return Math.round(((hi + 0.05) / (lo + 0.05)) * 10) / 10;
  });
}
