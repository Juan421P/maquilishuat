import { useState } from "react";

export function useSessionStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = (newValue) => {
    setValue(newValue);
    try {
      if (newValue === null || newValue === undefined) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch {}
  };

  return [value, set];
}
