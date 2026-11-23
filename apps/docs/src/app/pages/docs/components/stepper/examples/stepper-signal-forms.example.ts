import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { MimiButton } from '@/components/ui/button';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';
import { MimiStepperImports } from '@/components/ui/stepper';

@Component({
  selector: 'app-stepper-signal-forms-example',
  imports: [MimiStepperImports, FormField, MimiFormField, MimiInput, MimiButton],
  template: `
    <div class="flex w-full max-w-lg flex-col gap-4">
      <mimi-stepper #pasos="mimiStepper" linear aria-label="Registro" (finish)="done.set(true)">
        <mimi-step title="Tú" [form]="signup.person">
          <mimi-form-field label="Nombre">
            <input mimiInput [formField]="signup.person.name" />
          </mimi-form-field>
        </mimi-step>
        <mimi-step title="Contacto" [form]="signup.contact">
          <mimi-form-field label="Correo">
            <input mimiInput type="email" [formField]="signup.contact.email" />
          </mimi-form-field>
        </mimi-step>
        <mimi-step title="Confirmar">
          <p class="text-sm">{{ done() ? '¡Listo!' : 'Pulsa Finalizar para crear la cuenta.' }}</p>
        </mimi-step>
      </mimi-stepper>
      <div class="flex justify-end gap-2">
        <button mimiBtn variant="outline" [disabled]="pasos.isFirst()" [mimiStepperPrev]="pasos">
          Atrás
        </button>
        <button mimiBtn [mimiStepperNext]="pasos">
          {{ pasos.isLast() ? 'Finalizar' : 'Siguiente' }}
        </button>
      </div>
    </div>
  `,
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperSignalFormsExample {
  protected readonly done = signal(false);
  protected readonly model = signal({ person: { name: '' }, contact: { email: '' } });
  protected readonly signup = form(this.model, (path) => {
    required(path.person.name, { message: 'Escribe tu nombre.' });
    required(path.contact.email, { message: 'Escribe tu correo.' });
    email(path.contact.email, { message: 'Ese correo no es válido.' });
  });
}
