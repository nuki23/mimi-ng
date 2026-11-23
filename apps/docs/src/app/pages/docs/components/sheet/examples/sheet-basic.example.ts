import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiFormFieldImports } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { MimiSheetImports } from '@/components/ui/sheet';

@Component({
  selector: 'app-sheet-basic-example',
  imports: [MimiSheetImports, MimiButton, MimiInput, MimiFormFieldImports],
  template: `
    <mimi-sheet>
      <button mimiBtn variant="outline" mimiSheetTrigger>Editar cliente</button>
      <ng-template mimiSheetContent>
        <header mimiSheetHeader>
          <h2 mimiSheetTitle>Editar cliente</h2>
          <p mimiSheetDescription>Café Altura · CL-1003</p>
        </header>
        <div mimiSheetBody>
          <mimi-form-field label="Empresa">
            <input mimiInput value="Café Altura" />
          </mimi-form-field>
          <mimi-form-field label="Contacto">
            <input mimiInput value="Lucía Vera" />
          </mimi-form-field>
        </div>
        <footer mimiSheetFooter>
          <button mimiBtn variant="outline" mimiSheetClose>Cancelar</button>
          <button mimiBtn mimiSheetClose>Guardar</button>
        </footer>
      </ng-template>
    </mimi-sheet>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetBasicExample {}
