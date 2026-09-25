import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';
import { MimiInput } from '@/components/ui/input';

@Component({
  selector: 'app-card-form-example',
  imports: [MimiCardImports, MimiButton, MimiInput],
  template: `
    <mimi-card class="w-full max-w-md">
      <mimi-card-header>
        <mimi-card-title>Crea tu cuenta</mimi-card-title>
        <mimi-card-description>Tarda menos de un minuto.</mimi-card-description>
      </mimi-card-header>
      <form (submit)="$event.preventDefault()">
        <mimi-card-content class="flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label for="card-name" class="text-sm font-medium">Nombre</label>
            <input mimiInput id="card-name" autocomplete="name" placeholder="Ana Torres" />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="flex flex-col gap-1.5">
              <label for="card-email" class="text-sm font-medium">Correo</label>
              <input
                mimiInput
                id="card-email"
                type="email"
                autocomplete="email"
                placeholder="tu@correo.com"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="card-password" class="text-sm font-medium">Contraseña</label>
              <input mimiInput id="card-password" type="password" autocomplete="new-password" />
            </div>
          </div>
        </mimi-card-content>
        <mimi-card-footer>
          <button mimiBtn type="submit" class="w-full">Crear cuenta</button>
        </mimi-card-footer>
      </form>
    </mimi-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardFormExample {}
