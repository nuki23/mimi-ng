import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { type MimiFileRejection, MimiFileUploadImports } from '@/components/ui/file-upload';

@Component({
  selector: 'app-file-upload-demo-example',
  imports: [MimiFileUploadImports],
  template: `
    <div class="flex w-full max-w-md flex-col gap-3">
      <!-- El título visible es también el nombre accesible de la zona. -->
      <mimi-file-upload
        #zone
        heading="Adjunta tus facturas"
        accept="image/*,.pdf"
        multiple
        hint="PNG, JPG o PDF · hasta 10 MB"
        [maxSize]="10_000_000"
        [(value)]="files"
        (rejected)="rejected.set($event)"
      />
      @for (r of rejected(); track r.file) {
        <p class="text-[13px] text-destructive-soft-foreground">
          {{ r.file.name }}: {{ r.message }}
        </p>
      }
      <!-- La lista la arma la app: aquí, sin subir nada. -->
      <mimi-file-list [emptyFocus]="zone">
        @for (file of files(); track file) {
          <mimi-file-item [file]="file" (remove)="remove(file)" />
        }
      </mimi-file-list>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadDemoExample {
  protected readonly files = signal<File[]>([]);
  protected readonly rejected = signal<MimiFileRejection[]>([]);

  protected remove(file: File): void {
    this.files.update((list) => list.filter((f) => f !== file));
  }
}
