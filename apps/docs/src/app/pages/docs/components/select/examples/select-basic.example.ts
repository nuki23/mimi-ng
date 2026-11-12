import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

@Component({
  selector: 'app-select-basic-example',
  imports: [MimiSelectImports],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="select-basic" class="text-sm font-medium">Zona horaria</label>
      <mimi-select id="select-basic" placeholder="Selecciona una zona" [(value)]="zone">
        <mimi-option value="America/Bogota">Bogotá (UTC−5)</mimi-option>
        <mimi-option value="America/Argentina/Buenos_Aires">Buenos Aires (UTC−3)</mimi-option>
        <mimi-option value="America/Mexico_City">Ciudad de México (UTC−6)</mimi-option>
        <mimi-option value="America/Lima">Lima (UTC−5)</mimi-option>
        <mimi-option value="Europe/Madrid">Madrid (UTC+1)</mimi-option>
        <mimi-option value="America/Santiago">Santiago (UTC−4)</mimi-option>
      </mimi-select>
      <p class="font-mono text-[13px] text-muted-foreground">value: {{ zone() ?? 'null' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectBasicExample {
  protected readonly zone = signal<string | null>(null);
}
