import { ChangeDetectionStrategy, Component, DOCUMENT, inject, signal } from '@angular/core';

interface Sample {
  name: string;
  class: string;
}

/** Página interna (/dev/tokens) para revisar los tokens del tema. No aparece en el menú. */
@Component({
  selector: 'app-tokens-page',
  templateUrl: './tokens-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokensPage {
  private readonly document = inject(DOCUMENT);

  protected readonly isDark = signal(this.document.documentElement.classList.contains('dark'));

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
    { name: 'destructive-soft', class: 'bg-destructive-soft' },
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
  ];

  protected toggleDark(): void {
    const dark = this.document.documentElement.classList.toggle('dark');
    this.isDark.set(dark);
  }
}
