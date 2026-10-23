export type ProductEducation = {
  productId: string;
  propiedades: string[];
  beneficiosDeNutrientes: string[];
  fuentes: string[];
  estadoRevision: 'bibliografia_general_revisada';
  advertencias?: string[];
};

const harvardNuts = 'https://nutritionsource.hsph.harvard.edu/nuts-for-the-heart/';
const harvardFiber = 'https://nutritionsource.hsph.harvard.edu/carbohydrates/fiber/';
const nihVitaminE = 'https://ods.od.nih.gov/factsheets/VitaminE-HealthProfessional/';
const nihOmega3 = 'https://ods.od.nih.gov/factsheets/Omega3FattyAcids-HealthProfessional/';
const nihSelenium = 'https://ods.od.nih.gov/factsheets/Selenium-Consumer/';
const nihFlax = 'https://www.nccih.nih.gov/health/flaxseed-and-flaxseed-oil';
const medlineProtein = 'https://medlineplus.gov/dietaryproteins.html';

export const productEducation: Readonly<Record<string, ProductEducation>> = {
  'BMN-001': {
    productId: 'BMN-001',
    propiedades: ['Las almendras aportan vitamina E.', 'Contienen grasas principalmente insaturadas, proteína vegetal y fibra.'],
    beneficiosDeNutrientes: ['La vitamina E actúa como antioxidante y contribuye a proteger las células del daño oxidativo.'],
    fuentes: [nihVitaminE, harvardNuts],
    estadoRevision: 'bibliografia_general_revisada',
  },
  'BMN-007': {
    productId: 'BMN-007',
    propiedades: ['La nuez común contiene grasas insaturadas y omega-3 vegetal del tipo ALA.'],
    beneficiosDeNutrientes: ['El ALA es un ácido graso esencial que debe obtenerse de la alimentación.'],
    fuentes: [nihOmega3, harvardNuts],
    estadoRevision: 'bibliografia_general_revisada',
  },
  'BMN-009': {
    productId: 'BMN-009',
    propiedades: ['La nuez del Brasil contiene cantidades muy elevadas de selenio.'],
    beneficiosDeNutrientes: ['El selenio participa en funciones normales de la tiroides y en la protección celular.'],
    fuentes: [nihSelenium],
    estadoRevision: 'bibliografia_general_revisada',
    advertencias: ['La ingesta excesiva de selenio puede ser perjudicial. No se recomienda un consumo elevado.'],
  },
  'BMN-014': {
    productId: 'BMN-014',
    propiedades: ['Como otros frutos secos, el cashew natural aporta grasas alimentarias y proteína vegetal.'],
    beneficiosDeNutrientes: ['La proteína contribuye al mantenimiento y reparación de tejidos.'],
    fuentes: [harvardNuts, medlineProtein],
    estadoRevision: 'bibliografia_general_revisada',
  },
  'BMN-015': {
    productId: 'BMN-015',
    propiedades: ['El maní crudo aporta proteína vegetal y grasas principalmente insaturadas.'],
    beneficiosDeNutrientes: ['La proteína forma parte de músculos, piel y otros tejidos.'],
    fuentes: [harvardNuts, medlineProtein],
    estadoRevision: 'bibliografia_general_revisada',
  },
  'BMN-023': {
    productId: 'BMN-023',
    propiedades: ['La semilla de sacha inchi contiene ácidos grasos poliinsaturados, incluidos ALA (omega-3) y ácido linoleico (omega-6).'],
    beneficiosDeNutrientes: ['El ALA y el ácido linoleico son ácidos grasos esenciales que deben obtenerse de la alimentación.'],
    fuentes: ['https://pubmed.ncbi.nlm.nih.gov/23870885/', nihOmega3],
    estadoRevision: 'bibliografia_general_revisada',
  },
  'BMN-033': {
    productId: 'BMN-033',
    propiedades: ['Las avellanas contienen vitamina E.'],
    beneficiosDeNutrientes: ['La vitamina E tiene función antioxidante y contribuye a proteger las células.'],
    fuentes: [nihVitaminE],
    estadoRevision: 'bibliografia_general_revisada',
  },
  'BMN-058': {
    productId: 'BMN-058',
    propiedades: ['La avena aporta fibra soluble, incluido betaglucano.'],
    beneficiosDeNutrientes: ['La fibra contribuye a una función digestiva normal.'],
    fuentes: [harvardFiber, 'https://www.govinfo.gov/content/pkg/FR-1997-01-23/html/97-1598.htm'],
    estadoRevision: 'bibliografia_general_revisada',
  },
  'BMN-059': {
    productId: 'BMN-059',
    propiedades: ['La linaza contiene fibra y ácido alfa-linolénico (ALA), un omega-3 vegetal.'],
    beneficiosDeNutrientes: ['La fibra forma parte de una alimentación que favorece la función intestinal; el ALA es un ácido graso esencial.'],
    fuentes: [nihOmega3, nihFlax, harvardFiber],
    estadoRevision: 'bibliografia_general_revisada',
  },
  'BMN-060': {
    productId: 'BMN-060',
    propiedades: ['La linaza contiene fibra y ácido alfa-linolénico (ALA), un omega-3 vegetal.'],
    beneficiosDeNutrientes: ['La fibra forma parte de una alimentación que favorece la función intestinal; el ALA es un ácido graso esencial.'],
    fuentes: [nihOmega3, nihFlax, harvardFiber],
    estadoRevision: 'bibliografia_general_revisada',
  },
};
