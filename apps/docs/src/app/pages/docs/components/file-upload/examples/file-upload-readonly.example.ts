import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiFileUpload } from '@/components/ui/file-upload';

@Component({
  selector: 'app-file-upload-readonly-example',
  imports: [MimiFileUpload],
  template: `
    <div class="w-full max-w-md">
      <mimi-file-upload
        aria-label="Adjuntos"
        readonly
        hint="Los adjuntos ya no se pueden cambiar"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadReadonlyExample {}
