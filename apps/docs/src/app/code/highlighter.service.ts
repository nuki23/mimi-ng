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
  /** Lo ya resaltado, por lenguaje y código. */
  private readonly cache = new Map<string, SafeHtml>();

  /**
   * Lo ya resaltado, sin esperar (null si todavía no). CodeBlock lo usa para pintar el código con
   * colores desde el primer momento cuando alguien lo resaltó antes (CodePreview).
   */
  peek(code: string, lang: CodeLang): SafeHtml | null {
    return this.cache.get(`${lang}\n${code}`) ?? null;
  }

  async highlight(code: string, lang: CodeLang): Promise<SafeHtml> {
    const key = `${lang}\n${code}`;
    const cached = this.cache.get(key);
    if (cached) return cached;
    const highlighter = await this.load();
    const html = highlighter.codeToHtml(code, {
      lang,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      // Contraste de 4,5:1 sobre el fondo del código (bg-muted; axe, color-contrast; M.15). En
      // oscuro (#26252D), los comentarios de github-dark (#6A737D) daban 3,14:1 → #959DA5, 5,5:1.
      // En claro (#F5F4FA), cuatro colores de github-light no llegaban: rojo #D73A49 (4,18:1),
      // gris #6A737D (4,4:1), verde #22863A (4,23:1) y naranja #E36209 (3,2:1); se cambian por
      // los de la paleta actual de GitHub: #B31D28, #57606A, #116329 y #953800 (5,8 a 6,8:1).
      colorReplacements: {
        'github-dark': { '#6a737d': '#959da5' },
        'github-light': {
          '#d73a49': '#b31d28',
          '#6a737d': '#57606a',
          '#22863a': '#116329',
          '#e36209': '#953800',
        },
      },
      // Solo los <span>: el <pre> es nuestro y usa el fondo del tema de Mimi (bg-muted).
      structure: 'inline',
    });
    // Shiki pone los colores en atributos style, que el sanitizador de Angular eliminaría.
    // Es seguro saltarlo aquí: el contenido es código fuente propio y estático del showcase
    // (archivos del repositorio y cadenas escritas en el código), nunca texto del usuario, y
    // Shiki escapa el código al generar el HTML.
    const safe = this.sanitizer.bypassSecurityTrustHtml(html);
    this.cache.set(key, safe);
    return safe;
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
