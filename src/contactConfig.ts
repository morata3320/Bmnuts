export type SocialChannel = {
  id: 'whatsapp' | 'facebook' | 'instagram';
  label: string;
  url: string | null;
  tooltip: string;
  fill: string;
  pendingVerification: boolean;
};

export type StoreLocation = {
  id: 'matriz' | 'sucursal';
  title: string;
  area: string;
  address: string;
  description: string;
  pendingVerification: boolean;
};

export const contactConfig: {
  socials: SocialChannel[];
  locations: StoreLocation[];
} = {
  socials: [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      url: null,
      tooltip: 'WhatsApp: número pendiente',
      fill: '#25D366',
      pendingVerification: true,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      url: 'https://www.facebook.com/profile.php?id=100063731943605',
      tooltip: 'Facebook: perfil por confirmar',
      fill: '#1877F2',
      pendingVerification: true,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      url: null,
      tooltip: 'Instagram: @bmnuts_frutossecos',
      fill: 'linear-gradient(45deg, #405de6, #5b51db, #b33ab4, #c135b4, #e1306c, #fd1f1f)',
      pendingVerification: true,
    },
  ],
  locations: [
    {
      id: 'matriz',
      title: 'Matriz',
      area: 'Norte de Quito',
      address: 'Calle Zamora y pasaje A, entre la av. Brasil y la av. La Prensa, Quito.',
      description: 'Visítanos para conocer la variedad disponible y recibir atención cercana.',
      pendingVerification: false,
    },
    {
      id: 'sucursal',
      title: 'Sucursal',
      area: 'Conocoto',
      address: 'Calle Polít Lasso E4-59 y Ascázubi, Conocoto.',
      description: 'Una segunda ubicación para atenderte en el sector de Conocoto.',
      pendingVerification: true,
    },
  ],
};

export const mapsSearchUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
