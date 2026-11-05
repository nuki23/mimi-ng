import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import { MIMI_CHIP_TEXT } from './chip-texts';

/*
 * Chip compartido (ítem `chip` de la CLI, decidido el 03/11/2026; prefijo de tokens `chip`,
 * spec 13). Lo usan Tags Input (G2.6) y el Combobox múltiple (G2.8): el chip con su botón de
 * quitar y un util de anuncios (`injectMimiChipAnnouncer`).
 */

const CHIP_BASE = cn(
  'inline-flex max-w-full min-w-0 shrink-0 items-center gap-1 ps-2.5 font-medium whitespace-nowrap mimi-transition',
  'h-[var(--mimi-chip-height,26px)] rounded-[var(--mimi-chip-radius,var(--mimi-badge-radius,999px))] text-[length:var(--mimi-chip-font-size,13px)]',
);
/** Colores: el global `--mimi-chip` (G2.0b, con respaldo) o, con error, el suave de `danger`. */
const CHIP_TONE = {
  default:
    'bg-[color:var(--mimi-chip-bg,var(--mimi-chip,var(--mimi-secondary)))] text-[color:var(--mimi-chip-fg,var(--mimi-chip-foreground,var(--mimi-secondary-foreground)))]',
  invalid: 'bg-destructive-soft-bg text-destructive-soft-foreground',
} as const;

const REMOVE_CLASSES = cn(
  'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-current opacity-70 mimi-transition',
  'size-[var(--mimi-chip-remove-size,18px)] [&_svg]:size-3',
  'hover:bg-[color:color-mix(in_oklab,var(--mimi-foreground)_12%,transparent)] hover:opacity-100 active:scale-(--mimi-press-scale-sm)',
  buttonFocusStyles,
);

/**
 * Chip: `<mimi-chip removable (remove)="quitar(i)">angular</mimi-chip>`. El botón se llama
 * «Remove angular» (`MIMI_CHIP_TEXT`); con `label` se cambia la etiqueta que usa el nombre.
 */
@Component({
  selector: 'mimi-chip',
  template: `
    <span class="min-w-0 truncate"><ng-content /></span>
    @if (removable()) {
      <button
        type="button"
        data-slot="remove"
        [class]="removeClasses"
        [attr.aria-label]="text.remove(label() ?? '')"
        (click)="remove.emit()"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <!-- Lucide x (ISC) -->
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    }
  `,
  host: {
    '[class]': 'classes()',
    '[attr.data-invalid]': 'invalid() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiChip {
  protected readonly text = inject(MIMI_CHIP_TEXT);

  /** Muestra el botón de quitar. */
  readonly removable = input(false, { transform: booleanAttribute });
  /** La etiqueta para el nombre del botón («Remove angular»). */
  readonly label = input<string>();
  /** Con error (por ejemplo, el duplicado que se intentó agregar). */
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  /** Se pulsó el botón de quitar. */
  readonly remove = output<void>();

  protected readonly removeClasses = REMOVE_CLASSES;
  protected readonly classes = computed(() =>
    cn(
      CHIP_BASE,
      this.removable() ? 'pe-1' : 'pe-2.5',
      CHIP_TONE[this.invalid() ? 'invalid' : 'default'],
      this.userClass(),
    ),
  );
}

/**
 * Anuncios de agregar y quitar, con el `LiveAnnouncer` del CDK en `polite` («angular agregada»).
 * Se llama en el contexto de inyección (al declarar una propiedad).
 */
export function injectMimiChipAnnouncer(): {
  added: (label: string) => void;
  removed: (label: string) => void;
} {
  const announcer = inject(LiveAnnouncer);
  const text = inject(MIMI_CHIP_TEXT);
  return {
    added: (label) => void announcer.announce(text.added(label), 'polite'),
    removed: (label) => void announcer.announce(text.removed(label), 'polite'),
  };
}
