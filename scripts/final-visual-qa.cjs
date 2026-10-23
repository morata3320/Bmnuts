/* global console, process, require */
const { mkdir, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');

const moduleRoot = process.env.BM_VISUAL_MODULES;
const loadModule = (name) => require(moduleRoot ? resolve(moduleRoot, name) : name);
const playwright = loadModule('playwright');
const { PNG } = loadModule('pngjs');

const engine = process.env.BM_VISUAL_ENGINE ?? 'chromium';
const browserType = playwright[engine];
if (!browserType) throw new Error(`Motor desconocido: ${engine}`);
const outputDir = resolve(__dirname, '..', '..', 'tmp', 'final-visual-qa', engine);
const siteUrl = process.env.BM_VISUAL_URL ?? 'http://127.0.0.1:5173';
const allViewports = [
  { width: 1440, height: 1000 },
  { width: 1024, height: 900 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
];
const viewports = process.env.BM_VISUAL_QUICK ? allViewports.slice(0, 1) : allViewports;

const comparePngs = (withoutBlur, withBlur) => {
  const a = PNG.sync.read(withoutBlur);
  const b = PNG.sync.read(withBlur);
  const edgeLimit = Math.ceil(a.width * 0.18);
  const centerStart = Math.floor(a.width * 0.32);
  const centerEnd = Math.ceil(a.width * 0.68);
  let edgeChanged = 0;
  let centerChanged = 0;
  let totalChanged = 0;
  for (let y = 0; y < a.height; y += 1) {
    for (let x = 0; x < a.width; x += 1) {
      const offset = (y * a.width + x) * 4;
      const delta = Math.max(...[0, 1, 2].map((channel) => Math.abs(a.data[offset + channel] - b.data[offset + channel])));
      if (delta < 8) continue;
      totalChanged += 1;
      if (x < edgeLimit || x >= a.width - edgeLimit) edgeChanged += 1;
      if (x >= centerStart && x < centerEnd) centerChanged += 1;
    }
  }
  return { width: a.width, height: a.height, totalChanged, edgeChanged, centerChanged };
};

const settle = async (page) => {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(120);
};

const dismissNotice = async (page) => {
  const notice = page.getByRole('button', { name: 'Entendido' });
  if (await notice.isVisible().catch(() => false)) await notice.click();
};

const horizontalOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

(async () => {
  await mkdir(outputDir, { recursive: true });
  const browser = await browserType.launch({ headless: true, executablePath: process.env.BM_VISUAL_BROWSER });
  const results = [];
  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      const size = `${viewport.width}x${viewport.height}`;
      await page.goto(`${siteUrl}/`, { waitUntil: 'networkidle' });
      await dismissNotice(page);
      await settle(page);

      const collections = page.locator('.collections-section');
      await collections.scrollIntoViewIfNeeded();
      await page.locator('.collection-card__editorial-image img').evaluateAll((images) => images.forEach((image) => { image.loading = 'eager'; }));
      await page.waitForFunction(() => [...document.querySelectorAll('.collection-card__editorial-image img')].every((image) => image.complete && image.naturalWidth > 0));
      await collections.screenshot({ path: resolve(outputDir, `${size}-collections.png`) });
      const collectionImages = await page.locator('.collection-card__editorial-image img').evaluateAll((images) => images.map((image) => ({
        src: image.getAttribute('src'),
        fit: getComputedStyle(image).objectFit,
        width: image.getBoundingClientRect().width,
        naturalWidth: image.naturalWidth,
      })));

      const stand = page.locator('.stand-section');
      await stand.scrollIntoViewIfNeeded();
      await stand.press('ArrowRight');
      await page.waitForTimeout(100);
      await page.waitForFunction(() => {
        const image = document.querySelector('.stand-slide__media img');
        return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
      });
      const standState = {
        title: await page.locator('.stand-slide h3').textContent(),
        src: await page.locator('.stand-slide__media img').getAttribute('src'),
        fit: await page.locator('.stand-slide__media img').evaluate((image) => getComputedStyle(image).objectFit),
        actions: await page.locator('.stand-actions a, .stand-actions button').count(),
        tag: await page.locator('.stand-tag').textContent(),
        slides: await page.locator('.stand-dots button').count(),
      };
      await stand.screenshot({ path: resolve(outputDir, `${size}-stand-colada.png`) });

      const shell = page.locator('.featured-carousel__shell');
      const track = page.locator('.featured-carousel__track');
      await shell.scrollIntoViewIfNeeded();
      const readBlur = () => page.evaluate(() => {
        const trackElement = document.querySelector('.featured-carousel__track');
        const left = document.querySelector('.gradual-blur--left');
        const right = document.querySelector('.gradual-blur--right');
        const sample = right?.querySelector('span');
        if (!(trackElement instanceof HTMLElement) || !(left instanceof HTMLElement) || !(right instanceof HTMLElement) || !(sample instanceof HTMLElement)) throw new Error('GradualBlur ausente');
        return {
          scrollLeft: trackElement.scrollLeft,
          maxScroll: trackElement.scrollWidth - trackElement.clientWidth,
          leftVisible: left.classList.contains('is-visible'),
          rightVisible: right.classList.contains('is-visible'),
          pointerEvents: getComputedStyle(right).pointerEvents,
          backdropFilter: getComputedStyle(sample).backdropFilter || getComputedStyle(sample).webkitBackdropFilter,
          overlayWidth: right.getBoundingClientRect().width,
        };
      });
      await track.evaluate((element) => { element.scrollLeft = 0; element.dispatchEvent(new Event('scroll')); });
      await page.waitForTimeout(80);
      const blurStart = await readBlur();
      await track.evaluate((element) => { element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2; element.dispatchEvent(new Event('scroll')); });
      await page.waitForTimeout(100);
      const blurMiddle = await readBlur();
      await page.addStyleTag({ content: '.gradual-blur { visibility: hidden !important; }' });
      const blurOff = await shell.screenshot({ path: resolve(outputDir, `${size}-blur-off.png`) });
      await page.locator('style').last().evaluate((element) => element.remove());
      const blurOn = await shell.screenshot({ path: resolve(outputDir, `${size}-blur-on.png`) });
      const blurDiff = comparePngs(blurOff, blurOn);
      await track.evaluate((element) => { element.scrollLeft = element.scrollWidth - element.clientWidth; element.dispatchEvent(new Event('scroll')); });
      await page.waitForTimeout(100);
      const blurEnd = await readBlur();

      await page.goto(`${siteUrl}/catalogo/harinas`, { waitUntil: 'networkidle' });
      await settle(page);
      const harinas = {
        heading: await page.locator('h1').textContent(),
        results: await page.locator('.result-count').textContent(),
        comingSoon: await page.getByText('Próximamente', { exact: true }).count(),
        filterSections: await page.locator('.catalog-filters').count(),
        matchingButtons: await page.locator('.catalog-filters').getByRole('button', { name: 'Harinas y derivados', exact: true }).count(),
        buttonDisabled: await page.locator('.catalog-filters').getByRole('button', { name: 'Harinas y derivados', exact: true }).first().isDisabled(),
        buttonPressed: await page.locator('.catalog-filters').getByRole('button', { name: 'Harinas y derivados', exact: true }).first().getAttribute('aria-pressed'),
      };
      await page.locator('.catalog-filters').screenshot({ path: resolve(outputDir, `${size}-harinas-filtros.png`) });
      await page.locator('.catalog-filters').getByRole('button', { name: 'Harinas y derivados', exact: true }).first().click();
      await page.waitForFunction(() => location.pathname === '/catalogo' && document.querySelector('.catalog-page h1')?.textContent?.trim() === 'Todos los productos', null, { timeout: 2000 }).catch(() => undefined);
      const categoryToggleOff = {
        url: page.url(),
        heading: await page.locator('h1').textContent(),
        results: await page.locator('.result-count').textContent(),
      };

      await page.goto(`${siteUrl}/producto/almendra-natural`, { waitUntil: 'networkidle' });
      await settle(page);
      const presentations = page.locator('.product-presentations');
      await presentations.scrollIntoViewIfNeeded();
      const bulkText = await presentations.textContent();
      const presentationButtons = await presentations.locator('.product-presentations__options button').count();
      const presentationInLeftColumn = await page.locator('.product-detail-visual > .product-presentations').count();
      const firstPresentation = presentations.locator('.product-presentations__options button').first();
      await firstPresentation.click();
      const presentationSelected = await firstPresentation.getAttribute('aria-pressed');
      const nextPresentation = presentations.locator('.product-presentations__options button').nth(1);
      const priceBefore = await presentations.locator('.product-presentations__selection').textContent();
      await nextPresentation.click();
      const priceAfter = await presentations.locator('.product-presentations__selection').textContent();
      await presentations.screenshot({ path: resolve(outputDir, `${size}-ficha-granel.png`) });

      await page.goto(`${siteUrl}/catalogo/frutos-secos-y-snacks`, { waitUntil: 'networkidle' });
      await settle(page);
      const search = page.getByPlaceholder('Buscar en el catálogo');
      await search.fill('pistacho');
      await page.waitForTimeout(80);
      await page.waitForFunction(() => [...document.querySelectorAll('.product-face--front img')].every((image) => image.complete && image.naturalWidth > 0));
      await page.locator('.product-grid').screenshot({ path: resolve(outputDir, `${size}-pistachos.png`) });
      const productFrames = await page.locator('.product-face--front img').evaluateAll((images) => images.map((image) => ({
        alt: image.getAttribute('alt'),
        fit: getComputedStyle(image).objectFit,
        transform: getComputedStyle(image).transform,
      })));
      const consultPriceCtas = await page.getByText('Consultar precio', { exact: true }).count();

      const overflow = await horizontalOverflow(page);
      results.push({ viewport, collectionImages, standState, blurStart, blurMiddle, blurEnd, blurDiff, harinas, categoryToggleOff, bulkText, presentationButtons, presentationInLeftColumn, presentationSelected, priceBefore, priceAfter, consultPriceCtas, productFrames, overflow });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  for (const result of results) {
    if (result.collectionImages.length !== 4 || result.collectionImages.some((image) => image.fit !== 'contain' || image.naturalWidth === 0)) throw new Error(`Colecciones incorrectas en ${result.viewport.width}px`);
    if (result.standState.title?.trim() !== 'Colada morada' || result.standState.tag?.trim() !== 'Tradición de temporada' || result.standState.src !== '/images/editorial/stand-colada-morada-original.webp' || result.standState.fit !== 'contain' || result.standState.actions !== 1 || result.standState.slides !== 7) throw new Error(`Stand incorrecto en ${result.viewport.width}px: ${JSON.stringify(result.standState)}`);
    if (result.blurStart.leftVisible || !result.blurStart.rightVisible || !result.blurMiddle.leftVisible || !result.blurMiddle.rightVisible || !result.blurEnd.leftVisible || result.blurEnd.rightVisible) throw new Error(`Estados de blur incorrectos en ${result.viewport.width}px`);
    if (result.blurMiddle.pointerEvents !== 'none' || !result.blurMiddle.backdropFilter.includes('blur')) throw new Error(`Blur real incorrecto en ${result.viewport.width}px`);
    if (result.blurDiff.edgeChanged < 100 || result.blurDiff.edgeChanged / result.blurDiff.totalChanged < 0.95 || result.blurDiff.centerChanged > 20) throw new Error(`Diff de blur incorrecto en ${result.viewport.width}px: ${JSON.stringify(result.blurDiff)}`);
    if (result.harinas.heading?.trim() !== 'Harinas y derivados' || result.harinas.results?.trim() !== '20 resultados' || result.harinas.comingSoon !== 0 || result.harinas.filterSections !== 1 || result.harinas.matchingButtons !== 1) throw new Error(`Harinas incorrecto en ${result.viewport.width}px: ${JSON.stringify(result.harinas)}`);
    if (result.categoryToggleOff.heading?.trim() !== 'Todos los productos' || result.categoryToggleOff.results?.trim() !== '345 resultados') throw new Error(`Toggle de categoría incorrecto en ${result.viewport.width}px: ${JSON.stringify(result.categoryToggleOff)}`);
    if (!result.bulkText?.includes('Venta a granel · desde $1') || !result.bulkText.includes('Precio referencial') || !result.bulkText.includes('Peso aproximado')) throw new Error(`Ficha de granel incorrecta en ${result.viewport.width}px`);
    if (result.presentationButtons !== 4 || result.presentationInLeftColumn !== 1 || result.presentationSelected !== 'true' || result.priceBefore === result.priceAfter) throw new Error(`Selector de presentaciones incorrecto en ${result.viewport.width}px`);
    if (result.consultPriceCtas !== 0) throw new Error(`CTA de consulta de precio aún visible en ${result.viewport.width}px`);
    if (result.productFrames.length !== 2 || result.productFrames.some((frame) => frame.fit !== 'contain' || frame.transform === 'none')) throw new Error(`Encuadre de pistachos incorrecto en ${result.viewport.width}px`);
    if (result.overflow > 0) throw new Error(`Overflow horizontal en ${result.viewport.width}px: ${result.overflow}`);
  }

  await writeFile(resolve(outputDir, 'results.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ engine, viewports: results.length, outputDir, results }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
