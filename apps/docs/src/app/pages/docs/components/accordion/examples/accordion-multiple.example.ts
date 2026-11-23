import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MimiAccordionImports } from '@/components/ui/accordion';

@Component({
  selector: 'app-accordion-multiple-example',
  imports: [MimiAccordionImports],
  template: `
    <div class="flex w-full max-w-lg flex-col gap-3">
      <mimi-accordion multiple indicator="plus" [(value)]="open">
        <mimi-accordion-item value="perfil" title="Perfil"
          >Nombre, foto y biografía.</mimi-accordion-item
        >
        <mimi-accordion-item value="avisos" title="Avisos"
          >Correo, móvil y resumen semanal.</mimi-accordion-item
        >
        <mimi-accordion-item value="privacidad" title="Privacidad">
          Quién ve tu perfil y tu actividad.
        </mimi-accordion-item>
      </mimi-accordion>
      <p class="text-sm text-muted-foreground">Abiertos: {{ list() }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionMultipleExample {
  protected readonly open = signal<string | readonly string[] | null>(['perfil', 'avisos']);
  protected list(): string {
    const value = this.open();
    return Array.isArray(value) && value.length ? value.join(', ') : '—';
  }
}
