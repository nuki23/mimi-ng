import { ChangeDetectionStrategy, Component, Injector, inject, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import {
  MIMI_DIALOG_DATA,
  MimiDialogImports,
  MimiDialogRef,
  MimiDialogService,
} from '@/components/ui/dialog';
import { MimiInput } from '@/components/ui/input';

interface Project {
  id: number;
  name: string;
}

/** El contenido del diálogo: un componente normal. */
@Component({
  selector: 'app-rename-project-dialog',
  imports: [MimiDialogImports, MimiButton, MimiInput],
  template: `
    <mimi-dialog-header>
      <h2 mimiDialogTitle>Renombrar proyecto</h2>
      <p mimiDialogDescription>El nombre actual es «{{ project.name }}».</p>
    </mimi-dialog-header>
    <mimi-dialog-body>
      <div class="flex flex-col gap-1.5">
        <label for="dialog-service-name" class="text-sm font-medium">Nombre nuevo</label>
        <input
          #name
          mimiInput
          id="dialog-service-name"
          [value]="project.name"
          (keydown.enter)="ref.close(name.value)"
        />
      </div>
    </mimi-dialog-body>
    <mimi-dialog-footer>
      <button mimiBtn type="button" variant="outline" mimiDialogClose>Cancelar</button>
      <!-- El valor de mimiDialogClose es el resultado de afterClosed(). -->
      <button mimiBtn type="button" [mimiDialogClose]="name.value">Renombrar</button>
    </mimi-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameProjectDialog {
  protected readonly project = inject<Project>(MIMI_DIALOG_DATA);
  protected readonly ref = inject<MimiDialogRef<string>>(MimiDialogRef);
}

@Component({
  selector: 'app-dialog-service-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <button mimiBtn variant="outline" (click)="rename()">Renombrar «{{ project().name }}»</button>
      <p class="font-mono text-[13px] text-muted-foreground">resultado: {{ result() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogServiceExample {
  private readonly dialog = inject(MimiDialogService);
  private readonly injector = inject(Injector);
  protected readonly project = signal<Project>({ id: 7, name: 'Sitio web' });
  protected readonly result = signal('—');

  protected rename(): void {
    const ref = this.dialog.open<string>(RenameProjectDialog, {
      data: this.project(),
      // Opcional: el contenido ve los providers de este componente y de su ruta (aquí, los
      // textos en español). Sin él, usa los de la aplicación.
      injector: this.injector,
    });
    ref.afterClosed().subscribe((name) => {
      this.result.set(name === undefined ? 'cancelado' : `"${name}"`);
      if (name) this.project.update((project) => ({ ...project, name }));
    });
  }
}
