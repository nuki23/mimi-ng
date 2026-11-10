/**
 * R.13: el mismo campo con los tres formularios de Angular (Signal Forms, Reactive Forms y plantilla
 * con ngModel). Una sola fuente: cada componente de formulario se describe una vez aquí y el
 * componente compartido `FormsTabs` pinta sus tres pestañas, sin repetir el código en 17 páginas.
 */
export interface FormsSpec {
  /** Etiqueta del campo (`mimi-form-field`). */
  label: string;
  /** Nombre del campo en el modelo. */
  field: string;
  /** Valor inicial, en TypeScript (`'es'`, `null`, `[]`, `false`). */
  init: string;
  /** Tipo del valor (`string | null`). */
  type: string;
  /** Importes del componente: nombres y archivo (`@/components/ui/<path>`). */
  imports: readonly string[];
  path: string;
  /**
   * El control, con `{{attrs}} ` donde van los atributos del formulario (`[formField]`,
   * `formControlName` o `[(ngModel)]`). Con una envoltura (Password), `{{attrs}}` va en el `<input>`.
   */
  markup: string;
  /** Código de la clase que el control necesita (opciones, validador…), tal cual. */
  extra?: string;
  /** Mensaje de «obligatorio» de Signal Forms. */
  message: string;
}

/** Los tres formularios, en el orden de las pestañas. */
export const FORMS_KINDS = ['signal', 'reactive', 'template'] as const;
export type FormsKind = (typeof FORMS_KINDS)[number];

export const FORMS_LABELS: Record<FormsKind, string> = {
  signal: 'Signal Forms',
  reactive: 'Reactive Forms',
  template: 'Plantilla (ngModel)',
};

const attrsFor = (kind: FormsKind, field: string): string =>
  kind === 'signal'
    ? `[formField]="f.${field}"`
    : kind === 'reactive'
      ? `formControlName="${field}"`
      : `name="${field}" [(ngModel)]="${field}"`;

const indent = (text: string, spaces: number): string =>
  text
    .split('\n')
    .map((line) => (line ? ' '.repeat(spaces) + line : line))
    .join('\n');

/** El fragmento de una pestaña. */
export function formsSnippet(spec: FormsSpec, kind: FormsKind): string {
  const control = spec.markup.replace('{{attrs}}', attrsFor(kind, spec.field));
  const field = `<mimi-form-field label="${spec.label}">\n  ${control}\n</mimi-form-field>`;
  const components = ['MimiFormField', ...spec.imports].join(', ');
  const lib = `import { MimiFormField } from '@/components/ui/form-field';\nimport { ${spec.imports.join(', ')} } from '@/components/ui/${spec.path}';`;
  const extra = spec.extra ? `\n${indent(spec.extra, 2)}` : '';

  if (kind === 'signal') {
    return [
      "import { Component, signal } from '@angular/core';",
      "import { FormField, form, required } from '@angular/forms/signals';",
      lib,
      '',
      '@Component({',
      `  imports: [FormField, ${components}],`,
      '  template: `',
      indent(field, 4),
      '  `,',
      '})',
      'export class Demo {',
      `  protected readonly model = signal<{ ${spec.field}: ${spec.type} }>({ ${spec.field}: ${spec.init} });`,
      '  protected readonly f = form(this.model, (path) => {',
      `    required(path.${spec.field}, { message: '${spec.message}' });`,
      '  });' + extra,
      '}',
    ].join('\n');
  }
  if (kind === 'reactive') {
    return [
      "import { Component } from '@angular/core';",
      "import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';",
      lib,
      '',
      '@Component({',
      `  imports: [ReactiveFormsModule, ${components}],`,
      '  template: `',
      '    <form [formGroup]="form">',
      indent(field, 6),
      '    </form>',
      '  `,',
      '})',
      'export class Demo {',
      '  protected readonly form = new FormGroup({',
      `    ${spec.field}: new FormControl<${spec.type}>(${spec.init}, Validators.required),`,
      '  });' + extra,
      '}',
    ].join('\n');
  }
  return [
    "import { Component, signal } from '@angular/core';",
    "import { FormsModule } from '@angular/forms';",
    lib,
    '',
    '@Component({',
    `  imports: [FormsModule, ${components}],`,
    '  template: `',
    indent(field, 4),
    '  `,',
    '})',
    'export class Demo {',
    `  protected readonly ${spec.field} = signal<${spec.type}>(${spec.init});` + extra,
    '}',
  ].join('\n');
}

const OPTIONS = (name: string, a: string, b: string) =>
  `protected readonly ${name} = [\n  { label: '${a}', value: '${a.toLowerCase()}' },\n  { label: '${b}', value: '${b.toLowerCase()}' },\n];`;

/** Un componente por clave: la clave es la misma de la ruta de su página. */
export const FORMS_SPECS: Record<string, FormsSpec> = {
  input: {
    label: 'Correo',
    field: 'email',
    init: "''",
    type: 'string',
    imports: ['MimiInput'],
    path: 'input',
    markup: '<input mimiInput type="email" {{attrs}} />',
    message: 'Escribe tu correo.',
  },
  select: {
    label: 'Rol',
    field: 'role',
    init: "'editor'",
    type: 'string | null',
    imports: ['MimiSelect'],
    path: 'select',
    markup: '<mimi-select placeholder="Elige un rol" [options]="roles" {{attrs}} />',
    extra: OPTIONS('roles', 'Admin', 'Editor'),
    message: 'Elige un rol.',
  },
  combobox: {
    label: 'Ciudad',
    field: 'city',
    init: 'null',
    type: 'string | null',
    imports: ['MimiCombobox'],
    path: 'combobox',
    markup: '<mimi-combobox placeholder="Busca una ciudad" [options]="cities" {{attrs}} />',
    extra: OPTIONS('cities', 'Lima', 'Madrid'),
    message: 'Elige una ciudad.',
  },
  'number-input': {
    label: 'Asientos',
    field: 'seats',
    init: '1',
    type: 'number | null',
    imports: ['MimiNumberInput'],
    path: 'number-input',
    markup: '<mimi-number-input [min]="1" [max]="12" {{attrs}} />',
    message: 'Indica cuántos asientos.',
  },
  password: {
    label: 'Contraseña',
    field: 'password',
    init: "''",
    type: 'string',
    imports: ['MimiPassword', 'MimiInput'],
    path: 'password',
    markup:
      '<mimi-password>\n    <input mimiInput type="password" autocomplete="new-password" {{attrs}} />\n  </mimi-password>',
    message: 'Escribe una contraseña.',
  },
  'input-mask': {
    label: 'Teléfono',
    field: 'phone',
    init: "''",
    type: 'string',
    imports: ['MimiInputMask'],
    path: 'input-mask',
    markup: '<mimi-input-mask mask="(000) 000-0000" {{attrs}} />',
    message: 'Escribe tu teléfono.',
  },
  'tags-input': {
    label: 'Temas',
    field: 'topics',
    init: '[]',
    type: 'string[]',
    imports: ['MimiTagsInput'],
    path: 'tags-input',
    markup: '<mimi-tags-input {{attrs}} />',
    message: 'Agrega al menos un tema.',
  },
  'input-otp': {
    label: 'Código',
    field: 'code',
    init: "''",
    type: 'string',
    imports: ['MimiInputOtp'],
    path: 'input-otp',
    markup: '<mimi-input-otp [separatorAfter]="3" {{attrs}} />',
    message: 'Escribe el código.',
  },
  'date-picker': {
    label: 'Entrega',
    field: 'delivery',
    init: 'null',
    type: 'string | null',
    imports: ['MimiDatePicker'],
    path: 'date-picker',
    markup: '<mimi-date-picker locale="es" placeholder="Elige un día" {{attrs}} />',
    message: 'Elige una fecha.',
  },
  'date-range': {
    label: 'Vacaciones',
    field: 'dates',
    init: 'null',
    type: '{ start: string; end: string } | null',
    imports: ['MimiDateRangePicker'],
    path: 'date-range',
    markup: '<mimi-date-range locale="es" placeholder="Elige un periodo" {{attrs}} />',
    message: 'Elige un periodo.',
  },
  'color-picker': {
    label: 'Color de marca',
    field: 'brand',
    init: "''",
    type: 'string',
    imports: ['MimiColorInput'],
    path: 'color-picker',
    markup: '<mimi-color-input placeholder="Sin color" {{attrs}} />',
    message: 'Elige un color.',
  },
  'file-upload': {
    label: 'Adjuntos',
    field: 'files',
    init: '[]',
    type: 'File[]',
    imports: ['MimiFileUpload'],
    path: 'file-upload',
    markup: '<mimi-file-upload multiple accept=".pdf" hint="Solo PDF" {{attrs}} />',
    message: 'Adjunta un archivo.',
  },
  switch: {
    label: 'Avisos',
    field: 'notify',
    init: 'false',
    type: 'boolean',
    imports: ['MimiSwitch'],
    path: 'switch',
    markup: '<mimi-switch {{attrs}}>Recibir novedades</mimi-switch>',
    message: 'Actívalo para continuar.',
  },
  checkbox: {
    label: 'Términos',
    field: 'terms',
    init: 'false',
    type: 'boolean',
    imports: ['MimiCheckbox'],
    path: 'checkbox',
    markup: '<mimi-checkbox {{attrs}}>Acepto los términos</mimi-checkbox>',
    message: 'Debes aceptar los términos.',
  },
  'toggle-group': {
    label: 'Periodo',
    field: 'period',
    init: "'mes'",
    type: 'string | null',
    imports: ['MimiToggleGroup', 'MimiToggleGroupItem'],
    path: 'toggle-group',
    markup:
      '<mimi-toggle-group aria-label="Periodo" {{attrs}}>\n    <button mimiToggleGroupItem="dia">Día</button>\n    <button mimiToggleGroupItem="mes">Mes</button>\n  </mimi-toggle-group>',
    message: 'Elige un periodo.',
  },
  slider: {
    label: 'Volumen',
    field: 'volume',
    init: '40',
    type: 'number',
    imports: ['MimiSlider'],
    path: 'slider',
    markup: '<mimi-slider aria-label="Volumen" {{attrs}} />',
    message: 'Elige un volumen.',
  },
  tree: {
    label: 'Categorías',
    field: 'categories',
    init: '[]',
    type: 'string[]',
    imports: ['MimiTree', 'type MimiTreeNode'],
    path: 'tree',
    markup: '<mimi-tree aria-label="Categorías" multiple [nodes]="nodes" {{attrs}} />',
    extra:
      "protected readonly nodes: MimiTreeNode[] = [\n  { id: 'ropa', label: 'Ropa' },\n  { id: 'hogar', label: 'Hogar' },\n];",
    message: 'Elige una categoría.',
  },
};
