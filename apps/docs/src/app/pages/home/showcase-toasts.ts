import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';
import { injectMimiToast } from '@/components/ui/toast';
import type { MimiSize } from '@/components/ui/utils/size';

/** Vitrina de la landing: Toast en sus tres tamaños. */
@Component({
  selector: 'app-showcase-toasts',
  imports: [MimiCardImports, MimiButton],
  template: `
    <div mimiCard class="flex flex-col">
      <div mimiCardHeader>
        <h3 mimiCardTitle class="font-bold">Avisos</h3>
        <p mimiCardDescription>Toast en tres tamaños: pruébalos.</p>
      </div>
      <div mimiCardContent class="flex flex-wrap gap-2">
        @for (size of sizes; track size) {
          <button mimiBtn variant="outline" [size]="size" (click)="show(size)">
            Aviso {{ size }}
          </button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcaseToasts {
  private readonly toast = injectMimiToast();
  protected readonly sizes: MimiSize[] = ['sm', 'md', 'lg'];

  protected show(size: MimiSize): void {
    this.toast.success('Preferencias guardadas', {
      description: `Un aviso de tamaño ${size}.`,
      size,
    });
  }
}
