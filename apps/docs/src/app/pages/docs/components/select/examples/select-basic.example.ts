import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiOption, MimiSelect } from '@/components/ui/select';

@Component({
  selector: 'app-select-basic-example',
  imports: [MimiSelect],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="select-basic" class="text-sm font-medium">Zona horaria</label>
      <mimi-select
        id="select-basic"
        placeholder="Selecciona una zona"
        [(value)]="zone"
        [options]="zones"
      />
      <p class="font-mono text-[13px] text-muted-foreground">value: {{ zone() ?? 'null' }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectBasicExample {
  protected readonly zone = signal<string | null>(null);
  protected readonly zones: MimiOption<string>[] = [
    { label: 'Bogotá (UTC−5)', value: 'America/Bogota' },
    { label: 'Buenos Aires (UTC−3)', value: 'America/Argentina/Buenos_Aires' },
    { label: 'Ciudad de México (UTC−6)', value: 'America/Mexico_City' },
    { label: 'Lima (UTC−5)', value: 'America/Lima' },
    { label: 'Madrid (UTC+1)', value: 'Europe/Madrid' },
    { label: 'Santiago (UTC−4)', value: 'America/Santiago' },
  ];
}
