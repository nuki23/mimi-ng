import type { MimiTableFilters, MimiTableSort } from '@/components/ui/data-table';
import { CUSTOMERS, type Customer } from './customers';

/** Lo que la tabla pide: su estado en el momento. */
export interface CustomersQuery {
  query: string;
  sort: MimiTableSort | null;
  filters: MimiTableFilters;
  page: number;
  pageSize: number;
}

/** Un servidor de mentira: busca, filtra, ordena y devuelve solo la página pedida. */
export function fetchCustomers(
  request: CustomersQuery,
): Promise<{ rows: Customer[]; total: number }> {
  const { query, sort, filters, page, pageSize } = request;
  const q = query.toLowerCase();
  let rows = CUSTOMERS.filter((c) => c.company.toLowerCase().includes(q));
  for (const [column, values] of Object.entries(filters)) {
    if (values.length) rows = rows.filter((c) => values.includes(c[column as keyof Customer]));
  }
  if (sort) {
    const key = sort.column as keyof Customer;
    const dir = sort.direction === 'asc' ? 1 : -1;
    rows = [...rows].sort((a, b) => (a[key] > b[key] ? dir : a[key] < b[key] ? -dir : 0));
  }
  const start = (page - 1) * pageSize;
  const result = { rows: rows.slice(start, start + pageSize), total: rows.length };
  return new Promise((resolve) => setTimeout(() => resolve(result), 500));
}
