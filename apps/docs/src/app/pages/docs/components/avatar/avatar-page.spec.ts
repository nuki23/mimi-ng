import { TestBed } from '@angular/core/testing';
import { examples, settle } from '../../../../code/code-preview.testing';
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
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;

    const previews = examples(fixture);
    expect(previews.length).toBe(3);
    for (const { example, code } of previews) {
      expect(example?.querySelector('mimi-avatar')).not.toBeNull();
      expect(code).toContain("import { MimiAvatarImports } from '@/components/ui/avatar';");
      expect(code).toMatch(/export class Avatar\w+Example/);
    }
    // Los ejemplos usan las imágenes de apps/docs/public/avatars/.
    const srcs = Array.from(el.querySelectorAll('img[src^="/avatars/"]')).map((i) =>
      i.getAttribute('src'),
    );
    expect(srcs).toContain('/avatars/avatar-1.svg');
    expect(srcs).toContain('/avatars/avatar-2.svg');
    expect(srcs).toContain('/avatars/avatar-3.svg');
    expect(Array.from(el.querySelectorAll('h2[id]')).map((h) => h.id)).toEqual([
      'installation',
      'usage',
      'examples',
      'api',
    ]);
  });
});
