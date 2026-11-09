import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  LOCALE_ID,
  afterEveryRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  FormField,
  type ValidationError,
  form,
  maxLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { MimiAvatar, MimiAvatarFallback, MimiAvatarImage } from '@/components/ui/avatar';
import { MimiBadge } from '@/components/ui/badge';
import { MimiButton } from '@/components/ui/button';
import { MimiCard } from '@/components/ui/card';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { MimiProgress } from '@/components/ui/progress';
import { MimiSeparator } from '@/components/ui/separator';
import { MimiSwitch } from '@/components/ui/switch';
import { MimiTabsImports } from '@/components/ui/tabs';
import { MimiTextarea } from '@/components/ui/textarea';
import { cn } from '@/components/ui/utils/cn';

export type Settings01Tab = 'profile' | 'notifications' | 'security' | 'billing';

export interface Settings01Profile {
  name: string;
  /** Sin el prefijo de la dirección («example.com/», en la plantilla: pon el tuyo). */
  username: string;
  bio: string;
  /** Las iniciales del avatar si no hay foto. */
  initials: string;
  /** La foto; sin ella, las iniciales. */
  avatarSrc?: string | null;
}

/** Los interruptores de Perfil, Notificaciones y Seguridad. */
export interface Settings01Preferences {
  compact: boolean;
  sounds: boolean;
  weeklySummary: boolean;
  mentions: boolean;
  failedPayments: boolean;
  newClients: boolean;
  comments: boolean;
  twoFactor: boolean;
}

export interface Settings01Session {
  id: string;
  device: string;
  /** Lugar y hora, ya escritos («Your city · now»). */
  detail: string;
  kind: 'desktop' | 'mobile';
  /** La sesión de este navegador (no se puede cerrar desde aquí). */
  current?: boolean;
}

export interface Settings01Plan {
  name: string;
  /** Precio por persona y mes, en la moneda de `currency`. */
  pricePerSeat: number;
  currency: string;
  seatsUsed: number;
  seats: number;
  /** La tarjeta, ya enmascarada («Visa •••• 4242»). */
  card: string;
  nextInvoice: Date;
}

/** Lo que sale al guardar: el perfil (sin iniciales ni foto) y las preferencias. */
export type Settings01Value = Pick<Settings01Profile, 'name' | 'username' | 'bio'> &
  Settings01Preferences;

/**
 * Valores de ejemplo, para que la pantalla funcione sin datos. Genéricos a propósito (M5): ninguna
 * persona ni marca de terceros; tu app pasa los suyos.
 */
export const SETTINGS_01_PROFILE: Settings01Profile = {
  name: 'Your name',
  username: 'your-username',
  bio: 'A short bio your team will see.',
  initials: 'YN',
};
export const SETTINGS_01_PREFERENCES: Settings01Preferences = {
  compact: true,
  sounds: false,
  weeklySummary: true,
  mentions: true,
  failedPayments: true,
  newClients: false,
  comments: true,
  twoFactor: false,
};
export const SETTINGS_01_SESSIONS: Settings01Session[] = [
  {
    id: 'this',
    device: 'Chrome · macOS',
    detail: 'Your city · now',
    kind: 'desktop',
    current: true,
  },
  { id: 'iphone', device: 'Safari · iPhone', detail: 'Another city · 2 days ago', kind: 'mobile' },
];
export const SETTINGS_01_PLAN: Settings01Plan = {
  name: 'Team',
  pricePerSeat: 12,
  currency: 'USD',
  seatsUsed: 18,
  seats: 25,
  card: 'Visa •••• 4242',
  nextInvoice: new Date(2026, 10, 1),
};

/** Los interruptores de cada sección, con su título y descripción. */
interface SwitchRow {
  key: keyof Settings01Preferences;
  label: string;
  description: string;
}

/** Ancho desde el que la navegación es lateral (`md` de Tailwind). */
const SIDE_NAV_QUERY = '(min-width: 768px)';

let nextId = 0;

/**
 * settings-01 (Block de Mimi): ajustes de cuenta con navegación por secciones (pestañas
 * verticales en escritorio, horizontales en móvil), formularios, interruptores, sesiones, zona
 * de peligro, facturación y una barra de «cambios sin guardar».
 * Diseño: docs/design/Block settings-01.dc.html.
 *
 * Es una página: `ng g mimi settings-01` la genera en tu carpeta de páginas (`aliases.pages` de
 * mimi.json; por defecto, `src/app/pages/settings/`, u otro nombre con `--name`) junto con su
 * archivo de rutas (`settings.routes.ts`, con la página en carga diferida), y te da la línea
 * para `app.routes.ts`:
 *
 * ```ts
 * { path: 'settings', loadChildren: () => import('./pages/settings/settings.routes').then((m) => m.SETTINGS_ROUTES) },
 * ```
 *
 * Dale tus datos (`profile`, `preferences`, `sessions`, `plan`) aquí mismo o, si la usas dentro
 * de otra página, por sus entradas. Sin datos, muestra los del ejemplo. «Guardar» emite `saved`
 * con el formulario; las acciones (foto, sesiones, borrar la cuenta, cambiar de plan) son
 * salidas: tu app decide.
 *
 * ```html
 * <mimi-settings-01 [profile]="me()" [saving]="saving()" (saved)="save($event)" (deleteAccount)="confirmDelete()" />
 * ```
 */
@Component({
  selector: 'mimi-settings-01',
  imports: [
    FormField,
    MimiAvatar,
    MimiAvatarFallback,
    MimiAvatarImage,
    MimiBadge,
    MimiButton,
    MimiCard,
    MimiFormField,
    MimiInput,
    MimiProgress,
    MimiSeparator,
    MimiSwitch,
    MimiTabsImports,
    MimiTextarea,
  ],
  templateUrl: './settings-01.html',
  host: {
    '[class]': 'classes()',
    '[attr.data-state]': 'changed() ? "changed" : null',
    // Guardando: nada se puede editar, pulsar ni enfocar.
    '[attr.inert]': 'saving() ? "" : null',
    '[attr.aria-busy]': 'saving() ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings01 {
  readonly profile = input<Settings01Profile>(SETTINGS_01_PROFILE);
  readonly preferences = input<Settings01Preferences>(SETTINGS_01_PREFERENCES);
  readonly sessions = input<readonly Settings01Session[]>(SETTINGS_01_SESSIONS);
  readonly plan = input<Settings01Plan>(SETTINGS_01_PLAN);
  /** Mientras tu app guarda: «Saving…» en el botón. */
  readonly saving = input(false, { transform: booleanAttribute });
  /** La sección elegida. Admite `[(tab)]`. */
  readonly tab = model<Settings01Tab>('profile');
  readonly userClass = input('', { alias: 'class' });

  /** «Save»: el formulario completo y válido. */
  readonly saved = output<Settings01Value>();
  readonly avatarChange = output<void>();
  readonly avatarRemove = output<void>();
  /** «Sign out» en una sesión: su `id`. */
  readonly sessionEnd = output<string>();
  /** «Delete account». Confírmalo en tu app (por ejemplo, con `mimi-confirm`). */
  readonly deleteAccount = output<void>();
  readonly changePlan = output<void>();

  protected readonly id = `mimi-settings-01-${nextId++}`;
  private readonly locale = inject(LOCALE_ID);

  /** El valor de partida: el de las entradas o el último guardado. */
  private readonly initial = signal<Settings01Value>(this.valueOf());
  protected readonly model = signal<Settings01Value>(this.valueOf());
  protected readonly settings = form(this.model, (path) => {
    required(path.name, { message: 'Enter your name.' });
    required(path.username, { message: 'Choose a username.' });
    pattern(path.username, /^[a-z0-9._-]+$/, {
      message: 'Use lowercase letters, numbers, dots, dashes or underscores.',
    });
    maxLength(path.bio, 160);
  });

  /**
   * «Con cambios»: el valor distinto del de partida (no `dirty`: volver al valor original quita
   * la barra).
   */
  protected readonly changed = computed(() => {
    const now = this.model();
    const start = this.initial();
    return (Object.keys(start) as (keyof Settings01Value)[]).some((k) => now[k] !== start[k]);
  });

  /** Vertical en escritorio, horizontal en móvil (cambia en vivo, B.10). */
  protected readonly wide = signal(true);

  protected readonly tabs: { value: Settings01Tab; label: string }[] = [
    { value: 'profile', label: 'Profile' },
    { value: 'notifications', label: 'Notifications' },
    { value: 'security', label: 'Security' },
    { value: 'billing', label: 'Billing' },
  ];
  protected readonly profileSwitches: SwitchRow[] = [
    { key: 'compact', label: 'Compact mode', description: 'Denser tables and lists.' },
    { key: 'sounds', label: 'Sounds', description: 'Play a sound with each notification.' },
  ];
  protected readonly notificationGroups: {
    title: string;
    icon: 'mail' | 'push';
    rows: SwitchRow[];
  }[] = [
    {
      title: 'Email',
      icon: 'mail',
      rows: [
        { key: 'weeklySummary', label: 'Weekly summary', description: 'Every Monday at 9:00.' },
        { key: 'mentions', label: 'Mentions', description: 'When someone mentions you.' },
        { key: 'failedPayments', label: 'Failed payments', description: 'We tell you right away.' },
      ],
    },
    {
      title: 'Push',
      icon: 'push',
      rows: [
        { key: 'newClients', label: 'New clients', description: 'When an account signs up.' },
        { key: 'comments', label: 'Comments', description: 'On projects you follow.' },
      ],
    },
  ];

  protected readonly price = computed(() => {
    const plan = this.plan();
    const amount = new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: plan.currency,
      maximumFractionDigits: 0,
    }).format(plan.pricePerSeat);
    return `${plan.name} · ${amount} per seat`;
  });
  protected readonly nextInvoice = computed(() =>
    new Intl.DateTimeFormat(this.locale, { month: 'long', day: 'numeric' }).format(
      this.plan().nextInvoice,
    ),
  );

  protected readonly classes = computed(() =>
    cn('flex min-h-svh w-full flex-col bg-background text-foreground', this.userClass()),
  );

  constructor() {
    // Datos nuevos desde fuera: pasan a ser el valor de partida (sin cambios).
    effect(() => {
      const value = this.valueOf();
      untracked(() => {
        this.initial.set(value);
        this.model.set(value);
      });
    });
    // La descripción de cada interruptor, en su botón (Switch no tiene entrada para
    // aria-describedby; el diseño solo ponía aria-label). Después de cada render: el panel de una
    // sección se crea al mostrarse (contenido diferido de Tabs), sin una señal que avise.
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterEveryRender({
      write: () => {
        this.focusPending();
        for (const sw of Array.from(host.querySelectorAll('mimi-switch[data-describedby]'))) {
          const button = sw.querySelector('[role="switch"]');
          const id = sw.getAttribute('data-describedby');
          if (button && id && button.getAttribute('aria-describedby') !== id) {
            button.setAttribute('aria-describedby', id);
          }
        }
      },
    });
    const window = inject(DOCUMENT).defaultView;
    const media = window?.matchMedia?.(SIDE_NAV_QUERY) ?? null;
    if (media) {
      this.wide.set(media.matches);
      const onChange = (event: MediaQueryListEvent) => this.wide.set(event.matches);
      media.addEventListener('change', onChange);
      inject(DestroyRef).onDestroy(() => media.removeEventListener('change', onChange));
    }
  }

  protected readonly bioId = `${this.id}-bio-count`;

  /*
   * La navegación con `class` sobre Tabs (D6): ni `underline` ni `pill` son el diseño. Clases
   * completas y literales (Tailwind las detecta), sin variantes encadenadas.
   */
  /** Escritorio: filas con fondo `accent` en la elegida, sin indicador ni borde. */
  protected readonly sideNavClasses =
    'w-[200px] shrink-0 border-s-0 [&_[data-slot=indicator]]:hidden [&_[role=tablist]]:gap-0.5 [&_[role=tab]]:h-[38px] [&_[role=tab]]:gap-2.5 [&_[role=tab]]:rounded-[var(--mimi-radius-sm)] [&_[role=tab]]:font-normal [&_[role=tab]:hover]:bg-accent [&_[role=tab][aria-selected=true]]:bg-accent [&_[role=tab][aria-selected=true]]:font-semibold [&_svg]:size-[17px] [&_svg]:shrink-0';
  /** Móvil: píldoras que se desplazan en horizontal; la elegida en `primary`. */
  protected readonly pillNavClasses =
    'px-4 py-3 [&_[data-slot=indicator]]:hidden [&_[role=tablist]]:flex [&_[role=tablist]]:gap-1.5 [&_[role=tablist]]:overflow-x-auto [&_[role=tablist]]:[scrollbar-width:none] [&_[role=tab]]:h-[34px] [&_[role=tab]]:shrink-0 [&_[role=tab]]:gap-1.5 [&_[role=tab]]:rounded-full [&_[role=tab]]:border [&_[role=tab]]:border-border [&_[role=tab]]:bg-card [&_[role=tab]]:px-3 [&_[role=tab]]:text-[13.5px] [&_[role=tab]]:text-foreground [&_[role=tab][aria-selected=true]]:border-primary [&_[role=tab][aria-selected=true]]:bg-primary [&_[role=tab][aria-selected=true]]:text-primary-foreground [&_svg]:size-[15px] [&_svg]:shrink-0';
  protected readonly panelClasses =
    'flex min-w-0 max-w-[680px] flex-1 flex-col gap-5 px-4 pt-4 pb-6 md:p-0';

  /** Lo que elige Tabs (un `string`): solo se toma si es una de las cuatro secciones. */
  protected selectTab(value: string | undefined): void {
    const tab = this.tabs.find((item) => item.value === value);
    if (tab) this.tab.set(tab.value);
  }

  /** El campo de un interruptor. */
  protected field(key: keyof Settings01Preferences) {
    return this.settings[key];
  }

  protected discard(): void {
    this.settings().reset(this.initial());
  }

  protected save(): void {
    if (this.saving()) return;
    const state = this.settings();
    state.markAsTouched();
    if (state.invalid()) {
      // Los campos con validación están en Perfil. Si se guarda desde otra sección, su panel no
      // existe todavía (contenido diferido de Tabs): el foco queda pendiente hasta que el campo
      // esté enlazado en el DOM (M3), y lo pone el render que lo crea.
      this.tab.set('profile');
      this.pendingFocus = state.errorSummary()[0]?.fieldTree ?? null;
      this.focusPending();
      return;
    }
    const value = { ...this.model() };
    this.initial.set(value);
    this.saved.emit(value);
  }

  /** El campo con error que espera su panel para recibir el foco (M3). */
  private pendingFocus: ValidationError.WithFieldTree['fieldTree'] | null = null;

  /** Enfoca el campo pendiente si ya está en el DOM (enlazado a su `[formField]`). */
  private focusPending(): void {
    const field = this.pendingFocus?.();
    if (!field || field.formFieldBindings().length === 0) return;
    this.pendingFocus = null;
    field.focusBoundControl();
  }

  private valueOf(): Settings01Value {
    const { name, username, bio } = this.profile();
    return { name, username, bio, ...this.preferences() };
  }
}
