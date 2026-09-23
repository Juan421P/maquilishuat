import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

// ─────────────────────────────────────────────────────────────────────────
// URL del backend
//
// 1) EXPO_PUBLIC_API_URL (recomendado para builds de producción)
//    Expo inyecta en tiempo de build las variables que empiezan con
//    EXPO_PUBLIC_. Créala en `mobile-app-expo/.env` (ver `.env.example`) o
//    en el entorno de EAS/CI, por ejemplo:
//
//      EXPO_PUBLIC_API_URL=https://api.tudominio.com/api
//
//    Si está definida, tiene prioridad sobre todo lo demás (también en
//    desarrollo, útil para apuntar a un backend en ngrok/Render).
//
// 2) Autodetección en desarrollo (si no hay EXPO_PUBLIC_API_URL)
//    Hay 3 formas de correr la app y cada una necesita una URL distinta para
//    alcanzar el backend que corre en tu compu (puerto 4000):
//
//    a) Emulador de Android (Android Studio): siempre llega a tu compu vía la
//       IP fija 10.0.2.2 (alias reservado por el propio emulador).
//    b) Celular físico por USB con `adb reverse tcp:4000 tcp:4000`: Expo
//       reporta el bundler como "localhost:8081", así que usamos localhost
//       también para el backend.
//    c) Celular físico por WiFi (misma red que tu compu): Expo reporta el
//       bundler como "192.168.x.x:8081"; reusamos esa misma IP.
//
// En un build de release SIN EXPO_PUBLIC_API_URL no hay Metro del cual
// sacar la IP: API_URL queda en null y la app muestra un error claro en vez
// de llamar a un dominio de ejemplo que no existe. El proyecto todavía no
// tiene un backend desplegado, por eso no hay una URL de producción fija.
// ─────────────────────────────────────────────────────────────────────────

const BACKEND_PORT = 4000;
const ANDROID_EMULATOR_HOST = "10.0.2.2";

const ENV_API_URL = (process.env.EXPO_PUBLIC_API_URL || "").trim().replace(/\/+$/, "");

function getMetroHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (!hostUri) return null;
  return hostUri.split(":")[0];
}

function resolveDevApiUrl() {
  // a) Emulador/simulador de Android (no es un dispositivo físico).
  if (Device.isDevice === false && Platform.OS === "android") {
    return `http://${ANDROID_EMULATOR_HOST}:${BACKEND_PORT}/api`;
  }
  // b) y c): dispositivo físico, por USB (localhost + adb reverse) o por
  //    WiFi (IP de la LAN). Reusamos el host que Metro usa para el bundle.
  const metroHost = getMetroHost();
  if (metroHost) {
    return `http://${metroHost}:${BACKEND_PORT}/api`;
  }
  return null;
}

export const API_URL = ENV_API_URL || (__DEV__ ? resolveDevApiUrl() : null);

// Mensaje que se muestra si no hay forma de saber a qué backend conectarse.
export const API_URL_MISSING_MESSAGE =
  "La app no tiene configurada la dirección del servidor. Define EXPO_PUBLIC_API_URL y vuelve a generar la app.";
