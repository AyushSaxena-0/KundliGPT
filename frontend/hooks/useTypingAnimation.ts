import { useState, useEffect } from "react";

/**
 * Custom React hook to simulate streaming/typing text animation.
 */
export function useTypingAnimation(text: string, speedMs: number = 10, enabled: boolean = true): {
  displayedText: string;
  isComplete: boolean;
} {
  const [displayedText, setDisplayedText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText("");
    setIsComplete(false);
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(interval);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs, enabled]);

  return { displayedText, isComplete };
}
export default useTypingAnimation;
