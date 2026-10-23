import raw from './catalogo-bmnuts.json';
import publicInventory from './data/catalogo-publico-2026.json';
import publicPricing from './data/precios-publicos-2026.json';
import { getProductImagePresentation } from './data/productImagePresentation';

export type AvailabilityPolicy = 'habitual' | 'intermitente' | 'sin_confirmacion';
export type PublicSaleMode = 'bulk' | 'fixed_product' | 'unit' | 'jar' | 'restricted' | 'unknown';

export type PublicVariant = {
  id: string;
  name: string;
  presentation: string | null;
  availabilityPolicy: AvailabilityPolicy;
  saleMode: PublicSaleMode;
  approvedPriceCents?: number | null;
  pricingBasis?: 'per_lb' | 'fixed' | null;
  pricePresentationLabel?: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  subcategory: string;
  shortDescription: string;
  longDescription: string | null;
  traditionalUses: string[];
  nutritionFacts: string[];
  price: number | null;
  currency: 'USD';
  unit: string | null;
  images: string[];
  imageAlt: string | null;
  source: string;
  needsVerification: boolean;
  published: boolean;
  featured: boolean;
  tags: string[];
  groupId?: string | null;
  variants?: PublicVariant[];
  availabilityPolicy?: AvailabilityPolicy;
  pricePublishedUsd?: number | null;
  saleMode?: PublicSaleMode;
  approvedPriceCents?: number | null;
  pricingBasis?: 'per_lb' | 'fixed' | null;
  pricePresentationLabel?: string | null;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  order: number;
  isComingSoon?: boolean;
  isComplementary?: boolean;
};

export type CatalogData = {
  brand: {
    name: string;
    tagline: string;
    logo: string;
    taglines: string[];
    phone: string | null;
    whatsapp: string | null;
    email: string | null;
    instagramHandle: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
  };
  products: Product[];
  categories: Category[];
};

export const data = raw as CatalogData;

type PublicInventoryData = {
  metadata: {
    sourceRecords: number;
    excludedDefinitively: number;
    nonRedCandidates: number;
    publicGroupsAdded: number;
    publicVariantsAdded: number;
    legacyRowsRepresented: number;
    publicCardsFinal: number;
    pendingReview: number;
    pricesPublished: number;
    priceEntriesPublished: number;
    pricesPending: number;
  };
  categories: Category[];
  legacySaleProfiles: Array<{ productId: string; saleMode: PublicSaleMode }>;
  products: Product[];
};

const inventory2026 = publicInventory as PublicInventoryData;

export type PublicPriceEntry = {
  productId: string;
  variantId: string | null;
  amountCents: number;
  pricingBasis: 'per_lb' | 'fixed';
  presentationLabel: string | null;
};

type PublicPricingData = {
  metadata: {
    productsWithPublishedPrices: number;
    publishedPriceEntries: number;
    productsPendingPrice: number;
    bulkPriceEntries: number;
    fixedPriceEntries: number;
    restrictedPresentationEntries: number;
    groupedProductsWithDifferentPrices: number;
  };
  prices: PublicPriceEntry[];
  pending: Array<{ productId: string; variantId?: string; reason: string }>;
};

const pricing2026 = publicPricing as PublicPricingData;
export const publicPricingMetadata = pricing2026.metadata;
const pricesByProduct = new Map<string, PublicPriceEntry[]>();
pricing2026.prices.forEach((entry) => {
  const current = pricesByProduct.get(entry.productId) ?? [];
  current.push(entry);
  pricesByProduct.set(entry.productId, current);
});

export const majorUpdateMetadata = inventory2026.metadata;

const legacySaleModes = new Map(inventory2026.legacySaleProfiles.map((profile) => [profile.productId, profile.saleMode]));
const publishedProducts = [
  ...data.products.map((product) => ({ ...product, saleMode: legacySaleModes.get(product.id) ?? 'unknown' as PublicSaleMode })),
  ...inventory2026.products,
]
  .filter((product) => product.published && !product.needsVerification)
  .map((product): Product => {
    const prices = pricesByProduct.get(product.id) ?? [];
    const directPrice = prices.find((entry) => entry.variantId === null);
    const variants = product.variants?.map((variant) => {
      const variantPrice = prices.find((entry) => entry.variantId === variant.id);
      return {
        ...variant,
        approvedPriceCents: variantPrice?.amountCents ?? null,
        pricingBasis: variantPrice?.pricingBasis ?? null,
        pricePresentationLabel: variantPrice?.presentationLabel ?? null,
      };
    });
    const onlyVariant = variants?.length === 1 ? variants[0] : null;
    return {
      ...product,
      variants,
      approvedPriceCents: directPrice?.amountCents ?? onlyVariant?.approvedPriceCents ?? null,
      pricingBasis: directPrice?.pricingBasis ?? onlyVariant?.pricingBasis ?? null,
      pricePresentationLabel: directPrice?.presentationLabel ?? onlyVariant?.pricePresentationLabel ?? null,
    };
  })
  .map((product) => getProductImagePresentation(product.slug).usable ? product : { ...product, images: [] });

export const getCatalogCategories = () => {
  const categories = new Map<string, Category>();
  [...data.categories, ...inventory2026.categories].forEach((category) => {
    const current = categories.get(category.id);
    categories.set(category.id, current ? { ...current, ...category, order: current.order } : category);
  });
  const categoryIdsWithProducts = new Set(publishedProducts.map((product) => product.categoryId));
  categories.forEach((category, id) => {
    if (categoryIdsWithProducts.has(id) && category.isComingSoon) {
      categories.set(id, { ...category, isComingSoon: false });
    }
  });
  return [...categories.values()].sort((a, b) => a.order - b.order);
};

export const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-EC')
    .trim();

export const getPublishedProducts = () =>
  publishedProducts;

export const searchProducts = (products: Product[], query: string) => {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return products;

  return products.filter((product) =>
    normalizeSearch(
      [
        product.name,
        product.categoryId,
        product.subcategory,
        product.shortDescription,
        ...product.tags,
      ].join(' '),
    ).includes(normalizedQuery),
  );
};

export type CatalogFilters = {
  query?: string;
  categoryId?: string | null;
  subcategory?: string | null;
  onlyFavorites?: boolean;
  favoriteIds?: Iterable<string>;
  collectionIds?: Iterable<string> | null;
};

export const filterCatalogProducts = (items: Product[], filters: CatalogFilters) => {
  const favoriteIds = new Set(filters.favoriteIds ?? []);
  const collectionIds = filters.collectionIds ? new Set(filters.collectionIds) : null;
  const selectedSubcategory = normalizeSearch(filters.subcategory ?? '');

  return searchProducts(items, filters.query ?? '').filter(
    (product) =>
      (!filters.categoryId || product.categoryId === filters.categoryId) &&
      (!selectedSubcategory || normalizeSearch(product.subcategory) === selectedSubcategory) &&
      (!collectionIds || collectionIds.has(product.id)) &&
      (!filters.onlyFavorites || favoriteIds.has(product.id)),
  );
};

export const getCategorySubcategories = (items: Product[], categoryId: string) => {
  const unique = new Map<string, string>();
  items
    .filter((product) => product.categoryId === categoryId)
    .forEach((product) => {
      const key = normalizeSearch(product.subcategory);
      if (key && !unique.has(key)) unique.set(key, product.subcategory.trim());
    });
  return [...unique.values()].sort((a, b) => a.localeCompare(b, 'es-EC'));
};

export const formatProductPrice = (price: number | null, currency = 'USD') =>
  price === null
    ? 'Precio por confirmar'
    : new Intl.NumberFormat('es-EC', { style: 'currency', currency }).format(price);

export const formatPriceCents = (amountCents: number, currency = 'USD') =>
  new Intl.NumberFormat('es-EC', { style: 'currency', currency }).format(amountCents / 100);

export const pickNextTagline = (taglines: string[], previous: string | null, random = Math.random) => {
  if (taglines.length === 0) return '';
  if (taglines.length === 1) return taglines[0];
  const available = taglines.filter((tagline) => tagline !== previous);
  return available[Math.floor(random() * available.length)] ?? available[0];
};
