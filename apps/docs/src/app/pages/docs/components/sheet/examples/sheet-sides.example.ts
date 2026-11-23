import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiSheetImports, type MimiSheetSide } from '@/components/ui/sheet';

@Component({
  selector: 'app-sheet-sides-example',
  imports: [MimiSheetImports, MimiButton],
  template: `
    <div class="flex flex-wrap gap-2">
      @for (side of sides; track side.value) {
        <mimi-sheet [side]="side.value">
          <button mimiBtn variant="outline" mimiSheetTrigger>{{ side.label }}</button>
          <ng-template mimiSheetContent>
            <header mimiSheetHeader>
              <h2 mimiSheetTitle>Desde {{ side.label.toLowerCase() }}</h2>
              <p mimiSheetDescription>{{ side.hint }}</p>
            </header>
            <nav mimiSheetBody aria-label="Secciones">
              @for (item of items; track item) {
                <a mimiBtn variant="ghost" class="justify-start" href="#" mimiSheetClose>{{
                  item
                }}</a>
              }
            </nav>
          </ng-template>
        </mimi-sheet>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetSidesExample {
  protected readonly sides: { value: MimiSheetSide; label: string; hint: string }[] = [
    { value: 'left', label: 'Izquierda', hint: 'Un menú de navegación.' },
    { value: 'right', label: 'Derecha', hint: 'El lado por defecto.' },
    { value: 'bottom', label: 'Abajo', hint: 'Arrastra la barra hacia abajo para cerrar.' },
  ];
  protected readonly items = ['Resumen', 'Clientes', 'Facturas', 'Ajustes'];
}
