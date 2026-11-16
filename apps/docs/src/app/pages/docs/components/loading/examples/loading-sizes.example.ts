import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiBlock } from '@/components/ui/loading';

@Component({
  selector: 'app-loading-sizes-example',
  imports: [MimiBlock, MimiButton],
  template: `
    <div class="flex w-full flex-col gap-3">
      <div class="grid gap-3 sm:grid-cols-3">
        @for (size of sizes; track size) {
          <div
            class="flex h-32 items-center justify-center rounded-[var(--mimi-radius-card)] border border-border text-sm text-muted-foreground"
            [mimiBlock]="on()"
            [mimiBlockSize]="size"
            [mimiBlockMessage]="'Tamaño ' + size"
            [mimiBlockDelay]="0"
          >
            Contenido {{ size }}
          </div>
        }
      </div>
      <button mimiBtn variant="outline" class="self-start" (click)="on.set(!on())">
        {{ on() ? 'Quitar la carga' : 'Mostrar la carga' }}
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSizesExample {
  protected readonly sizes = ['sm', 'md', 'lg'] as const;
  protected readonly on = signal(false);
}
