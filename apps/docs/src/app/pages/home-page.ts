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
  /** Todavía no existe: lleva «Próximamente» y no enlaza a ninguna página. */
  soon?: boolean;
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
      body: 'mimi update compara tu copia con la versión original y la nueva, y solo aplica lo que no tocaste. Si hay conflicto, te lo muestra antes de escribir.',
      soon: true,
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
      soon: true,
    },
    {
      icon: 'list-checks',
      title: 'Formularios listos: errores automáticos',
      body: 'mimi-form-field lee el estado del FormControl y muestra el mensaje correcto sin escribir un solo @if.',
    },
  ];
}
