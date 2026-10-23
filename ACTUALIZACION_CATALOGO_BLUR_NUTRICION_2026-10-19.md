# Actualización puntual de catálogo, blur y nutrición

Fecha local de revisión: 19 de octubre de 2026.

## Alcance aplicado

- Se retiró de Inicio únicamente el bloque grande «Explora por familia». Las colecciones temáticas, el stand, el yogur griego y la selección editorial se conservan.
- El botón animado «Descargar catálogo PDF» se trasladó al hero de Inicio. En el footer queda solo un enlace contextual; Catálogo ya no repite el CTA animado.
- Catálogo incorpora chips compactos para las seis familias. Harinas permanece deshabilitada porque no tiene productos. Al seleccionar una familia aparece una segunda fila con las subcategorías reales del catálogo.
- Categoría, subcategoría, búsqueda insensible a tildes, favoritos y colección temática se combinan en un solo filtrado. Se añadió limpieza global de filtros y contador de resultados.
- La imagen de cada colección tiene un flip 3D independiente del contenido de la tarjeta. El reverso enumera productos reales de `collections.ts` y dispone de control accesible para mouse, touch y teclado.
- La selección editorial pasó a un carrusel horizontal de seis productos con flechas, scroll nativo y capas laterales de blur progresivo. Cada borde aparece solo si existe contenido desbordado en esa dirección; el centro no recibe filtro.
- Se añadió un único botón flotante global «Volver arriba», visible después de 350 px, con comportamiento reducido cuando el sistema solicita menos movimiento.
- Se retiró la leyenda pública de verificación de la sucursal de Conocoto sin cambiar dirección, descripción ni bandera interna.
- Las fichas con respaldo suficiente muestran bloques independientes «Propiedades nutricionales», «Beneficios de sus nutrientes» y, cuando ya existía, «¿Sabías que?». Las fuentes quedan en un acordeón pequeño.

## Educación nutricional publicada

Se integraron únicamente 10 fichas conservadoras: BMN-001, BMN-007, BMN-009, BMN-014, BMN-015, BMN-023, BMN-033, BMN-058, BMN-059 y BMN-060.

Se excluyeron las presentaciones dulces, saladas, picantes, cubiertas o con composición concreta pendiente; también todas las hierbas, infusiones y nombres botánicos por confirmar. La ficha de nuez del Brasil incluye la precaución por exceso de selenio. No se añadieron cantidades, calorías, porcentajes, dosis, propiedades medicinales, precios ni nuevos productos.

## Archivos modificados por esta actualización

- `src/main.tsx`
- `src/style.css`
- `src/catalog.ts`
- `src/components/editorial.tsx`
- `src/productEducation.ts`
- `src/app.test.tsx`
- `src/catalog.test.ts`
- `src/editorial.test.tsx`
- `src/finalAdjustments.test.ts`

No se modificaron `render.yaml`, `public/_redirects`, las rutas públicas existentes, el PDF, las 92 entradas del catálogo, las seis categorías ni los archivos de imágenes.

## Validación ejecutada

- `npm run typecheck`: aprobado.
- `npm run lint`: aprobado.
- `npm run test`: aprobado, 4 archivos y 34 pruebas.
- `npm run build`: aprobado con Vite 8.3.4.
- `dist/index.html`: presente.
- `dist/downloads/frutos-secos-bmnuts.pdf`: presente.
- `dist/images/novedades/yogur-griego-promocion.png`: presente.
- `git diff --check`: sin errores de whitespace; solo avisos de conversión LF/CRLF del entorno Windows.

## Revisión visual pendiente

Se inició correctamente la vista previa del build en `http://127.0.0.1:4173/`, pero el entorno de automatización no expuso ningún navegador ni ventana controlable. Por ese motivo no se generaron capturas nuevas ni se declara una validación visual real en 1440, 1024, 768, 390 y 360 px. Antes de aprobar o desplegar, revisar manualmente en esos anchos:

1. Intensidad y progresión del blur al inicio, centro y final del carrusel editorial.
2. Flip de colección con hover y con el botón en touch/teclado.
3. Desplazamiento horizontal limitado a las filas de chips y al carrusel, sin scroll horizontal de página.
4. Separación del botón «Volver arriba» respecto del aviso local, CTAs y footer en móvil.
5. Ajuste de los chips del reverso de las cuatro colecciones, especialmente la colección de ocho condimentos.

## Datos que continúan pendientes

- Etiquetas o análisis de las presentaciones procesadas para publicar nutrición específica.
- Identidad botánica y evidencia individual de hierbas e infusiones, especialmente los cinco nombres locales sin confirmar.
- Datos oficiales del yogur griego; se mantiene únicamente como novedad editorial.
- Canales sociales y demás datos ya marcados internamente como pendientes en la versión vigente.

No se hizo push a GitHub ni despliegue en Render.
