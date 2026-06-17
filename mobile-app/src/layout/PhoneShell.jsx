import { T } from "../utils/theme";

const isMobile = () =>
  typeof window !== "undefined" && window.innerWidth <= 768;

export default function PhoneShell({ children }) {
  // En móvil real: ocupa toda la pantalla, sin frame
  if (isMobile()) {
    return (
      <div style={{
        width: "100%", minHeight: "100dvh",
        display: "flex", flexDirection: "column",
        background: T.surface,
        fontFamily: "'Poppins', sans-serif",
        overflowX: "hidden",
      }}>
        {children}
      </div>
    );
  }

  // En desktop: muestra el frame decorativo centrado
  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      padding: "32px 0 48px", background: "#0d0d0d", minHeight: "100vh",
    }}>
      <div style={{
        width: 390, background: T.surface, borderRadius: 48,
        border: "2px solid #2a2a2a",
        boxShadow: "0 0 0 8px #1a1a1a, 0 48px 96px rgba(0,0,0,0.7)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        minHeight: 760, fontFamily: "'Poppins', sans-serif",
      }}>
        {/* Notch */}
        <div style={{ background: "#0d0d0d", height: 34, display: "flex", justifyContent: "center", alignItems: "flex-end", paddingBottom: 6, flexShrink: 0 }}>
          <div style={{ background: "#1c1c1e", borderRadius: 10, width: 110, height: 18 }} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {children}
        </div>
        {/* Home indicator */}
        <div style={{ background: "#0d0d0d", height: 28, display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
          <div style={{ background: "#444", borderRadius: 4, width: 120, height: 4 }} />
        </div>
      </div>
    </div>
  );
}
