import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiLoading } from '@/components/ui/loading';

@Component({
  selector: 'app-loading-view-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-wrap gap-3">
      <button mimiBtn (click)="save()">Guardar el informe</button>
      <button mimiBtn variant="outline" (click)="twoAtOnce()">Dos cargas a la vez</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingViewExample {
  // Ligada al componente: si se destruye con una carga abierta, la capa no se queda.
  private readonly loading = injectMimiLoading();

  protected async save(): Promise<void> {
    const ref = this.loading.show('Guardando el informe…');
    await wait(1500);
    ref.hide();
  }

  /** La capa sigue hasta que termina la última. */
  protected async twoAtOnce(): Promise<void> {
    const first = this.loading.show('Subiendo archivos…');
    const second = this.loading.show('Generando la vista previa…');
    await wait(1000);
    second.hide();
    await wait(1000);
    first.hide();
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
