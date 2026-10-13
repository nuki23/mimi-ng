import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogImports } from '@/components/ui/dialog';

@Component({
  selector: 'app-dialog-long-content-example',
  imports: [MimiDialogImports, MimiButton],
  template: `
    <mimi-dialog>
      <button mimiBtn variant="outline" mimiDialogTrigger>Ver novedades</button>
      <ng-template mimiDialogContent>
        <mimi-dialog-header>
          <h2 mimiDialogTitle>Novedades</h2>
          <p mimiDialogDescription>Todo lo que cambió en las últimas versiones.</p>
        </mimi-dialog-header>
        <!-- El scroll queda en el cuerpo: el encabezado y el pie no se mueven. -->
        <mimi-dialog-body>
          @for (release of releases; track release.version) {
            <section class="flex flex-col gap-1">
              <h3 class="text-sm font-semibold">Versión {{ release.version }}</h3>
              <p class="text-sm text-pretty text-muted-foreground">{{ release.notes }}</p>
            </section>
          }
        </mimi-dialog-body>
        <mimi-dialog-footer>
          <button mimiBtn type="button" mimiDialogClose>Entendido</button>
        </mimi-dialog-footer>
      </ng-template>
    </mimi-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogLongContentExample {
  protected readonly releases = Array.from({ length: 14 }, (_, index) => ({
    version: `2.${14 - index}`,
    notes:
      'Mejoras de rendimiento en las listas largas, correcciones en la exportación a CSV y ' +
      'nuevos atajos de teclado para moverse entre proyectos sin usar el ratón.',
  }));
}
