import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Equivalente a useSessionStorage de la web, pero usando AsyncStorage
// (persistencia real en el dispositivo). La API es la misma:
// const [value, setValue] = useAsyncStorage("key", defaultValue)
export function useAsyncStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [hydrated, setHydrated] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (stored != null) setValue(JSON.parse(stored));
      } catch {
        // ignore corrupted storage
      } finally {
        loadedRef.current = true;
        setHydrated(true);
      }
    })();
  }, [key]);

  const set = useCallback(
    (newValue) => {
      setValue(newValue);
      (async () => {
        try {
          if (newValue === null || newValue === undefined) {
            await AsyncStorage.removeItem(key);
          } else {
            await AsyncStorage.setItem(key, JSON.stringify(newValue));
          }
        } catch {
          // ignore write errors
        }
      })();
    },
    [key]
  );

  return [value, set, hydrated];
}
