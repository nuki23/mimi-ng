import { TestBed } from '@angular/core/testing';
import { settle } from '../code/code-preview.testing';
import { HighlighterService } from '../code/highlighter.service';
import { CodePage } from './code-page';

describe('CodePage (código importado como texto)', () => {
  it('la pestaña Código muestra el archivo real del ejemplo que corre en Preview', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(CodePage);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const preview = el.querySelector('app-code-preview')!;
    expect(preview.querySelector('app-preview-demo-example form')).not.toBeNull();

    // El panel Código se crea al elegir su pestaña.
    const tabs = preview.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs[1].click();
    await settle(fixture);
    const source =
      preview.querySelector('[role="tabpanel"] + [role="tabpanel"] pre')?.textContent ?? '';
    expect(source).toContain('export class PreviewDemoExample');
    expect(source).toContain("selector: 'app-preview-demo-example'");
  });
});
