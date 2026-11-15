import type { MimiTableColumn } from '@/components/ui/data-table';

/** Los datos de los ejemplos de Data Table: 32 clientes inventados, siempre los mismos. */
export type Status = 'Activo' | 'Prueba' | 'Moroso';

export interface Customer {
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

export const CUSTOMERS: Customer[] = Array.from({ length: 32 }, (_, i) => {
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

/** Las píldoras de estado: solo tokens del tema. */
export const STATUS_CLASSES: Record<string, string> = {
  Activo: 'bg-success-soft text-success-soft-foreground',
  Prueba: 'bg-info-soft text-info-soft-foreground',
  Moroso: 'bg-warning-soft text-warning-soft-foreground',
};

const options = (values: string[]) => values.map((value) => ({ label: value, value }));

export const COLUMNS: MimiTableColumn<Customer>[] = [
  { id: 'company', header: 'Cliente', sortable: true, sticky: true, width: '260px' },
  {
    id: 'status',
    header: 'Estado',
    width: '120px',
    filterOptions: options(['Activo', 'Prueba', 'Moroso']),
  },
  { id: 'plan', header: 'Plan', width: '120px', filterOptions: options(PLANS) },
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
