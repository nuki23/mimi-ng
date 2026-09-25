import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';

@Component({
  selector: 'app-card-plan-example',
  imports: [MimiCardImports, MimiButton],
  template: `
    <mimi-card class="w-full max-w-sm">
      <mimi-card-header>
        <mimi-card-title>Plan Equipo</mimi-card-title>
        <mimi-card-description>Para equipos de hasta 10 personas.</mimi-card-description>
      </mimi-card-header>
      <mimi-card-content class="flex items-baseline gap-1.5">
        <span class="text-[32px] font-bold tracking-[-0.02em]">$12</span>
        <span class="text-sm text-muted-foreground">por persona / mes</span>
      </mimi-card-content>
      <mimi-card-footer>
        <button mimiBtn variant="ghost">Detalles</button>
        <button mimiBtn>Elegir plan</button>
      </mimi-card-footer>
    </mimi-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPlanExample {}
