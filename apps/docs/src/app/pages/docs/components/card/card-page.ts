import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { InstallCommand } from '../../../../code/install-command';
import { CardContentOnlyExample } from './examples/card-content-only.example';
import { CardCustomClassExample } from './examples/card-custom-class.example';
import { CardFormExample } from './examples/card-form.example';
import { CardPlanExample } from './examples/card-plan.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import cardContentOnlySource from './examples/card-content-only.example' with { loader: 'text' };
// @ts-expect-error
import cardCustomClassSource from './examples/card-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import cardFormSource from './examples/card-form.example' with { loader: 'text' };
// @ts-expect-error
import cardPlanSource from './examples/card-plan.example' with { loader: 'text' };

/** Documentación de Card (tarea 2.5). */
@Component({
  selector: 'app-card-page',
  imports: [
    CodeBlock,
    CodePreview,
    InstallCommand,
    CardContentOnlyExample,
    CardCustomClassExample,
    CardFormExample,
    CardPlanExample,
  ],
  templateUrl: './card-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardPage {
  protected readonly source = {
    contentOnly: cardContentOnlySource as string,
    customClass: cardCustomClassSource as string,
    form: cardFormSource as string,
    plan: cardPlanSource as string,
  };

  protected readonly usage = [
    "import { MimiCardImports } from '@/components/ui/card';",
    '',
    '@Component({',
    "  selector: 'app-plan',",
    '  imports: [MimiCardImports],',
    '  template: `',
    '    <mimi-card>',
    '      <mimi-card-header>',
    '        <mimi-card-title>Plan Equipo</mimi-card-title>',
    '        <mimi-card-description>Para equipos de hasta 10 personas.</mimi-card-description>',
    '      </mimi-card-header>',
    '      <mimi-card-content>…</mimi-card-content>',
    '      <mimi-card-footer>…</mimi-card-footer>',
    '    </mimi-card>',
    '  `,',
    '})',
    'export class PlanComponent {}',
  ].join('\n');

  protected readonly ownHeading = [
    '<mimi-card-header>',
    '  <h2 class="text-lg leading-tight font-semibold tracking-[-0.01em]">Plan Equipo</h2>',
    '  <mimi-card-description>Para equipos de hasta 10 personas.</mimi-card-description>',
    '</mimi-card-header>',
  ].join('\n');

  protected readonly parts = [
    {
      name: '<mimi-card>',
      description: 'Contenedor: fondo, borde, radio y sombra de la tarjeta.',
    },
    { name: '<mimi-card-header>', description: 'Agrupa el título y la descripción.' },
    {
      name: '<mimi-card-title>',
      description: 'Título. Es un encabezado para los lectores de pantalla (role="heading").',
    },
    { name: '<mimi-card-description>', description: 'Texto secundario bajo el título.' },
    { name: '<mimi-card-content>', description: 'Contenido principal.' },
    { name: '<mimi-card-footer>', description: 'Acciones, alineadas a la derecha.' },
  ];

  protected readonly api = [
    {
      name: 'level',
      type: 'number',
      default: '3',
      description: 'Solo en mimi-card-title: nivel del encabezado (aria-level).',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'En todas las piezas. Se mezcla con cn(): tus clases ganan.',
    },
  ];

  protected readonly tokens = [
    { name: '--mimi-card-radius', default: 'var(--mimi-radius-card)' },
    { name: '--mimi-card-border-width', default: '1px' },
    { name: '--mimi-card-shadow', default: 'var(--mimi-shadow-card)' },
    { name: '--mimi-card-padding-header', default: '1.5rem 1.5rem 1rem' },
    { name: '--mimi-card-padding-content', default: '0 1.5rem 1.25rem' },
    { name: '--mimi-card-padding-footer', default: '0 1.5rem 1.5rem' },
  ];
}
