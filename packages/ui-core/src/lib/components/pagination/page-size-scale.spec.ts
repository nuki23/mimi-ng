import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiPagination } from './pagination';

@Component({
  imports: [MimiPagination],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<mimi-pagination
    [total]="100"
    [pageSize]="10"
    [pageSizeOptions]="[10, 20]"
    size="lg"
  />`,
})
class Host {}

describe('selector «por página» y la escala', () => {
  it('el Select de dentro toma el size de Pagination, no md', async () => {
    const fixture = TestBed.createComponent(Host);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 50));
    await fixture.whenStable();
    const select = (fixture.nativeElement as HTMLElement).querySelector('mimi-select')!;
    // Sin `size` propio no escribe `data-size`: lo hereda de Pagination por la cascada.
    expect(select.hasAttribute('data-size')).toBe(false);
    expect(select.closest('[data-size]')?.getAttribute('data-size')).toBe('lg');
  });
});
