// ─────────────────────────────────────────────────────────────────────────
// Registro de acciones para el botón "atrás" de Android.
//
// App.js tiene UN solo listener de BackHandler. Cuando se presiona atrás,
// primero pregunta a las pantallas que registraron una acción propia (la
// última registrada primero: p. ej. un paso 2 que vuelve al paso 1 o un
// modal abierto). Si ninguna la maneja, App.js aplica la navegación general
// (pantalla secundaria → volver, pestaña → Inicio, etc.).
//
// No se usa BackHandler directo en cada pantalla porque React ejecuta los
// efectos de los hijos antes que los del padre y el orden de prioridad
// quedaría al revés.
// ─────────────────────────────────────────────────────────────────────────
const handlers = [];

export function pushBackHandler(fn) {
  handlers.push(fn);
  return () => {
    const i = handlers.lastIndexOf(fn);
    if (i >= 0) handlers.splice(i, 1);
  };
}

// Devuelve true si alguna pantalla manejó el "atrás".
export function runBackHandlers() {
  for (let i = handlers.length - 1; i >= 0; i--) {
    if (handlers[i]() === true) return true;
  }
  return false;
}
