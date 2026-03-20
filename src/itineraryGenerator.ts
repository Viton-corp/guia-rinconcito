import { allPoints, type PointOfInterest } from './data';

export type BudgetLevel = 'eco' | 'mid' | 'premium';

export interface ItineraryConfig {
  days: number;
  budget: BudgetLevel;
  baseLocation: { lat: number; lng: number };
}

export interface ItinerarySlot {
  selected: PointOfInterest;
  alternatives: PointOfInterest[];
}

export interface ItineraryDay {
  dayNumber: number;
  morning: ItinerarySlot | null;
  lunch: ItinerarySlot | null;
  afternoon: ItinerarySlot | null;
  dinner: ItinerarySlot | null;
}

// Haversine formula for distance in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const p = 0.017453292519943295;    // Math.PI / 180
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function filterByBudget(poi: PointOfInterest, budget: BudgetLevel): boolean {
  if (poi.category !== 'restaurante' && poi.category !== 'actividad' && poi.category !== 'bodega') {
    return true; 
  }
  
  const price = poi.priceRange || '';
  if (budget === 'eco') return price.length <= 1;
  if (budget === 'mid') return price.length <= 2;
  return true;
}

const MAX_ALTERNATIVES = 4;

export function generateItinerary(config: ItineraryConfig): ItineraryDay[] {
  const { days, budget, baseLocation } = config;
  
  // Separate items by type
  const allPlaces = allPoints.filter(p => 
    ['naturaleza', 'ruta', 'historia', 'pueblo', 'bañarse', 'actividad', 'bodega', 'cultura', 'bienestar'].includes(p.category) && 
    filterByBudget(p, budget)
  );
  
  const allRestaurants = allPoints.filter(p => p.category === 'restaurante' && filterByBudget(p, budget));

  // Sort places by recommended first
  allPlaces.sort((a, b) => (b.recommended === a.recommended ? 0 : b.recommended ? 1 : -1));
  allRestaurants.sort((a, b) => (b.recommended === a.recommended ? 0 : b.recommended ? 1 : -1));

  const usedIds = new Set<string>();
  const itinerary: ItineraryDay[] = [];

  for (let d = 1; d <= days; d++) {
    // 1. Morning — pick highest priority unvisited place
    const morningPlace = allPlaces.find(p => !usedIds.has(p.id)) || null;
    if (!morningPlace) break;
    usedIds.add(morningPlace.id);

    // Morning alternatives: other places not yet used, sorted by recommendation
    const morningAlts = allPlaces
      .filter(p => !usedIds.has(p.id))
      .slice(0, MAX_ALTERNATIVES);

    // 2. Lunch — closest restaurant to morning place
    const lunchByDist = allRestaurants
      .filter(r => !usedIds.has(r.id))
      .map(r => ({ ...r, dist: getDistance(morningPlace.lat, morningPlace.lng, r.lat, r.lng) }))
      .sort((a, b) => a.dist - b.dist);

    const lunchRest = lunchByDist.find(r => r.dist < 20) || lunchByDist[0] || null;
    if (lunchRest) usedIds.add(lunchRest.id);

    const lunchAlts = lunchByDist
      .filter(r => r.id !== lunchRest?.id && !usedIds.has(r.id))
      .slice(0, MAX_ALTERNATIVES);

    // 3. Afternoon — near morning place, different if possible
    const afternoonByDist = allPlaces
      .filter(p => !usedIds.has(p.id))
      .map(p => ({ ...p, dist: getDistance(morningPlace.lat, morningPlace.lng, p.lat, p.lng) }))
      .sort((a, b) => a.dist - b.dist);

    const afternoonPlace = afternoonByDist.find(p => p.dist < 15) || afternoonByDist[0] || null;
    if (afternoonPlace) usedIds.add(afternoonPlace.id);

    const afternoonAlts = afternoonByDist
      .filter(p => p.id !== afternoonPlace?.id && !usedIds.has(p.id))
      .slice(0, MAX_ALTERNATIVES);

    // 4. Dinner — near base accommodation
    const dinnerByDist = allRestaurants
      .filter(r => !usedIds.has(r.id))
      .map(r => ({ ...r, dist: getDistance(baseLocation.lat, baseLocation.lng, r.lat, r.lng) }))
      .sort((a, b) => a.dist - b.dist);

    const dinnerRest = dinnerByDist.find(r => r.dist < 10) || dinnerByDist[0] || null;
    if (dinnerRest) usedIds.add(dinnerRest.id);

    const dinnerAlts = dinnerByDist
      .filter(r => r.id !== dinnerRest?.id && !usedIds.has(r.id))
      .slice(0, MAX_ALTERNATIVES);

    itinerary.push({
      dayNumber: d,
      morning: morningPlace ? { selected: morningPlace, alternatives: morningAlts } : null,
      lunch: lunchRest ? { selected: lunchRest, alternatives: lunchAlts } : null,
      afternoon: afternoonPlace ? { selected: afternoonPlace, alternatives: afternoonAlts } : null,
      dinner: dinnerRest ? { selected: dinnerRest, alternatives: dinnerAlts } : null,
    });
  }

  return itinerary;
}

