import { Directionality } from '@angular/cdk/bidi';
import { Component, EventEmitter, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormField, form } from '@angular/forms/signals';
import { MimiTreeImports, type MimiTreeNode } from './tree';
import { MIMI_TREE_TEXT_ES, provideMimiTreeText } from './tree-texts';

const FILES: MimiTreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'app',
        label: 'app',
        children: [
          { id: 'btn', label: 'button.ts', meta: '2 KB' },
          { id: 'inp', label: 'input.ts', meta: '3 KB' },
        ],
      },
      { id: 'styles', label: 'styles.css' },
    ],
  },
  { id: 'assets', label: 'assets', hasChildren: true },
  { id: 'mimi', label: 'mimi.json', disabled: true },
  { id: 'pkg', label: 'package.json' },
];

const PERMS: MimiTreeNode[] = [
  {
    id: 'proj',
    label: 'Proyectos',
    children: [
      { id: 'p-ver', label: 'Ver' },
      { id: 'p-crear', label: 'Crear' },
    ],
  },
  { id: 'fact', label: 'Facturación', children: [{ id: 'f-ver', label: 'Ver' }] },
];

@Component({
  imports: [MimiTreeImports],
  template: `
    <button data-test="before">Antes</button>
    <mimi-tree
      data-test="single"
      aria-label="Archivos"
      [nodes]="files"
      [(value)]="selected"
      [(expanded)]="open"
      [loadChildren]="load"
      [class]="extra()"
    />
    <mimi-tree
      data-test="multi"
      aria-label="Permisos"
      multiple
      [nodes]="perms"
      [(value)]="checked"
      [(expanded)]="permOpen"
    />
    <mimi-tree data-test="custom" aria-label="Con plantilla" [nodes]="files">
      <ng-template mimiTreeNode let-node let-level="level">
        <b data-test="custom-label">{{ level }}:{{ node.label }}</b>
      </ng-template>
    </mimi-tree>
  `,
})
class Host {
  readonly files = FILES;
  readonly perms = PERMS;
  readonly selected = signal<string | null | string[]>(null);
  readonly open = signal<string[]>(['src']);
  readonly checked = signal<string | null | string[]>(['p-ver']);
  readonly permOpen = signal<string[]>(['proj']);
  readonly extra = signal('');
  resolve: (nodes: MimiTreeNode[]) => void = () => undefined;
  reject: () => void = () => undefined;
  calls = 0;
  readonly load = () => {
    this.calls++;
    return new Promise<MimiTreeNode[]>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = () => reject(new Error('fallo'));
    });
  };
}

@Component({
  imports: [MimiTreeImports, FormsModule, ReactiveFormsModule, FormField],
  template: `
    <form [formGroup]="group">
      <mimi-tree data-test="reactive" aria-label="R" [nodes]="files" formControlName="file" />
    </form>
    <mimi-tree
      data-test="signal"
      aria-label="S"
      multiple
      [nodes]="perms"
      [formField]="signalForm.perms"
    />
    <mimi-tree data-test="ng-model" aria-label="N" name="n" [nodes]="files" [(ngModel)]="model" />
    <button data-test="out">Fuera</button>
  `,
})
class FormsHost {
  readonly files = FILES;
  readonly perms = PERMS;
  readonly group = new FormGroup({ file: new FormControl<string | null>('pkg') });
  readonly data = signal<{ perms: string[] }>({ perms: [] });
  readonly signalForm = form(this.data);
  model: string | null = null;
}

const settle = async (fixture: { whenStable(): Promise<unknown> }) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
  }
};

const press = (target: Element, key: string) =>
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

async function setup() {
  const fixture = TestBed.createComponent(Host);
  await settle(fixture);
  const el = fixture.nativeElement as HTMLElement;
  const tree = (name: string) => el.querySelector(`[data-test="${name}"]`)!;
  const items = (name: string) =>
    Array.from(tree(name).querySelectorAll<HTMLElement>('[role="treeitem"]'));
  const item = (name: string, id: string) =>
    tree(name).querySelector<HTMLElement>(`[role="treeitem"][data-id="${id}"]`)!;
  const labels = (name: string) => items(name).map((i) => i.dataset['id']);
  return { fixture, host: fixture.componentInstance, el, tree, items, item, labels };
}

describe('MimiTree', () => {
  it('role="tree" con su nombre; filas con nivel, posición y tamaño del grupo', async () => {
    const { tree, item, labels } = await setup();
    const single = tree('single');
    const role = single.querySelector('[role="tree"]')!;
    expect(role.getAttribute('aria-label')).toBe('Archivos');
    expect(single.getAttribute('aria-label')).toBeNull();
    expect(labels('single')).toEqual(['src', 'app', 'styles', 'assets', 'mimi', 'pkg']);
    const app = item('single', 'app');
    expect(app.getAttribute('aria-level')).toBe('2');
    expect(app.getAttribute('aria-posinset')).toBe('1');
    expect(app.getAttribute('aria-setsize')).toBe('2');
    expect(app.getAttribute('aria-expanded')).toBe('false');
    expect(item('single', 'src').getAttribute('aria-expanded')).toBe('true');
    expect(item('single', 'pkg').hasAttribute('aria-expanded')).toBe(false);
    // Una hoja tiene aria-selected; un padre no (no se elige).
    expect(item('single', 'pkg').getAttribute('aria-selected')).toBe('false');
    expect(app.hasAttribute('aria-selected')).toBe(false);
    expect(item('single', 'mimi').getAttribute('aria-disabled')).toBe('true');
    // El dato a la derecha.
    expect(item('single', 'styles').textContent).toContain('styles.css');
  });

  it('simple: clic en un padre lo abre; en una hoja la elige', async () => {
    const { fixture, host, item, labels } = await setup();
    item('single', 'app').click();
    await settle(fixture);
    expect(host.open()).toEqual(['src', 'app']);
    expect(labels('single')).toContain('btn');
    item('single', 'btn').click();
    await settle(fixture);
    expect(host.selected()).toBe('btn');
    const btn = item('single', 'btn');
    expect(btn.getAttribute('aria-selected')).toBe('true');
    expect(btn.hasAttribute('data-selected')).toBe(true);
    // Clic en el chevrón de un padre abierto lo cierra.
    item('single', 'src').querySelector<HTMLElement>('[data-slot="chevron"]')!.click();
    await settle(fixture);
    expect(host.open()).toEqual(['app']);
    expect(labels('single')).toEqual(['src', 'assets', 'mimi', 'pkg']);
  });

  it('una sola parada de Tab, que sigue al nodo activo y sube al padre si se cierra', async () => {
    const { fixture, tree, item, items } = await setup();
    const tabbable = () => items('single').filter((i) => i.tabIndex === 0);
    expect(tabbable().map((i) => i.dataset['id'])).toEqual(['src']);
    const role = tree('single').querySelector('[role="tree"]')!;
    item('single', 'src').focus();
    press(role, 'ArrowDown');
    await settle(fixture);
    expect(document.activeElement).toBe(item('single', 'app'));
    expect(tabbable().map((i) => i.dataset['id'])).toEqual(['app']);
    // Se cierra src: el foco itinerante vuelve a src.
    press(role, 'ArrowLeft');
    await settle(fixture);
    expect(document.activeElement).toBe(item('single', 'src'));
    press(role, 'ArrowLeft');
    await settle(fixture);
    expect(tabbable().map((i) => i.dataset['id'])).toEqual(['src']);
  });

  it('teclado de la APG: → abre y entra, ← cierra y sube, Inicio/Fin, Enter, *, letras', async () => {
    const { fixture, host, tree, item } = await setup();
    const role = tree('single').querySelector('[role="tree"]')!;
    const key = async (k: string) => {
      press(role, k);
      await settle(fixture);
    };
    item('single', 'src').focus();
    await key('ArrowDown'); // app
    await key('ArrowRight'); // abre app
    expect(host.open()).toContain('app');
    expect(document.activeElement).toBe(item('single', 'app'));
    await key('ArrowRight'); // entra en btn
    expect(document.activeElement).toBe(item('single', 'btn'));
    await key('Enter');
    expect(host.selected()).toBe('btn');
    await key('ArrowLeft'); // btn → sube a app
    expect(document.activeElement).toBe(item('single', 'app'));
    await key('End');
    expect(document.activeElement).toBe(item('single', 'pkg'));
    await key('Home');
    expect(document.activeElement).toBe(item('single', 'src'));
    await key('p'); // package.json
    expect(document.activeElement).toBe(item('single', 'pkg'));
    await key(' ');
    expect(host.selected()).toBe('pkg');
    // * abre los hermanos de primer nivel (assets carga).
    await key('*');
    expect(host.open()).toContain('assets');
    expect(host.calls).toBe(1);
  });

  it('un nodo deshabilitado se enfoca pero no se elige', async () => {
    const { fixture, host, tree, item } = await setup();
    const role = tree('single').querySelector('[role="tree"]')!;
    item('single', 'mimi').click();
    await settle(fixture);
    expect(host.selected()).toBeNull();
    expect(document.activeElement).toBe(item('single', 'mimi'));
    press(role, 'Enter');
    await settle(fixture);
    expect(host.selected()).toBeNull();
  });

  it('carga diferida: «cargando» con aria-busy, después los hijos; un error se reintenta', async () => {
    const { fixture, host, tree, item, labels } = await setup();
    item('single', 'assets').click();
    await settle(fixture);
    expect(host.calls).toBe(1);
    const assets = item('single', 'assets');
    expect(assets.getAttribute('aria-busy')).toBe('true');
    expect(tree('single').querySelector('[data-slot="loading"]')?.textContent).toContain(
      'Loading…',
    );
    expect(tree('single').querySelector('[role="status"]')?.textContent).toContain('Loading…');
    host.resolve([{ id: 'logo', label: 'logo.svg' }]);
    await settle(fixture);
    expect(labels('single')).toContain('logo');
    expect(item('single', 'assets').hasAttribute('aria-busy')).toBe(false);
    // Cerrar y abrir no vuelve a cargar.
    item('single', 'assets').click();
    item('single', 'assets').click();
    await settle(fixture);
    expect(host.calls).toBe(1);
  });

  it('carga con error: fila con el error; al abrir de nuevo, reintenta', async () => {
    const { fixture, host, tree, item } = await setup();
    item('single', 'assets').click();
    await settle(fixture);
    host.reject();
    await settle(fixture);
    expect(tree('single').querySelector('[data-slot="error"]')?.textContent).toContain(
      'Couldn’t load',
    );
    item('single', 'assets').click(); // cierra
    item('single', 'assets').click(); // abre: reintenta
    await settle(fixture);
    expect(host.calls).toBe(2);
  });

  it('múltiple: casillas con estado parcial en aria-checked y cascada', async () => {
    const { fixture, host, tree, item } = await setup();
    expect(tree('multi').hasAttribute('data-multiple')).toBe(true);
    expect(item('multi', 'proj').getAttribute('aria-checked')).toBe('mixed');
    expect(item('multi', 'p-ver').getAttribute('aria-checked')).toBe('true');
    expect(item('multi', 'fact').getAttribute('aria-checked')).toBe('false');
    expect(item('multi', 'p-ver').hasAttribute('aria-selected')).toBe(false);
    const box = item('multi', 'proj').querySelector('[data-slot="checkbox"]')!;
    expect(box.getAttribute('aria-hidden')).toBe('true');
    expect(box.getAttribute('data-state')).toBe('indeterminate');
    // Ningún control enfocable dentro de un treeitem.
    expect(
      tree('multi').querySelectorAll('[role="treeitem"] button, [role="treeitem"] input'),
    ).toHaveLength(0);

    // Marcar el padre parcial: marca todos sus hijos.
    const role = tree('multi').querySelector('[role="tree"]')!;
    item('multi', 'proj').focus();
    press(role, ' ');
    await settle(fixture);
    expect(host.checked()).toEqual(['proj', 'p-ver', 'p-crear']);
    expect(item('multi', 'proj').getAttribute('aria-checked')).toBe('true');
    // Desmarcar un hijo: el padre pasa a parcial y sale del valor.
    item('multi', 'p-crear').click();
    await settle(fixture);
    expect(host.checked()).toEqual(['p-ver']);
    // Marcar la única hoja de un padre cerrado lo completa.
    item('multi', 'fact').click();
    await settle(fixture);
    expect(host.checked()).toEqual(['p-ver', 'fact', 'f-ver']);
    // Enter en un padre lo abre o cierra, sin marcar.
    item('multi', 'fact').focus();
    press(role, 'Enter');
    await settle(fixture);
    expect(host.permOpen()).toContain('fact');
    expect(host.checked()).toEqual(['p-ver', 'fact', 'f-ver']);
  });

  it('plantilla propia del nodo con su nivel', async () => {
    const { tree } = await setup();
    const labels = Array.from(tree('custom').querySelectorAll('[data-test="custom-label"]')).map(
      (b) => b.textContent,
    );
    expect(labels).toEqual(['1:src', '1:assets', '1:mimi.json', '1:package.json']);
  });

  it('class del usuario con cn(); tokens de la tabla en el anfitrión y en las filas', async () => {
    const { fixture, host, tree, item } = await setup();
    const single = tree('single') as HTMLElement;
    expect(single.className).toContain('p-[var(--mimi-tree-padding,6px)]');
    expect(single.className).toContain('text-[length:var(--mimi-tree-font-size,13.5px)]');
    expect(single.className).toContain('bg-[color:var(--mimi-tree-bg,var(--mimi-card))]');
    host.extra.set('p-0 bg-muted');
    await settle(fixture);
    expect(single.className).toContain('p-0');
    expect(single.className).not.toContain('p-[var(--mimi-tree-padding,6px)]');
    expect(single.className).toContain('bg-muted');
    expect(single.className).not.toContain('bg-[color:var(--mimi-tree-bg');
    const row = item('single', 'src');
    expect(row.className).toContain('h-[var(--mimi-tree-row-height,32px)]');
    expect(row.style.paddingInlineStart).toBe('calc(6px + 0 * var(--mimi-tree-indent, 18px))');
    expect(item('single', 'app').style.paddingInlineStart).toContain('1 * var(--mimi-tree-indent');
    expect(row.getAttribute('data-state')).toBe('open');
  });

  it('textos en español con provideMimiTreeText', async () => {
    TestBed.configureTestingModule({ providers: [provideMimiTreeText(MIMI_TREE_TEXT_ES)] });
    const { fixture, tree, item } = await setup();
    item('single', 'assets').click();
    await settle(fixture);
    expect(tree('single').querySelector('[data-slot="loading"]')?.textContent).toContain(
      'Cargando…',
    );
  });
});

describe('MimiTree en RTL', () => {
  it('← abre y → cierra', async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Directionality,
          useValue: { value: 'rtl', valueSignal: signal('rtl'), change: new EventEmitter() },
        },
      ],
    });
    const { fixture, host, tree, item } = await setup();
    const role = tree('single').querySelector('[role="tree"]')!;
    item('single', 'src').focus();
    press(role, 'ArrowDown');
    await settle(fixture);
    press(role, 'ArrowLeft');
    await settle(fixture);
    expect(host.open()).toContain('app');
    press(role, 'ArrowRight');
    await settle(fixture);
    expect(host.open()).not.toContain('app');
  });
});

describe('MimiTree con formularios', () => {
  it('formControlName, [formField] y ngModel; touch al salir', async () => {
    const fixture = TestBed.createComponent(FormsHost);
    await settle(fixture);
    const el = fixture.nativeElement as HTMLElement;
    const host = fixture.componentInstance;
    const node = (name: string, id: string) =>
      el.querySelector<HTMLElement>(`[data-test="${name}"] [role="treeitem"][data-id="${id}"]`)!;

    // Reactive: el valor inicial se ve y el clic lo cambia.
    expect(node('reactive', 'pkg').getAttribute('aria-selected')).toBe('true');
    node('reactive', 'mimi').click(); // deshabilitado: nada
    node('reactive', 'pkg').click();
    await settle(fixture);
    expect(host.group.value.file).toBe('pkg');
    expect(host.group.controls.file.touched).toBe(false);
    el.querySelector<HTMLElement>('[data-test="out"]')!.focus();
    node('reactive', 'pkg').dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: el.querySelector('[data-test="out"]'),
      }),
    );
    await settle(fixture);
    expect(host.group.controls.file.touched).toBe(true);

    // Signal Forms, múltiple.
    node('signal', 'fact').click();
    await settle(fixture);
    expect(host.data().perms).toEqual(['fact', 'f-ver']);

    // ngModel.
    node('ng-model', 'pkg').click();
    await settle(fixture);
    expect(host.model).toBe('pkg');
  });
});
