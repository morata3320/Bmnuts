/* global console, process, require */
const { mkdir, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');
const moduleRoot = process.env.BM_VISUAL_MODULES;
const loadModule = (name) => require(moduleRoot ? resolve(moduleRoot, name) : name);
const { chromium } = loadModule('playwright');
const { PNG } = loadModule('pngjs');

const outputDir = resolve(__dirname, '..', '..', 'tmp', 'visual-qa');
const siteUrl = process.env.BM_VISUAL_URL ?? 'http://127.0.0.1:5173/';
const viewports = [
  { width: 1440, height: 1000 },
  { width: 1024, height: 900 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
];

const comparePngs = (withoutBlur, withBlur) => {
  const a = PNG.sync.read(withoutBlur);
  const b = PNG.sync.read(withBlur);
  if (a.width !== b.width || a.height !== b.height) throw new Error('Las capturas comparadas no tienen el mismo tamaño.');
  const edgeLimit = Math.ceil(a.width * 0.18);
  const centerStart = Math.floor(a.width * 0.32);
  const centerEnd = Math.ceil(a.width * 0.68);
  let edgeChanged = 0;
  let centerChanged = 0;
  let totalChanged = 0;
  for (let y = 0; y < a.height; y += 1) {
    for (let x = 0; x < a.width; x += 1) {
      const offset = (y * a.width + x) * 4;
      const delta = Math.max(
        Math.abs(a.data[offset] - b.data[offset]),
        Math.abs(a.data[offset + 1] - b.data[offset + 1]),
        Math.abs(a.data[offset + 2] - b.data[offset + 2]),
      );
      if (delta < 8) continue;
      totalChanged += 1;
      if (x < edgeLimit || x >= a.width - edgeLimit) edgeChanged += 1;
      if (x >= centerStart && x < centerEnd) centerChanged += 1;
    }
  }
  return { width: a.width, height: a.height, totalChanged, edgeChanged, centerChanged };
};

(async () => {
  await mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.BM_VISUAL_BROWSER,
  });
  const results = [];
  try {
    for (const viewport of viewports) {
      const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
      await page.goto(siteUrl, { waitUntil: 'networkidle' });
      const notice = page.getByRole('button', { name: 'Entendido' });
      if (await notice.isVisible().catch(() => false)) await notice.click();
      const shell = page.locator('.featured-carousel__shell');
      const track = page.locator('.featured-carousel__track');
      await shell.scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);

      const readState = () => page.evaluate(() => {
        const trackElement = document.querySelector('.featured-carousel__track');
        const left = document.querySelector('.gradual-blur--left');
        const right = document.querySelector('.gradual-blur--right');
        const sample = right?.querySelector('span');
        if (!(trackElement instanceof HTMLElement) || !(left instanceof HTMLElement) || !(right instanceof HTMLElement) || !(sample instanceof HTMLElement)) {
          throw new Error('No se encontró el carrusel con GradualBlur.');
        }
        const originalScrollX = window.scrollX;
        window.scrollTo({ left: 99999, top: window.scrollY, behavior: 'instant' });
        const horizontalScrollPosition = window.scrollX;
        window.scrollTo({ left: originalScrollX, top: window.scrollY, behavior: 'instant' });
        return {
          scrollLeft: trackElement.scrollLeft,
          maxScroll: trackElement.scrollWidth - trackElement.clientWidth,
          leftVisible: left.classList.contains('is-visible'),
          rightVisible: right.classList.contains('is-visible'),
          leftOpacity: getComputedStyle(left).opacity,
          rightOpacity: getComputedStyle(right).opacity,
          pointerEvents: getComputedStyle(right).pointerEvents,
          backdropFilter: getComputedStyle(sample).backdropFilter || getComputedStyle(sample).webkitBackdropFilter,
          overlayWidth: right.getBoundingClientRect().width,
          documentOverflow: document.documentElement.scrollWidth - window.innerWidth,
          horizontalScrollPosition,
        };
      });

      await track.evaluate((element) => { element.scrollLeft = 0; element.dispatchEvent(new Event('scroll')); });
      await page.waitForTimeout(100);
      const start = await readState();

      await track.evaluate((element) => {
        element.scrollLeft = (element.scrollWidth - element.clientWidth) / 2;
        element.dispatchEvent(new Event('scroll'));
      });
      await page.waitForTimeout(120);
      const middle = await readState();
      const size = `${viewport.width}x${viewport.height}`;
      await page.addStyleTag({ content: '.gradual-blur { visibility: hidden !important; }' });
      const withoutBlur = await shell.screenshot({ path: resolve(outputDir, `${size}-blur-off.png`) });
      await page.locator('style').last().evaluate((element) => element.remove());
      await page.waitForTimeout(80);
      const withBlur = await shell.screenshot({ path: resolve(outputDir, `${size}-blur-on.png`) });
      const pixelDiff = comparePngs(withoutBlur, withBlur);

      await track.evaluate((element) => {
        element.scrollLeft = element.scrollWidth - element.clientWidth;
        element.dispatchEvent(new Event('scroll'));
      });
      await page.waitForTimeout(120);
      const end = await readState();

      const nextButton = page.getByRole('button', { name: 'Ver productos siguientes' });
      await track.evaluate((element) => { element.scrollLeft = 0; element.dispatchEvent(new Event('scroll')); });
      await page.waitForTimeout(80);
      await nextButton.click();
      await page.waitForTimeout(450);
      const afterButton = await readState();

      results.push({ viewport, start, middle, end, afterButton, pixelDiff });
      await page.close();
    }
  } finally {
    await browser.close();
  }

  await writeFile(resolve(outputDir, 'visual-qa-results.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8');

  for (const result of results) {
    const { start, middle, end, afterButton, pixelDiff } = result;
    if (start.leftVisible || !start.rightVisible) throw new Error(`Estado inicial incorrecto en ${result.viewport.width}px`);
    if (!middle.leftVisible || !middle.rightVisible) throw new Error(`Estado medio incorrecto en ${result.viewport.width}px`);
    if (!end.leftVisible || end.rightVisible) throw new Error(`Estado final incorrecto en ${result.viewport.width}px`);
    if (middle.pointerEvents !== 'none' || !middle.backdropFilter.includes('blur')) throw new Error(`Blur real/accesibilidad incorrectos en ${result.viewport.width}px`);
    if (middle.horizontalScrollPosition > 0) throw new Error(`La página permite scroll horizontal en ${result.viewport.width}px`);
    if (afterButton.scrollLeft <= 0) throw new Error(`La flecha no desplaza el carrusel en ${result.viewport.width}px`);
    if (pixelDiff.edgeChanged < 100 || pixelDiff.edgeChanged / pixelDiff.totalChanged < 0.95 || pixelDiff.centerChanged > 20) {
      throw new Error(`Diferencia visual de blur insuficiente o centro alterado en ${result.viewport.width}px: ${JSON.stringify(pixelDiff)}`);
    }
  }

  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
