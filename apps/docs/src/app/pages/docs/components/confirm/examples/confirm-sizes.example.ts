import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiConfirm } from '@/components/ui/confirm';
import type { MimiSize } from '@/components/ui/utils/size';

@Component({
  selector: 'app-confirm-sizes-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-wrap items-center justify-center gap-3">
      @for (size of sizes; track size) {
        <button mimiBtn variant="outline" (click)="ask(size)">{{ size }}</button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmSizesExample {
  private readonly confirm = injectMimiConfirm();
  protected readonly sizes: MimiSize[] = ['sm', 'md', 'lg'];

  protected ask(size: MimiSize): void {
    void this.confirm({
      title: '¿Publicar los cambios?',
      description: 'Los verá todo el equipo.',
      size,
    });
  }
}
