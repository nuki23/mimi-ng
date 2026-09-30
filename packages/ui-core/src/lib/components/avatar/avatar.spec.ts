import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MimiAvatarImports } from './avatar';
import type { AvatarSize } from './avatar.variants';

@Component({
  imports: [MimiAvatarImports],
  template: `
    <mimi-avatar id="photo" [size]="size()" [class]="extra()">
      <img
        mimiAvatarImage
        [src]="src()"
        alt="Ana Torres"
        loading="lazy"
        referrerpolicy="no-referrer"
        [class]="imgExtra()"
      />
      <mimi-avatar-fallback label="Ana Torres" [class]="fallbackExtra()">AT</mimi-avatar-fallback>
    </mimi-avatar>
    <mimi-avatar id="initials">
      <mimi-avatar-fallback>JR</mimi-avatar-fallback>
    </mimi-avatar>
  `,
})
class Host {
  readonly size = signal<AvatarSize>('default');
  readonly src = signal<string | null>('/avatars/avatar-1.svg');
  readonly extra = signal('');
  readonly imgExtra = signal('');
  readonly fallbackExtra = signal('');
}

describe('MimiAvatar', () => {
  afterEach(() => vi.restoreAllMocks());

  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const avatar = root.querySelector<HTMLElement>('#photo')!;
    const img = avatar.querySelector('img')!;
    const fallback = avatar.querySelector<HTMLElement>('mimi-avatar-fallback')!;
    const update = async (fn: () => void) => {
      fn();
      await fixture.whenStable();
    };
    const fire = async (type: 'load' | 'error') => {
      img.dispatchEvent(new Event(type));
      await fixture.whenStable();
    };
    return { root, host: fixture.componentInstance, avatar, img, fallback, update, fire };
  }

  it.each<[AvatarSize, string, string]>([
    ['sm', 'size-8', 'text-xs'],
    ['default', 'size-10', 'text-sm'],
    ['lg', 'size-14', 'text-lg'],
  ])('tamaño %s', async (size, box, text) => {
    const { host, avatar, update } = await setup();
    await update(() => host.size.set(size));
    expect(avatar.dataset['size']).toBe(size);
    expect(avatar.classList).toContain(box);
    expect(avatar.classList).toContain(text);
    for (const cls of ['rounded-full', 'bg-muted', 'overflow-hidden', 'shrink-0']) {
      expect(avatar.classList).toContain(cls);
    }
  });

  it('src vuelve a escribirse en el <img> y los atributos nativos se conservan', async () => {
    const { host, img, update } = await setup();
    expect(img.getAttribute('src')).toBe('/avatars/avatar-1.svg');
    expect(img.getAttribute('alt')).toBe('Ana Torres');
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('referrerpolicy')).toBe('no-referrer');
    await update(() => host.src.set('/avatars/avatar-2.svg'));
    expect(img.getAttribute('src')).toBe('/avatars/avatar-2.svg');
  });

  it('mientras carga se ve el fallback; al cargar, la imagen', async () => {
    const { avatar, img, fallback, fire } = await setup();
    expect(avatar.dataset['state']).toBe('loading');
    expect(img.classList).toContain('invisible');
    expect(fallback.classList).not.toContain('hidden');

    await fire('load');
    expect(avatar.dataset['state']).toBe('loaded');
    expect(img.classList).not.toContain('invisible');
    expect(fallback.classList).toContain('hidden');
  });

  it('si la imagen falla, se ve el fallback', async () => {
    const { avatar, img, fallback, fire } = await setup();
    await fire('error');
    expect(avatar.dataset['state']).toBe('error');
    expect(img.classList).toContain('invisible');
    expect(fallback.classList).not.toContain('hidden');
  });

  it('un src nuevo vuelve a cargar; sin src, se ve el fallback', async () => {
    const { host, avatar, fire, update } = await setup();
    await fire('load');
    await update(() => host.src.set('/avatars/avatar-3.svg'));
    expect(avatar.dataset['state']).toBe('loading');
    await update(() => host.src.set(null));
    expect(avatar.dataset['state']).toBe('error');
  });

  it('una imagen ya completa (caché) pasa a loaded sin esperar load', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(64);
    const { avatar, fallback } = await setup();
    expect(avatar.dataset['state']).toBe('loaded');
    expect(fallback.classList).toContain('hidden');
  });

  it('completa pero sin ancho (rota) no cuenta como cargada', async () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0);
    const { avatar } = await setup();
    expect(avatar.dataset['state']).toBe('loading');
  });

  it('sin imagen: solo iniciales, estado idle', async () => {
    const { root } = await setup();
    const avatar = root.querySelector<HTMLElement>('#initials')!;
    const fallback = avatar.querySelector<HTMLElement>('mimi-avatar-fallback')!;
    expect(avatar.dataset['state']).toBe('idle');
    for (const cls of ['bg-secondary', 'text-secondary-foreground', 'font-semibold', 'flex']) {
      expect(fallback.classList).toContain(cls);
    }
    // Sin label es texto normal.
    expect(fallback.hasAttribute('role')).toBe(false);
    expect(fallback.hasAttribute('aria-label')).toBe(false);
  });

  it('con label, el fallback se anuncia como imagen con el nombre', async () => {
    const { fallback } = await setup();
    expect(fallback.getAttribute('role')).toBe('img');
    expect(fallback.getAttribute('aria-label')).toBe('Ana Torres');
  });

  it('la clase del usuario gana en las tres piezas', async () => {
    const { host, avatar, img, fallback, update, fire } = await setup();
    await update(() => {
      host.extra.set('size-20 text-2xl rounded-lg');
      host.imgExtra.set('object-contain');
      host.fallbackExtra.set('bg-primary text-primary-foreground rounded-lg');
    });
    expect(avatar.classList).toContain('size-20');
    expect(avatar.classList).not.toContain('size-10');
    expect(avatar.classList).toContain('text-2xl');
    expect(avatar.classList).not.toContain('text-sm');
    expect(avatar.classList).not.toContain('rounded-full');
    expect(img.classList).toContain('object-contain');
    expect(img.classList).not.toContain('object-cover');
    expect(fallback.classList).toContain('bg-primary');
    expect(fallback.classList).not.toContain('bg-secondary');
    expect(fallback.classList).not.toContain('rounded-full');
    // Con la imagen cargada, el fallback se oculta aunque el usuario pase otra visualización.
    await update(() => host.fallbackExtra.set('flex'));
    await fire('load');
    expect(fallback.classList).toContain('hidden');
    expect(fallback.classList).not.toContain('flex');
  });
});
