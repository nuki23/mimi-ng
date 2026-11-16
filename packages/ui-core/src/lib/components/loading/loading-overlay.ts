import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import type { MimiSize } from '@/components/ui/utils/size';

/*
 * La capa de carga (R.23): un fondo translúcido con desenfoque, el anillo de Button y el mensaje.
 * La usan `MimiLoadingService` (toda la vista) y `mimiBlock` (un contenedor). Tokens
 * `--mimi-loading-*` (spec 13), con respaldo a `--mimi-overlay` y `--mimi-overlay-blur`.
 */

/** Medidas por tamaño: el anillo y el texto. */
const SIZE: Record<MimiSize, { spinner: string; text: string }> = {
  sm: { spinner: 'size-5', text: 'text-xs' },
  md: { spinner: 'size-7', text: 'text-sm' },
  lg: { spinner: 'size-10', text: 'text-base' },
};

/** @internal La capa; no forma parte de la API (se usa con el servicio o la directiva). */
@Component({
  selector: 'mimi-loading-overlay',
  template: `
    <div data-slot="panel" [class]="panelClasses()">
      <svg
        data-slot="spinner"
        [class]="spinnerClasses()"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <!-- Lucide loader-circle (ISC) -->
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <!-- Visible siempre: con «reducir movimiento» el anillo no gira y el texto lo dice todo. -->
      <span data-slot="message" [class]="textClasses()">{{ message() }}</span>
    </div>
  `,
  host: {
    '[class]': 'classes()',
    'data-slot': 'loading',
    // El anuncio lo hace LiveAnnouncer: la capa no es una región viva (no se lee dos veces).
    'aria-hidden': 'true',
    '[attr.data-size]': 'size()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiLoadingOverlay {
  readonly message = input('');
  readonly size = input<MimiSize>('md');
  /** `fixed` cubre la ventana (servicio); `absolute`, su contenedor (`mimiBlock`). */
  readonly cover = input<'fixed' | 'absolute'>('fixed');
  readonly userClass = input('', { alias: 'class' });

  protected readonly classes = computed(() =>
    cn(
      this.cover() === 'fixed' ? 'fixed' : 'absolute',
      'inset-0 z-[var(--mimi-loading-z,50)] flex items-center justify-center',
      'bg-[color:var(--mimi-loading-bg,var(--mimi-overlay))] backdrop-blur-[var(--mimi-loading-blur,var(--mimi-overlay-blur))]',
      'rounded-[inherit]',
      this.userClass(),
    ),
  );
  protected readonly panelClasses = computed(() =>
    cn(
      'flex flex-col items-center gap-3 rounded-[var(--mimi-radius-card)] px-6 py-5',
      'bg-[color:var(--mimi-loading-panel-bg,var(--mimi-popover))] text-[color:var(--mimi-loading-fg,var(--mimi-popover-foreground))]',
      'shadow-[shadow:var(--mimi-loading-shadow,var(--mimi-shadow-popover))]',
    ),
  );
  protected readonly spinnerClasses = computed(() =>
    cn(
      SIZE[this.size()].spinner,
      'text-[color:var(--mimi-loading-spinner,var(--mimi-primary))] animate-[mimi-spin_0.8s_linear_infinite] motion-reduce:animate-none',
    ),
  );
  protected readonly textClasses = computed(() => cn(SIZE[this.size()].text, 'font-medium'));
}
