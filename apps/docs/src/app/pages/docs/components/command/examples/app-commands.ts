import {
  type LucideIcon,
  LucideBookOpen,
  LucideFolderPlus,
  LucideLayoutDashboard,
  LucideLogOut,
  LucideMoon,
  LucideReceipt,
  LucideSettings,
  LucideUserPlus,
  LucideUsers,
} from '@lucide/angular';
import type { MimiCommandGroup } from '@/components/ui/command';

/** Los comandos de la aplicación; en `data`, el ícono de cada uno. */
export const APP_COMMANDS: MimiCommandGroup<LucideIcon>[] = [
  {
    label: 'Sugerencias',
    items: [
      {
        id: 'new',
        label: 'Nuevo proyecto',
        data: LucideFolderPlus,
        shortcut: ['⌘', 'N'],
        tone: 'info',
      },
      {
        id: 'invite',
        label: 'Invitar al equipo',
        data: LucideUserPlus,
        shortcut: ['⌘', 'I'],
        tone: 'success',
      },
      {
        id: 'docs',
        label: 'Buscar en la documentación',
        data: LucideBookOpen,
        keywords: ['ayuda'],
      },
    ],
  },
  {
    label: 'Navegación',
    items: [
      { id: 'home', label: 'Ir al panel', data: LucideLayoutDashboard, shortcut: ['G', 'P'] },
      { id: 'clients', label: 'Ir a clientes', data: LucideUsers, shortcut: ['G', 'C'] },
      { id: 'billing', label: 'Ir a facturación', data: LucideReceipt, shortcut: ['G', 'F'] },
      { id: 'settings', label: 'Ir a ajustes', data: LucideSettings, shortcut: ['G', 'A'] },
    ],
  },
  {
    label: 'Cuenta',
    items: [
      { id: 'dark', label: 'Cambiar a modo oscuro', data: LucideMoon, keywords: ['tema'] },
      {
        id: 'logout',
        label: 'Cerrar sesión',
        data: LucideLogOut,
        shortcut: ['⇧', '⌘', 'Q'],
        tone: 'danger',
      },
    ],
  },
];
