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
import { MimiAvatar, MimiAvatarFallback } from '@/components/ui/avatar';
import { MimiButton } from '@/components/ui/button';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { cn } from '@/components/ui/utils/cn';

/** Lo que sale al enviar un formulario válido. */
export interface Login02Value {
  email: string;
  password: string;
}

let nextId = 0;

/**
 * login-02 (Block de Mimi): inicio de sesión dividido en dos, con el formulario a un lado y una
 * imagen con un testimonio en vidrio al otro. Diseño: docs/design/Block login-02.dc.html.
 *
 * Es una página: `ng g mimi login-02` la genera en tu carpeta de páginas (`aliases.pages` de
 * mimi.json; por defecto, `src/app/pages/login/`, u otro nombre con `--name` si ya tienes la de
 * login-01) junto con su archivo de rutas (`login.routes.ts`, con la página en carga diferida),
 * y te da la línea para `app.routes.ts`:
 *
 * ```ts
 * { path: 'login', loadChildren: () => import('./pages/login/login.routes').then((m) => m.LOGIN_ROUTES) },
 * ```
 *
 * Da tu imagen con `imageSrc` (y `imageAlt` si no es decorativa). El testimonio está escrito en
 * la plantilla: cámbialo ahí. Si la usas dentro de otra página, sus entradas y salidas siguen
 * ahí:
 *
 * ```html
 * <mimi-login-02 imageSrc="/img/login.jpg" [loading]="auth.loading()" (submitted)="auth.signIn($event)" />
 * ```
 */
@Component({
  selector: 'mimi-login-02',
  imports: [FormField, MimiAvatar, MimiAvatarFallback, MimiButton, MimiFormField, MimiInput],
  templateUrl: './login-02.html',
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'loading() ? "loading" : null',
    // Cargando: nada se puede editar, pulsar ni enfocar (campos, SSO, enlaces).
    '[attr.inert]': 'loading() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login02 {
  /** Mientras tu app comprueba las credenciales: el botón dice «Signing in…» y no reenvía. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Error de tu servidor, encima del botón. `null`: ninguno. */
  readonly error = input<string | null>(null);
  /** Tu imagen. Sin ella, un degradado neutro (provisional, B.3-a). */
  readonly imageSrc = input<string | null>(null);
  /** Texto alternativo. Vacío por defecto: la imagen es decorativa. */
  readonly imageAlt = input('');
  readonly forgotHref = input('#');
  readonly signupHref = input('#');
  readonly userClass = input('', { alias: 'class' });

  /** Formulario válido enviado. */
  readonly submitted = output<Login02Value>();
  /** Se pulsó «Sign in with SSO». */
  readonly sso = output<void>();

  protected readonly id = `mimi-login-02-${nextId++}`;

  protected readonly model = signal<Login02Value>({ email: '', password: '' });
  protected readonly login = form(this.model, (path) => {
    required(path.email);
    email(path.email);
    required(path.password);
  });

  protected readonly classes = computed(() =>
    cn(
      'flex min-h-svh w-full flex-col bg-background text-foreground md:flex-row',
      this.userClass(),
    ),
  );

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (this.loading()) return;
    const state = this.login();
    state.markAsTouched();
    if (state.invalid()) {
      state.errorSummary()[0]?.fieldTree().focusBoundControl();
      return;
    }
    this.submitted.emit({ ...this.model() });
  }
}
