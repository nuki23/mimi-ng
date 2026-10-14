import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiToast } from '@/components/ui/toast';

@Component({
  selector: 'app-toast-action-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <button mimiBtn variant="outline" (click)="save()">Guardar sin conexión</button>
      <p class="font-mono text-[13px] text-muted-foreground">intentos: {{ attempts() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastActionExample {
  private readonly toast = injectMimiToast();
  protected readonly attempts = signal(0);

  protected save(): void {
    this.attempts.update((n) => n + 1);
    // Con acción no se cierra solo: da tiempo a llegar con el teclado (F8).
    this.toast.error('No se pudo guardar', {
      description: 'Revisa tu conexión e inténtalo de nuevo.',
      action: { label: 'Reintentar', onClick: () => this.save() },
    });
  }
}
