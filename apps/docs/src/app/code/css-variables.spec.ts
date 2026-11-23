import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CssVariables } from './css-variables';
import type { TokenComponent } from './component-tokens';
import { HighlighterService } from './highlighter.service';

@Component({
  imports: [CssVariables],
  template: `<app-css-variables [component]="component()" />`,
})
class Host {
  readonly component = signal<TokenComponent>('card');
}

describe('CssVariables', () => {
  async function setup(component: TokenComponent) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.component.set(component);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra una fila por variable, con su valor por defecto y de qué hereda', async () => {
    const el = await setup('card');
    const rows = Array.from(el.querySelectorAll('tbody tr')).map((tr) =>
      Array.from(tr.querySelectorAll('td')).map((td) => td.textContent?.trim()),
    );
    expect(rows).toContainEqual([
      '--mimi-card-padding',
      '1.5rem',
      '—',
      'Relleno de las piezas en md (sm 1rem, lg 2rem).',
    ]);
    const bg = rows.find((r) => r[0] === '--mimi-card-bg')!;
    expect(bg[2]).toBe('--mimi-card');
    expect(bg[3]).toContain('Solo en CSS.');
    expect(el.textContent).toContain('components.card');
  });

  it('con colores: ejemplo de styles.css para claro y oscuro', async () => {
    const el = await setup('card');
    const code = el.querySelector('app-code-block pre')?.textContent ?? '';
    expect(code).toContain(':root {\n  --mimi-card-bg:');
    expect(code).toContain('.dark {\n  --mimi-card-bg:');
  });

  it('sin colores (Badge: los pone el tono) no muestra el ejemplo', async () => {
    const el = await setup('badge');
    expect(el.querySelector('app-code-block')).toBeNull();
  });

  it('no lista los nombres de la 0.1.0 que quitó la 0.8.0 (M.28)', async () => {
    const el = await setup('button');
    const names = Array.from(el.querySelectorAll('tbody tr td:first-child')).map((td) =>
      td.textContent?.trim(),
    );
    expect(names).toContain('--mimi-btn-px');
    expect(names.filter((n) => n?.startsWith('--mimi-btn-padding'))).toEqual([]);
  });
});
