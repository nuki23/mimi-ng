import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TokensPage } from './tokens-page';

describe('TokensPage', () => {
  let html: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TokensPage] }).compileComponents();
    html = TestBed.inject(DOCUMENT).documentElement;
    html.classList.remove('dark');
  });

  afterEach(() => {
    html.classList.remove('dark');
    localStorage.clear();
  });

  it('alterna la clase .dark en <html>', async () => {
    const fixture = TestBed.createComponent(TokensPage);
    await fixture.whenStable();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector('button')!;

    toggle.click();
    await fixture.whenStable();
    expect(html.classList.contains('dark')).toBe(true);
    expect(toggle.getAttribute('aria-pressed')).toBe('true');

    toggle.click();
    await fixture.whenStable();
    expect(html.classList.contains('dark')).toBe(false);
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
  });
});
