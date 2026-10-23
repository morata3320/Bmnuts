export type ProductImagePresentation = {
  scale: number;
  objectPosition: string;
  framePadding: number;
  usable: boolean;
  note: string;
};

const DEFAULT_PRESENTATION: ProductImagePresentation = {
  scale: 1,
  objectPosition: '50% 50%',
  framePadding: 16,
  usable: true,
  note: 'Encuadre estándar del catálogo histórico.',
};

// Ajustes por asset, no por familia: compensan márgenes transparentes desiguales
// de las fotografías históricas sin aplicar zoom global ni alterar el flip 3D.
const PRODUCT_IMAGE_PRESENTATION: Record<string, Partial<ProductImagePresentation>> = {
  'nuez-macadamia': { scale: 0.94, framePadding: 20, note: 'El cuenco ocupa más área que el promedio.' },
  'pistacho-con-cascara': { scale: 1.16, framePadding: 10, note: 'Compensa margen transparente amplio.' },
  'pistacho-pelado': { scale: 1.17, framePadding: 10, note: 'Compensa margen transparente amplio.' },
  'cashew-tostada': { scale: 1.14, objectPosition: '43% 54%', framePadding: 10, note: 'Centra el cuenco dentro de un lienzo ancho.' },
  'cashew-natural': { scale: 1.14, objectPosition: '43% 54%', framePadding: 10, note: 'Centra el cuenco dentro de un lienzo ancho.' },
  'mani-con-miel-de-abeja': { scale: 1.3, objectPosition: '37% 50%', framePadding: 8, note: 'Compensa lienzo panorámico con contenido desplazado.' },
  'manicris-japones': { scale: 1.12, objectPosition: '45% 54%', framePadding: 10, note: 'Compensa lienzo vertical y margen lateral.' },
  'sacha-inchi': { scale: 1.12, objectPosition: '44% 54%', framePadding: 10, note: 'Compensa lienzo vertical y margen lateral.' },
  'haba-de-sal': { scale: 1.04, framePadding: 12, note: 'Normaliza el diámetro perceptual del cuenco.' },
  'haba-de-dulce': { scale: 1.04, framePadding: 12, note: 'Normaliza el diámetro perceptual del cuenco.' },
  'haba-picante': { scale: 1.12, objectPosition: '43% 52%', framePadding: 8, note: 'Compensa lienzo vertical.' },
  'garbanzo-de-dulce': { scale: 1.13, objectPosition: '42% 52%', framePadding: 8, note: 'Compensa lienzo vertical.' },
  'garbanzo-de-sal': { scale: 1.11, objectPosition: '43% 52%', framePadding: 9, note: 'Compensa lienzo vertical.' },
  'chulpi-de-sal': { scale: 1.34, objectPosition: '33% 50%', framePadding: 6, note: 'Compensa lienzo panorámico con cuenco desplazado.' },
  'datil-sin-pepa': {
    usable: false,
    note: 'El archivo histórico duplica la fotografía de garbanzo de sal; se usa el placeholder hasta recibir una foto auténtica.',
  },
};

export const getProductImagePresentation = (slug: string): ProductImagePresentation => ({
  ...DEFAULT_PRESENTATION,
  ...PRODUCT_IMAGE_PRESENTATION[slug],
});

export const productImageIncidents = Object.entries(PRODUCT_IMAGE_PRESENTATION)
  .filter(([, presentation]) => presentation.usable === false)
  .map(([slug, presentation]) => ({ slug, note: presentation.note ?? '' }));
