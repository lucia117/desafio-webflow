"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./tarot.module.css";
import { PRESET_TRACES } from "@/lib/presets";
import type { ReadingEntry } from "@/lib/reading";

const FORM_EXIT_MS = 450;
const SPREAD_EXIT_MS = 400;
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Stage = "input" | "input-exit" | "reveal" | "reveal-exit";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export default function Tarot() {
  const [trace, setTrace] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<ReadingEntry[] | null>(null);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [stage, setStage] = useState<Stage>("input");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const t = setTimeout(fn, delay);
    timers.current.push(t);
  }, []);

  const submit = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setError("Pegá un error o stack trace primero.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BASE_PATH}/api/reading`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trace: trimmed }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.error ?? "No se pudo leer las cartas.");
          setLoading(false);
          return;
        }

        const nextReading = data.reading as ReadingEntry[];
        setLoading(false);
        clearTimers();

        if (prefersReducedMotion()) {
          setReading(nextReading);
          setRevealed(Array(nextReading.length).fill(false));
          setStage("reveal");
          return;
        }

        setStage("input-exit");
        schedule(() => {
          setReading(nextReading);
          setRevealed(Array(nextReading.length).fill(false));
          setStage("reveal");
        }, FORM_EXIT_MS);
      } catch {
        setError("No se pudo conectar con el oráculo. Probá de nuevo.");
        setLoading(false);
      }
    },
    [clearTimers, schedule]
  );

  const handlePreset = (presetTrace: string) => {
    setTrace(presetTrace);
    void submit(presetTrace);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit(trace);
  };

  const handleReset = useCallback(() => {
    clearTimers();

    if (prefersReducedMotion()) {
      setReading(null);
      setRevealed([]);
      setTrace("");
      setError(null);
      setStage("input");
      return;
    }

    setStage("reveal-exit");
    schedule(() => {
      setReading(null);
      setRevealed([]);
      setTrace("");
      setError(null);
      setStage("input");
    }, SPREAD_EXIT_MS);
  }, [clearTimers, schedule]);

  const toggleCard = useCallback((index: number) => {
    setRevealed((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);

  const showForm = stage === "input" || stage === "input-exit";
  const showSpread = (stage === "reveal" || stage === "reveal-exit") && reading;

  return (
    <main className={styles.page}>
      <div className={styles.halo} aria-hidden="true" />

      <header className={styles.header}>
        <p className={styles.kicker}>0x00 // NERDEARLA × WEBFLOW</p>
        <h1 className={styles.title}>Tarot de stack traces</h1>
        <p className={styles.subtitle}>
          Pegá un error. Recibí tres cartas: Pasado (la causa), Presente (el
          error), Futuro (el fix).
        </p>
      </header>

      {showForm && (
        <form
          className={`${styles.form} ${
            stage === "input-exit" ? styles.formExit : ""
          }`}
          onSubmit={handleSubmit}
        >
          <textarea
            className={styles.textarea}
            value={trace}
            onChange={(e) => setTrace(e.target.value)}
            placeholder="Pegá tu error o stack trace acá..."
            rows={5}
            aria-label="Error o stack trace"
            disabled={stage === "input-exit"}
          />

          <div className={styles.presets}>
            <span className={styles.presetsLabel}>
              Probá con un error clásico:
            </span>
            {PRESET_TRACES.map((preset) => (
              <button
                type="button"
                key={preset.label}
                className={styles.presetButton}
                onClick={() => handlePreset(preset.trace)}
                disabled={loading || stage === "input-exit"}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || stage === "input-exit"}
          >
            {loading ? "Consultando el oráculo..." : "Tirar las cartas"}
          </button>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </form>
      )}

      {showSpread && reading && (
        <section
          className={`${styles.spread} ${
            stage === "reveal-exit" ? styles.spreadExit : ""
          }`}
          aria-live="polite"
        >
          {reading.map((entry, i) => (
            <TarotCard
              key={entry.position}
              entry={entry}
              revealed={revealed[i] ?? false}
              onToggle={() => toggleCard(i)}
            />
          ))}
        </section>
      )}

      {showSpread && (
        <p className={styles.spreadHint}>Tocá una carta para revelar la lectura.</p>
      )}

      {stage === "reveal" && (
        <button
          type="button"
          className={styles.resetButton}
          onClick={handleReset}
        >
          ↺ Volver al inicio
        </button>
      )}
    </main>
  );
}

function TarotCard({
  entry,
  revealed,
  onToggle,
}: {
  entry: ReadingEntry;
  revealed: boolean;
  onToggle: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className={styles.cardSlot}>
      <span className={styles.cardPositionLabel}>{entry.label}</span>
      <div
        className={styles.card}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-pressed={revealed}
        aria-label={
          revealed
            ? `${entry.card.name}. Tocá para volver al logo de Nerdearla.`
            : "Logo de Nerdearla. Tocá para revelar la carta."
        }
      >
        <div
          className={`${styles.cardInner} ${
            revealed ? styles.cardFlipped : ""
          }`}
        >
          <div className={`${styles.cardFace} ${styles.cardBack}`}>
            <div className={styles.backPattern} aria-hidden="true" />
            <div className={styles.backSeal}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${BASE_PATH}/logos/nerdearla.png`}
                alt="Nerdearla"
                className={styles.backLogoNerdearla}
              />
            </div>
          </div>
          <div className={`${styles.cardFace} ${styles.cardFront}`}>
            <span className={styles.cardNumeral}>{entry.card.numeral}</span>
            <span className={styles.cardTag}>{entry.card.tag}</span>
            <div className={styles.cardGlyphRing}>
              <svg
                className={styles.cardGlyph}
                viewBox="0 0 100 100"
                role="img"
                aria-label={entry.card.name}
              >
                <path d={entry.card.glyph} />
              </svg>
            </div>
            <span className={styles.cardName}>{entry.card.name}</span>
            <p className={styles.cardText}>{entry.card.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
