# Implementación de colecciones, stand y yogur griego

Fecha: 2026-10-18

## Alcance implementado

- Cuatro colecciones temáticas en Inicio: desayunos, proteína vegetal, snacks y recetas.
- Carrusel manual `El stand de BM Nuts` con seis diapositivas, flechas, indicadores, teclado y gesto horizontal móvil.
- Yogur griego como novedad editorial prioritaria, usando el afiche oficial completo y sin precio.
- Vistas informativas en `/combinacion/:id` con productos del catálogo, enlaces a sus fichas, ideas breves y otras combinaciones.
- Filtro por colección mediante URL y chip removible en Catálogo.
- Bloque `Combina bien con` en seis fichas relevantes.
- Estructuras tipadas y editables para colecciones, stand, vigencias futuras, preparaciones y relaciones.

No se añadieron carrito, checkout, selector por libras, precios, descuentos, propiedades nutricionales ni paquetes comerciales. Las 92 entradas, seis familias, slugs, búsqueda, filtros actuales, favoritos, rating local, datos curiosos, flip 3D, loader, navegación, contacto, footer y Render permanecen operativos.

## Archivos

Nuevos:

- `src/data/collections.ts`
- `src/data/stand.ts`
- `src/data/recipes.ts`
- `src/components/editorial.tsx`
- `src/editorial.test.tsx`
- `public/images/novedades/yogur-griego-promocion.png`

Actualizados:

- `src/main.tsx`
- `src/style.css`
- `README.md`
- `PENDIENTES_BMNUTS.md`

No se modificaron `src/catalogo-bmnuts.json`, `render.yaml` ni `public/_redirects`.

## Referencias validadas

Todos los `productIds` usados por colecciones, stand y preparaciones corresponden a IDs existentes del catálogo. El yogur no se añadió como producto ni como familia; se modela únicamente como novedad editorial.

Cuando un producto real no tiene fotografía, la vista reutiliza el placeholder editorial existente. No se generaron imágenes que simulen productos.

## Pruebas y revisión

- `npm run typecheck`: correcto.
- `npm run lint`: correcto.
- `npm run test`: 30 pruebas correctas.
- `npm run build`: correcto.
- El build incluye `dist/images/novedades/yogur-griego-promocion.png`.
- Los IDs editoriales y enlaces a fichas se validan automáticamente.
- `render.yaml` conserva `dist` como directorio de publicación y `/* -> /index.html` como fallback SPA; `public/_redirects` conserva el mismo fallback.
- Revisión visual real completada en 1440, 1024, 768, 390 y 360 px. Se revisaron colecciones, afiche, stand y detalle informativo, incluido el comportamiento responsive y la ausencia de recorte del afiche.

## Datos pendientes

- Presentación, gramaje, ingredientes, etiqueta, conservación, precio e imagen real del envase del yogur.
- Confirmación de las afirmaciones publicitarias impresas en el afiche.
- Confirmación de si alguna sugerencia se venderá como paquete, con cantidades y precio oficiales.
- Fotografías oficiales de las referencias que actualmente usan placeholder.

## Cómo probar localmente

```bash
npm install
npm run dev
```

Abrir `http://localhost:5173/`, revisar las colecciones y el stand, entrar en una combinación y seguir sus enlaces de producto. Para validación completa:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
