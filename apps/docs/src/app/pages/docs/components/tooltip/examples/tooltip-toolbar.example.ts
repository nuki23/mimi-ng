import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideBold,
  LucideItalic,
  LucideLink,
  LucideStrikethrough,
  LucideUnderline,
} from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiTooltip } from '@/components/ui/tooltip';

@Component({
  selector: 'app-tooltip-toolbar-example',
  imports: [
    MimiTooltip,
    MimiButton,
    LucideBold,
    LucideItalic,
    LucideUnderline,
    LucideStrikethrough,
    LucideLink,
  ],
  template: `
    <!-- Pasa el puntero de un botón a otro: después del primero, los demás abren sin esperar. -->
    <div class="flex gap-1 rounded-card border p-1" role="group" aria-label="Formato">
      <button
        mimiBtn
        variant="ghost"
        size="icon"
        aria-label="Negrita"
        mimiTooltip="Negrita"
        mimiTooltipShortcut="⌘B"
      >
        <svg lucideBold></svg>
      </button>
      <button
        mimiBtn
        variant="ghost"
        size="icon"
        aria-label="Cursiva"
        mimiTooltip="Cursiva"
        mimiTooltipShortcut="⌘I"
      >
        <svg lucideItalic></svg>
      </button>
      <button
        mimiBtn
        variant="ghost"
        size="icon"
        aria-label="Subrayado"
        mimiTooltip="Subrayado"
        mimiTooltipShortcut="⌘U"
      >
        <svg lucideUnderline></svg>
      </button>
      <button mimiBtn variant="ghost" size="icon" aria-label="Tachado" mimiTooltip="Tachado">
        <svg lucideStrikethrough></svg>
      </button>
      <button
        mimiBtn
        variant="ghost"
        size="icon"
        aria-label="Enlace"
        mimiTooltip="Enlace"
        mimiTooltipShortcut="⌘K"
      >
        <svg lucideLink></svg>
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipToolbarExample {}
