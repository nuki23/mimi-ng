import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiFileUpload } from '@/components/ui/file-upload';

@Component({
  selector: 'app-file-upload-sizes-example',
  imports: [MimiFileUpload],
  template: `
    <div class="grid w-full gap-3 sm:grid-cols-3">
      <mimi-file-upload size="sm" aria-label="Subir, pequeño" hint="Hasta 5 MB" />
      <mimi-file-upload size="md" aria-label="Subir, mediano" hint="Hasta 5 MB" />
      <mimi-file-upload size="lg" aria-label="Subir, grande" hint="Hasta 5 MB" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadSizesExample {}
