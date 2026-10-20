import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  LucideAtSign,
  LucideBold,
  LucideItalic,
  LucideLink,
  LucideMessageCircle,
} from '@lucide/angular';
import { MimiToolbarImports } from '@/components/ui/toolbar';
import { MimiTooltip } from '@/components/ui/tooltip';

@Component({
  selector: 'app-toolbar-tooltips-example',
  imports: [
    MimiToolbarImports,
    MimiTooltip,
    LucideBold,
    LucideItalic,
    LucideLink,
    LucideAtSign,
    LucideMessageCircle,
  ],
  template: `
    <!-- El tooltip va en el mismo botón; al pasar de uno a otro, el siguiente abre sin esperar. -->
    <mimi-toolbar aria-label="Formato" [(pressed)]="pressed">
      <button
        mimiToolbarItem="bold"
        kind="toggle"
        aria-label="Negrita"
        mimiTooltip="Negrita"
        mimiTooltipShortcut="⌘B"
      >
        <svg lucideBold></svg>
      </button>
      <button
        mimiToolbarItem="italic"
        kind="toggle"
        aria-label="Cursiva"
        mimiTooltip="Cursiva"
        mimiTooltipShortcut="⌘I"
      >
        <svg lucideItalic></svg>
      </button>
      <mimi-toolbar-separator />
      <button
        mimiToolbarItem="link"
        aria-label="Enlace"
        mimiTooltip="Enlace"
        mimiTooltipShortcut="⌘K"
      >
        <svg lucideLink></svg>
      </button>
      <button
        mimiToolbarItem="mentions"
        [attr.aria-label]="'Menciones, ' + mentions() + ' sin leer'"
        mimiTooltip="Menciones"
        mimiTooltipShortcut="@"
      >
        <svg lucideAtSign></svg>
        <span mimiToolbarCount>{{ mentions() }}</span>
      </button>
      <button
        mimiToolbarItem="comments"
        [attr.aria-label]="'Comentarios, ' + comments() + ' sin leer'"
        mimiTooltip="Comentarios"
        mimiTooltipShortcut="C"
        (click)="comments.set(0)"
      >
        <svg lucideMessageCircle></svg>
        @if (comments()) {
          <span mimiToolbarCount>{{ comments() }}</span>
        }
      </button>
    </mimi-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarTooltipsExample {
  protected readonly pressed = signal<string[]>([]);
  protected readonly mentions = signal(2);
  protected readonly comments = signal(3);
}
