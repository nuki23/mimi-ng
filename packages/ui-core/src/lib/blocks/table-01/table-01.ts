import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { MimiBadge, type BadgeTone } from '@/components/ui/badge';
import { MimiButton } from '@/components/ui/button';
import { MimiCheckbox } from '@/components/ui/checkbox';
import {
  MimiDataTableImports,
  type MimiTableColumn,
  type MimiTableFilterOption,
} from '@/components/ui/data-table';
import { MimiInput } from '@/components/ui/input';
import { cn } from '@/components/ui/utils/cn';

export type Table01Status = 'active' | 'trial' | 'past-due' | 'canceled';

export interface Table01Customer {
  /** Identificador estable (sale en `deleted` y `exported`). */
  id: number;
  name: string;
  email: string;
  status: Table01Status;
  plan: string;
  /** Ingreso mensual recurrente. */
  mrr: number;
  users: number;
  country: string;
}

/** Cuenta de cada estado en el resumen y en las píldoras de la lista móvil. */
const STATUSES: { id: Table01Status; label: string; plural: string; tone: BadgeTone }[] = [
  { id: 'active', label: 'Active', plural: 'Active', tone: 'success' },
  { id: 'trial', label: 'Trial', plural: 'Trial', tone: 'info' },
  { id: 'past-due', label: 'Past due', plural: 'Past due', tone: 'warning' },
  { id: 'canceled', label: 'Canceled', plural: 'Canceled', tone: 'danger' },
];

const NAMES = [
  'Hotel Brisa',
  'Café Altura',
  'Taller Motor',
  'Grupo Talento',
  'Óptica Clara',
  'Editorial Faro',
  'Clínica Sol',
  'Panadería Trigo',
  'Estudio Norte',
];
const PLANS = ['Starter', 'Team', 'Enterprise'];
const COUNTRIES = ['Colombia', 'México', 'Chile', 'Perú'];
const SEQUENCE: Table01Status[] = ['active', 'trial', 'active', 'past-due', 'active', 'canceled'];

/** 36 clientes de ejemplo, siempre los mismos, para que la pantalla funcione sin datos. */
export const TABLE_01_CUSTOMERS: Table01Customer[] = Array.from({ length: 36 }, (_, i) => {
  const name = `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`;
  return {
    id: i + 1,
    name,
    email: `hello@${name
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}.com`,
    status: SEQUENCE[i % SEQUENCE.length],
    plan: PLANS[i % PLANS.length],
    mrr: 300 + ((i * 7919) % 180) * 40,
    users: 2 + ((i * 13) % 60),
    country: COUNTRIES[i % COUNTRIES.length],
  };
});

/**
 * table-01 (Block de Mimi): la pantalla «Clientes». En escritorio, un resumen por estado y la
 * Data Table de Mimi (buscar, filtrar por estado o plan, ordenar, paginar y elegir filas con sus
 * acciones); en móvil, una lista de tarjetas con búsqueda, píldoras de estado y una barra de
 * acciones. Diseño: docs/design/Block table-01.dc.html.
 *
 * Es una página: `ng g mimi table-01` la genera en tu carpeta de páginas (`aliases.pages` de
 * mimi.json; por defecto, `src/app/pages/table/`, u otro nombre con `--name`) junto con su
 * archivo de rutas (`table.routes.ts`, con la página en carga diferida), y te da la línea para
 * `app.routes.ts`:
 *
 * ```ts
 * { path: 'table', loadChildren: () => import('./pages/table/table.routes').then((m) => m.TABLE_ROUTES) },
 * ```
 *
 * El archivo es tuyo: da tus clientes con `customers` (sin ellos, los de ejemplo), conecta
 * «New customer», «Import CSV», «Export» y «Delete» a tu servicio con sus salidas, o cambia las
 * columnas. Con muchos clientes, usa la Data Table en modo servidor (`[total]`).
 *
 * ```html
 * <mimi-table-01 [customers]="customers" (deleted)="remove($event)" (newCustomer)="create()" />
 * ```
 */
@Component({
  selector: 'mimi-table-01',
  imports: [MimiBadge, MimiButton, MimiCheckbox, MimiDataTableImports, MimiInput],
  templateUrl: './table-01.html',
  host: { '[class]': 'classes()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table01 {
  readonly customers = input<readonly Table01Customer[]>(TABLE_01_CUSTOMERS);
  /** Moneda del ingreso mensual (ISO 4217). */
  readonly currency = input('USD');
  /** Idioma de los números. Por defecto, el `LOCALE_ID` de la app. */
  readonly locale = input<string | undefined>(undefined);
  /** Ids de las filas elegidas. Admite `[(selection)]`. */
  readonly selection = model<unknown[]>([]);
  readonly userClass = input('', { alias: 'class' });

  /** «New customer». */
  readonly newCustomer = output<void>();
  /** «Import CSV» (solo en escritorio). */
  readonly importCsv = output<void>();
  /** «Export» con filas elegidas: sus ids. */
  readonly exported = output<unknown[]>();
  /** «Delete» con filas elegidas: sus ids. La pantalla no las quita: lo haces tú en `customers`. */
  readonly deleted = output<unknown[]>();

  private readonly appLocale = inject(LOCALE_ID);
  protected readonly statuses = STATUSES;

  /** La búsqueda y el estado elegido de la lista móvil. */
  protected readonly query = model('');
  protected readonly statusFilter = model<Table01Status | null>(null);

  private readonly money = computed(
    () =>
      new Intl.NumberFormat(this.locale() ?? this.appLocale, {
        style: 'currency',
        currency: this.currency(),
        maximumFractionDigits: 0,
      }),
  );

  protected format(amount: number): string {
    return this.money().format(amount);
  }

  /** El punto de color de cada estado (clases literales para Tailwind). */
  protected dotClass(tone: BadgeTone): string {
    return (
      {
        success: 'bg-success',
        info: 'bg-info',
        warning: 'bg-warning',
        danger: 'bg-destructive',
        primary: 'bg-primary',
        secondary: 'bg-secondary',
      } satisfies Record<BadgeTone, string>
    )[tone];
  }

  protected statusOf(status: Table01Status) {
    return STATUSES.find((s) => s.id === status)!;
  }

  /** Cuántos clientes hay de cada estado. */
  protected readonly counts = computed(() =>
    STATUSES.map((s) => ({
      ...s,
      count: this.customers().filter((c) => c.status === s.id).length,
    })),
  );

  protected readonly subtitle = computed(() => {
    const customers = this.customers();
    const mrr = customers.reduce((sum, c) => sum + c.mrr, 0);
    return `${customers.length} accounts · ${this.format(mrr)} MRR`;
  });

  protected readonly columns = computed<MimiTableColumn<Table01Customer>[]>(() => {
    const options = (values: string[], label: (v: string) => string): MimiTableFilterOption[] =>
      values.map((value) => ({ value, label: label(value) }));
    return [
      { id: 'name', header: 'Customer', sortable: true, sticky: true, width: '280px' },
      {
        id: 'status',
        header: 'Status',
        width: '130px',
        filterOptions: options(
          STATUSES.map((s) => s.id),
          (id) => this.statusOf(id as Table01Status).label,
        ),
        value: (row) => row.status,
      },
      {
        id: 'plan',
        header: 'Plan',
        width: '130px',
        filterOptions: options(PLANS, (p) => p),
      },
      {
        id: 'mrr',
        header: 'MRR',
        sortable: true,
        align: 'end',
        width: '120px',
        searchable: false,
      },
      {
        id: 'users',
        header: 'Users',
        sortable: true,
        align: 'end',
        width: '100px',
        searchable: false,
      },
      { id: 'country', header: 'Country', sortable: true, width: '140px' },
    ];
  });

  /** La lista móvil: la búsqueda (sin tildes) y el estado elegido. */
  protected readonly list = computed(() => {
    const fold = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const q = fold(this.query().trim());
    const status = this.statusFilter();
    return this.customers().filter(
      (c) => (!status || c.status === status) && (!q || fold(c.name).includes(q)),
    );
  });

  protected readonly listIds = computed(() => this.list().map((c) => c.id));
  protected readonly allState = computed<'all' | 'some' | 'none'>(() => {
    const ids = this.listIds();
    const n = ids.filter((id) => this.selection().includes(id)).length;
    return n === 0 ? 'none' : n === ids.length ? 'all' : 'some';
  });

  protected readonly classes = computed(() =>
    cn('flex w-full flex-col bg-background text-foreground', this.userClass()),
  );

  protected isSelected(id: number): boolean {
    return this.selection().includes(id);
  }

  protected toggle(id: number): void {
    this.selection.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  protected toggleAll(checked: boolean): void {
    const ids = this.listIds();
    this.selection.update((sel) =>
      checked
        ? [...sel, ...ids.filter((id) => !sel.includes(id))]
        : sel.filter((id) => !ids.includes(id as number)),
    );
  }

  protected pickStatus(status: Table01Status | null): void {
    this.statusFilter.set(this.statusFilter() === status ? null : status);
  }

  protected selectedText(count: number): string {
    return count === 1 ? '1 selected' : `${count} selected`;
  }
}
