import { ChangeDetectionStrategy, Component, Injector, inject } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import {
  type MimiDialogConfig,
  MimiDialogImports,
  MimiDialogService,
} from '@/components/ui/dialog';

/** Contenido de prueba: el mismo para todas las opciones. */
@Component({
  selector: 'app-options-dialog',
  imports: [MimiDialogImports, MimiButton],
  template: `
    <mimi-dialog-header>
      <h2 mimiDialogTitle>Vista previa</h2>
      <p mimiDialogDescription>El mismo contenido con otras opciones del panel.</p>
    </mimi-dialog-header>
    <mimi-dialog-footer>
      <button mimiBtn type="button" mimiDialogClose>Cerrar</button>
    </mimi-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OptionsDialog {}

@Component({
  selector: 'app-dialog-options-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-wrap justify-center gap-2">
      @for (option of options; track option.label) {
        <button mimiBtn variant="outline" (click)="open(option.config)">{{ option.label }}</button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogOptionsExample {
  private readonly dialog = inject(MimiDialogService);
  private readonly injector = inject(Injector);

  protected readonly options: { label: string; config: MimiDialogConfig }[] = [
    { label: 'size: sm', config: { size: 'sm' } },
    { label: 'size: md', config: { size: 'md' } },
    { label: 'size: lg', config: { size: 'lg' } },
    // width pide 800px y maxWidth lo limita (y nunca pasa de la pantalla menos 32px).
    { label: "maxWidth: '640px'", config: { width: '800px', maxWidth: '640px' } },
    { label: 'panelClass', config: { panelClass: 'rounded-none border-2 border-primary' } },
    // Sin la X ni el relleno del panel: el contenido es todo el panel (aquí, sus piezas).
    { label: "chrome: 'none'", config: { chrome: 'none' } },
  ];

  protected open(config: MimiDialogConfig): void {
    this.dialog.open(OptionsDialog, { ...config, injector: this.injector });
  }
}
