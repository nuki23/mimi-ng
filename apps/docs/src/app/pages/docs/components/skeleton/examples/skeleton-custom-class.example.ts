import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiSkeleton } from '@/components/ui/skeleton';

@Component({
  selector: 'app-skeleton-custom-class-example',
  imports: [MimiSkeleton],
  template: `
    <div aria-busy="true" class="flex w-full max-w-md flex-col gap-3">
      <span class="sr-only">Cargando…</span>
      <mimi-skeleton class="h-32 w-full rounded-card" />
      <mimi-skeleton class="h-4 w-1/2" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonCustomClassExample {}
