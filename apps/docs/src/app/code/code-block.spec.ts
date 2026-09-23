import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { CodeBlock } from './code-block';
import { HighlighterService } from './highlighter.service';

describe('CodeBlock', () => {
  it('muestra el código sin colores mientras Shiki no terminó de cargar', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(CodeBlock);
    fixture.componentRef.setInput('code', 'const a = 1;\nconst b = "<b>";\n');
    fixture.componentRef.setInput('lang', 'typescript');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const code = el.querySelector('pre code')!;
    // Texto plano completo (sin el salto final), sin los <span style> de Shiki.
    expect(code.textContent).toBe('const a = 1;\nconst b = "<b>";');
    expect(code.querySelector('span[style]')).toBeNull();
    expect(code.hasAttribute('data-highlighted')).toBe(false);
    expect(el.querySelector('pre')?.getAttribute('tabindex')).toBe('0');
  });

  it('cambia al HTML resaltado cuando llega', async () => {
    let resolve!: (html: unknown) => void;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise((r) => (resolve = r)) },
        },
      ],
    });
    const fixture = TestBed.createComponent(CodeBlock);
    fixture.componentRef.setInput('code', 'ls');
    await fixture.whenStable();

    const sanitizer = TestBed.inject(DomSanitizer);
    resolve(sanitizer.bypassSecurityTrustHtml('<span style="--shiki-light:#000">ls</span>'));
    // El .then() del componente corre en una microtarea que whenStable() no rastrea.
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();

    const code = (fixture.nativeElement as HTMLElement).querySelector('pre code')!;
    expect(code.hasAttribute('data-highlighted')).toBe(true);
    expect(code.querySelector('span[style]')?.textContent).toBe('ls');
  });

  it('el prompt no forma parte del texto copiado', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(CodeBlock);
    fixture.componentRef.setInput('code', 'pnpm mimi add button');
    fixture.componentRef.setInput('prompt', '$');
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[aria-hidden="true"]')?.textContent?.trim()).toBe('$');
    expect(el.querySelector('pre')?.textContent).toBe('pnpm mimi add button');
  });
});
