// ─────────────────────────────────────────────────────────────────────────
// IMPORTANTE: a diferencia de la versión web (Vite), aquí NO existe un
// proxy de "/api" hacia el backend. La app corre en el teléfono físico,
// así que tenés que apuntar a una URL donde tu backend sea alcanzable
// desde ese teléfono:
//
//  - Emulador Android:            http://10.0.2.2:4000/api
//  - Simulador iOS:               http://localhost:4000/api
//  - Celular físico (Expo Go):    http://TU_IP_LOCAL:4000/api
//        (ej: http://192.168.1.15:4000/api — mismo WiFi que tu compu)
//  - Backend ya desplegado:       https://tu-dominio.com/api
//
// Podés ver tu IP local con `ipconfig` (Windows) o `ifconfig`/`ip a` (Mac/Linux).
// ─────────────────────────────────────────────────────────────────────────
export const API_URL = "http://192.168.1.15:4000/api";
