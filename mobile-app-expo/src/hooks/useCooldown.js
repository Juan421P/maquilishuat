import { useCallback, useEffect, useRef, useState } from "react";

// Cuenta regresiva en segundos (para "Reenviar código en 45 s").
export function useCooldown() {
  const [remaining, setRemaining] = useState(0);
  const untilRef = useRef(0);

  useEffect(() => {
    if (remaining <= 0) return undefined;
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((untilRef.current - Date.now()) / 1000));
      setRemaining(left);
    }, 500);
    return () => clearInterval(timer);
  }, [remaining > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback((seconds) => {
    const s = Math.max(0, Math.ceil(Number(seconds) || 0));
    untilRef.current = Date.now() + s * 1000;
    setRemaining(s);
  }, []);

  return { remaining, active: remaining > 0, start };
}
