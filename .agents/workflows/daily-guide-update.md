---
description: Actualización diaria de la Guía Rinconcito Matarraña — buscar eventos eÁgora, turismo, negocios nuevos y redesplegar
---

# Actualización Diaria — Guía Rinconcito Matarraña

// turbo-all

## 1. Investigar Eventos Nuevos (eÁgora + Turismo Comarcal)

Busca en internet información actualizada sobre:
- **eÁgora Matarraña** → agenda municipal, mercados, ferias, festivales
- **matarranya.org** → eventos, talleres de cocreación, clubs de producto
- **Ayuntamientos de la zona** → Valderrobres, Beceite, Calaceite, La Fresneda, etc.
- **Redes sociales locales** → Facebook de turismo Matarraña, Instagram

Apunta todos los eventos nuevos que encuentres (nombre, fecha, ubicación, descripción breve).

## 2. Actualizar `src/events.ts`

Abre el archivo `/Volumes/DATOS/ANTIGRAVITY/Repositorios/VITON/guia-rinconcito/src/events.ts`.
Añade los eventos nuevos encontrados al array `comarcaEvents`, eliminando los que ya hayan pasado (fecha anterior a hoy).
Formato de cada evento:
```typescript
{ title: 'Nombre', date: '2026-04-15', location: 'Valderrobres', description: 'Breve descripción' }
```

## 3. Investigar Negocios y Actividades Nuevas

Busca en internet si hay:
- Restaurantes nuevos abiertos en la comarca
- Actividades turísticas nuevas (rutas, aventuras, empresas)
- Bodegas, tiendas de productos locales
- Alojamientos o balnearios

Compara con los que ya existen en `/Volumes/DATOS/ANTIGRAVITY/Repositorios/VITON/guia-rinconcito/src/businesses.ts` y `/Volumes/DATOS/ANTIGRAVITY/Repositorios/VITON/guia-rinconcito/src/places.ts`.

## 4. Actualizar Datos de Negocios/Lugares (si hay novedades)

Si encuentras negocios o puntos de interés nuevos:
1. Añádelos a `src/businesses.ts` o `src/places.ts` según corresponda
2. Asegúrate de incluir: `id`, `name`, `category`, `description`, `lat`, `lng`, `location`, `priceRange` (si aplica), `productClub` (si pertenece a uno), `recommended`, `website`, `phone`
3. Busca las coordenadas en Google Maps

## 5. Build y Verificar

```bash
cd /Volumes/DATOS/ANTIGRAVITY/Repositorios/VITON/guia-rinconcito
npm run build
```

Si hay errores TypeScript, corrígelos antes de continuar.

## 6. Commit y Push a GitHub

```bash
cd /Volumes/DATOS/ANTIGRAVITY/Repositorios/VITON/guia-rinconcito
git add .
git commit -m "chore: daily guide update $(date +%Y-%m-%d)"
git push
```

## 7. Desplegar a Cloudflare Pages (Producción)

```bash
cd /Volumes/DATOS/ANTIGRAVITY/Repositorios/VITON/guia-rinconcito
npx wrangler pages deploy dist --project-name guia-rinconcito --branch master --commit-dirty=true
```

## 8. Verificar Despliegue

Abre `https://guia-rinconcito.pages.dev/` en el navegador y verifica que los cambios se ven correctamente.

## 9. Reportar Cambios

Genera un breve resumen de:
- Eventos añadidos / eliminados
- Negocios / actividades nuevas
- Cualquier cambio relevante
