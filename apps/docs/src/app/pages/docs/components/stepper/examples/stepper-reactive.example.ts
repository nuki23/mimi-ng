import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiButton } from '@/components/ui/button';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { MimiStepperImports } from '@/components/ui/stepper';

@Component({
  selector: 'app-stepper-reactive-example',
  imports: [MimiStepperImports, ReactiveFormsModule, MimiFormField, MimiInput, MimiButton],
  template: `
    <div class="flex w-full max-w-lg flex-col gap-4">
      <mimi-stepper #pasos="mimiStepper" linear aria-label="Envío">
        <mimi-step title="Dirección" [form]="address" [formGroup]="address">
          <mimi-form-field label="Calle y número">
            <input mimiInput formControlName="street" />
          </mimi-form-field>
        </mimi-step>
        <mimi-step title="Código postal" [form]="zip" [formGroup]="zip">
          <mimi-form-field label="Código postal" hint="5 cifras">
            <input mimiInput inputmode="numeric" formControlName="code" />
          </mimi-form-field>
        </mimi-step>
        <mimi-step title="Listo">
          <p class="text-sm">Enviaremos a {{ address.value.street }} ({{ zip.value.code }}).</p>
        </mimi-step>
      </mimi-stepper>
      <div class="flex justify-end gap-2">
        <button mimiBtn variant="outline" [disabled]="pasos.isFirst()" [mimiStepperPrev]="pasos">
          Atrás
        </button>
        <button mimiBtn [disabled]="pasos.isLast()" [mimiStepperNext]="pasos">Siguiente</button>
      </div>
    </div>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperReactiveExample {
  protected readonly address = new FormGroup({
    street: new FormControl('', Validators.required),
  });
  protected readonly zip = new FormGroup({
    code: new FormControl('', [Validators.required, Validators.pattern(/^\d{5}$/)]),
  });
}
