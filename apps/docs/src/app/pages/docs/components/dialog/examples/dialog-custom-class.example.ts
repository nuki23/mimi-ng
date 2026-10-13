import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogImports } from '@/components/ui/dialog';

@Component({
  selector: 'app-dialog-custom-class-example',
  imports: [MimiDialogImports, MimiButton],
  template: `
    <!-- class va al panel. width y maxWidth aceptan cualquier valor CSS. -->
    <mimi-dialog width="640px" class="rounded-[var(--mimi-radius)]">
      <button mimiBtn variant="outline" mimiDialogTrigger>Abrir uno más ancho</button>
      <ng-template mimiDialogContent>
        <mimi-dialog-header>
          <h2 mimiDialogTitle>Comparar planes</h2>
          <p mimiDialogDescription>640px de ancho, sin pasarse de la pantalla.</p>
        </mimi-dialog-header>
        <mimi-dialog-body class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          @for (plan of plans; track plan.name) {
            <div class="flex flex-col gap-1 rounded-[var(--mimi-radius)] border p-3">
              <span class="text-sm font-semibold">{{ plan.name }}</span>
              <span class="text-sm text-muted-foreground">{{ plan.detail }}</span>
            </div>
          }
        </mimi-dialog-body>
        <mimi-dialog-footer class="justify-between">
          <button mimiBtn type="button" variant="ghost" mimiDialogClose>Más tarde</button>
          <button mimiBtn type="button" mimiDialogClose>Elegir plan</button>
        </mimi-dialog-footer>
      </ng-template>
    </mimi-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogCustomClassExample {
  protected readonly plans = [
    { name: 'Gratis', detail: '1 proyecto' },
    { name: 'Pro', detail: '10 proyectos' },
    { name: 'Equipo', detail: 'Sin límite' },
  ];
}
