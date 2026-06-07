/**
 * ProductIcon — reemplaza emojis de producto con íconos SVG reales via Iconify.
 *
 * Iconify carga los íconos bajo demanda desde su CDN al primer render.
 * No necesita ningún paquete de íconos extra instalado, solo @iconify/react.
 *
 * Íconos usados (colección "mdi" — Material Design Icons):
 *  - garrafón/bidón   → mdi:water-pump
 *  - botella grande   → mdi:bottle-tonic-outline  (5 galones)
 *  - pack de botellas → mdi:bottle-wine-outline   (pack x6)
 *  - botella pequeña  → mdi:cup-water             (1L individual)
 *  - bebida saboriz.  → mdi:cup-outline           (saborizadas)
 *  - pack/caja        → mdi:package-variant-closed
 *  - agua genérica    → mdi:water
 */
import { Icon } from "@iconify/react";

// Mapa emoji → iconify icon id
const EMOJI_MAP = {
  "🪣": "mdi:water-pump",
  "🫙": "mdi:bottle-tonic-outline",
  "🧴": "mdi:bottle-wine-outline",
  "💧": "mdi:cup-water",
  "🍶": "mdi:cup-outline",
  "📦": "mdi:package-variant-closed",
};

// También se puede pasar directamente el nombre del ícono
const DEFAULT = "mdi:water";

/**
 * @param {string}  emoji   — el emoji original del producto (o el icon id directo)
 * @param {number}  size    — tamaño en px (default 32)
 * @param {string}  color   — color CSS (default currentColor)
 * @param {string}  className
 */
export default function ProductIcon({ emoji, size = 32, color = "currentColor", className = "" }) {
  const iconId = EMOJI_MAP[emoji] ?? (emoji?.startsWith("mdi:") ? emoji : DEFAULT);
  return (
    <Icon
      icon={iconId}
      width={size}
      height={size}
      color={color}
      className={className}
      style={{ display: "block", flexShrink: 0 }}
    />
  );
}
