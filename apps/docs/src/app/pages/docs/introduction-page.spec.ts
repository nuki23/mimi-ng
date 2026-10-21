import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FOUNDATION_PACKAGES } from './foundations-page';
import { INTRODUCTION_COMPONENTS, IntroductionPage } from './introduction-page';

describe('IntroductionPage', () => {
  it('lista todos los componentes del registro, sin «próximamente»', async () => {
    // FOUNDATION_PACKAGES ya se compara con registry.json en foundations-page.spec.ts.
    expect(INTRODUCTION_COMPONENTS.map((c) => c.id).sort()).toEqual(
      Object.keys(FOUNDATION_PACKAGES).sort(),
    );

    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(IntroductionPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const chips = el.querySelectorAll('#components + div > span');
    expect(chips.length).toBe(INTRODUCTION_COMPONENTS.length);
    expect(el.textContent).not.toContain('próximamente');
  });

  it('termina con «Por qué "Mimi"», con su h2 para la TOC', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(IntroductionPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const headings = Array.from(el.querySelectorAll('h2[id]'));
    const last = headings.at(-1)!;
    expect(last.id).toBe('why-mimi');
    expect(last.textContent?.trim()).toBe('Por qué "Mimi"');
    expect(el.textContent).toContain('Mimi viene de "mi, mi"');
    expect(el.textContent).toContain('Mimi nació como "lo mío". Su promesa es que sea tuyo.');
  });
});
