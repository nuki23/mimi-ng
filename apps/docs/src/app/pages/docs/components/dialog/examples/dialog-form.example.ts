import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiDialogImports } from '@/components/ui/dialog';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { type MimiOption, MimiSelect } from '@/components/ui/select';
import { MimiSwitch } from '@/components/ui/switch';

@Component({
  selector: 'app-dialog-form-example',
  imports: [
    ReactiveFormsModule,
    MimiDialogImports,
    MimiButton,
    MimiFormField,
    MimiInput,
    MimiSelect,
    MimiSwitch,
  ],
  template: `
    <div class="flex flex-col items-center gap-3">
      <mimi-dialog [(open)]="open">
        <button mimiBtn mimiDialogTrigger>Invitar persona</button>
        <ng-template mimiDialogContent>
          <!-- El form envuelve cuerpo y pie: con contents, siguen siendo hijos del panel. -->
          <form class="contents" [formGroup]="form" (ngSubmit)="invite()">
            <mimi-dialog-header>
              <h2 mimiDialogTitle>Invitar al equipo</h2>
              <p mimiDialogDescription>Recibirá un enlace por correo.</p>
            </mimi-dialog-header>
            <mimi-dialog-body>
              <mimi-form-field label="Correo">
                <input mimiInput type="email" formControlName="email" autocomplete="email" />
              </mimi-form-field>
              <mimi-form-field label="Rol">
                <mimi-select
                  formControlName="role"
                  placeholder="Selecciona un rol"
                  [options]="roles"
                />
              </mimi-form-field>
              <mimi-switch formControlName="publish">Puede publicar sin revisión</mimi-switch>
            </mimi-dialog-body>
            <mimi-dialog-footer>
              <button mimiBtn type="button" variant="outline" mimiDialogClose>Cancelar</button>
              <button mimiBtn type="submit">Enviar invitación</button>
            </mimi-dialog-footer>
          </form>
        </ng-template>
      </mimi-dialog>
      @if (sentTo(); as sentTo) {
        <p class="text-sm text-muted-foreground" role="status">
          Invitación enviada a {{ sentTo }}.
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogFormExample {
  protected readonly open = signal(false);
  protected readonly sentTo = signal('');
  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    role: new FormControl<string | null>(null, Validators.required),
    publish: new FormControl(false, { nonNullable: true }),
  });
  protected readonly roles: MimiOption<string>[] = [
    { label: 'Administrador', value: 'admin' },
    { label: 'Editor', value: 'editor' },
    { label: 'Lector', value: 'viewer' },
  ];

  protected invite(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.sentTo.set(this.form.controls.email.value);
    this.form.reset();
    this.open.set(false);
  }
}
