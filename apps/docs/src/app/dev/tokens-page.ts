import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { ThemeService } from '../core/theme.service';

interface Sample {
  name: string;
  class: string;
}

/** Clases de un tono, escritas completas para que Tailwind las detecte. */
interface ToneSample {
  name: string;
  solid: string;
  soft: string;
  ring: string;
  glow: string;
}

/** Página interna (/dev/tokens) para revisar los tokens del tema. No aparece en el menú. */
@Component({
  selector: 'app-tokens-page',
  imports: [MimiButton],
  templateUrl: './tokens-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokensPage {
  private readonly theme = inject(ThemeService);
  protected readonly isDark = this.theme.isDark;

  // Clases escritas completas para que Tailwind las detecte.
  protected readonly colors: Sample[] = [
    { name: 'background', class: 'bg-background' },
    { name: 'foreground', class: 'bg-foreground' },
    { name: 'card', class: 'bg-card' },
    { name: 'card-foreground', class: 'bg-card-foreground' },
    { name: 'popover', class: 'bg-popover' },
    { name: 'popover-foreground', class: 'bg-popover-foreground' },
    { name: 'primary', class: 'bg-primary' },
    { name: 'primary-foreground', class: 'bg-primary-foreground' },
    { name: 'primary-hover', class: 'bg-primary-hover' },
    { name: 'secondary', class: 'bg-secondary' },
    { name: 'secondary-foreground', class: 'bg-secondary-foreground' },
    { name: 'secondary-hover', class: 'bg-secondary-hover' },
    { name: 'muted', class: 'bg-muted' },
    { name: 'muted-foreground', class: 'bg-muted-foreground' },
    { name: 'accent', class: 'bg-accent' },
    { name: 'accent-foreground', class: 'bg-accent-foreground' },
    { name: 'destructive', class: 'bg-destructive' },
    { name: 'destructive-foreground', class: 'bg-destructive-foreground' },
    { name: 'destructive-hover', class: 'bg-destructive-hover' },
    { name: 'destructive-ring', class: 'bg-destructive-ring' },
    { name: 'destructive-soft-bg', class: 'bg-destructive-soft-bg' },
    { name: 'destructive-soft-foreground', class: 'bg-destructive-soft-foreground' },
    { name: 'destructive-soft (alias de destructive-ring)', class: 'bg-destructive-soft' },
    { name: 'success', class: 'bg-success' },
    { name: 'success-foreground', class: 'bg-success-foreground' },
    { name: 'success-hover', class: 'bg-success-hover' },
    { name: 'success-soft', class: 'bg-success-soft' },
    { name: 'success-soft-foreground', class: 'bg-success-soft-foreground' },
    { name: 'success-ring', class: 'bg-success-ring' },
    { name: 'warning', class: 'bg-warning' },
    { name: 'warning-foreground', class: 'bg-warning-foreground' },
    { name: 'warning-hover', class: 'bg-warning-hover' },
    { name: 'warning-soft', class: 'bg-warning-soft' },
    { name: 'warning-soft-foreground', class: 'bg-warning-soft-foreground' },
    { name: 'warning-ring', class: 'bg-warning-ring' },
    { name: 'info', class: 'bg-info' },
    { name: 'info-foreground', class: 'bg-info-foreground' },
    { name: 'info-hover', class: 'bg-info-hover' },
    { name: 'info-soft', class: 'bg-info-soft' },
    { name: 'info-soft-foreground', class: 'bg-info-soft-foreground' },
    { name: 'info-ring', class: 'bg-info-ring' },
    { name: 'tooltip', class: 'bg-tooltip' },
    { name: 'tooltip-foreground', class: 'bg-tooltip-foreground' },
    { name: 'glass', class: 'bg-glass' },
    { name: 'glass-border', class: 'bg-glass-border' },
    { name: 'overlay', class: 'bg-overlay' },
    { name: 'border', class: 'bg-border' },
    { name: 'input', class: 'bg-input' },
    { name: 'input-background', class: 'bg-input-background' },
    { name: 'ring', class: 'bg-ring' },
    { name: 'ring-soft', class: 'bg-ring-soft' },
    { name: 'switch-off', class: 'bg-switch-off' },
  ];

  protected readonly radii: Sample[] = [
    { name: 'rounded-sm', class: 'rounded-sm' },
    { name: 'rounded-md', class: 'rounded-md' },
    { name: 'rounded-lg', class: 'rounded-lg' },
    { name: 'rounded-xl', class: 'rounded-xl' },
    { name: 'rounded-card', class: 'rounded-card' },
    { name: 'rounded-badge', class: 'rounded-badge' },
  ];

  protected readonly shadows: Sample[] = [
    { name: 'shadow-card', class: 'shadow-card' },
    { name: 'shadow-primary', class: 'shadow-primary' },
    { name: 'shadow-primary-hover', class: 'shadow-primary-hover' },
    { name: 'shadow-destructive', class: 'shadow-destructive' },
    { name: 'shadow-destructive-hover', class: 'shadow-destructive-hover' },
    { name: 'shadow-neutral', class: 'shadow-neutral' },
    { name: 'shadow-neutral-hover', class: 'shadow-neutral-hover' },
    { name: 'shadow-success', class: 'shadow-success' },
    { name: 'shadow-success-hover', class: 'shadow-success-hover' },
    { name: 'shadow-warning', class: 'shadow-warning' },
    { name: 'shadow-warning-hover', class: 'shadow-warning-hover' },
    { name: 'shadow-info', class: 'shadow-info' },
    { name: 'shadow-info-hover', class: 'shadow-info-hover' },
    { name: 'shadow-popover', class: 'shadow-popover' },
    { name: 'shadow-glow', class: 'shadow-glow' },
  ];

  /** Cada tono en sus formas: sólido con sombra, suave, anillo y glow. */
  protected readonly tones: ToneSample[] = [
    {
      name: 'primary (suave = secondary)',
      solid: 'bg-primary text-primary-foreground shadow-primary',
      soft: 'bg-secondary text-secondary-foreground',
      ring: 'ring-3 ring-ring-soft',
      glow: 'shadow-glow-primary',
    },
    {
      name: 'success',
      solid: 'bg-success text-success-foreground shadow-success',
      soft: 'bg-success-soft text-success-soft-foreground',
      ring: 'ring-3 ring-success-ring',
      glow: 'shadow-glow-success',
    },
    {
      name: 'warning',
      solid: 'bg-warning text-warning-foreground shadow-warning',
      soft: 'bg-warning-soft text-warning-soft-foreground',
      ring: 'ring-3 ring-warning-ring',
      glow: 'shadow-glow-warning',
    },
    {
      name: 'info',
      solid: 'bg-info text-info-foreground shadow-info',
      soft: 'bg-info-soft text-info-soft-foreground',
      ring: 'ring-3 ring-info-ring',
      glow: 'shadow-glow-info',
    },
    {
      name: 'destructive',
      solid: 'bg-destructive text-destructive-foreground shadow-destructive',
      soft: 'bg-destructive-soft-bg text-destructive-soft-foreground',
      ring: 'ring-3 ring-destructive-ring',
      glow: 'shadow-glow-destructive',
    },
  ];

  protected toggleDark(): void {
    this.theme.toggle();
  }
}
