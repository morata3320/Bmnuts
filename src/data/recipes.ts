export type PreparationIdea = {
  id: string;
  titulo: string;
  descripcion: string;
  productIds: string[];
  pasos: string[];
};

export const preparationIdeas: PreparationIdea[] = [
  {
    id: 'tazon-yogur-frutos-secos',
    titulo: 'Tazón de yogur y frutos secos',
    descripcion: 'Una forma sencilla de sumar fruta y un toque crujiente.',
    productIds: ['BMN-001', 'BMN-003', 'BMN-035', 'BMN-059'],
    pasos: ['Sirve el yogur griego en un tazón.', 'Agrega almendras y fruta deshidratada a tu gusto.', 'Completa con linaza y consume después de preparar.'],
  },
  {
    id: 'avena-desde-la-noche',
    titulo: 'Avena preparada desde la noche',
    descripcion: 'Una preparación general para completar al momento de servir.',
    productIds: ['BMN-058', 'BMN-001', 'BMN-059', 'BMN-046'],
    pasos: ['Combina la avena con un líquido adecuado y refrigera.', 'Al servir, completa con yogur y los acompañamientos que prefieras.'],
  },
  {
    id: 'snack-dulce-salado',
    titulo: 'Snack dulce-salado',
    descripcion: 'Una idea flexible para probar distintos contrastes.',
    productIds: ['BMN-016', 'BMN-036', 'BMN-007', 'BMN-041'],
    pasos: ['Sirve porciones individuales de frutos secos.', 'Acompaña con frutas deshidratadas según tu gusto.'],
  },
  {
    id: 'condimentos-a-tu-gusto',
    titulo: 'Condimentos a tu gusto',
    descripcion: 'Selecciona cada condimento de acuerdo con la receta que estés preparando.',
    productIds: ['BMN-051', 'BMN-052', 'BMN-054', 'BMN-050'],
    pasos: ['Elige los condimentos que correspondan a tu receta.', 'Agrégalos de forma gradual y ajusta a tu gusto.'],
  },
  {
    id: 'snacks-para-compartir',
    titulo: 'Opciones para compartir',
    descripcion: 'Presenta varias alternativas sin mezclarlas como un producto único.',
    productIds: ['BMN-024', 'BMN-029', 'BMN-030'],
    pasos: ['Sirve cada snack por separado.', 'Deja que cada persona elija o combine según su gusto.'],
  },
];

export const relatedProductIds: Record<string, string[]> = {
  'BMN-001': ['BMN-058', 'BMN-035', 'BMN-059'],
  'BMN-058': ['BMN-001', 'BMN-059', 'BMN-046'],
  'BMN-059': ['BMN-058', 'BMN-001', 'BMN-035'],
  'BMN-050': ['BMN-051', 'BMN-052', 'BMN-054'],
  'BMN-051': ['BMN-054', 'BMN-052', 'BMN-050'],
  'BMN-054': ['BMN-051', 'BMN-052', 'BMN-050'],
};

