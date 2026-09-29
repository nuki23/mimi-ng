import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiAvatarImports } from '@/components/ui/avatar';
import { MimiSeparator } from '@/components/ui/separator';

@Component({
  selector: 'app-avatar-sizes-example',
  imports: [MimiAvatarImports, MimiSeparator],
  template: `
    <div class="flex h-14 items-center gap-3">
      <mimi-avatar size="sm">
        <img mimiAvatarImage src="/avatars/avatar-1.png" alt="Lucía Pérez" />
        <mimi-avatar-fallback label="Lucía Pérez">LP</mimi-avatar-fallback>
      </mimi-avatar>
      <mimi-avatar>
        <img mimiAvatarImage src="/avatars/avatar-2.png" alt="Diego Ruiz" />
        <mimi-avatar-fallback label="Diego Ruiz">DR</mimi-avatar-fallback>
      </mimi-avatar>
      <mimi-avatar size="lg">
        <img mimiAvatarImage src="/avatars/avatar-3.png" alt="Marta Gómez" />
        <mimi-avatar-fallback label="Marta Gómez">MG</mimi-avatar-fallback>
      </mimi-avatar>

      <mimi-separator orientation="vertical" class="my-3" />

      <mimi-avatar size="sm">
        <mimi-avatar-fallback label="Ana Torres">AT</mimi-avatar-fallback>
      </mimi-avatar>
      <mimi-avatar>
        <mimi-avatar-fallback label="Jorge Ramos">JR</mimi-avatar-fallback>
      </mimi-avatar>
      <mimi-avatar size="lg">
        <mimi-avatar-fallback label="Marta Gómez">MG</mimi-avatar-fallback>
      </mimi-avatar>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarSizesExample {}
