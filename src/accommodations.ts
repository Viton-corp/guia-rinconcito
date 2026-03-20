export interface Accommodation {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
}

export const accommodations: Accommodation[] = [
  { id: "rinconcito", name: "El Rinconcito", location: "Fuentespalda", lat: 40.8100, lng: 0.0200 },
  { id: "hotel_el_salt_acc", name: "Hotel El Salt", location: "Valderrobres", lat: 40.8750, lng: 0.1540 },
  { id: "lagaya_acc", name: "Lagaya Apartaments & Spa", location: "Valderrobres", lat: 40.8755, lng: 0.1545 },
  { id: "fabrica_solfa_acc", name: "La Fábrica de Solfa", location: "Beceite", lat: 40.8285, lng: 0.1730 },
  { id: "font_del_pas_acc", name: "Font del Pas", location: "Beceite", lat: 40.8292, lng: 0.1735 },
  { id: "antigua_posada_acc", name: "Antigua Posada Roda", location: "Beceite", lat: 40.8288, lng: 0.1742 },
  { id: "convent_acc", name: "Hotel El Convent", location: "La Fresneda", lat: 40.9248, lng: 0.0705 },
  { id: "torre_visco_acc", name: "La Torre del Visco", location: "Fuentespalda", lat: 40.8100, lng: 0.0200 },
  { id: "torre_marques_acc", name: "Hotel Torre del Marqués", location: "Monroyo", lat: 40.8100, lng: -0.0500 },
  { id: "hotel_sitjar_acc", name: "Hotel del Sitjar", location: "Calaceite", lat: 41.0195, lng: 0.1870 },
  { id: "mas_costa_acc", name: "Hotel Mas de la Costa", location: "Valderrobres", lat: 40.86, lng: 0.13 },
  { id: "fonda_alcala_acc", name: "Fonda Alcalá", location: "Calaceite", lat: 41.0192, lng: 0.1875 },
  { id: "otro", name: "Otro alojamiento (Valderrobres)", location: "Valderrobres", lat: 40.874, lng: 0.156 },
];
