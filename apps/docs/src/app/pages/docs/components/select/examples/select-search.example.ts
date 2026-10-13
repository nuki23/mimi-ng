import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiOptionGroup, MimiSelectImports } from '@/components/ui/select';

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
        [options]="countries"
      >
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
  protected readonly countries: MimiOptionGroup<string>[] = [
    {
      label: 'Latinoamérica y España',
      options: [
        { label: 'Argentina', value: 'AR' },
        { label: 'Brasil', value: 'BR' },
        { label: 'Chile', value: 'CL' },
        { label: 'Colombia', value: 'CO' },
        { label: 'España', value: 'ES' },
        { label: 'México', value: 'MX' },
        { label: 'Perú', value: 'PE', disabled: true, hint: 'Sin cobertura' },
        { label: 'Uruguay', value: 'UY' },
      ],
    },
  ];
}
