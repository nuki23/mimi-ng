import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Un trozo de texto: prosa o código (lo que va entre comillas invertidas). */
export interface TextPart {
  code: boolean;
  text: string;
}

/** `Usa \`tone\` para…` → prosa, código, prosa. Sin HTML: el texto nunca se interpreta. */
export function textParts(text: string): TextPart[] {
  return text
    .split('`')
    .map((part, i) => ({ code: i % 2 === 1, text: part }))
    .filter((part) => part.text);
}

/**
 * Texto de la plantilla de página con el código en línea marcado con comillas invertidas
 * (`doc-page.types.ts`). Se pinta en línea, dentro del `<p>` o `<li>` de quien lo usa.
 */
@Component({
  selector: 'app-doc-text',
  template: `
    @for (part of parts(); track $index) {
      @if (part.code) {
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">{{
          part.text
        }}</code>
      } @else {
        {{ part.text }}
      }
    }
  `,
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocText {
  readonly text = input.required<string>();
  protected readonly parts = computed(() => textParts(this.text()));
}
