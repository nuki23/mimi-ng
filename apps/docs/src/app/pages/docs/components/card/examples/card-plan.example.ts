import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';

@Component({
  selector: 'app-card-plan-example',
  imports: [MimiCardImports, MimiButton],
  template: `
    <section mimiCard class="w-full max-w-sm">
      <header mimiCardHeader>
        <h3 mimiCardTitle>Plan Equipo</h3>
        <p mimiCardDescription>Para equipos de hasta 10 personas.</p>
      </header>
      <div mimiCardContent class="flex items-baseline gap-1.5">
        <span class="text-[32px] font-bold tracking-[-0.02em]">$12</span>
        <span class="text-sm text-muted-foreground">por persona / mes</span>
      </div>
      <footer mimiCardFooter>
        <button mimiBtn variant="ghost">Detalles</button>
        <button mimiBtn>Elegir plan</button>
      </footer>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPlanExample {}
