# BM Nuts

Catálogo corporativo informativo hecho con React, Vite y TypeScript. No incorpora carrito, pagos, checkout, cuentas ni pedidos.

## Inicio

```bash
npm install
npm run dev
```

Para validar: `npm run typecheck`, `npm run lint`, `npm run test` y `npm run build`.

## Rutas

- `/` inicio
- `/catalogo` catálogo completo
- `/catalogo/:categoria` familia
- `/producto/:slug` ficha de producto
- `/combinacion/:id` vista editorial de una novedad o combinación sugerida
- `/nosotros` y `/contacto`

El host debe configurar un fallback SPA hacia `index.html` para que las rutas profundas recarguen correctamente.

Los datos originales permanecen en `src/catalogo-bmnuts.json`. Los productos con `needsVerification` no se publican. Ver `PENDIENTES_BMNUTS.md` antes de completar la información oficial.

## Reparación integral 2026-10-16

- Se integraron por ID las 92 descripciones editoriales corregidas, sin alterar slugs, categorías, publicación ni imágenes.
- Las tarjetas mantienen fotografía, reverso 3D, favorito, cuerpo y acciones en capas independientes.
- La búsqueda global y la del catálogo ignoran tildes y mayúsculas e indexan nombre, categoría, etiquetas y descripción.
- Se restauraron las categorías crema, la frase rotativa, el diálogo de contacto accesible y el footer completo.
- El loader usa la estructura y animaciones CSS del hámster de referencia durante una carga real.
- La descarga animada del PDF continúa en `/downloads/frutos-secos-bmnuts.pdf`.

La suite original cubría 23 invariantes y comportamientos; la ampliación eleva el total a 30 pruebas. La inspección visual interactiva se documenta únicamente cuando se realiza con un navegador conectado.

## Colecciones, stand y yogur griego · 2026-10-18

- Inicio incorpora cuatro colecciones editoriales después de las seis familias existentes.
- `El stand de BM Nuts` muestra una novedad y cinco combinaciones sugeridas, sin autoplay, precios ni acciones de compra.
- El yogur griego se presenta como novedad editorial mediante el afiche oficial, sin añadirlo a las 92 fichas ni crear una categoría artificial.
- Cada combinación tiene una ruta informativa con enlaces a las fichas reales, una preparación corta y el aviso correspondiente.
- El catálogo acepta `?coleccion=<id>` como un chip removible, sin crear una nueva batería de filtros.
- Se añadieron complementos editoriales en seis fichas relevantes desde una estructura de datos compartida.
- Los contenidos editables se encuentran en `src/data/collections.ts`, `src/data/stand.ts` y `src/data/recipes.ts`.

La ampliación no agrega dependencias. Se inspeccionaron los nuevos bloques en navegador real a 1440, 1024, 768, 390 y 360 px. Consulta `IMPLEMENTACION_COLECCIONES_STAND.md` para el detalle de validación y pendientes.

## Ajustes finales y Render

- Slogans orientados a variedad, cercanía, calidad y atención al cliente, conservando la rotación sin repetición inmediata.
- Fotografías de producto centradas en marcos cuadrados con `object-fit: contain`, sin alterar el flip aprobado.
- Página Quiénes somos con fotografía real del local y mensaje de atención cercana.
- Bloques “¿Sabías que?” únicamente en cuatro productos aprobados.
- Contacto dividido entre matriz y sucursal, con búsquedas textuales de Google Maps.
- Módulo social Uiverse adaptado para WhatsApp, Facebook e Instagram; los enlaces no confirmados permanecen deshabilitados.
- Preparación para Render Static Site en `render.yaml`; consulta `DEPLOY_RENDER.md` antes de publicar.

## Actualización mayor de inventario · 2026-10-20

- La fuente reciente se valida fuera del repositorio con `npm run audit:inventory`.
- El catálogo público contiene 345 fichas: 82 históricas y 263 grupos nuevos que representan 274 registros.
- Los 115 registros rojos se excluyen; 72 candidatos sensibles o ambiguos quedan pendientes y fuera del bundle.
- La lógica de granel desde $1 está probada, pero los precios siguen sin publicarse.
- GradualBlur se verificó en Chrome a 1440, 1024, 768, 390 y 360 px.

Consulta `docs/ACTUALIZACION_MAYOR_AUDITORIA.md` y `docs/REPORTE_ACTUALIZACION_MAYOR.md` para los conteos, pruebas y pendientes comerciales.

## Ajustes finales de granel e imágenes · 2026-10-21

- Cada ficha interpreta una modalidad pública de venta por producto o variante, sin incluir precios internos: granel anuncia el mínimo de $1; “solo producto”, unidad, frasco y ajonjolí conservan sus restricciones.
- Harinas y derivados está activa con 20 fichas y sin la etiqueta histórica “Próximamente”.
- Categoría y subcategoría se deseleccionan al pulsar de nuevo; el chip de colección mantiene su cierre existente.
- Las cuatro colecciones usan sus collages editoriales y el stand suma el afiche original de colada morada sin CTA de compra.
- El encuadre de fotografías se controla por asset. La imagen incorrecta de dátil se sustituyó por el placeholder hasta recibir una foto auténtica.
- GradualBlur se conservó y volvió a medir en Chrome a 1440, 1024, 768, 390 y 360 px.

Consulta `docs/REPORTE_AJUSTES_GRANEL_IMAGENES.md` para pruebas, capturas y pendientes de aprobación.
