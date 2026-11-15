# Marca de Mimi (copia de referencia)

Los archivos de marca aprobados por el usuario (14/11/2026). Esta carpeta es la **fuente**: no se publica en npm (el paquete `@mimi-ng/cli` solo lleva lo que dice su `files`) ni en el sitio. Lo que usa el sitio es una **copia** en `apps/docs/public/` (R.25); si cambia un archivo de aquí, se vuelve a copiar.

| Archivo                                                    | Qué es                                                                                                        |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `mimi-symbol.svg`                                          | El símbolo (violeta `#793EEA`). Copiado como `apps/docs/public/favicon.svg`.                                  |
| `mimi-symbol-gradient.svg`                                 | El símbolo con degradado (`#793EEA` → `#A88FFF`).                                                             |
| `mimi-symbol-black.svg`, `mimi-symbol-white.svg`           | El símbolo en un solo color, para fondos claros y oscuros.                                                    |
| `mimi-symbol-outline.svg`, `mimi-symbol-outline-black.svg` | El símbolo en contorno, violeta y negro.                                                                      |
| `mimi-logo-horizontal.svg`                                 | Símbolo y nombre en fila, para fondo claro. Copiado a `public/` (cabecera en modo claro).                     |
| `mimi-logo-horizontal-dark.svg`                            | Igual, para fondo oscuro. Copiado a `public/` (cabecera en modo oscuro y `og-image.png`).                     |
| `mimi-logo-vertical.svg`, `mimi-logo-vertical-dark.svg`    | Símbolo arriba y nombre debajo, fondo claro y oscuro.                                                         |
| `favicon.ico`                                              | Favicon de respaldo (16 y 32 px). Copiado a `public/`.                                                        |
| `favicon-16.png`, `favicon-32.png`                         | El favicon en PNG.                                                                                            |
| `icon-180.png`                                             | Icono de 180 px. Copiado como `apps/docs/public/apple-touch-icon.png`.                                        |
| `icon-48.png` … `icon-512.png`                             | El icono en 48, 64, 128, 192, 256 y 512 px (para un manifiesto o una tienda, si hace falta).                  |
| `icon-maskable-512.png`                                    | Icono «maskable» de 512 px (con margen de seguridad), para un manifiesto web.                                 |
| `og-image.png`                                             | La imagen para compartir que venía con la marca. El sitio usa la que genera `apps/docs/scripts/og-image.mjs`. |
