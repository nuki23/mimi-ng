import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { LucideMapPin } from '@lucide/angular';
import {
  MIMI_COMBOBOX_TEXT_ES,
  MimiComboboxImports,
  provideMimiComboboxText,
} from '@/components/ui/combobox';
import type { MimiListOption } from '@/components/ui/option-list';

const ALL = [
  'Asunción',
  'Barcelona',
  'Bogotá',
  'Buenos Aires',
  'Caracas',
  'Guadalajara',
  'La Paz',
  'Lima',
  'Madrid',
  'Montevideo',
  'Quito',
  'Santiago',
  'Sevilla',
  'Valencia',
];

@Component({
  selector: 'app-combobox-async-example',
  imports: [MimiComboboxImports, LucideMapPin],
  // Textos propios de esta búsqueda.
  providers: [
    provideMimiComboboxText({
      ...MIMI_COMBOBOX_TEXT_ES,
      loading: 'Buscando ciudades…',
      noResultsHint: 'Revisa la ortografía.',
    }),
  ],
  template: `
    <div class="flex w-full max-w-xs flex-col gap-1.5">
      <label for="remote-city" class="text-sm font-medium">Ciudad (servidor simulado)</label>
      <!-- El filtro lo hace el «servidor»: filterWith deja pasar todo lo que llega. -->
      <mimi-combobox
        id="remote-city"
        placeholder="Escribe al menos 2 letras"
        [options]="results()"
        [loading]="loading()"
        [filterWith]="all"
        [(value)]="city"
        (searchChange)="search($event)"
      >
        <svg mimiComboboxStart lucideMapPin></svg>
      </mimi-combobox>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComboboxAsyncExample {
  protected readonly city = signal<string | null>(null);
  protected readonly results = signal<MimiListOption<string>[]>([]);
  protected readonly loading = signal(false);
  protected readonly all = () => true;
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  /** Simula una llamada al servidor de 600 ms. */
  protected search(text: string): void {
    clearTimeout(this.timer);
    const query = text.trim().toLowerCase();
    if (query.length < 2) {
      this.loading.set(false);
      this.results.set([]);
      return;
    }
    this.loading.set(true);
    this.timer = setTimeout(() => {
      const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      this.results.set(
        ALL.filter((name) => plain(name).includes(plain(query))).map((name) => ({
          label: name,
          value: name,
        })),
      );
      this.loading.set(false);
    }, 600);
  }
}
