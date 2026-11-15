import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';

@Component({
  selector: 'app-card-custom-class-example',
  imports: [MimiCardImports, MimiButton],
  template: `
    <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <section mimiCard class="flex flex-col border-primary shadow-primary">
        <header mimiCardHeader>
          <h3 mimiCardTitle>Plan Equipo</h3>
          <p mimiCardDescription>El más elegido.</p>
        </header>
        <footer mimiCardFooter class="mt-auto">
          <button mimiBtn class="w-full">Elegir plan</button>
        </footer>
      </section>
      <section mimiCard class="flex flex-col bg-muted shadow-none">
        <header mimiCardHeader>
          <h3 mimiCardTitle>Plan Personal</h3>
          <p mimiCardDescription>Para una sola persona.</p>
        </header>
        <footer mimiCardFooter class="mt-auto">
          <button mimiBtn variant="outline" class="w-full">Elegir plan</button>
        </footer>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardCustomClassExample {}
