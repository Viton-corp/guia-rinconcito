export type PlaceCategory = 'bañarse' | 'naturaleza' | 'ruta' | 'historia' | 'pueblo';
export type BusinessCategory = 'restaurante' | 'actividad' | 'bodega' | 'tienda' | 'cultura' | 'bienestar';
export type Category = PlaceCategory | BusinessCategory;
export type ProductClub = 'cicloturismo' | 'bienestar' | 'gastronomia' | 'cultura';

export interface PointOfInterest {
  id: string;
  name: string;
  category: Category;
  subcategory?: string;
  location: string;
  lat: number;
  lng: number;
  description: string;
  longDescription?: string;
  hashtag?: string;
  routeInfo?: string;
  tips?: string[];
  highlights?: string[];
  image?: string;
  externalUrl?: string;
  externalLabel?: string;
  phone?: string;
  priceRange?: '€' | '€€' | '€€€';
  rating?: number;
  recommended?: boolean; // Badge "Recomendado por El Rinconcito"
  specialties?: string[];
  productClub?: ProductClub; // Relacionado con los Clubs de Producto Turístico de la Comarca
  schedule?: string;
}

export interface GastroItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  longDescription: string;
  badge?: string;
  color: string;
  emoji: string;
  externalUrl?: string;
}

export const categoryLabels: Record<Category, string> = {
  bañarse: '💧 Agua',
  naturaleza: '🌿 Naturaleza',
  ruta: '🥾 Rutas',
  historia: '🏛️ Historia',
  pueblo: '🏘️ Pueblos',
  restaurante: '🍽️ Restaurantes',
  actividad: '🚣 Aventura',
  bodega: '🍷 Bodegas',
  tienda: '🛍️ Tiendas',
  cultura: '🎭 Cultura',
  bienestar: '💆 Bienestar',
};

export const categoryColors: Record<Category, { bg: string; text: string; marker: string }> = {
  bañarse: { bg: 'bg-blue-50', text: 'text-blue-600', marker: '#3b82f6' },
  naturaleza: { bg: 'bg-emerald-50', text: 'text-emerald-600', marker: '#10b981' },
  ruta: { bg: 'bg-orange-50', text: 'text-orange-600', marker: '#f97316' },
  historia: { bg: 'bg-amber-50', text: 'text-amber-700', marker: '#d97706' },
  pueblo: { bg: 'bg-purple-50', text: 'text-purple-600', marker: '#9333ea' },
  restaurante: { bg: 'bg-rose-50', text: 'text-rose-600', marker: '#e11d48' },
  actividad: { bg: 'bg-cyan-50', text: 'text-cyan-600', marker: '#0891b2' },
  bodega: { bg: 'bg-violet-50', text: 'text-violet-600', marker: '#7c3aed' },
  tienda: { bg: 'bg-lime-50', text: 'text-lime-600', marker: '#65a30d' },
  cultura: { bg: 'bg-indigo-50', text: 'text-indigo-600', marker: '#4f46e5' },
  bienestar: { bg: 'bg-pink-50', text: 'text-pink-600', marker: '#ec4899' },
};
