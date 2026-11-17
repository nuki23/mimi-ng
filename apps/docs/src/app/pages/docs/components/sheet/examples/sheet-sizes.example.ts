import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiSheetImports } from '@/components/ui/sheet';
import type { MimiSize } from '@/components/ui/utils/size';

@Component({
  selector: 'app-sheet-sizes-example',
  imports: [MimiSheetImports, MimiButton],
  template: `
    <div class="flex flex-wrap gap-2">
      @for (size of sizes; track size) {
        <mimi-sheet [size]="size">
          <button mimiBtn variant="outline" mimiSheetTrigger>size="{{ size }}"</button>
          <ng-template mimiSheetContent>
            <header mimiSheetHeader>
              <h2 mimiSheetTitle>Tamaño {{ size }}</h2>
              <p mimiSheetDescription>
                {{ widths[size] }} de ancho, o menos en una pantalla chica.
              </p>
            </header>
          </ng-template>
        </mimi-sheet>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetSizesExample {
  protected readonly sizes: MimiSize[] = ['sm', 'md', 'lg'];
  protected readonly widths: Record<MimiSize, string> = {
    sm: '320 px',
    md: '384 px',
    lg: '512 px',
  };
}
