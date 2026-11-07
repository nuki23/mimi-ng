import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCard } from '@/components/ui/card';
import { MimiInputOtp } from '@/components/ui/input-otp';
import { cn } from '@/components/ui/utils/cn';

/** Lo que tu app sabe del último código enviado. */
export type Otp01Status = 'idle' | 'error' | 'success';

let nextId = 0;

/**
 * otp-01 (Block de Mimi): verificación con un código de 6 dígitos, con reenvío y cuenta
 * regresiva. Diseño: docs/design/Block otp-01.dc.html.
 *
 * Es una página, que va después del registro o del inicio de sesión: `ng g mimi otp-01` la
 * genera en tu carpeta de páginas (`aliases.pages` de mimi.json; por defecto, `src/app/pages/otp/`,
 * u otro nombre con `--name`) junto con su archivo de rutas (`otp.routes.ts`, con la página en
 * carga diferida), y te da la línea para `app.routes.ts`:
 *
 * ```ts
 * { path: 'otp', loadChildren: () => import('./pages/otp/otp.routes').then((m) => m.OTP_ROUTES) },
 * ```
 *
 * `verify` sale con el código (al completar los dígitos o con el botón, una sola vez por
 * código); tu app lo comprueba y responde con `status`: conéctalo aquí mismo o, si la usas dentro
 * de otra página, por sus entradas y salidas:
 *
 * ```html
 * <mimi-otp-01 destination="a••••@example.com" [status]="otp.status()" [loading]="otp.checking()"
 *   (verify)="otp.check($event)" (resend)="otp.send()" (changeDestination)="router.navigate(['/signup'])" />
 * ```
 */
@Component({
  selector: 'mimi-otp-01',
  imports: [MimiButton, MimiCard, MimiInputOtp],
  templateUrl: './otp-01.html',
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'shownStatus()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Otp01 {
  /** El correo o teléfono, ya enmascarado, que se muestra. */
  readonly destination = input('a••••@example.com');
  readonly length = input(6, { transform: numberAttribute });
  /** Segundos hasta poder pedir otro código. */
  readonly resendSeconds = input(60, { transform: numberAttribute });
  /** Mientras tu app comprueba el código: «Verifying…» y no reenvía. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** El resultado del último código enviado por `verify`. */
  readonly status = input<Otp01Status>('idle');
  /** Lleva el foco al código al aparecer (no lo hace si el foco ya está en otro lugar). */
  readonly autofocus = input(true, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  /** El código completo, una sola vez por código. */
  readonly verify = output<string>();
  /** «Resend code». */
  readonly resend = output<void>();
  /** «Use another email». */
  readonly changeDestination = output<void>();

  protected readonly id = `mimi-otp-01-${nextId++}`;
  private readonly document = inject(DOCUMENT);
  private readonly otp = viewChild.required(MimiInputOtp);

  protected readonly code = signal('');
  /** El último código que salió por `verify` (para no repetirlo). */
  private readonly sent = signal<string | null>(null);
  /** Se pulsó «Verify» con el código incompleto. */
  protected readonly incomplete = signal(false);

  /** `status` vale para el código que se envió: al cambiarlo, vuelve a «idle». */
  /**
   * Enviado y sin respuesta todavía (M4): el `status` que hay es el del envío anterior. Se apaga
   * cuando tu app cambia `status` o `loading` (si respondes con el mismo `status`, pon `loading`
   * mientras compruebas).
   */
  private readonly awaiting = signal(false);
  protected readonly shownStatus = computed<Otp01Status>(() =>
    this.awaiting() || this.loading() || this.code() !== this.sent() ? 'idle' : this.status(),
  );
  protected readonly message = computed(() => {
    if (this.incomplete()) return `Enter the ${this.length()}-digit code.`;
    switch (this.shownStatus()) {
      case 'error':
        return 'Incorrect code. Check it and try again.';
      case 'success':
        return 'Code verified. Signing you in…';
      default:
        return 'The code expires in 10 minutes.';
    }
  });
  protected readonly messageClasses = computed(() =>
    cn(
      'flex min-h-5 items-center gap-1.5 text-[13px]',
      this.incomplete() || this.shownStatus() === 'error'
        ? 'text-destructive-soft-foreground'
        : this.shownStatus() === 'success'
          ? 'text-success-soft-foreground'
          : 'text-muted-foreground',
    ),
  );

  /** Cuenta regresiva del reenvío. */
  protected readonly left = signal(0);
  protected readonly countdown = computed(() => {
    const s = this.left();
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  });
  /** El único anuncio de la cuenta: cuando se habilita (no cada segundo). */
  protected readonly resendAnnouncement = signal('');
  private timer: ReturnType<typeof setInterval> | null = null;

  protected readonly classes = computed(() =>
    cn(
      'flex min-h-svh w-full items-center justify-center bg-background px-5 py-8 text-foreground sm:bg-muted sm:p-10',
      this.userClass(),
    ),
  );

  constructor() {
    // Al completar los dígitos, verifica (una vez por código).
    effect(() => {
      const code = this.code();
      if (code.length === this.length()) untracked(() => this.send(code));
    });
    // La respuesta de tu app (un status o un loading nuevos) termina la espera del envío.
    effect(() => {
      this.status();
      this.loading();
      untracked(() => this.awaiting.set(false));
    });
    inject(DestroyRef).onDestroy(() => this.stopTimer());
    afterNextRender(() => {
      this.startCountdown();
      const active = this.document.activeElement;
      if (this.autofocus() && (!active || active === this.document.body)) {
        this.otp().controlElement.focus();
      }
    });
  }

  protected onCodeChange(code: string): void {
    // Al editar, el código enviado deja de valer: el mensaje vuelve a «idle» y, completo de nuevo
    // (aunque sea el mismo), se vuelve a enviar (M4).
    if (code !== this.code()) this.sent.set(null);
    this.code.set(code);
    this.incomplete.set(false);
  }

  protected onVerify(): void {
    if (this.loading()) return;
    const code = this.code();
    if (code.length < this.length()) {
      this.incomplete.set(true);
      this.otp().controlElement.focus();
      return;
    }
    this.send(code);
  }

  protected onResend(): void {
    if (this.left() > 0) return;
    this.resend.emit();
    this.code.set('');
    this.sent.set(null);
    this.incomplete.set(false);
    this.startCountdown();
    this.otp().controlElement.focus();
  }

  /**
   * Una vez por código (B.5-a): al completar y con el botón no se repite. Después de un error, el
   * mismo código se puede reintentar (M4).
   */
  private send(code: string): void {
    if (this.loading()) return;
    if (code === this.sent() && !(this.status() === 'error' && !this.awaiting())) return;
    this.sent.set(code);
    this.awaiting.set(true);
    this.verify.emit(code);
  }

  private startCountdown(): void {
    this.stopTimer();
    this.resendAnnouncement.set('');
    this.left.set(this.resendSeconds());
    if (this.left() <= 0) return;
    this.timer = setInterval(() => {
      this.left.update((s) => Math.max(0, s - 1));
      if (this.left() === 0) {
        this.stopTimer();
        this.resendAnnouncement.set('You can request another code now.');
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
  }
}
