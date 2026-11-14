import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MimiTabsImports } from '@/components/ui/tabs';
import { CodeBlock } from './code-block';
import { FORMS_KINDS, FORMS_LABELS, FORMS_SPECS, formsSnippet } from './forms-snippets';

/**
 * «Con formularios» (R.13): el mismo campo con Signal Forms, Reactive Forms y plantilla, en
 * pestañas. Un solo componente para las páginas de todos los componentes de formulario: la página
 * solo dice cuál (`<app-forms-tabs component="select" />`); el código sale de `forms-snippets.ts`.
 */
@Component({
  selector: 'app-forms-tabs',
  imports: [MimiTabsImports, CodeBlock],
  template: `
    <div class="overflow-hidden rounded-card border bg-card">
      <mimi-tabs
        preserveContent
        aria-label="Tipo de formulario"
        class="ms-3 w-full max-w-md border-b-0"
        style="gap: 0"
      >
        @for (tab of tabs(); track tab.id) {
          <mimi-tab [value]="tab.id" [label]="tab.label">
            <app-code-block
              [code]="tab.code"
              lang="angular-ts"
              [bordered]="false"
              label="Código del formulario"
            />
          </mimi-tab>
        }
      </mimi-tabs>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormsTabs {
  /** Clave del componente en `FORMS_SPECS` (la de su página: `select`, `date-picker`…). */
  readonly component = input.required<string>();

  protected readonly tabs = computed(() => {
    const spec = FORMS_SPECS[this.component()];
    if (!spec)
      throw new Error(`[Mimi docs] FormsTabs: «${this.component()}» no está en FORMS_SPECS.`);
    return FORMS_KINDS.map((kind) => ({
      id: kind,
      label: FORMS_LABELS[kind],
      code: formsSnippet(spec, kind),
    }));
  });
}
