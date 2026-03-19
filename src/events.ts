export interface EagoraEvent {
  id: string;
  title: string;
  dateStr: string;
  timeStr?: string;
  location: string;
  description: string;
  imageUrl?: string;
  link?: string;
}

// ─── EÁGORA MOCK DATA ──────────────────────────────────────────
// En el futuro, estos datos vendrán de la API de eÁgora o RSS de la Comarca
export const comarcaEvents: EagoraEvent[] = [
  {
    id: "eagora_1",
    title: "Taller Cocreación Experiencias Turísticas",
    dateStr: "23 de Marzo",
    timeStr: "10:30 - 12:30",
    location: "Valderrobres (Av. Cortes Aragón 17, 2ª planta)",
    description: "Taller para clubes de producto: cicloturismo, bienestar, gastronomía y paisaje cultural. Organizado por Turismo Comarca del Matarraña.",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80",
    link: "mailto:info@matarranya.org"
  },
  {
    id: "eagora_2",
    title: "Mercado Local de Productos de Proximidad",
    dateStr: "28 de Marzo",
    timeStr: "9:00 - 14:00",
    location: "Plaza de España, Calaceite",
    description: "Venta directa de productores del Matarraña: aceites (AOVE), vinos, quesos y dulces artesanales. ¡Apoya el KM0!",
    imageUrl: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&q=80",
    link: "https://www.comarcamatarranya.es/turismo"
  },
  {
    id: "eagora_3",
    title: "Ruta Cicloturista Guiada Vía Verde",
    dateStr: "5 de Abril",
    timeStr: "10:00",
    location: "Antigua Estación de Cretas",
    description: "Ruta familiar guiada por la Vía Verde Val de Zafán para conocer los túneles y el paisaje natural.",
    imageUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80",
    link: "https://matarrañaventura.com"
  }
];
