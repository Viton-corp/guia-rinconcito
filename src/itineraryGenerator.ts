import { allPoints, type PointOfInterest } from './data';

export type BudgetLevel = 'eco' | 'mid' | 'premium';

export interface ItineraryConfig {
  days: number;
  budget: BudgetLevel;
  baseLocation: { lat: number; lng: number };
}

export interface ItineraryDay {
  dayNumber: number;
  morning: PointOfInterest | null;
  lunch: PointOfInterest | null;
  afternoon: PointOfInterest | null;
  dinner: PointOfInterest | null;
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
    // Free things (pueblos, naturaleza, etc) are always allowed
    return true; 
  }
  
  const price = poi.priceRange || '';
  if (budget === 'eco') return price.length <= 1; // '', '€'
  if (budget === 'mid') return price.length <= 2; // '', '€', '€€'
  return true; // Premium allows everything
}

export function generateItinerary(config: ItineraryConfig): ItineraryDay[] {
  const { days, budget, baseLocation } = config;
  
  // 1. Separate items by type
  let availablePlaces = allPoints.filter(p => 
    ['naturaleza', 'ruta', 'historia', 'pueblo', 'bañarse', 'actividad', 'bodega', 'cultura', 'bienestar'].includes(p.category) && 
    filterByBudget(p, budget)
  );
  
  let availableRestaurants = allPoints.filter(p => p.category === 'restaurante' && filterByBudget(p, budget));

  // Sort places by recommended first
  availablePlaces.sort((a, b) => (b.recommended === a.recommended ? 0 : b.recommended ? 1 : -1));
  availableRestaurants.sort((a, b) => (b.recommended === a.recommended ? 0 : b.recommended ? 1 : -1));

  const itinerary: ItineraryDay[] = [];

  for (let d = 1; d <= days; d++) {
    // 1. Pick a "Day Center" = highest priority unvisited place
    const morningPlace = availablePlaces.find(p => p) || null; // first element
    if (!morningPlace) break;
    
    // Remove from available
    availablePlaces = availablePlaces.filter(p => p.id !== morningPlace.id);

    // 2. Find closest restaurant for lunch (within 15km of morningPlace)
    // Try to find one nearby, fallback to anything if none close
    let lunchRestaurants = availableRestaurants.map(r => ({
      ...r, dist: getDistance(morningPlace.lat, morningPlace.lng, r.lat, r.lng)
    })).sort((a, b) => a.dist - b.dist);
    
    const lunchRest = lunchRestaurants.find(r => r.dist < 20) || lunchRestaurants[0] || null;
    if (lunchRest) availableRestaurants = availableRestaurants.filter(r => r.id !== lunchRest.id);

    // 3. Find afternoon activity near morning place
    let afternoonPlaces = availablePlaces.map(p => ({
      ...p, dist: getDistance(morningPlace.lat, morningPlace.lng, p.lat, p.lng)
    })).sort((a, b) => a.dist - b.dist);
    
    // Prioritize different categories for afternoon if morning was nature, maybe afternoon is pueblo
    const afternoonPlace = afternoonPlaces.find(p => p.dist < 15 && p.id !== morningPlace.id) || afternoonPlaces[0] || null;
    if (afternoonPlace) availablePlaces = availablePlaces.filter(p => p.id !== afternoonPlace.id);

    // 4. Find dinner near Base Location (config.baseLocation)
    let dinnerRestaurants = availableRestaurants.map(r => ({
      ...r, dist: getDistance(baseLocation.lat, baseLocation.lng, r.lat, r.lng)
    })).sort((a, b) => a.dist - b.dist);
    
    const dinnerRest = dinnerRestaurants.find(r => r.dist < 10) || dinnerRestaurants[0] || null;
    if (dinnerRest) availableRestaurants = availableRestaurants.filter(r => r.id !== dinnerRest.id);

    itinerary.push({
      dayNumber: d,
      morning: morningPlace,
      lunch: lunchRest,
      afternoon: afternoonPlace,
      dinner: dinnerRest
    });
  }

  return itinerary;
}
