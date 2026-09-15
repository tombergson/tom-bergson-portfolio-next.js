"use client";

import { useEffect, useState } from "react";

interface AnimatedTextProps {
  texts?: string[];
  typingSpeed?: number;
  pauseDuration?: number;
  gapDuration?: number;
}

export default function AnimatedText({
  texts = [],
  typingSpeed = 150,
  pauseDuration = 4000,
  gapDuration = 400,
}: AnimatedTextProps) {
  const [index, setIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "pause" | "gap">("typing");

  const safeTexts = texts.filter(Boolean);
  const current = safeTexts[index] ?? "";

  useEffect(() => {
    if (safeTexts.length === 0) return;

    let timeout: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (charIndex < current.length) {
        timeout = setTimeout(() => {
          setCharIndex((c) => c + 1);
        }, typingSpeed);
      } else {
        // pełny tekst — mruganie kursora (pause)
        timeout = setTimeout(() => {
          setPhase("gap");
        }, pauseDuration);
      }
    } else if (phase === "gap") {
      // tekst znika od razu, krótka przerwa, następny
      timeout = setTimeout(() => {
        setCharIndex(0);
        setIndex((i) => (i + 1) % safeTexts.length);
        setPhase("typing");
      }, gapDuration);
    }

    return () => clearTimeout(timeout);
  }, [
    charIndex,
    phase,
    index,
    current,
    safeTexts.length,
    typingSpeed,
    pauseDuration,
    gapDuration,
  ]);

  if (safeTexts.length === 0) {
    return <span className="inline-block" />;
  }

  // w fazie gap nie pokazuj tekstu
  const displayed = phase === "gap" ? "" : current.slice(0, charIndex);

  return (
    <span className="inline-block min-h-[1.2em]">
      {displayed}
      <span
        className="inline-block w-2.5 h-5 ml-1 bg-brand animate-pulse align-middle"
        aria-hidden
      />
    </span>
  );
}