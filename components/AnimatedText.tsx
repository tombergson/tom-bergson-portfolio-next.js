"use client";

import { useEffect, useState } from "react";

interface AnimatedTextProps {
  text: string;
  speed?: number;
}

export default function AnimatedText({ text, speed = 40 }: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let currentIndex = 0;
    let isTypingDone = false;

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else if (!isTypingDone) {
        isTypingDone = true;
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="inline-block">
      {/* Pokazuje animowany tekst */}
      {displayedText || text}
      {displayedText.length < text.length && (
        <span className="inline-block w-2.5 h-5 ml-1 bg-brand animate-pulse align-middle" />
      )}
    </span>
  );
}