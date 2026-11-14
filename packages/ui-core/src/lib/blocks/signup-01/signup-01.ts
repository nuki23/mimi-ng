import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormField, email, form, minLength, required, validate } from '@angular/forms/signals';
import { MimiButton } from '@/components/ui/button';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import {
  MIMI_PASSWORD_TEXT,
  MimiPassword,
  type MimiPasswordRule,
  mimiPasswordLevel,
} from '@/components/ui/password';
import { cn } from '@/components/ui/utils/cn';
import { restoreFocusAfterBusy } from '@/components/ui/utils/busy';

/** Lo que sale al enviar un formulario completo. */
export interface Signup01Value {
  name: string;
  email: string;
  password: string;
}

interface Signup01Model extends Signup01Value {
  confirm: string;
  terms: boolean;
}

let nextId = 0;

/**
 * signup-01 (Block de Mimi): registro con validación al salir de cada campo, medidor de
 * contraseña con reglas, confirmación y un botón que dice qué falta.
 * Diseño: docs/design/Block signup-01.dc.html.
 *
 * Es una página: `ng g mimi signup-01` la genera en tu carpeta de páginas (`aliases.pages` de
 * mimi.json; por defecto, `src/app/pages/signup/`, u otro nombre con `--name`) junto con su
 * archivo de rutas (`signup.routes.ts`, con la página en carga diferida), y te da la línea para
 * `app.routes.ts`:
 *
 * ```ts
 * { path: 'signup', loadChildren: () => import('./pages/signup/signup.routes').then((m) => m.SIGNUP_ROUTES) },
 * ```
 *
 * El texto de los beneficios y los mensajes están en la plantilla y en este archivo: cámbialos
 * aquí, y conecta tu registro en `onSubmit`. Si la usas dentro de otra página, sus entradas y
 * salidas siguen ahí:
 *
 * ```html
 * <mimi-signup-01 [loading]="auth.loading()" [error]="auth.error()" (submitted)="auth.signUp($event)" />
 * ```
 */
@Component({
  selector: 'mimi-signup-01',
  imports: [FormField, MimiButton, MimiCheckbox, MimiFormField, MimiInput, MimiPassword],
  templateUrl: './signup-01.html',
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'loading() ? "loading" : complete() ? "complete" : "incomplete"',
    // Cargando: nada se puede editar, pulsar ni enfocar.
    '[attr.inert]': 'loading() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Signup01 {
  /** Mientras tu app crea la cuenta: el botón dice «Creating account…» y no reenvía. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Al terminar de cargar, el foco vuelve a quien lanzó la acción y se anuncia (los Blocks inertes no los ven los lectores). */
  private readonly focusBack = restoreFocusAfterBusy(this.loading);
  /** Error de tu servidor (correo ya registrado…), encima del botón. `null`: ninguno. */
  readonly error = input<string | null>(null);
  readonly termsHref = input('#');
  readonly privacyHref = input('#');
  readonly signinHref = input('#');
  readonly userClass = input('', { alias: 'class' });

  /** Formulario completo enviado. */
  readonly submitted = output<Signup01Value>();

  protected readonly id = `mimi-signup-01-${nextId++}`;

  /**
   * Las reglas del medidor: las cuatro de Password, con sus textos. El Block las pasa a
   * `mimi-password` y las usa para el validador de «fuerte» (una sola lista).
   */
  private readonly text = inject(MIMI_PASSWORD_TEXT);
  protected readonly rules: readonly MimiPasswordRule[] = [
    { label: this.text.minLength, test: (v) => v.length >= 8 },
    { label: this.text.uppercase, test: (v) => /\p{Lu}/u.test(v) },
    { label: this.text.number, test: (v) => /\d/.test(v) },
    { label: this.text.symbol, test: (v) => /[^\p{L}\p{N}\s]/u.test(v) },
  ];

  protected readonly model = signal<Signup01Model>({
    name: '',
    email: '',
    password: '',
    confirm: '',
    terms: false,
  });
  protected readonly signup = form(this.model, (path) => {
    required(path.name, { message: 'Enter your name.' });
    minLength(path.name, 2, { message: 'Enter your name.' });
    required(path.email, { message: 'Enter your work email.' });
    email(path.email, { message: 'Add the domain, for example name@example.com.' });
    // El validador de Angular acepta «ana@empresa» (sin punto en el dominio); un correo de
    // trabajo lo lleva.
    validate(path.email, ({ value }) =>
      /^[^\s@]+@[^\s@]+$/.test(value()) && !/@[^\s@]+\.[^\s@.]{2,}$/.test(value())
        ? { kind: 'email', message: 'Add the domain, for example name@example.com.' }
        : undefined,
    );
    required(path.password, { message: 'Choose a password.' });
    validate(path.password, ({ value }) =>
      value() && mimiPasswordLevel(value(), this.rules) < 3
        ? { kind: 'strength', message: 'Meet the four rules for a strong password.' }
        : undefined,
    );
    required(path.confirm, { message: 'Repeat your password.' });
    validate(path.confirm, ({ value, valueOf }) =>
      value() && value() !== valueOf(path.password)
        ? { kind: 'match', message: "Passwords don't match." }
        : undefined,
    );
    validate(path.terms, ({ value }) =>
      value() ? undefined : { kind: 'required', message: 'Accept the terms to continue.' },
    );
  });

  /** Lo que falta, en el orden del formulario (la nota del botón). */
  protected readonly missing = computed(() => {
    const f = this.signup;
    return [
      f.name().invalid() && 'your name',
      f.email().invalid() && 'a valid email',
      f.password().invalid() && 'a strong password',
      f.confirm().invalid() && 'matching passwords',
      f.terms().invalid() && 'accepting the terms',
    ].filter((item): item is string => !!item);
  });
  protected readonly complete = computed(() => this.missing().length === 0);
  protected readonly hint = computed(() =>
    this.complete() ? 'All set.' : `Missing: ${this.missing().join(', ')}.`,
  );

  /**
   * Error visible al salir del campo (B.4-a): Mimi lo muestra también al escribir (`dirty`), y
   * el diseño espera al `touched`. Una vez tocado, cambia mientras se escribe (la confirmación
   * deja de decir «no coinciden» en cuanto coinciden).
   */
  protected blurred(field: 'name' | 'email' | 'password' | 'confirm'): boolean {
    const state = this.signup[field]();
    return state.touched() && state.invalid();
  }

  /** «Válido» al salir de un campo bien escrito (el diseño; FormField solo tiene errores). */
  protected valid(field: 'name' | 'email' | 'confirm'): boolean {
    const state = this.signup[field]();
    return state.touched() && state.valid();
  }

  protected readonly okClasses =
    'flex items-center gap-1.5 text-[12.5px] text-success-soft-foreground empty:hidden';

  protected readonly classes = computed(() =>
    cn('flex min-h-svh w-full bg-background text-foreground', this.userClass()),
  );

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.loading()) return;
    const state = this.signup();
    state.markAsTouched();
    if (state.invalid()) {
      // El botón no usa disabled (no se enfocaría ni se leería la nota): marca todo y lleva el
      // foco al primer campo con error.
      state.errorSummary()[0]?.fieldTree().focusBoundControl();
      return;
    }
    const { name, email, password } = this.model();
    this.submitted.emit({ name, email, password });
  }
}
