import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

@Component({
  selector: 'app-select-states-example',
  imports: [MimiSelectImports],
  template: `
    <div class="grid w-full gap-4 sm:grid-cols-2">
      <mimi-select aria-label="Con botón limpiar" clearable [(value)]="first">
        @for (size of sizes; track size.value) {
          <mimi-option [value]="size.value">{{ size.label }}</mimi-option>
        }
      </mimi-select>
      <mimi-select aria-label="Deshabilitado" disabled [(value)]="second">
        @for (size of sizes; track size.value) {
          <mimi-option [value]="size.value">{{ size.label }}</mimi-option>
        }
      </mimi-select>
      <!-- Mientras carga, el panel muestra el estado de carga en vez de las opciones. -->
      <mimi-select aria-label="Cargando" placeholder="Cargando…" loading />
      <!-- Con un formulario, invalid y touched los pasa Angular (ver «Formularios»). -->
      <mimi-select
        aria-label="Con error"
        placeholder="Selecciona un tamaño"
        invalid
        touched
        [(value)]="third"
      >
        @for (size of sizes; track size.value) {
          <mimi-option [value]="size.value">{{ size.label }}</mimi-option>
        }
      </mimi-select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectStatesExample {
  protected readonly first = signal<string | null>('m');
  protected readonly second = signal<string | null>('l');
  protected readonly third = signal<string | null>(null);
  protected readonly sizes = [
    { label: 'Pequeño', value: 's' },
    { label: 'Mediano', value: 'm' },
    { label: 'Grande', value: 'l' },
  ];
}
