import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { HighlighterService } from './highlighter.service';

/** Texto HTML de un SafeHtml marcado como seguro (el sanitizador lo devuelve sin tocar). */
function html(value: SafeHtml): string {
  return TestBed.inject(DomSanitizer).sanitize(SecurityContext.HTML, value) ?? '';
}

describe('HighlighterService (Shiki real)', () => {
  it('resalta con los dos temas en variables CSS, sin <pre> propio', async () => {
    const service = TestBed.inject(HighlighterService);
    const result = html(await service.highlight('const a: number = 1;', 'typescript'));

    expect(result).toContain('--shiki-light:');
    expect(result).toContain('--shiki-dark:');
    expect(result).not.toContain('<pre');
    expect(result).not.toMatch(/background-color/);
  }, 30_000);

  it('los comentarios en oscuro tienen 4,5:1 sobre el fondo del código (axe, color-contrast; M.15)', async () => {
    const service = TestBed.inject(HighlighterService);
    const result = html(await service.highlight('# instala\nng add @mimi-ng/cli', 'bash'));
    // github-dark pinta los comentarios con #6A737D: 3,14:1 sobre bg-muted oscuro (#26252D).
    expect(result.toLowerCase()).not.toContain('--shiki-dark:#6a737d');
    expect(result.toLowerCase()).toContain('--shiki-dark:#959da5');
  }, 30_000);

  it('los colores en claro tienen 4,5:1 sobre el fondo del código (M.15)', async () => {
    const service = TestBed.inject(HighlighterService);
    const result = html(
      await service.highlight("// nota\nimport { a } from 'b';\nconst x = 1;", 'typescript'),
    ).toLowerCase();
    for (const low of ['#d73a49', '#6a737d', '#22863a', '#e36209']) {
      expect(result).not.toContain(`--shiki-light:${low}`);
    }
    expect(result).toContain('--shiki-light:#b31d28');
    expect(result).toContain('--shiki-light:#57606a');
  }, 30_000);

  it('guarda lo resaltado: peek lo devuelve sin esperar y highlight no lo repite', async () => {
    const service = TestBed.inject(HighlighterService);
    expect(service.peek('let x = 1;', 'typescript')).toBeNull();
    const first = await service.highlight('let x = 1;', 'typescript');
    expect(service.peek('let x = 1;', 'typescript')).toBe(first);
    expect(await service.highlight('let x = 1;', 'typescript')).toBe(first);
    // Otro lenguaje, otra entrada.
    expect(service.peek('let x = 1;', 'json')).toBeNull();
  }, 30_000);

  it('reutiliza la misma instancia y resalta plantillas de Angular', async () => {
    const service = TestBed.inject(HighlighterService);
    const [ts, template] = await Promise.all([
      service.highlight("@Component({ template: '<p>{{ a }}</p>' })\nclass A {}", 'angular-ts'),
      service.highlight('@if (a) { <b>{{ a }}</b> }', 'angular-html'),
    ]);
    expect(html(ts)).toContain('--shiki-light:');
    expect(html(template)).toContain('--shiki-dark:');
  }, 30_000);
});
