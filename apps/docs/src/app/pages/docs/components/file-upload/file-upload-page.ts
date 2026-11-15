import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MIMI_FILE_UPLOAD_TEXT_ES, provideMimiFileUploadText } from '@/components/ui/file-upload';
import { DocPageView } from '../../../../doc-page/doc-page';
import { FILE_UPLOAD_PAGE } from './file-upload.page';

/** Documentación de File Upload: la configuración está en file-upload.page.ts (plantilla de página). */
@Component({
  selector: 'app-file-upload-page',
  imports: [DocPageView],
  // Los textos de File Upload están en inglés por defecto; este sitio usa el español. Aquí y no
  // en app.config.ts, para no sumar nada al JS inicial.
  providers: [provideMimiFileUploadText(MIMI_FILE_UPLOAD_TEXT_ES)],
  template: '<app-doc-page [page]="page" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadPage {
  protected readonly page = FILE_UPLOAD_PAGE;
}
