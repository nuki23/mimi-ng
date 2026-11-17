import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiBadge } from '@/components/ui/badge';
import type { BadgeTone, BadgeVariant } from '@/components/ui/badge';

@Component({
  selector: 'app-badge-matrix-example',
  imports: [MimiBadge],
  template: `
    <div class="w-full overflow-x-auto">
      <div class="grid w-max grid-cols-[auto_repeat(6,max-content)] items-center gap-3">
        <span></span>
        @for (tone of tones; track tone) {
          <span class="text-xs text-muted-foreground">{{ tone }}</span>
        }
        @for (variant of variants; track variant) {
          <span class="text-xs text-muted-foreground">{{ variant }}</span>
          @for (tone of tones; track tone) {
            <span mimiBadge [variant]="variant" [tone]="tone">Estado</span>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeMatrixExample {
  protected readonly variants: BadgeVariant[] = ['solid', 'soft', 'outline'];
  protected readonly tones: BadgeTone[] = [
    'primary',
    'secondary',
    'success',
    'warning',
    'info',
    'danger',
  ];
}
