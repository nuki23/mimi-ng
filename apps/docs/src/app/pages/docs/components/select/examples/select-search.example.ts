import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiSelectImports } from '@/components/ui/select';

interface Country {
  code: string;
  name: string;
  /** Sin cobertura: se ve, pero no se elige. */
  off?: boolean;
}

@Component({
  selector: 'app-select-search-example',
  imports: [MimiSelectImports],
  template: `
    <div class="flex w-full max-w-[360px] flex-col gap-1.5">
      <label for="select-search" class="text-sm font-medium">País de envío</label>
      <mimi-select
        id="select-search"
        placeholder="Selecciona un país"
        search
        searchPlaceholder="Buscar país…"
        clearable
        [(value)]="country"
      >
        <mimi-optgroup label="Latinoamérica y España">
          @for (c of countries(); track c.code) {
            <mimi-option
              [value]="c.code"
              [disabled]="!!c.off"
              [hint]="c.off ? 'Sin cobertura' : undefined"
              >{{ c.name }}</mimi-option
            >
          }
        </mimi-optgroup>
        <!-- Contenido propio de cada opción: en la lista y, con trigger, en el disparador. -->
        <ng-template mimiSelectOption let-option let-query="query" let-trigger="trigger">
          <span
            [class]="
              trigger
                ? 'rounded-[5px] bg-muted px-[5px] py-px font-mono text-[11px] font-semibold text-muted-foreground'
                : 'w-[22px] font-mono text-[11px] font-semibold text-muted-foreground'
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
export class SelectSearchExample {
  protected readonly country = signal<string | null>('MX');
  protected readonly countries = signal<Country[]>([
    { code: 'AR', name: 'Argentina' },
    { code: 'BR', name: 'Brasil' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'ES', name: 'España' },
    { code: 'MX', name: 'México' },
    { code: 'PE', name: 'Perú', off: true },
    { code: 'UY', name: 'Uruguay' },
  ]);
}
