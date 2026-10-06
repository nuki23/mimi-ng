import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { PopoverBasicExample } from './examples/popover-basic.example';
import { PopoverControlledExample } from './examples/popover-controlled.example';
import { PopoverCustomClassExample } from './examples/popover-custom-class.example';
import { PopoverFormExample } from './examples/popover-form.example';
import { PopoverPositionsExample } from './examples/popover-positions.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import popoverBasicSource from './examples/popover-basic.example' with { loader: 'text' };
// @ts-expect-error
import popoverControlledSource from './examples/popover-controlled.example' with { loader: 'text' };
// @ts-expect-error
import popoverCustomClassSource from './examples/popover-custom-class.example' with {
  loader: 'text',
};
// @ts-expect-error
import popoverFormSource from './examples/popover-form.example' with { loader: 'text' };
// @ts-expect-error
import popoverPositionsSource from './examples/popover-positions.example' with { loader: 'text' };

/** Documentación de Popover (tarea G1.1). */
@Component({
  selector: 'app-popover-page',
  imports: [
    CodeBlock,
    CodePreview,
    CssVariables,
    InstallCommand,
    PopoverBasicExample,
    PopoverControlledExample,
    PopoverCustomClassExample,
    PopoverFormExample,
    PopoverPositionsExample,
  ],
  templateUrl: './popover-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverPage {
  protected readonly source = {
    basic: popoverBasicSource as string,
    controlled: popoverControlledSource as string,
    customClass: popoverCustomClassSource as string,
    form: popoverFormSource as string,
    positions: popoverPositionsSource as string,
  };

  protected readonly usage = [
    "import { MimiPopoverImports } from '@/components/ui/popover';",
    '',
    '@Component({',
    "  selector: 'app-invite',",
    '  imports: [MimiPopoverImports, MimiButton],',
    '  template: `',
    '    <mimi-popover side="bottom" align="center">',
    '      <button mimiBtn variant="outline" mimiPopoverTrigger>Invitar</button>',
    '      <ng-template mimiPopoverContent>',
    '        <h4 mimiPopoverTitle>Invitar al proyecto</h4>',
    '        <p mimiPopoverDescription>Recibirá un enlace por correo.</p>',
    '        …',
    '        <button mimiBtn mimiPopoverClose>Listo</button>',
    '      </ng-template>',
    '    </mimi-popover>',
    '  `,',
    '})',
    'export class InviteComponent {}',
  ].join('\n');

  protected readonly cdkCss = [
    '/* styles.css */',
    '@import "tailwindcss";',
    '@import "./app/components/ui/theme/theme-base.css";',
    '@import "@angular/cdk/overlay-prebuilt.css";',
  ].join('\n');

  protected readonly parts = [
    {
      name: '<mimi-popover>',
      description: 'Contenedor: estado, posición y nombre accesible. Su class va al panel.',
    },
    {
      name: '[mimiPopoverTrigger]',
      description: 'El botón que abre y cierra (aria-haspopup, aria-expanded y aria-controls).',
    },
    {
      name: '<ng-template mimiPopoverContent>',
      description: 'El contenido. Se crea al abrir y se destruye al cerrar.',
    },
    {
      name: '[mimiPopoverTitle]',
      description: 'Título: da el nombre accesible al panel (aria-labelledby).',
    },
    { name: '[mimiPopoverDescription]', description: 'Texto secundario (aria-describedby).' },
    {
      name: '[mimiPopoverClose]',
      description: 'Cierra al hacer clic y devuelve el foco al trigger.',
    },
  ];

  protected readonly api = [
    {
      name: 'open',
      type: 'boolean (model)',
      default: 'false',
      description: 'Abierto o cerrado. Admite [(open)] para controlarlo desde fuera.',
    },
    {
      name: 'side',
      type: "'top' | 'right' | 'bottom' | 'left'",
      default: "'bottom'",
      description: 'Lado preferido. Si no cabe, pasa al opuesto y después a los otros dos.',
    },
    {
      name: 'align',
      type: "'start' | 'center' | 'end'",
      default: "'center'",
      description: 'Alineación con el trigger.',
    },
    {
      name: 'arrow',
      type: 'boolean',
      default: 'true',
      description: 'Flecha hacia el trigger. Es decorativa: aria-hidden y sin foco.',
    },
    {
      name: 'label',
      type: 'string',
      default: "''",
      description: 'Nombre accesible del panel (aria-label). Con mimiPopoverTitle no hace falta.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description:
        'Clases del panel, mezcladas con cn(): tus clases ganan. También en mimiPopoverTitle y mimiPopoverDescription.',
    },
  ];
}
