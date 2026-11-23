import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  type Signal,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { cn } from '@/components/ui/utils/cn';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import { MimiSized } from '@/components/ui/utils/size';
import { MIMI_STEPPER_TEXT } from './stepper-texts';

/*
 * Stepper (G4.3; forma de referencia: docs/design/Mimi F5 Estructura.dc.html, «3 · Stepper»): un
 * proceso en pasos. La lista es un `<ol>` y el paso actual lleva `aria-current="step"`; cada
 * cabecera es un botón para ir a ese paso. Un `role="status"` anuncia el cambio de paso. En el
 * teléfono (menos de 640 px) la lista horizontal pasa a vertical.
 *
 * Formularios: cada paso puede llevar su formulario (`[form]`): un `FormGroup` de Reactive Forms o
 * un campo de Signal Forms. Con `linear`, no se avanza desde un paso inválido: se marca tocado (se
 * ven sus errores) y queda en estado de error. Sin importar `@angular/forms`: se reconocen por su
 * forma (Reactive: `valid`, `events`, `markAllAsTouched`; Signal Forms: una función que da el
 * estado con `valid()` y `markAsTouched()`).
 */

export type MimiStepperOrientation = 'horizontal' | 'vertical';
export type MimiStepState = 'completed' | 'current' | 'pending' | 'error';

/** Un `FormGroup` (o cualquier `AbstractControl`) de Reactive Forms, por su forma. */
interface ReactiveFormLike {
  readonly valid: boolean;
  readonly events: { subscribe(next: () => void): { unsubscribe(): void } };
  markAllAsTouched(): void;
}
/** Un campo de Signal Forms (`form(…)` o una parte), por su forma. */
type SignalFormLike = () => { valid: Signal<boolean>; markAsTouched(): void };
/** El formulario de un paso: Reactive Forms o Signal Forms. */
export type MimiStepForm = ReactiveFormLike | SignalFormLike;

const ICON = {
  check: 'M20 6 9 17l-5-5',
  x: ['M18 6 6 18', 'm6 6 12 12'],
} as const;

/** Clases según la orientación: `horizontal` es vertical por debajo de 640 px (`sm:`). */
const LAYOUT = {
  horizontal: {
    list: 'flex flex-col sm:grid sm:auto-cols-fr sm:grid-flow-col',
    // Desde 640 px, el botón va centrado en su columna (el círculo, en el centro de la columna) y
    // la línea va del borde de un círculo al del siguiente (23/11/2026, error del usuario: el
    // botón quedaba al inicio de la columna y la línea salía desplazada y cortada).
    item: 'relative flex pb-5 last:pb-0 sm:justify-center sm:pb-0',
    button:
      'flex items-start gap-3.5 text-start sm:flex-col sm:items-center sm:gap-2 sm:text-center',
    text: 'flex flex-col gap-0.5 pt-[calc((var(--mimi-stepper-s,32px)_-_1.25rem)/2)] sm:pt-0',
    line: 'absolute start-[calc(var(--mimi-stepper-s,32px)/2_-_1px)] top-[var(--mimi-stepper-s,32px)] bottom-0 w-0.5 sm:start-[calc(50%_+_var(--mimi-stepper-s,32px)/2)] sm:end-[calc(-50%_+_var(--mimi-stepper-s,32px)/2)] sm:top-[calc(var(--mimi-stepper-s,32px)/2_-_1px)] sm:bottom-auto sm:h-0.5 sm:w-auto',
  },
  vertical: {
    list: 'flex flex-col',
    item: 'relative flex pb-5 last:pb-0',
    button: 'flex items-start gap-3.5 text-start',
    text: 'flex flex-col gap-0.5 pt-[calc((var(--mimi-stepper-s,32px)_-_1.25rem)/2)]',
    // Del borde de abajo del círculo al de arriba del siguiente (el siguiente empieza en el borde
    // de abajo de este ítem).
    line: 'absolute start-[calc(var(--mimi-stepper-s,32px)/2_-_1px)] top-[var(--mimi-stepper-s,32px)] bottom-0 w-0.5',
  },
} as const;

const BUTTON_CLASSES = cn(
  'group/step rounded-[var(--mimi-radius-sm)] bg-transparent p-0 font-sans',
  'not-aria-disabled:cursor-pointer aria-disabled:cursor-not-allowed',
  buttonFocusStyles,
);

const INDICATOR_CLASSES = cn(
  'relative inline-flex size-[var(--mimi-stepper-s,32px)] shrink-0 items-center justify-center rounded-full border-2 text-[length:var(--mimi-stepper-number,0.8125rem)] font-bold mimi-transition [&_svg]:size-[45%]',
  'data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground',
  'data-[state=current]:border-primary data-[state=current]:bg-background data-[state=current]:text-foreground data-[state=current]:shadow-[shadow:0_0_0_4px_var(--mimi-ring-soft)]',
  'data-[state=pending]:border-border data-[state=pending]:bg-background data-[state=pending]:text-muted-foreground',
  'data-[state=error]:border-destructive data-[state=error]:bg-destructive data-[state=error]:text-destructive-foreground data-[state=error]:shadow-[shadow:0_0_0_4px_var(--mimi-destructive-soft)]',
);

const TITLE_CLASSES = cn(
  'text-[length:var(--mimi-stepper-text,0.8125rem)] font-semibold text-foreground',
  'group-data-[state=pending]/step:text-muted-foreground group-data-[state=error]/step:text-destructive-soft-foreground',
);

const HINT_CLASSES =
  'text-[length:var(--mimi-stepper-hint,0.71875rem)] text-muted-foreground group-data-[state=error]/step:text-destructive-soft-foreground';

const LINE_CLASSES = cn(
  'rounded-full bg-[color:var(--mimi-stepper-line,var(--mimi-border))] transition-[background-color] duration-300 motion-reduce:transition-none',
  'data-[done]:bg-[color:var(--mimi-stepper-line-done,var(--mimi-primary))]',
);

let nextId = 0;

/**
 * Un paso: su título, su estado y su contenido (lo que va dentro, visible cuando es el actual).
 *
 * ```html
 * <mimi-step title="Datos" [form]="datos">…campos…</mimi-step>
 * ```
 */
@Component({
  selector: 'mimi-step',
  template: '<ng-content />',
  host: {
    role: 'group',
    // `title` es una entrada: sin esto, el atributo quedaría en el anfitrión (y el navegador
    // mostraría su tooltip sobre todo el contenido del paso).
    '[attr.title]': 'null',
    '[id]': 'panelId',
    '[attr.aria-labelledby]': 'triggerId',
    '[hidden]': '!active()',
    '[attr.data-state]': 'state()',
    '[class]': 'userClass()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiStep {
  private readonly stepper = inject(MimiStepper);
  /** El anfitrión: el contenido del paso (el Stepper busca en él el campo inválido). */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** El nombre del paso, en la lista. */
  readonly title = input('');
  /** Texto bajo el título (si no, el estado: «Completado», «Actual»…). */
  readonly description = input('');
  /** Se puede saltar: en un stepper lineal no frena aunque su formulario no sea válido. */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Completado por ti (si no, lo está un paso anterior al actual con su formulario válido). */
  readonly completed = input<boolean | undefined>(undefined);
  /** En error por ti (si no, lo está si se intentó dejarlo con el formulario inválido). */
  readonly error = input(false, { transform: booleanAttribute });
  /** No se puede ir a este paso desde la lista. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Su formulario: un `FormGroup` de Reactive Forms o un campo de Signal Forms. */
  readonly form = input<MimiStepForm | null>(null);
  readonly userClass = input('', { alias: 'class' });

  private readonly id = nextId++;
  readonly triggerId = `mimi-step-${this.id}-trigger`;
  readonly panelId = `mimi-step-${this.id}-panel`;

  /** Se intentó dejar el paso con el formulario inválido. */
  readonly attempted = signal(false);
  /** Reactive Forms no es un signal: un tic por cada evento del control (spec 8). */
  private readonly tick = signal(0);

  constructor() {
    effect((onCleanup) => {
      const form = this.form();
      if (!form || typeof form === 'function') return;
      const subscription = form.events.subscribe(() => this.tick.update((n) => n + 1));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /** El formulario es válido (sin formulario, siempre). */
  readonly valid = computed(() => {
    const form = this.form();
    if (!form) return true;
    if (typeof form === 'function') return form().valid();
    this.tick();
    return form.valid;
  });

  /** Marca el formulario como tocado: se ven sus errores. */
  touch(): void {
    const form = this.form();
    if (!form) return;
    if (typeof form === 'function') form().markAsTouched();
    else form.markAllAsTouched();
  }

  readonly index = computed(() => this.stepper.steps().indexOf(this));
  protected readonly active = computed(() => this.stepper.value() === this.index());
  readonly state = computed<MimiStepState>(() => this.stepper.stateOf(this.index()));
}

/**
 * El stepper: la lista de pasos y el contenido del actual. `value` es el índice del paso (desde
 * 0). Con `linear`, se avanza de uno en uno y solo si el paso es válido.
 *
 * ```html
 * <mimi-stepper #pasos="mimiStepper" [(value)]="paso" linear aria-label="Alta de cliente">
 *   <mimi-step title="Datos" [form]="datos">…</mimi-step>
 *   <mimi-step title="Pago">…</mimi-step>
 * </mimi-stepper>
 * <button mimiBtn [mimiStepperPrev]="pasos">Atrás</button>
 * <button mimiBtn [mimiStepperNext]="pasos">Siguiente</button>
 * ```
 */
@Component({
  selector: 'mimi-stepper',
  exportAs: 'mimiStepper',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  template: `
    <ol data-slot="steps" [class]="layout().list" [attr.aria-label]="ariaLabel() || null">
      @for (step of steps(); track step; let i = $index; let last = $last) {
        <li [class]="layout().item" [attr.data-state]="stateOf(i)">
          <button
            type="button"
            data-slot="step-trigger"
            [id]="step.triggerId"
            [class]="buttonClasses()"
            [attr.data-state]="stateOf(i)"
            [attr.aria-current]="i === value() ? 'step' : null"
            [attr.aria-controls]="step.panelId"
            [attr.aria-disabled]="reachable(i) ? null : 'true'"
            (click)="goTo(i)"
          >
            <span
              data-slot="indicator"
              aria-hidden="true"
              [class]="indicatorClasses"
              [attr.data-state]="stateOf(i)"
            >
              @switch (stateOf(i)) {
                @case ('completed') {
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path [attr.d]="icon.check" />
                  </svg>
                }
                @case ('error') {
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path [attr.d]="icon.x[0]" />
                    <path [attr.d]="icon.x[1]" />
                  </svg>
                }
                @default {
                  {{ i + 1 }}
                }
              }
            </span>
            <span [class]="layout().text">
              <span class="sr-only">{{ text.step(i + 1, steps().length) }}: </span>
              <!-- La coma, dentro del título: título y texto son bloques, y el nombre accesible
                   pondría un espacio antes de ella (revisión de accesibilidad, S3). -->
              <span data-slot="step-title" [class]="titleClasses"
                >{{ step.title() }}<span class="sr-only">,</span></span
              >
              <span data-slot="step-hint" [class]="hintClasses">
                {{ step.description() || stateText(i) }}
                @if (step.optional()) {
                  · {{ text.optional }}
                }
                @if (step.description()) {
                  <span class="sr-only">, {{ stateText(i) }}</span>
                }
              </span>
            </span>
          </button>
          @if (!last) {
            <span
              aria-hidden="true"
              data-slot="step-line"
              [class]="lineClasses()"
              [attr.data-done]="stateOf(i) === 'completed' ? '' : null"
            ></span>
          }
        </li>
      }
    </ol>
    <span class="sr-only" role="status">{{ announcement() }}</span>
    <div data-slot="step-content" class="mt-6"><ng-content /></div>
  `,
  host: {
    // `aria-label` es una entrada: va a la lista (`<ol>`), no al anfitrión (sin rol).
    '[attr.aria-label]': 'null',
    '[class]': 'classes()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-linear]': 'linear() ? "" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiStepper {
  /** El paso actual (su índice, desde 0). Admite `[(value)]`. */
  readonly value = model(0);
  /** De uno en uno y solo si el paso es válido (los opcionales no frenan). */
  readonly linear = input(false, { transform: booleanAttribute });
  /** `horizontal` (vertical en el teléfono, por debajo de 640 px) o `vertical` siempre. */
  readonly orientation = input<MimiStepperOrientation>('horizontal');
  /** Nombre de la lista de pasos. */
  readonly ariaLabel = input('', { alias: 'aria-label' });
  readonly userClass = input('', { alias: 'class' });
  /** Se pidió avanzar desde el último paso, con todo válido: el proceso terminó. */
  readonly finish = output<void>();

  readonly steps = contentChildren(MimiStep);
  protected readonly text = inject(MIMI_STEPPER_TEXT);
  private readonly injector = inject(Injector);
  protected readonly icon = ICON;

  protected readonly layout = computed(() => LAYOUT[this.orientation()]);
  protected readonly classes = computed(() => cn('block font-sans', this.userClass()));
  protected readonly buttonClasses = computed(() => cn(BUTTON_CLASSES, this.layout().button));
  protected readonly lineClasses = computed(() => cn(LINE_CLASSES, this.layout().line));
  protected readonly indicatorClasses = INDICATOR_CLASSES;
  protected readonly titleClasses = TITLE_CLASSES;
  protected readonly hintClasses = HINT_CLASSES;

  readonly isFirst = computed(() => this.value() <= 0);
  readonly isLast = computed(() => this.value() >= this.steps().length - 1);

  /** Lo que anuncia el `role="status"` al cambiar de paso (vacío al empezar). */
  protected readonly announcement = signal('');
  private announced: number | null = null;

  constructor() {
    effect(() => {
      const index = this.value();
      const steps = this.steps();
      const step = steps[index];
      if (!step) return;
      untracked(() => {
        if (this.announced !== null && this.announced !== index) {
          this.announcement.set(this.text.announce(index + 1, steps.length, step.title()));
        }
        this.announced = index;
      });
    });
  }

  stateOf(index: number): MimiStepState {
    const step = this.steps()[index];
    if (!step) return 'pending';
    if (step.error() || (step.attempted() && !step.valid())) return 'error';
    if (index === this.value()) return 'current';
    const done = step.completed();
    if (done !== undefined) return done ? 'completed' : 'pending';
    return index < this.value() && step.valid() ? 'completed' : 'pending';
  }

  protected stateText(index: number): string {
    return this.text[this.stateOf(index)];
  }

  /** Se puede ir a ese paso desde la lista. */
  reachable(index: number): boolean {
    const steps = this.steps();
    const step = steps[index];
    if (!step || step.disabled()) return false;
    if (!this.linear() || index <= this.value()) return true;
    // Lineal: todos los anteriores, válidos u opcionales.
    return steps.slice(0, index).every((s) => s.optional() || s.valid());
  }

  /**
   * Va al paso `index`. Lineal y hacia delante: cada paso que se deja debe ser válido (u opcional);
   * el primero que no lo es se marca tocado y en error, y el stepper se queda en él.
   */
  goTo(index: number): boolean {
    const steps = this.steps();
    if (index < 0 || index >= steps.length || index === this.value()) return false;
    if (steps[index].disabled()) return false;
    if (this.linear() && index > this.value()) {
      for (let i = this.value(); i < index; i++) {
        const step = steps[i];
        if (step.optional() || step.valid()) continue;
        if (i !== this.value()) this.value.set(i);
        this.stop(step, i);
        return false;
      }
    }
    this.value.set(index);
    return true;
  }

  /** Siguiente paso. Desde el último, con su formulario válido, emite `finish`. */
  next(): boolean {
    if (!this.isLast()) return this.goTo(this.value() + 1);
    const step = this.steps()[this.value()];
    if (step && !step.optional() && !step.valid()) {
      this.stop(step, this.value());
      return false;
    }
    this.finish.emit();
    return true;
  }

  /**
   * No se puede dejar el paso: se marca tocado (se ven sus errores) y en error, se anuncia
   * («Paso 1 de 3: Tú tiene errores») y el foco va al primer campo inválido del paso (o al
   * primero que haya), para que se sepa por qué no avanzó (revisión de accesibilidad, S2).
   */
  private stop(step: MimiStep, index: number): void {
    step.touch();
    step.attempted.set(true);
    const total = this.steps().length;
    this.announcement.set(this.text.invalid(index + 1, total, step.title()));
    afterNextRender(
      () => {
        const host = step.element;
        const target =
          host.querySelector<HTMLElement>('[aria-invalid="true"]') ??
          host.querySelector<HTMLElement>(
            'input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
        target?.focus();
      },
      { injector: this.injector },
    );
  }

  /** Paso anterior. */
  prev(): boolean {
    return this.goTo(this.value() - 1);
  }
}

/** Botón «Siguiente» de un stepper: `<button mimiBtn [mimiStepperNext]="pasos">`. */
@Directive({
  selector: '[mimiStepperNext]',
  host: { '(click)': 'stepper().next()' },
})
export class MimiStepperNext {
  readonly stepper = input.required<MimiStepper>({ alias: 'mimiStepperNext' });
}

/** Botón «Atrás» de un stepper: `<button mimiBtn [mimiStepperPrev]="pasos">`. */
@Directive({
  selector: '[mimiStepperPrev]',
  host: { '(click)': 'stepper().prev()' },
})
export class MimiStepperPrev {
  readonly stepper = input.required<MimiStepper>({ alias: 'mimiStepperPrev' });
}

export const MimiStepperImports = [
  MimiStepper,
  MimiStep,
  MimiStepperNext,
  MimiStepperPrev,
] as const;
