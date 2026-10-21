import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  isDevMode,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { cva } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';
import { MimiInput } from '@/components/ui/input';
import { cn } from '@/components/ui/utils/cn';
import { MimiPaginationPageSize } from './pagination-page-size';
import { MIMI_PAGINATION_TEXT } from './pagination-texts';

/*
 * Pagination (docs/design/Mimi Pagination.dc.html y Mimi F7 Pagination.dc.html; prefijo de tokens
 * `pagination`, spec 13): píldora compacta `[←] [página] / total [→] | registros por página`.
 *
 * Es una región de navegación (`role="navigation"`) con paradas de Tab normales: son tres o cuatro
 * controles distintos, no una fila de ítems iguales, y el campo necesita sus flechas. ← y → usan
 * `aria-disabled` en los extremos (no `disabled`), para que el foco no se pierda al llegar.
 */

export type MimiPaginationSize = 'sm' | 'md';
export type MimiPaginationVariant = 'inline' | 'floating';

/** Lo que emite `paginate`: el estado final de cada acción del usuario. */
export interface MimiPaginationEvent {
  page: number;
  pageSize: number;
}

const paginationVariants = cva(
  [
    'inline-flex max-w-full items-center rounded-full border font-sans text-foreground',
    'border-[color:var(--mimi-pagination-border,var(--mimi-glass-border))] bg-[color:var(--mimi-pagination-bg,var(--mimi-glass))]',
    'backdrop-blur-[var(--mimi-pagination-blur,var(--mimi-glass-blur))] backdrop-saturate-[1.4]',
  ],
  {
    variants: {
      size: { sm: 'gap-[4px] p-[3px] text-[13px]', md: 'gap-[6px] p-[4px] text-sm' },
      // La flotante solo cambia la sombra; la posición se da con `class`.
      variant: {
        inline: 'shadow-neutral',
        floating: 'shadow-[shadow:var(--mimi-pagination-shadow,var(--mimi-shadow-popover))]',
      },
    },
    defaultVariants: { size: 'sm', variant: 'inline' },
  },
);

const ARROW_CLASSES = {
  sm: 'size-[var(--mimi-pagination-item-size,var(--mimi-control-height-sm,2rem))] rounded-full [&_svg]:size-4',
  md: 'size-[var(--mimi-pagination-item-size,var(--mimi-control-height,2.5rem))] rounded-full [&_svg]:size-[18px]',
};
// 0,9 en vez del 0,88 del diseño (plan T.2a); deshabilitado, sin escala (también con Espacio).
const ARROW_PRESS = 'active:scale-(--mimi-press-scale-sm) aria-disabled:active:scale-100';

const INPUT_CLASSES = cn(
  'rounded-full px-1 text-center font-semibold tabular-nums read-only:cursor-default',
  'hover:not-aria-invalid:border-input-hover',
  'aria-invalid:border-[color:var(--mimi-pagination-error,var(--mimi-destructive))] aria-invalid:focus-visible:border-[color:var(--mimi-pagination-error,var(--mimi-destructive))]',
  'aria-invalid:ring-3 aria-invalid:ring-destructive-ring',
);

const ERROR_CLASSES =
  'pointer-events-none absolute bottom-[calc(100%_+_12px)] left-1/2 z-10 -translate-x-1/2 rounded-[7px] bg-[color:var(--mimi-pagination-error,var(--mimi-destructive))] px-[9px] py-[5px] text-xs font-semibold whitespace-nowrap text-destructive-foreground shadow-destructive';

let nextId = 0;
let warnedSize = false;

/**
 * Paginación:
 *
 * ```html
 * <mimi-pagination [(page)]="page" [(pageSize)]="size" [total]="240"
 *                  [pageSizeOptions]="[10, 25, 50]" (paginate)="load($event)" />
 * ```
 *
 * `total` es el número de **registros**. `page` empieza en 1.
 */
@Component({
  selector: 'mimi-pagination',
  imports: [MimiInput, MimiPaginationPageSize],
  template: `
    <button
      type="button"
      [class]="arrowClasses()"
      [attr.aria-label]="text.previous"
      [attr.aria-disabled]="first() || disabled() ? 'true' : null"
      (click)="previous()"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- Lucide chevron-left (ISC) -->
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>

    <span class="relative flex items-center gap-[inherit]">
      @for (attempt of [attempt()]; track attempt) {
        @if (error()) {
          <!-- Se recrea en cada intento: así role="alert" se vuelve a anunciar. -->
          <span role="alert" data-slot="error" [id]="errorId" [class]="errorClasses">
            {{ text.outOfRange(pageCount()) }}
            <span
              aria-hidden="true"
              class="absolute -bottom-1 left-1/2 -ml-1 size-2 rotate-45 rounded-[1px] bg-[color:var(--mimi-pagination-error,var(--mimi-destructive))]"
            ></span>
          </span>
        }
      }
      <input
        #field
        mimiInput
        type="text"
        inputmode="numeric"
        autocomplete="off"
        enterkeyhint="go"
        [size]="size() === 'md' ? 'default' : 'sm'"
        [class]="inputClasses()"
        [showError]="error()"
        [value]="fieldValue()"
        [readOnly]="disabled()"
        [attr.maxlength]="maxLength()"
        [attr.aria-label]="text.page(pageCount())"
        [attr.aria-describedby]="error() ? errorId : null"
        [attr.aria-disabled]="disabled() ? 'true' : null"
        (input)="onInput($event)"
        (keydown)="onKeydown($event)"
        (focus)="onFocus($event)"
        (mouseup)="onMouseup($event)"
        (blur)="onBlur()"
      />
      <span
        aria-hidden="true"
        data-slot="total"
        class="pe-[2px] whitespace-nowrap text-muted-foreground tabular-nums"
      >
        / {{ pageCount() }}
      </span>
    </span>

    <button
      type="button"
      [class]="arrowClasses()"
      [attr.aria-label]="text.next"
      [attr.aria-disabled]="last() || disabled() ? 'true' : null"
      (click)="next()"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- Lucide chevron-right (ISC) -->
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>

    @if (sizeOptions().length) {
      <!-- En móvil (y con class, en una zona estrecha) se oculta: queda ← página / total →. -->
      <span data-slot="page-size" class="flex items-center gap-[inherit] max-sm:hidden">
        <span aria-hidden="true" class="mx-[2px] h-[18px] w-px shrink-0 bg-border"></span>
        @defer (on immediate) {
          <mimi-pagination-page-size
            [options]="sizeOptions()"
            [value]="safeSize()"
            [size]="size()"
            [blocked]="disabled()"
            (changed)="changeSize($event)"
          />
        } @placeholder {
          <!-- Mientras llega Select: el mismo botón, sin función, para que nada salte. -->
          <span aria-hidden="true" [class]="placeholderClasses()">
            {{ text.pageSizeOption(safeSize()) }}
            <svg
              class="size-3.5 shrink-0 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <!-- Lucide chevron-up (ISC) -->
              <path d="m18 15-6-6-6 6" />
            </svg>
          </span>
        }
      </span>
    }
  `,
  host: {
    role: 'navigation',
    '[attr.aria-label]': 'ariaLabel() || text.label',
    '[class]': 'classes()',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiPagination {
  protected readonly text = inject(MIMI_PAGINATION_TEXT);
  // En una propiedad: la región del anunciador existe antes del primer anuncio.
  private readonly announcer = inject(LiveAnnouncer);

  /** La página, desde 1. Admite `[(page)]`. */
  readonly page = model(1);
  /** Registros por página. Admite `[(pageSize)]`. */
  readonly pageSize = model(10);
  /** Número total de **registros** (no de páginas). */
  readonly total = input.required<number>();
  /** Tamaños para elegir. Vacío (por defecto), sin selector. */
  readonly pageSizeOptions = input<readonly number[]>([]);
  /** `sm` (por defecto, controles de 32px) o `md` (40px). */
  readonly size = input<MimiPaginationSize>('sm');
  /** `floating` solo cambia la sombra; la posición va en `class`. */
  readonly variant = input<MimiPaginationVariant>('inline');
  /** Todo deshabilitado (por ejemplo, mientras carga), sin sacar el foco de donde esté. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Nombre de la región. Por defecto, el de los textos («Pagination»). */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });
  /** Clases de la píldora, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  /** Una vez por acción del usuario, con el estado final (la página y el tamaño). */
  readonly paginate = output<MimiPaginationEvent>();

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  /** Registros por página, siempre 1 o más. */
  protected readonly safeSize = computed(() => {
    const size = Math.floor(Number(this.pageSize()));
    return size >= 1 ? size : 1;
  });
  /** Número de páginas (al menos 1). Útil para corregir una página que quedó fuera. */
  readonly pageCount = computed(() => {
    const total = Math.floor(Number(this.total()));
    return Math.max(1, Math.ceil((total > 0 ? total : 0) / this.safeSize()));
  });
  /**
   * La página que se pinta: la del modelo, acotada. Una página fuera de rango que llega de fuera
   * (por ejemplo, `total` en 0 mientras cargan los datos) no se reescribe.
   */
  protected readonly current = computed(() => {
    const page = Math.floor(Number(this.page()));
    return Math.min(Math.max(Number.isFinite(page) ? page : 1, 1), this.pageCount());
  });
  protected readonly first = computed(() => this.current() <= 1);
  protected readonly last = computed(() => this.current() >= this.pageCount());

  /** Tamaños del selector; si `pageSize` no está, se agrega (y avisa en desarrollo). */
  protected readonly sizeOptions = computed(() => {
    const options = [...this.pageSizeOptions()];
    const size = this.safeSize();
    if (!options.length || options.includes(size)) return options;
    if (isDevMode() && !warnedSize) {
      warnedSize = true;
      console.warn(`Mimi Pagination: pageSize (${size}) no está en pageSizeOptions; se agrega.`);
    }
    return [...options, size].sort((a, b) => a - b);
  });

  /** Lo que se está escribiendo en el campo (null: muestra la página actual). */
  private readonly draft = signal<string | null>(null);
  protected readonly error = signal(false);
  /** Sube en cada intento inválido, para recrear el globo de error. */
  protected readonly attempt = signal(0);
  protected readonly fieldValue = computed(() => this.draft() ?? String(this.current()));
  protected readonly maxLength = computed(() => String(this.pageCount()).length);
  protected readonly errorId = `mimi-pagination-error-${nextId++}`;

  protected readonly classes = computed(() =>
    cn(paginationVariants({ size: this.size(), variant: this.variant() }), this.userClass()),
  );
  /**
   * Las clases de un botón ghost de ícono de Button, sin la directiva `mimiBtn`: ella pondría
   * `disabled` nativo (y el foco se perdería en los extremos) o pisaría el `aria-disabled`.
   */
  protected readonly arrowClasses = computed(() =>
    cn(
      buttonVariants({ variant: 'ghost', tone: 'secondary', size: 'icon' }),
      ARROW_CLASSES[this.size()],
      ARROW_PRESS,
    ),
  );
  protected readonly inputClasses = computed(() =>
    cn(
      INPUT_CLASSES,
      this.size() === 'md'
        ? 'w-[var(--mimi-pagination-input-width,52px)]'
        : 'w-[var(--mimi-pagination-input-width,44px)]',
    ),
  );
  protected readonly errorClasses = ERROR_CLASSES;
  protected readonly placeholderClasses = computed(() =>
    cn(
      'inline-flex items-center gap-1 rounded-full pr-2 pl-2.5 font-semibold whitespace-nowrap tabular-nums',
      this.size() === 'md'
        ? 'h-[var(--mimi-pagination-item-size,var(--mimi-control-height,2.5rem))] text-sm'
        : 'h-[var(--mimi-pagination-item-size,var(--mimi-control-height-sm,2rem))] text-[13px]',
    ),
  );

  private selectOnMouseup = false;

  protected previous(): void {
    if (!this.first()) this.go(this.current() - 1);
  }

  protected next(): void {
    if (!this.last()) this.go(this.current() + 1);
  }

  /** Cambia el tamaño manteniendo visible el primer registro que se veía (como MatPaginator). */
  protected changeSize(size: number): void {
    if (this.disabled() || size === this.safeSize()) return;
    const firstRecord = (this.current() - 1) * this.safeSize();
    this.pageSize.set(size);
    const page = Math.min(Math.floor(firstRecord / size) + 1, this.pageCount());
    this.page.set(page);
    this.paginate.emit({ page, pageSize: size });
    this.announce(page);
  }

  protected onInput(event: Event): void {
    const field = event.target as HTMLInputElement;
    const digits = field.value.replace(/\D/g, '').slice(0, this.maxLength());
    if (digits !== field.value) field.value = digits;
    this.draft.set(digits);
    this.error.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    // Enfocado con Tab: ya no hay un mouseup que deshaga la selección.
    this.selectOnMouseup = false;
    switch (event.key) {
      case 'Enter': {
        // También evita enviar el formulario que la contenga.
        event.preventDefault();
        if (this.disabled() || this.draft() === null) return;
        const page = this.parse(this.draft());
        if (page === null) {
          this.error.set(true);
          this.attempt.update((n) => n + 1);
          return;
        }
        this.go(page);
        this.reset();
        return;
      }
      case 'Escape':
        if (this.draft() === null && !this.error()) return;
        event.preventDefault();
        this.reset();
        return;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        if (this.disabled()) return;
        this.reset();
        if (event.key === 'ArrowUp') this.next();
        else this.previous();
        return;
    }
  }

  /** Al salir: una página válida se aplica; si no, vuelve a la actual sin error. */
  protected onBlur(): void {
    this.selectOnMouseup = false;
    if (this.draft() === null) return;
    const page = this.disabled() ? null : this.parse(this.draft());
    if (page !== null) this.go(page);
    this.reset();
  }

  /** Al enfocar, selecciona el número (con un clic, después del mouseup, que lo deshace). */
  protected onFocus(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
    this.selectOnMouseup = true;
  }

  protected onMouseup(event: MouseEvent): void {
    if (!this.selectOnMouseup) return;
    this.selectOnMouseup = false;
    event.preventDefault();
  }

  /** Va a esa página: escribe el modelo, emite y anuncia, solo si cambia. */
  private go(page: number): void {
    if (this.disabled() || page === this.current()) return;
    this.page.set(page);
    this.paginate.emit({ page, pageSize: this.safeSize() });
    this.announce(page);
  }

  private announce(page: number): void {
    void this.announcer.announce(this.text.announce(page, this.pageCount()), 'polite');
  }

  /**
   * Vuelve a mostrar la página actual (también en el DOM: el binding no se entera si el texto
   * escrito coincide con la página nueva). Va después de `go()`.
   */
  private reset(): void {
    this.draft.set(null);
    this.error.set(false);
    this.field().nativeElement.value = String(this.current());
  }

  /** Página válida (entera, de 1 al total) o null. */
  private parse(text: string | null): number | null {
    if (!text) return null;
    const page = Number(text);
    return Number.isInteger(page) && page >= 1 && page <= this.pageCount() ? page : null;
  }
}

/** Para importarla con su selector (las piezas internas no se usan en plantillas). */
export const MimiPaginationImports = [MimiPagination] as const;
