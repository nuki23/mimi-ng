import { ChangeDetectionStrategy, Component, TemplateRef, signal, viewChild } from '@angular/core';
import { LucideUpload } from '@lucide/angular';
import { MimiButton } from '@/components/ui/button';
import { injectMimiConfirm } from '@/components/ui/confirm';

@Component({
  selector: 'app-confirm-icon-example',
  imports: [MimiButton, LucideUpload],
  template: `
    <div class="flex flex-col items-center gap-3">
      <button mimiBtn (click)="publish()">Publicar</button>
      <p class="font-mono text-[13px] text-muted-foreground">resultado: {{ result() }}</p>
    </div>
    <ng-template #upload><svg lucideUpload></svg></ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmIconExample {
  private readonly confirm = injectMimiConfirm();
  private readonly upload = viewChild.required<TemplateRef<unknown>>('upload');
  protected readonly result = signal('—');

  protected async publish(): Promise<void> {
    const ok = await this.confirm({
      title: '¿Publicar los cambios?',
      description: 'Los 3 componentes editados quedarán visibles para todo el equipo.',
      confirmText: 'Publicar',
      icon: this.upload(),
    });
    this.result.set(ok ? 'publicado' : 'cancelado');
  }
}
