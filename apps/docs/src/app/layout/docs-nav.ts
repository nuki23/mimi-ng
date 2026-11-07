/**
 * Configuración de la sidebar de la documentación. La sidebar, las migas y la prueba de
 * rutas salen de aquí: no escribir enlaces de la documentación a mano en el HTML.
 *
 * - ready: la página existe y es un enlace.
 * - pending: la página todavía no existe; se ve atenuada y no es clicable.
 * - soon: llega en una fase posterior; atenuada, no clicable y con la etiqueta «Próximamente».
 */
export type DocsNavStatus = 'ready' | 'pending' | 'soon';

export interface DocsNavItem {
  title: string;
  path: string;
  status: DocsNavStatus;
}

export interface DocsNavSection {
  title: string;
  items: DocsNavItem[];
}

export const DOCS_NAV: DocsNavSection[] = [
  {
    title: 'Primeros pasos',
    items: [
      { title: 'Introducción', path: '/docs/introduction', status: 'ready' },
      { title: 'Instalación', path: '/docs/installation', status: 'ready' },
      { title: 'Fundamentos', path: '/docs/foundations', status: 'ready' },
      { title: 'Personalización', path: '/docs/customization', status: 'pending' },
      { title: 'Tema', path: '/docs/theme', status: 'ready' },
      { title: 'Iconos', path: '/docs/icons', status: 'pending' },
      { title: 'Migrar desde PrimeNG / NG-ZORRO', path: '/docs/migration', status: 'pending' },
    ],
  },
  {
    title: 'Componentes',
    items: [
      { title: 'Button', path: '/docs/components/button', status: 'ready' },
      { title: 'Input y Textarea', path: '/docs/components/input', status: 'ready' },
      { title: 'FormField', path: '/docs/components/form-field', status: 'ready' },
      { title: 'Card', path: '/docs/components/card', status: 'ready' },
      { title: 'Badge', path: '/docs/components/badge', status: 'ready' },
      { title: 'Avatar', path: '/docs/components/avatar', status: 'ready' },
      { title: 'Switch y Checkbox', path: '/docs/components/switch', status: 'ready' },
      { title: 'Separator', path: '/docs/components/separator', status: 'ready' },
      { title: 'Skeleton', path: '/docs/components/skeleton', status: 'ready' },
      { title: 'Popover', path: '/docs/components/popover', status: 'ready' },
      { title: 'Tooltip', path: '/docs/components/tooltip', status: 'ready' },
      { title: 'Dropdown Menu', path: '/docs/components/dropdown-menu', status: 'ready' },
      { title: 'Context Menu', path: '/docs/components/context-menu', status: 'ready' },
      { title: 'Select', path: '/docs/components/select', status: 'ready' },
      { title: 'Dialog', path: '/docs/components/dialog', status: 'ready' },
      { title: 'Confirm', path: '/docs/components/confirm', status: 'ready' },
      { title: 'Toast', path: '/docs/components/toast', status: 'ready' },
      { title: 'Tabs', path: '/docs/components/tabs', status: 'ready' },
      { title: 'Toolbar', path: '/docs/components/toolbar', status: 'ready' },
      { title: 'Pagination', path: '/docs/components/pagination', status: 'ready' },
      { title: 'Toggle Group', path: '/docs/components/toggle-group', status: 'ready' },
      { title: 'Progress', path: '/docs/components/progress', status: 'ready' },
      { title: 'Number Input', path: '/docs/components/number-input', status: 'ready' },
      { title: 'Password', path: '/docs/components/password', status: 'ready' },
      { title: 'Input Mask', path: '/docs/components/input-mask', status: 'ready' },
      { title: 'Input OTP', path: '/docs/components/input-otp', status: 'ready' },
      { title: 'Tags Input', path: '/docs/components/tags-input', status: 'ready' },
      { title: 'Slider', path: '/docs/components/slider', status: 'ready' },
      { title: 'Combobox', path: '/docs/components/combobox', status: 'ready' },
      { title: 'Date Picker', path: '/docs/components/date-picker', status: 'ready' },
      { title: 'Date Range', path: '/docs/components/date-range', status: 'ready' },
      { title: 'File Upload', path: '/docs/components/file-upload', status: 'ready' },
      { title: 'Color Picker', path: '/docs/components/color-picker', status: 'ready' },
    ],
  },
  {
    // Pantallas enteras (B.1): no cuentan como componentes. Cada tarea (B.2 a B.7) pasa la suya a
    // ready cuando existe su página.
    title: 'Blocks',
    items: [
      { title: 'login-01', path: '/docs/blocks/login-01', status: 'pending' },
      { title: 'login-02', path: '/docs/blocks/login-02', status: 'pending' },
      { title: 'signup-01', path: '/docs/blocks/signup-01', status: 'pending' },
      { title: 'otp-01', path: '/docs/blocks/otp-01', status: 'pending' },
      { title: 'settings-01', path: '/docs/blocks/settings-01', status: 'pending' },
      { title: 'pricing-01', path: '/docs/blocks/pricing-01', status: 'pending' },
    ],
  },
];

/** Sección y página de una ruta (para las migas). Ignora el fragmento y la query. */
export function findDocsNavEntry(
  url: string,
  nav: DocsNavSection[] = DOCS_NAV,
): { section: DocsNavSection; item: DocsNavItem } | null {
  const path = url.split(/[?#]/)[0];
  for (const section of nav) {
    const item = section.items.find((i) => i.path === path);
    if (item) return { section, item };
  }
  return null;
}
