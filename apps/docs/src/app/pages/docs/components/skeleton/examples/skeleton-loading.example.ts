import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiSkeleton } from '@/components/ui/skeleton';

@Component({
  selector: 'app-skeleton-loading-example',
  imports: [MimiButton, MimiSkeleton],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-4">
      <div [attr.aria-busy]="loading()" aria-live="polite" class="flex items-center gap-3">
        @if (loading()) {
          <span class="sr-only">Cargando…</span>
          <mimi-skeleton class="size-10 rounded-full" />
          <div class="flex flex-1 flex-col gap-2">
            <mimi-skeleton class="h-3.5 w-1/2" />
            <mimi-skeleton class="h-3 w-3/4" />
          </div>
        } @else {
          <span
            class="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground"
          >
            AT
          </span>
          <div class="flex flex-col">
            <span class="text-sm font-semibold">Ana Torres</span>
            <span class="text-sm text-muted-foreground">ana&#64;correo.com</span>
          </div>
        }
      </div>
      <button mimiBtn variant="outline" class="self-start" (click)="reload()">Recargar</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoadingExample {
  protected readonly loading = signal(false);

  protected reload(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1500);
  }
}
