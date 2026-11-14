import { TestBed } from '@angular/core/testing';
import { FORMS_KINDS, FORMS_SPECS, formsSnippet } from './forms-snippets';
import { FormsTabs } from './forms-tabs';
import { HighlighterService } from './highlighter.service';

describe('Con formularios (R.13)', () => {
  it('hay un fragmento por componente y por tipo de formulario, cada uno con lo suyo', () => {
    // 18: Textarea con su página propia desde el 13/11/2026.
    expect(Object.keys(FORMS_SPECS).length).toBe(18);
    for (const [key, spec] of Object.entries(FORMS_SPECS)) {
      const signal = formsSnippet(spec, 'signal');
      const reactive = formsSnippet(spec, 'reactive');
      const template = formsSnippet(spec, 'template');
      expect(signal, key).toContain(`[formField]="f.${spec.field}"`);
      expect(signal, key).toContain('@angular/forms/signals');
      expect(reactive, key).toContain(`formControlName="${spec.field}"`);
      expect(reactive, key).toContain('ReactiveFormsModule');
      expect(template, key).toContain(`[(ngModel)]="${spec.field}"`);
      expect(template, key).toContain('FormsModule');
      for (const text of [signal, reactive, template]) {
        expect(text, key).not.toContain('{{attrs}}');
        expect(text, key).toContain(`@/components/ui/${spec.path}`);
        expect(text, key).toContain(`label="${spec.label}"`);
      }
    }
  });

  it('los 7 fragmentos que no compilaban (12/11/2026) quedan bien', () => {
    // Compilados con `ng build` en un proyecto de prueba: Password importaba MimiInput de su
    // archivo, Tree ponía un tipo en `imports` y Number Input enlazaba [min]/[max] junto a
    // [formField] (Signal Forms no lo admite).
    for (const kind of FORMS_KINDS) {
      const password = formsSnippet(FORMS_SPECS['password'], kind);
      expect(password).toContain("import { MimiInput } from '@/components/ui/input';");
      expect(password).toContain("import { MimiPassword } from '@/components/ui/password';");
      const tree = formsSnippet(FORMS_SPECS['tree'], kind);
      expect(tree).toContain("import { MimiTree, type MimiTreeNode } from '@/components/ui/tree';");
      expect(tree).not.toMatch(/imports: \[[^\]]*type /);
    }
    expect(formsSnippet(FORMS_SPECS['number-input'], 'signal')).not.toContain('[min]');
  });

  it('Select y Combobox usan <mimi-option> (la forma normal), sin [options]', () => {
    for (const [key, imports] of [
      ['select', 'MimiSelectImports'],
      ['combobox', 'MimiComboboxImports'],
    ] as const) {
      for (const kind of FORMS_KINDS) {
        const text = formsSnippet(FORMS_SPECS[key], kind);
        expect(text, key).not.toContain('[options]');
        expect(text, key).toContain(`import { ${imports} } from '@/components/ui/${key}';`);
        // El control y sus opciones quedan sangrados dentro de mimi-form-field.
        expect(text, key).toMatch(/\n {6,}<mimi-option value="\w+">\w+<\/mimi-option>\n/);
        expect(text, key).toMatch(new RegExp(`\\n {4,}</mimi-${key}>\\n {2,}</mimi-form-field>`));
      }
    }
  });

  it('cada clave es una página de componente que existe', () => {
    const fs = (
      globalThis as unknown as { process: { getBuiltinModule(id: string): unknown; cwd(): string } }
    ).process.getBuiltinModule('node:fs') as { existsSync(p: string): boolean };
    const base = (globalThis as unknown as { process: { cwd(): string } }).process.cwd();
    for (const key of Object.keys(FORMS_SPECS)) {
      expect(fs.existsSync(`${base}/apps/docs/src/app/pages/docs/components/${key}`), key).toBe(
        true,
      );
    }
  });

  it('el componente pinta las tres pestañas', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(FormsTabs);
    fixture.componentRef.setInput('component', 'select');
    await fixture.whenStable();
    const tabs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('[role="tab"]'),
    ).map((t) => t.textContent?.trim());
    expect(tabs).toEqual(['Signal Forms', 'Reactive Forms', 'Plantilla (ngModel)']);
    expect(FORMS_KINDS.length).toBe(3);
  });

  it('una clave desconocida falla con un mensaje claro', async () => {
    const fixture = TestBed.createComponent(FormsTabs);
    fixture.componentRef.setInput('component', 'nada');
    await expect(fixture.whenStable().then(() => fixture.detectChanges())).rejects.toThrow(
      /no está en FORMS_SPECS/,
    );
  });
});
