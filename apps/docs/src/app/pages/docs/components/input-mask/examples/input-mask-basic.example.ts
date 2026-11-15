import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { LucideCalendar } from '@lucide/angular';
import { MimiInputMaskImports } from '@/components/ui/input-mask';

@Component({
  selector: 'app-input-mask-basic-example',
  imports: [MimiInputMaskImports, LucideCalendar],
  template: `
    <div class="grid w-full max-w-2xl gap-5 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <label for="phone" class="text-sm font-medium">Teléfono</label>
        <!-- El prefijo cambia el significado: dilo también en la ayuda. -->
        <mimi-input-mask
          id="phone"
          mask="00 0000 0000"
          ghost="55 0000 0000"
          autocomplete="tel-national"
          aria-describedby="phone-hint"
          [(value)]="phone"
        >
          <span mimiMaskPrefix>+52</span>
        </mimi-input-mask>
        <span id="phone-hint" class="text-xs text-muted-foreground">México (+52), 10 dígitos</span>
      </div>
      <div class="flex flex-col gap-1.5">
        <label for="birth" class="text-sm font-medium">Fecha de nacimiento</label>
        <mimi-input-mask
          id="birth"
          mask="00/00/0000"
          ghost="DD/MM/AAAA"
          autocomplete="bday"
          aria-describedby="birth-hint"
          [(value)]="birth"
        >
          <svg mimiMaskStart lucideCalendar aria-hidden="true"></svg>
        </mimi-input-mask>
        <span id="birth-hint" class="text-xs text-muted-foreground">Día, mes y año</span>
      </div>
      <p class="font-mono text-[13px] text-muted-foreground sm:col-span-2">
        phone: «{{ phone() }}» · birth: «{{ birth() }}»
      </p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputMaskBasicExample {
  protected readonly phone = signal('');
  protected readonly birth = signal('');
}
