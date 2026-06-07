import { useState } from "react";

// wrapper de localStorage para que el estado se persista entre recargas
// lo saqué de un video pero lo adapté para que maneje errores de parse
export function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  const set = newVal => {
    try {
      const resolved = typeof newVal === "function" ? newVal(val) : newVal;
      setVal(resolved);
      localStorage.setItem(key, JSON.stringify(resolved));
    } catch {
      // si falla (modo incógnito con storage lleno) simplemente actualizo el estado
      setVal(newVal);
    }
  };

  return [val, set];
}
