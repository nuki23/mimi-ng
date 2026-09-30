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

  protected readonly available = [
    'Button',
    'Input',
    'Textarea',
    'FormField',
    'Card',
    'Badge',
    'Avatar',
    'Switch',
    'Checkbox',
    'Separator',
    'Skeleton',
  ];
}
