import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { LucideCheck, LucideCopy } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';

/** Tiempo que se muestra el estado «Copiado». */
export const COPIED_DURATION = 2000;

/**
 * Botón para copiar texto. Al copiar muestra un check durante 2 segundos y anuncia «Copiado»
 * a los lectores de pantalla (aria-live). Dos variantes del diseño: solo ícono (32px) o
 * ícono + texto (CodePreview).
 */
@Component({
  selector: 'app-copy-button',
  imports: [MimiButton, LucideCheck, LucideCopy],
  template: `
    <button
      type="button"
      mimiBtn
      [variant]="withLabel() ? 'outline' : 'ghost'"
      [size]="withLabel() ? 'sm' : 'icon'"
      [class]="
        withLabel()
          ? 'h-[30px] rounded-lg bg-transparent px-2.5 font-medium shadow-none [&_svg]:size-3.5'
          : 'size-8 rounded-[8px] text-muted-foreground'
      "
      [attr.aria-label]="withLabel() ? null : label()"
      (click)="copy()"
    >
      @if (copied()) {
        <svg lucideCheck [size]="withLabel() ? 14 : 16" aria-hidden="true"></svg>
      } @else {
        <svg lucideCopy [size]="withLabel() ? 14 : 16" aria-hidden="true"></svg>
      }
      @if (withLabel()) {
        {{ copied() ? 'Copiado' : 'Copiar' }}
      }
    </button>
    <span class="sr-only" aria-live="polite">{{ copied() ? 'Copiado' : '' }}</span>
  `,
  host: { class: 'inline-flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopyButton {
  /** Texto que se copia. */
  readonly text = input.required<string>();
  /** Muestra «Copiar»/«Copiado» junto al ícono. */
  readonly withLabel = input(false);
  /** aria-label de la variante solo ícono. */
  readonly label = input('Copiar');

  protected readonly copied = signal(false);

  private readonly window = inject(DOCUMENT).defaultView;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private readonly clearTimer = inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));

  protected async copy(): Promise<void> {
    const clipboard = this.window?.navigator.clipboard;
    if (!clipboard) return;
    try {
      await clipboard.writeText(this.text());
    } catch {
      // Sin permiso o sin portapapeles (http, iframe): no se muestra el estado de copiado.
      return;
    }
    this.copied.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copied.set(false), COPIED_DURATION);
  }
}
