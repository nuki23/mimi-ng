import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideMinus, LucidePlus } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { MimiProgress } from '@/components/ui/progress';

@Component({
  selector: 'app-progress-bar-example',
  imports: [MimiProgress, MimiButton, LucideMinus, LucidePlus],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-2">
      <!-- El texto de arriba es tuyo: el componente es solo la barra. -->
      <div class="flex justify-between text-[13.5px]">
        <span id="upload-label" class="font-medium">Subiendo informe.pdf</span>
        <span class="text-muted-foreground tabular-nums">{{ value() }}%</span>
      </div>
      <mimi-progress aria-labelledby="upload-label" [value]="value()" />
      <div class="mt-2 flex gap-2">
        <button mimiBtn variant="outline" size="icon" aria-label="Menos" (click)="step(-10)">
          <svg lucideMinus></svg>
        </button>
        <button mimiBtn variant="outline" size="icon" aria-label="Más" (click)="step(10)">
          <svg lucidePlus></svg>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarExample {
  protected readonly value = signal(64);

  protected step(delta: number): void {
    this.value.update((v) => Math.min(100, Math.max(0, v + delta)));
  }
}
