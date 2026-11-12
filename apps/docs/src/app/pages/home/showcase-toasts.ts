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
    <mimi-card>
      <mimi-card-header>
        <mimi-card-title class="font-bold">Avisos</mimi-card-title>
        <mimi-card-description>Toast en tres tamaños: pruébalos.</mimi-card-description>
      </mimi-card-header>
      <mimi-card-content class="flex flex-wrap gap-2">
        @for (size of sizes; track size) {
          <button mimiBtn variant="outline" [size]="size" (click)="show(size)">
            Aviso {{ size }}
          </button>
        }
      </mimi-card-content>
    </mimi-card>
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
