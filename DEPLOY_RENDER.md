# Publicar BM Nuts como Render Static Site

El proyecto todavía no está publicado. Durante la preparación no se encontró un repositorio Git en `bmnuts-web` ni en su carpeta contenedora, por lo que esta configuración considera **`bmnuts-web` como la futura raíz del repositorio**.

## 1. Crear y subir el repositorio

Desde `bmnuts-web`:

```bash
git init
git add .
git commit -m "Prepare BM Nuts for Render"
git branch -M main
git remote add origin <URL-DE-TU-REPOSITORIO>
git push -u origin main
```

Revisa `git status` antes del commit. `.gitignore` excluye `node_modules`, `dist`, secretos, logs y archivos temporales de TypeScript. No subas archivos `.env` ni credenciales.

## 2. Crear el Static Site

1. En Render selecciona **New → Static Site**.
2. Conecta el repositorio de GitHub y elige la rama `main`.
3. Si Render detecta `render.yaml`, confirma estos valores:
   - Root Directory: vacío, porque el repositorio empieza en `bmnuts-web`.
   - Build Command: `npm ci && npm run build`.
   - Publish Directory: `dist`.
   - Node: `22.14.0`.
4. Confirma que exista el rewrite SPA `/* → /index.html`.
5. Crea el sitio únicamente después de la revisión final.

El archivo `public/_redirects` copia la misma regla al resultado de Vite como respaldo. `npm ci` usa el `package-lock.json` versionado.

## 3. Si se decide usar la carpeta padre como repositorio

La configuración incluida dejaría de ser válida. Mueve `render.yaml` a la raíz real y cambia:

```yaml
buildCommand: cd bmnuts-web && npm ci && npm run build
staticPublishPath: ./bmnuts-web/dist
```

No mantengas dos archivos `render.yaml` ni combines ambos esquemas.

## 4. Verificación posterior al despliegue

Comprueba en la URL pública:

- `/` y la frase rotativa del encabezado.
- `/catalogo` y los filtros/búsqueda.
- `/catalogo/frutos-secos-y-snacks` con recarga directa.
- `/producto/almendra-natural` abierta directamente y después de `refresh`.
- `/producto/pistacho-con-cascara`, `/producto/nuez-comun` y `/producto/linaza-en-semilla` con “¿Sabías que?”.
- `/nosotros` y `/images/local-bmnuts.webp`.
- `/contacto`, sus dos sedes, Google Maps y los estados pendientes de las redes.
- `/downloads/frutos-secos-bmnuts.pdf` y el botón de descarga.
- Responsive, overflow horizontal y tarjetas en escritorio y móvil.

No configures un Web Service, comando `vite dev`, puertos, backend, secretos ni base de datos: esta aplicación se publica como contenido estático.
