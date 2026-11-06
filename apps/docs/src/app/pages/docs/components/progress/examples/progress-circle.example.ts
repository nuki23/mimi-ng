import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiProgress } from '@/components/ui/progress';

@Component({
  selector: 'app-progress-circle-example',
  imports: [MimiProgress],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-7">
      <figure class="flex flex-col items-center gap-2">
        <mimi-progress aria-label="Determinado" shape="circle" [value]="64" />
        <figcaption class="text-xs text-muted-foreground">Determinado</figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-2">
        <mimi-progress aria-label="Success" shape="circle" tone="success" [value]="100" />
        <figcaption class="text-xs text-muted-foreground">Success</figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-2">
        <mimi-progress aria-label="Warning" shape="circle" tone="warning" [value]="72" />
        <figcaption class="text-xs text-muted-foreground">Warning</figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-2">
        <mimi-progress aria-label="Pequeño" shape="circle" size="sm" tone="info" [value]="40" />
        <figcaption class="text-xs text-muted-foreground">Pequeño</figcaption>
      </figure>
      <figure class="flex flex-col items-center gap-2">
        <mimi-progress aria-label="Indeterminado" shape="circle" size="sm" />
        <figcaption class="text-xs text-muted-foreground">Indeterminado</figcaption>
      </figure>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressCircleExample {}
