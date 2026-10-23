export type EditorialCollection = {
  id: string;
  titulo: string;
  descripcion: string;
  image: string;
  imageAlt: string;
  productIds: string[];
  estado: 'publicada' | 'oculta';
};

export const editorialCollections: EditorialCollection[] = [
  {
    id: 'desayunos',
    titulo: 'Para tus desayunos',
    descripcion: 'Avena, semillas, frutos secos y frutas para crear tu combinación de la mañana.',
    image: '/images/editorial/coleccion-desayunos.webp',
    imageAlt: 'Composición editorial de avena, almendras, chía y fruta deshidratada',
    productIds: ['BMN-058', 'BMN-059', 'BMN-060', 'BMN-001', 'BMN-034', 'BMN-035', 'BMN-046'],
    estado: 'publicada',
  },
  {
    id: 'proteina-vegetal',
    titulo: 'Fuentes de proteína vegetal',
    descripcion: 'Una selección editorial de frutos secos y semillas para sumar variedad a tus preparaciones.',
    image: '/images/editorial/coleccion-proteina-vegetal.webp',
    imageAlt: 'Composición editorial de maní, semillas y almendras',
    productIds: ['BMN-016', 'BMN-001', 'BMN-011', 'BMN-023', 'BMN-007'],
    estado: 'publicada',
  },
  {
    id: 'snacks-para-compartir',
    titulo: 'Snacks para compartir',
    descripcion: 'Opciones saladas para servir por separado y elegir según el gusto de cada persona.',
    image: '/images/editorial/coleccion-snacks.webp',
    imageAlt: 'Composición editorial de snacks tostados en cuencos',
    productIds: ['BMN-024', 'BMN-017', 'BMN-030', 'BMN-029'],
    estado: 'publicada',
  },
  {
    id: 'sabores-para-recetas',
    titulo: 'Para darle sabor a tus recetas',
    descripcion: 'Condimentos del catálogo para explorar distintos aromas y perfiles de sabor.',
    image: '/images/editorial/coleccion-recetas.webp',
    imageAlt: 'Composición editorial de especias y hierbas en cuencos',
    productIds: ['BMN-051', 'BMN-050', 'BMN-052', 'BMN-054', 'BMN-055', 'BMN-053', 'BMN-056', 'BMN-057'],
    estado: 'publicada',
  },
];

export const visibleCollections = editorialCollections.filter((collection) => collection.estado === 'publicada');

