import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DocsToc, readTocItems } from './docs-toc';

function content(html: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = html;
  document.body.appendChild(el);
  return el;
}

describe('readTocItems', () => {
  it('lee los h2 y h3 con id, en orden y con su nivel', () => {
    const el = content(`
      <h1 id="titulo">Título</h1>
      <h2 id="uno">Uno</h2>
      <h3 id="uno-a"> Uno A </h3>
      <h2>Sin id</h2>
      <h2 id="dos">Dos</h2>
    `);
    expect(readTocItems(el)).toEqual([
      { id: 'uno', text: 'Uno', level: 2 },
      { id: 'uno-a', text: 'Uno A', level: 3 },
      { id: 'dos', text: 'Dos', level: 2 },
    ]);
    el.remove();
  });
});

describe('DocsToc', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('genera un enlace por encabezado, con su fragmento', async () => {
    const el = content('<h2 id="uno">Uno</h2><h3 id="uno-a">Uno A</h3><h2 id="dos">Dos</h2>');
    const fixture = TestBed.createComponent(DocsToc);
    fixture.componentRef.setInput('content', el);
    await fixture.whenStable();

    const nav = (fixture.nativeElement as HTMLElement).querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('En esta página');
    const links = Array.from(nav!.querySelectorAll('a'));
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Uno', 'Uno A', 'Dos']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/#uno', '/#uno-a', '/#dos']);
    expect(links[0].getAttribute('aria-current')).toBe('location');
    el.remove();
  });

  it('se actualiza cuando cambia el contenido (cambio de ruta)', async () => {
    const el = content('<h2 id="uno">Uno</h2>');
    const fixture = TestBed.createComponent(DocsToc);
    fixture.componentRef.setInput('content', el);
    await fixture.whenStable();

    el.innerHTML = '<h2 id="otra">Otra página</h2><h2 id="mas">Más</h2>';
    await new Promise((resolve) => setTimeout(resolve));
    await fixture.whenStable();

    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('a');
    expect(Array.from(links).map((a) => a.textContent?.trim())).toEqual(['Otra página', 'Más']);
    el.remove();
  });

  it('no se muestra si la página no tiene encabezados', async () => {
    const el = content('<p>Sin encabezados</p>');
    const fixture = TestBed.createComponent(DocsToc);
    fixture.componentRef.setInput('content', el);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('nav')).toBeNull();
    el.remove();
  });
});
