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
      { title: 'Personalización', path: '/docs/customization', status: 'pending' },
      { title: 'Temas', path: '/docs/themes', status: 'pending' },
      { title: 'Iconos', path: '/docs/icons', status: 'pending' },
      { title: 'Migrar desde PrimeNG / NG-ZORRO', path: '/docs/migration', status: 'pending' },
    ],
  },
  {
    title: 'Componentes',
    items: [
      { title: 'Button', path: '/docs/components/button', status: 'ready' },
      { title: 'Input y Textarea', path: '/docs/components/input', status: 'ready' },
      { title: 'FormField', path: '/docs/components/form-field', status: 'pending' },
      { title: 'Card', path: '/docs/components/card', status: 'pending' },
      { title: 'Badge', path: '/docs/components/badge', status: 'pending' },
      { title: 'Avatar', path: '/docs/components/avatar', status: 'pending' },
      { title: 'Switch y Checkbox', path: '/docs/components/switch', status: 'pending' },
      { title: 'Separator', path: '/docs/components/separator', status: 'pending' },
      { title: 'Skeleton', path: '/docs/components/skeleton', status: 'pending' },
      { title: 'Select', path: '/docs/components/select', status: 'soon' },
      { title: 'Dialog', path: '/docs/components/dialog', status: 'soon' },
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
