# Auditoría de la actualización mayor

Fecha: 20 de octubre de 2026.

## Estado inicial preservado

El trabajo se realizó sobre el proyecto existente `bmnuts-web`, en la rama local `main`, sin crear otro proyecto. El árbol ya contenía cambios locales en catálogo, aplicación, pruebas, estilos, componentes editoriales y documentación. No se ejecutó `reset`, `checkout`, `clean`, `stash`, push ni despliegue.

Antes de modificar código pasaban:

- `npm run typecheck`.
- `npm run lint`.
- `npm run test`: 4 archivos y 34 pruebas.
- `npm run build`: Vite generaba el sitio estático correctamente.

Se conservaron las rutas SPA, `render.yaml`, el fallback de Render, navegación, búsqueda sin tildes, filtros, favoritos, flip 3D limitado a la fotografía, zoom, stand de seis diapositivas, yogur griego editorial, colecciones, combinaciones, información nutricional existente, contacto, modal, aviso local, hámster, valoración local, PDF y botón de volver arriba.

## Verificación de la fuente privada

El Excel tiene una hoja, 554 filas físicas y 6 columnas. Entre las filas de datos se verificaron 545 registros no vacíos y 8 filas vacías. Los rellenos reales son:

| Estado de origen | Registros |
| --- | ---: |
| Sin marcar | 368 |
| Amarillo | 18 |
| Verde | 44 |
| Rojo | 115 |
| Total | 545 |

El cruce de las 545 filas del Excel con el JSON privado encontró cuatro diferencias de notas. Una es solo espacio final; las otras tres añadían la palabra `snack` únicamente en el JSON derivado. Se aplicó el Excel como fuente superior y esas extensiones no se llevaron al catálogo público.

Los 115 rojos se clasificaron como exclusión definitiva. El generador público solo acepta los 430 no rojos y aborta si cambian los conteos contractuales.

## Catálogo anterior

El archivo histórico conserva sus 92 objetos, IDs, slugs, descripciones, imágenes y campos editoriales:

- 82 fichas previamente públicas continúan públicas.
- 10 fichas que ya estaban en verificación permanecen ocultas.
- Las 82 fichas públicas representan 84 registros candidatos del inventario reciente. `Mix amarillo` consolida dos filas duplicadas y `Comino` conserva bajo el ID histórico sus dos formas verificadas.
- No apareció una coincidencia exacta entre una ficha histórica pública y una fila roja.
- Las seis fichas históricas sin correspondencia permanecían ocultas antes de esta actualización y no se reactivaron.

## Diagnóstico de GradualBlur

El componente sí estaba montado en la selección editorial. El problema no era ausencia del DOM: las seis capas compartían prácticamente la misma máscara, se recortaban de forma poco eficaz y estaban cubiertas por un degradado de color comparativamente dominante. El resultado perceptible era un borde teñido y abrupto, no una transición clara de desenfoque.

En móvil había otro defecto: el margen negativo con padding del scrollport producía un `scrollLeft` inicial de 16 px. Por eso aparecía blur a la izquierda aunque el carrusel estuviera visualmente al inicio.

## PDF público

El PDF vigente contiene 12 páginas. Se extrajo el texto de todas las páginas y se comparó, sin tildes ni separadores, con los nombres normalizados de los 115 rojos: cero coincidencias. Por ello se conservó el archivo y su descarga existente.

## Privacidad

- El Excel y el JSON privado siguen fuera de `bmnuts-web`.
- El repositorio no importa ni copia los archivos privados.
- El catálogo público no contiene precios, notas originales, colores, filas de Excel ni referencias de precio.
- La conciliación detallada se genera en `../tmp/CONCILIACION_ACTUALIZACION_MAYOR_PRIVADA.json`, fuera del repositorio.
- `.gitignore` bloquea copias del Excel, inventarios privados, carpetas `private-data` e informes privados.
