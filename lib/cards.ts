export type Card = {
  id: string;
  name: string;
  numeral: string;
  tag: string;
  glyph: string;
  text: string;
};

type CardDef = Card & { match: RegExp | null };

/**
 * `match` is used only server-side to pick the Presente card.
 * Pasado/Futuro are chosen deterministically from a hash of the trace,
 * so the same input always deals the same three cards.
 */
export const CARDS: CardDef[] = [
  {
    id: "el-loco",
    name: "El Loco",
    numeral: "0",
    tag: "TypeError",
    match: /null|undefined is not|cannot read propert(y|ies) of undefined|cannot read propert(y|ies) of null/i,
    glyph: "M50 12 a7 7 0 1 0 0.1 0 M50 26 L50 52 M36 36 L64 36 M50 52 L34 80 M50 52 L62 74 M62 74 L75 67",
    text: "Confiaste en algo que no estaba ahí. El vacío te lo devuelve con un undefined al que le pediste demasiado.",
  },
  {
    id: "la-torre",
    name: "La Torre",
    numeral: "XVI",
    tag: "CORS",
    match: /cors|access-control|cross-origin/i,
    glyph: "M38 88 L38 30 L50 14 L62 30 L62 88 M30 88 L70 88 M38 46 L62 46 M50 14 L38 30 M50 14 L62 30 M66 20 L74 12 M70 24 L80 24",
    text: "Dos orígenes que ya no se hablan. Todo lo construido sobre esa confianza se derrumba en un preflight fallido.",
  },
  {
    id: "el-ermitano",
    name: "El Ermitaño",
    numeral: "IX",
    tag: "ETIMEDOUT",
    match: /timeout|etimedout|econnreset|deadline exceeded/i,
    glyph: "M50 20 C40 20 34 30 34 42 C34 56 42 66 50 90 C58 66 66 56 66 42 C66 30 60 20 50 20 Z M50 30 L50 46 M42 38 L58 38",
    text: "Alguien se quedó esperando, solo, en la oscuridad, hasta que se le acabó el tiempo.",
  },
  {
    id: "la-rueda",
    name: "La Rueda de la Fortuna",
    numeral: "X",
    tag: "RangeError",
    match: /stack overflow|maximum call stack|too much recursion|range error/i,
    glyph: "M50 50 m-28 0 a28 28 0 1 0 56 0 a28 28 0 1 0 -56 0 M50 22 L50 78 M22 50 L78 50 M31 31 L69 69 M31 69 L69 31",
    text: "La misma vuelta, otra vez, y otra vez, hasta que el propio peso la frena de golpe.",
  },
  {
    id: "el-colgado",
    name: "El Colgado",
    numeral: "XII",
    tag: "DEADLOCK",
    match: /deadlock|mutex|lock timeout|waiting for lock/i,
    glyph: "M34 38 m-16 0 a16 11 0 1 0 32 0 a16 11 0 1 0 -32 0 M66 62 m-16 0 a16 11 0 1 0 32 0 a16 11 0 1 0 -32 0",
    text: "Dos manos esperando la otra para soltar. Nadie cede, y todo queda colgado en el mismo instante.",
  },
  {
    id: "los-enamorados",
    name: "Los Enamorados",
    numeral: "VI",
    tag: "CONFLICT",
    match: /merge conflict|<<<<<<<|conflicting changes|both modified/i,
    glyph: "M50 85 C25 65 12 46 12 30 C12 16 23 6 36 6 C44 6 49 11 50 18 C51 11 56 6 64 6 C77 6 88 16 88 30 C88 46 75 65 50 85 Z M50 24 L44 42 L54 46 L46 64",
    text: "Dos historias que crecieron por su lado y ahora tienen que decidir, línea por línea, cuál prevalece.",
  },
  {
    id: "la-muerte",
    name: "La Muerte",
    numeral: "XIII",
    tag: "SIGSEGV",
    match: /segmentation fault|segfault|out of memory|oom|core dumped/i,
    glyph: "M50 20 C34 20 26 32 26 46 C26 56 32 60 32 66 L68 66 C68 60 74 56 74 46 C74 32 66 20 50 20 Z M38 44 a4 4 0 1 0 0.1 0 M62 44 a4 4 0 1 0 0.1 0 M40 66 L40 80 M50 66 L50 84 M60 66 L60 80",
    text: "El proceso llega a su límite y se apaga entero. Nada queda a medio camino: o sigue, o no sigue.",
  },
  {
    id: "el-diablo",
    name: "El Diablo",
    numeral: "XV",
    tag: "HTTP 500",
    match: /internal server error|error 500|status: ?500|500 \(/i,
    glyph: "M50 30 C36 30 30 42 30 52 C30 66 38 78 50 78 C62 78 70 66 70 52 C70 42 64 30 50 30 Z M38 30 L32 18 M62 30 L68 18 M42 54 a3 3 0 1 0 0.1 0 M58 54 a3 3 0 1 0 0.1 0 M42 66 Q50 74 58 66",
    text: "Un error sin nombre ni causa visible, que se lleva todo con él y no explica por qué.",
  },
  {
    id: "la-estrella",
    name: "La Estrella",
    numeral: "XVII",
    tag: "UNKNOWN",
    match: null,
    glyph: "M50 16 L58 40 L83 40 L63 55 L71 80 L50 65 L29 80 L37 55 L17 40 L42 40 Z",
    text: "Todavía no hay presagio que la reconozca. Pero incluso en el error sin nombre, hay una luz que orienta.",
  },
];

export const FALLBACK_CARD: CardDef = CARDS.find((c) => c.match === null)!;

export function toPublicCard(card: CardDef): Card {
  return {
    id: card.id,
    name: card.name,
    numeral: card.numeral,
    tag: card.tag,
    glyph: card.glyph,
    text: card.text,
  };
}
