import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MimiFormField } from '@/components/ui/form-field';
import { MimiTagsInput } from '@/components/ui/tags-input';

@Component({
  selector: 'app-tags-input-forms-example',
  imports: [MimiTagsInput, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <!-- Al menos una: el error aparece al salir sin etiquetas. -->
      <mimi-form-field label="Temas (Signal Forms)">
        <mimi-tags-input [formField]="post.topics" />
      </mimi-form-field>
      <mimi-form-field label="Correos en copia (Reactive)">
        <mimi-tags-input [validate]="email" [formControl]="cc" />
      </mimi-form-field>
      <mimi-form-field label="Palabras clave (ngModel)">
        <mimi-tags-input name="keywords" [(ngModel)]="keywords" />
      </mimi-form-field>
      <div class="flex flex-col gap-1.5">
        <span class="text-sm font-medium">Deshabilitado</span>
        <mimi-tags-input aria-label="Deshabilitado" [value]="['angular', 'diseño']" disabled />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsInputFormsExample {
  protected readonly data = signal({ topics: [] as string[] });
  protected readonly post = form(this.data, (p) => required(p.topics));
  protected readonly cc = new FormControl<string[]>(['ana@ejemplo.com'], { nonNullable: true });
  protected keywords: string[] = ['ui'];
  /** Validación por etiqueta: el mensaje aparece debajo del campo. */
  protected readonly email = (tag: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag) ? null : `«${tag}» no es un correo.`;
}
