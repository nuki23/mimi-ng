import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../code/code-block';
import { BlockDoc, type BlockApiRow, type BlockComponent, type BlockFile } from './block-doc';
import type { BlockState } from './block-frame';
// Los archivos reales del Block, como texto (spec 10: TypeScript no tipa los import attributes).
// @ts-expect-error
import tsSource from '@/blocks/pricing-01/pricing-01' with { loader: 'text' };
// @ts-expect-error
import htmlSource from '@/blocks/pricing-01/pricing-01.html' with { loader: 'text' };
// @ts-expect-error
import indexSource from '@/blocks/pricing-01/index' with { loader: 'text' };

/** Página del Block pricing-01 (B.7). */
@Component({
  selector: 'app-pricing-01-page',
  imports: [BlockDoc, CodeBlock],
  template: `
    <app-block-doc
      name="pricing-01"
      kind="section"
      description="Tres planes con un interruptor mensual/anual; el destacado con la insignia «Most popular» y un borde de color. Los planes son datos y los precios se escriben con Intl."
      [components]="components"
      [files]="files"
      [inputs]="inputs"
      [outputs]="outputs"
      [states]="states"
    >
      <p class="text-pretty">
        Dale tus planes con
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">plans</code> (sin
        ellos, los tres del ejemplo), la moneda con
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">currency</code> y
        el idioma de los números con
        <code class="rounded-[6px] bg-muted px-1.5 py-0.5 font-mono text-[13px]">locale</code> (por
        defecto, el <code class="font-mono text-[13px]">LOCALE_ID</code> de tu app). El borde del
        destacado es estático; el que gira (Border Beam) llegará con Mimi Effects.
      </p>
      <app-code-block [code]="usage" lang="angular-ts" />
      <h3 id="accessibility" class="mt-2 text-lg font-semibold tracking-[-0.01em]">
        Accesibilidad
      </h3>
      <ul class="flex list-disc flex-col gap-1.5 pl-5 text-pretty">
        <li>
          El periodo es un Toggle Group con nombre («Billing period») y sus flechas; el «−17%» va
          dentro del botón Anual y se lee.
        </li>
        <li>Cada plan es una región con el nombre del plan.</li>
        <li>
          Cada característica dice «Included» o «Not included» en texto para lectores (el ícono es
          decorativo).
        </li>
        <li>
          El precio cambia con el periodo sin anunciarse: el cambio lo hizo quien usa la página.
        </li>
      </ul>
    </app-block-doc>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pricing01Page {
  protected readonly usage = [
    "import { Pricing01, type Pricing01Plan } from './blocks/pricing-01';",
    '',
    '<mimi-pricing-01',
    '  [plans]="plans"',
    '  currency="EUR"',
    '  [(period)]="period"',
    '  (planSelected)="checkout($event.plan.id, $event.period)"',
    '/>',
  ].join('\n');

  protected readonly components: BlockComponent[] = [
    { name: 'toggle-group', path: '/docs/components/toggle-group' },
    { name: 'badge', path: '/docs/components/badge' },
    { name: 'button', path: '/docs/components/button' },
  ];

  protected readonly files: BlockFile[] = [
    { name: 'pricing-01/pricing-01.ts', code: tsSource as string, lang: 'angular-ts' },
    { name: 'pricing-01/pricing-01.html', code: htmlSource as string, lang: 'angular-html' },
    { name: 'pricing-01/index.ts', code: indexSource as string, lang: 'typescript' },
  ];

  protected readonly states: BlockState[] = [
    { id: 'yearly', label: 'Anual' },
    { id: 'loading', label: 'Cargando' },
  ];

  protected readonly inputs: BlockApiRow[] = [
    {
      name: 'plans',
      type: 'Pricing01Plan[]',
      default: 'los tres del ejemplo',
      description:
        'id, name, description, monthly, yearly (null: «Custom»), featured, cta, features.',
    },
    {
      name: 'period',
      type: "'monthly' | 'yearly'",
      default: "'monthly'",
      description: 'El periodo. Admite [(period)].',
    },
    { name: 'currency', type: 'string', default: "'USD'", description: 'Moneda (ISO 4217).' },
    {
      name: 'locale',
      type: 'string',
      default: 'LOCALE_ID',
      description: 'Idioma de los números (Intl.NumberFormat).',
    },
    { name: 'faqHref', type: 'string', default: "'#'", description: 'Enlace «FAQ» del pie.' },
    { name: 'class', type: 'string', default: "''", description: 'Se mezcla con cn().' },
  ];

  protected readonly outputs: BlockApiRow[] = [
    {
      name: 'planSelected',
      type: '{ plan, period }',
      default: '—',
      description: 'El botón de un plan (Pricing01Selection).',
    },
  ];
}
