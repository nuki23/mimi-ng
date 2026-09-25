import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCardImports } from '@/components/ui/card';

@Component({
  selector: 'app-card-content-only-example',
  imports: [MimiCardImports],
  template: `
    <mimi-card class="w-full max-w-xs">
      <mimi-card-content class="flex flex-col gap-1">
        <span class="text-sm text-muted-foreground">Usuarios activos</span>
        <span class="text-[32px] font-bold tracking-[-0.02em] tabular-nums">1.284</span>
      </mimi-card-content>
    </mimi-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardContentOnlyExample {}
