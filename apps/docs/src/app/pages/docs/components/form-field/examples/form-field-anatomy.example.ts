import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiInput } from '@/components/ui/input';

/** Las piezas, cada una con su borde de color: el mismo color en la leyenda. */
const PARTS = [
  { name: 'label', what: 'La etiqueta, enlazada al control.', box: 'border-primary' },
  { name: 'description', what: 'Contexto, encima del control.', box: 'border-info' },
  { name: 'input', what: 'El control: Input, Select, Switch…', box: 'border-success' },
  { name: 'hint', what: 'Ayuda, debajo del control.', box: 'border-warning' },
  { name: 'mimi-form-error', what: 'El error, cuando lo hay.', box: 'border-destructive' },
];

@Component({
  selector: 'app-form-field-anatomy-example',
  imports: [ReactiveFormsModule, MimiFormField, MimiInput],
  template: `
    <div class="grid w-full max-w-2xl items-center gap-8 sm:grid-cols-2">
      <mimi-form-field
        label="Usuario"
        description="Así te verán los demás."
        hint="Solo letras y números."
        class="[&_input]:outline-2 [&_input]:outline-offset-4 [&_input]:outline-success [&_input]:outline-dashed [&>[data-slot=description]]:outline-2 [&>[data-slot=description]]:outline-offset-2 [&>[data-slot=description]]:outline-info [&>[data-slot=description]]:outline-dashed [&>[data-slot=hint]]:outline-2 [&>[data-slot=hint]]:outline-offset-2 [&>[data-slot=hint]]:outline-warning [&>[data-slot=hint]]:outline-dashed [&>label]:outline-2 [&>label]:outline-offset-2 [&>label]:outline-primary [&>label]:outline-dashed [&>mimi-form-error]:outline-2 [&>mimi-form-error]:outline-offset-2 [&>mimi-form-error]:outline-destructive [&>mimi-form-error]:outline-dashed"
      >
        <input mimiInput [formControl]="user" />
      </mimi-form-field>
      <ol class="flex flex-col gap-2.5 text-sm" aria-label="Piezas de FormField">
        @for (part of parts; track part.name) {
          <li class="flex items-start gap-2.5">
            <span
              aria-hidden="true"
              class="mt-0.5 size-4 shrink-0 rounded-sm border-2 border-dashed"
              [class]="part.box"
            ></span>
            <span
              ><code class="font-mono text-[13px]">{{ part.name }}</code
              >: {{ part.what }}</span
            >
          </li>
        }
      </ol>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldAnatomyExample {
  protected readonly parts = PARTS;
  protected readonly user = new FormControl('ab', [Validators.required, Validators.minLength(3)]);

  constructor() {
    this.user.markAsTouched();
  }
}
