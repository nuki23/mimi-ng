import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

@Component({
  selector: 'app-select-option-template-example',
  imports: [MimiSelectImports],
  template: `
    <div class="flex w-full max-w-[360px] flex-col gap-1.5">
      <label for="select-option-template" class="text-sm font-medium">Moneda</label>
      <mimi-select
        id="select-option-template"
        placeholder="Selecciona una moneda"
        search
        searchPlaceholder="Buscar moneda…"
        [(value)]="currency"
      >
        @for (c of currencies; track c.code) {
          <mimi-option [value]="c.code">{{ c.name }}</mimi-option>
        }
        <!-- Contenido propio de cada opción: en la lista y, con trigger, en el disparador. -->
        <ng-template mimiSelectOption let-option let-query="query" let-trigger="trigger">
          <span
            [class]="
              trigger
                ? 'rounded-[5px] bg-muted px-[5px] py-px font-mono text-[11px] font-semibold text-muted-foreground'
                : 'w-[30px] font-mono text-[11px] font-semibold text-muted-foreground'
            "
            >{{ option.value }}</span
          >
          <mimi-select-highlight [text]="option.label" [query]="query" />
        </ng-template>
      </mimi-select>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectOptionTemplateExample {
  protected readonly currency = signal<string | null>('COP');
  protected readonly currencies = [
    { code: 'ARS', name: 'Peso argentino' },
    { code: 'COP', name: 'Peso colombiano' },
    { code: 'EUR', name: 'Euro' },
    { code: 'MXN', name: 'Peso mexicano' },
    { code: 'USD', name: 'Dólar estadounidense' },
  ];
}
