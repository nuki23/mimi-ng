import type { DocPage } from '../../../../doc-page/doc-page.types';
import { AvatarCustomClassExample } from './examples/avatar-custom-class.example';
import { AvatarDemoExample } from './examples/avatar-demo.example';
import { AvatarFallbackExample } from './examples/avatar-fallback.example';
import { AvatarSizesExample } from './examples/avatar-sizes.example';
// El código de cada ejemplo se importa también como texto: la pestaña Código muestra el
// archivo real. TypeScript todavía no tipa los import attributes (spec, sección 10).
// @ts-expect-error
import customClassSource from './examples/avatar-custom-class.example' with { loader: 'text' };
// @ts-expect-error
import demoSource from './examples/avatar-demo.example' with { loader: 'text' };
// @ts-expect-error
import fallbackSource from './examples/avatar-fallback.example' with { loader: 'text' };
// @ts-expect-error
import sizesSource from './examples/avatar-sizes.example' with { loader: 'text' };

/** La página de Avatar (tarea 2.8), con la plantilla de página (DP.2). */
export const AVATAR_PAGE: DocPage = {
  name: 'Avatar',
  lead: 'Foto de una persona con iniciales de respaldo, que se ven mientras la imagen carga, si falla o si no hay imagen.',
  demo: {
    id: 'demo',
    title: '',
    sentence: 'Una lista de personas: la primera con foto y la segunda solo con sus iniciales.',
    component: AvatarDemoExample,
    source: demoSource as string,
  },
  install: 'avatar',
  usage: {
    code: [
      "import { MimiAvatarImports } from '@/components/ui/avatar';",
      '',
      '@Component({',
      "  selector: 'app-perfil',",
      '  imports: [MimiAvatarImports],',
      '  template: `',
      '    <mimi-avatar>',
      '      <img mimiAvatarImage src="/ana.png" alt="Ana Torres" />',
      '      <mimi-avatar-fallback label="Ana Torres">AT</mimi-avatar-fallback>',
      '    </mimi-avatar>',
      '  `,',
      '})',
      'export class PerfilComponent {}',
    ].join('\n'),
    note: 'La imagen es el `<img>` nativo: `alt`, `srcset` y `loading="lazy"` funcionan como siempre. Todavía no admite `ngSrc`.',
  },
  examples: {
    sizes: [
      {
        id: 'sizes',
        title: 'Tamaños',
        sentence: '`sm`, `md` y `lg` (32, 40 y 56 px), con imagen y solo con iniciales.',
        component: AvatarSizesExample,
        source: sizesSource as string,
      },
    ],
    states: [
      {
        id: 'fallback',
        title: 'Si la imagen falla',
        sentence:
          'Mientras carga y si no se puede cargar, se ven las iniciales. `data-state` (`idle`, `loading`, `loaded` o `error`) sirve para darle estilos.',
        component: AvatarFallbackExample,
        source: fallbackSource as string,
      },
    ],
    custom: [
      {
        id: 'custom-class',
        title: 'Personalizar con class',
        sentence:
          'Un grupo superpuesto: cada avatar con un anillo del color de fondo y un contador de otro color.',
        component: AvatarCustomClassExample,
        source: customClassSource as string,
      },
    ],
  },
  accessibility: {
    points: [
      'Pon siempre `alt` con el nombre de la persona en la imagen.',
      'Pasa también `label` al fallback: lleva `role="img"` y los lectores de pantalla anuncian el nombre en lugar de las letras sueltas.',
      'Mientras no carga, la imagen queda oculta para los lectores de pantalla: el nombre no se anuncia dos veces.',
      'No recibe el foco: si el avatar abre un perfil, ponlo dentro de un enlace o un botón.',
    ],
  },
  api: {
    inputs: [
      {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        default: "'md' (o el del contenedor con mimiSize)",
        description: '32, 40 o 56 px; el tamaño de las iniciales va con él.',
      },
      {
        name: 'src (en la imagen)',
        type: 'string | null',
        default: '—',
        description:
          'Dirección de la imagen. Al cambiar, vuelve a cargar; sin `src`, se ve el fallback.',
      },
      {
        name: 'label (en el fallback)',
        type: 'string',
        default: '—',
        description:
          'Nombre completo: los lectores de pantalla lo anuncian en lugar de leer las iniciales.',
      },
      {
        name: 'class',
        type: 'string',
        default: "''",
        description: 'En todas las piezas. Se mezcla con `cn()`: las tuyas ganan.',
      },
    ],
    parts: [
      {
        name: 'MimiAvatarImage',
        selector: 'img[mimiAvatarImage]',
        description: 'La foto, sobre el `<img>` nativo. Invisible hasta que carga.',
      },
      {
        name: 'MimiAvatarFallback',
        selector: 'mimi-avatar-fallback',
        description: 'Iniciales o ícono mientras carga, si falla o sin imagen.',
      },
    ],
    dataAttributes: ['data-size', 'data-state'],
  },
  tokens: 'avatar',
};
