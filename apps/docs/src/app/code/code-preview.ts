import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
} from '@angular/core';
import { LucideCode, LucideEye } from '@lucide/angular';
import { MimiTabsImports } from '@/components/ui/tabs';
import { CodeBlock, trimCode } from './code-block';
import { CopyButton } from './copy-button';
import { type CodeLang, HighlighterService } from './highlighter.service';

/** Un archivo de un ejemplo de varios archivos. */
export interface CodeFile {
  /** Nombre que se ve encima del código (`edit-user-dialog.ts`). */
  name: string;
  /** El archivo importado como texto. */
  code: string;
}

/**
 * Ejemplo en vivo con pestañas Preview/Código (`<mimi-tabs>` en píldora). El ejemplo va por
 * ng-content y `code` es el archivo del mismo ejemplo importado como texto
 * (`with { loader: 'text' }`): el código que se ve es el que corre, nunca una copia escrita a
 * mano. El panel Código se crea al elegirlo; `preserveContent` conserva los dos (el ejemplo no
 * pierde su estado y el código no se vuelve a resaltar).
 */
@Component({
  selector: 'app-code-preview',
  imports: [CodeBlock, CopyButton, LucideCode, LucideEye, MimiTabsImports],
  templateUrl: './code-preview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodePreview {
  /** El archivo del ejemplo (el que corre en Preview). */
  readonly code = input.required<string>();
  readonly lang = input<CodeLang>('angular-ts');
  /**
   * Un ejemplo de varios archivos (por ejemplo, quien abre un diálogo y el componente que se
   * abre): la pestaña Código los muestra uno debajo del otro, con su nombre, y Copiar los copia
   * todos. Sin él, solo `code`.
   */
  readonly files = input<readonly CodeFile[]>([]);

  /** Lo que copia «Copiar»: el archivo, o todos con su nombre. */
  protected readonly copyText = computed(() => {
    const files = this.files();
    return files.length
      ? files.map((file) => `// ${file.name}\n${trimCode(file.code)}`).join('\n\n')
      : this.code();
  });

  /** El borde superior hace de línea de la barra; el anillo de foco va hacia dentro (overflow). */
  protected readonly panelClass = 'border-t p-0 focus-visible:-outline-offset-2';

  private readonly highlighter = inject(HighlighterService);

  constructor() {
    // El código se resalta por adelantado cuando el navegador está libre: al abrir la pestaña
    // Código ya sale con colores (CodeBlock lo toma con peek), sin un instante de texto plano.
    const window = inject(DOCUMENT).defaultView;
    let handle: number | undefined;
    afterNextRender(() => {
      if (!window) return;
      const warm = () =>
        this.highlighter.highlight(trimCode(this.code()), this.lang()).catch(() => undefined);
      handle = window.requestIdleCallback
        ? window.requestIdleCallback(warm, { timeout: 2000 })
        : window.setTimeout(warm, 200);
    });
    inject(DestroyRef).onDestroy(() => {
      if (handle === undefined || !window) return;
      if (window.cancelIdleCallback) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    });
  }
}
