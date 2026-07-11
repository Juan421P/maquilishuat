import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { reviewsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ProductReviews({ productId }) {
  const { isLoggedIn, isClient } = useAuth();
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    reviewsAPI.getByProduct(productId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async () => {
    if (rating === 0) { setError("Selecciona una calificación"); return; }
    setSubmitting(true);
    setError("");
    try {
      await reviewsAPI.create(productId, rating, comment);
      setRating(0);
      setComment("");
      setOk(true);
      load();
    } catch (e) {
      setError(e.message || "No se pudo enviar la reseña");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ borderTop: "1px solid var(--gray-100)", marginTop: 10, paddingTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <Star key={n} size={13} fill={n <= Math.round(data.average) ? "var(--brand-500)" : "none"} color="var(--brand-500)" />
        ))}
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {data.average > 0 ? data.average.toFixed(1) : "Sin calificaciones"} {data.count > 0 && `(${data.count})`}
        </span>
      </div>

      {loading && <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Cargando reseñas...</p>}

      {!loading && data.reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, maxHeight: 120, overflowY: "auto" }}>
          {data.reviews.map(r => (
            <div key={r._id} style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              <strong>{r.user_id?.name || "Cliente"}</strong> — {"★".repeat(r.rating)}{r.comment ? `: ${r.comment}` : ""}
            </div>
          ))}
        </div>
      )}

      {isLoggedIn && isClient && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ok && <p style={{ fontSize: 11.5, color: "#16a34a" }}>¡Gracias por tu reseña!</p>}
          {error && <p style={{ fontSize: 11.5, color: "#dc2626" }}>{error}</p>}
          <div style={{ display: "flex", gap: 3 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setRating(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <Star size={16} fill={n <= rating ? "var(--brand-500)" : "none"} color="var(--brand-500)" />
              </button>
            ))}
          </div>
          <input
            value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Comentario (opcional)"
            style={{ padding: "6px 8px", border: "1.5px solid var(--gray-200)", borderRadius: 6, fontSize: 12, fontFamily: "var(--font-sans)" }}
          />
          <button
            onClick={handleSubmit} disabled={submitting}
            style={{ alignSelf: "flex-start", padding: "5px 12px", borderRadius: 6, border: "none", background: "var(--brand-500)", color: "white", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            {submitting ? "Enviando..." : "Calificar producto"}
          </button>
        </div>
      )}
    </div>
  );
}
