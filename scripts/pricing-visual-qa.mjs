/* global Buffer, WebSocket, console, fetch, process, setTimeout */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const endpoint = 'http://127.0.0.1:9222';
const siteUrl = process.env.BM_VISUAL_URL ?? 'http://127.0.0.1:4173';
const outputDir = resolve('..', 'tmp', 'pricing-visual-qa');
const viewports = [
  { width: 1440, height: 1000 },
  { width: 1024, height: 900 },
  { width: 768, height: 900 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
];

await mkdir(outputDir, { recursive: true });
const target = await fetch(`${endpoint}/json/new?about:blank`, { method: 'PUT' }).then((response) => response.json());
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((finish, reject) => {
  socket.addEventListener('open', finish, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id || !pending.has(message.id)) return;
  const promise = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) promise.reject(new Error(message.error.message));
  else promise.resolve(message.result);
});
const call = (method, params = {}) => new Promise((resolveCall, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve: resolveCall, reject });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const result = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};
const navigate = async (url) => {
  await call('Page.navigate', { url });
  await new Promise((finish) => setTimeout(finish, 700));
  await evaluate('document.fonts.ready.then(() => true)');
};
const screenshot = async (name) => {
  const result = await call('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile(resolve(outputDir, name), Buffer.from(result.data, 'base64'));
};

await call('Page.enable');
await call('Runtime.enable');
await call('Page.addScriptToEvaluateOnNewDocument', { source: "localStorage.setItem('bm-notice', '1')" });
const results = [];

for (const viewport of viewports) {
  await call('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: viewport.width <= 768 });
  const label = `${viewport.width}x${viewport.height}`;
  await navigate(`${siteUrl}/catalogo/frutos-secos-y-snacks`);
  const catalog = await evaluate(`({
    innerWidth,
    overflow: document.documentElement.scrollWidth - innerWidth,
    priceBlocks: document.querySelectorAll('.product-card-price').length,
    consultPriceCtas: [...document.querySelectorAll('button, a')].filter((node) => node.textContent?.trim() === 'Consultar precio').length,
    hasPublishedPrice: [...document.querySelectorAll('.product-card-price')].some((node) => /Desde \\$1|Precio por libra|\\$\\s*\\d/.test(node.textContent || '')),
  })`);
  await screenshot(`${label}-catalog.png`);

  await navigate(`${siteUrl}/producto/almendra-natural`);
  const bulk = await evaluate(`(async () => {
    const visual = document.querySelector('.product-detail-visual');
    const media = visual?.querySelector('.product-detail-media');
    const selector = visual?.querySelector('.product-presentations');
    const buttons = [...(selector?.querySelectorAll('.product-presentations__options button') || [])];
    const before = selector?.querySelector('output')?.textContent;
    buttons[2]?.click();
    await new Promise((finish) => setTimeout(finish, 60));
    const after = selector?.querySelector('output')?.textContent;
    selector?.scrollIntoView({ block: 'center' });
    await new Promise((finish) => setTimeout(finish, 60));
    return {
      innerWidth,
      overflow: document.documentElement.scrollWidth - innerWidth,
      selectorImmediatelyBelowImage: media?.nextElementSibling === selector,
      labels: buttons.map((button) => button.textContent?.trim()),
      selectedIndex: buttons.findIndex((button) => button.getAttribute('aria-pressed') === 'true'),
      before,
      after,
      notice: selector?.querySelector('.product-presentations__notice')?.textContent,
    };
  })()`);
  await screenshot(`${label}-bulk-selector.png`);

  await navigate(`${siteUrl}/producto/ajonjoli`);
  const restricted = await evaluate(`({ labels: [...document.querySelectorAll('.product-presentations__options button')].map((button) => button.textContent?.trim()) })`);
  await navigate(`${siteUrl}/producto/gelatina-de-cereza`);
  const fixed = await evaluate(`({
    optionButtons: document.querySelectorAll('.product-presentations__options button').length,
    text: document.querySelector('.product-presentations')?.textContent,
  })`);
  results.push({ viewport, catalog, bulk, restricted, fixed });
}

for (const result of results) {
  if (result.catalog.overflow > 0 || result.bulk.overflow > 0) throw new Error(`Overflow horizontal en ${result.viewport.width}px`);
  if (!result.catalog.priceBlocks || result.catalog.consultPriceCtas !== 0 || !result.catalog.hasPublishedPrice) throw new Error(`Precios de tarjetas incorrectos en ${result.viewport.width}px`);
  if (!result.bulk.selectorImmediatelyBelowImage || result.bulk.labels.join('|') !== 'Desde $1|¼ libra|½ libra|1 libra') throw new Error(`Selector a granel incorrecto en ${result.viewport.width}px`);
  if (result.bulk.selectedIndex !== 2 || result.bulk.before === result.bulk.after || !result.bulk.after?.includes('Peso aproximado')) throw new Error(`Interacción del selector incorrecta en ${result.viewport.width}px`);
  if (!result.bulk.notice?.includes('Precios referenciales sujetos a cambios')) throw new Error(`Nota de variabilidad ausente en ${result.viewport.width}px`);
  if (result.restricted.labels.join('|') !== '½ libra|1 libra') throw new Error(`Excepción de ajonjolí incorrecta en ${result.viewport.width}px`);
  if (result.fixed.optionButtons !== 0 || !result.fixed.text?.includes('Precio referencial')) throw new Error(`Presentación fija incorrecta en ${result.viewport.width}px`);
}

await writeFile(resolve(outputDir, 'results.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ outputDir, viewports: results.length, results }, null, 2));
socket.close();
