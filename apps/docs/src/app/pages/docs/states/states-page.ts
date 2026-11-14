import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiColorInput } from '@/components/ui/color-picker';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiDatePicker } from '@/components/ui/date-picker';
import { MimiDateRangePicker } from '@/components/ui/date-range';
import { MimiDropdownMenuImports } from '@/components/ui/dropdown-menu';
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
import { MimiTooltip } from '@/components/ui/tooltip';
import { MimiTree, type MimiTreeNode } from '@/components/ui/tree';
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
  /**
   * La carpeta del componente en `packages/ui-core/src/lib/components`. La prueba de la página
   * falla si un control de formulario de ui-core no tiene fila.
   */
  source: string;
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
  { id: 'input', name: 'Input', source: 'input', kind: 'write', target: 'input' },
  { id: 'textarea', name: 'Textarea', source: 'textarea', kind: 'write', target: 'textarea' },
  {
    id: 'select',
    name: 'Select',
    source: 'select',
    kind: 'button',
    target: 'button[role="combobox"]',
    focusAttr: { selector: 'mimi-select > div', name: 'data-focus-visible' },
  },
  { id: 'combobox', name: 'Combobox', source: 'combobox', kind: 'write', target: 'input' },
  { id: 'tags', name: 'Tags Input', source: 'tags-input', kind: 'write', target: 'input' },
  { id: 'number', name: 'Number Input', source: 'number-input', kind: 'write', target: 'input' },
  { id: 'password', name: 'Password', source: 'password', kind: 'write', target: 'input' },
  {
    id: 'password-show',
    name: 'Password (mostrar)',
    source: 'password',
    kind: 'write',
    target: 'input',
    note: 'la fila «mostrar» pulsa el ojo al cargar; deshabilitado no deja mostrarla.',
  },
  { id: 'mask', name: 'Input Mask', source: 'input-mask', kind: 'write', target: 'input' },
  {
    id: 'otp',
    name: 'Input OTP',
    source: 'input-otp',
    kind: 'write',
    target: 'input',
    note: 'El foco de las casillas sale del evento focus: aquí no se puede forzar.',
  },
  { id: 'date', name: 'Date Picker', source: 'date-picker', kind: 'button', target: 'button' },
  { id: 'range', name: 'Date Range', source: 'date-range', kind: 'button', target: 'button' },
  { id: 'color', name: 'Color Picker', source: 'color-picker', kind: 'button', target: 'button' },
  { id: 'upload', name: 'File Upload', source: 'file-upload', kind: 'button', target: 'button' },
  {
    id: 'slider',
    name: 'Slider',
    source: 'slider',
    kind: 'button',
    target: '[role="slider"]',
    note: 'La burbuja del valor sale con el evento focus: aquí no se puede forzar.',
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    source: 'checkbox',
    kind: 'button',
    target: 'button[role="checkbox"]',
  },
  {
    id: 'switch',
    name: 'Switch',
    source: 'switch',
    kind: 'button',
    target: 'button[role="switch"]',
  },
  { id: 'toggle', name: 'Toggle Group', source: 'toggle-group', kind: 'button', target: 'button' },
  {
    id: 'tree',
    name: 'Tree',
    source: 'tree',
    kind: 'button',
    target: '[role="treeitem"]:not([data-selected])',
    note: 'no tiene solo lectura ni error.',
  },
  { id: 'button', name: 'Button', source: 'button', kind: 'button', target: 'button' },
];

/** El árbol de muestra: un archivo elegido y otro que recibe el hover, el foco y el clic. */
const TREE: MimiTreeNode[] = [
  { id: 'app', label: 'app.ts' },
  { id: 'readme', label: 'README.md' },
];

/**
 * Fundamentos › Estados (12/11/2026): todos los controles de formulario con cada estado forzado a
 * la vista. Sirvió para elegir la profundidad, los grises y la selección del Tree (Parte 2 de la
 * unificación); ahora muestra solo lo elegido y sirve para revisar los controles nuevos.
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
    MimiDropdownMenuImports,
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
    MimiTooltip,
    MimiTree,
  ],
  templateUrl: './states-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatesPage {
  private readonly document = inject(DOCUMENT);

  protected readonly states = STATES;
  protected readonly rows = ROWS;
  protected readonly tree = TREE;
  protected readonly tags = ['ui', 'angular'];

  /** Cuántas reglas con :hover, :focus o :active se copiaron (0: algo falló). */
  protected readonly forcedRules = signal(0);
  protected readonly notes = ROWS.filter((row) => row.note);

  constructor() {
    afterNextRender(() => {
      this.forcedRules.set(installForcedCss(this.document));
      // La fila «Password (mostrar)»: pulsa el ojo de cada celda. `click()` desde el código no
      // mueve el foco (la página no enfoca nada al cargar) y el botón queda `aria-pressed`.
      for (const toggle of this.document.querySelectorAll<HTMLButtonElement>(
        'tr[data-row="password-show"] [data-slot="toggle"]:not([disabled])',
      )) {
        toggle.click();
      }
    });
    inject(DestroyRef).onDestroy(() =>
      this.document.getElementById('mimi-states-forced')?.remove(),
    );
  }
}
