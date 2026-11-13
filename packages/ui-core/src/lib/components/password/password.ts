import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  effect,
  computed,
  contentChild,
  inject,
  input,
  signal,
} from '@angular/core';
import { MimiInput } from '@/components/ui/input';
import { cn } from '@/components/ui/utils/cn';
import { MimiSized } from '@/components/ui/utils/size';
import { buttonFocusStyles } from '@/components/ui/utils/control-styles';
import { fieldBoxStyles, fieldButtonHoverStyles } from '@/components/ui/utils/field-styles';
import { MIMI_PASSWORD_TEXT } from './password-texts';

/*
 * Password (docs/design/Mimi F3 Slider OTP Numero Mascara.dc.html, «8 · Password»; prefijo de
 * tokens `password`, spec 13). Un contenedor que proyecta el `<input mimiInput>` del usuario
 * (CLAUDE.md, regla 6: el valor y el formulario son del input nativo) y le agrega el botón de
 * mostrar u ocultar y, si se pide, el medidor.
 *
 * El botón cambia el `type` del mismo input (no lo reemplaza: el gestor de contraseñas y el
 * formulario conservan la referencia). El medidor es orientativo, no una medida de seguridad.
 */

/** 0: vacío; 1: débil; 2: media; 3: fuerte. */
export type MimiPasswordLevel = 0 | 1 | 2 | 3;

/** Una regla del medidor: su texto y si la contraseña la cumple. */
export interface MimiPasswordRule {
  label: string;
  test: (value: string) => boolean;
}

/**
 * La heurística del diseño (`strength()`), generalizada a cualquier lista de reglas: todas,
 * fuerte; al menos la mitad, media; menos, débil. Con las cuatro por defecto: 0–1 débil, 2–3
 * media, 4 fuerte.
 */
export function mimiPasswordLevel(
  value: string,
  rules: readonly MimiPasswordRule[],
): MimiPasswordLevel {
  if (!value) return 0;
  if (!rules.length) return 1;
  const passed = rules.filter((rule) => rule.test(value)).length;
  if (passed === rules.length) return 3;
  return passed >= rules.length / 2 ? 2 : 1;
}

const BOX_CLASSES = cn(
  'relative flex w-full min-w-0 items-center gap-1.5 font-sans text-foreground mimi-transition',
  'h-[var(--mimi-input-h,var(--mimi-input-height,var(--mimi-control-height,2.5rem)))] rounded-[var(--mimi-input-radius,var(--mimi-radius,0.75rem))] ps-3 pe-1',
  // Borde, hover, foco, error y deshabilitado: los de Input, con sus tokens (utils/control-styles).
  fieldBoxStyles,
  // El input del usuario (mimiInput) va sin su caja: la caja es esta. Sin el ojo de Edge.
  '[&_input]:h-full [&_input]:min-w-0 [&_input]:flex-1 [&_input]:rounded-none [&_input]:border-0 [&_input]:bg-transparent [&_input]:p-0 [&_input]:shadow-none',
  '[&_input]:focus-visible:ring-0 [&_input]:disabled:opacity-100 [&_input::-ms-reveal]:hidden',
  // El halo (foco y clic) lo dibuja la caja: el input de dentro nunca lleva el suyo, ni su fondo
  // de solo lectura.
  '[&_input]:ring-0! [&_input]:bg-transparent!',
);

const TOGGLE_CLASSES = cn(
  'inline-flex shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 mimi-transition',
  fieldButtonHoverStyles,
  'size-[var(--mimi-password-toggle-size,32px)] rounded-[var(--mimi-password-toggle-radius,var(--mimi-radius-sm))]',
  '[&_svg]:size-4 [&_svg]:shrink-0',
  'enabled:hover:bg-[color:var(--mimi-password-toggle-hover,var(--mimi-accent))] enabled:hover:text-foreground enabled:active:scale-(--mimi-press-scale-sm)',
  'disabled:cursor-not-allowed',
  buttonFocusStyles,
);

/** Barra vacía y barras con el color del nivel (globales del Grupo 2 con respaldo, G2.0b). */
const BAR_EMPTY = 'bg-[color:var(--mimi-password-meter-track,var(--mimi-track,var(--mimi-input)))]';
const BAR_FILL: Record<1 | 2 | 3, string> = {
  1: 'bg-[color:var(--mimi-strength-weak,var(--mimi-destructive))]',
  2: 'bg-[color:var(--mimi-strength-medium,var(--mimi-warning))]',
  3: 'bg-[color:var(--mimi-strength-strong,var(--mimi-success))]',
};
const LEVEL_TEXT: Record<1 | 2 | 3, string> = {
  1: 'text-destructive-soft-foreground',
  2: 'text-warning-soft-foreground',
  3: 'text-success-soft-foreground',
};

let nextId = 0;

/**
 * Password:
 *
 * ```html
 * <mimi-password meter>
 *   <input mimiInput type="password" autocomplete="new-password" formControlName="password" />
 * </mimi-password>
 * ```
 *
 * El `type`, el `autocomplete` y el nombre del campo son del usuario.
 */
@Component({
  selector: 'mimi-password',
  hostDirectives: [{ directive: MimiSized, inputs: ['size'] }],
  template: `
    <div
      data-slot="box"
      [class]="boxClasses()"
      [attr.data-invalid]="invalid() ? '' : null"
      [attr.data-disabled]="isDisabled() ? '' : null"
      [attr.data-readonly]="readonly() || nativeReadonly() ? '' : null"
    >
      <ng-content />
      <button
        type="button"
        data-slot="toggle"
        [class]="toggleClasses"
        [attr.aria-label]="text.show"
        [attr.aria-pressed]="shown()"
        [disabled]="isDisabled()"
        (click)="toggle()"
      >
        @if (shown()) {
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <!-- Lucide eye-off (ISC) -->
            <path
              d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
            />
            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
            <path
              d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
            />
            <path d="m2 2 20 20" />
          </svg>
        } @else {
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <!-- Lucide eye (ISC) -->
            <path
              d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        }
      </button>
    </div>
    @if (meter()) {
      <div data-slot="meter" class="flex flex-col gap-2" [id]="meterId">
        <div class="flex items-center gap-2.5">
          <div
            aria-hidden="true"
            class="grid flex-1 grid-cols-4 gap-[var(--mimi-password-meter-gap,4px)]"
          >
            @for (bar of bars(); track $index) {
              <span
                class="h-[var(--mimi-password-meter-height,6px)] rounded-full transition-colors duration-300 motion-reduce:transition-none"
                [class]="bar"
              ></span>
            }
          </div>
          <span
            data-slot="level"
            class="min-w-12 text-end text-[13px] font-semibold"
            [class]="levelClass()"
            >{{ levelText() }}</span
          >
        </div>
        @if (activeRules().length) {
          <ul class="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-1 p-0">
            @for (rule of ruleState(); track rule.label) {
              <li
                class="flex items-center gap-1.5 text-[12.5px]"
                [class]="rule.ok ? 'text-success-soft-foreground' : 'text-muted-foreground'"
                [attr.data-state]="rule.ok ? 'met' : 'unmet'"
              >
                @if (rule.ok) {
                  <svg
                    class="size-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <!-- Lucide circle-check (ISC) -->
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                } @else {
                  <svg
                    class="size-3.5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <!-- Lucide circle (ISC) -->
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                }
                {{ rule.label }}
              </li>
            }
          </ul>
        }
      </div>
    }
  `,
  host: {
    class: 'flex w-full min-w-0 flex-col gap-2',
    '[attr.data-state]': 'shown() ? "shown" : "hidden"',
    '[attr.data-level]': 'meter() ? level() : null',
    '(input)': 'read()',
    '(change)': 'read()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MimiPassword {
  private readonly announcer = inject(LiveAnnouncer);
  protected readonly text = inject(MIMI_PASSWORD_TEXT);

  /** Muestra el medidor (nivel y reglas) debajo del campo. */
  readonly meter = input(false, { transform: booleanAttribute });
  /**
   * Reglas del medidor. Por defecto, las cuatro del diseño. Con `[]` no hay lista y la heurística
   * no tiene qué contar (todo es «débil»): el nivel lo da `strength`.
   */
  readonly rules = input<readonly MimiPasswordRule[] | undefined>(undefined);
  /** Nivel propio (0 a 3). Por defecto, la heurística de las reglas (orientativa). */
  readonly strength = input<((value: string) => MimiPasswordLevel) | undefined>(undefined);
  /**
   * Solo lectura (R.12): el `<input>` de dentro queda `readonly` (se ve y se enfoca, no se edita).
   * El ojo sigue funcionando: mostrar el valor no lo cambia. Un `readonly` escrito en el propio
   * `<input>` o puesto por Signal Forms también vale.
   */
  readonly readonly = input(false, { transform: booleanAttribute });
  /** Clases de la caja, mezcladas con `cn()` (gana la del usuario). */
  readonly userClass = input('', { alias: 'class' });

  /** El componente puso `readOnly` (y lo puede quitar); si lo puso el usuario, no se toca. */
  private setByUs = false;
  private readonly syncReadonly = effect(() => {
    const element = this.inputElement();
    if (!element) return;
    if (this.readonly()) {
      if (!element.readOnly) {
        element.readOnly = true;
        this.setByUs = true;
      }
    } else if (this.setByUs) {
      element.readOnly = false;
      this.setByUs = false;
    }
  });

  private readonly field = contentChild(MimiInput);
  /** El input del usuario: el de mimiInput o, si no lo usa, el primero que haya. */
  private readonly inputElement = computed(
    () => (this.field()?.controlElement as HTMLInputElement | undefined) ?? null,
  );

  protected readonly shown = signal(false);
  protected readonly value = signal('');
  /** `disabled` escrito en el input (sin formulario). */
  private readonly nativeDisabled = signal(false);
  /** `readonly` escrito en el input (como `disabled`): la caja se ve de solo lectura igual. */
  protected readonly nativeReadonly = signal(false);
  protected readonly isDisabled = computed(
    () => this.nativeDisabled() || (this.field()?.fieldState.disabled() ?? false),
  );
  protected readonly invalid = computed(() => this.field()?.showInvalid() ?? false);

  readonly meterId = `mimi-password-meter-${nextId++}`;

  /** Reglas activas (las del usuario o las cuatro del diseño, con los textos del idioma). */
  protected readonly activeRules = computed<readonly MimiPasswordRule[]>(
    () =>
      this.rules() ?? [
        { label: this.text.minLength, test: (v) => v.length >= 8 },
        { label: this.text.uppercase, test: (v) => /\p{Lu}/u.test(v) },
        { label: this.text.number, test: (v) => /\d/.test(v) },
        { label: this.text.symbol, test: (v) => /[^\p{L}\p{N}\s]/u.test(v) },
      ],
  );
  protected readonly ruleState = computed(() =>
    this.activeRules().map((rule) => ({ label: rule.label, ok: rule.test(this.value()) })),
  );
  readonly level = computed<MimiPasswordLevel>(() => {
    const value = this.value();
    if (!value) return 0;
    const own = this.strength();
    return own ? own(value) : mimiPasswordLevel(value, this.activeRules());
  });
  protected readonly levelText = computed(() => {
    const level = this.level();
    return level === 0 ? '' : [this.text.weak, this.text.medium, this.text.strong][level - 1];
  });
  protected readonly levelClass = computed(() => {
    const level = this.level();
    return level === 0 ? 'text-muted-foreground' : LEVEL_TEXT[level];
  });
  /** Barras llenas como el diseño (`bars()`): débil 1, media 2 o 3 (según las reglas), fuerte 4. */
  protected readonly bars = computed(() => {
    const level = this.level();
    if (level === 0) return [BAR_EMPTY, BAR_EMPTY, BAR_EMPTY, BAR_EMPTY];
    const passed = this.ruleState().filter((r) => r.ok).length;
    const filled = level === 3 ? 4 : level === 2 ? Math.max(2, Math.min(passed, 3)) : 1;
    return [0, 1, 2, 3].map((i) => (i < filled ? BAR_FILL[level] : BAR_EMPTY));
  });

  protected readonly boxClasses = computed(() => cn(BOX_CLASSES, this.userClass()));
  protected readonly toggleClasses = TOGGLE_CLASSES;

  /** El último nivel anunciado: solo se anuncia un cambio que viene de escribir. */
  private announced: MimiPasswordLevel = 0;
  private typed = false;

  constructor() {
    afterNextRender(() => {
      const el = this.inputElement();
      if (!el) return;
      this.value.set(el.value);
      this.announced = this.level();
      this.nativeDisabled.set(el.disabled);
      this.nativeReadonly.set(el.readOnly);
    });
    // El medidor describe el input (sin borrar el aria-describedby del usuario ni el de
    // mimi-form-field).
    afterRenderEffect({
      write: () => {
        const el = this.inputElement();
        if (!el) return;
        const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
        const has = ids.includes(this.meterId);
        if (this.meter() && !has) ids.push(this.meterId);
        if (!this.meter() && has) ids.splice(ids.indexOf(this.meterId), 1);
        if (ids.length) el.setAttribute('aria-describedby', ids.join(' '));
        else el.removeAttribute('aria-describedby');
      },
    });
    inject(DestroyRef).onDestroy(() => {
      const el = this.inputElement();
      if (el) el.type = 'password';
    });
  }

  /** Muestra u oculta: cambia el `type` del mismo input. El foco se queda en el botón. */
  protected toggle(): void {
    const el = this.inputElement();
    if (!el || this.isDisabled()) return;
    const shown = !this.shown();
    el.type = shown ? 'text' : 'password';
    this.shown.set(shown);
  }

  /** Lee el valor al escribir y anuncia el nivel solo si cambió. */
  protected read(): void {
    const el = this.inputElement();
    if (!el) return;
    this.typed = true;
    this.value.set(el.value);
    this.nativeDisabled.set(el.disabled);
    this.nativeReadonly.set(el.readOnly);
    const level = this.level();
    if (this.meter() && this.typed && level !== this.announced) {
      this.announced = level;
      if (level > 0) void this.announcer.announce(this.text.announce(this.levelText()), 'polite');
    }
  }
}
