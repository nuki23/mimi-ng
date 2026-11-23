import type { Page } from '@playwright/test';

/**
 * Auditoría móvil de una página (M.18; antes, un script por CDP fuera del repo, de la 5.17).
 * Mide en el teléfono:
 *
 * - `outside`: elementos que se salen de la pantalla a lo ancho sin estar dentro de un
 *   contenedor con scroll o recorte propio (lo que se ve cortado o hace scroll lateral).
 * - `small`: controles de menos de 24 px de lado (el mínimo de WCAG 2.5.8, AA), y `under44`:
 *   los de menos de 44 px (la recomendación para el dedo, WCAG 2.5.5 AAA y las guías de
 *   Apple y Android), sin contar los enlaces dentro de un texto (excepción de los dos criterios).
 *
 * Devuelve los hallazgos; quien la usa decide qué es un error (`audit.spec.ts`).
 */
export interface AuditTarget {
  what: string;
  width: number;
  height: number;
}

export interface AuditResult {
  path: string;
  viewport: number;
  outside: string[];
  small: AuditTarget[];
  under44: AuditTarget[];
}

export async function auditPage(page: Page, path: string): Promise<AuditResult> {
  const found = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const describe = (el: Element) => {
      const name =
        el.getAttribute('aria-label') ||
        (el as HTMLElement).innerText?.trim().replace(/\s+/g, ' ').slice(0, 40) ||
        el.getAttribute('title') ||
        '';
      const slot = el.getAttribute('data-slot');
      const host = el.closest('[class*="mimi-"], [mimibtn], [data-slot]')?.tagName.toLowerCase();
      return `${el.tagName.toLowerCase()}${slot ? `[data-slot=${slot}]` : ''}${host ? ` en ${host}` : ''} «${name}»`;
    };
    const clipped = (el: Element) => {
      for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
        const s = getComputedStyle(n);
        if (s.overflowX !== 'visible' || s.position === 'fixed') return true;
      }
      return false;
    };
    const visible = (el: Element) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return (
        r.width > 0 &&
        r.height > 0 &&
        s.visibility !== 'hidden' &&
        !el.closest('[hidden], [inert], [aria-hidden="true"]')
      );
    };
    const outside: string[] = [];
    for (const el of document.querySelectorAll('body *')) {
      if (!visible(el)) continue;
      const r = el.getBoundingClientRect();
      if ((r.right > vw + 1 || r.left < -1) && !clipped(el)) outside.push(describe(el));
    }
    const interactive = document.querySelectorAll(
      'a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], [role=checkbox], [role=switch], [role=radio], [role=tab], [role=slider], [role=menuitem], [role=option], [role=combobox], [tabindex]:not([tabindex="-1"])',
    );
    const small: { what: string; width: number; height: number }[] = [];
    const under44: { what: string; width: number; height: number }[] = [];
    for (const el of interactive) {
      if (!visible(el) || (el as HTMLButtonElement).disabled) continue;
      // Un enlace dentro de un párrafo o una lista de texto: excepción «en línea» de 2.5.5/2.5.8.
      if (el.tagName === 'A' && el.closest('p, li, td, [data-slot="lead"]')) continue;
      // Los contenedores con scroll (tabindex=0 para el teclado) no son objetivos táctiles.
      if (el.getAttribute('role') === 'region' || el.tagName === 'PRE') continue;
      const r = el.getBoundingClientRect();
      const item = { what: describe(el), width: Math.round(r.width), height: Math.round(r.height) };
      if (Math.min(r.width, r.height) < 24) small.push(item);
      else if (Math.min(r.width, r.height) < 44) under44.push(item);
    }
    return { viewport: vw, outside: [...new Set(outside)], small, under44 };
  });
  return { path, ...found };
}
