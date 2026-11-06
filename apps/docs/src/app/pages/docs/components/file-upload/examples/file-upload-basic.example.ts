import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  type MimiFileRejection,
  type MimiFileStatus,
  MimiFileUploadImports,
} from '@/components/ui/file-upload';

interface Upload {
  status: MimiFileStatus;
  progress: number;
  error?: string;
}

@Component({
  selector: 'app-file-upload-basic-example',
  imports: [MimiFileUploadImports],
  template: `
    <div class="flex w-full max-w-md flex-col gap-3">
      <mimi-file-upload
        #zone
        accept="image/*,.pdf"
        multiple
        hint="PNG, JPG o PDF · hasta 10 MB"
        [maxSize]="10_000_000"
        [value]="files()"
        (valueChange)="onFiles($event)"
        (rejected)="rejected.set($event)"
      />
      @for (r of rejected(); track r.file) {
        <p class="text-[13px] text-destructive-soft-foreground">
          {{ r.file.name }}: {{ r.message }}
        </p>
      }
      <!-- La lista la arma la app con el estado de su subida (aquí, simulada). -->
      <mimi-file-list [emptyFocus]="zone">
        @for (file of files(); track file) {
          <mimi-file-item
            [file]="file"
            [status]="uploads().get(file)?.status ?? 'idle'"
            [progress]="uploads().get(file)?.progress ?? 0"
            [error]="uploads().get(file)?.error ?? ''"
            (remove)="remove(file)"
            (retry)="upload(file)"
          />
        }
      </mimi-file-list>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadBasicExample {
  protected readonly files = signal<File[]>([]);
  protected readonly uploads = signal(new Map<File, Upload>());
  protected readonly rejected = signal<MimiFileRejection[]>([]);
  private readonly timers = new Set<ReturnType<typeof setInterval>>();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.timers.forEach(clearInterval));
  }

  protected onFiles(files: File[]): void {
    const added = files.filter((f) => !this.files().includes(f));
    this.files.set(files);
    added.forEach((f) => this.upload(f));
  }

  protected remove(file: File): void {
    this.files.update((list) => list.filter((f) => f !== file));
  }

  /** Subida simulada: los nombres con «error» fallan la primera vez. */
  protected upload(file: File): void {
    let progress = 0;
    let failed = false;
    const set = (upload: Upload) => this.uploads.update((m) => new Map(m).set(file, upload));
    set({ status: 'uploading', progress });
    const timer = setInterval(() => {
      progress += 20;
      const fail = file.name.includes('error') && !failed && progress >= 60;
      if (fail || progress >= 100) {
        clearInterval(timer);
        this.timers.delete(timer);
      }
      if (fail) {
        failed = true;
        set({ status: 'error', progress, error: 'Se cortó la conexión.' });
      } else {
        set({ status: progress >= 100 ? 'done' : 'uploading', progress });
      }
    }, 400);
    this.timers.add(timer);
  }
}
