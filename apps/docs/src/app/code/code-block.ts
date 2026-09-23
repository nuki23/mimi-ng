import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import type { SafeHtml } from '@angular/platform-browser';
import { CopyButton } from './copy-button';
import { type CodeLang, HighlighterService } from './highlighter.service';

/**
 * Bloque de código con botón copiar. Muestra el código sin colores con la misma fuente e
 * interlineado mientras Shiki carga, así la página no salta; después cambia a la versión
 * resaltada. El <pre> admite foco (tabindex="0") para recorrer el scroll horizontal.
 */
@Component({
  selector: 'app-code-block',
  imports: [CopyButton],
  templateUrl: './code-block.html',
  host: { class: 'block min-w-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeBlock {
  readonly code = input.required<string>();
  readonly lang = input<CodeLang>('bash');
  /** Símbolo delante de un comando de una línea, p. ej. `$`. No se copia. */
  readonly prompt = input<string | null>(null);
  /** Borde y radio propios. Desactívalo si el bloque va dentro de otra tarjeta. */
  readonly bordered = input(true);
  /** Botón copiar. CodePreview lo desactiva porque tiene el suyo. */
  readonly copyable = input(true);
  /** Variante holgada del panel Código de CodePreview (diseño: 260px de alto, 20/24px). */
  readonly roomy = input(false);
  /** aria-label del <pre>, para lectores de pantalla. */
  readonly label = input('Código');

  private readonly highlighter = inject(HighlighterService);
  protected readonly highlighted = signal<SafeHtml | null>(null);
  protected readonly trimmed = computed(() => this.code().replace(/\n+$/, ''));

  /** Clases del <pre>, escritas completas para que Tailwind las detecte. */
  protected readonly preClass = computed(() => {
    const base =
      'min-w-0 flex-1 overflow-x-auto font-mono text-[13px] text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring';
    if (this.roomy()) return `${base} min-h-[260px] px-6 py-5 leading-[1.75]`;
    const left = this.prompt() ? '' : 'pl-5';
    const right = this.copyable() ? '' : 'pr-5';
    return `${base} py-4 leading-[1.7] ${left} ${right}`;
  });

  private readonly highlight = effect((onCleanup) => {
    const code = this.trimmed();
    const lang = this.lang();
    let cancelled = false;
    onCleanup(() => (cancelled = true));
    this.highlighted.set(null);
    this.highlighter
      .highlight(code, lang)
      .then((html) => {
        if (!cancelled) this.highlighted.set(html);
      })
      .catch(() => {
        // Sin resaltado: se queda el código sin colores.
      });
  });
}
