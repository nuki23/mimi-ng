import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DocText } from './doc-text';
import type { ApiRow, OutputRow, PartRow, ServiceRow } from './doc-page.types';

type Kind = 'inputs' | 'outputs' | 'parts' | 'service';
type Row = ApiRow | OutputRow | PartRow | ServiceRow;
type Key = 'name' | 'type' | 'default' | 'selector' | 'description';

interface Column {
  label: string;
  key: Key;
  /** Monoespaciada (nombres, tipos y valores) o prosa. */
  mono: boolean;
  muted?: boolean;
}

/** Las columnas fijas de cada tabla (regla 10 de la plantilla). */
const COLUMNS: Record<Kind, Column[]> = {
  inputs: [
    { label: 'Entrada', key: 'name', mono: true },
    { label: 'Tipo', key: 'type', mono: true, muted: true },
    { label: 'Por defecto', key: 'default', mono: true },
    { label: 'Descripción', key: 'description', mono: false },
  ],
  outputs: [
    { label: 'Salida', key: 'name', mono: true },
    { label: 'Tipo', key: 'type', mono: true, muted: true },
    { label: 'Descripción', key: 'description', mono: false },
  ],
  parts: [
    { label: 'Pieza', key: 'name', mono: true },
    { label: 'Selector', key: 'selector', mono: true, muted: true },
    { label: 'Para qué', key: 'description', mono: false },
  ],
  service: [
    { label: 'Miembro', key: 'name', mono: true },
    { label: 'Tipo', key: 'type', mono: true, muted: true },
    { label: 'Descripción', key: 'description', mono: false },
  ],
};

/** Tabla de la API (Entradas, Salidas o Piezas) con las columnas fijas de la plantilla. */
@Component({
  selector: 'app-api-table',
  imports: [DocText],
  template: `
    <div class="overflow-x-auto rounded-card border">
      <table class="w-full text-left text-sm" [attr.data-kind]="kind()">
        <thead class="bg-muted text-muted-foreground">
          <tr>
            @for (col of columns(); track col.key) {
              <th scope="col" class="px-4 py-2.5 font-medium">{{ col.label }}</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of rows(); track row.name) {
            <tr class="border-t align-top">
              @for (col of columns(); track col.key) {
                @if (col.mono) {
                  <td
                    class="px-4 py-2.5 font-mono text-[13px]"
                    [class.text-muted-foreground]="col.muted"
                  >
                    {{ cell(row, col.key) }}
                  </td>
                } @else {
                  <td class="px-4 py-2.5 text-pretty">
                    <app-doc-text [text]="cell(row, col.key)" />
                  </td>
                }
              }
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApiTable {
  readonly kind = input.required<Kind>();
  readonly rows = input.required<readonly Row[]>();

  protected readonly columns = computed(() => COLUMNS[this.kind()]);

  protected cell(row: Row, key: Key): string {
    return (row as Partial<Record<Key, string>>)[key] ?? '';
  }
}
