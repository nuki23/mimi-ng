import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCardImports } from '@/components/ui/card';

@Component({
  selector: 'app-card-variants-example',
  imports: [MimiCardImports],
  template: `
    <div class="grid w-full gap-4 sm:grid-cols-2">
      @for (variant of variants; track variant) {
        <section mimiCard [variant]="variant">
          <div mimiCardContent>
            <h3 mimiCardTitle class="text-base">{{ variant }}</h3>
            <p mimiCardDescription>{{ texts[variant] }}</p>
          </div>
        </section>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardVariantsExample {
  protected readonly variants = ['outline', 'elevated', 'flat', 'ghost'] as const;
  protected readonly texts = {
    outline: 'Borde y sombra suave. La de siempre.',
    elevated: 'Sin borde, con la sombra de los paneles.',
    flat: 'Fondo atenuado, sin borde ni sombra.',
    ghost: 'Sin fondo: solo el radio y el relleno.',
  };
}
