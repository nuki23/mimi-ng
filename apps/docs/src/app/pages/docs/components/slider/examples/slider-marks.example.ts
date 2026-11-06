import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { form, FormField, max, min } from '@angular/forms/signals';
import { MimiSlider, type MimiSliderMark } from '@/components/ui/slider';

@Component({
  selector: 'app-slider-marks-example',
  imports: [MimiSlider, FormField],
  template: `
    <div class="flex w-full max-w-md flex-col gap-3">
      <div class="flex justify-between text-sm">
        <span id="team" class="font-medium">Tamaño del equipo</span>
        <span class="text-muted-foreground tabular-nums">{{ people(data().team) }}</span>
      </div>
      <!-- Con [formField], los límites salen del esquema (min y max), no de [min] y [max]. -->
      <mimi-slider
        aria-labelledby="team"
        [marks]="marks"
        [format]="people"
        [formField]="plan.team"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderMarksExample {
  protected readonly data = signal({ team: 3 });
  protected readonly plan = form(this.data, (p) => {
    min(p.team, 1);
    max(p.team, 5);
  });
  protected readonly marks: MimiSliderMark[] = [1, 2, 3, 4, 5].map((v) => ({
    value: v,
    label: String(v),
  }));
  protected readonly people = (v: number) => `${v} ${v === 1 ? 'persona' : 'personas'}`;
}
