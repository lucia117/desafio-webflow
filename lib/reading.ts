import { CARDS, FALLBACK_CARD, toPublicCard, type Card } from "./cards";
import { sha256Bytes } from "./hash";

export type Position = "pasado" | "presente" | "futuro";

export type ReadingEntry = {
  position: Position;
  label: string;
  card: Card;
};

const LABELS: Record<Position, string> = {
  pasado: "Pasado",
  presente: "Presente",
  futuro: "Futuro",
};

/**
 * Deterministic tarot draw: the Presente card is matched by regex against
 * the trace, and Pasado/Futuro are picked from a hash of the trace, so the
 * same input always deals the same three cards (shareable, no database).
 */
export async function drawReading(trace: string): Promise<ReadingEntry[]> {
  const present = CARDS.find((c) => c.match?.test(trace)) ?? FALLBACK_CARD;
  const remaining = CARDS.filter((c) => c.id !== present.id);

  const hash = await sha256Bytes(trace);
  const pastIndex = hash[0] % remaining.length;
  const past = remaining[pastIndex];

  const futureCandidates = remaining.filter((_, i) => i !== pastIndex);
  const futureIndex = hash[1] % futureCandidates.length;
  const future = futureCandidates[futureIndex];

  return [
    { position: "pasado", label: LABELS.pasado, card: toPublicCard(past) },
    { position: "presente", label: LABELS.presente, card: toPublicCard(present) },
    { position: "futuro", label: LABELS.futuro, card: toPublicCard(future) },
  ];
}
