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
