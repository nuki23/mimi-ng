import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { form, FormField, required } from '@angular/forms/signals';
import { MimiFileUploadImports } from '@/components/ui/file-upload';
import { MimiFormField } from '@/components/ui/form-field';

@Component({
  selector: 'app-file-upload-forms-example',
  imports: [MimiFileUploadImports, MimiFormField, FormField, ReactiveFormsModule, FormsModule],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <!-- Un solo archivo: uno nuevo reemplaza al anterior. Obligatorio. -->
      <mimi-form-field label="Foto de perfil (Signal Forms)">
        <mimi-file-upload accept="image/*" hint="Una imagen" [formField]="profile.photo" />
      </mimi-form-field>
      <mimi-form-field label="Adjuntos, hasta 3 (Reactive)">
        <mimi-file-upload
          multiple
          hint="Hasta 3 archivos"
          [maxFiles]="3"
          [formControl]="attachments"
        />
      </mimi-form-field>
      <mimi-form-field label="Documentos (ngModel)">
        <mimi-file-upload multiple accept=".pdf" hint="Solo PDF" name="docs" [(ngModel)]="docs" />
      </mimi-form-field>
      <mimi-form-field label="Deshabilitado">
        <mimi-file-upload class="min-h-28" disabled hint="No disponible" />
      </mimi-form-field>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadFormsExample {
  protected readonly data = signal({ photo: [] as File[] });
  protected readonly profile = form(this.data, (p) => required(p.photo));
  protected readonly attachments = new FormControl<File[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });
  protected docs: File[] = [];
}
