/* global Buffer, WebSocket, console, fetch, process, setTimeout */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const endpoint = process.env.BM_CDP_URL ?? 'http://127.0.0.1:9222';
const siteUrl = process.env.BM_VISUAL_URL ?? 'http://127.0.0.1:4173';
const label = process.env.BM_VISUAL_LABEL ?? 'after';
const outputDir = resolve('..', 'tmp', 'gradual-blur-qa', label);
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
const screenshot = async (name) => {
  const result = await call('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile(resolve(outputDir, name), Buffer.from(result.data, 'base64'));
};
const settle = () => new Promise((finish) => setTimeout(finish, 280));

await call('Page.enable');
await call('Runtime.enable');
await call('Page.addScriptToEvaluateOnNewDocument', { source: "localStorage.setItem('bm-notice', '1')" });
const results = [];

for (const viewport of viewports) {
  await call('Emulation.setDeviceMetricsOverride', { ...viewport, deviceScaleFactor: 1, mobile: viewport.width <= 768 });
  await call('Page.navigate', { url: `${siteUrl}/` });
  await new Promise((finish) => setTimeout(finish, 800));
  await evaluate(`document.fonts.ready.then(() => {
    document.querySelector('.featured-carousel__shell')?.scrollIntoView({ block: 'center' });
    return true;
  })`);
  await settle();

  const states = [];
  for (const position of ['start', 'middle', 'end']) {
    const state = await evaluate(`(async () => {
      const track = document.querySelector('.featured-carousel__track');
      const shell = document.querySelector('.featured-carousel__shell');
      if (!(track instanceof HTMLElement) || !(shell instanceof HTMLElement)) throw new Error('Carrusel no encontrado');
      const max = track.scrollWidth - track.clientWidth;
      track.scrollLeft = ${position === 'start' ? '0' : position === 'middle' ? 'max / 2' : 'max'};
      track.dispatchEvent(new Event('scroll'));
      await new Promise((finish) => setTimeout(finish, 320));
      const left = shell.querySelector('.gradual-blur--left');
      const right = shell.querySelector('.gradual-blur--right');
      const describe = (overlay) => ({
        visible: overlay?.classList.contains('is-visible'),
        width: overlay?.getBoundingClientRect().width,
        opacity: overlay ? getComputedStyle(overlay).opacity : null,
        pointerEvents: overlay ? getComputedStyle(overlay).pointerEvents : null,
        layers: [...(overlay?.querySelectorAll('span') || [])].map((layer) => ({
          display: getComputedStyle(layer).display,
          backdropFilter: getComputedStyle(layer).backdropFilter,
          webkitBackdropFilter: getComputedStyle(layer).webkitBackdropFilter,
        })),
      });
      const header = document.querySelector('.site-header');
      return {
        position: '${position}',
        scrollLeft: track.scrollLeft,
        maxScroll: max,
        overflow: document.documentElement.scrollWidth - innerWidth,
        support: {
          backdropFilter: CSS.supports('backdrop-filter', 'blur(2px)'),
          webkitBackdropFilter: CSS.supports('-webkit-backdrop-filter', 'blur(2px)'),
          header: header ? {
            backdropFilter: getComputedStyle(header).backdropFilter,
            webkitBackdropFilter: getComputedStyle(header).webkitBackdropFilter,
          } : null,
        },
        left: describe(left),
        right: describe(right),
      };
    })()`);
    await settle();
    await screenshot(`${viewport.width}x${viewport.height}-${position}.png`);
    states.push(state);
  }
  results.push({ viewport, states });
}

await writeFile(resolve(outputDir, 'results.json'), `${JSON.stringify(results, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ label, outputDir, results }, null, 2));
socket.close();
