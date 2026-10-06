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
      'Padding exterior de las partes.',
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

  it('marca los nombres de la 0.1.0 con el que los reemplaza', async () => {
    const el = await setup('button');
    const row = Array.from(el.querySelectorAll('tbody tr')).find((tr) =>
      tr.textContent?.includes('--mimi-btn-padding-x'),
    )!;
    expect(row.textContent).toContain('usa --mimi-btn-px (se quita en la 1.0)');
  });
});
