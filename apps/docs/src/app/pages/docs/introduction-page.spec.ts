import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IntroductionPage } from './introduction-page';

describe('IntroductionPage', () => {
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
