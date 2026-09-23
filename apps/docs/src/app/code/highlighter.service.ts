import { Injectable, inject } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import type { HighlighterCore } from 'shiki/core';

/** Lenguajes que carga el showcase. `angular-ts` resalta también las plantillas en línea. */
export type CodeLang =
  'angular-html' | 'angular-ts' | 'html' | 'typescript' | 'css' | 'bash' | 'json';

/**
 * Resaltado con Shiki. Se carga con import() dinámico la primera vez que se pide (no entra
 * en el bundle inicial) y todas las llamadas comparten una sola instancia. Usa el núcleo de
 * Shiki con el motor de expresiones regulares en JavaScript (sin WebAssembly) y el modo dual
 * de temas: los colores quedan en --shiki-light / --shiki-dark y styles.css elige según .dark.
 */
@Injectable({ providedIn: 'root' })
export class HighlighterService {
  private readonly sanitizer = inject(DomSanitizer);
  private highlighter: Promise<HighlighterCore> | null = null;

  async highlight(code: string, lang: CodeLang): Promise<SafeHtml> {
    const highlighter = await this.load();
    const html = highlighter.codeToHtml(code, {
      lang,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      // Solo los <span>: el <pre> es nuestro y usa el fondo del tema de Mimi (bg-muted).
      structure: 'inline',
    });
    // Shiki pone los colores en atributos style, que el sanitizador de Angular eliminaría.
    // Es seguro saltarlo aquí: el contenido es código fuente propio y estático del showcase
    // (archivos del repositorio y cadenas escritas en el código), nunca texto del usuario, y
    // Shiki escapa el código al generar el HTML.
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private load(): Promise<HighlighterCore> {
    this.highlighter ??= Promise.all([
      import('shiki/core'),
      import('shiki/engine/javascript'),
    ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
      createHighlighterCore({
        engine: createJavaScriptRegexEngine(),
        themes: [import('@shikijs/themes/github-light'), import('@shikijs/themes/github-dark')],
        langs: [
          import('@shikijs/langs/angular-html'),
          import('@shikijs/langs/angular-ts'),
          import('@shikijs/langs/html'),
          import('@shikijs/langs/typescript'),
          import('@shikijs/langs/css'),
          import('@shikijs/langs/bash'),
          import('@shikijs/langs/json'),
        ],
      }),
    );
    // Si falla la carga, se permite reintentar la próxima vez.
    this.highlighter.catch(() => (this.highlighter = null));
    return this.highlighter;
  }
}
