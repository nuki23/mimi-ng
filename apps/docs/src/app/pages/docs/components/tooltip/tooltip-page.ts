import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { TooltipBasicExample } from './examples/tooltip-basic.example';
import { TooltipDelayExample } from './examples/tooltip-delay.example';
import { TooltipDisabledExample } from './examples/tooltip-disabled.example';
import { TooltipIconButtonExample } from './examples/tooltip-icon-button.example';
import { TooltipPositionsExample } from './examples/tooltip-positions.example';
import { TooltipToolbarExample } from './examples/tooltip-toolbar.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import tooltipBasicSource from './examples/tooltip-basic.example' with { loader: 'text' };
// @ts-expect-error
import tooltipDelaySource from './examples/tooltip-delay.example' with { loader: 'text' };
// @ts-expect-error
import tooltipDisabledSource from './examples/tooltip-disabled.example' with { loader: 'text' };
// @ts-expect-error
import tooltipIconButtonSource from './examples/tooltip-icon-button.example' with {
  loader: 'text',
};
// @ts-expect-error
import tooltipPositionsSource from './examples/tooltip-positions.example' with { loader: 'text' };
// @ts-expect-error
import tooltipToolbarSource from './examples/tooltip-toolbar.example' with { loader: 'text' };

/** Documentación de Tooltip (tarea G1.2). */
@Component({
  selector: 'app-tooltip-page',
  imports: [
    RouterLink,
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    TooltipBasicExample,
    TooltipDelayExample,
    TooltipDisabledExample,
    TooltipIconButtonExample,
    TooltipPositionsExample,
    TooltipToolbarExample,
  ],
  templateUrl: './tooltip-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipPage {
  protected readonly source = {
    basic: tooltipBasicSource as string,
    delay: tooltipDelaySource as string,
    disabled: tooltipDisabledSource as string,
    iconButton: tooltipIconButtonSource as string,
    positions: tooltipPositionsSource as string,
    toolbar: tooltipToolbarSource as string,
  };

  protected readonly usage = [
    "import { MimiTooltip } from '@/components/ui/tooltip';",
    '',
    '@Component({',
    "  selector: 'app-save',",
    '  imports: [MimiTooltip, MimiButton],',
    '  template: `',
    '    <button mimiBtn mimiTooltip="Guarda los cambios" mimiTooltipSide="bottom">',
    '      Guardar',
    '    </button>',
    '  `,',
    '})',
    'export class SaveComponent {}',
  ].join('\n');

  protected readonly cdkCss = [
    '/* styles.css */',
    '@import "tailwindcss";',
    '@import "./app/components/ui/theme/theme-base.css";',
    '@import "@angular/cdk/overlay-prebuilt.css";',
  ].join('\n');

  protected readonly api = [
    {
      name: 'mimiTooltip',
      type: 'string',
      default: "''",
      description: 'El texto. Si está vacío, no se muestra. Solo texto: nada interactivo.',
    },
    {
      name: 'mimiTooltipSide',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'top'",
      description: 'Lado preferido. Si no cabe, pasa al opuesto y después a los otros dos.',
    },
    {
      name: 'mimiTooltipAlign',
      type: "'start' | 'center' | 'end'",
      default: "'center'",
      description: 'Alineación con el elemento.',
    },
    {
      name: 'mimiTooltipDelay',
      type: 'number',
      default: '--mimi-tooltip-delay (300ms)',
      description: 'Retraso al abrir, en ms. Sin él, se usa el token del tema.',
    },
    {
      name: 'mimiTooltipDisabled',
      type: 'boolean',
      default: 'false',
      description: 'No lo muestra.',
    },
    {
      name: 'mimiTooltipShortcut',
      type: 'string',
      default: "''",
      description: 'Atajo de teclado, en monoespaciada (por ejemplo ⌘C).',
    },
    {
      name: 'mimiTooltipArrow',
      type: 'boolean',
      default: 'true',
      description: 'Flecha hacia el elemento. Es decorativa: aria-hidden.',
    },
    {
      name: 'mimiTooltipClass',
      type: 'string',
      default: "''",
      description:
        'Clases del tooltip, mezcladas con cn(): tus clases ganan. (El class del elemento es del propio elemento.)',
    },
  ];
}
