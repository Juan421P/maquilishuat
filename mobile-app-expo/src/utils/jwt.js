// Lee el payload de un JWT SIN verificarlo (la verificación la hace el
// backend). Solo se usa para recuperar el id y el tipo de usuario de una
// sesión guardada por versiones anteriores de la app.
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64UrlDecode(input) {
  const str = input.replace(/-/g, "+").replace(/_/g, "/");
  let output = "";
  let buffer = 0;
  let bits = 0;
  for (const ch of str) {
    if (ch === "=") break;
    const val = B64.indexOf(ch);
    if (val < 0) continue;
    buffer = (buffer << 6) | val;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  try {
    return decodeURIComponent(
      output
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
  } catch {
    return output;
  }
}

export function decodeJwtPayload(token) {
  try {
    const [, payload] = String(token).split(".");
    if (!payload) return null;
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }
}
