import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlock } from '../../code/code-block';

/** Paquete de Angular que un componente instala además de los de `ng add`. */
export type FoundationPackage = 'forms' | 'cdk' | 'aria';

/**
 * Qué paquetes llegan con cada componente (contando los componentes y utilidades que trae). Lo
 * compara con el registro de la CLI `foundations-page.spec.ts`: si se agrega un componente y no
 * está aquí, la prueba falla.
 */
export const FOUNDATION_PACKAGES: Record<string, readonly FoundationPackage[]> = {
  avatar: [],
  badge: [],
  button: [],
  card: [],
  separator: [],
  skeleton: [],
  input: ['forms'],
  textarea: ['forms'],
  switch: ['forms'],
  checkbox: ['forms'],
  'form-field': ['forms'],
  popover: ['cdk'],
  tooltip: ['cdk'],
  dialog: ['cdk'],
  confirm: ['cdk'],
  toast: ['cdk'],
  toolbar: ['cdk'],
  select: ['forms', 'cdk', 'aria'],
  'dropdown-menu': ['cdk', 'aria'],
  'context-menu': ['cdk', 'aria'],
  tabs: ['cdk', 'aria'],
  pagination: ['forms', 'cdk', 'aria'],
};

/** Los `provide…` de textos de la página (los comprueba la prueba contra ui-core). */
export const FOUNDATION_TEXTS = [
  {
    component: 'FormField',
    provider: 'provideMimiErrorMessages',
    spanish: 'MIMI_ERROR_MESSAGES_ES',
    file: 'form-field/error-messages',
  },
  {
    component: 'Select',
    provider: 'provideMimiSelectText',
    spanish: 'MIMI_SELECT_TEXT_ES',
    file: 'select/select-texts',
  },
  {
    component: 'Dialog',
    provider: 'provideMimiDialogText',
    spanish: 'MIMI_DIALOG_TEXT_ES',
    file: 'dialog/dialog-texts',
  },
  {
    component: 'Confirm',
    provider: 'provideMimiConfirmText',
    spanish: 'MIMI_CONFIRM_TEXT_ES',
    file: 'confirm/confirm-texts',
  },
  {
    component: 'Toast',
    provider: 'provideMimiToastText',
    spanish: 'MIMI_TOAST_TEXT_ES',
    file: 'toast/toast-texts',
  },
  {
    component: 'Pagination',
    provider: 'provideMimiPaginationText',
    spanish: 'MIMI_PAGINATION_TEXT_ES',
    file: 'pagination/pagination-texts',
  },
] as const;

/**
 * Fundamentos (tarea G1.12): qué copia la CLI, cómo se usa Mimi, accesibilidad y base técnica.
 * Cada dato está comprobado contra el código (spec 4, 5, 6, 8, 10, 12 y 13).
 */
@Component({
  selector: 'app-foundations-page',
  imports: [CodeBlock, RouterLink],
  templateUrl: './foundations-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FoundationsPage {
  protected readonly texts = FOUNDATION_TEXTS;

  protected readonly tree = [
    'src/app/components/ui/',
    '├── theme/              # ng add',
    '│   ├── theme-base.css   # variables --mimi-*, modo oscuro y @theme inline',
    '│   ├── types.ts         # los tipos del preset',
    '│   ├── provider.ts      # provideMimiTheme()',
    '│   └── index.ts',
    '├── utils/',
    '│   ├── cn.ts            # ng add: mezcla clases (clsx + tailwind-merge)',
    '│   ├── control-styles.ts # ng add: foco, deshabilitado y presión compartidos',
    '│   ├── field-state.ts   # con Select: el estado del formulario',
    '│   └── overlay.ts       # con Select: posición y animación del panel',
    '└── select/             # ng g mimi select',
    '    ├── select.ts',
    '    ├── select-texts.ts',
    '    └── index.ts',
  ].join('\n');

  protected readonly importsExample = [
    "import { MimiPopoverImports } from '@/components/ui/popover';",
    '',
    '@Component({',
    '  // Todas las piezas: mimi-popover, mimiPopoverTrigger, mimiPopoverContent…',
    '  imports: [MimiPopoverImports],',
    '  template: `',
    '    <mimi-popover>',
    '      <button mimiBtn mimiPopoverTrigger>Invitar</button>',
    '      <ng-template mimiPopoverContent>…</ng-template>',
    '    </mimi-popover>',
    '  `,',
    '})',
  ].join('\n');

  protected readonly classPlaces = [
    { component: 'Button, Input, Textarea, Badge, Card…', goes: 'class → el elemento' },
    { component: 'Switch y Checkbox', goes: 'class → el envoltorio (con el texto)' },
    { component: 'Select', goes: 'class → el disparador; panelClass → el panel' },
    {
      component: 'Popover, Dropdown Menu, Context Menu, Dialog',
      goes: 'class → el panel (lo único que dibujan; el disparador es tuyo)',
    },
    { component: 'Tabs', goes: 'class → la fila de pestañas; panelClass → los paneles' },
    { component: 'Toolbar y Pagination', goes: 'class → la píldora' },
    { component: 'Tooltip (directiva)', goes: 'mimiTooltipClass → el tooltip' },
    { component: 'Toast y Confirm', goes: 'class como opción de la llamada' },
  ];

  protected readonly otherTones = [
    {
      component: 'Toast',
      values: 'tone: neutral, success, warning, info, danger · variant: outline, solid',
    },
    { component: 'Confirm', values: 'tone: primary, danger' },
    { component: 'Ítems de menú', values: 'tone: default, danger' },
    { component: 'Tabs', values: 'variant: underline, pill (sin tono)' },
    { component: 'Pagination', values: 'variant: inline, floating (sin tono)' },
  ];

  protected readonly toneExample = [
    '<button mimiBtn>Guardar</button>                          <!-- solid + primary -->',
    '<button mimiBtn variant="outline">Cancelar</button>        <!-- outline + secondary -->',
    '<button mimiBtn variant="soft" tone="danger">Borrar</button>',
    '<span mimiBadge variant="outline" tone="success">Activo</span>',
  ].join('\n');

  protected readonly cssColors = [
    '/* styles.css, después del @import del tema */',
    ':root {',
    '  --mimi-primary: oklch(0.55 0.2 265);',
    '  --mimi-card-bg: oklch(0.99 0 0); /* un color de componente: solo en CSS */',
    '}',
    '.dark {',
    '  --mimi-primary: oklch(0.7 0.16 265);',
    '  --mimi-card-bg: oklch(0.22 0 0);',
    '}',
  ].join('\n');

  protected readonly presetExample = [
    '// app.config.ts',
    "import { provideMimiTheme } from '@/components/ui/theme';",
    '',
    'providers: [',
    '  provideMimiTheme({',
    "    radius: '0.5rem',",
    "    colors: { primary: 'oklch(0.55 0.2 265)' },",
    "    darkColors: { primary: 'oklch(0.7 0.16 265)' },",
    "    controls: { height: '2.25rem' },",
    "    components: { button: { radius: '9999px' } },",
    '  }),',
    ']',
  ].join('\n');

  protected readonly textsExample = [
    '// app.config.ts: el archivo de textos, no el índice del componente,',
    '// así los textos no llevan el componente al JS inicial.',
    'import {',
    '  MIMI_SELECT_TEXT_ES,',
    '  provideMimiSelectText,',
    "} from '@/components/ui/select/select-texts';",
    '',
    'providers: [',
    '  provideMimiSelectText(MIMI_SELECT_TEXT_ES),',
    '  // Lo que no definas queda en inglés:',
    "  // provideMimiSelectText({ ...MIMI_SELECT_TEXT_ES, loading: 'Cargando países…' }),",
    ']',
  ].join('\n');

  protected readonly formsExample = [
    '<!-- Signal Forms -->',
    '<mimi-form-field label="Correo">',
    '  <input mimiInput type="email" [formField]="profile.email" />',
    '</mimi-form-field>',
    '',
    '<!-- Reactive Forms -->',
    '<mimi-form-field label="Correo">',
    '  <input mimiInput type="email" formControlName="email" />',
    '</mimi-form-field>',
    '',
    '<!-- ngModel -->',
    '<mimi-select aria-label="País" [options]="countries" [(ngModel)]="country" />',
  ].join('\n');

  protected readonly packageRows = [
    {
      packages: 'Solo Angular y Tailwind',
      components: 'Avatar, Badge, Button, Card, Separator y Skeleton',
    },
    {
      packages: '@angular/forms (ya está en tu proyecto)',
      components: 'Input, Textarea, Switch, Checkbox y FormField',
    },
    {
      packages: '@angular/cdk',
      components:
        'Popover y Tooltip (posición), Dialog y Confirm (diálogo), Toast (anuncios) y Toolbar (FocusKeyManager)',
    },
    {
      packages: '@angular/aria y @angular/cdk',
      components: 'Select, Dropdown Menu, Context Menu y Tabs',
    },
    {
      packages: '@angular/cdk, más Select e Input',
      components: 'Pagination (anuncios; el selector de registros llega con @defer)',
    },
  ];

  protected readonly overlayImport = '@import "@angular/cdk/overlay-prebuilt.css";';

  protected readonly compatibility = [
    'Los atajos variant="default", "secondary" y "destructive" de Button y Badge (pasan a tone).',
    'Los nombres de tokens de la 0.1.0 (paddingX, placeholderColor, radii.badge), con un aviso en desarrollo.',
    'El alias destructive-soft del anillo: en la 1.0 pasa a ser el fondo suave, así que cambia ring-destructive-soft por ring-destructive-ring antes.',
    '"vivid" como estilo en mimi.json (es "mimi").',
  ];
}
