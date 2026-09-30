import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NotFoundPage } from './not-found-page';

describe('NotFoundPage', () => {
  it('agrega robots noindex mientras se muestra y lo quita al salir', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const doc = TestBed.inject(DOCUMENT);
    const robots = () => doc.head.querySelector('meta[name="robots"]');

    const fixture = TestBed.createComponent(NotFoundPage);
    await fixture.whenStable();
    expect(robots()?.getAttribute('content')).toBe('noindex');

    fixture.destroy();
    expect(robots()).toBeNull();
  });
});
