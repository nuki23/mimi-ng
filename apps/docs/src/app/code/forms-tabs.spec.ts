import { TestBed } from '@angular/core/testing';
import { FORMS_KINDS, FORMS_SPECS, formsSnippet } from './forms-snippets';
import { FormsTabs } from './forms-tabs';
import { HighlighterService } from './highlighter.service';

describe('Con formularios (R.13)', () => {
  it('hay un fragmento por componente y por tipo de formulario, cada uno con lo suyo', () => {
    expect(Object.keys(FORMS_SPECS).length).toBe(17);
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
