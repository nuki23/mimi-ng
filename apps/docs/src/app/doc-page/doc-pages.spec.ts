import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PAGE_EXAMPLES_TIMEOUT, settle } from '../code/code-preview.testing';
import { HighlighterService } from '../code/highlighter.service';
import { DOCS_NAV } from '../layout/docs-nav';
import { BUTTON_PAGE } from '../pages/docs/components/button/button.page';
import { ButtonPage } from '../pages/docs/components/button/button-page';
import { COMBOBOX_PAGE } from '../pages/docs/components/combobox/combobox.page';
import { ComboboxPage } from '../pages/docs/components/combobox/combobox-page';
import { DIALOG_PAGE } from '../pages/docs/components/dialog/dialog.page';
import { DialogPage } from '../pages/docs/components/dialog/dialog-page';
import { FORM_FIELD_PAGE } from '../pages/docs/components/form-field/form-field.page';
import { FormFieldPage } from '../pages/docs/components/form-field/form-field-page';
import { INPUT_PAGE } from '../pages/docs/components/input/input.page';
import { InputPage } from '../pages/docs/components/input/input-page';
import { SELECT_PAGE } from '../pages/docs/components/select/select.page';
import { TOOLBAR_PAGE } from '../pages/docs/components/toolbar/toolbar.page';
import { ToolbarPage } from '../pages/docs/components/toolbar/toolbar-page';
import { SelectPage } from '../pages/docs/components/select/select-page';
import { SWITCH_PAGE } from '../pages/docs/components/switch/switch.page';
import { SwitchPage } from '../pages/docs/components/switch/switch-page';
import { CHECKBOX_PAGE } from '../pages/docs/components/checkbox/checkbox.page';
import { CheckboxPage } from '../pages/docs/components/checkbox/checkbox-page';
import { TEXTAREA_PAGE } from '../pages/docs/components/textarea/textarea.page';
import { TextareaPage } from '../pages/docs/components/textarea/textarea-page';
import { PASSWORD_PAGE } from '../pages/docs/components/password/password.page';
import { PasswordPage } from '../pages/docs/components/password/password-page';
import { INPUT_OTP_PAGE } from '../pages/docs/components/input-otp/input-otp.page';
import { InputOtpPage } from '../pages/docs/components/input-otp/input-otp-page';
import { NUMBER_INPUT_PAGE } from '../pages/docs/components/number-input/number-input.page';
import { NumberInputPage } from '../pages/docs/components/number-input/number-input-page';
import { INPUT_MASK_PAGE } from '../pages/docs/components/input-mask/input-mask.page';
import { InputMaskPage } from '../pages/docs/components/input-mask/input-mask-page';
import { TAGS_INPUT_PAGE } from '../pages/docs/components/tags-input/tags-input.page';
import { TagsInputPage } from '../pages/docs/components/tags-input/tags-input-page';
import { TOAST_PAGE } from '../pages/docs/components/toast/toast.page';
import { ToastPage } from '../pages/docs/components/toast/toast-page';
import { CONFIRM_PAGE } from '../pages/docs/components/confirm/confirm.page';
import { ConfirmPage } from '../pages/docs/components/confirm/confirm-page';
import { COMMAND_PAGE } from '../pages/docs/components/command/command.page';
import { CommandPage } from '../pages/docs/components/command/command-page';
import { TOOLTIP_PAGE } from '../pages/docs/components/tooltip/tooltip.page';
import { TooltipPage } from '../pages/docs/components/tooltip/tooltip-page';
import { POPOVER_PAGE } from '../pages/docs/components/popover/popover.page';
import { PopoverPage } from '../pages/docs/components/popover/popover-page';
import { DROPDOWN_MENU_PAGE } from '../pages/docs/components/dropdown-menu/dropdown-menu.page';
import { DropdownMenuPage } from '../pages/docs/components/dropdown-menu/dropdown-menu-page';
import { CONTEXT_MENU_PAGE } from '../pages/docs/components/context-menu/context-menu.page';
import { ContextMenuPage } from '../pages/docs/components/context-menu/context-menu-page';
import { DATA_TABLE_PAGE } from '../pages/docs/components/data-table/data-table.page';
import { DataTablePage } from '../pages/docs/components/data-table/data-table-page';
import { TABLE_PAGE } from '../pages/docs/components/table/table.page';
import { TablePage } from '../pages/docs/components/table/table-page';
import { SHEET_PAGE } from '../pages/docs/components/sheet/sheet.page';
import { SheetPage } from '../pages/docs/components/sheet/sheet-page';
import { ACCORDION_PAGE } from '../pages/docs/components/accordion/accordion.page';
import { AccordionPage } from '../pages/docs/components/accordion/accordion-page';
import { STEPPER_PAGE } from '../pages/docs/components/stepper/stepper.page';
import { StepperPage } from '../pages/docs/components/stepper/stepper-page';
import { LOADING_PAGE } from '../pages/docs/components/loading/loading.page';
import { LoadingPage } from '../pages/docs/components/loading/loading-page';
import { TREE_PAGE } from '../pages/docs/components/tree/tree.page';
import { TreePage } from '../pages/docs/components/tree/tree-page';
import { SORTABLE_LIST_PAGE } from '../pages/docs/components/sortable-list/sortable-list.page';
import { SortableListPage } from '../pages/docs/components/sortable-list/sortable-list-page';
import { PAGINATION_PAGE } from '../pages/docs/components/pagination/pagination.page';
import { PaginationPage } from '../pages/docs/components/pagination/pagination-page';
import { DATE_PICKER_PAGE } from '../pages/docs/components/date-picker/date-picker.page';
import { DatePickerPage } from '../pages/docs/components/date-picker/date-picker-page';
import { DATE_RANGE_PAGE } from '../pages/docs/components/date-range/date-range.page';
import { DateRangePage } from '../pages/docs/components/date-range/date-range-page';
import { COLOR_PICKER_PAGE } from '../pages/docs/components/color-picker/color-picker.page';
import { ColorPickerPage } from '../pages/docs/components/color-picker/color-picker-page';
import { FILE_UPLOAD_PAGE } from '../pages/docs/components/file-upload/file-upload.page';
import { FileUploadPage } from '../pages/docs/components/file-upload/file-upload-page';
import { SLIDER_PAGE } from '../pages/docs/components/slider/slider.page';
import { SliderPage } from '../pages/docs/components/slider/slider-page';
import { BADGE_PAGE } from '../pages/docs/components/badge/badge.page';
import { BadgePage } from '../pages/docs/components/badge/badge-page';
import { AVATAR_PAGE } from '../pages/docs/components/avatar/avatar.page';
import { AvatarPage } from '../pages/docs/components/avatar/avatar-page';
import { CARD_PAGE } from '../pages/docs/components/card/card.page';
import { CardPage } from '../pages/docs/components/card/card-page';
import { SEPARATOR_PAGE } from '../pages/docs/components/separator/separator.page';
import { SeparatorPage } from '../pages/docs/components/separator/separator-page';
import { SKELETON_PAGE } from '../pages/docs/components/skeleton/skeleton.page';
import { SkeletonPage } from '../pages/docs/components/skeleton/skeleton-page';
import { PROGRESS_PAGE } from '../pages/docs/components/progress/progress.page';
import { ProgressPage } from '../pages/docs/components/progress/progress-page';
import { TABS_PAGE } from '../pages/docs/components/tabs/tabs.page';
import { TabsPage } from '../pages/docs/components/tabs/tabs-page';
import { TOGGLE_GROUP_PAGE } from '../pages/docs/components/toggle-group/toggle-group.page';
import { ToggleGroupPage } from '../pages/docs/components/toggle-group/toggle-group-page';
import { allTexts, liveExamples, validateDocPage } from './doc-page.rules';
import { textLinks } from './doc-text';
import {
  DOC_API_SECTIONS,
  DOC_EXAMPLE_CATEGORIES,
  DOC_FORMS_ID,
  DOC_SECTIONS,
  type DocPage,
} from './doc-page.types';

/**
 * La plantilla de las páginas de componentes (`docs/spec/plantilla-pagina.md`; PD-4 variante A y
 * PD-4c, decididos por el usuario el 14/11/2026). Falla si una página de componente (actual o
 * futura: cada carpeta de `pages/docs/components/` y cada ítem `ready` del menú) no usa
 * `<app-doc-page>`, si le falta una sección, si cambia el orden, si pasa de un límite o si un
 * ejemplo no tiene su frase. Sustituye a `short-use-pages.spec.ts` (R.24): la medida del bloque
 * «Uso» es la de `usage.code`. Desde el 14/11/2026 todas las páginas usan la plantilla: la lista de
 * pendientes de la migración (DP.0 a DP.5) se vació y se quitó.
 *
 * Si una página no cabe, se rediseña el ejemplo o se pide una excepción al usuario (y queda en
 * la spec de la plantilla, con su fecha): esta prueba no se cambia por cuenta propia.
 */

// --- Las páginas: su configuración y su componente de ruta ------------------------------------

/**
 * Cada página de componente se registra aquí: una carpeta nueva en `pages/docs/components/` (un
 * componente nuevo) que no esté en esta lista hace fallar la prueba.
 */
const PAGES: Record<string, { page: DocPage; component: Type<unknown> }> = {
  'toggle-group': { page: TOGGLE_GROUP_PAGE, component: ToggleGroupPage },
  tabs: { page: TABS_PAGE, component: TabsPage },
  progress: { page: PROGRESS_PAGE, component: ProgressPage },
  skeleton: { page: SKELETON_PAGE, component: SkeletonPage },
  separator: { page: SEPARATOR_PAGE, component: SeparatorPage },
  card: { page: CARD_PAGE, component: CardPage },
  avatar: { page: AVATAR_PAGE, component: AvatarPage },
  badge: { page: BADGE_PAGE, component: BadgePage },
  slider: { page: SLIDER_PAGE, component: SliderPage },
  'file-upload': { page: FILE_UPLOAD_PAGE, component: FileUploadPage },
  'color-picker': { page: COLOR_PICKER_PAGE, component: ColorPickerPage },
  'date-range': { page: DATE_RANGE_PAGE, component: DateRangePage },
  'date-picker': { page: DATE_PICKER_PAGE, component: DatePickerPage },
  pagination: { page: PAGINATION_PAGE, component: PaginationPage },
  'sortable-list': { page: SORTABLE_LIST_PAGE, component: SortableListPage },
  tree: { page: TREE_PAGE, component: TreePage },
  'data-table': { page: DATA_TABLE_PAGE, component: DataTablePage },
  table: { page: TABLE_PAGE, component: TablePage },
  loading: { page: LOADING_PAGE, component: LoadingPage },
  sheet: { page: SHEET_PAGE, component: SheetPage },
  accordion: { page: ACCORDION_PAGE, component: AccordionPage },
  stepper: { page: STEPPER_PAGE, component: StepperPage },
  'context-menu': { page: CONTEXT_MENU_PAGE, component: ContextMenuPage },
  'dropdown-menu': { page: DROPDOWN_MENU_PAGE, component: DropdownMenuPage },
  popover: { page: POPOVER_PAGE, component: PopoverPage },
  tooltip: { page: TOOLTIP_PAGE, component: TooltipPage },
  command: { page: COMMAND_PAGE, component: CommandPage },
  confirm: { page: CONFIRM_PAGE, component: ConfirmPage },
  toast: { page: TOAST_PAGE, component: ToastPage },
  'tags-input': { page: TAGS_INPUT_PAGE, component: TagsInputPage },
  'input-mask': { page: INPUT_MASK_PAGE, component: InputMaskPage },
  'number-input': { page: NUMBER_INPUT_PAGE, component: NumberInputPage },
  'input-otp': { page: INPUT_OTP_PAGE, component: InputOtpPage },
  password: { page: PASSWORD_PAGE, component: PasswordPage },
  textarea: { page: TEXTAREA_PAGE, component: TextareaPage },
  checkbox: { page: CHECKBOX_PAGE, component: CheckboxPage },
  button: { page: BUTTON_PAGE, component: ButtonPage },
  combobox: { page: COMBOBOX_PAGE, component: ComboboxPage },
  dialog: { page: DIALOG_PAGE, component: DialogPage },
  'form-field': { page: FORM_FIELD_PAGE, component: FormFieldPage },
  input: { page: INPUT_PAGE, component: InputPage },
  toolbar: { page: TOOLBAR_PAGE, component: ToolbarPage },
  select: { page: SELECT_PAGE, component: SelectPage },
  switch: { page: SWITCH_PAGE, component: SwitchPage },
};

/** Excepciones a los límites, cada una aprobada por el usuario (en la spec de la plantilla). */
const EXCEPTIONS: Record<string, readonly string[]> = {};

// --- Acceso al sistema de archivos (las pruebas corren en Node; ver commands.spec.ts) ----------

const docNode = (
  globalThis as unknown as { process: { cwd(): string; getBuiltinModule(id: string): unknown } }
).process;
const docFs = docNode.getBuiltinModule('node:fs') as {
  readdirSync(p: string): string[];
  existsSync(p: string): boolean;
  readFileSync(p: string, e: 'utf8'): string;
  statSync(p: string): { isDirectory(): boolean };
};
const ROOT = docNode.cwd();
const PAGES_DIR = `${ROOT}/apps/docs/src/app/pages/docs/components/`;
const UI_DIR = `${ROOT}/packages/ui-core/src/lib/components/`;

const dirs = docFs
  .readdirSync(PAGES_DIR)
  .filter((d) => docFs.statSync(`${PAGES_DIR}${d}`).isDirectory())
  .sort();
const read = (path: string) => docFs.readFileSync(path, 'utf8');

/** El `*-page.ts` de una página: solo pinta `<app-doc-page [page]="page" />`. */
const WRAPPER = /template:\s*'<app-doc-page \[page\]="page" \/>'/;

// --- Pruebas -----------------------------------------------------------------------------------

describe('Plantilla de las páginas de componentes (doc-pages)', () => {
  it('hay páginas que comprobar', () => {
    expect(dirs.length).toBeGreaterThan(30);
  });

  it('cada carpeta tiene su <nombre>.page.ts y está registrada en PAGES (sin pendientes)', () => {
    for (const dir of dirs) {
      expect(docFs.existsSync(`${PAGES_DIR}${dir}/${dir}.page.ts`), `${dir}: falta .page.ts`).toBe(
        true,
      );
      expect(PAGES[dir], `${dir}: regístrala en PAGES`).toBeDefined();
    }
    for (const dir of Object.keys(PAGES)) expect(dirs).toContain(dir);
  });

  it('cada ítem del menú en /docs/components/ tiene su carpeta', () => {
    const items = DOCS_NAV.flatMap((s) => s.items).filter(
      (i) => i.status === 'ready' && i.path.startsWith('/docs/components/'),
    );
    expect(items.length).toBeGreaterThan(30);
    for (const item of items) expect(dirs).toContain(item.path.split('/').pop());
  });

  for (const [dir, { page, component }] of Object.entries(PAGES)) {
    describe(dir, () => {
      const base = `${PAGES_DIR}${dir}/${dir}`;

      it('su *-page.ts solo pinta <app-doc-page> y no tiene HTML propio', () => {
        expect(read(`${base}-page.ts`)).toMatch(WRAPPER);
        expect(docFs.existsSync(`${base}-page.html`)).toBe(false);
        expect(page.install).toBe(dir);
      });

      it('cumple la plantilla (secciones, límites, frases y nombres internos)', () => {
        const allowed = EXCEPTIONS[dir] ?? [];
        expect(validateDocPage(page).filter((e) => !allowed.some((a) => e.includes(a)))).toEqual(
          [],
        );
      });

      it('tiene «Textos» si el componente tiene textos propios', () => {
        const hasTexts =
          docFs.existsSync(`${UI_DIR}${dir}/${dir}-texts.ts`) ||
          /provideMimi\w+Text\(/.test(read(`${base}-page.ts`));
        if (hasTexts) expect(page.texts?.length, 'falta «texts»').toBeGreaterThan(0);
      });

      it('los enlaces internos van a páginas que existen', () => {
        const ready = new Set(
          DOCS_NAV.flatMap((s) => s.items)
            .filter((i) => i.status === 'ready')
            .map((i) => i.path),
        );
        for (const href of allTexts(page).flatMap(textLinks)) expect(ready).toContain(href);
      });

      it('el h1 es el título del menú', () => {
        const item = DOCS_NAV.flatMap((s) => s.items).find(
          (i) => i.path === `/docs/components/${dir}`,
        );
        expect(item?.title).toBe(page.name);
      });

      it(
        'al pintarla: secciones en orden, ejemplos en su categoría y cada uno con su frase',
        async () => {
          TestBed.configureTestingModule({
            providers: [
              provideRouter([]),
              {
                provide: HighlighterService,
                useValue: { highlight: () => new Promise(() => undefined) },
              },
            ],
          });
          const fixture = TestBed.createComponent(component);
          await settle(fixture);
          const el = fixture.nativeElement as HTMLElement;
          const article = el.querySelector('article[data-slot="doc-page"]')!;
          expect(article).not.toBeNull();

          const h2 = Array.from(article.querySelectorAll('h2[id]')).map((h) => h.id);
          expect(h2).toEqual(
            DOC_SECTIONS.filter((s) => s !== 'examples' || liveExamples(page).length || page.forms),
          );
          expect(article.querySelectorAll('h2').length).toBe(h2.length);

          const exampleIds = DOC_EXAMPLE_CATEGORIES.flatMap((c) => [
            ...(c === 'forms' && page.forms ? [DOC_FORMS_ID] : []),
            ...(page.examples[c] ?? []).map((e) => e.id),
          ]);
          const apiIds = DOC_API_SECTIONS.filter((s) =>
            s === 'inputs'
              ? true
              : s === 'outputs'
                ? page.api.outputs?.length
                : s === 'parts'
                  ? page.api.parts?.length
                  : s === 'service'
                    ? page.api.service?.length
                    : s === 'texts'
                      ? page.texts?.length
                      : page.tokens,
          );
          const h3 = Array.from(article.querySelectorAll('h3[id]')).map((h) => h.id);
          expect(h3).toEqual([...exampleIds, ...apiIds]);

          const previews = Array.from(article.querySelectorAll('app-code-preview'));
          expect(previews.length).toBe(liveExamples(page).length + 1);
          for (const preview of previews) {
            const sentence = preview.previousElementSibling;
            expect(sentence?.getAttribute('data-slot')).toBe('example-sentence');
            expect(sentence?.textContent?.trim()).not.toBe('');
            // El lienzo: los puntos decorativos y, después, el ejemplo pintado.
            const canvas = preview.querySelector('[data-slot="example"]');
            const host = canvas?.lastElementChild;
            expect(host && host !== canvas?.firstElementChild, 'el ejemplo no corre').toBe(true);
            expect(host!.innerHTML.trim()).not.toBe('');
          }
          expect(article.querySelector('app-install-command')).not.toBeNull();
          expect(article.querySelector('app-install-extras')).not.toBeNull();
        },
        PAGE_EXAMPLES_TIMEOUT,
      );
    });
  }
});
