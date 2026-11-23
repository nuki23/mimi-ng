import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiAccordionImports } from '@/components/ui/accordion';
import { MimiButton } from '@/components/ui/button';

@Component({
  selector: 'app-accordion-controlled-example',
  imports: [MimiAccordionImports, MimiButton],
  template: `
    <div class="flex w-full max-w-lg flex-col gap-3">
      <div class="flex gap-2">
        <button mimiBtn variant="outline" size="sm" (click)="open.set(all)">Abrir todo</button>
        <button mimiBtn variant="outline" size="sm" (click)="open.set([])">Cerrar todo</button>
      </div>
      <mimi-accordion multiple [(value)]="open">
        @for (step of steps; track step.id) {
          <mimi-accordion-item [value]="step.id" [title]="step.title">{{
            step.text
          }}</mimi-accordion-item>
        }
      </mimi-accordion>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionControlledExample {
  protected readonly steps = [
    { id: 'cuenta', title: '1. Crea tu cuenta', text: 'Con tu correo o con Google.' },
    { id: 'equipo', title: '2. Invita a tu equipo', text: 'Hasta 5 personas en el plan gratis.' },
    { id: 'proyecto', title: '3. Empieza un proyecto', text: 'Desde cero o con una plantilla.' },
  ];
  protected readonly all = this.steps.map((step) => step.id);
  protected readonly open = signal<string | readonly string[] | null>([]);
}
