import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiToast } from '@/components/ui/toast';
import type { MimiSize } from '@/components/ui/utils/size';

@Component({
  selector: 'app-toast-sizes-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-wrap justify-center gap-2">
      @for (size of sizes; track size) {
        <button mimiBtn variant="outline" [size]="size" (click)="show(size)">
          Aviso {{ size }}
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastSizesExample {
  private readonly toast = injectMimiToast();
  protected readonly sizes: MimiSize[] = ['sm', 'md', 'lg'];

  protected show(size: MimiSize): void {
    this.toast.success(`Aviso ${size}`, { description: 'Pedido #1042 enviado.', size });
  }
}
