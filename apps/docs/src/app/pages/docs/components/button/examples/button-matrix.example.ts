import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import type { ButtonTone, ButtonVariant } from '@/components/ui/button';

@Component({
  selector: 'app-button-matrix-example',
  imports: [MimiButton],
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
            <button mimiBtn size="sm" [variant]="variant" [tone]="tone">Acción</button>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonMatrixExample {
  protected readonly variants: ButtonVariant[] = ['solid', 'soft', 'outline', 'ghost', 'link'];
  protected readonly tones: ButtonTone[] = [
    'primary',
    'secondary',
    'success',
    'warning',
    'info',
    'danger',
  ];
}
