import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiComboboxImports } from '@/components/ui/combobox';
import { MimiHighlight, type MimiListOption } from '@/components/ui/option-list';

interface Person {
  name: string;
  email: string;
}

@Component({
  selector: 'app-combobox-custom-example',
  imports: [MimiComboboxImports, MimiHighlight],
  template: `
    <div class="flex w-full max-w-sm flex-col gap-1.5">
      <label for="person" class="text-sm font-medium">Responsable</label>
      <!-- class va a la caja del campo; panelClass, al panel. -->
      <mimi-combobox
        id="person"
        placeholder="Busca por nombre o correo"
        class="rounded-full"
        panelClass="rounded-2xl"
        compareWith="email"
        [filterWith]="byNameOrEmail"
        [(value)]="person"
      >
        <!-- Los valores son objetos: compareWith="email" los compara por su correo. -->
        @for (p of people(); track p.email) {
          <mimi-option [value]="p">{{ p.name }}</mimi-option>
        }
        <ng-template mimiComboboxOption let-option let-query="query">
          <span class="flex min-w-0 flex-col py-1">
            <mimi-highlight [text]="option.label" [query]="query" />
            <span class="truncate text-xs text-muted-foreground">{{ emailOf(option) }}</span>
          </span>
        </ng-template>
      </mimi-combobox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxCustomExample {
  // Otro objeto con el mismo correo (por ejemplo, el que vino guardado): compareWith lo reconoce.
  protected readonly person = signal<Person | null>({ name: 'Sol Díaz', email: 'sol@ejemplo.com' });
  protected readonly people = signal<Person[]>([
    { name: 'Ana Ruiz', email: 'ana@ejemplo.com' },
    { name: 'Luis Pérez', email: 'luis@ejemplo.com' },
    { name: 'Sol Díaz', email: 'sol@ejemplo.com' },
  ]);

  /** La plantilla recibe la opción sin su tipo: se lee con una función tipada. */
  protected emailOf(option: MimiListOption): string {
    return (option.value as Person).email;
  }

  /** Filtro propio: busca también en el correo. */
  protected readonly byNameOrEmail = (option: MimiListOption<Person>, query: string) =>
    `${option.label} ${option.value.email}`.toLowerCase().includes(query.toLowerCase());
}
