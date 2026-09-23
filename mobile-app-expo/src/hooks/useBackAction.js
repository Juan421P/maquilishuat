import { useEffect, useRef } from "react";
import { pushBackHandler } from "../utils/backRegistry";

// Registra una acción para el botón "atrás" de Android mientras `enabled`
// sea true. La función debe devolver true si manejó el evento.
// Ejemplo: useBackAction(() => { setStep(1); return true; }, step === 2);
export function useBackAction(handler, enabled = true) {
  const ref = useRef(handler);
  ref.current = handler;

  useEffect(() => {
    if (!enabled) return undefined;
    return pushBackHandler(() => ref.current());
  }, [enabled]);
}
