import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  isDevMode,
} from '@angular/core';
import { CodeBlock } from '../code/code-block';
import { CssVariables } from '../code/css-variables';
import { FormsTabs } from '../code/forms-tabs';
import { InstallCommand } from '../code/install-command';
import { ApiTable } from './api-table';
import { DocExampleView } from './doc-example';
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
    CssVariables,
    DocExampleView,
    DocText,
    FormsTabs,
    InstallCommand,
    InstallExtrasView,
    More,
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

  /** La frase de «Textos»: «… `MIMI_A_TEXT_ES` y `MIMI_B_TEXT_ES` traen el español; …». */
  protected readonly textsSentence = computed(() => {
    const names = (this.page().texts ?? []).map((t) => `\`${t.constant}\``);
    const list =
      names.length > 1 ? `${names.slice(0, -1).join(', ')} y ${names.at(-1)}` : (names[0] ?? '');
    const verb = names.length > 1 ? 'traen' : 'trae';
    return `Los textos propios están en inglés por defecto. ${list} ${verb} el español; lo que no definas sigue en inglés.`;
  });

  /** El código de «Textos»: los proveedores con las constantes en español. */
  protected readonly textsCode = computed(() => {
    const texts = this.page().texts ?? [];
    if (!texts.length) return '';
    const [first] = texts;
    return [
      '// app.config.ts',
      ...texts.map(
        (t) => `import { ${t.constant}, ${t.provider} } from '@/components/ui/${t.path}';`,
      ),
      '',
      'export const appConfig: ApplicationConfig = {',
      '  providers: [',
      ...texts.map((t) => `    ${t.provider}(${t.constant}),${t.note ? ` // ${t.note}` : ''}`),
      `    // o solo algunos: ${first.provider}({ ...${first.constant}, … })`,
      '  ],',
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
