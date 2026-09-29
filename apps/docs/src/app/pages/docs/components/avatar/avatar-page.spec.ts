import { TestBed } from '@angular/core/testing';
import { HighlighterService } from '../../../../code/highlighter.service';
import { AvatarPage } from './avatar-page';

describe('AvatarPage', () => {
  it('cada ejemplo corre en Preview y su pestaña Código muestra el archivo real', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HighlighterService,
          useValue: { highlight: () => new Promise(() => undefined) },
        },
      ],
    });
    const fixture = TestBed.createComponent(AvatarPage);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const previews = Array.from(el.querySelectorAll('app-code-preview'));
    expect(previews.length).toBe(3);
    for (const preview of previews) {
      expect(preview.querySelector('mimi-avatar')).not.toBeNull();
      const code = preview.querySelector('[role="tabpanel"] + [role="tabpanel"] pre')?.textContent;
      expect(code).toContain("import { MimiAvatarImports } from '@/components/ui/avatar';");
      expect(code).toMatch(/export class Avatar\w+Example/);
    }
    // Los ejemplos usan las imágenes de apps/docs/public/avatars/.
    const srcs = Array.from(el.querySelectorAll('img[src^="/avatars/"]')).map((i) =>
      i.getAttribute('src'),
    );
    expect(srcs).toContain('/avatars/avatar-1.png');
    expect(srcs).toContain('/avatars/avatar-2.png');
    expect(srcs).toContain('/avatars/avatar-3.png');
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
