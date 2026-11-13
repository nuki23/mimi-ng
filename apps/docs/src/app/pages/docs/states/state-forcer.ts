import { DOCUMENT, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/*
 * Estados forzados de la página «Estados» (12/11/2026): para ver a la vez el hover, el foco y el
 * clic de todos los controles, se copian las reglas reales de las hojas del sitio que usan
 * `:hover`, `:focus*` o `:active`, cambiando la seudoclase por un atributo `data-force`. Así cada
 * celda pinta los estilos de verdad de su componente, sin imitarlos a mano.
 */

/** Seudoclases que se fuerzan (sin las escapadas de los nombres de clase: `hover\:`). */
const PSEUDO = /(?<!\\):(hover|focus-visible|focus-within|focus|active)(?![\w-])/g;

const IS_HOVER = ':is([data-force~="hover"], :has([data-force~="hover"]))';
const IS_ACTIVE = ':is([data-force~="active"], :has([data-force~="active"]))';
const IS_FOCUS = '[data-force~="focus"]';
const IS_FOCUS_WITHIN = ':is([data-force~="focus"], :has([data-force~="focus"]))';

/** El selector con las seudoclases cambiadas por `data-force` (hover y clic también en los padres). */
export function forcedSelector(selector: string): string {
  return selector.replace(PSEUDO, (_match, pseudo: string) => {
    if (pseudo === 'hover') return IS_HOVER;
    if (pseudo === 'active') return IS_ACTIVE;
    if (pseudo === 'focus-within') return IS_FOCUS_WITHIN;
    return IS_FOCUS;
  });
}

/** El texto de un envoltorio (`@media …`, `@layer …`, `@scope …`) para repetirlo alrededor de la copia. */
function wrapperOf(rule: CSSRule): string | null {
  const any = rule as CSSRule & {
    conditionText?: string;
    name?: string;
    start?: string | null;
    end?: string | null;
  };
  if (rule.constructor.name === 'CSSMediaRule') return `@media ${any.conditionText}`;
  if (rule.constructor.name === 'CSSSupportsRule') return `@supports ${any.conditionText}`;
  if (rule.constructor.name === 'CSSContainerRule') return `@container ${any.conditionText}`;
  if (rule.constructor.name === 'CSSLayerBlockRule') return `@layer ${any.name}`;
  if (rule.constructor.name === 'CSSScopeRule') {
    return `@scope${any.start ? ` (${any.start})` : ''}${any.end ? ` to (${any.end})` : ''}`;
  }
  return null;
}

/** Recorre las reglas (también las anidadas) y devuelve las copias forzadas. */
function walk(rules: CSSRuleList, wrappers: string[], parent: string | null, out: string[]): void {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      // Anidamiento de CSS: `&` es el selector del padre.
      const selector = parent
        ? rule.selectorText.includes('&')
          ? rule.selectorText.replaceAll('&', `:is(${parent})`)
          : `:is(${parent}) ${rule.selectorText}`
        : rule.selectorText;
      if (PSEUDO.test(selector)) {
        PSEUDO.lastIndex = 0;
        const body = rule.style.cssText;
        if (body) {
          const text = `${forcedSelector(selector)} { ${body} }`;
          out.push(wrappers.reduceRight((inner, wrapper) => `${wrapper} { ${inner} }`, text));
        }
      }
      PSEUDO.lastIndex = 0;
      if (rule.cssRules?.length) walk(rule.cssRules, wrappers, selector, out);
      continue;
    }
    const wrapper = wrapperOf(rule);
    const children = (rule as CSSRule & { cssRules?: CSSRuleList }).cssRules;
    if (wrapper && children) walk(children, [...wrappers, wrapper], parent, out);
  }
}

/** Todas las copias forzadas de las hojas del documento (las de otro origen se saltan). */
export function buildForcedCss(sheets: StyleSheetList): string {
  const out: string[] = [];
  for (const sheet of Array.from(sheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    walk(rules, [], null, out);
  }
  return out.join('\n');
}

/** Pone (una vez) la hoja forzada en el documento. Devuelve cuántas reglas se copiaron. */
export function installForcedCss(document: Document, extra = ''): number {
  const id = 'mimi-states-forced';
  document.getElementById(id)?.remove();
  const css = buildForcedCss(document.styleSheets);
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `${css}\n${extra}`;
  document.head.appendChild(style);
  return css ? css.split('\n').length : 0;
}

/** Estado que se fuerza en una celda. */
export type ForcedState =
  'normal' | 'hover' | 'focus' | 'active' | 'disabled' | 'readonly' | 'error';

/**
 * En la celda de un control: marca con `data-force` el elemento que recibiría el puntero o el foco
 * (`target`) y, con `data-surface`, la caja que dibuja el borde, para simular la profundidad.
 */
@Directive({ selector: '[appForceState]' })
export class ForceState {
  readonly state = input.required<ForcedState>({ alias: 'appForceState' });
  /** El elemento interactivo dentro de la celda (por defecto, el primero enfocable). */
  readonly target = input('input, textarea, button, [role="slider"], [tabindex="0"]');
  /** Escribir (Input…) o botón (Select…): cambia cómo se hunde al hacer clic. */
  readonly kind = input<'write' | 'button'>('write');
  /** Además, en el foco: un atributo que el componente pone él mismo (Select: data-focus-visible). */
  readonly focusAttr = input<{ selector: string; name: string } | null>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document = inject(DOCUMENT);

  constructor() {
    afterNextRender(() => this.apply());
  }

  private apply(): void {
    const state = this.state();
    const target = this.host.querySelector<HTMLElement>(this.target());
    if (!target) return;
    const force =
      state === 'hover'
        ? 'hover'
        : state === 'focus'
          ? 'focus'
          : state === 'active'
            ? 'hover active'
            : null;
    if (force) target.setAttribute('data-force', force);
    if (state === 'focus' && this.focusAttr()) {
      const { selector, name } = this.focusAttr()!;
      this.host.querySelector(selector)?.setAttribute(name, '');
    }
    if (state === 'active') this.surfaceOf(target).setAttribute('data-surface', this.kind());
  }

  /** La caja con borde más cercana (el propio elemento si nadie la tiene). */
  private surfaceOf(target: HTMLElement): HTMLElement {
    const view = this.document.defaultView;
    let node: HTMLElement | null = target;
    while (node && node !== this.host) {
      const width = view ? parseFloat(view.getComputedStyle(node).borderTopWidth) : 0;
      if (width > 0) return node;
      node = node.parentElement;
    }
    return target;
  }
}
