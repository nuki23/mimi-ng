import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiConfirm } from '@/components/ui/confirm';

@Component({
  selector: 'app-confirm-basic-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <button mimiBtn variant="outline" (click)="send()">Enviar invitación</button>
      <p class="font-mono text-[13px] text-muted-foreground">resultado: {{ result() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmBasicExample {
  // Se llama al declarar la propiedad: necesita el contexto de inyección.
  private readonly confirm = injectMimiConfirm();
  protected readonly result = signal('—');

  protected async send(): Promise<void> {
    const ok = await this.confirm({
      title: '¿Enviar la invitación?',
      description: 'Ana recibirá un correo para unirse al equipo.',
    });
    this.result.set(ok ? 'confirmado' : 'cancelado');
  }
}
