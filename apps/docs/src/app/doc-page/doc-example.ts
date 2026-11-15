import {
  ChangeDetectionStrategy,
  Component,
  ViewContainerRef,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { CodePreview } from '../code/code-preview';
import { DocText } from './doc-text';
import type { DocExample } from './doc-page.types';

/**
 * Un ejemplo de la plantilla: su frase y el ejemplo con Vista y Código. El ejemplo se crea con
 * `ViewContainerRef.createComponent`, no con `NgComponentOutlet` ni `NgTemplateOutlet`: esos
 * vienen del módulo común de `@angular/common`, que esbuild movía al JS inicial del sitio
 * (+3,7 kB, medido el 14/11/2026).
 */
@Component({
  selector: 'app-doc-example',
  imports: [CodePreview, DocText],
  template: `
    <p
      data-slot="example-sentence"
      class="text-pretty"
      [class.text-sm]="demo()"
      [class.text-muted-foreground]="demo()"
    >
      <app-doc-text [text]="example().sentence" />
    </p>
    <app-code-preview [code]="example().source" [files]="example().files ?? []">
      <ng-container #host />
    </app-code-preview>
  `,
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocExampleView {
  readonly example = input.required<DocExample>();
  /** La demo principal: la frase va más discreta (la cabecera ya la presenta). */
  readonly demo = input(false);

  private readonly host = viewChild.required('host', { read: ViewContainerRef });

  constructor() {
    effect(() => {
      const host = this.host();
      host.clear();
      host.createComponent(this.example().component);
    });
  }
}
