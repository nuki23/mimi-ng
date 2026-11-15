import type { DocPage } from '../../../../doc-page/doc-page.types';
import { FormFieldBasicExample } from './examples/form-field-basic.example';
import { FormFieldCustomClassExample } from './examples/form-field-custom-class.example';
import { FormFieldCustomErrorExample } from './examples/form-field-custom-error.example';
import { FormFieldMessagesDefaultExample } from './examples/form-field-messages-default.example';
import { FormFieldMessagesProviderExample } from './examples/form-field-messages-provider.example';
import { FormFieldOwnLabelExample } from './examples/form-field-own-label.example';
import { FormFieldRegisterExample } from './examples/form-field-register.example';
import { FormFieldSignalFormsExample } from './examples/form-field-signal-forms.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import basicSource from './examples/form-field-basic.example' with { loader: 'text' };
// @ts-expect-error
import customClassSource from './examples/form-field-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import customErrorSource from './examples/form-field-custom-error.example' with { loader: 'text' };
// @ts-expect-error
import messagesDefaultSource from './examples/form-field-messages-default.example' with {
  loader: 'text',
};
// @ts-expect-error
import messagesProviderSource from './examples/form-field-messages-provider.example' with {
  loader: 'text',
};
// @ts-expect-error
import ownLabelSource from './examples/form-field-own-label.example' with { loader: 'text' };
// @ts-expect-error
import registerSource from './examples/form-field-register.example' with { loader: 'text' };
// @ts-expect-error
import signalFormsSource from './examples/form-field-signal-forms.example' with { loader: 'text' };

/** La página de Form Field (G1.12 y R.14), con la plantilla de página (DP.1). */
export const FORM_FIELD_PAGE: DocPage = {
  name: 'FormField',
  lead: 'Contenedor de un campo de formulario: une la etiqueta, el control y el mensaje de error, y lo muestra sin escribir ningún `@if`.',
  demo: {
    id: 'demo',
    title: '',
    sentence: 'Escribe un correo inválido o pulsa «Suscribirme» con el campo vacío.',
    component: FormFieldBasicExample,
    source: basicSource as string,
  },
  install: 'form-field',
  usage: {
    code: [
      "import { MimiFormField } from '@/components/ui/form-field';",
      "import { MimiInput } from '@/components/ui/input';",
      '',
      '@Component({',
      "  selector: 'app-perfil',",
      '  imports: [ReactiveFormsModule, MimiFormField, MimiInput],',
      '  template: `',
      '    <mimi-form-field label="Correo">',
      '      <input mimiInput type="email" [formControl]="email" />',
      '    </mimi-form-field>',
      '  `,',
      '})',
      'export class PerfilComponent {',
      "  readonly email = new FormControl('', [Validators.required, Validators.email]);",
      '}',
    ].join('\n'),
    note: 'Funciona con Input, Textarea, Select, Switch y Checkbox, y con los tres sistemas de formularios de Angular.',
    more: {
      summary: 'Qué mensaje de error se muestra',
      ordered: true,
      items: [
        'Gana el primer nivel que tenga un mensaje para el error. Primero, `mimi-form-error` con tu texto, en un campo.',
        'El `message` del validador: en Signal Forms, `required(path.user, { message: … })`; en Reactive Forms, `withMessage(Validators.required, …)` o un error propio `{ taken: { message: … } }`.',
        '`[errors]` en el campo: un texto (o una función) por clave de error, para los tres sistemas, también `ngModel` con `required` como atributo.',
        '`provideMimiErrorMessages`, para toda la app. Los datos del error usan los nombres de Reactive Forms en los tres sistemas (`requiredLength`, `min`, `max`…).',
        'Los predeterminados, en inglés (`required`, `email`, `minlength`, `maxlength`, `min`, `max`, `pattern` y `default`, el de un error sin mensaje). `MIMI_ERROR_MESSAGES_ES` los trae en español.',
      ],
    },
  },
  examples: {
    advanced: [
      {
        id: 'own-label',
        title: 'Etiqueta propia',
        sentence:
          'Proyecta tu propio `<label>` para una etiqueta con más detalle: si no tiene `for`, el campo se lo asigna, y con error se pone roja.',
        component: FormFieldOwnLabelExample,
        source: ownLabelSource as string,
      },
      {
        id: 'register',
        title: 'Formulario de registro',
        sentence:
          'Card, FormField, Input, Textarea, Checkbox y Button juntos. Pulsa «Crear cuenta» para ver todos los errores.',
        component: FormFieldRegisterExample,
        source: registerSource as string,
      },
      {
        id: 'level-form-error',
        title: 'Mensaje propio con mimi-form-error',
        sentence:
          'Tu texto reemplaza al automático, sea cual sea el error. La validación es propia, con `showError`: prueba «ana» o «admin».',
        component: FormFieldCustomErrorExample,
        source: customErrorSource as string,
      },
      {
        id: 'level-validator',
        title: 'Mensaje en el validador',
        sentence:
          'Con Signal Forms, el `message` del esquema viaja con el error. «Contraseña» no lo tiene, así que usa el nivel siguiente.',
        component: FormFieldSignalFormsExample,
        source: signalFormsSource as string,
      },
      {
        id: 'level-provider',
        title: 'Mensajes para toda la app',
        sentence:
          'Parte de `MIMI_ERROR_MESSAGES_ES`, cambia los que quieras y agrega los de tus validadores. Borra el campo para ver el `required` cambiado.',
        component: FormFieldMessagesProviderExample,
        source: messagesProviderSource as string,
      },
      {
        id: 'level-default',
        title: 'Los mensajes predeterminados',
        sentence: 'Sin configurar nada, los mensajes están en inglés.',
        component: FormFieldMessagesDefaultExample,
        source: messagesDefaultSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          'Etiqueta a la izquierda con una grilla; el mensaje va en la segunda columna con `class` en `mimi-form-error`.',
        component: FormFieldCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'La etiqueta queda enlazada al control: si el control no tiene `id`, se le asigna uno.',
      'La descripción, la ayuda y el error van en el `aria-describedby` del control, en ese orden.',
      'El mensaje está siempre en el DOM con `aria-live="polite"`: vacío sin error, así el lector lo anuncia cuando aparece.',
      'El error se muestra cuando el campo es inválido y ya se tocó o modificó; la etiqueta se pone roja.',
      'Con `required`, el asterisco no lo leen los lectores y el control lleva `aria-required`.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'label',
        type: 'string',
        default: '—',
        description:
          'Texto de la etiqueta, enlazada al control. Sin `label`, puedes proyectar tu propio `<label>`.',
      },
      {
        name: 'description',
        type: 'string',
        default: '—',
        description: 'Ayuda entre la etiqueta y el control (qué se pide).',
      },
      {
        name: 'hint',
        type: 'string',
        default: '—',
        description: 'Ayuda debajo del control (formato, límites), antes del error.',
      },
      {
        name: 'required',
        type: 'boolean',
        default: 'false',
        description:
          'Asterisco en la etiqueta y `aria-required` en el control. La validación es la de tu formulario.',
      },
      {
        name: 'errors',
        type: 'Record<string, string | ((e) => string)>',
        default: '—',
        description:
          'Mensajes de este campo, por clave de error. El `message` del validador gana sobre ellos.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'Clases del contenedor. Se mezclan con `cn()`: las tuyas ganan.',
      },
    ],
    parts: [
      {
        name: 'MimiFormError',
        selector: 'mimi-form-error',
        description:
          'El mensaje. Con un texto dentro, se muestra ese en lugar del automático; acepta `class`.',
      },
      {
        name: 'withMessage',
        selector: 'withMessage(validador, texto)',
        description: 'Reactive Forms: un validador cuyo error lleva su mensaje.',
      },
    ],
  },
  texts: [
    {
      constant: 'MIMI_ERROR_MESSAGES_ES',
      provider: 'provideMimiErrorMessages',
      path: 'form-field',
    },
  ],
  tokens: 'formField',
};
