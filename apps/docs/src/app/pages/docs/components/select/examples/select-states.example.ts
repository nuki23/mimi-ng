import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiOption, MimiSelect } from '@/components/ui/select';

@Component({
  selector: 'app-select-states-example',
  imports: [MimiSelect],
  template: `
    <div class="grid w-full gap-4 sm:grid-cols-2">
      <mimi-select aria-label="Con botón limpiar" clearable [(value)]="first" [options]="sizes" />
      <mimi-select aria-label="Deshabilitado" disabled [(value)]="second" [options]="sizes" />
      <mimi-select aria-label="Cargando" placeholder="Cargando…" loading [options]="[]" />
      <!-- Con un formulario, invalid y touched los pasa Angular (ver «Formularios»). -->
      <mimi-select
        aria-label="Con error"
        placeholder="Selecciona un tamaño"
        invalid
        touched
        [(value)]="third"
        [options]="sizes"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectStatesExample {
  protected readonly first = signal<string | null>('m');
  protected readonly second = signal<string | null>('l');
  protected readonly third = signal<string | null>(null);
  protected readonly sizes: MimiOption<string>[] = [
    { label: 'Pequeño', value: 's' },
    { label: 'Mediano', value: 'm' },
    { label: 'Grande', value: 'l' },
  ];
}
