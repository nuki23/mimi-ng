import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { injectMimiConfirm } from '@/components/ui/confirm';

@Component({
  selector: 'app-confirm-custom-class-example',
  imports: [MimiButton],
  template: `
    <div class="flex flex-col items-center gap-3">
      <button mimiBtn variant="outline" (click)="archive()">Archivar</button>
      <p class="font-mono text-[13px] text-muted-foreground">resultado: {{ result() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmCustomClassExample {
  private readonly confirm = injectMimiConfirm();
  protected readonly result = signal('—');

  protected async archive(): Promise<void> {
    const ok = await this.confirm({
      title: '¿Archivar el proyecto?',
      description: 'Podrás restaurarlo desde Archivados cuando quieras.',
      // class va al panel y gana: aquí, más ancho y con el radio de los controles.
      class: 'w-[440px] rounded-[var(--mimi-radius)]',
    });
    this.result.set(ok ? 'archivado' : 'cancelado');
  }
}
