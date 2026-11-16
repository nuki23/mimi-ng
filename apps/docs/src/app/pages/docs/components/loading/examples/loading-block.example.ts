import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';
import { MimiInput } from '@/components/ui/input';
import { MimiBlock } from '@/components/ui/loading';

@Component({
  selector: 'app-loading-block-example',
  imports: [MimiBlock, MimiButton, MimiCardImports, MimiInput],
  template: `
    <section mimiCard class="w-full max-w-sm" [mimiBlock]="saving()" mimiBlockMessage="Guardando…">
      <header mimiCardHeader>
        <h3 mimiCardTitle>Perfil</h3>
        <p mimiCardDescription>Solo esta tarjeta se bloquea mientras guarda.</p>
      </header>
      <div mimiCardContent class="flex flex-col gap-1.5">
        <label for="block-name" class="text-sm font-medium">Nombre</label>
        <input mimiInput id="block-name" value="Ana Torres" />
      </div>
      <footer mimiCardFooter>
        <button mimiBtn (click)="save()">Guardar</button>
      </footer>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingBlockExample {
  protected readonly saving = signal(false);

  protected save(): void {
    this.saving.set(true);
    setTimeout(() => this.saving.set(false), 1500);
  }
}
