import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCheckbox } from '@/components/ui/checkbox';
import { MimiInput } from '@/components/ui/input';
import { MimiPopoverImports } from '@/components/ui/popover';

@Component({
  selector: 'app-popover-form-example',
  imports: [MimiPopoverImports, MimiButton, MimiInput, MimiCheckbox],
  template: `
    <div class="flex flex-col items-center gap-3">
      <mimi-popover [(open)]="open">
        <button mimiBtn variant="outline" mimiPopoverTrigger>Invitar</button>
        <ng-template mimiPopoverContent>
          <div class="flex flex-col gap-0.5">
            <h4 mimiPopoverTitle>Invitar al proyecto</h4>
            <p mimiPopoverDescription>Recibirá un enlace por correo.</p>
          </div>
          <form class="flex flex-col gap-3" (submit)="invite($event, email.value)">
            <div class="flex flex-col gap-1.5">
              <label for="popover-email" class="text-[13px] font-medium">Correo</label>
              <input
                #email
                mimiInput
                id="popover-email"
                type="email"
                required
                autocomplete="email"
                placeholder="nombre@empresa.com"
              />
            </div>
            <mimi-checkbox>Avisar por Slack</mimi-checkbox>
            <button mimiBtn type="submit">Enviar invitación</button>
          </form>
        </ng-template>
      </mimi-popover>
      @if (sentTo(); as sentTo) {
        <p class="text-sm text-muted-foreground" role="status">
          Invitación enviada a {{ sentTo }}.
        </p>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverFormExample {
  protected readonly open = signal(false);
  protected readonly sentTo = signal('');

  protected invite(event: Event, email: string): void {
    event.preventDefault();
    this.sentTo.set(email);
    this.open.set(false);
  }
}
