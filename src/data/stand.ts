export type StandItemType = 'novedad' | 'combinacion' | 'destacado' | 'promocion';

export type StandItem = {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: StandItemType;
  image?: string;
  imageAlt?: string;
  productIds: string[];
  visible: boolean;
  startDate?: string;
  endDate?: string;
  price?: number;
  isOfficialBundle: boolean;
  recipeId?: string;
  includesEditorialYogurt?: boolean;
  note?: string;
};

export const standItems: StandItem[] = [
  {
    id: 'yogur-griego',
    titulo: '¡Nuevo! Yogur griego en BM Nuts',
    descripcion: 'Una novedad para acompañar desayunos, avena, frutas y frutos secos.',
    tipo: 'novedad',
    image: '/images/novedades/yogur-griego-promocion.png',
    imageAlt: 'Afiche de novedad de yogur griego en BM Nuts',
    productIds: ['BMN-058', 'BMN-001', 'BMN-059', 'BMN-046'],
    visible: true,
    isOfficialBundle: false,
    recipeId: 'tazon-yogur-frutos-secos',
    includesEditorialYogurt: true,
  },
  {
    id: 'colada-morada',
    titulo: 'Colada morada',
    descripcion: 'Una bebida tradicional ecuatoriana para reencontrarse con los sabores y momentos de la temporada.',
    tipo: 'promocion',
    image: '/images/editorial/stand-colada-morada-original.webp',
    imageAlt: 'Afiche original de colada morada de BM Nuts',
    productIds: [],
    visible: true,
    isOfficialBundle: false,
    note: 'Consulta directamente en BM Nuts su disponibilidad y presentación.',
  },
  {
    id: 'desayuno-cremoso',
    titulo: 'Desayuno cremoso',
    descripcion: 'Una idea para combinar algo cremoso, fruta y un toque crujiente.',
    tipo: 'combinacion',
    productIds: ['BMN-058', 'BMN-001', 'BMN-059', 'BMN-046'],
    visible: true,
    isOfficialBundle: false,
    recipeId: 'avena-desde-la-noche',
    includesEditorialYogurt: true,
  },
  {
    id: 'crunch-para-yogur',
    titulo: 'Crunch para el yogur',
    descripcion: 'Acompañamientos para sumar contrastes de textura y fruta al yogur.',
    tipo: 'combinacion',
    productIds: ['BMN-003', 'BMN-035', 'BMN-060'],
    visible: true,
    isOfficialBundle: false,
    recipeId: 'tazon-yogur-frutos-secos',
    includesEditorialYogurt: true,
    note: 'Los acompañamientos son sugerencias y no están incluidos con el yogur.',
  },
  {
    id: 'pausa-dulce-crujiente',
    titulo: 'Pausa dulce y crujiente',
    descripcion: 'Frutos secos y frutas deshidratadas para combinar en porciones individuales.',
    tipo: 'combinacion',
    productIds: ['BMN-016', 'BMN-036', 'BMN-007', 'BMN-041'],
    visible: true,
    isOfficialBundle: false,
    recipeId: 'snack-dulce-salado',
    note: 'Es una idea de combinación; no se ofrece como mix preparado.',
  },
  {
    id: 'esenciales-de-cocina',
    titulo: 'Esenciales de cocina',
    descripcion: 'Una selección de condimentos para tener a mano al preparar tus recetas.',
    tipo: 'combinacion',
    productIds: ['BMN-051', 'BMN-052', 'BMN-054', 'BMN-050'],
    visible: true,
    isOfficialBundle: false,
    recipeId: 'condimentos-a-tu-gusto',
    note: 'Selección editorial sin proporciones definidas.',
  },
  {
    id: 'para-compartir',
    titulo: 'Para compartir',
    descripcion: 'Tres snacks salados para servir por separado y disfrutar a tu manera.',
    tipo: 'combinacion',
    productIds: ['BMN-024', 'BMN-029', 'BMN-030'],
    visible: true,
    isOfficialBundle: false,
    recipeId: 'snacks-para-compartir',
  },
];

export const isStandItemActive = (item: StandItem, today = new Date()) => {
  if (!item.visible) return false;
  const current = today.getTime();
  if (item.startDate && current < new Date(`${item.startDate}T00:00:00`).getTime()) return false;
  if (item.endDate && current > new Date(`${item.endDate}T23:59:59`).getTime()) return false;
  return true;
};

