import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiAvatarImports } from '@/components/ui/avatar';

@Component({
  selector: 'app-avatar-fallback-example',
  imports: [MimiAvatarImports],
  template: `
    <div class="flex items-center gap-3">
      <mimi-avatar>
        <!-- Una imagen que no se puede leer: dispara el mismo error que una que no existe. -->
        <img mimiAvatarImage src="data:text/plain,no-es-una-imagen" alt="Ana Torres" />
        <mimi-avatar-fallback label="Ana Torres">AT</mimi-avatar-fallback>
      </mimi-avatar>
      <span class="text-sm text-muted-foreground">La imagen falla: se ven las iniciales.</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarFallbackExample {}
