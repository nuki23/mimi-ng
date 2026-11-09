import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { MimiBadge } from '@/components/ui/badge';
import { MimiButton } from '@/components/ui/button';
import { MimiToggleGroupImports } from '@/components/ui/toggle-group';
import { cn } from '@/components/ui/utils/cn';

export type Pricing01Period = 'monthly' | 'yearly';

export interface Pricing01Plan {
  /** Identificador estable (sale en `planSelected`). */
  id: string;
  name: string;
  description: string;
  /** Precio por persona y mes, pagando mes a mes. `null`: «Custom» (sin precio). */
  monthly: number | null;
  /** Precio por persona y mes, pagando el año. `null`: «Custom». */
  yearly: number | null;
  /** El plan destacado («Most popular», borde de color). */
  featured?: boolean;
  /** El texto del botón. */
  cta: string;
  features: { label: string; included: boolean }[];
}

/** Lo que sale al elegir un plan. */
export interface Pricing01Selection {
  plan: Pricing01Plan;
  period: Pricing01Period;
}

/** Los tres planes del diseño, para que la pantalla funcione sin datos. */
export const PRICING_01_PLANS: Pricing01Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'To start organizing your sales.',
    monthly: 12,
    yearly: 10,
    cta: 'Start for free',
    features: [
      { label: 'Up to 5 people', included: true },
      { label: 'Unlimited clients', included: true },
      { label: 'Basic reports', included: true },
      { label: 'Integrations', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'team',
    name: 'Team',
    description: 'For teams that sell every day.',
    monthly: 24,
    yearly: 20,
    featured: true,
    cta: 'Try it for 14 days',
    features: [
      { label: 'Up to 25 people', included: true },
      { label: 'Unlimited clients', included: true },
      { label: 'Advanced reports', included: true },
      { label: 'CRM and ERP integrations', included: true },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Security and control for large teams.',
    monthly: null,
    yearly: null,
    cta: 'Talk to sales',
    features: [
      { label: 'Unlimited people', included: true },
      { label: 'SSO and audit log', included: true },
      { label: 'Custom reports', included: true },
      { label: 'Custom integrations', included: true },
      { label: 'Account manager', included: true },
    ],
  },
];

let nextId = 0;

/**
 * pricing-01 (Block de Mimi): tres planes con un interruptor mensual/anual; el destacado con la
 * insignia «Most popular» y un borde de color. Diseño: docs/design/Block pricing-01.dc.html.
 *
 * Los planes son datos (`plans`, con los del diseño por defecto) y los precios se escriben con
 * `Intl.NumberFormat` (`currency` y `locale`). El borde del destacado es estático (B.7-a): el
 * Border Beam que gira es de Mimi Effects (E.7).
 *
 * ```html
 * <mimi-pricing-01 [plans]="plans" currency="EUR" [(period)]="period" (planSelected)="checkout($event)" />
 * ```
 */
@Component({
  selector: 'mimi-pricing-01',
  imports: [MimiBadge, MimiButton, MimiToggleGroupImports],
  templateUrl: './pricing-01.html',
  host: {
    '[class]': 'classes()',
    '[attr.data-period]': 'period()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pricing01 {
  readonly plans = input<readonly Pricing01Plan[]>(PRICING_01_PLANS);
  /** El periodo. Admite `[(period)]`. */
  readonly period = model<Pricing01Period>('monthly');
  /** Moneda de los precios (ISO 4217). */
  readonly currency = input('USD');
  /** Idioma de los números. Por defecto, el `LOCALE_ID` de la app. */
  readonly locale = input<string | undefined>(undefined);
  readonly faqHref = input('#');
  readonly userClass = input('', { alias: 'class' });

  /** El botón de un plan. */
  readonly planSelected = output<Pricing01Selection>();

  protected readonly id = `mimi-pricing-01-${nextId++}`;
  private readonly appLocale = inject(LOCALE_ID);

  private readonly money = computed(
    () =>
      new Intl.NumberFormat(this.locale() ?? this.appLocale, {
        style: 'currency',
        currency: this.currency(),
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }),
  );

  protected readonly cards = computed(() => {
    const yearly = this.period() === 'yearly';
    const money = this.money();
    return this.plans().map((plan) => {
      const amount = yearly ? plan.yearly : plan.monthly;
      return {
        plan,
        price: amount === null ? 'Custom' : money.format(amount),
        unit: amount === null ? '' : 'per seat / month',
        note:
          amount !== null && yearly ? `Billed yearly: ${money.format(amount * 12)} per seat` : '',
      };
    });
  });

  /**
   * El ahorro del pago anual, calculado con los precios (no escrito a mano): el mayor de los
   * planes con precio, redondeado («−17%» con 12/10 y 24/20). Sin ahorro, sin insignia.
   */
  protected readonly yearlySaving = computed(() => {
    const savings = this.plans().flatMap(({ monthly, yearly }) =>
      monthly && yearly !== null ? [Math.round((1 - yearly / monthly) * 100)] : [],
    );
    const best = Math.max(0, ...savings);
    return best > 0 ? `−${best}%` : null;
  });

  protected readonly classes = computed(() =>
    cn(
      'flex w-full flex-col items-center gap-7 bg-background px-[18px] pt-9 pb-8 text-foreground md:px-10 md:py-14',
      this.userClass(),
    ),
  );

  protected setPeriod(value: unknown): void {
    if (value === 'monthly' || value === 'yearly') this.period.set(value);
  }
}
