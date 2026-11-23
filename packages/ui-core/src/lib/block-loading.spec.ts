import { type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Login01 } from './blocks/login-01/login-01';
import { Login02 } from './blocks/login-02/login-02';
import { Otp01 } from './blocks/otp-01/otp-01';
import { Pricing01 } from './blocks/pricing-01/pricing-01';
import { Settings01 } from './blocks/settings-01/settings-01';
import { Signup01 } from './blocks/signup-01/signup-01';
import { Table01 } from './blocks/table-01/table-01';
import { Kanban01 } from './blocks/kanban-01/kanban-01';
import { Dashboard01 } from './blocks/dashboard-01/dashboard-01';

/**
 * R.11: mientras un Block carga (o guarda), nada se puede editar, pulsar ni enfocar. El anfitrión
 * queda `inert` (los navegadores no enfocan ni activan nada dentro) y con `aria-busy`. Un Block
 * nuevo con entrada de carga se agrega aquí.
 */
const BLOCKS: { name: string; type: Type<unknown>; input: 'loading' | 'saving' }[] = [
  { name: 'login-01', type: Login01, input: 'loading' },
  { name: 'login-02', type: Login02, input: 'loading' },
  { name: 'signup-01', type: Signup01, input: 'loading' },
  { name: 'otp-01', type: Otp01, input: 'loading' },
  { name: 'settings-01', type: Settings01, input: 'saving' },
  { name: 'pricing-01', type: Pricing01, input: 'loading' },
  { name: 'table-01', type: Table01, input: 'loading' },
  { name: 'kanban-01', type: Kanban01, input: 'loading' },
  { name: 'dashboard-01', type: Dashboard01, input: 'loading' },
];

/**
 * Tiempo máximo de cada caso (M.12). Cada uno pinta un Block entero; `table-01` lleva la Data
 * Table completa y, con `pnpm test:ui-core` y todos los workers ocupados, pasó de los 5 s de
 * Vitest tres veces seguidas el 14/11/2026 (aislado, los 7 casos tardan 2,6 s). 20 s, como las
 * pruebas de páginas de docs y el bloque «M1» de la CLI.
 */
const BLOCK_TIMEOUT = 20_000;

describe('Blocks en carga (R.11)', { timeout: BLOCK_TIMEOUT }, () => {
  for (const block of BLOCKS) {
    it(`${block.name}: con ${block.input} queda inerte y con aria-busy; sin él, normal`, async () => {
      const fixture = TestBed.createComponent(block.type);
      await fixture.whenStable();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.hasAttribute('inert')).toBe(false);
      expect(host.getAttribute('aria-busy')).toBeNull();

      fixture.componentRef.setInput(block.input, true);
      await fixture.whenStable();
      expect(host.hasAttribute('inert')).toBe(true);
      expect(host.getAttribute('aria-busy')).toBe('true');

      fixture.componentRef.setInput(block.input, false);
      await fixture.whenStable();
      expect(host.hasAttribute('inert')).toBe(false);
      expect(host.getAttribute('aria-busy')).toBeNull();
    });
  }
});
