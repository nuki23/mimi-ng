import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowLeftRight,
  LucideArrowRight,
  LucideGitMerge,
  LucideLayers,
  LucideListChecks,
  LucideSparkles,
} from '@lucide/angular';
import { MimiBadge } from '@/components/ui/badge';
import { MimiButton } from '@/components/ui/button';
import { MimiCardImports } from '@/components/ui/card';
import { CodeBlock } from '../code/code-block';
import { SITE } from '../site';
import { ShowcasePreferences } from './home/showcase-preferences';
import { ShowcaseTeam } from './home/showcase-team';

interface Feature {
  icon: 'git-merge' | 'layers' | 'arrow-left-right' | 'list-checks';
  title: string;
  body: string;
  /**
   * Etiqueta para lo que todavía no existe (del todo): «Próximamente», o qué parte falta.
   * Ninguna tarjeta enlaza a una página.
   */
  badge?: string;
}

/** Landing del showcase (docs/design/Mimi Sitio.dc.html). Ruta lazy: nada de aquí va al bundle inicial. */
@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    LucideArrowLeftRight,
    LucideArrowRight,
    LucideGitMerge,
    LucideLayers,
    LucideListChecks,
    LucideSparkles,
    MimiBadge,
    MimiButton,
    MimiCardImports,
    CodeBlock,
    ShowcasePreferences,
    ShowcaseTeam,
  ],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  protected readonly version = SITE.version;

  protected readonly features: Feature[] = [
    {
      icon: 'git-merge',
      title: 'Actualiza sin perder tus cambios',
      body: 'Los componentes que modificaste nunca se sobrescriben, y los que no tocaste se actualizan solos al volver a ejecutar ng g ui. Pronto, mimi update combinará tus cambios con la versión nueva.',
      badge: 'mimi update: próximamente',
    },
    {
      icon: 'layers',
      title: 'Un solo prefijo, cero capas',
      body: 'Todo se llama mimi: mimiBtn, mimiInput, mimi-card. Sin wrappers ni dependencias ocultas: el código que ves es el que corre.',
    },
    {
      icon: 'arrow-left-right',
      title: '¿Vienes de PrimeNG o NG-ZORRO? Te sentirás en casa',
      body: 'Los mismos conceptos, presets de tema tipados y una tabla de equivalencias para migrar componente por componente.',
      badge: 'Próximamente',
    },
    {
      icon: 'list-checks',
      title: 'Formularios listos: errores automáticos',
      body: 'mimi-form-field lee el estado del FormControl y muestra el mensaje correcto sin escribir un solo @if.',
    },
  ];
}
