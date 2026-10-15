import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiButton } from '@/components/ui/button';
import { MimiTabsImports } from '@/components/ui/tabs';

@Component({
  selector: 'app-tabs-controlled-example',
  imports: [MimiTabsImports, MimiButton],
  template: `
    <div class="flex w-full flex-col gap-4">
      <div class="flex flex-wrap items-center gap-2">
        <button mimiBtn size="sm" variant="outline" (click)="tab.set('details')">Detalles</button>
        <button mimiBtn size="sm" variant="outline" (click)="tab.set('reviews')">Reseñas</button>
        <button mimiBtn size="sm" variant="outline" (click)="loadQuestions()">
          Ir a Preguntas (llegan en 1 s)
        </button>
        <span class="font-mono text-[13px] text-muted-foreground">value: {{ tab() }}</span>
      </div>
      <mimi-tabs [(value)]="tab" aria-label="Producto">
        <ng-template mimiTab="details" label="Detalles">
          <p class="text-sm text-muted-foreground">Algodón orgánico, talla M.</p>
        </ng-template>
        <ng-template mimiTab="reviews" label="Reseñas" [count]="12">
          <p class="text-sm text-muted-foreground">4,8 de 5 en 12 reseñas.</p>
        </ng-template>
        @if (questions()) {
          <ng-template mimiTab="questions" label="Preguntas">
            <p class="text-sm text-muted-foreground">Llegó después y quedó elegida.</p>
          </ng-template>
        }
      </mimi-tabs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsControlledExample {
  protected readonly tab = signal<string | undefined>('details');
  protected readonly questions = signal(false);

  /** El valor llega antes que su pestaña (por ejemplo, desde la URL): no se pierde. */
  protected loadQuestions(): void {
    this.questions.set(false);
    this.tab.set('questions');
    setTimeout(() => this.questions.set(true), 1000);
  }
}
