import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiPopoverImports } from '@/components/ui/popover';

@Component({
  selector: 'app-popover-custom-class-example',
  imports: [MimiPopoverImports, MimiButton],
  template: `
    <mimi-popover
      label="Color del equipo"
      [arrow]="false"
      class="w-auto flex-row gap-2 rounded-full p-2"
    >
      <button mimiBtn variant="outline" mimiPopoverTrigger>Color</button>
      <ng-template mimiPopoverContent>
        @for (tone of tones; track tone.name) {
          <button
            type="button"
            mimiPopoverClose
            [attr.aria-label]="tone.name"
            [class]="tone.class"
            class="size-7 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          ></button>
        }
      </ng-template>
    </mimi-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverCustomClassExample {
  protected readonly tones = [
    { name: 'Primario', class: 'bg-primary' },
    { name: 'Éxito', class: 'bg-success' },
    { name: 'Aviso', class: 'bg-warning' },
    { name: 'Información', class: 'bg-info' },
    { name: 'Peligro', class: 'bg-destructive' },
  ];
}
