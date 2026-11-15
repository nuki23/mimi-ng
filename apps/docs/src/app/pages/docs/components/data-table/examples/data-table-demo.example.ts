import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiDataTableImports, type MimiTableColumn } from '@/components/ui/data-table';

interface Order {
  id: number;
  customer: string;
  status: string;
  total: number;
}

const ORDERS: Order[] = [
  { id: 1041, customer: 'Hotel Brisa', status: 'Pagado', total: 320 },
  { id: 1042, customer: 'Café Altura', status: 'Pendiente', total: 85 },
  { id: 1043, customer: 'Taller Motor', status: 'Pagado', total: 1290 },
  { id: 1044, customer: 'Editorial Faro', status: 'Devuelto', total: 46 },
  { id: 1045, customer: 'Clínica Sol', status: 'Pagado', total: 610 },
  { id: 1046, customer: 'Panadería Trigo', status: 'Pendiente', total: 72 },
  { id: 1047, customer: 'Librería Norte', status: 'Pagado', total: 158 },
];

@Component({
  selector: 'app-data-table-demo-example',
  imports: [MimiDataTableImports],
  template: `
    <mimi-data-table
      aria-label="Pedidos"
      searchPlaceholder="Buscar pedido…"
      selectable
      [data]="orders"
      [columns]="columns"
      [pageSize]="5"
      [pageSizeOptions]="[5, 10]"
      [(selection)]="selection"
      class="w-full"
    />
    <p class="mt-3 text-sm text-muted-foreground">Elegidos: {{ selection().join(', ') || '—' }}</p>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableDemoExample {
  protected readonly orders = ORDERS;
  protected readonly selection = signal<unknown[]>([]);
  protected readonly columns: MimiTableColumn<Order>[] = [
    { id: 'customer', header: 'Cliente', sortable: true },
    {
      id: 'status',
      header: 'Estado',
      filterOptions: ['Pagado', 'Pendiente', 'Devuelto'].map((s) => ({ label: s, value: s })),
    },
    { id: 'total', header: 'Total', sortable: true, align: 'end', searchable: false },
  ];
}
