import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSeparator } from '@/components/ui/separator';

@Component({
  selector: 'app-separator-horizontal-example',
  imports: [MimiSeparator],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-3">
      <div class="flex flex-col gap-0.5">
        <span class="text-sm font-semibold">Mimi UI</span>
        <span class="text-[13px] text-muted-foreground">Componentes para Angular.</span>
      </div>
      <mimi-separator />
      <p class="text-sm text-muted-foreground">Copia los componentes a tu proyecto con la CLI.</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorHorizontalExample {}
