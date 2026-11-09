import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideEllipsis } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiDataTableImports, type MimiTableColumn } from '@/components/ui/data-table';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';

type Status = 'Activo' | 'Prueba' | 'Moroso';

interface Customer {
  id: number;
  company: string;
  email: string;
  status: Status;
  plan: string;
  mrr: number;
  users: number;
  country: string;
}

const COMPANIES = ['Hotel Brisa', 'Café Altura', 'Taller Motor', 'Editorial Faro', 'Clínica Sol'];
const STATUSES: Status[] = ['Activo', 'Prueba', 'Activo', 'Moroso'];
const PLANS = ['Free', 'Pro', 'Business'];
const COUNTRIES = ['Colombia', 'México', 'Chile', 'Perú'];

/** 32 clientes inventados, siempre los mismos. */
const CUSTOMERS: Customer[] = Array.from({ length: 32 }, (_, i) => {
  const company = `${COMPANIES[i % COMPANIES.length]} ${Math.floor(i / COMPANIES.length) + 1}`;
  return {
    id: i + 1,
    company,
    email: `contacto@${company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.com`,
    status: STATUSES[i % STATUSES.length],
    plan: PLANS[i % PLANS.length],
    mrr: ((i * 7919) % 180) * 10,
    users: 3 + ((i * 13) % 40),
    country: COUNTRIES[i % COUNTRIES.length],
  };
});

const STATUS_CLASSES: Record<Status, string> = {
  Activo: 'bg-success-soft text-success-soft-foreground',
  Prueba: 'bg-info-soft text-info-soft-foreground',
  Moroso: 'bg-warning-soft text-warning-soft-foreground',
};

@Component({
  selector: 'app-data-table-full-example',
  imports: [MimiDataTableImports, MimiDropdownMenuImports, MimiButton, LucideEllipsis],
  template: `
    <mimi-data-table
      aria-label="Clientes"
      searchPlaceholder="Buscar cliente, correo o plan…"
      selectable
      [data]="customers"
      [columns]="columns"
      [pageSizeOptions]="[5, 10, 25]"
      [(selection)]="selection"
      [(pageSize)]="pageSize"
      class="w-full"
    >
      <ng-template mimiTableCell="company" let-row>
        <span class="flex min-w-0 flex-col leading-[1.3]">
          <span class="truncate font-semibold">{{ row.company }}</span>
          <span class="truncate text-[12.5px] text-muted-foreground">{{ row.email }}</span>
        </span>
      </ng-template>
      <ng-template mimiTableCell="status" let-row>
        <span
          class="inline-flex h-[22px] items-center rounded-full px-[9px] text-xs font-semibold"
          [class]="statusClasses[row.status]"
          >{{ row.status }}</span
        >
      </ng-template>
      <ng-template mimiTableCell="mrr" let-row>
        <span class="font-semibold">\${{ row.mrr.toLocaleString('en-US') }}</span>
      </ng-template>
      <ng-template mimiTableDetail let-row>
        <div class="flex flex-wrap gap-x-10 gap-y-3 text-[13.5px]">
          <span class="flex flex-col gap-0.5">
            <span class="text-[11px] font-semibold tracking-[.05em] text-muted-foreground uppercase"
              >Contacto</span
            >
            <span class="font-semibold">{{ row.company }}</span>
            <span class="text-[12.5px] text-muted-foreground">{{ row.email }}</span>
          </span>
          <span class="flex flex-col gap-0.5">
            <span class="text-[11px] font-semibold tracking-[.05em] text-muted-foreground uppercase"
              >Plan</span
            >
            <span class="font-semibold">{{ row.plan }} · {{ row.users }} usuarios</span>
            <span class="text-[12.5px] text-muted-foreground">{{ row.country }}</span>
          </span>
        </div>
      </ng-template>
      <ng-template mimiTableActions let-row>
        <mimi-dropdown-menu>
          <button
            type="button"
            mimiBtn
            variant="ghost"
            size="icon"
            mimiDropdownMenuTrigger
            [attr.aria-label]="'Acciones de ' + row.company"
          >
            <svg lucideEllipsis aria-hidden="true"></svg>
          </button>
          <ng-template mimiDropdownMenuContent>
            <mimi-menu-label>{{ row.company }}</mimi-menu-label>
            <mimi-menu-item (selected)="last.set('Editar ' + row.company)">Editar</mimi-menu-item>
            <mimi-menu-item (selected)="last.set('Facturas de ' + row.company)"
              >Ver facturas</mimi-menu-item
            >
            <mimi-menu-separator />
            <mimi-menu-item tone="danger" (selected)="last.set('Cancelar ' + row.company)"
              >Cancelar cuenta</mimi-menu-item
            >
          </ng-template>
        </mimi-dropdown-menu>
      </ng-template>
      <ng-template mimiTableBulk let-ids>
        <button
          type="button"
          mimiBtn
          variant="outline"
          size="sm"
          (click)="last.set('Exportar ' + ids.length)"
        >
          Exportar
        </button>
        <button type="button" mimiBtn tone="danger" size="sm" (click)="remove(ids)">
          Eliminar
        </button>
      </ng-template>
    </mimi-data-table>
    <p class="mt-3 text-sm text-muted-foreground" aria-live="polite">
      Última acción: <span class="font-medium text-foreground">{{ last() ?? '—' }}</span>
    </p>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableFullExample {
  protected readonly statusClasses: Record<string, string> = STATUS_CLASSES;
  protected readonly customers = CUSTOMERS;
  protected readonly selection = signal<unknown[]>([]);
  protected readonly pageSize = signal(5);
  protected readonly last = signal<string | null>(null);

  protected readonly columns: MimiTableColumn<Customer>[] = [
    { id: 'company', header: 'Cliente', sortable: true, sticky: true, width: '260px' },
    {
      id: 'status',
      header: 'Estado',
      width: '120px',
      filterOptions: [
        { label: 'Activo', value: 'Activo' },
        { label: 'Prueba', value: 'Prueba' },
        { label: 'Moroso', value: 'Moroso' },
      ],
    },
    {
      id: 'plan',
      header: 'Plan',
      width: '120px',
      filterOptions: [
        { label: 'Free', value: 'Free' },
        { label: 'Pro', value: 'Pro' },
        { label: 'Business', value: 'Business' },
      ],
    },
    { id: 'mrr', header: 'MRR', sortable: true, align: 'end', width: '110px', searchable: false },
    {
      id: 'users',
      header: 'Usuarios',
      sortable: true,
      align: 'end',
      width: '110px',
      searchable: false,
    },
    { id: 'country', header: 'País', sortable: true, width: '140px' },
  ];

  protected remove(ids: unknown[]): void {
    this.last.set(`Eliminar ${ids.length}`);
    this.selection.set([]);
  }
}
