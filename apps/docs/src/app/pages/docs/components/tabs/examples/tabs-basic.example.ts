import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiTabsImports } from '@/components/ui/tabs';

@Component({
  selector: 'app-tabs-basic-example',
  imports: [MimiTabsImports],
  template: `
    <div class="w-full">
      <mimi-tabs [(value)]="section" aria-label="Secciones de la cuenta">
        <ng-template mimiTab="account" label="Cuenta">
          <p class="text-sm text-muted-foreground">Nombre, correo y foto de perfil.</p>
        </ng-template>
        <ng-template mimiTab="security" label="Seguridad">
          <p class="text-sm text-muted-foreground">
            Contraseña, verificación en dos pasos y sesiones activas.
          </p>
        </ng-template>
        <ng-template mimiTab="notifications" label="Notificaciones" [count]="3">
          <p class="text-sm text-muted-foreground">Tienes 3 avisos sin leer de este proyecto.</p>
        </ng-template>
        <ng-template mimiTab="billing" label="Facturación">
          <p class="text-sm text-muted-foreground">
            Plan Equipo · próxima factura el 1 de noviembre.
          </p>
        </ng-template>
      </mimi-tabs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsBasicExample {
  protected readonly section = signal('account');
}
