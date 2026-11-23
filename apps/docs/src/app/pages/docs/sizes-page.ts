import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiAvatarImports } from '@/components/ui/avatar';
import { MimiBadge } from '@/components/ui/badge';
import { MimiButton } from '@/components/ui/button';
import { MimiInput } from '@/components/ui/input';
import { MimiSwitch } from '@/components/ui/switch';
import { MimiSizeScope } from '@/components/ui/utils/size';
import { CodeBlock } from '../../code/code-block';

/** Una fila de la escala: lo que vale cada variable en cada tamaño. */
export interface SizeScaleRow {
  /** Variable del tema (sin `--mimi-`). */
  variable: string;
  what: string;
  sm: string;
  md: string;
  lg: string;
}

/**
 * La escala común (`theme-base.css`, bloques `[data-size]`). La compara con el CSS
 * `sizes-page.spec.ts`: si el tema cambia y esto no, la prueba falla.
 */
export const SIZE_SCALE: readonly SizeScaleRow[] = [
  { variable: 'size-height', what: 'Alto de un control', sm: '2rem', md: '2.5rem', lg: '3rem' },
  { variable: 'size-px', what: 'Relleno horizontal', sm: '0.75rem', md: '1rem', lg: '1.5rem' },
  {
    variable: 'size-text',
    what: 'Tamaño del texto',
    sm: '0.8125rem',
    md: '0.875rem',
    lg: '0.9375rem',
  },
  { variable: 'size-icon', what: 'Ícono', sm: '0.875rem', md: '1rem', lg: '1.125rem' },
  {
    variable: 'size-gap',
    what: 'Hueco entre ícono y texto',
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.5rem',
  },
];

/** Una fila de «qué cambia en cada componente». */
export interface SizeComponentRow {
  component: string;
  /** Qué medida cambia con el tamaño, `sm / md / lg`. */
  changes: string;
}

export const SIZE_COMPONENTS: readonly SizeComponentRow[] = [
  {
    component:
      'Button, Input, Textarea, Select, Combobox, Number Input, Password, Input Mask, Tags Input, Date Picker, Date Range, Color Picker',
    changes:
      'Alto 32 / 40 / 48 px (Textarea, su alto mínimo): quedan alineados al píxel. Button cambia además el relleno y el texto; Input y Password, el texto. Los demás conservan texto de 14 px.',
  },
  { component: 'Avatar', changes: 'Diámetro 32 / 40 / 56 px y texto de las iniciales.' },
  { component: 'Switch', changes: 'Pista 32×18 / 36×20 / 44×24 px.' },
  { component: 'Checkbox', changes: 'Casilla 14 / 16 / 20 px.' },
  { component: 'Badge', changes: 'Alto 18 / 22 / 26 px y relleno.' },
  {
    component: 'Chip',
    changes:
      'Alto 22 / 26 / 30 px y texto 12 / 13 / 14 px. Dentro de un Combobox o Tags Input toma su tamaño.',
  },
  { component: 'Tabs', changes: 'Pestaña subrayada 36 / 44 / 52 px; píldora 30 / 34 / 40 px.' },
  { component: 'Toggle Group', changes: 'Alto del botón 28 / 32 / 40 px y relleno.' },
  {
    component: 'Pagination, Progress',
    changes:
      'Pagination: botón 32 / 40 / 48 px e ícono 16 / 18 / 20 px (es `sm` por defecto). Progress: barra de 4 / 8 / 12 px y círculo de 44 / 76 / 96 px.',
  },
  {
    component: 'Toast',
    changes:
      'Ancho 288 / 340 / 400 px y alto mínimo. `provideMimiToast({ size })` para todos, `size` por aviso.',
  },
  {
    component: 'Dialog',
    changes: 'Ancho 360 / 420 / 560 px (`size` en `service.open` y en `mimi-dialog`).',
  },
  {
    component: 'Confirm',
    changes:
      'Los anchos de Dialog, con `sm` por defecto (`size` en las opciones). `--mimi-confirm-width` gana si lo defines.',
  },
  {
    component: 'Card',
    changes:
      'Relleno de las piezas 16 / 24 / 32 px y hueco entre ellas 12 / 16 / 20 px; los controles de dentro toman el mismo tamaño.',
  },
  {
    component: 'Input OTP',
    changes: 'Casilla 40×46 / 46×54 / 52×62 px, texto 18 / 22 / 26 px y hueco 6 / 8 / 10 px.',
  },
  {
    component: 'File Upload',
    changes:
      'Zona: alto mínimo 136 / 176 / 216 px, relleno 12 / 16 / 24 px, ícono 36 / 44 / 52 px y textos (título 13 / 14 / 15 px, ayuda 12 / 12,5 / 13,5 px). La lista de archivos no cambia.',
  },
  { component: 'Slider', changes: 'Pista 4 / 6 / 8 px y pulgar 16 / 20 / 24 px.' },
  { component: 'Toolbar', changes: 'Botón 32 / 40 / 48 px e ícono 16 / 18 / 20 px.' },
  {
    component: 'Calendar, Date Picker, Date Range',
    changes: 'Celda del día 32 / 36 / 40 px y botones de navegación 28 / 30 / 34 px.',
  },
  {
    component: 'Dropdown Menu, Context Menu',
    changes: 'Alto del ítem 28 / 32 / 36 px y texto 13 / 14 / 15 px.',
  },
  {
    component: 'Command',
    changes: 'Buscador 44 / 52 / 60 px, ítem 34 / 40 / 46 px y texto 14 / 15 / 16 px.',
  },
  { component: 'Tree', changes: 'Fila 28 / 32 / 36 px y texto 12,5 / 13,5 / 14,5 px.' },
  {
    component: 'Sortable List',
    changes: 'Alto mínimo del ítem 44 / 56 / 68 px y separación 6 / 8 / 10 px.',
  },
  {
    component: 'Data Table',
    changes:
      '`size` escala el alto de fila (34 / 42 / 50 px) y de cabecera (32 / 38 / 44 px). `density` es aparte: `comfortable` mantiene su alto fijo (60 / 44 px).',
  },
  {
    component: 'Table',
    changes:
      '`size` en `mimiTable`: alto de fila (34 / 42 / 50 px) y de cabecera (32 / 38 / 44 px), como Data Table.',
  },
  {
    component: 'Loading',
    changes:
      'Anillo 20 / 28 / 40 px y texto 12 / 14 / 16 px (`mimiBlockSize` o `size` en `show()`).',
  },
  {
    component: 'Tooltip',
    changes:
      'Texto 11,5 / 12,5 / 13,5 px y relleno. Toma el tamaño del contenedor del disparador; `mimiTooltipSize` lo fija.',
  },
  { component: 'Popover', changes: 'Ancho 260 / 300 / 360 px.' },
  {
    component: 'Accordion',
    changes:
      'Cabecera 44 / 52 / 60 px, relleno 12 / 16 / 20 px, título 13,5 / 14,5 / 16 px y contenido 13 / 13,5 / 15 px.',
  },
  {
    component: 'Stepper',
    changes:
      'Círculo 28 / 32 / 40 px, número 12 / 13 / 15 px, título 12,5 / 13 / 15 px y texto de debajo 11 / 11,5 / 13 px.',
  },
];

/** Cómo se pide un tamaño (los tres modos). */
const HOW = [
  '<!-- 1. En un control -->',
  '<button mimiBtn size="sm">Guardar</button>',
  '<mimi-select size="lg">',
  '  <mimi-option value="admin">Admin</mimi-option>',
  '</mimi-select>',
  '',
  '<!-- 2. En un contenedor: todos los controles de dentro, sin repetirlo -->',
  '<form mimiSize="sm">',
  '  <input mimiInput />',
  '  <mimi-select>',
  '    <mimi-option value="admin">Admin</mimi-option>',
  '  </mimi-select>',
  '  <button mimiBtn>Enviar</button>',
  '</form>',
  '',
  '<!-- 3. Con CSS, en cualquier contenedor: lo hereda todo lo de dentro -->',
  '<section data-size="lg">…</section>',
].join('\n');

/** Documentación de los tamaños (R.1 y R.8). */
@Component({
  selector: 'app-sizes-page',
  imports: [
    CodeBlock,
    MimiSizeScope,
    MimiButton,
    MimiInput,
    MimiBadge,
    MimiAvatarImports,
    MimiSwitch,
  ],
  templateUrl: './sizes-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SizesPage {
  protected readonly scale = SIZE_SCALE;
  protected readonly components = SIZE_COMPONENTS;
  protected readonly how = HOW;
  protected readonly zone = [
    '<!-- Llega: el contenedor lleva data-size (o mimiSize) -->',
    '<section data-size="md" style="--mimi-btn-height: 2.25rem">',
    '  <button mimiBtn>Guardar</button>',
    '</section>',
    '',
    '<!-- No llega: sin data-size, el botón usa la medida calculada en :root -->',
    '<section style="--mimi-btn-height: 2.25rem">…</section>',
  ].join('\n');
  protected readonly demo = ['sm', 'md', 'lg'] as const;
}
