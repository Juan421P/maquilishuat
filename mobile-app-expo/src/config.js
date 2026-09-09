import Constants from "expo-constants";
import * as Device from "expo-device";
import { Platform } from "react-native";

// ─────────────────────────────────────────────────────────────────────────
// Autodetección de cómo llegar a tu backend en desarrollo
//
// Hay 3 formas de correr la app y cada una necesita una URL distinta para
// alcanzar el backend que corre en tu compu (puerto 4000). Esta lógica
// intenta adivinar cuál estás usando para que NUNCA tengas que escribir tu
// IP a mano:
//
//  1) Emulador de Android (Android Studio)
//     El emulador siempre puede llegar a tu compu vía la IP fija 10.0.2.2
//     (alias reservado por el propio emulador). No depende de la red ni de
//     ningún cable.
//
//  2) Celular físico por USB con `adb reverse`
//     Cuando conectás el celular por cable y usás `adb reverse
//     tcp:4000 tcp:4000` (además del que Expo ya hace solo para el puerto
//     8081 del bundler), "localhost:4000" en el celular en realidad viaja
//     por el cable hasta tu compu. En este modo, Expo suele reportar el
//     bundler como "localhost:8081", así que si detectamos eso, usamos
//     localhost también para el backend.
//
//  3) Celular físico por WiFi (misma red que tu compu)
//     Expo reporta el bundler como "192.168.x.x:8081"; reusamos esa misma
//     IP para el backend.
// ─────────────────────────────────────────────────────────────────────────

const BACKEND_PORT = 4000;
const ANDROID_EMULATOR_HOST = "10.0.2.2";

// URL fija para builds de producción (no hay Metro corriendo del cual
// sacar nada). Cambiala por tu backend ya desplegado.
const PRODUCTION_API_URL = "https://tu-dominio-en-produccion.com/api";

function getMetroHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (!hostUri) return null;
  return hostUri.split(":")[0];
}

function resolveDevApiUrl() {
  // 1) Emulador/simulador (no es un dispositivo físico): en Android usamos
  //    siempre el alias fijo, sin importar lo que reporte Metro.
  if (Device.isDevice === false && Platform.OS === "android") {
    return `http://${ANDROID_EMULATOR_HOST}:${BACKEND_PORT}/api`;
  }

  // 2) y 3): dispositivo físico, por USB (localhost + adb reverse) o por
  //    WiFi (IP de la LAN). En ambos casos reusamos el host que Metro ya
  //    está usando para servir el bundle.
  const metroHost = getMetroHost();
  if (metroHost) {
    return `http://${metroHost}:${BACKEND_PORT}/api`;
  }

  return null;
}

const devApiUrl = resolveDevApiUrl();

export const API_URL = __DEV__ && devApiUrl ? devApiUrl : PRODUCTION_API_URL;

// ─────────────────────────────────────────────────────────────────────────
// Si estás en celular físico por USB y la autodetección no da con
// "localhost", corré esto en otra terminal ANTES de abrir la app (además
// de tener el backend corriendo):
//
//   adb reverse tcp:4000 tcp:4000
//
// Si necesitás forzar una URL a mano por cualquier otro motivo (backend
// desplegado, red distinta, etc.), descomentá la línea de abajo — tiene
// prioridad sobre todo lo anterior:
//
// export const API_URL = "https://tu-backend-en-ngrok-o-render.com/api";
// ─────────────────────────────────────────────────────────────────────────
