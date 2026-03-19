// Re-export types
export type { PointOfInterest, GastroItem, Category, PlaceCategory, BusinessCategory } from './types';
export { categoryLabels, categoryColors } from './types';

// Import all data
import { places } from './places';
import { restaurants, activities, bodegas, shops, culturalSpaces, wellness } from './businesses';

// Re-export individual arrays
export { places } from './places';
export { restaurants, activities, bodegas, shops, culturalSpaces, wellness } from './businesses';

// Combined array for map and search
export const allPoints: import('./types').PointOfInterest[] = [
  ...places,
  ...restaurants,
  ...activities,
  ...bodegas,
  ...shops,
  ...culturalSpaces,
  ...wellness,
];

// Gastro items (products)
export const gastroItems: import('./types').GastroItem[] = [
  { id:"aceite", name:"Aceite de Oliva", subtitle:"D.O. Bajo Aragón", description:"Oro líquido de olivos centenarios.", longDescription:"El aceite de oliva D.O. del Bajo Aragón es el producto estrella. Sabor suave, notas afrutadas y toque picante. Visita las almazaras para catas.", badge:"Producto Estrella ⭐", color:"bg-yellow-50", emoji:"🫒", externalUrl:"https://www.aceitedelbajovaragon.es" },
  { id:"jamon", name:"Jamón de Teruel", subtitle:"D.O. Teruel", description:"Curado al aire frío de las sierras.", longDescription:"Jamón de Teruel D.O., curado al aire frío de las sierras con un sabor único gracias al microclima de la zona.", badge:"D.O. Teruel", color:"bg-rose-50", emoji:"🍖", externalUrl:"https://www.jamondeteruel.com" },
  { id:"ternasco", name:"Ternasco de Aragón", subtitle:"D.O. Aragón", description:"Cordero joven con denominación de origen.", longDescription:"Ternasco de Aragón D.O., cordero joven, tierno y con sabor delicado. Se prepara al horno, a la brasa o en caldereta. Pídelo en cualquier restaurante.", badge:"D.O. Aragón", color:"bg-amber-50", emoji:"🐑" },
  { id:"melocoton", name:"Melocotón de Calanda", subtitle:"D.O. Calanda", description:"El melocotón tardío más dulce.", longDescription:"Melocotón D.O. Calanda, embolsado individualmente. Fruto tardío (septiembre-octubre), gran tamaño, pulpa firme y dulzor excepcional.", badge:"D.O. Calanda", color:"bg-orange-50", emoji:"🍑", externalUrl:"https://www.melocotondecalanda.com" },
  { id:"miel", name:"Miel del Matarraña", subtitle:"Miel artesanal", description:"Romero, tomillo, espliego y almendro.", longDescription:"Mieles monoflores artesanales: romero, tomillo, espliego y flor de almendro. La de romero es la más apreciada.", color:"bg-amber-50", emoji:"🍯" },
  { id:"queso", name:"Queso de Cabra", subtitle:"Artesanal", description:"Elaboración tradicional con leche de cabra local.", longDescription:"Queso artesanal de leche de cabra local. Frescos, semicurados y curados con sabor inconfundible.", color:"bg-stone-100", emoji:"🧀" },
  { id:"aceitunas", name:"Aceitunas y Paté", subtitle:"Producto local", description:"Aperitivo perfecto con pan del horno.", longDescription:"Aceitunas de mesa de calidad excepcional y paté de olivas para untar. El aperitivo perfecto acompañado de pan artesanal.", color:"bg-green-50", emoji:"🫒" },
  { id:"pastas", name:"Pastas Típicas", subtitle:"Repostería tradicional", description:"Casquetas, mantecados, carquiñolis, almendrados.", longDescription:"Casquetas, mantecados, carquiñolis, almendrados, españolitas y cocs. Cada pueblo tiene sus propias recetas transmitidas durante generaciones.", color:"bg-pink-50", emoji:"🍪" },
  { id:"pan", name:"Pan Artesanal", subtitle:"Horno de leña", description:"Pan cocido en horno de leña tradicional.", longDescription:"Pan de horno de leña con corteza crujiente y miga tierna. El acompañamiento perfecto para el aceite y el jamón.", color:"bg-amber-100", emoji:"🍞" },
  { id:"almendras", name:"Frutos Secos", subtitle:"Almendras, nueces y avellanas", description:"Base de los dulces típicos de la comarca.", longDescription:"Almendras, nueces y avellanas de los campos del Matarraña. En primavera, los almendros en flor tiñen el paisaje de blanco y rosa.", color:"bg-yellow-50", emoji:"🥜" },
];
