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

La suite automatizada cubre 23 invariantes y comportamientos. La inspección visual interactiva queda documentada como pendiente cuando no hay un navegador conectado; no se declara perfección visual sin esa revisión.

## Ajustes finales y Render

- Slogans orientados a variedad, cercanía, calidad y atención al cliente, conservando la rotación sin repetición inmediata.
- Fotografías de producto centradas en marcos cuadrados con `object-fit: contain`, sin alterar el flip aprobado.
- Página Quiénes somos con fotografía real del local y mensaje de atención cercana.
- Bloques “¿Sabías que?” únicamente en cuatro productos aprobados.
- Contacto dividido entre matriz y sucursal, con búsquedas textuales de Google Maps.
- Módulo social Uiverse adaptado para WhatsApp, Facebook e Instagram; los enlaces no confirmados permanecen deshabilitados.
- Preparación para Render Static Site en `render.yaml`; consulta `DEPLOY_RENDER.md` antes de publicar.
