import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiConfirm } from '@/components/ui/confirm';

@Component({
  selector: 'app-confirm-custom-texts-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <button mimiBtn variant="outline" (click)="leave()">Cerrar sesión</button>
      <p class="font-mono text-[13px] text-muted-foreground">resultado: {{ result() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmCustomTextsExample {
  private readonly confirm = injectMimiConfirm();
  protected readonly result = signal('—');

  protected async leave(): Promise<void> {
    // confirmText y cancelText ganan sobre los textos de provideMimiConfirmText.
    const ok = await this.confirm({
      title: '¿Cerrar sesión?',
      description: 'Tendrás que volver a entrar con tu correo.',
      confirmText: 'Cerrar sesión',
      cancelText: 'Quedarme',
    });
    this.result.set(ok ? 'sesión cerrada' : 'se queda');
  }
}
