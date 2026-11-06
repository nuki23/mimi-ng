import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiProgress, type MimiProgressTone } from '@/components/ui/progress';

@Component({
  selector: 'app-progress-tones-example',
  imports: [MimiProgress],
  template: `
    <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      @for (bar of bars; track bar.label) {
        <div class="flex flex-col gap-1.5">
          <div class="flex justify-between text-[12.5px]">
            <span class="font-medium">{{ bar.label }}</span>
            <span class="tabular-nums" [class]="bar.text">{{ bar.value }}%</span>
          </div>
          <!-- 6px de alto con class, como el diseño. -->
          <mimi-progress
            class="h-1.5"
            [aria-label]="bar.label"
            [tone]="bar.tone"
            [value]="bar.value"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressTonesExample {
  protected readonly bars: {
    label: string;
    value: number;
    tone: MimiProgressTone;
    text: string;
  }[] = [
    { label: 'Almacenamiento', value: 82, tone: 'warning', text: 'text-warning-soft-foreground' },
    {
      label: 'Objetivo de ventas',
      value: 100,
      tone: 'success',
      text: 'text-success-soft-foreground',
    },
    { label: 'Migración', value: 45, tone: 'info', text: 'text-info-soft-foreground' },
    {
      label: 'Errores permitidos',
      value: 96,
      tone: 'danger',
      text: 'text-destructive-soft-foreground',
    },
  ];
}
