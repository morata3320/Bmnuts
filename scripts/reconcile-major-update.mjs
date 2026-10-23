/* global console, process */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');
const privateInventoryPath = resolve(
  repoRoot,
  '..',
  '..',
  'BMNuts_Actualizacion_Mayor_2026-10-20',
  'DATOS_PRIVADOS_NO_SUBIR',
  'INVENTARIO_NORMALIZADO_REGLAS_ACTUALES_PRIVADO.json',
);
const legacyCatalogPath = resolve(repoRoot, 'src', 'catalogo-bmnuts.json');
const publicOutputPath = resolve(repoRoot, 'src', 'data', 'catalogo-publico-2026.json');
const publicPricesOutputPath = resolve(repoRoot, 'src', 'data', 'precios-publicos-2026.json');
const excludedHashesPath = resolve(repoRoot, 'src', 'test-fixtures', 'excluded-product-hashes.json');
const privateReportPath = resolve(repoRoot, '..', 'tmp', 'CONCILIACION_ACTUALIZACION_MAYOR_PRIVADA.json');

const EXPECTED = {
  total: 545,
  nonRed: 430,
  colors: { 'sin marcar': 368, amarillo: 18, verde: 44, rojo: 115 },
};

const CATEGORY_MAP = {
  'Frutos secos y snacks': ['frutos-secos-y-snacks', 'Frutos secos y snacks'],
  'Frutas deshidratadas y confitadas': ['frutas-deshidratadas', 'Frutas deshidratadas y pasas'],
  'Especias y condimentos': ['especias-y-condimentos', 'Especias y condimentos'],
  'Semillas, cereales y legumbres': ['semillas-y-cereales', 'Semillas, cereales y legumbres'],
  'Hierbas e infusiones': ['hierbas-e-infusiones', 'Hierbas e infusiones'],
  'Harinas y derivados': ['harinas', 'Harinas y derivados'],
  'Chocolates y repostería': ['chocolates-cacao-reposteria', 'Chocolates, cacao y repostería'],
  'Aceites, aderezos y conservas': ['aceites-aderezos-conservas', 'Aceites, aderezos, conservas y vinagres'],
  'Bebidas y lácteos/alternativas': ['bebidas-despensa', 'Bebidas, leches vegetales, yogures y despensa'],
  'Mieles y endulzantes': ['endulzantes-mieles', 'Endulzantes y mieles'],
};

const PENDING_FAMILIES = new Set([
  'Bienestar y artículos especiales',
  'Envases y accesorios / servicios',
  'Otros productos / revisar',
]);

const LEGACY_ALIASES = {
  'almendra natural': 'almendra',
  'nuez comun': 'nuez',
  'nuez pecana': 'pecanas',
  'nuez macadamia': 'macadamia',
  'pistacho con cascara': 'pistacho',
  'cashew tostada': 'castana tostada',
  'cashew natural': 'castana natural',
  'mani salado': 'mani de sal',
  'mani con miel de abeja': 'mani con miel',
  'mani cubierto': 'mani con cobertura',
  'maiz de sal': 'maiz salado',
  'maiz de dulce': 'maiz dulce',
  'chulpi de sal': 'chulpi',
  'pasa negra': 'pasas',
  'arandano rojo': 'arandanos',
  'arandano negro': 'arandanos negros',
  'damasco deshidratado': 'damasco',
  'datil sin pepa': 'datiles',
  'mix amarillo': 'mix frutos desh amarillo',
  'mix rojo': 'mix frutos desh rojos',
  'paprika normal': 'paprika molida',
  comino: ['comino en pepa', 'comino molido'],
  avena: 'avena entera',
  'linaza en semilla': 'semillas de linaza',
  jamaica: 'flor de jamaica',
  calendula: 'flor de calendula',
  cedron: 'hoja de cedron',
  toronjil: 'hoja de toronjil',
  guayusa: 'hoja de guayusa',
  laurel: 'hoja de laurel',
  oregano: 'hoja oregano',
  eneldo: 'hoja de eneldo',
  llanten: 'hoja de llanten',
  hercampuri: 'hoja de hercampuri',
  boldo: 'hoja de boldo',
  matico: 'hoja de matico',
  chancapiedra: 'hoja chancapiedra',
  'diente de leon': 'hoja de taraxaco',
  alcachofa: 'hoja de alcachofa',
  moringa: 'hoja de moringa',
  guanabana: 'hoja de guanabana',
  sen: 'hoja de sen',
  cardamomo: 'semilla de cardamomo',
  jengibre: 'jengibre en raiz',
  'hoja de te verde': 'hoja te verde',
};

const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\u00a0/g, ' ')
    .replace(/\b(?:lb|libra|und|unidad|frasco|paq)\.?\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const normalizeRuleText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\u00a0/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

const stripPresentation = (value) =>
  String(value ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+(?:\d+(?:[.,]\d+)?\s*)?(?:ml|cc|cm|gr|kg|kl|lt|l|lb|und|paq)\.?\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

const displayCase = (value) => {
  const lowerWords = new Set(['de', 'del', 'con', 'sin', 'en', 'y', 'para']);
  return stripPresentation(value)
    .toLocaleLowerCase('es-EC')
    .split(' ')
    .map((word, index) => (index > 0 && lowerWords.has(word) ? word : `${word.charAt(0).toLocaleUpperCase('es-EC')}${word.slice(1)}`))
    .join(' ')
    .replace(/\bBm Nuts\b/g, 'BM Nuts')
    .replace(/\bE\.virgen\b/gi, 'extra virgen');
};

const slugify = (value) => normalize(value).replace(/\s+/g, '-');
const hash = (value) => createHash('sha256').update(value).digest('hex').slice(0, 12);

const getAvailability = (entries) => {
  if (entries.some((entry) => entry.color_original === 'amarillo')) return 'intermitente';
  if (entries.every((entry) => entry.color_original === 'sin marcar')) return 'habitual';
  return 'sin_confirmacion';
};

// Public, price-free sale semantics. These values are safe to ship because they
// describe only how a product is presented; source notes and internal prices
// never leave the private reconciliation step.
const getPublicSaleMode = (record) => {
  const notes = normalizeRuleText(record.nota_original);
  const measure = normalizeRuleText(record.medida_original);
  const commercialPresentation = normalizeRuleText(record.nombre_original);
  if (/solo media y libra/.test(notes)) return 'restricted';
  if (/solo producto(?: de dolar)?/.test(notes)) return 'fixed_product';
  if (/pese la rama|peso variable|pesaje especifico/.test(notes)) return 'unknown';
  if (/\b\d+(?:[.,]\d+)?\s*(?:gr|kg|kl|lt|ml|cc)\b/.test(commercialPresentation)) {
    return /(?:ml|cc|lt)\b/.test(commercialPresentation) ? 'jar' : 'unit';
  }
  if (/unidad|\bund\b/.test(measure)) return 'unit';
  if (/frasco/.test(measure)) return 'jar';
  if (/libra|\blb\b/.test(measure)) return 'bulk';
  return 'unknown';
};

const mergePublicSaleModes = (entries) => {
  const modes = [...new Set(entries.map(getPublicSaleMode))];
  return modes.length === 1 ? modes[0] : 'unknown';
};

const getDescription = (name, categoryName, variantCount) => {
  const variants = variantCount > 1 ? ` Reúne ${variantCount} presentaciones diferenciadas.` : '';
  return `${name} forma parte de ${categoryName.toLocaleLowerCase('es-EC')} de BM Nuts.${variants}`;
};

const inventory = JSON.parse(await readFile(privateInventoryPath, 'utf8'));
const legacyCatalog = JSON.parse(await readFile(legacyCatalogPath, 'utf8'));
const records = inventory.productos;

const colorCounts = Object.fromEntries(
  Object.keys(EXPECTED.colors).map((color) => [color, records.filter((record) => record.color_original === color).length]),
);
const nonRed = records.filter((record) => record.color_original !== 'rojo');
if (
  records.length !== EXPECTED.total ||
  nonRed.length !== EXPECTED.nonRed ||
  Object.entries(EXPECTED.colors).some(([color, count]) => colorCounts[color] !== count)
) {
  throw new Error(`Inventario privado fuera de contrato: ${JSON.stringify({ total: records.length, nonRed: nonRed.length, colorCounts })}`);
}

const recordsByName = new Map();
for (const record of records) {
  const key = normalize(record.nombre_original);
  const current = recordsByName.get(key) ?? [];
  current.push(record);
  recordsByName.set(key, current);
}

const legacyMatches = [];
const legacySaleProfiles = [];
const publicPriceRecords = [];
const pricingPending = [];
const matchedRows = new Set();
for (const product of legacyCatalog.products) {
  const legacyKey = normalize(product.name);
  const targets = [LEGACY_ALIASES[legacyKey] ?? legacyKey].flat();
  const candidates = targets.flatMap((target) => recordsByName.get(target) ?? []);
  const eligible = candidates.filter((record) => record.color_original !== 'rojo');
  const excluded = candidates.filter((record) => record.color_original === 'rojo');
  const status = eligible.length === 1
    ? 'match_aprobado_manual'
    : eligible.length > 1
      ? 'en_conflicto'
      : excluded.length > 0
        ? 'excluido_rojo'
        : 'sin_match';
  if (product.published && !product.needsVerification && eligible.length > 0) {
    eligible.forEach((record) => matchedRows.add(record.fila_excel));
    const saleMode = mergePublicSaleModes(eligible);
    legacySaleProfiles.push({ productId: product.id, saleMode });
    const sourcePrice = eligible.length === 1 ? eligible[0].precio1_interno_referencia_no_aprobado : null;
    if (status === 'match_aprobado_manual' && saleMode !== 'unknown' && Number.isFinite(sourcePrice) && sourcePrice > 0) {
      publicPriceRecords.push({
        productId: product.id,
        variantId: null,
        amountCents: Math.round(sourcePrice * 100),
        pricingBasis: saleMode === 'bulk' || saleMode === 'restricted' ? 'per_lb' : 'fixed',
        presentationLabel: saleMode === 'fixed_product' ? 'Producto completo' : product.unit,
      });
    } else {
      pricingPending.push({ productId: product.id, reason: status === 'en_conflicto' ? 'correspondencia_ambigua' : 'modalidad_o_precio_sin_verificar' });
    }
  }
  legacyMatches.push({
    legacyProductId: product.id,
    legacyName: product.name,
    legacyPublished: Boolean(product.published && !product.needsVerification),
    status,
    candidateRows: candidates.map((record) => record.fila_excel),
  });
}

const pending = nonRed.filter(
  (record) => PENDING_FAMILIES.has(record.familia_sugerida_no_aprobada) && !matchedRows.has(record.fila_excel),
);
const publishableRecords = nonRed.filter(
  (record) => CATEGORY_MAP[record.familia_sugerida_no_aprobada] && !matchedRows.has(record.fila_excel),
);

const grouped = new Map();
for (const record of publishableRecords) {
  const category = CATEGORY_MAP[record.familia_sugerida_no_aprobada];
  const displayName = displayCase(record.nombre_original);
  const key = `${category[0]}::${normalize(displayName)}`;
  const current = grouped.get(key) ?? { category, entries: [], displayName };
  current.entries.push(record);
  grouped.set(key, current);
}

const products = [...grouped.values()]
  .map(({ category, entries, displayName }) => {
    const [categoryId, categoryName] = category;
    const baseSlug = slugify(displayName);
    const id = `BMN26-${hash(`${categoryId}:${baseSlug}`)}`;
    const variantGroups = new Map();
    for (const entry of entries) {
      const signature = `${normalize(entry.nombre_original)}:${normalizeRuleText(entry.medida_original)}`;
      const current = variantGroups.get(signature) ?? [];
      current.push(entry);
      variantGroups.set(signature, current);
    }
    const variants = [...variantGroups.entries()].map(([signature, matchingEntries]) => {
      const entry = matchingEntries[0];
      const variantId = `VAR-${hash(signature)}`;
      const saleMode = getPublicSaleMode(entry);
      const prices = [...new Set(matchingEntries.map((item) => item.precio1_interno_referencia_no_aprobado))];
      const sourcePrice = prices.length === 1 ? prices[0] : null;
      const presentation = String(entry.nombre_original).replace(stripPresentation(entry.nombre_original), '').trim() || null;
      if (saleMode !== 'unknown' && Number.isFinite(sourcePrice) && sourcePrice > 0) {
        publicPriceRecords.push({
          productId: id,
          variantId,
          amountCents: Math.round(sourcePrice * 100),
          pricingBasis: saleMode === 'bulk' || saleMode === 'restricted' ? 'per_lb' : 'fixed',
          presentationLabel: presentation || (saleMode === 'fixed_product' ? 'Producto completo' : entry.medida_original),
        });
      } else {
        pricingPending.push({
          productId: id,
          variantId,
          reason: prices.length > 1 ? 'precios_incompatibles_misma_presentacion' : 'modalidad_o_precio_sin_verificar',
        });
      }
      return {
        id: variantId,
        name: displayCase(entry.nombre_original),
        presentation,
        availabilityPolicy: matchingEntries.some((item) => item.color_original === 'amarillo') ? 'intermitente' : matchingEntries.every((item) => item.color_original === 'sin marcar') ? 'habitual' : 'sin_confirmacion',
        saleMode,
      };
    });
    return {
      id,
      slug: baseSlug,
      name: displayName,
      categoryId,
      subcategory: categoryName,
      groupId: variants.length > 1 ? `GRP-${hash(`${categoryId}:${baseSlug}`)}` : null,
      variants,
      availabilityPolicy: getAvailability(entries),
      saleMode: mergePublicSaleModes(entries),
      shortDescription: getDescription(displayName, categoryName, variants.length),
      longDescription: null,
      traditionalUses: [],
      nutritionFacts: [],
      price: null,
      pricePublishedUsd: null,
      currency: 'USD',
      unit: null,
      images: [],
      imageAlt: null,
      source: 'catalogo-publico-depurado-2026-10-20',
      needsVerification: false,
      published: true,
      featured: false,
      tags: [...new Set([categoryName, ...variants.flatMap((variant) => variant.name.split(' '))])],
    };
  })
  .sort((a, b) => a.categoryId.localeCompare(b.categoryId) || a.name.localeCompare(b.name, 'es-EC'));

const categories = Object.values(CATEGORY_MAP).map(([id, name], index) => ({
  id,
  name,
  order: index + 1,
  isComplementary: index >= 6,
}));

const publicCatalog = {
  metadata: {
    generatedFrom: 'inventario privado validado fuera del repositorio',
    sourceRecords: EXPECTED.total,
    excludedDefinitively: EXPECTED.colors.rojo,
    nonRedCandidates: EXPECTED.nonRed,
    publicGroupsAdded: products.length,
    publicVariantsAdded: publishableRecords.length,
    legacyRowsRepresented: matchedRows.size,
    publicCardsFinal: legacyCatalog.products.filter((product) => product.published && !product.needsVerification).length + products.length,
    pendingReview: pending.length,
    pricesPublished: new Set(publicPriceRecords.map((record) => record.productId)).size,
    priceEntriesPublished: publicPriceRecords.length,
    pricesPending: new Set(pricingPending.map((record) => record.productId)).size,
  },
  categories,
  legacySaleProfiles,
  products,
};

const serializedPublic = JSON.stringify(publicCatalog, null, 2);
const fixedPriceRecords = publicPriceRecords.filter((record) => record.pricingBasis === 'fixed');
const bulkPriceRecords = publicPriceRecords.filter((record) => record.pricingBasis === 'per_lb');
const variantPriceGroups = new Map();
for (const record of publicPriceRecords.filter((item) => item.variantId)) {
  const current = variantPriceGroups.get(record.productId) ?? [];
  current.push(record.amountCents);
  variantPriceGroups.set(record.productId, current);
}
const publicPrices = {
  metadata: {
    generatedFrom: 'precios autorizados del inventario marcado, conciliados fuera del repositorio',
    productsWithPublishedPrices: new Set(publicPriceRecords.map((record) => record.productId)).size,
    publishedPriceEntries: publicPriceRecords.length,
    productsPendingPrice: new Set(pricingPending.map((record) => record.productId)).size,
    bulkPriceEntries: bulkPriceRecords.length,
    fixedPriceEntries: fixedPriceRecords.length,
    restrictedPresentationEntries: publicPriceRecords.filter((record) => {
      const product = products.find((item) => item.id === record.productId);
      return product?.variants.some((variant) => variant.id === record.variantId && variant.saleMode === 'restricted');
    }).length,
    groupedProductsWithDifferentPrices: [...variantPriceGroups.values()].filter((prices) => new Set(prices).size > 1).length,
  },
  prices: publicPriceRecords,
  pending: pricingPending,
};
const serializedPrices = JSON.stringify(publicPrices, null, 2);
const excludedNameHashes = [...new Set(
  records
    .filter((record) => record.color_original === 'rojo')
    .map((record) => hash(normalize(record.nombre_original))),
)].sort();
for (const forbidden of ['precio1_interno', 'fila_excel', 'color_original', 'nota_original', 'rawHighlight', 'sourceRow', 'sourceName']) {
  if (`${serializedPublic}${serializedPrices}`.includes(forbidden)) throw new Error(`Campo privado detectado en salida pública: ${forbidden}`);
}
const allowedSaleModes = new Set(['bulk', 'fixed_product', 'unit', 'jar', 'restricted', 'unknown']);
if (
  legacySaleProfiles.some((profile) => !allowedSaleModes.has(profile.saleMode)) ||
  products.some((product) => !allowedSaleModes.has(product.saleMode) || product.variants.some((variant) => !allowedSaleModes.has(variant.saleMode)))
) {
  throw new Error('La salida pública contiene una modalidad de venta no reconocida.');
}
const leakedExcludedNames = products.flatMap((product) => [product.name, ...product.variants.map((variant) => variant.name)])
  .filter((name) => excludedNameHashes.includes(hash(normalize(name))));
if (leakedExcludedNames.length > 0) throw new Error(`Productos rojos detectados en salida pública: ${leakedExcludedNames.join(', ')}`);

const privateReport = {
  generatedAt: new Date().toISOString(),
  source: privateInventoryPath,
  counts: {
    total: records.length,
    colorCounts,
    nonRed: nonRed.length,
    red: records.length - nonRed.length,
    legacy: legacyCatalog.products.length,
    legacyPublished: legacyCatalog.products.filter((product) => product.published && !product.needsVerification).length,
    legacyMatched: legacyMatches.filter((match) => match.status === 'match_aprobado_manual').length,
    legacyConflicts: legacyMatches.filter((match) => match.status === 'en_conflicto').length,
    legacyExcludedRed: legacyMatches.filter((match) => match.status === 'excluido_rojo').length,
    legacyWithoutMatch: legacyMatches.filter((match) => match.status === 'sin_match').length,
    publicGroupsAdded: products.length,
    publicVariantsAdded: publishableRecords.length,
    legacyRowsRepresented: matchedRows.size,
    publicCardsFinal: legacyCatalog.products.filter((product) => product.published && !product.needsVerification).length + products.length,
    pendingReview: pending.length,
  },
  legacyMatches,
  pendingReview: pending.map((record) => ({
    sourceRow: record.fila_excel,
    sourceName: record.nombre_original,
    suggestedFamily: record.familia_sugerida_no_aprobada,
    reasons: ['Familia sensible, accesorio o identificación comercial pendiente de aprobación'],
  })),
};

const shouldWrite = process.argv.includes('--write-public');
if (shouldWrite) {
  await mkdir(dirname(publicOutputPath), { recursive: true });
  await mkdir(dirname(excludedHashesPath), { recursive: true });
  await mkdir(dirname(privateReportPath), { recursive: true });
  await writeFile(publicOutputPath, `${serializedPublic}\n`, 'utf8');
  await writeFile(publicPricesOutputPath, `${serializedPrices}\n`, 'utf8');
  await writeFile(excludedHashesPath, `${JSON.stringify(excludedNameHashes, null, 2)}\n`, 'utf8');
  await writeFile(privateReportPath, `${JSON.stringify(privateReport, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify({
  mode: shouldWrite ? 'write-public' : 'validate-only',
  source: { total: records.length, colors: colorCounts, nonRed: nonRed.length },
  legacy: privateReport.counts,
  public: publicCatalog.metadata,
  output: shouldWrite ? publicOutputPath : null,
  pricesOutput: shouldWrite ? publicPricesOutputPath : null,
  privateReport: shouldWrite ? privateReportPath : null,
}, null, 2));
