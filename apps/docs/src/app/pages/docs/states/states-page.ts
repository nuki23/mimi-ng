import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiColorInput } from '@/components/ui/color-picker';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiDateRangePicker } from '@/components/ui/date-range';
import { MimiFileUpload } from '@/components/ui/file-upload';
import { MimiInput } from '@/components/ui/input';
import { MimiInputMask } from '@/components/ui/input-mask';
import { MimiInputOtp } from '@/components/ui/input-otp';
import { MimiNumberInput } from '@/components/ui/number-input';
import { MimiPassword } from '@/components/ui/password';
import { MimiSelectImports } from '@/components/ui/select';
import { MimiSlider } from '@/components/ui/slider';
import { MimiSwitch } from '@/components/ui/switch';
import { MimiTagsInput } from '@/components/ui/tags-input';
import { MimiTextarea } from '@/components/ui/textarea';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';
import { MimiTree, type MimiTreeNode } from '@/components/ui/tree';
import { ThemeService } from '../../../core/theme.service';
import {
  CONTRAST_PAIRS,
  GRAY_OPTIONS,
  type GrayOption,
  contrast,
  parseOklch,
  tintedVars,
} from './gray-tints';
import { ForceState, type ForcedState, installForcedCss } from './state-forcer';

/** Columnas de la cuadrícula: cada estado, forzado a la vista. */
export const STATES: { id: ForcedState; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'hover', label: 'Hover' },
  { id: 'focus', label: 'Foco (teclado)' },
  { id: 'active', label: 'Clic' },
  { id: 'disabled', label: 'Deshabilitado' },
  { id: 'readonly', label: 'Solo lectura' },
  { id: 'error', label: 'Error' },
];

interface ControlRow {
  id: string;
  name: string;
  /** Se escribe en él (Input…) o funciona como botón (Select…): cambia la profundidad. */
  kind: 'write' | 'button';
  /** El elemento que recibe el puntero y el foco. */
  target: string;
  focusAttr?: { selector: string; name: string };
  /** Lo que no se puede forzar con CSS (el estado sale de un evento). */
  note?: string;
}

/** Filas: todos los controles de formulario y parecidos (Radio no existe en Mimi). */
export const ROWS: ControlRow[] = [
  { id: 'input', name: 'Input', kind: 'write', target: 'input' },
  { id: 'textarea', name: 'Textarea', kind: 'write', target: 'textarea' },
  {
    id: 'select',
    name: 'Select',
    kind: 'button',
    target: 'button[role="combobox"]',
    focusAttr: { selector: 'mimi-select > div', name: 'data-focus-visible' },
  },
  { id: 'combobox', name: 'Combobox', kind: 'write', target: 'input' },
  { id: 'tags', name: 'Tags Input', kind: 'write', target: 'input' },
  { id: 'number', name: 'Number Input', kind: 'write', target: 'input' },
  { id: 'password', name: 'Password', kind: 'write', target: 'input' },
  { id: 'mask', name: 'Input Mask', kind: 'write', target: 'input' },
  {
    id: 'otp',
    name: 'Input OTP',
    kind: 'write',
    target: 'input',
    note: 'El foco de las casillas sale del evento focus: aquí no se puede forzar.',
  },
  { id: 'date', name: 'Date Picker', kind: 'button', target: 'button' },
  { id: 'range', name: 'Date Range', kind: 'button', target: 'button' },
  { id: 'color', name: 'Color Picker', kind: 'button', target: 'button' },
  { id: 'upload', name: 'File Upload', kind: 'button', target: 'button' },
  {
    id: 'slider',
    name: 'Slider',
    kind: 'button',
    target: '[role="slider"]',
    note: 'La burbuja del valor sale con el evento focus: aquí no se puede forzar.',
  },
  { id: 'checkbox', name: 'Checkbox', kind: 'button', target: 'button[role="checkbox"]' },
  { id: 'switch', name: 'Switch', kind: 'button', target: 'button[role="switch"]' },
  { id: 'toggle', name: 'Toggle Group', kind: 'button', target: 'button' },
  { id: 'button', name: 'Button', kind: 'button', target: 'button' },
];

/** Opciones de profundidad al hacer clic (simuladas en esta página; ningún componente cambia). */
export const DEPTH_OPTIONS = [
  { id: 'current', label: 'Actual' },
  { id: 'a', label: 'A: anillo en todos, se hunden los de botón (recomendada)' },
  { id: 'b', label: 'B: todos se hunden' },
] as const;
export type DepthOption = (typeof DEPTH_OPTIONS)[number]['id'];

/** La simulación de la profundidad: solo en la columna «Clic» (`data-surface` lo pone ForceState). */
export const DEPTH_CSS = `
.states-grid[data-depth="a"] [data-surface="write"] { scale: none !important; box-shadow: 0 0 0 3px var(--mimi-ring-soft) !important; }
.states-grid[data-depth="a"] [data-surface="button"],
.states-grid[data-depth="b"] [data-surface] { scale: var(--mimi-press-scale) !important; box-shadow: 0 0 0 3px var(--mimi-ring-soft) !important; }
`;

/** El árbol de muestra: una carpeta abierta, un archivo elegido y otro con el foco de teclado. */
const TREE: MimiTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'app', label: 'app.ts', meta: '2 kB' },
      { id: 'styles', label: 'styles.css', meta: '8 kB' },
      { id: 'main', label: 'main.ts', meta: '1 kB' },
    ],
  },
  { id: 'readme', label: 'README.md', meta: '4 kB' },
];

/**
 * Fundamentos › Estados (12/11/2026): todos los controles con cada estado forzado a la vista, para
 * comparar la profundidad, los grises y la selección del Tree antes de unificarlos (Parte 2).
 */
@Component({
  selector: 'app-states-page',
  imports: [
    ForceState,
    MimiButton,
    MimiCheckbox,
    MimiColorInput,
    MimiComboboxImports,
    MimiDatePicker,
    MimiDateRangePicker,
    MimiFileUpload,
    MimiInput,
    MimiInputMask,
    MimiInputOtp,
    MimiNumberInput,
    MimiPassword,
    MimiSelectImports,
    MimiSlider,
    MimiSwitch,
    MimiTagsInput,
    MimiTextarea,
    MimiToggleGroupImports,
    MimiTree,
  ],
  templateUrl: './states-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatesPage {
  private readonly document = inject(DOCUMENT);
  private readonly theme = inject(ThemeService);

  protected readonly states = STATES;
  protected readonly rows = ROWS;
  protected readonly depthOptions = DEPTH_OPTIONS;
  protected readonly grayOptions = GRAY_OPTIONS;
  protected readonly tree = TREE;
  protected readonly tags = ['ui', 'angular'];

  protected readonly depth = signal<DepthOption | null>('a');
  protected readonly gray = signal<GrayOption | null>('neutral');
  /** Cuántas reglas con :hover, :focus o :active se copiaron (0: algo falló). */
  protected readonly forcedRules = signal(0);

  /** Las variables de los grises teñidos (vacío con el neutro). */
  protected readonly grayVars = signal<Record<string, string>>({});
  /** Contraste de los pares de texto con los grises elegidos. */
  protected readonly contrasts = signal<{ label: string; ratio: number; ok: boolean }[]>([]);

  protected readonly gridStyle = computed(() => this.grayVars());
  protected readonly notes = ROWS.filter((row) => row.note);

  constructor() {
    afterNextRender(() => this.forcedRules.set(installForcedCss(this.document, DEPTH_CSS)));
    inject(DestroyRef).onDestroy(() =>
      this.document.getElementById('mimi-states-forced')?.remove(),
    );
    // Los grises dependen del tema del sitio (claro u oscuro) y de la opción elegida.
    afterRenderEffect({
      read: () => {
        const dark = this.theme.isDark();
        const option = GRAY_OPTIONS.find((o) => o.id === (this.gray() ?? 'neutral'))!;
        const style = this.document.defaultView?.getComputedStyle(this.document.documentElement);
        if (!style) return;
        const read = (token: string) => style.getPropertyValue(token);
        const vars = tintedVars(option.chroma, read, dark);
        const value = (token: string) => parseOklch(vars[token] ?? read(token));
        this.grayVars.set(vars);
        this.contrasts.set(
          CONTRAST_PAIRS.flatMap(([fg, bg, label]) => {
            const a = value(fg);
            const b = value(bg);
            if (!a || !b) return [];
            const ratio = contrast(a, b);
            return [{ label, ratio: Math.round(ratio * 100) / 100, ok: ratio >= 4.5 }];
          }),
        );
      },
    });
  }
}
