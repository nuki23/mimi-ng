import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiAvatarImports } from '@/components/ui/avatar';

@Component({
  selector: 'app-avatar-custom-class-example',
  imports: [MimiAvatarImports],
  template: `
    <div class="flex -space-x-2">
      <mimi-avatar class="ring-2 ring-background">
        <img mimiAvatarImage src="/avatars/avatar-1.png" alt="Lucía Pérez" />
        <mimi-avatar-fallback label="Lucía Pérez">LP</mimi-avatar-fallback>
      </mimi-avatar>
      <mimi-avatar class="ring-2 ring-background">
        <img mimiAvatarImage src="/avatars/avatar-2.png" alt="Diego Ruiz" />
        <mimi-avatar-fallback label="Diego Ruiz">DR</mimi-avatar-fallback>
      </mimi-avatar>
      <mimi-avatar class="ring-2 ring-background">
        <img mimiAvatarImage src="/avatars/avatar-3.png" alt="Marta Gómez" />
        <mimi-avatar-fallback label="Marta Gómez">MG</mimi-avatar-fallback>
      </mimi-avatar>
      <mimi-avatar class="ring-2 ring-background">
        <mimi-avatar-fallback label="3 personas más" class="bg-muted text-muted-foreground">
          +3
        </mimi-avatar-fallback>
      </mimi-avatar>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarCustomClassExample {}
