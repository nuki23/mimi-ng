import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiToast } from '@/components/ui/toast';

@Component({
  selector: 'app-toast-promise-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-wrap justify-center gap-2">
      <button mimiBtn variant="outline" (click)="upload(true)">Subir archivos</button>
      <button mimiBtn variant="outline" (click)="upload(false)">Subir (falla)</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastPromiseExample {
  private readonly toast = injectMimiToast();

  protected upload(ok: boolean): void {
    // Con HttpClient: this.toast.promise(() => firstValueFrom(this.http.post(…)), {…}).
    void this.toast
      .promise(() => this.fakeUpload(ok), {
        loading: { title: 'Guardando…', description: 'Subiendo 3 archivos a panel-ventas.' },
        success: (files) => ({
          title: 'Guardado',
          description: `Los ${files} archivos están al día.`,
        }),
        error: 'No se pudo subir',
      })
      .catch(() => undefined);
  }

  private fakeUpload(ok: boolean): Promise<number> {
    return new Promise((resolve, reject) =>
      setTimeout(() => (ok ? resolve(3) : reject(new Error('Sin conexión'))), 1800),
    );
  }
}
