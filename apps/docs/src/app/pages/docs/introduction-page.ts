import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideChevronRight } from '@lucide/angular';

/** Introducción (placeholder de la tarea 1.6, textos de docs/design y docs/spec.md). */
@Component({
  selector: 'app-introduction-page',
  imports: [RouterLink, LucideChevronRight],
  templateUrl: './introduction-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroductionPage {
  protected readonly steps = [
    {
      n: 1,
      title: 'La CLI copia',
      body: 'ng g mimi escribe el componente en src/app/components/ui. No hay paquete que actualizar a ciegas.',
    },
    {
      n: 2,
      title: 'Un prefijo',
      body: 'Directivas y componentes empiezan por mimi. Nada de p-, nz- ni capas intermedias.',
    },
    {
      n: 3,
      title: 'Tema opcional',
      body: 'Las variables --mimi-* funcionan solas. Si quieres más control, un preset tipado las define.',
    },
  ];

  protected readonly available = INTRODUCTION_COMPONENTS;
}

/** Los componentes que instala `ng g mimi` (nombre del registro → nombre visible). */
export const INTRODUCTION_COMPONENTS: readonly { id: string; name: string }[] = [
  { id: 'avatar', name: 'Avatar' },
  { id: 'badge', name: 'Badge' },
  { id: 'button', name: 'Button' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'card', name: 'Card' },
  { id: 'checkbox', name: 'Checkbox' },
  { id: 'color-picker', name: 'Color Picker' },
  { id: 'combobox', name: 'Combobox' },
  { id: 'command', name: 'Command' },
  { id: 'confirm', name: 'Confirm' },
  { id: 'context-menu', name: 'Context Menu' },
  { id: 'date-picker', name: 'Date Picker' },
  { id: 'date-range', name: 'Date Range' },
  { id: 'dialog', name: 'Dialog' },
  { id: 'dropdown-menu', name: 'Dropdown Menu' },
  { id: 'file-upload', name: 'File Upload' },
  { id: 'form-field', name: 'FormField' },
  { id: 'input', name: 'Input' },
  { id: 'input-mask', name: 'Input Mask' },
  { id: 'input-otp', name: 'Input OTP' },
  { id: 'number-input', name: 'Number Input' },
  { id: 'pagination', name: 'Pagination' },
  { id: 'password', name: 'Password' },
  { id: 'popover', name: 'Popover' },
  { id: 'progress', name: 'Progress' },
  { id: 'select', name: 'Select' },
  { id: 'separator', name: 'Separator' },
  { id: 'skeleton', name: 'Skeleton' },
  { id: 'slider', name: 'Slider' },
  { id: 'sortable-list', name: 'Sortable List' },
  { id: 'switch', name: 'Switch' },
  { id: 'tabs', name: 'Tabs' },
  { id: 'tags-input', name: 'Tags Input' },
  { id: 'textarea', name: 'Textarea' },
  { id: 'toast', name: 'Toast' },
  { id: 'toggle-group', name: 'Toggle Group' },
  { id: 'toolbar', name: 'Toolbar' },
  { id: 'tooltip', name: 'Tooltip' },
  { id: 'tree', name: 'Tree' },
];
