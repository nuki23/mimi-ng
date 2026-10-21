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
  { id: 'card', name: 'Card' },
  { id: 'checkbox', name: 'Checkbox' },
  { id: 'confirm', name: 'Confirm' },
  { id: 'context-menu', name: 'Context Menu' },
  { id: 'dialog', name: 'Dialog' },
  { id: 'dropdown-menu', name: 'Dropdown Menu' },
  { id: 'form-field', name: 'FormField' },
  { id: 'input', name: 'Input' },
  { id: 'pagination', name: 'Pagination' },
  { id: 'popover', name: 'Popover' },
  { id: 'select', name: 'Select' },
  { id: 'separator', name: 'Separator' },
  { id: 'skeleton', name: 'Skeleton' },
  { id: 'switch', name: 'Switch' },
  { id: 'tabs', name: 'Tabs' },
  { id: 'textarea', name: 'Textarea' },
  { id: 'toast', name: 'Toast' },
  { id: 'toolbar', name: 'Toolbar' },
  { id: 'tooltip', name: 'Tooltip' },
];
