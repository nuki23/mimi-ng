import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideFileSpreadsheet } from '@lucide/angular';
import { MimiFileUploadImports } from '@/components/ui/file-upload';

interface Stored {
  name: string;
  size: number;
  type: string;
}

@Component({
  selector: 'app-file-upload-list-example',
  imports: [MimiFileUploadImports, LucideFileSpreadsheet],
  template: `
    <!-- Archivos que ya están en el servidor: la lista no necesita un File. -->
    <mimi-file-list class="w-full max-w-md" aria-label="Archivos del proyecto">
      @for (file of stored(); track file.name) {
        <mimi-file-item
          status="done"
          [name]="file.name"
          [size]="file.size"
          [type]="file.type"
          (remove)="remove(file)"
        >
          @if (file.name.endsWith('.xlsx')) {
            <svg mimiFileIcon lucideFileSpreadsheet></svg>
          }
        </mimi-file-item>
      }
    </mimi-file-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadListExample {
  protected readonly stored = signal<Stored[]>([
    { name: 'contrato.pdf', size: 182_000, type: 'application/pdf' },
    { name: 'presupuesto.xlsx', size: 48_500, type: '' },
    { name: 'demo.mp4', size: 48_200_000, type: 'video/mp4' },
  ]);

  protected remove(file: Stored): void {
    this.stored.update((list) => list.filter((f) => f !== file));
  }
}
