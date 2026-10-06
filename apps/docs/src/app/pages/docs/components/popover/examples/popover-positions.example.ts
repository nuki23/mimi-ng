import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import {
  MimiPopoverImports,
  type MimiPopoverAlign,
  type MimiPopoverSide,
} from '@/components/ui/popover';

@Component({
  selector: 'app-popover-positions-example',
  imports: [MimiPopoverImports, MimiButton],
  template: `
    <div class="flex flex-col items-center gap-4">
      <div class="flex flex-wrap justify-center gap-2">
        @for (side of sides; track side) {
          <mimi-popover [side]="side" class="w-56">
            <button mimiBtn variant="outline" mimiPopoverTrigger>{{ side }}</button>
            <ng-template mimiPopoverContent>
              <p mimiPopoverTitle>side="{{ side }}"</p>
              <p mimiPopoverDescription>Si no cabe, pasa al lado opuesto.</p>
            </ng-template>
          </mimi-popover>
        }
      </div>
      <div class="flex flex-wrap justify-center gap-2">
        @for (align of aligns; track align) {
          <mimi-popover [align]="align" class="w-56">
            <button mimiBtn variant="ghost" mimiPopoverTrigger>align="{{ align }}"</button>
            <ng-template mimiPopoverContent>
              <p mimiPopoverTitle>align="{{ align }}"</p>
              <p mimiPopoverDescription>La flecha apunta al centro del botón.</p>
            </ng-template>
          </mimi-popover>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverPositionsExample {
  protected readonly sides: MimiPopoverSide[] = ['top', 'right', 'bottom', 'left'];
  protected readonly aligns: MimiPopoverAlign[] = ['start', 'center', 'end'];
}
