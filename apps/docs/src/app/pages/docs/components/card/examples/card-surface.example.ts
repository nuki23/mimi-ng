import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCardImports } from '@/components/ui/card';

@Component({
  selector: 'app-card-surface-example',
  imports: [MimiCardImports],
  template: `
    <ul class="flex w-full max-w-md flex-col gap-3">
      @for (item of items; track item.name) {
        <li mimiCard class="flex items-center justify-between gap-3 px-4 py-3">
          <span class="font-medium">{{ item.name }}</span>
          <span class="text-sm text-muted-foreground tabular-nums">{{ item.amount }}</span>
        </li>
      }
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSurfaceExample {
  protected readonly items = [
    { name: 'Diseño', amount: '$1.200' },
    { name: 'Desarrollo', amount: '$4.800' },
    { name: 'Hosting', amount: '$90' },
  ];
}
