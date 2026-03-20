import { useState, useMemo, memo, lazy, Suspense, useCallback, useEffect } from 'react';
import { MapPin, List, Utensils, Info, ChevronRight, Droplets, TreePine, Footprints, Landmark, Building2, ArrowLeft, MapIcon, Navigation, Hash, Lightbulb, Star, ExternalLink, MessageCircle, Phone, Globe, UtensilsCrossed, Search, Award, Compass, Wine, ShoppingBag, Palette, Heart, X, Calendar, Activity, BookOpen, Coffee, Sparkles, Route, ShieldAlert } from 'lucide-react';
import { allPoints, places, restaurants, activities, bodegas, shops, culturalSpaces, wellness, gastroItems, categoryColors, categoryLabels, type PointOfInterest, type GastroItem, type Category } from './data';
import { type ProductClub } from './types';
import { comarcaEvents } from './events';
import { generateItinerary, type BudgetLevel, type ItineraryDay } from './itineraryGenerator';
import { accommodations, type Accommodation } from './accommodations';
import { APP_CONFIG } from './config';
import QRCode from 'react-qr-code';

// Lazy-load heavy map components
const MapContainer = lazy(() => import('react-leaflet').then(m => ({ default: m.MapContainer })));
const TileLayer = lazy(() => import('react-leaflet').then(m => ({ default: m.TileLayer })));
const CircleMarker = lazy(() => import('react-leaflet').then(m => ({ default: m.CircleMarker })));
const Popup = lazy(() => import('react-leaflet').then(m => ({ default: m.Popup })));

// ─── INIT URL PARSER ─────────────────────────────────────────
const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
const hostParam = urlParams.get('host');
const adminParam = urlParams.get('admin');

type Tab = 'mapa' | 'explorar' | 'itinerario' | 'gastro' | 'info';

// Pre-compute constants outside component
const allCats: Category[] = ['bañarse','naturaleza','ruta','historia','pueblo','restaurante','actividad','bodega','tienda','cultura','bienestar'];
const competitiveCategories: Category[] = ['restaurante', 'actividad', 'bodega', 'tienda', 'bienestar'];
const catCounts = Object.fromEntries(allCats.map(c => [c, allPoints.filter(p => p.category === c).length])) as Record<Category, number>;

const catIcons: Record<Category, React.ReactNode> = {
  bañarse: <Droplets size={18}/>, naturaleza: <TreePine size={18}/>, ruta: <Footprints size={18}/>,
  historia: <Landmark size={18}/>, pueblo: <Building2 size={18}/>, restaurante: <Utensils size={18}/>,
  actividad: <Compass size={18}/>, bodega: <Wine size={18}/>, tienda: <ShoppingBag size={18}/>,
  cultura: <Palette size={18}/>, bienestar: <Heart size={18}/>,
};

const clubLabels: Record<ProductClub, string> = {
  cicloturismo: '🚴 Cicloturismo', bienestar: '💆 Bienestar', gastronomia: '🍷 Gastronomía', cultura: '🏛️ Paisaje Cultural'
};

// ─── DETAIL VIEW ─────────────────────────────────────────────
function Detail({ item, onBack }: { item: PointOfInterest; onBack: () => void }) {
  const c = categoryColors[item.category];
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      {item.image ? (
        <div className="relative h-[260px] shrink-0">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
          <button onClick={onBack} className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30"><ArrowLeft size={20} className="text-white"/></button>
          <div className="flex flex-col gap-1.5 absolute top-4 right-4 items-end z-10">
            {item.recommended && <div className="bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg"><Award size={12}/> RECOMENDADO</div>}
            {item.productClub && <div className="bg-[#1b4332] text-[#d8cba1] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-[#d8cba1]/30">{clubLabels[item.productClub]}</div>}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{item.subcategory || item.category}</span>
            <h1 className="text-2xl font-black text-white mt-0.5 leading-tight">{item.name}</h1>
            <p className="text-white/70 text-sm mt-1 flex items-center gap-1"><MapPin size={12}/> {item.location}</p>
          </div>
        </div>
      ) : (
        <div className={`relative ${c.bg} min-h-[180px] flex items-end p-5 shrink-0`}>
          <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"><ArrowLeft size={20} className="text-gray-800"/></button>
          <div className="flex flex-col gap-1.5 absolute top-4 right-4 items-end">
            {item.recommended && <div className="bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow"><Award size={12}/> RECOMENDADO</div>}
            {item.productClub && <div className="bg-[#1b4332] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow border border-white/20">{clubLabels[item.productClub]}</div>}
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${c.text} opacity-60`}>{item.subcategory || item.category}</span>
            <h1 className="text-2xl font-black text-gray-900 mt-0.5">{item.name}</h1>
            <p className="text-gray-500 text-sm mt-1 flex items-center gap-1"><MapPin size={12}/> {item.location}</p>
          </div>
        </div>
      )}
      <div className="flex-1 p-5 flex flex-col gap-4">
        {/* Rating + Price */}
        {(item.rating || item.priceRange) && (
          <div className="flex items-center gap-3">
            {item.rating && <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm font-bold"><Star size={14} className="fill-amber-500 text-amber-500"/> {item.rating}</span>}
            {item.priceRange && <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-bold">{item.priceRange}</span>}
          </div>
        )}
        {/* Route info */}
        {item.routeInfo && (
          <div className="flex items-center gap-3 bg-orange-50 p-3.5 rounded-xl border border-orange-100">
            <Footprints size={16} className="text-orange-600 shrink-0"/>
            <p className="font-semibold text-gray-900 text-sm">{item.routeInfo}</p>
          </div>
        )}
        {/* Description */}
        <p className="text-gray-600 leading-relaxed text-[15px]">{item.longDescription || item.description}</p>
        {/* Specialties */}
        {item.specialties && item.specialties.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.specialties.map((s,i) => <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{s}</span>)}
          </div>
        )}
        {/* Highlights */}
        {item.highlights && item.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.highlights.map((h,i) => <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{h}</span>)}
          </div>
        )}
        {/* Tips */}
        {item.tips && item.tips.length > 0 && (
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200/50 rounded-xl p-4">
            <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2 text-sm"><Lightbulb size={14}/> Consejos del Rinconcito</h3>
            <ul className="flex flex-col gap-2">{item.tips.map((t,i) => <li key={i} className="text-amber-900/80 text-sm flex gap-2 items-start"><span className="text-amber-400 shrink-0">›</span>{t}</li>)}</ul>
          </div>
        )}
        {/* Schedule */}
        {item.schedule && <p className="text-gray-400 text-xs italic">ℹ️ {item.schedule}</p>}
        {/* Phone */}
        {item.phone && (
          <a href={`tel:${item.phone}`} className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-3.5 rounded-xl font-semibold text-sm border border-green-100">
            <Phone size={16}/> Llamar: {item.phone}
          </a>
        )}
        {/* External link */}
        {item.externalUrl && (
          <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-3.5 rounded-xl font-semibold text-sm border border-indigo-100">
            <Globe size={16}/> {item.externalLabel || 'Más información'}
          </a>
        )}
        {/* Google Maps */}
        <a href={`https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3.5 rounded-xl font-semibold text-sm border border-blue-100">
          <Navigation size={16}/> Cómo llegar
        </a>
        {item.hashtag && <p className="text-gray-300 text-xs flex items-center gap-1 mt-1 pb-4"><Hash size={12}/>{item.hashtag}</p>}
      </div>
    </div>
  );
}

// ─── GASTRO DETAIL ───────────────────────────────────────────
function GastroDetail({ item, onBack }: { item: GastroItem; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-white">
      <div className={`relative ${item.color} min-h-[180px] flex flex-col items-center justify-center p-6 shrink-0`}>
        <button onClick={onBack} className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md"><ArrowLeft size={20}/></button>
        <span className="text-6xl mb-2">{item.emoji}</span>
        {item.badge && <span className="bg-white/80 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">{item.badge}</span>}
      </div>
      <div className="p-5 flex flex-col gap-4">
        <h1 className="text-2xl font-black text-gray-900">{item.name}</h1>
        <p className="text-gray-500 font-medium text-sm">{item.subtitle}</p>
        <p className="text-gray-600 leading-relaxed">{item.longDescription}</p>
        {item.externalUrl && <a href={item.externalUrl} target="_blank" className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-3.5 rounded-xl font-semibold text-sm border border-indigo-100"><Globe size={16}/> Más info</a>}
      </div>
    </div>
  );
}

// ─── SECTION COMPONENT (memoized) ───────────────────────────
const Section = memo(function Section({ title, icon, items, onSelect }: { title: string; icon: React.ReactNode; items: PointOfInterest[]; onSelect: (p: PointOfInterest) => void }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-5">
      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2 px-4 mb-2.5">{icon} {title} <span className="text-gray-400">({items.length})</span></h3>
      <div className="flex flex-col gap-2 px-3">
        {items.map(p => {
          const c = categoryColors[p.category];
          return (
            <button key={p.id} onClick={() => onSelect(p)} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 text-left w-full active:scale-[0.98] transition-transform">
              {p.image ? <img src={p.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" loading="lazy"/>
                : <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${c.bg} ${c.text}`}>{catIcons[p.category]}</div>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{p.name}</h4>
                  {p.recommended && <Award size={12} className="text-amber-500 shrink-0"/>}
                  {p.rating && <span className="text-amber-600 text-[11px] font-bold flex items-center gap-0.5 shrink-0"><Star size={10} className="fill-amber-500"/> {p.rating}</span>}
                </div>
                <p className="text-gray-400 text-xs truncate mt-0.5">{p.location}{p.subcategory ? ` · ${p.subcategory}` : ''}</p>
                {p.priceRange && <span className="text-green-600 text-[11px] font-bold">{p.priceRange}</span>}
                {p.routeInfo && <p className="text-orange-500 text-[11px] font-medium truncate">{p.routeInfo}</p>}
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0"/>
            </button>
          );
        })}
      </div>
    </div>
  );
});

// ─── EÁGORA AGENDA CAROUSEL ─────────────────────────────────
const EagoraAgenda = memo(function EagoraAgenda() {
  return (
    <div className="mb-6 pt-2">
      <div className="px-4 mb-3 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2"><Calendar size={14} className="text-[#1b4332]"/> Agenda Municipal</h3>
        <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full tracking-widest uppercase">eÁgora</span>
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory scrollbar-hide">
        {comarcaEvents.map(ev => (
          <a key={ev.id} href={ev.link || '#'} target="_blank" className="w-[260px] shrink-0 snap-center bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col active:scale-95 transition-transform block">
            {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} className="w-full h-28 object-cover"/>}
            <div className="p-3.5 flex flex-col flex-1">
              <span className="text-[10px] font-bold text-red-600 mb-1 tracking-wider uppercase">{ev.dateStr} {ev.timeStr && `· ${ev.timeStr}`}</span>
              <h4 className="font-extrabold text-sm text-gray-900 leading-tight mb-1">{ev.title}</h4>
              <p className="text-gray-500 text-[11px] flex items-center gap-1 mb-2.5 truncate"><MapPin size={10}/> {ev.location}</p>
              <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2 mt-auto">{ev.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
});

// ─── CLUBS DE PRODUCTO CAROUSEL ─────────────────────────────
const ProductClubs = memo(function ProductClubs({ onSelectClub }: { onSelectClub: (club: ProductClub) => void }) {
  const clubs: { id: ProductClub; name: string; icon: any; color: string }[] = [
    { id: 'cicloturismo', name: 'Cicloturismo', icon: <Activity size={18}/>, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'gastronomia', name: 'Gastronomía', icon: <Utensils size={18}/>, color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 'cultura', name: 'Paisaje Cultural', icon: <BookOpen size={18}/>, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'bienestar', name: 'Bienestar', icon: <Coffee size={18}/>, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  ];

  return (
    <div className="px-4 mb-6">
      <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><Award size={14} className="text-amber-500"/> Clubs de Producto Turismo Matarraña</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {clubs.map(c => (
          <button key={c.id} onClick={() => onSelectClub(c.id)} className={`flex items-center gap-2.5 p-3 rounded-xl border ${c.color} active:scale-95 transition-transform text-left bg-gradient-to-br from-white to-transparent`}>
            <div className="shrink-0">{c.icon}</div>
            <span className="font-bold text-[11px] leading-tight flex-1">{c.name}</span>
            <ChevronRight size={14} className="opacity-50"/>
          </button>
        ))}
      </div>
    </div>
  );
});

// ─── ITINERARY GENERATOR WIZARD & TIMELINE ──────────────────
const ItineraryTab = memo(function ItineraryTab({ onSelectPoi, defaultAccommodationId }: { onSelectPoi: (p: PointOfInterest) => void; defaultAccommodationId?: string }) {
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<BudgetLevel>('mid');
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation>(
    accommodations.find(a => a.id === defaultAccommodationId) || accommodations[0]
  );
  const [result, setResult] = useState<ItineraryDay[] | null>(null);

  const handleGenerate = () => {
    const itinerary = generateItinerary({
      days,
      budget,
      baseLocation: { lat: selectedAccommodation.lat, lng: selectedAccommodation.lng },
    });
    setResult(itinerary);
  };

  const [editingSlot, setEditingSlot] = useState<{ dayIndex: number; slotKey: 'morning'|'lunch'|'afternoon'|'dinner' } | null>(null);

  const handleSwap = (dayIndex: number, slotKey: 'morning'|'lunch'|'afternoon'|'dinner', newPoi: PointOfInterest) => {
    if (!result) return;
    const updated = [...result];
    const slot = updated[dayIndex][slotKey];
    if (!slot) return;
    const oldSelected = slot.selected;
    slot.selected = newPoi;
    slot.alternatives = [oldSelected, ...slot.alternatives.filter(a => a.id !== newPoi.id)].slice(0, 4);
    setResult(updated);
    setEditingSlot(null);
  };

  if (result) {
    const editSlot = editingSlot ? result[editingSlot.dayIndex]?.[editingSlot.slotKey] : null;

    return (
      <div className="h-full overflow-y-auto bg-gray-50 pb-8">
        <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] p-6 text-white sticky top-0 z-20 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setResult(null)} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><ArrowLeft size={16}/></button>
            <span className="text-xs font-bold uppercase tracking-widest text-[#d8cba1]">Tu Viaje Ideal</span>
            <div className="w-8"></div>
          </div>
          <h2 className="text-2xl font-black">{days} Días en el Matarraña</h2>
          <p className="text-white/70 text-sm mt-1 flex items-center gap-1"><MapPin size={12}/> Base: {selectedAccommodation.name} ({selectedAccommodation.location})</p>
          <p className="text-[10px] text-white/50 mt-1">Toca 🔄 en cada actividad para ver más opciones</p>
        </div>
        
        <div className="p-4 flex flex-col gap-6">
          {result.map((day, dayIdx) => (
            <div key={dayIdx} className="relative">
              <div className="absolute top-8 bottom-0 left-[15px] w-px bg-emerald-200"></div>
              
              <h3 className="flex items-center gap-3 font-black text-emerald-900 mb-4 bg-emerald-50 w-max px-4 py-1.5 rounded-full border border-emerald-100 shadow-sm relative z-10">
                <span className="bg-[#1b4332] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">D{day.dayNumber}</span>
                Día {day.dayNumber}
              </h3>

              <div className="flex flex-col gap-4 pl-10 relative z-10">
                {/* MORNING */}
                {day.morning && (
                  <div className="relative">
                    <div className="absolute top-4 -left-[31px] w-3 h-3 rounded-full border-2 border-emerald-400 bg-white"></div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mañana</span>
                      {day.morning.alternatives.length > 0 && <button onClick={() => setEditingSlot({ dayIndex: dayIdx, slotKey: 'morning' })} className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1 active:scale-95">🔄 Cambiar</button>}
                    </div>
                    <button onClick={() => onSelectPoi(day.morning!.selected)} className="bg-white border border-emerald-100 shadow-sm rounded-xl p-3 flex gap-3 text-left w-full active:scale-95 transition-transform">
                      {day.morning.selected.image ? <img src={day.morning.selected.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0"/> : <div className="w-16 h-16 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0"><MapPin size={24}/></div>}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm">{day.morning.selected.name}</h4>
                        <p className="text-gray-500 text-[11px] line-clamp-2 mt-0.5">{day.morning.selected.description}</p>
                      </div>
                    </button>
                  </div>
                )}
                
                {/* LUNCH */}
                {day.lunch && (
                  <div className="relative">
                    <div className="absolute top-4 -left-[31px] w-3 h-3 rounded-full border-2 border-rose-400 bg-white"></div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Comida</span>
                      {day.lunch.alternatives.length > 0 && <button onClick={() => setEditingSlot({ dayIndex: dayIdx, slotKey: 'lunch' })} className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 flex items-center gap-1 active:scale-95">🔄 Cambiar</button>}
                    </div>
                    <button onClick={() => onSelectPoi(day.lunch!.selected)} className="bg-rose-50 border border-rose-100/50 rounded-xl p-3 flex gap-3 text-left w-full active:scale-95 transition-transform">
                      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center shrink-0"><Utensils size={16}/></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-rose-900 text-sm truncate">{day.lunch.selected.name}</h4>
                        <p className="text-rose-700/70 text-[11px]">{day.lunch.selected.priceRange} · {day.lunch.selected.location}</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* AFTERNOON */}
                {day.afternoon && (
                  <div className="relative">
                    <div className="absolute top-4 -left-[31px] w-3 h-3 rounded-full border-2 border-orange-400 bg-white"></div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tarde</span>
                      {day.afternoon.alternatives.length > 0 && <button onClick={() => setEditingSlot({ dayIndex: dayIdx, slotKey: 'afternoon' })} className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 flex items-center gap-1 active:scale-95">🔄 Cambiar</button>}
                    </div>
                    <button onClick={() => onSelectPoi(day.afternoon!.selected)} className="bg-white border border-orange-100 shadow-sm rounded-xl p-3 flex gap-3 text-left w-full active:scale-95 transition-transform">
                      {day.afternoon.selected.image ? <img src={day.afternoon.selected.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0"/> : <div className="w-16 h-16 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0"><MapPin size={24}/></div>}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm">{day.afternoon.selected.name}</h4>
                        <p className="text-gray-500 text-[11px] line-clamp-2 mt-0.5">{day.afternoon.selected.description}</p>
                      </div>
                    </button>
                  </div>
                )}

                {/* DINNER */}
                {day.dinner && (
                  <div className="relative">
                    <div className="absolute top-4 -left-[31px] w-3 h-3 rounded-full border-2 border-indigo-400 bg-slate-800"></div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cena (Cerca de {selectedAccommodation.name})</span>
                      {day.dinner.alternatives.length > 0 && <button onClick={() => setEditingSlot({ dayIndex: dayIdx, slotKey: 'dinner' })} className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1 active:scale-95">🔄 Cambiar</button>}
                    </div>
                    <button onClick={() => onSelectPoi(day.dinner!.selected)} className="bg-indigo-50 border border-indigo-100/50 rounded-xl p-3 flex gap-3 text-left w-full active:scale-95 transition-transform">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center shrink-0"><Wine size={16}/></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-indigo-900 text-sm truncate">{day.dinner.selected.name}</h4>
                        <p className="text-indigo-700/70 text-[11px]">{day.dinner.selected.priceRange} · {day.dinner.selected.location}</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button className="mt-4 bg-[#1b4332] text-white font-bold py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform w-full">
            <Sparkles size={16} className="text-[#d8cba1]"/> ¡Guardar Mi Itinerario!
          </button>
        </div>

        {/* ── SWAP BOTTOM SHEET ── */}
        {editingSlot && editSlot && (
          <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingSlot(null)}></div>
            <div className="relative bg-white rounded-t-3xl p-5 pb-8 shadow-2xl max-h-[70vh] overflow-y-auto animate-[slideUp_0.2s_ease-out]">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-black text-gray-900 text-base mb-1">🔄 Elegir alternativa</h3>
              <p className="text-gray-500 text-xs mb-4">Toca una opción para intercambiarla</p>
              <div className="flex flex-col gap-2.5">
                {editSlot.alternatives.map((alt) => (
                  <button key={alt.id} onClick={() => handleSwap(editingSlot.dayIndex, editingSlot.slotKey, alt)} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex gap-3 text-left w-full active:scale-[0.98] transition-transform hover:bg-emerald-50 hover:border-emerald-200">
                    {alt.image ? <img src={alt.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0"/> : <div className="w-14 h-14 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0"><MapPin size={20}/></div>}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">{alt.name}</h4>
                      <p className="text-gray-500 text-[11px] line-clamp-2 mt-0.5">{alt.description}</p>
                      {alt.priceRange && <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1 inline-block">{alt.priceRange} · {alt.location}</span>}
                    </div>
                    <ChevronRight size={14} className="text-gray-300 shrink-0 self-center"/>
                  </button>
                ))}
              </div>
              <button onClick={() => setEditingSlot(null)} className="mt-4 w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl active:scale-95 transition-transform">Cancelar</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-12 bg-gray-50 flex flex-col">
      <div className="bg-[#1b4332] pt-8 pb-12 px-6 rounded-b-[40px] shadow-lg shrink-0 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-[#d8cba1]/30 shadow-xl backdrop-blur-sm">
          <Sparkles size={32} className="text-[#d8cba1]"/>
        </div>
        <h2 className="text-2xl font-black text-white relative z-10 leading-tight mb-2">Creador Mágico<br/>de Itinerarios</h2>
        <p className="text-white/70 text-sm max-w-[250px] mx-auto relative z-10">Dinos tu plan y diseñaremos una ruta perfecta desde tu alojamiento.</p>
      </div>

      <div className="flex-1 px-5 -mt-6 relative z-20">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col gap-6">
          
          {/* ALOJAMIENTO */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin size={12} className="text-[#1b4332]"/> ¿Dónde te alojas?</label>
            <select
              className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 text-amber-900 font-bold outline-none shadow-sm appearance-none cursor-pointer text-sm"
              value={selectedAccommodation.id}
              onChange={(e) => {
                const acc = accommodations.find(a => a.id === e.target.value);
                if (acc) setSelectedAccommodation(acc);
              }}
            >
              {accommodations.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} — {acc.location}</option>
              ))}
            </select>
            <p className="text-[10px] text-amber-800/60 mt-2 leading-snug px-1">📍 Las cenas se buscarán cerca de tu alojamiento para que no tengas que conducir lejos.</p>
          </div>

          {/* DURACIÓN */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">¿Cuántos días vienes?</label>
            <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2 border border-gray-100">
              <button onClick={() => setDays(Math.max(1, days - 1))} className="w-10 h-10 bg-white rounded-xl shadow-sm font-bold text-gray-900 text-xl flex items-center justify-center">-</button>
              <span className="font-black text-xl text-[#1b4332]">{days} <span className="text-sm font-medium text-gray-500">días</span></span>
              <button onClick={() => setDays(Math.min(7, days + 1))} className="w-10 h-10 bg-white rounded-xl shadow-sm font-bold text-gray-900 text-xl flex items-center justify-center">+</button>
            </div>
          </div>

          {/* PRESUPUESTO */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Estilo de Viaje</label>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setBudget('eco')} className={`p-3 rounded-2xl text-center border-2 transition-all ${budget === 'eco' ? 'border-[#1b4332] bg-[#1b4332]/5' : 'border-gray-100 bg-white'}`}>
                <span className="block text-xl mb-1">🎒</span>
                <span className={`text-[10px] font-bold ${budget === 'eco' ? 'text-[#1b4332]' : 'text-gray-500'}`}>Low Cost</span>
              </button>
              <button onClick={() => setBudget('mid')} className={`p-3 rounded-2xl text-center border-2 transition-all ${budget === 'mid' ? 'border-[#1b4332] bg-[#1b4332]/5' : 'border-gray-100 bg-white'}`}>
                <span className="block text-xl mb-1">🚗</span>
                <span className={`text-[10px] font-bold ${budget === 'mid' ? 'text-[#1b4332]' : 'text-gray-500'}`}>Estándar</span>
              </button>
              <button onClick={() => setBudget('premium')} className={`p-3 rounded-2xl text-center border-2 transition-all ${budget === 'premium' ? 'border-[#1b4332] bg-[#1b4332]/5' : 'border-gray-100 bg-white'}`}>
                <span className="block text-xl mb-1">🥂</span>
                <span className={`text-[10px] font-bold ${budget === 'premium' ? 'text-[#1b4332]' : 'text-gray-500'}`}>Capricho</span>
              </button>
            </div>
          </div>

          <button onClick={handleGenerate} className="mt-2 bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white font-black py-4 rounded-2xl shadow-xl shadow-[#1b4332]/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
            <Sparkles size={18} className="text-[#d8cba1] animate-pulse"/> Generar Mi Ruta
          </button>
        </div>
      </div>
    </div>
  );
});

// ─── PORTAL PROFESIONAL ─────────────────────────────────────
const ProfessionalPortal = memo(function ProfessionalPortal({ onClose }: { onClose: () => void }) {
  const [selectedHostId, setSelectedHostId] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('rinconcito_pro_host') || '';
    return '';
  });
  
  const clients = useMemo(() => allPoints.filter(p => competitiveCategories.includes(p.category)).sort((a,b) => a.name.localeCompare(b.name)), []);
  
  const selectedBusiness = useMemo(() => allPoints.find(p => p.id === selectedHostId), [selectedHostId]);
  
  const qrUrl = typeof window !== 'undefined' ? window.location.origin + "/?host=" + selectedHostId : '';

  const handleSave = () => {
    if (typeof window !== 'undefined' && selectedHostId) {
      localStorage.setItem('rinconcito_pro_host', selectedHostId);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-[9999] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] px-5 py-6 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-white flex items-center gap-2"><ShieldAlert size={24} className="text-[#d8cba1]"/> Portal Profesional</h2>
          <button onClick={onClose} className="p-2 bg-white/20 rounded-full backdrop-blur-sm"><X size={20} className="text-white"/></button>
        </div>
        <p className="text-white/70 text-sm leading-relaxed">Configura tu guía personalizada. Tus clientes verán la guía <strong className="text-[#d8cba1]">sin competencia directa</strong> de tu mismo sector.</p>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-5">
        {/* Step 1: Selecciona tu negocio */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-7 h-7 bg-[#1b4332] text-white rounded-full flex items-center justify-center text-xs font-black">1</span>
            <h3 className="font-bold text-gray-900 text-sm">¿Cuál es tu negocio?</h3>
          </div>
          <select 
            className="w-full bg-gray-50 border-2 border-emerald-200 rounded-xl p-3.5 text-emerald-900 font-bold outline-none shadow-sm text-sm"
            onChange={(e) => setSelectedHostId(e.target.value)}
            value={selectedHostId}
          >
            <option value="" disabled>Elige tu negocio...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {categoryLabels[c.category]}</option>
            ))}
          </select>
        </div>

        {/* Step 2: Resumen de lo que pasa */}
        {selectedBusiness && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-7 h-7 bg-[#1b4332] text-white rounded-full flex items-center justify-center text-xs font-black">2</span>
              <h3 className="font-bold text-gray-900 text-sm">Así funciona para ti</h3>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 mb-4">
              <p className="text-sm text-emerald-900 font-medium mb-2">Tu negocio: <strong>{selectedBusiness.name}</strong></p>
              <p className="text-sm text-emerald-800/70 mb-1">Categoría: <strong>{categoryLabels[selectedBusiness.category]}</strong></p>
              <p className="text-xs text-emerald-700/60 mt-2 leading-relaxed">Cuando tus clientes escaneen tu QR, verán toda la guía <strong>excepto otros {categoryLabels[selectedBusiness.category].toLowerCase()}</strong>. Tu negocio aparecerá destacado.</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <p className="text-xs text-amber-800 flex items-center gap-1.5"><Lightbulb size={12} className="text-amber-500 shrink-0"/> La guía muestra todas las demás categorías (naturaleza, rutas, pueblos, cultura...) para que tus clientes disfruten al máximo.</p>
            </div>
          </div>
        )}

        {/* Step 3: QR */}
        {selectedHostId && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-5 self-start">
              <span className="w-7 h-7 bg-[#1b4332] text-white rounded-full flex items-center justify-center text-xs font-black">3</span>
              <h3 className="font-bold text-gray-900 text-sm">Tu Código QR Personalizado</h3>
            </div>
            <div className="bg-white p-4 rounded-2xl border-4 border-[#1b4332] shadow-sm mb-4">
              <QRCode value={qrUrl} size={180} level="H" />
            </div>
            <p className="text-[10px] text-gray-400 mb-4 break-all bg-gray-50 p-2.5 rounded-lg w-full font-mono text-center">{qrUrl}</p>
            <div className="flex flex-col gap-2.5 w-full">
              <button onClick={() => { handleSave(); window.open(qrUrl, '_blank'); }} className="w-full bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <ExternalLink size={16} className="text-[#d8cba1]"/> Probar Mi Enlace
              </button>
              <button onClick={handleSave} className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <Sparkles size={16}/> Guardar Configuración
              </button>
            </div>
          </div>
        )}

        {/* Tip: Imprime el QR */}
        {selectedHostId && (
          <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] rounded-2xl p-5 text-white">
            <h3 className="font-bold text-[#d8cba1] text-xs uppercase tracking-wider mb-3">💡 Ideas para tu negocio</h3>
            <ul className="flex flex-col gap-2 text-white/90 text-sm">
              <li>📱 Imprime el QR y ponlo en recepción o en las mesas</li>
              <li>📧 Envíalo por WhatsApp a tus clientes al hacer la reserva</li>
              <li>🌐 Ponlo en tu web como "Guía del Matarraña"</li>
              <li>🎯 Tus clientes tendrán una guía exclusiva sin tu competencia</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── MAIN APP ────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState<Tab>('explorar');
  const [mapReady, setMapReady] = useState(false);
  const [detail, setDetail] = useState<PointOfInterest | null>(null);
  const [gastroDetail, setGastroDetail] = useState<GastroItem | null>(null);
  const [filter, setFilter] = useState<Category | ProductClub | 'all'>('all');
  const [search, setSearch] = useState('');

  // URL B2B State
  const [host, setHost] = useState<PointOfInterest | null>(null);
  const [isAdmin, setIsAdmin] = useState(adminParam === 'true');

  useEffect(() => {
    if (hostParam) {
      const found = allPoints.find(p => p.id === hostParam);
      if (found) {
        setHost(found);
        APP_CONFIG.baseAccommodation = {
          name: found.name,
          lat: found.lat,
          lng: found.lng,
          location: found.location
        };
      }
    }
  }, []);

  const isCompetitor = useCallback((poi: PointOfInterest) => {
    if (!host) return false;
    if (poi.id === host.id) return false; // El propio host nunca se oculta a sí mismo
    if (competitiveCategories.includes(host.category)) {
      return poi.category === host.category; // Oculta a todos los demás de la misma categoría comercial
    }
    return false;
  }, [host]);

  const visiblePoints = useMemo(() => allPoints.filter(p => !isCompetitor(p)), [isCompetitor]);

  const filtered = useMemo(() => {
    let items = visiblePoints;
    if (filter !== 'all') {
      if (['cicloturismo','bienestar','gastronomia','cultura'].includes(filter)) {
        items = visiblePoints.filter(p => p.productClub === filter);
      } else {
        items = visiblePoints.filter(p => p.category === filter as Category);
      }
    }
    
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(p => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return items;
  }, [filter, search, visiblePoints]);

  if (isAdmin) {
    return <ProfessionalPortal onClose={() => setIsAdmin(false)} />;
  }

  const handleSetDetail = useCallback((p: PointOfInterest) => setDetail(p), []);

  if (detail) return <div className="h-screen w-full"><Detail item={detail} onBack={() => setDetail(null)}/></div>;
  if (gastroDetail) return <div className="h-screen w-full"><GastroDetail item={gastroDetail} onBack={() => setGastroDetail(null)}/></div>;

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">
      {/* HEADER */}
      <header className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] shadow-lg shrink-0">
        <div>
          <h1 className="text-lg font-black text-[#d8cba1] tracking-wide">EL RINCONCITO</h1>
          <p className="text-[10px] text-white/50 font-medium tracking-wider uppercase">Guía Interactiva Matarraña</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-white/10 text-[#d8cba1] text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10">{allPoints.length} lugares</span>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">

        {/* ─── MAPA (persistent, hidden/shown via CSS) ──── */}
        <div className="absolute inset-0 z-0" style={{ display: tab === 'mapa' ? 'block' : 'none' }}>
          {/* Search bar over map */}
          <div className="absolute top-3 left-3 right-3 z-[400]">
            <div className="relative mb-2">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar lugar, restaurante, actividad..." className="w-full pl-9 pr-9 py-2.5 bg-white/95 backdrop-blur-md rounded-xl text-sm shadow-lg border border-white/50 outline-none focus:ring-2 focus:ring-[#1b4332]/30"/>
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={16} className="text-gray-400"/></button>}
            </div>
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-1.5 w-max">
                <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md backdrop-blur-md whitespace-nowrap ${filter === 'all' ? 'bg-[#1b4332] text-white' : 'bg-white/95 text-gray-700'}`}>
                  Todos ({allPoints.length})
                </button>
                {allCats.map(cat => {
                  if (catCounts[cat] === 0) return null;
                  return <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold shadow-md backdrop-blur-md whitespace-nowrap ${filter === cat ? 'bg-[#1b4332] text-white' : 'bg-white/95 text-gray-700'}`}>{categoryLabels[cat]} ({catCounts[cat]})</button>;
                })}
              </div>
            </div>
          </div>

          {(mapReady || tab === 'mapa') && (
            <Suspense fallback={<div className="flex items-center justify-center h-full bg-gray-100"><p className="text-gray-500 font-medium animate-pulse">Cargando mapa...</p></div>}>
              <MapContainer center={[40.87, 0.12]} zoom={10} className="w-full h-full" zoomControl={false} whenReady={() => setMapReady(true)}>
                <TileLayer attribution='&copy; OSM' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"/>
                {filtered.map(p => (
                  <CircleMarker key={p.id} center={[p.lat, p.lng]} radius={7} fillColor={categoryColors[p.category].marker} color="#fff" weight={2} fillOpacity={0.9}>
                    <Popup>
                      <div className="p-1 min-w-[200px]">
                        {p.image && <img src={p.image} alt="" className="w-full h-24 object-cover rounded-lg mb-2" loading="lazy"/>}
                        <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${categoryColors[p.category].bg} ${categoryColors[p.category].text}`}>{p.subcategory || categoryLabels[p.category]}</span>
                        <h3 className="font-bold text-gray-900 mt-1.5 mb-0.5 text-sm leading-tight">{p.name}</h3>
                        {p.recommended && <span className="text-amber-600 text-[10px] font-bold flex items-center gap-0.5 mb-1"><Award size={10}/> Recomendado</span>}
                        <p className="text-xs text-gray-500 mb-1">{p.location}</p>
                        {p.rating && <span className="text-amber-600 text-xs font-bold mr-2">★ {p.rating}</span>}
                        {p.priceRange && <span className="text-green-600 text-xs font-bold">{p.priceRange}</span>}
                        <button onClick={() => setDetail(p)} className="mt-2 px-3 py-2 bg-[#1b4332] text-white rounded-lg text-xs font-semibold w-full flex items-center justify-center gap-1">Ver detalle <ChevronRight size={12}/></button>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </Suspense>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/40 flex gap-2 items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#1b4332] animate-pulse"></div>
            <span className="text-sm font-bold text-gray-800">{filtered.length} Lugares</span>
          </div>
        </div>

        {/* ─── EXPLORAR ──────────────────────────────────── */}
        {tab === 'explorar' && (
          <div className="h-full overflow-y-auto pb-8">
            {/* Search */}
            <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-md p-3 border-b border-gray-100">
              <div className="relative mb-2">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-9 pr-9 py-2.5 bg-white rounded-xl text-sm border border-gray-200 outline-none focus:ring-2 focus:ring-[#1b4332]/20"/>
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X size={16} className="text-gray-400"/></button>}
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-1.5 w-max">
                  <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${filter === 'all' ? 'bg-[#1b4332] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>Todos</button>
                  {allCats.map(cat => {
                    if (catCounts[cat] === 0) return null;
                    return <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap ${filter === cat ? 'bg-[#1b4332] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>{categoryLabels[cat]}</button>;
                  })}
                </div>
              </div>
            </div>

            {search || filter !== 'all' ? (
              /* Filtered results */
              <div className="p-3 flex flex-col gap-2 pb-8">
                {filter !== 'all' && !search && ['cicloturismo','bienestar','gastronomia','cultura'].includes(filter) && (
                  <div className="px-2 mb-2 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm">Club: {clubLabels[filter as ProductClub]}</h3>
                    <span className="text-xs font-bold text-[#1b4332]">{filtered.length} lugares</span>
                  </div>
                )}
                {filtered.map(p => {
                  const c = categoryColors[p.category];
                  return (
                    <button key={p.id} onClick={() => setDetail(p)} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 text-left w-full active:scale-[0.98] transition-all">
                      {p.image ? <img src={p.image} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0"/>
                        : <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${c.bg} ${c.text}`}>{catIcons[p.category]}</div>}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2"><h4 className="font-bold text-gray-900 text-sm truncate">{p.name}</h4>{p.recommended && <Award size={12} className="text-amber-500 shrink-0"/>}{p.rating && <span className="text-amber-600 text-[11px] font-bold shrink-0">★{p.rating}</span>}</div>
                        <p className="text-gray-400 text-xs truncate mt-0.5">{p.location} · {p.subcategory || categoryLabels[p.category]}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300 shrink-0"/>
                    </button>
                  );
                })}
                {filtered.length === 0 && <p className="text-center text-gray-400 py-12">No se encontraron resultados</p>}
              </div>
            ) : (
              /* Browse all by section */
              <div className="pt-0">
                <EagoraAgenda />
                <ProductClubs onSelectClub={setFilter} />
                
                <Section title="Zonas de Baño" icon={<Droplets size={14} className="text-blue-500"/>} items={places.filter(p => p.category === 'bañarse')} onSelect={handleSetDetail}/>
                <Section title="Naturaleza" icon={<TreePine size={14} className="text-emerald-500"/>} items={places.filter(p => p.category === 'naturaleza')} onSelect={handleSetDetail}/>
                <Section title="Rutas" icon={<Footprints size={14} className="text-orange-500"/>} items={places.filter(p => p.category === 'ruta')} onSelect={handleSetDetail}/>
                <Section title="Historia" icon={<Landmark size={14} className="text-amber-500"/>} items={places.filter(p => p.category === 'historia')} onSelect={handleSetDetail}/>
                <Section title="Pueblos" icon={<Building2 size={14} className="text-purple-500"/>} items={places.filter(p => p.category === 'pueblo')} onSelect={handleSetDetail}/>
                <div className="h-px bg-gray-200 mx-4 my-3"></div>
                <Section title="Restaurantes" icon={<Utensils size={14} className="text-rose-500"/>} items={restaurants} onSelect={handleSetDetail}/>
                <Section title="Turismo Activo" icon={<Compass size={14} className="text-cyan-500"/>} items={activities} onSelect={handleSetDetail}/>
                <Section title="Bodegas y Almazaras" icon={<Wine size={14} className="text-violet-500"/>} items={bodegas} onSelect={handleSetDetail}/>
                <Section title="Tiendas Locales" icon={<ShoppingBag size={14} className="text-lime-500"/>} items={shops} onSelect={handleSetDetail}/>
                <Section title="Museos y Cultura" icon={<Palette size={14} className="text-indigo-500"/>} items={culturalSpaces} onSelect={handleSetDetail}/>
                <Section title="Spa y Bienestar" icon={<Heart size={14} className="text-pink-500"/>} items={wellness} onSelect={handleSetDetail}/>
              </div>
            )}
          </div>
        )}

        {/* ─── GASTRO ────────────────────────────────────── */}
        {tab === 'gastro' && (
          <div className="h-full overflow-y-auto pb-8">
            <div className="relative h-[180px]">
              <img src="/img/gastro.png" alt="Gastronomía" className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-black/20 to-transparent"/>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-2xl font-black text-white drop-shadow-lg">Gastronomía</h2>
                <p className="text-white/80 text-sm drop-shadow">Sabores de la "Toscana Española"</p>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-2"><UtensilsCrossed size={14} className="text-[#1b4332]"/> Productos con D.O.</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {gastroItems.map(it => (
                  <button key={it.id} onClick={() => setGastroDetail(it)} className={`${it.color} rounded-xl p-3 flex flex-col items-center text-center border border-white/60 shadow-sm active:scale-[0.97] transition-all`}>
                    <span className="text-3xl mb-1">{it.emoji}</span>
                    <h4 className="font-bold text-gray-900 text-xs leading-tight">{it.name}</h4>
                    <p className="text-gray-500 text-[10px] mt-0.5">{it.subtitle}</p>
                    {it.badge && <span className="mt-1.5 bg-white/70 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full">{it.badge}</span>}
                  </button>
                ))}
              </div>
              <Section title="Restaurantes Destacados" icon={<Utensils size={14} className="text-rose-500"/>} items={restaurants.filter(r => r.recommended)} onSelect={handleSetDetail}/>
              <Section title="Todos los Restaurantes" icon={<Utensils size={14} className="text-rose-400"/>} items={restaurants.filter(r => !r.recommended)} onSelect={handleSetDetail}/>
              <Section title="Bodegas y Almazaras" icon={<Wine size={14} className="text-violet-500"/>} items={bodegas} onSelect={handleSetDetail}/>
              <div className="bg-gradient-to-br from-[#1b4332] to-[#2d6a4f] rounded-xl p-4 text-white">
                <h3 className="font-bold text-[#d8cba1] text-xs uppercase tracking-wider mb-2">Experiencias Gastronómicas</h3>
                <ul className="flex flex-col gap-2 text-white/90 text-sm">
                  <li>🍷 Catas de AOVE y vinos locales</li>
                  <li>🌳 Visita olivos centenarios y viñedos</li>
                  <li>🍎 Talleres y degustaciones de producto</li>
                  <li>👨‍🍳 Menús degustación en restaurantes top</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ─── ITINERARIO ──────────────────────────────────── */}
        {tab === 'itinerario' && (
          <ItineraryTab onSelectPoi={handleSetDetail} defaultAccommodationId={host?.id} />
        )}

        {/* ─── INFO ──────────────────────────────────────── */}
        {tab === 'info' && (
          <div className="h-full overflow-y-auto pb-12">
            <div className="bg-gradient-to-br from-[#1b4332] via-[#2d6a4f] to-[#40916c] p-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-2xl border-2 border-[#d8cba1]/30 flex items-center justify-center mx-auto mb-3">
                <h1 className="text-2xl font-black italic text-[#d8cba1]">R</h1>
              </div>
              <h2 className="text-xl font-bold text-white">El Rinconcito</h2>
              <p className="text-[#d8cba1] font-medium uppercase tracking-[0.2em] text-xs mt-1">del Matarraña</p>
              <p className="text-white/60 text-sm mt-3 max-w-xs mx-auto">¡Descubre los secretos mejor guardados de nuestra comarca!</p>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { n: places.length, l: 'Lugares', c: 'bg-emerald-50 text-emerald-600' },
                  { n: restaurants.length, l: 'Restaurantes', c: 'bg-rose-50 text-rose-600' },
                  { n: activities.length + bodegas.length, l: 'Actividades', c: 'bg-cyan-50 text-cyan-600' },
                  { n: wellness.length, l: 'Bienestar', c: 'bg-pink-50 text-pink-600' },
                ].map((s,i) => <div key={i} className={`${s.c.split(' ')[0]} p-2.5 rounded-xl text-center`}><p className={`text-xl font-black ${s.c.split(' ')[1]}`}>{s.n}</p><p className="text-[9px] font-medium mt-0.5 text-gray-500">{s.l}</p></div>)}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <h3 className="font-bold text-gray-900 p-3 pb-1 text-xs uppercase tracking-wider">Tu Estancia</h3>
                <a href="https://wa.me/34600000000" className="flex items-center gap-3 w-full p-3 border-b border-gray-50 text-sm font-medium text-green-700"><div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center"><MessageCircle size={14}/></div>WhatsApp<ChevronRight size={14} className="text-gray-300 ml-auto"/></a>
                <a href="https://elrinconcitomatarranya.com" target="_blank" className="flex items-center gap-3 w-full p-3 text-sm font-medium text-[#1b4332]"><div className="w-8 h-8 bg-[#1b4332]/5 rounded-lg flex items-center justify-center"><ExternalLink size={14}/></div>Nuestra web<ChevronRight size={14} className="text-gray-300 ml-auto"/></a>
              </div>
              {/* Acceso Profesional */}
              <button onClick={() => setIsAdmin(true)} className="w-full bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2.5 active:scale-95 transition-transform">
                <ShieldAlert size={18} className="text-[#d8cba1]"/>
                <span>Acceso Profesional (Negocios)</span>
              </button>
              <p className="text-center text-[10px] text-gray-400 -mt-2">¿Eres un alojamiento, restaurante o empresa de servicios? Configura tu guía personalizada.</p>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <h3 className="font-bold text-gray-900 p-3 pb-1 text-xs uppercase tracking-wider">Enlaces Útiles</h3>
                {[
                  { href:"https://www.comarcamatarranya.es/turismo", label:"Turismo Comarca Matarraña", c:"text-blue-600 bg-blue-50" },
                  { href:"https://www.turismodearagon.com", label:"Turismo de Aragón", c:"text-amber-600 bg-amber-50" },
                  { href:"https://www.viasverdes.com", label:"Vías Verdes de España", c:"text-green-600 bg-green-50" },
                  { href:"tel:112", label:"Emergencias: 112", c:"text-red-500 bg-red-50" },
                ].map((l,i) => <a key={i} href={l.href} target={l.href.startsWith('tel') ? undefined : '_blank'} className={`flex items-center gap-3 w-full p-3 border-b border-gray-50 text-sm ${l.c.split(' ')[0]}`}><div className={`w-8 h-8 ${l.c.split(' ')[1]} rounded-lg flex items-center justify-center`}><Globe size={14}/></div>{l.label}<ChevronRight size={14} className="text-gray-300 ml-auto"/></a>)}
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">&copy; {new Date().getFullYear()} El Rinconcito del Matarraña</p>
            </div>
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav className="shrink-0 bg-white border-t border-gray-200 pt-1.5 pb-5 px-4 flex justify-around items-center h-[72px] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-[500] relative">
        {([
          { id: 'mapa' as Tab, icon: <MapIcon size={20}/>, label: 'Mapa' },
          { id: 'explorar' as Tab, icon: <List size={20}/>, label: 'Explorar' },
          { id: 'itinerario' as Tab, icon: <Route size={20}/>, label: 'Itinerario' },
          { id: 'gastro' as Tab, icon: <Utensils size={20}/>, label: 'Gastro' },
          { id: 'info' as Tab, icon: <Info size={20}/>, label: 'Info' },
        ]).map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setFilter('all'); setSearch(''); }} className={`flex flex-col items-center gap-0.5 p-1.5 transition-all ${tab === t.id ? 'text-[#1b4332] -translate-y-0.5' : 'text-gray-400'}`}>
            <div className={`p-1.5 rounded-xl transition-all ${tab === t.id ? 'bg-[#1b4332]/10' : ''}`}>{t.icon}</div>
            <span className="text-[9px] font-bold uppercase tracking-wider">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
