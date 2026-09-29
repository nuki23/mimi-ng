import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiSwitch } from '@/components/ui/switch';

@Component({
  selector: 'app-switch-labels-example',
  imports: [MimiCheckbox, MimiSwitch],
  template: `
    <div class="flex flex-col gap-5">
      <!-- El texto de adentro es la etiqueta: al hacer clic en él, se alterna. -->
      <div class="flex flex-wrap gap-8">
        <mimi-switch [checked]="true">Modo avión</mimi-switch>
        <mimi-checkbox [checked]="true">Recordarme</mimi-checkbox>
        <mimi-checkbox>Enviarme novedades</mimi-checkbox>
      </div>

      <!-- Sin texto: aria-label, o un <label for> con el id del control. -->
      <div class="flex items-center gap-8 text-sm">
        <mimi-switch aria-label="Wifi" />
        <div class="flex items-center gap-2.5">
          <label for="bluetooth" class="text-muted-foreground">Bluetooth</label>
          <mimi-switch id="bluetooth" />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchLabelsExample {}
