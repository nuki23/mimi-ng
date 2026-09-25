import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSeparator } from '@/components/ui/separator';

@Component({
  selector: 'app-separator-vertical-example',
  imports: [MimiSeparator],
  template: `
    <div class="flex h-5 items-center gap-3 text-sm">
      <span>Docs</span>
      <mimi-separator orientation="vertical" />
      <span>Componentes</span>
      <mimi-separator orientation="vertical" />
      <span>GitHub</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeparatorVerticalExample {}
