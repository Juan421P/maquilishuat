import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Equivalente a useSessionStorage de la web, pero usando AsyncStorage
// (persistencia real en el dispositivo). La API es la misma:
// const [value, setValue, hydrated] = useAsyncStorage("key", defaultValue)
//
// - `key` puede ser null (no se persiste nada, p. ej. sin sesión).
// - Si `key` cambia (otro usuario), el valor vuelve al default y se carga el
//   de la nueva clave: nunca se mezcla el carrito de dos cuentas.
// - setValue acepta un valor o una función (prev) => next, igual que useState,
//   para que varios toques rápidos no pisen el estado.
export function useAsyncStorage(key, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const [hydrated, setHydrated] = useState(false);
  const valueRef = useRef(defaultValue);
  const keyRef = useRef(key);
  const defaultRef = useRef(defaultValue);

  useEffect(() => {
    keyRef.current = key;
    valueRef.current = defaultRef.current;
    setValue(defaultRef.current);
    setHydrated(false);
    if (!key) {
      setHydrated(true);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(key);
        if (!cancelled && stored != null) {
          const parsed = JSON.parse(stored);
          valueRef.current = parsed;
          setValue(parsed);
        }
      } catch (e) {
        console.warn(`No se pudo leer "${key}" del almacenamiento`, e);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const set = useCallback((next) => {
    const resolved = typeof next === "function" ? next(valueRef.current) : next;
    valueRef.current = resolved;
    setValue(resolved);
    const currentKey = keyRef.current;
    if (!currentKey) return;
    (async () => {
      try {
        if (resolved === null || resolved === undefined) {
          await AsyncStorage.removeItem(currentKey);
        } else {
          await AsyncStorage.setItem(currentKey, JSON.stringify(resolved));
        }
      } catch (e) {
        console.warn(`No se pudo guardar "${currentKey}"`, e);
      }
    })();
  }, []);

  return [value, set, hydrated];
}
