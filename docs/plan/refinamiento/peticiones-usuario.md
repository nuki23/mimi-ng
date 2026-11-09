# Peticiones del usuario (09/11/2026)

Lista de correcciones y mejoras pedidas por el usuario tras probar la 0.5.0. Es la fuente del plan de refinamiento (tareas R.x). Texto del usuario, solo con formato limpio.

## Globales

- **Tamaños:** que toda la librería Mimi tenga tamaños `sm`, `md` y `lg`, en todos los componentes (también Toast; quiero Toasts más pequeños).
- **Animación de clic:** hay varios elementos que al hacer clic se hunden más que otros.
- **Ejemplos de formularios:** ejemplos con formularios reactivos o con Signal Forms en los componentes, y de otras formas que no sean `ngModel`; si se puede, usar también nuestro formulario (Form Field de Mimi).
- **Blocks en carga:** en cada ejemplo de Block, mientras está cargando, los formularios y los demás botones tienen que estar deshabilitados o en carga, para que no se pueda modificar nada.
- **Componente de carga:** un componente que ponga un loading en toda la vista, como https://notiflix.github.io/loading, y también para contenidos, como https://notiflix.github.io/block.
- **Formularios en los ejemplos:** en los componentes que van en formularios, añadir ejemplos con Signal Forms, Reactive Forms y cómo se ve con el Form Field de Mimi.
- **Uso más corto:** pensar una forma más corta de usar los componentes, para todos.

## Marca y colores

- Mejorar los colores y el diseño final de la librería según la marca de Mimi (logo y paleta):
  - Violeta principal `#793EEA`: marca, iconos, acentos.
  - Violeta claro `#A88FFF`: fondos oscuros, énfasis.
  - Negro `#171717`: textos, contraste.
  - Blanco `#FAFAFA`: fondos, superficies.
  - Degradado `#793EEA → #A88FFF`.

## Por componente

### Form Field

1. Más ejemplos con más elementos, no solo con inputs y textarea.
2. Una forma más corta de usar el componente (y de todos).
3. `mimi-form-error`: revisar cómo usarlo de otra forma. Por ejemplo, que donde se ponen los validadores se ponga el mensaje personalizado y el `mimi-form-field` lo reciba, o que en el mismo `mimi-form-field` se pueda poner el texto de error. Buscar una forma más fácil de usarlo y dar recomendaciones; o, si el actual cumple al 100 %, explicarlo de una forma más fácil.

### Card

1. No me gusta el componente (en ninguna librería me ha gustado). Ideas de lo que hacen otras librerías para mejorarlo.

### Switch y Checkbox

1. Separarlos y añadir los tamaños `sm`, `md` y `lg`.

### Skeleton

1. El ejemplo «Personalizar con class» no se ve.

### Select

1. Que tenga opciones con `mimi-option`; me parece más útil y fácil para el usuario.
2. El icono de limpiar debe aparecer sobre el icono de desplegar al pasar el ratón cuando hay un valor seleccionado.
3. El icono de carga también debe aparecer sobre el icono de plegar o desplegar.

### Dialog

1. El `mimi-dialog` no es lo que esperaba. Quiero un servicio parecido a esto:

```ts
updateRisks(): void {
  const params = {
    title: 'Actualizar riesgo',
    icon: 'fal fa-backpack',
  };

  const modal = this._modalService.openModal(
    UploadFileComponent,
    'nzSm-624',
    { padding: '0.5rem 0 0 0' },
    params,
    false,
  );

  modal.afterClose.subscribe((result) => {
    if (result) {
      // ...
    }
  });
}
```

- `UploadFileComponent` es un componente con su HTML, CSS y TS; el servicio se encarga de abrirlo.
- Dentro de `UploadFileComponent` recibo parámetros y también devuelvo otros para usarlos en `afterClose`.
- Que se le puedan pasar clases que cambien el padding del contenedor del modal y el ancho máximo; el contenedor se debe adaptar a la pantalla si es menor que el ancho máximo.
- Los parámetros del ejemplo son solo datos de ejemplo: título y parámetros cambian según dónde se llame, y son opcionales.
- Las piezas de `mimi-dialog` (header, body, footer) deberían ser opcionales, para que el usuario ponga lo que quiera y lo adapte a su gusto.
- Mimi no debe amarrarte a un diseño.

### Toast

1. Las variantes sólidas no están mal, pero quiero también una variante outline con esos colores.

### Tabs

1. En modo pill, en modo oscuro, parece que la pestaña toca la parte de abajo del contenedor de las píldoras (¿el box-shadow?).
2. ¿Pueden ser como las de ng-zorro, o es mala idea?

```html
<nz-tabs>
  <nz-tab nzTitle="Tab 1">Content of Tab Pane 1</nz-tab>
  <nz-tab nzTitle="Tab 2">Content of Tab Pane 2</nz-tab>
  <nz-tab nzTitle="Tab 3">Content of Tab Pane 3</nz-tab>
</nz-tabs>
```

### Toggle Group

1. Tiene el mismo problema del borde que las Tabs.

### Input Mask

1. Tiene un ejemplo de solo lectura (`readonly`) que no he visto en los demás componentes.

### Input OTP

1. Siempre tiene longitud 6. Quiero poder elegir la cantidad de dígitos (por ejemplo, 10).

### Combobox

1. ¿Qué diferencia tiene con el Select y por qué no son uno solo?

### Sortable List

1. Al ser drag and drop, ¿podemos hacer varias columnas y arrastrar de una a otra? Por ejemplo, columnas «Pendiente», «En curso» y «Completado», pasando tarjetas de una a otra.

### Data Table

1. Encontrar una forma más fácil de usarla: más fácil de llenar con `@for` e `@if`, y más fácil de expandir las filas.
