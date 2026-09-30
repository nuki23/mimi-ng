import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../code/code-block';
import { CodePreview } from '../code/code-preview';
import type { CodeLang } from '../code/highlighter.service';
import { InstallCommand } from '../code/install-command';
import { PreviewDemoExample } from './examples/preview-demo.example';
// @ts-expect-error TypeScript todavía no tipa los import attributes (spec, sección 10).
import previewDemoSource from './examples/preview-demo.example' with { loader: 'text' };

/** Página interna (/dev/code) para probar CodePreview, CodeBlock e InstallCommand. No aparece en el menú. */
@Component({
  selector: 'app-code-page',
  imports: [CodeBlock, CodePreview, InstallCommand, PreviewDemoExample],
  template: `
    <div class="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
      <div class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold tracking-tight">Código</h1>
        <p class="text-sm text-muted-foreground">
          Página interna para probar CodePreview, CodeBlock e InstallCommand.
        </p>
      </div>

      <section class="flex flex-col gap-3">
        <h2 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          CodePreview
        </h2>
        <app-code-preview [code]="previewDemoSource">
          <app-preview-demo-example />
        </app-code-preview>
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          InstallCommand
        </h2>
        <app-install-command name="button" />
      </section>

      <section class="flex flex-col gap-3">
        <h2 class="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          CodeBlock por lenguaje
        </h2>
        @for (sample of samples; track sample.lang) {
          <p class="font-mono text-xs text-muted-foreground">{{ sample.lang }}</p>
          <app-code-block
            [code]="sample.code"
            [lang]="sample.lang"
            [prompt]="sample.prompt ?? null"
          />
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodePage {
  /** Código fuente real de PreviewDemoExample, importado como texto. */
  protected readonly previewDemoSource: string = previewDemoSource;

  protected readonly samples: { lang: CodeLang; code: string; prompt?: string }[] = [
    { lang: 'bash', code: 'ng g ui button input card', prompt: '$' },
    {
      lang: 'angular-html',
      code: '@if (user(); as user) {\n  <button mimiBtn (click)="save()">Guardar {{ user.name }}</button>\n}',
    },
    { lang: 'html', code: '<input mimiInput type="email" placeholder="tu@correo.com" />' },
    {
      lang: 'typescript',
      code: "export const mimiTheme: MimiThemePreset = {\n  radius: '0.375rem',\n  colors: { primary: 'oklch(0.55 0.22 285)' },\n};",
    },
    {
      lang: 'css',
      code: ':root {\n  --mimi-primary: oklch(0.205 0 0);\n  --mimi-radius: 0.75rem;\n}',
    },
    { lang: 'json', code: '{\n  "plugins": { "@tailwindcss/postcss": {} }\n}' },
  ];
}
