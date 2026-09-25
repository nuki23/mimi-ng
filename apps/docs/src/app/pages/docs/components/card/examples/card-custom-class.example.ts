import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';

@Component({
  selector: 'app-card-custom-class-example',
  imports: [MimiCardImports, MimiButton],
  template: `
    <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <mimi-card class="border-primary shadow-primary">
        <mimi-card-header>
          <mimi-card-title>Plan Equipo</mimi-card-title>
          <mimi-card-description>El más elegido.</mimi-card-description>
        </mimi-card-header>
        <mimi-card-footer class="mt-auto">
          <button mimiBtn class="w-full">Elegir plan</button>
        </mimi-card-footer>
      </mimi-card>
      <mimi-card class="bg-muted shadow-none">
        <mimi-card-header>
          <mimi-card-title>Plan Personal</mimi-card-title>
          <mimi-card-description>Para una sola persona.</mimi-card-description>
        </mimi-card-header>
        <mimi-card-footer class="mt-auto">
          <button mimiBtn variant="outline" class="w-full">Elegir plan</button>
        </mimi-card-footer>
      </mimi-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCustomClassExample {}
