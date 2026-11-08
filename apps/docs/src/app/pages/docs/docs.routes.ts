import { Routes } from '@angular/router';

/**
 * Rutas de la documentación (/docs/...). Se cargan con loadChildren desde app.routes.ts, así
 * que esta tabla (una entrada y un título por página) no viaja en main: cada página nueva suma
 * aquí, en un chunk que solo se pide al entrar en /docs (tarea M.13).
 */
export const DOCS_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'introduction' },
  {
    path: 'introduction',
    title: 'Introducción · Mimi',
    loadComponent: () => import('./introduction-page').then((m) => m.IntroductionPage),
  },
  {
    path: 'installation',
    title: 'Instalación · Mimi',
    loadComponent: () => import('./installation-page').then((m) => m.InstallationPage),
  },
  {
    path: 'foundations',
    title: 'Fundamentos · Mimi',
    loadComponent: () => import('./foundations-page').then((m) => m.FoundationsPage),
  },
  {
    path: 'theme',
    title: 'Tema · Mimi',
    loadComponent: () => import('./theme/theme-page').then((m) => m.ThemePage),
  },
  {
    path: 'components/button',
    title: 'Button · Mimi',
    loadComponent: () => import('./components/button/button-page').then((m) => m.ButtonPage),
  },
  {
    path: 'components/input',
    title: 'Input y Textarea · Mimi',
    loadComponent: () => import('./components/input/input-page').then((m) => m.InputPage),
  },
  {
    path: 'components/badge',
    title: 'Badge · Mimi',
    loadComponent: () => import('./components/badge/badge-page').then((m) => m.BadgePage),
  },
  {
    path: 'components/card',
    title: 'Card · Mimi',
    loadComponent: () => import('./components/card/card-page').then((m) => m.CardPage),
  },
  {
    path: 'components/popover',
    title: 'Popover · Mimi',
    loadComponent: () => import('./components/popover/popover-page').then((m) => m.PopoverPage),
  },
  {
    path: 'components/tooltip',
    title: 'Tooltip · Mimi',
    loadComponent: () => import('./components/tooltip/tooltip-page').then((m) => m.TooltipPage),
  },
  {
    path: 'components/dropdown-menu',
    title: 'Dropdown Menu · Mimi',
    loadComponent: () =>
      import('./components/dropdown-menu/dropdown-menu-page').then((m) => m.DropdownMenuPage),
  },
  {
    path: 'components/context-menu',
    title: 'Context Menu · Mimi',
    loadComponent: () =>
      import('./components/context-menu/context-menu-page').then((m) => m.ContextMenuPage),
  },
  {
    path: 'components/dialog',
    title: 'Dialog · Mimi',
    loadComponent: () => import('./components/dialog/dialog-page').then((m) => m.DialogPage),
  },
  {
    path: 'components/confirm',
    title: 'Confirm · Mimi',
    loadComponent: () => import('./components/confirm/confirm-page').then((m) => m.ConfirmPage),
  },
  {
    path: 'components/tabs',
    title: 'Tabs · Mimi',
    loadComponent: () => import('./components/tabs/tabs-page').then((m) => m.TabsPage),
  },
  {
    path: 'components/pagination',
    title: 'Pagination · Mimi',
    loadComponent: () =>
      import('./components/pagination/pagination-page').then((m) => m.PaginationPage),
  },
  {
    path: 'components/toolbar',
    title: 'Toolbar · Mimi',
    loadComponent: () => import('./components/toolbar/toolbar-page').then((m) => m.ToolbarPage),
  },
  {
    path: 'components/input-mask',
    title: 'Input Mask · Mimi',
    loadComponent: () =>
      import('./components/input-mask/input-mask-page').then((m) => m.InputMaskPage),
  },
  {
    path: 'components/input-otp',
    title: 'Input OTP · Mimi',
    loadComponent: () =>
      import('./components/input-otp/input-otp-page').then((m) => m.InputOtpPage),
  },
  {
    path: 'components/number-input',
    title: 'Number Input · Mimi',
    loadComponent: () =>
      import('./components/number-input/number-input-page').then((m) => m.NumberInputPage),
  },
  {
    path: 'components/password',
    title: 'Password · Mimi',
    loadComponent: () => import('./components/password/password-page').then((m) => m.PasswordPage),
  },
  {
    path: 'components/progress',
    title: 'Progress · Mimi',
    loadComponent: () => import('./components/progress/progress-page').then((m) => m.ProgressPage),
  },
  {
    path: 'components/slider',
    title: 'Slider · Mimi',
    loadComponent: () => import('./components/slider/slider-page').then((m) => m.SliderPage),
  },
  {
    path: 'components/combobox',
    title: 'Combobox · Mimi',
    loadComponent: () => import('./components/combobox/combobox-page').then((m) => m.ComboboxPage),
  },
  {
    path: 'components/command',
    title: 'Command · Mimi',
    loadComponent: () => import('./components/command/command-page').then((m) => m.CommandPage),
  },
  {
    path: 'components/date-picker',
    title: 'Date Picker · Mimi',
    loadComponent: () =>
      import('./components/date-picker/date-picker-page').then((m) => m.DatePickerPage),
  },
  {
    path: 'components/date-range',
    title: 'Date Range · Mimi',
    loadComponent: () =>
      import('./components/date-range/date-range-page').then((m) => m.DateRangePage),
  },
  {
    path: 'components/file-upload',
    title: 'File Upload · Mimi',
    loadComponent: () =>
      import('./components/file-upload/file-upload-page').then((m) => m.FileUploadPage),
  },
  {
    path: 'components/color-picker',
    title: 'Color Picker · Mimi',
    loadComponent: () =>
      import('./components/color-picker/color-picker-page').then((m) => m.ColorPickerPage),
  },
  {
    path: 'components/tree',
    title: 'Tree · Mimi',
    loadComponent: () => import('./components/tree/tree-page').then((m) => m.TreePage),
  },
  {
    path: 'components/sortable-list',
    title: 'Sortable List · Mimi',
    loadComponent: () =>
      import('./components/sortable-list/sortable-list-page').then((m) => m.SortableListPage),
  },
  {
    path: 'components/tags-input',
    title: 'Tags Input · Mimi',
    loadComponent: () =>
      import('./components/tags-input/tags-input-page').then((m) => m.TagsInputPage),
  },
  {
    path: 'components/toggle-group',
    title: 'Toggle Group · Mimi',
    loadComponent: () =>
      import('./components/toggle-group/toggle-group-page').then((m) => m.ToggleGroupPage),
  },
  {
    path: 'components/toast',
    title: 'Toast · Mimi',
    loadComponent: () => import('./components/toast/toast-page').then((m) => m.ToastPage),
  },
  {
    path: 'components/select',
    title: 'Select · Mimi',
    loadComponent: () => import('./components/select/select-page').then((m) => m.SelectPage),
  },
  {
    path: 'components/separator',
    title: 'Separator · Mimi',
    loadComponent: () =>
      import('./components/separator/separator-page').then((m) => m.SeparatorPage),
  },
  {
    path: 'components/skeleton',
    title: 'Skeleton · Mimi',
    loadComponent: () => import('./components/skeleton/skeleton-page').then((m) => m.SkeletonPage),
  },
  {
    path: 'components/avatar',
    title: 'Avatar · Mimi',
    loadComponent: () => import('./components/avatar/avatar-page').then((m) => m.AvatarPage),
  },
  {
    path: 'components/switch',
    title: 'Switch y Checkbox · Mimi',
    loadComponent: () => import('./components/switch/switch-page').then((m) => m.SwitchPage),
  },
  {
    path: 'components/form-field',
    title: 'FormField · Mimi',
    loadComponent: () =>
      import('./components/form-field/form-field-page').then((m) => m.FormFieldPage),
  },
  // Blocks (B.1): una página por Block, con la plantilla BlockDoc.
  {
    path: 'blocks/login-01',
    title: 'login-01 · Blocks · Mimi',
    loadComponent: () => import('./blocks/login-01-page').then((m) => m.Login01Page),
  },
  {
    path: 'blocks/login-02',
    title: 'login-02 · Blocks · Mimi',
    loadComponent: () => import('./blocks/login-02-page').then((m) => m.Login02Page),
  },
  {
    path: 'blocks/signup-01',
    title: 'signup-01 · Blocks · Mimi',
    loadComponent: () => import('./blocks/signup-01-page').then((m) => m.Signup01Page),
  },
  {
    path: 'blocks/otp-01',
    title: 'otp-01 · Blocks · Mimi',
    loadComponent: () => import('./blocks/otp-01-page').then((m) => m.Otp01Page),
  },
  {
    path: 'blocks/settings-01',
    title: 'settings-01 · Blocks · Mimi',
    loadComponent: () => import('./blocks/settings-01-page').then((m) => m.Settings01Page),
  },
  {
    path: 'blocks/pricing-01',
    title: 'pricing-01 · Blocks · Mimi',
    loadComponent: () => import('./blocks/pricing-01-page').then((m) => m.Pricing01Page),
  },
];
