import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCardImports } from '@/components/ui/card';
import { MimiSkeleton } from '@/components/ui/skeleton';

@Component({
  selector: 'app-skeleton-card-example',
  imports: [MimiCardImports, MimiSkeleton],
  template: `
    <mimi-card aria-busy="true" class="w-full max-w-sm">
      <mimi-card-content class="flex flex-col gap-4 p-5 first:pt-5">
        <span class="sr-only">Cargando…</span>
        <div class="flex items-center gap-3">
          <mimi-skeleton class="size-12 rounded-full" />
          <div class="flex flex-1 flex-col gap-2">
            <mimi-skeleton class="h-3.5 w-3/5" />
            <mimi-skeleton class="h-3 w-2/5" />
          </div>
        </div>
        <mimi-skeleton class="h-3 w-full" />
        <mimi-skeleton class="h-3 w-[85%]" />
        <mimi-skeleton class="h-(--mimi-control-height) w-[110px] rounded-lg" />
      </mimi-card-content>
    </mimi-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonCardExample {}
