import { NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  isDevMode,
} from '@angular/core';
import { CodeBlock } from '../code/code-block';
import { CodePreview } from '../code/code-preview';
import { CssVariables } from '../code/css-variables';
import { FormsTabs } from '../code/forms-tabs';
import { InstallCommand } from '../code/install-command';
import { ApiTable } from './api-table';
import { DocText } from './doc-text';
import { validateDocPage } from './doc-page.rules';
import {
  DOC_API_TITLES,
  DOC_EXAMPLE_CATEGORIES,
  DOC_FORMS_ID,
  DOC_SECTION_TITLES,
  type DocExample,
  type DocPage,
} from './doc-page.types';
import { InstallExtrasView } from './install-extras';
import { More } from './more';

/** Un bloque de «Ejemplos», ya en orden: un ejemplo o las pestañas de formularios. */
type ExampleBlock = { kind: 'example'; example: DocExample } | { kind: 'forms'; spec: string };

/**
 * La página de un componente (`docs/spec/plantilla-pagina.md`). Pinta la configuración `DocPage`
 * con el orden, los nombres y los `id` fijos de la plantilla: las páginas no escriben
 * encabezados. En desarrollo, avisa en la consola de lo que no cumple (`validateDocPage`).
 */
@Component({
  selector: 'app-doc-page',
  imports: [
    ApiTable,
    CodeBlock,
    CodePreview,
    CssVariables,
    DocText,
    FormsTabs,
    InstallCommand,
    InstallExtrasView,
    More,
    NgComponentOutlet,
    NgTemplateOutlet,
  ],
  templateUrl: './doc-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocPageView {
  readonly page = input.required<DocPage>();

  protected readonly sections = DOC_SECTION_TITLES;
  protected readonly apiTitles = DOC_API_TITLES;
  protected readonly formsId = DOC_FORMS_ID;
  protected readonly h2 = 'mt-7 border-b pb-2.5 text-2xl font-bold tracking-[-0.02em]';
  protected readonly h3 = 'mt-2 text-lg font-semibold tracking-[-0.01em]';

  /** Los ejemplos en el orden fijo de las categorías; las pestañas, al empezar «Formularios». */
  protected readonly blocks = computed<ExampleBlock[]>(() => {
    const page = this.page();
    return DOC_EXAMPLE_CATEGORIES.flatMap((category): ExampleBlock[] => {
      const examples = (page.examples[category] ?? []).map((example): ExampleBlock => ({
        kind: 'example',
        example,
      }));
      return category === 'forms' && page.forms
        ? [{ kind: 'forms', spec: page.forms }, ...examples]
        : examples;
    });
  });

  /** El código de «Textos»: el proveedor con la constante en español. */
  protected readonly textsCode = computed(() => {
    const texts = this.page().texts;
    if (!texts) return '';
    const { constant, provider, path } = texts;
    return [
      '// app.config.ts',
      `import { ${constant}, ${provider} } from '@/components/ui/${path}';`,
      '',
      'export const appConfig: ApplicationConfig = {',
      `  providers: [${provider}(${constant})],`,
      `  // o solo algunos: ${provider}({ ...${constant}, … })`,
      '};',
    ].join('\n');
  });

  constructor() {
    effect(() => {
      if (!isDevMode()) return;
      const page = this.page();
      for (const error of validateDocPage(page)) console.warn(`[Mimi docs] ${page.name}: ${error}`);
    });
  }
}
