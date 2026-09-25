import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSkeleton } from '@/components/ui/skeleton';

@Component({
  selector: 'app-skeleton-shapes-example',
  imports: [MimiSkeleton],
  template: `
    <div class="flex flex-wrap items-center gap-6">
      <mimi-skeleton class="h-3 w-40" />
      <mimi-skeleton class="size-12 rounded-full" />
      <mimi-skeleton class="h-(--mimi-control-height) w-[110px] rounded-lg" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonShapesExample {}
