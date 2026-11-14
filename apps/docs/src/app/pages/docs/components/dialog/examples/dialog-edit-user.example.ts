import { ChangeDetectionStrategy, Component, Injector, inject, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogService } from '@/components/ui/dialog';
import { EditUserDialog, type User } from './edit-user-dialog';

@Component({
  selector: 'app-dialog-edit-user-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <p data-slot="user" class="text-sm">
        <strong>{{ user().name }}</strong> · {{ user().role }}
      </p>
      <button mimiBtn (click)="edit()">Editar usuario</button>
      <p data-slot="result" class="font-mono text-[13px] text-muted-foreground">
        resultado: {{ result() }}
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogEditUserExample {
  private readonly dialog = inject(MimiDialogService);
  private readonly injector = inject(Injector);
  protected readonly user = signal<User>({ name: 'Ana Torres', role: 'Editor' });
  protected readonly result = signal('—');

  protected edit(): void {
    // inputs llega a las entradas del componente; injector le da los textos de esta página.
    const ref = this.dialog.open<User>(EditUserDialog, {
      inputs: { user: this.user() },
      injector: this.injector,
    });
    ref.afterClosed().subscribe((edited) => {
      this.result.set(edited ? 'guardado' : 'cancelado');
      if (edited) this.user.set(edited);
    });
  }
}
