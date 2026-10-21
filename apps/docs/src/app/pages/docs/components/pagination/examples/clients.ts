/** Datos de ejemplo para las tablas de Pagination (no forman parte del componente). */
export interface Client {
  name: string;
  status: 'Activo' | 'Prueba' | 'Moroso' | 'Cancelado';
  mrr: number;
}

const NAMES = [
  'Hotel Brisa',
  'Café Altura',
  'Taller Motor',
  'Grupo Talento',
  'Editorial Faro',
  'Clínica Sol',
  'Panadería Trigo',
  'Estudio Norte',
];
const STATUSES: Client['status'][] = ['Activo', 'Prueba', 'Moroso', 'Activo', 'Cancelado'];

/** 48 clientes inventados, siempre los mismos. */
export const CLIENTS: Client[] = Array.from({ length: 48 }, (_, i) => ({
  name: `${NAMES[i % NAMES.length]} ${Math.floor(i / NAMES.length) + 1}`,
  status: STATUSES[i % STATUSES.length],
  mrr: ((i * 7919) % 180) * 100,
}));

/** Clases del estado, con los tonos suaves del tema. */
export const STATUS_CLASSES: Record<Client['status'], string> = {
  Activo: 'bg-success-soft text-success-soft-foreground',
  Prueba: 'bg-info-soft text-info-soft-foreground',
  Moroso: 'bg-warning-soft text-warning-soft-foreground',
  Cancelado: 'bg-destructive-soft-bg text-destructive-soft-foreground',
};
