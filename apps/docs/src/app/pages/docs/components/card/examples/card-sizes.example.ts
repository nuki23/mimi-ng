import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';

@Component({
  selector: 'app-card-sizes-example',
  imports: [MimiCardImports, MimiButton],
  template: `
    <div class="grid w-full gap-4 md:grid-cols-3">
      @for (size of sizes; track size) {
        <section mimiCard [size]="size">
          <header mimiCardHeader>
            <h3 mimiCardTitle>Tamaño {{ size }}</h3>
            <p mimiCardDescription>El relleno y los controles de dentro.</p>
          </header>
          <footer mimiCardFooter>
            <button mimiBtn>Abrir</button>
          </footer>
        </section>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSizesExample {
  protected readonly sizes = ['sm', 'md', 'lg'] as const;
}
