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

Esta app **todavía no está inicializada como app de Webflow Cloud** — no hay
`webflow.json`. Se generó el código a mano (sin tocar cuentas ni CLI) porque
el deploy va en la cuenta de Webflow de **luci**, no en la de quien armó este
código.

Cuando luci (o quien tenga acceso a esa cuenta) esté listo:

1. `webflow auth login` (local, abre el navegador — no lo puede correr un
   agente).
2. Elegir **site-attached** (si luci ya tiene un sitio de Webflow) o
   **project app** (si no):
   ```bash
   # site-attached
   webflow apps init --no-input --app-name tarot-stack-traces \
     --framework nextjs --mount /app --site-id <site-id-de-luci>

   # project app (crea un sitio nuevo)
   webflow apps init --new --no-input --app-name tarot-stack-traces \
     --framework nextjs --workspace-id <workspace-id-de-luci>
   ```
3. Deploy:
   ```bash
   webflow apps deploy --no-input --mount /app --environment main \
     --skip-mount-path-check --skip-update-check
   ```
4. Si la API tira 404 al pedir la lectura, revisar el base path: seteá
   `NEXT_PUBLIC_BASE_PATH` con el path donde quedó montada la app (ya está
   soportado en `next.config.mjs` y en el `fetch` de `app/Tarot.tsx`).

Nota: el CLI de Webflow pide Node **>=20**; esta máquina tiene Node 18.20.2,
que alcanza para desarrollar y buildear la app con Next.js, pero puede no
alcanzar para correr `webflow` — revisar con `webflow --version` antes de
intentar el deploy.
