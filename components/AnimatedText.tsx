"use client";

import { useEffect, useState } from "react";

interface AnimatedTextProps {
  text: string;
  speed?: number;
}

export default function AnimatedText({ text, speed = 40 }: AnimatedTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className="inline-block">
      {displayedText}
      <span className="inline-block w-2.5 h-5 ml-1 bg-brand animate-pulse align-middle" />
    </span>
  );
}