import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  isDevMode,
  numberAttribute,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';

/*
 * Progress (docs/design/Mimi F5 Estructura.dc.html, «4 · Progress»; prefijo de tokens
 * `progress`, spec 13): barra o círculo, determinado o indeterminado.
 *
 * Rol `progressbar` de WAI-ARIA en el propio elemento (la APG no tiene un patrón propio y
 * @angular/aria no trae uno). No recibe el foco y no anuncia nada por su cuenta: el valor se lee
 * cuando el lector llega a la barra (`aria-valuenow`); el final de la tarea lo avisa la app
 * (decidido el 03/11/2026, plan G2.10).
 */

/** Tonos del diseño (spec 4, «Variante y tono»; el diseño escribe `destructive`). */
export type MimiProgressTone = 'primary' | 'success' | 'warning' | 'info' | 'danger';
export type MimiProgressShape = 'bar' | 'circle';
/** Solo el círculo: 76px (`default`) o 44px (`sm`), los del diseño. */
export type MimiProgressSize = 'default' | 'sm';

/*
 * Pista: el token del componente, el global `--mimi-track` y, para un tema anterior a la 0.3.0
 * que no lo tenga, `--mimi-input` (G2.0b; spec 6.2): casi el mismo gris en claro y en oscuro, y
 * sin el `color-mix` de la fórmula, que Lightning CSS duplica en el CSS global. Escrita entera en
 * cada clase (Tailwind solo ve clases literales).
 */

/** Color de la parte llena por tono: el token solo cambia el primario (los tonos son globales). */
const FILL_BG: Record<MimiProgressTone, string> = {
  primary: 'bg-[color:var(--mimi-progress-fill,var(--mimi-primary))]',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  danger: 'bg-destructive',
};
const FILL_STROKE: Record<MimiProgressTone, string> = {
  primary: 'stroke-[color:var(--mimi-progress-fill,var(--mimi-primary))]',
  success: 'stroke-success',
  warning: 'stroke-warning',
  info: 'stroke-info',
  danger: 'stroke-destructive',
};

const BAR_CLASSES =
  'relative block w-full h-[var(--mimi-progress-height,8px)] overflow-hidden rounded-full bg-[color:var(--mimi-progress-track,var(--mimi-track,var(--mimi-input)))]';
const CIRCLE_CLASSES: Record<MimiProgressSize, string> = {
  default:
    'relative inline-grid shrink-0 place-items-center size-[var(--mimi-progress-circle-size,76px)] text-[16px]',
  // 44px, trazo 4 y texto de 11px: el pequeño del diseño, sin token propio (spec 13).
  sm: 'relative inline-grid shrink-0 place-items-center size-11 text-[11px]',
};

/** Barra determinada: el ancho anima 0,35 s con la curva del diseño. */
const BAR_FILL =
  'block h-full rounded-full [transition:width_.35s_cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none';
/**
 * Barra indeterminada: un tramo del 40 % que cruza (`mimi-indet`). Con movimiento reducido, la
 * barra entera late (la nota del diseño: «late en lugar de desplazarse»).
 */
const BAR_INDETERMINATE =
  'absolute inset-y-0 start-0 w-2/5 rounded-full animate-[mimi-indet_1.4s_cubic-bezier(.4,0,.2,1)_infinite] rtl:-scale-x-100 motion-reduce:w-full motion-reduce:animate-mimi-pulse';

/** Arco del círculo: el trazo anima 0,4 s; indeterminado gira (con movimiento reducido, late). */
const ARC =
  'fill-none [stroke-linecap:round] [transition:stroke-dasharray_.4s_cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none';
const SPIN = 'animate-[mimi-spin_1s_linear_infinite] motion-reduce:animate-mimi-pulse';

/** Grosor del trazo, en unidades del `viewBox` de 36. */
const STROKE: Record<MimiProgressSize, string> = {
  default: '[stroke-width:var(--mimi-progress-circle-width,3)]',
  sm: '[stroke-width:4]',
};

/**
 * Progress:
 *
 * ```html
 * <mimi-progress aria-label="Subiendo informe.pdf" [value]="64" />
 * <mimi-progress aria-label="Sincronizando" />                  <!-- indeterminado -->
 * <mimi-progress aria-label="Ventas" shape="circle" tone="success" [value]="100" />
 * ```
 *
 * `value` sin definir (o `null`) es indeterminado. El valor se acota entre 0 y `max`.
 */
@Component({
  selector: 'mimi-progress',
  template: `
    @if (shape() === 'bar') {
      @if (determinate()) {
        <span data-slot="fill" [class]="barFill()" [style.width.%]="percent()"></span>
      } @else {
        <span data-slot="fill" [class]="barIndeterminate()"></span>
      }
    } @else {
      <svg aria-hidden="true" viewBox="0 0 36 36" [class]="spinClass()">
        <circle cx="18" cy="18" r="15.915" [class]="trackClass()" />
        <circle
          data-slot="fill"
          cx="18"
          cy="18"
          r="15.915"
          [class]="arcClass()"
          [attr.stroke-dasharray]="dashArray()"
        />
      </svg>
      @if (determinate()) {
        <span aria-hidden="true" class="relative font-bold tabular-nums">{{ circleText() }}</span>
      }
    }
  `,
  host: {
    role: 'progressbar',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-labelledby]': 'ariaLabelledby() || null',
    'aria-valuemin': '0',
    '[attr.aria-valuemax]': 'safeMax()',
    '[attr.aria-valuenow]': 'determinate() ? clamped() : null',
    '[attr.aria-busy]': 'determinate() ? null : "true"',
    '[attr.data-state]': 'determinate() ? "determinate" : "indeterminate"',
    '[attr.data-tone]': 'tone()',
    '[attr.data-shape]': 'shape()',
    '[attr.data-size]': 'shape() === "circle" ? size() : null',
    '[class]': 'classes()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiProgress {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** El avance, entre 0 y `max`. Sin valor (o `null`), indeterminado. */
  readonly value = input<number | null | undefined, unknown>(undefined, {
    transform: (v: unknown) =>
      v === null || v === undefined || v === '' ? null : numberAttribute(v),
  });
  /** El total (100 por defecto). */
  readonly max = input(100, { transform: numberAttribute });
  readonly tone = input<MimiProgressTone>('primary');
  readonly shape = input<MimiProgressShape>('bar');
  /** Tamaño del círculo. */
  readonly size = input<MimiProgressSize>('default');
  /** Nombre accesible (obligatorio, o `aria-labelledby`). */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  readonly ariaLabelledby = input<string>(undefined, { alias: 'aria-labelledby' });
  /** Clases del elemento con el rol (la pista o el círculo), mezcladas con `cn()`. */
  readonly userClass = input('', { alias: 'class' });

  /** `max` válido: un número mayor que 0 (si no, 100). */
  protected readonly safeMax = computed(() => {
    const max = this.max();
    return Number.isFinite(max) && max > 0 ? max : 100;
  });
  protected readonly determinate = computed(() => {
    const value = this.value();
    return value !== null && value !== undefined && !Number.isNaN(value);
  });
  /** El valor acotado entre 0 y `max`. */
  protected readonly clamped = computed(() =>
    Math.min(this.safeMax(), Math.max(0, this.value() ?? 0)),
  );
  protected readonly percent = computed(() => (this.clamped() / this.safeMax()) * 100);
  /** En el círculo grande, «64%»; en el pequeño, «64» (como el diseño). */
  protected readonly circleText = computed(() => {
    const n = Math.round(this.percent());
    return this.size() === 'sm' ? `${n}` : `${n}%`;
  });
  protected readonly dashArray = computed(() =>
    this.determinate() ? `${this.percent()} 100` : '28 100',
  );

  protected readonly classes = computed(() =>
    cn(
      this.shape() === 'bar' ? BAR_CLASSES : CIRCLE_CLASSES[this.size()],
      'align-middle font-sans',
      this.userClass(),
    ),
  );
  protected readonly barFill = computed(() => cn(BAR_FILL, FILL_BG[this.tone()]));
  protected readonly barIndeterminate = computed(() => cn(BAR_INDETERMINATE, FILL_BG[this.tone()]));
  protected readonly trackClass = computed(() =>
    cn(
      'fill-none stroke-[color:var(--mimi-progress-track,var(--mimi-track,var(--mimi-input)))]',
      STROKE[this.size()],
    ),
  );
  protected readonly arcClass = computed(() =>
    cn(ARC, FILL_STROKE[this.tone()], STROKE[this.size()]),
  );
  protected readonly spinClass = computed(() =>
    cn('absolute inset-0 size-full -rotate-90', !this.determinate() && SPIN),
  );

  constructor() {
    if (isDevMode()) afterRenderEffect({ read: () => this.warn() });
  }

  private warned = false;
  private warn(): void {
    if (this.warned) return;
    if (
      this.host.getAttribute('aria-label')?.trim() ||
      this.host.getAttribute('aria-labelledby')?.trim()
    ) {
      return;
    }
    this.warned = true;
    console.warn('[Mimi] Progress: no tiene aria-label ni aria-labelledby (su nombre accesible).');
  }
}
