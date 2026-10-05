import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { MimiSwitch } from '@/components/ui/switch';

const INITIAL = { name: 'panel-ventas', email: '', weekly: true, notify: true };

/** Vitrina de la landing: un formulario real con Card, FormField, Input, Switch y Checkbox. */
@Component({
  selector: 'app-showcase-preferences',
  imports: [
    ReactiveFormsModule,
    MimiCardImports,
    MimiButton,
    MimiCheckbox,
    MimiFormField,
    MimiInput,
    MimiSwitch,
  ],
  template: `
    <mimi-card>
      <mimi-card-header>
        <mimi-card-title class="font-bold">Preferencias del proyecto</mimi-card-title>
        <mimi-card-description>Elige cómo te avisamos de los cambios.</mimi-card-description>
      </mimi-card-header>
      <form [formGroup]="form" (ngSubmit)="save()">
        <mimi-card-content class="flex flex-col gap-4">
          <mimi-form-field label="Nombre del proyecto">
            <input mimiInput formControlName="name" />
          </mimi-form-field>

          <mimi-form-field label="Correo de avisos">
            <div class="flex gap-2">
              <input
                mimiInput
                type="email"
                placeholder="equipo@empresa.com"
                class="min-w-0 flex-1"
                formControlName="email"
              />
              <button mimiBtn type="button" tone="secondary" (click)="verify()">Verificar</button>
            </div>
          </mimi-form-field>

          <div class="flex items-center justify-between gap-4 rounded-lg border px-3.5 py-3">
            <div class="flex flex-col">
              <span class="text-sm font-medium">Resumen semanal</span>
              <span class="text-[13px] text-muted-foreground">
                Un correo cada lunes con los cambios.
              </span>
            </div>
            <mimi-switch aria-label="Resumen semanal" formControlName="weekly" />
          </div>

          <mimi-checkbox formControlName="notify">
            Avisarme cuando haya una versión nueva de Mimi
          </mimi-checkbox>
        </mimi-card-content>

        <mimi-card-footer class="flex-wrap">
          <p aria-live="polite" class="mr-auto text-sm text-muted-foreground">{{ status() }}</p>
          <button mimiBtn type="button" variant="outline" (click)="cancel()">Cancelar</button>
          <button mimiBtn type="submit">Guardar cambios</button>
        </mimi-card-footer>
      </form>
    </mimi-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePreferences {
  protected readonly form = new FormGroup({
    name: new FormControl(INITIAL.name, { nonNullable: true, validators: Validators.required }),
    email: new FormControl(INITIAL.email, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    weekly: new FormControl(INITIAL.weekly, { nonNullable: true }),
    notify: new FormControl(INITIAL.notify, { nonNullable: true }),
  });

  /** Aviso del último botón pulsado (región aria-live). */
  protected readonly status = signal('');

  protected verify(): void {
    const email = this.form.controls.email;
    email.markAsTouched();
    this.status.set(email.valid ? 'El correo es válido.' : '');
  }

  protected save(): void {
    this.form.markAllAsTouched();
    this.status.set(this.form.valid ? 'Cambios guardados.' : '');
  }

  protected cancel(): void {
    this.form.reset(INITIAL);
    this.status.set('');
  }
}
