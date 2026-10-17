import raw from './catalogo-bmnuts.json';

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
};

export type Category = {
  id: string;
  name: string;
  description: string;
  order: number;
  isComingSoon?: boolean;
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

export const normalizeSearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-EC')
    .trim();

export const getPublishedProducts = () =>
  data.products.filter((product) => product.published && !product.needsVerification);

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

export const formatProductPrice = (price: number | null, currency = 'USD') =>
  price === null
    ? 'Consultar precio'
    : new Intl.NumberFormat('es-EC', { style: 'currency', currency }).format(price);

export const pickNextTagline = (taglines: string[], previous: string | null, random = Math.random) => {
  if (taglines.length === 0) return '';
  if (taglines.length === 1) return taglines[0];
  const available = taglines.filter((tagline) => tagline !== previous);
  return available[Math.floor(random() * available.length)] ?? available[0];
};
