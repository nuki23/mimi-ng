import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiFileUpload } from '@/components/ui/file-upload';

@Component({
  selector: 'app-file-upload-states-example',
  imports: [MimiFileUpload],
  template: `
    <div class="grid w-full max-w-2xl gap-4 sm:grid-cols-3">
      <mimi-file-upload heading="Deshabilitado" hint="No disponible" disabled />
      <!-- Solo lectura: se enfoca, pero no abre el selector ni acepta archivos soltados. -->
      <mimi-file-upload heading="Solo lectura" hint="Ya no se puede cambiar" readonly />
      <!-- Con un formulario, invalid y touched los pasa Angular (ver «Formularios»). -->
      <mimi-file-upload heading="Con error" hint="Adjunta un archivo" invalid touched />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadStatesExample {}
