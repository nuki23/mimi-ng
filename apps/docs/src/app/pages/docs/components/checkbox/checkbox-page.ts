import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CodeBlock } from '../../../../code/code-block';
import { CodePreview } from '../../../../code/code-preview';
import { CssVariables } from '../../../../code/css-variables';
import { InstallCommand } from '../../../../code/install-command';
import { CheckboxSelectAllExample } from './examples/checkbox-select-all.example';
import { CheckboxSizesExample } from './examples/checkbox-sizes.example';
import { CheckboxStatesExample } from './examples/checkbox-states.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import selectAllSource from './examples/checkbox-select-all.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/checkbox-sizes.example' with { loader: 'text' };
// @ts-expect-error
import statesSource from './examples/checkbox-states.example' with { loader: 'text' };

/** Documentación de Checkbox (R.3: antes compartía página con Switch). */
@Component({
  selector: 'app-checkbox-page',
  imports: [
    CodeBlock,
    CssVariables,
    CodePreview,
    InstallCommand,
    CheckboxSelectAllExample,
    CheckboxSizesExample,
    CheckboxStatesExample,
  ],
  templateUrl: './checkbox-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPage {
  protected readonly source = {
    selectAll: selectAllSource as string,
    sizes: sizesSource as string,
    states: statesSource as string,
  };

  protected readonly usage = [
    "import { MimiCheckbox } from '@/components/ui/checkbox';",
    '',
    '@Component({',
    "  selector: 'app-registro',",
    '  imports: [MimiCheckbox],',
    '  template: `',
    '    <mimi-checkbox [(checked)]="recordarme">Recordarme</mimi-checkbox>',
    '    <mimi-checkbox size="sm" [(checked)]="acepto">Acepto los términos</mimi-checkbox>',
    '  `,',
    '})',
    'export class RegistroComponent {',
    '  readonly recordarme = signal(true);',
    '  readonly acepto = signal(false);',
    '}',
  ].join('\n');

  protected readonly api = [
    {
      name: 'checked',
      type: 'boolean (model)',
      default: 'false',
      description: 'Estado. Úsalo con [(checked)] o deja que lo maneje el formulario.',
    },
    {
      name: 'indeterminate',
      type: 'boolean (model)',
      default: 'false',
      description:
        'Estado mixto (aria-checked="mixed"): gana a checked. Al hacer clic se marca y deja de ser mixto.',
    },
    {
      name: 'size',
      type: "'sm' | 'md' | 'lg'",
      default: "'md' (o el del contenedor con mimiSize)",
      description: 'Casilla de 14, 16 o 20 px, con el texto al tamaño de la escala.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Deshabilita el control. Con un formulario, lo pasa el formulario.',
    },
    {
      name: 'id',
      type: 'string',
      default: 'automático',
      description: 'id del botón interno, para nombrarlo con un <label for> externo.',
    },
    {
      name: 'aria-label',
      type: 'string',
      default: '—',
      description: 'Nombre accesible cuando no hay texto ni etiqueta externa.',
    },
    {
      name: 'invalid, touched, dirty, required',
      type: 'boolean',
      default: 'false',
      description:
        'Los pasa el formulario. Con inválido y tocado o modificado, el control lleva aria-invalid.',
    },
    {
      name: 'class',
      type: 'string',
      default: "''",
      description: 'Clases del envoltorio (casilla + texto). Se mezclan con cn(): las tuyas ganan.',
    },
  ];
}
