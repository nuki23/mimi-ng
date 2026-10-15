import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiInput } from '@/components/ui/input';
import { MimiTabsImports } from '@/components/ui/tabs';

@Component({
  selector: 'app-tabs-preserve-example',
  imports: [MimiTabsImports, MimiInput],
  template: `
    <!-- preserveContent: lo escrito sigue ahí al volver a la pestaña. -->
    <div class="w-full">
      <mimi-tabs aria-label="Borrador" preserveContent>
        <ng-template mimiTab="draft" label="Borrador">
          <input mimiInput aria-label="Título" placeholder="Escribe un título…" />
        </ng-template>
        <ng-template mimiTab="preview" label="Vista previa">
          <p class="text-sm text-muted-foreground">Vuelve a «Borrador»: el texto se conserva.</p>
        </ng-template>
      </mimi-tabs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsPreserveExample {}
