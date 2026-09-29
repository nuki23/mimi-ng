import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiAvatarImports } from '@/components/ui/avatar';

@Component({
  selector: 'app-avatar-fallback-example',
  imports: [MimiAvatarImports],
  template: `
    <div class="flex items-center gap-3">
      <mimi-avatar>
        <img mimiAvatarImage src="/avatars/no-existe.png" alt="Ana Torres" />
        <mimi-avatar-fallback label="Ana Torres">AT</mimi-avatar-fallback>
      </mimi-avatar>
      <span class="text-sm text-muted-foreground">La imagen no existe: se ven las iniciales.</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarFallbackExample {}
