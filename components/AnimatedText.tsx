"use client";

import { useEffect, useState } from "react";

interface AnimatedTextProps {
  text: string;
  speed?: number;
}

export default function AnimatedText({ text, speed = 40 }: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);

  useEffect(() => {
    setIsTypingDone(false);
    setDisplayedText("");

    let currentIndex = 0;

    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingDone(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className="inline-block">
      {/* Pokazuje animowany tekst, a w razie braku startu wyświetla pełny tekst */}
      {displayedText || (!isTypingDone && text ? "" : text)}
      <span className="inline-block w-2.5 h-5 ml-1 bg-brand animate-pulse align-middle" />
    </span>
  );
}