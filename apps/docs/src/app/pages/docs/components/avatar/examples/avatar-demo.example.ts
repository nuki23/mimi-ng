import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiAvatarImports } from '@/components/ui/avatar';

@Component({
  selector: 'app-avatar-demo-example',
  imports: [MimiAvatarImports],
  template: `
    <ul class="flex w-full max-w-xs flex-col gap-3 text-sm">
      <li class="flex items-center gap-3">
        <mimi-avatar>
          <img mimiAvatarImage src="/avatars/avatar-1.svg" alt="Lucía Pérez" />
          <mimi-avatar-fallback label="Lucía Pérez">LP</mimi-avatar-fallback>
        </mimi-avatar>
        <div class="flex flex-col">
          <span class="font-medium">Lucía Pérez</span>
          <span class="text-muted-foreground">Diseño</span>
        </div>
      </li>
      <li class="flex items-center gap-3">
        <!-- Sin foto: se ven las iniciales. -->
        <mimi-avatar>
          <mimi-avatar-fallback label="Jorge Ramos">JR</mimi-avatar-fallback>
        </mimi-avatar>
        <div class="flex flex-col">
          <span class="font-medium">Jorge Ramos</span>
          <span class="text-muted-foreground">Desarrollo</span>
        </div>
      </li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarDemoExample {}
