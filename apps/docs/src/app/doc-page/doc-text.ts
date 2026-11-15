import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Un trozo de texto: prosa, código (entre comillas invertidas) o un enlace interno. */
export interface TextPart {
  code: boolean;
  text: string;
  /** Ruta del sitio (`/docs/components/textarea`) si es un enlace. */
  href?: string;
}

/** `[Textarea](/docs/components/textarea)`: solo rutas internas del sitio. */
const LINK = /\[([^\]]+)\]\((\/[^)\s]*)\)/g;

/** Los enlaces internos de un texto (`href`), para comprobarlos. */
export function textLinks(text: string): string[] {
  return [...text.matchAll(LINK)].map((m) => m[2]);
}

/** El texto sin la marca de los enlaces (para contar palabras). */
export function plainText(text: string): string {
  return text.replace(LINK, '$1');
}

/**
 * `Usa \`tone\` o [Select](/docs/components/select)` → prosa, código, prosa, enlace. Sin HTML: el
 * texto nunca se interpreta. Dentro del código no hay enlaces.
 */
export function textParts(text: string): TextPart[] {
  return text.split('`').flatMap((chunk, i): TextPart[] => {
    if (i % 2 === 1) return chunk ? [{ code: true, text: chunk }] : [];
    const parts: TextPart[] = [];
    let last = 0;
    for (const m of chunk.matchAll(LINK)) {
      if (m.index > last) parts.push({ code: false, text: chunk.slice(last, m.index) });
      parts.push({ code: false, text: m[1], href: m[2] });
      last = m.index + m[0].length;
    }
    if (last < chunk.length) parts.push({ code: false, text: chunk.slice(last) });
    return parts;
  });
}

/**
 * Texto de la plantilla de página con el código en línea marcado con comillas invertidas y los
 * enlaces internos como `[texto](/ruta)` (`doc-page.types.ts`). Se pinta en línea, dentro del
 * `<p>` o `<li>` de quien lo usa.
 */
@Component({
  selector: 'app-doc-text',
  imports: [RouterLink],
  // En una sola línea y sin espacios entre bloques: el espacio de la plantilla se pintaría
  // delante de la puntuación («`sm` , `md`»). El texto lleva sus propios espacios.
  // prettier-ignore
  template: `@for (part of parts(); track $index) {@if (part.code) {<code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">{{ part.text }}</code>} @else if (part.href) {<a class="font-medium underline underline-offset-4" [routerLink]="part.href">{{ part.text }}</a>} @else {<ng-container>{{ part.text }}</ng-container>}}`,
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocText {
  readonly text = input.required<string>();
  protected readonly parts = computed(() => textParts(this.text()));
}
