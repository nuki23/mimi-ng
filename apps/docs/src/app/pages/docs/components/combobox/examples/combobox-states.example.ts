import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiComboboxImports } from '@/components/ui/combobox';

@Component({
  selector: 'app-combobox-states-example',
  imports: [MimiComboboxImports],
  template: `
    <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      <mimi-combobox aria-label="Con botón limpiar" clearable [(value)]="first">
        @for (l of languages; track l.id) {
          <mimi-option [value]="l.id">{{ l.name }}</mimi-option>
        }
      </mimi-combobox>
      <mimi-combobox aria-label="Deshabilitado" disabled [(value)]="second">
        @for (l of languages; track l.id) {
          <mimi-option [value]="l.id">{{ l.name }}</mimi-option>
        }
      </mimi-combobox>
      <!-- Solo lectura: se lee y se enfoca, pero no se escribe ni se abre. -->
      <mimi-combobox aria-label="Solo lectura" readonly [(value)]="second">
        @for (l of languages; track l.id) {
          <mimi-option [value]="l.id">{{ l.name }}</mimi-option>
        }
      </mimi-combobox>
      <mimi-combobox aria-label="Cargando" placeholder="Cargando…" loading />
      <!-- Con un formulario, invalid y touched los pasa Angular (ver «Formularios»). -->
      <mimi-combobox
        aria-label="Con error"
        placeholder="Elige uno"
        invalid
        touched
        [(value)]="third"
      >
        @for (l of languages; track l.id) {
          <mimi-option [value]="l.id">{{ l.name }}</mimi-option>
        }
      </mimi-combobox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxStatesExample {
  protected readonly first = signal<string | null>('ts');
  protected readonly second = signal<string | null>('py');
  protected readonly third = signal<string | null>(null);
  protected readonly languages = [
    { id: 'ts', name: 'TypeScript' },
    { id: 'py', name: 'Python' },
    { id: 'go', name: 'Go' },
  ];
}
