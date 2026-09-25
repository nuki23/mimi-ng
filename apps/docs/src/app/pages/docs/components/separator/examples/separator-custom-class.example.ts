import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSeparator } from '@/components/ui/separator';

@Component({
  selector: 'app-separator-custom-class-example',
  imports: [MimiSeparator],
  template: `
    <div class="flex flex-col gap-3">
      <span class="text-lg font-semibold tracking-[-0.01em]">Novedades</span>
      <mimi-separator class="h-1 w-12 rounded-full bg-primary" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorCustomClassExample {}
