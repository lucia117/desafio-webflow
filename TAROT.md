# Tarot de stack traces

App para el challenge de Nerdearla. Pegás un error o stack trace y recibís una
tirada de tres cartas — **Pasado** (la causa), **Presente** (el error) y
**Futuro** (el fix) — con una estética de vidrio esmerilado / microchip
(glow violeta → cian, dorso tipo chip, tipografías Cinzel Decorative + Inter).

La tirada es determinística: el Presente se elige por regex contra el trace
pegado, y Pasado/Futuro se eligen a partir de un hash SHA-256 del mismo trace.
El mismo error siempre da la misma lectura (sin base de datos).

## Estructura

- `lib/cards.ts` — las 9 cartas (Arcanos Mayores → categorías de error), cada
  una con `id`, `name`, `numeral`, `glyph` (path SVG en `viewBox 0 0 100 100`)
  y `text`. El campo `match` (regex) es server-only.
- `lib/hash.ts` — SHA-256 sobre el trace (Web Crypto, con fallback a
  `node:crypto` en local).
- `lib/reading.ts` — arma la tirada de 3 cartas a partir del trace.
- `lib/presets.ts` — los 4 errores clásicos para los botones de demo.
- `app/api/reading/route.ts` — `POST /api/reading` con `{ trace: string }`,
  valida y devuelve `{ reading: ReadingEntry[] }`.
- `app/Tarot.tsx` + `app/tarot.module.css` — UI, flip secuencial (0.35s entre
  cartas), respeta `prefers-reduced-motion`.

## Desarrollo local

```bash
npm install
npm run dev
```

## Capas pendientes (si sobra tiempo)

- **Capa 3 (Mejor Tech):** reemplazar `card.text` fijo por una lectura
  generada con un LLM en tono de tarotista dramático, usando el trace + la
  carta como contexto. Guardar la API key como variable de entorno (nunca en
  el repo).
- **Capa 4:** ruta `/reading/[hash]` para compartir una tirada por URL (el
  hash del trace ya es determinístico, así que alcanza con re-derivarla del
  hash en la URL).

## Deploy en Webflow Cloud

El repo está conectado a Webflow Cloud vía GitHub (push a `main` dispara
deploy automático desde el dashboard de Webflow, en la cuenta de **luci**).

**Requisito importante:** el builder de Webflow Cloud siempre genera su
propio `next.config.ts` (parte del template para el adapter de Cloudflare),
y **Next.js 14 no soporta `next.config.ts`** (ese soporte se agregó en
Next.js 15). Por eso el proyecto usa `next@15.5.26` + `react@19` — si se baja
la versión de Next por debajo de 15, el deploy va a fallar en el build con:

```
Error: Configuring Next.js via 'next.config.ts' is not supported.
Please replace the file with 'next.config.js' or 'next.config.mjs'.
```

Si la API tira 404 al pedir la lectura después de un deploy, revisar el base
path: seteá `NEXT_PUBLIC_BASE_PATH` con el path donde quedó montada la app
(ya está soportado en `next.config.mjs` y en el `fetch` de `app/Tarot.tsx`).
