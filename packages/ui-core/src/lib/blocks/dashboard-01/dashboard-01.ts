import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { MimiAvatar, MimiAvatarFallback } from '@/components/ui/avatar';
import { MimiBadge, type BadgeTone } from '@/components/ui/badge';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';
import { MimiSheetImports } from '@/components/ui/sheet';
import { MimiTableImports } from '@/components/ui/table';
import { cn } from '@/components/ui/utils/cn';
import { restoreFocusAfterBusy } from '@/components/ui/utils/busy';

export interface Dashboard01NavItem {
  id: string;
  label: string;
  /** Un número al lado (por ejemplo, facturas pendientes). */
  count?: number;
  /** Tono del número: `warning` para lo que pide atención. */
  tone?: BadgeTone;
}

export interface Dashboard01NavGroup {
  label: string;
  items: Dashboard01NavItem[];
}

export interface Dashboard01Stat {
  label: string;
  /** El valor ya con formato (`$412,380`, `18.4%`). */
  value: string;
  /** La variación o la nota de debajo. */
  change: string;
  /** `success` (sube), `warning` (atención) o `danger` (baja). */
  tone: 'success' | 'warning' | 'danger';
}

export interface Dashboard01Month {
  month: string;
  /** En miles. */
  value: number;
}

export interface Dashboard01Customer {
  id: number;
  name: string;
  plan: string;
  status: 'active' | 'trial' | 'past-due';
  mrr: number;
}

export interface Dashboard01Activity {
  id: number;
  who: string;
  what: string;
  /** Cuándo, ya escrito («2 h ago»). */
  when: string;
}

export const DASHBOARD_01_NAV: Dashboard01NavGroup[] = [
  {
    label: 'General',
    items: [
      { id: 'home', label: 'Home' },
      { id: 'customers', label: 'Customers', count: 36 },
      { id: 'billing', label: 'Billing', count: 4, tone: 'warning' },
      { id: 'reports', label: 'Reports' },
    ],
  },
  {
    label: 'Team',
    items: [
      { id: 'members', label: 'Members' },
      { id: 'settings', label: 'Settings' },
    ],
  },
];

export const DASHBOARD_01_STATS: Dashboard01Stat[] = [
  { label: 'MRR', value: '$412,380', change: '+8.2% vs. August', tone: 'success' },
  { label: 'Active customers', value: '24', change: '+3 this month', tone: 'success' },
  { label: 'Conversion', value: '18.4%', change: '+1.1 pts', tone: 'success' },
  { label: 'Late payments', value: '4', change: '$38,900 pending', tone: 'warning' },
];

export const DASHBOARD_01_REVENUE: Dashboard01Month[] = [
  ['Jan', 180],
  ['Feb', 196],
  ['Mar', 214],
  ['Apr', 240],
  ['May', 262],
  ['Jun', 290],
  ['Jul', 331],
  ['Aug', 378],
  ['Sep', 412],
].map(([month, value]) => ({ month: month as string, value: value as number }));

export const DASHBOARD_01_CUSTOMERS: Dashboard01Customer[] = [
  { id: 1, name: 'Hotel Brisa', plan: 'Enterprise', status: 'active', mrr: 4200 },
  { id: 2, name: 'Café Altura', plan: 'Team', status: 'trial', mrr: 0 },
  { id: 3, name: 'Taller Motor', plan: 'Team', status: 'active', mrr: 1350 },
  { id: 4, name: 'Óptica Clara', plan: 'Starter', status: 'past-due', mrr: 480 },
  { id: 5, name: 'Editorial Faro', plan: 'Enterprise', status: 'active', mrr: 3900 },
];

export const DASHBOARD_01_ACTIVITY: Dashboard01Activity[] = [
  { id: 1, who: 'Hotel Brisa', what: 'upgraded to Enterprise', when: '2 h ago' },
  { id: 2, who: 'Óptica Clara', what: 'missed a payment of $480', when: '5 h ago' },
  { id: 3, who: 'Café Altura', what: 'started a trial', when: 'Yesterday' },
  { id: 4, who: 'Taller Motor', what: 'added 3 users', when: 'Mon' },
];

const STATUS: Record<Dashboard01Customer['status'], { label: string; tone: BadgeTone }> = {
  active: { label: 'Active', tone: 'success' },
  trial: { label: 'Trial', tone: 'info' },
  'past-due': { label: 'Past due', tone: 'warning' },
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

/**
 * El menú del dashboard: el mismo en el lateral (escritorio) y en el Sheet (teléfono). Un
 * componente y no un `<ng-template>` con `NgTemplateOutlet`: este se llevaba 1,25 kB al JS inicial
 * del sitio (spec 10, «Trampas de tamaño»).
 */
@Component({
  selector: 'nav[mimi-dashboard-01-menu]',
  imports: [MimiAvatar, MimiAvatarFallback, MimiBadge],
  template: `
    <div class="flex items-center gap-2.5 px-2 pb-2">
      <span
        aria-hidden="true"
        class="inline-flex size-8 items-center justify-center rounded-[var(--mimi-radius)] bg-primary text-sm font-bold text-primary-foreground"
        >{{ appName()[0] }}</span
      >
      <span class="font-semibold">{{ appName() }}</span>
    </div>
    @for (group of nav(); track group.label) {
      <div class="flex flex-col gap-1">
        <h2 class="px-2 text-xs font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {{ group.label }}
        </h2>
        <ul class="flex flex-col gap-0.5">
          @for (item of group.items; track item.id) {
            <li>
              <button
                type="button"
                data-slot="nav-item"
                class="flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--mimi-radius-sm)] px-2.5 text-start text-sm font-medium mimi-transition hover:not-aria-[current=page]:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground md:min-h-9"
                [attr.aria-current]="item.id === active() ? 'page' : null"
                (click)="picked.emit(item.id)"
              >
                {{ item.label }}
                @if (item.count !== undefined) {
                  <span mimiBadge variant="soft" size="sm" [tone]="item.tone ?? 'secondary'">{{
                    item.count
                  }}</span>
                }
              </button>
            </li>
          }
        </ul>
      </div>
    }
    <div class="mt-auto flex items-center gap-2.5 border-t border-border px-2 pt-3">
      <mimi-avatar size="sm">
        <mimi-avatar-fallback [label]="user().name">{{
          initials(user().name)
        }}</mimi-avatar-fallback>
      </mimi-avatar>
      <span class="flex min-w-0 flex-col">
        <span class="truncate text-sm font-semibold">{{ user().name }}</span>
        <span class="truncate text-xs text-muted-foreground">{{ user().role }}</span>
      </span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard01Menu {
  readonly appName = input.required<string>();
  readonly nav = input.required<Dashboard01NavGroup[]>();
  readonly active = input.required<string>();
  readonly user = input.required<{ name: string; role: string }>();
  readonly picked = output<string>();
  protected readonly initials = initials;
}

/**
 * dashboard-01 (Block de Mimi): la pantalla de inicio de una aplicación. En escritorio, un menú
 * lateral; en el teléfono, el menú se abre en un Sheet desde la izquierda. Cabecera con saludo y
 * «New customer», cuatro métricas (Card), los ingresos por mes, los clientes recientes (Table) y
 * la actividad reciente. Diseño de referencia: docs/design/Block dashboard-01.dc.html. Los números
 * son fijos y la actividad es una lista escrita aquí (decidido por el usuario el 07/11/2026, B.8-a):
 * cuando existan Number Ticker (E.6) y Timeline (G5.5), puedes cambiarlos.
 *
 * Es una página: `ng g mimi dashboard-01` la genera en tu carpeta de páginas (`aliases.pages` de
 * mimi.json; por defecto, `src/app/pages/dashboard/`, u otro nombre con `--name`) junto con su
 * archivo de rutas (`dashboard.routes.ts`, con la página en carga diferida), y te da la línea para
 * `app.routes.ts`:
 *
 * ```ts
 * { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES) },
 * ```
 *
 * El archivo es tuyo: da tus datos con sus entradas (sin ellas, los de ejemplo) y conecta el menú
 * (`[(active)]`) a tus rutas.
 *
 * ```html
 * <mimi-dashboard-01 [stats]="stats" [customers]="recent" (newCustomer)="create()" />
 * ```
 */
@Component({
  selector: 'mimi-dashboard-01',
  imports: [
    Dashboard01Menu,
    MimiBadge,
    MimiButton,
    MimiCardImports,
    MimiSheetImports,
    MimiTableImports,
  ],
  templateUrl: './dashboard-01.html',
  host: {
    '[class]': 'classes()',
    // Cargando: nada se puede pulsar ni enfocar (R.11).
    '[attr.data-state]': 'loading() ? "loading" : null',
    '[attr.inert]': 'loading() ? "" : null',
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard01 {
  readonly appName = input('Mimi Sales');
  readonly user = input<{ name: string; role: string }>({ name: 'Ana Torres', role: 'Admin' });
  readonly nav = input<Dashboard01NavGroup[]>(DASHBOARD_01_NAV);
  /** El ítem del menú activo. Admite `[(active)]`. */
  readonly active = model('home');
  readonly stats = input<Dashboard01Stat[]>(DASHBOARD_01_STATS);
  readonly revenue = input<Dashboard01Month[]>(DASHBOARD_01_REVENUE);
  readonly customers = input<Dashboard01Customer[]>(DASHBOARD_01_CUSTOMERS);
  readonly activity = input<Dashboard01Activity[]>(DASHBOARD_01_ACTIVITY);
  /** Moneda del MRR de los clientes (ISO 4217). */
  readonly currency = input('USD');
  readonly loading = input(false, { transform: booleanAttribute });
  readonly userClass = input('', { alias: 'class' });

  /** «New customer». */
  readonly newCustomer = output<void>();
  /** «View all» de los clientes recientes. */
  readonly viewAllCustomers = output<void>();

  private readonly focusBack = restoreFocusAfterBusy(this.loading);
  private readonly locale = inject(LOCALE_ID);

  /** El menú en el teléfono (Sheet). */
  protected readonly menuOpen = signal(false);

  protected readonly classes = computed(() =>
    cn(
      'grid min-h-dvh w-full min-w-0 font-sans text-foreground md:grid-cols-[232px_minmax(0,1fr)]',
      this.userClass(),
    ),
  );

  protected readonly firstName = computed(() => this.user().name.split(' ')[0]);
  protected readonly maxRevenue = computed(() =>
    Math.max(1, ...this.revenue().map((month) => month.value)),
  );
  protected readonly status = STATUS;

  protected money(value: number): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.currency(),
      maximumFractionDigits: 0,
    }).format(value);
  }

  protected go(id: string): void {
    this.active.set(id);
    this.menuOpen.set(false);
  }
}
