import { TestBed } from '@angular/core/testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { SwitchPage } from './switch-page';

describe('SwitchPage', () => {
  it('cada ejemplo corre en Preview y su pestaña Código muestra el archivo real', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(SwitchPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const previews = Array.from(el.querySelectorAll('app-code-preview'));
    expect(previews.length).toBe(7);
    for (const preview of previews) {
      expect(preview.querySelector('mimi-switch, mimi-checkbox')).not.toBeNull();
      const code = preview.querySelector('[role="tabpanel"] + [role="tabpanel"] pre')?.textContent;
      expect(code).toMatch(
        /import \{ Mimi(Switch|Checkbox) \} from '@\/components\/ui\/(switch|checkbox)';/,
      );
      expect(code).toMatch(/export class (Switch|Checkbox)\w+Example/);
    }
    expect(el.querySelectorAll('app-install-command').length).toBe(2);
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
    expect(el.querySelector('h3#api-switch')).not.toBeNull();
    expect(el.querySelector('h3#api-checkbox')).not.toBeNull();
  });

  it('seleccionar todo: mixta con algunas marcadas, marcada al hacer clic', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(SwitchPage);
    await fixture.whenStable();
    const example = (fixture.nativeElement as HTMLElement).querySelector(
      'app-checkbox-select-all-example',
    )!;
    const [all, ...items] = Array.from(example.querySelectorAll('button[role="checkbox"]'));
    expect(all.getAttribute('aria-checked')).toBe('mixed');
    (all as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(all.getAttribute('aria-checked')).toBe('true');
    expect(items.every((i) => i.getAttribute('aria-checked') === 'true')).toBe(true);
  });
});
