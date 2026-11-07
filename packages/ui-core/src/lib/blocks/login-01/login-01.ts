import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { MimiButton } from '@/components/ui/button';
import { MimiCard } from '@/components/ui/card';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { MimiPassword } from '@/components/ui/password';
import { MimiSeparator } from '@/components/ui/separator';
import { cn } from '@/components/ui/utils/cn';

/** Lo que sale al enviar un formulario válido. */
export interface Login01Value {
  email: string;
  password: string;
  remember: boolean;
}

/** Proveedores de los botones de redes. */
export type Login01Provider = 'google' | 'github';

let nextId = 0;

/**
 * login-01 (Block de Mimi): inicio de sesión centrado con correo, contraseña, «recordarme» y
 * botones de Google y GitHub. Diseño: docs/design/Block login-01.dc.html.
 *
 * Es una página: `ng g mimi login-01` la genera en tu carpeta de páginas (`aliases.pages` de
 * mimi.json; por defecto, `src/app/pages/login/`, u otro nombre con `--name`) junto con su
 * archivo de rutas (`login.routes.ts`, con la página en carga diferida), y te da la línea para
 * `app.routes.ts`:
 *
 * ```ts
 * { path: 'login', loadChildren: () => import('./pages/login/login.routes').then((m) => m.LOGIN_ROUTES) },
 * ```
 *
 * El archivo es tuyo: conecta tu autenticación aquí mismo (en `onSubmit`, inyectando tu
 * servicio), cambia los textos, quita las redes o agrega campos. Si la usas dentro de otra
 * página, sus entradas y salidas siguen ahí:
 *
 * ```html
 * <mimi-login-01 [loading]="auth.loading()" [error]="auth.error()" (submitted)="auth.signIn($event)" />
 * ```
 */
@Component({
  selector: 'mimi-login-01',
  imports: [
    FormField,
    MimiButton,
    MimiCard,
    MimiCheckbox,
    MimiFormField,
    MimiInput,
    MimiPassword,
    MimiSeparator,
  ],
  templateUrl: './login-01.html',
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'loading() ? "loading" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login01 {
  /** Mientras tu app comprueba las credenciales: el botón dice «Signing in…» y no reenvía. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Error de tu servidor (credenciales incorrectas…), encima del botón. `null`: ninguno. */
  readonly error = input<string | null>(null);
  readonly forgotHref = input('#');
  readonly signupHref = input('#');
  readonly userClass = input('', { alias: 'class' });

  /** Formulario válido enviado. */
  readonly submitted = output<Login01Value>();
  /** Botón de una red pulsado. */
  readonly provider = output<Login01Provider>();

  protected readonly id = `mimi-login-01-${nextId++}`;

  protected readonly model = signal<Login01Value>({ email: '', password: '', remember: true });
  protected readonly login = form(this.model, (path) => {
    required(path.email);
    email(path.email);
    required(path.password);
  });

  protected readonly classes = computed(() =>
    cn(
      'relative isolate flex min-h-svh w-full items-center justify-center bg-background px-[22px] py-8 text-foreground sm:bg-muted sm:p-10',
      this.userClass(),
    ),
  );

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.loading()) return;
    const state = this.login();
    state.markAsTouched();
    if (state.invalid()) {
      // El foco va al primer campo con error (el orden del formulario).
      state.errorSummary()[0]?.fieldTree().focusBoundControl();
      return;
    }
    this.submitted.emit({ ...this.model() });
  }
}
