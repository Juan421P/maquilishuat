import { useState, useEffect, useCallback } from "react";
import { T } from "../utils/theme";
import { reviewsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Ic from "./Ic";

export default function ProductReviews({ productId }) {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");
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
    if (rating === 0) { setErr("Selecciona una calificación"); return; }
    setSubmitting(true);
    setErr("");
    try {
      await reviewsAPI.create(productId, rating, comment);
      setRating(0);
      setComment("");
      setOk(true);
      load();
    } catch (e) {
      setErr(e.message || "No se pudo enviar la reseña");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ borderTop: `1px solid ${T.border}`, marginTop: 10, paddingTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map(n => (
          <Ic key={n} n="star" size={13} color={n <= Math.round(data.average) ? T.purple : T.border} />
        ))}
        <span style={{ fontSize: 11.5, color: T.textMut }}>
          {data.average > 0 ? data.average.toFixed(1) : "Sin calificaciones"} {data.count > 0 && `(${data.count})`}
        </span>
      </div>

      {!loading && data.reviews.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 10, maxHeight: 100, overflowY: "auto" }}>
          {data.reviews.map(r => (
            <p key={r._id} style={{ fontSize: 11.5, color: T.text3 }}>
              <strong>{r.user_id?.name || "Cliente"}</strong> — {"★".repeat(r.rating)}{r.comment ? `: ${r.comment}` : ""}
            </p>
          ))}
        </div>
      )}

      {isLoggedIn && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ok && <p style={{ fontSize: 11, color: T.green }}>¡Gracias por tu reseña!</p>}
          {err && <p style={{ fontSize: 11, color: T.red }}>{err}</p>}
          <div style={{ display: "flex", gap: 3 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setRating(n)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <Ic n="star" size={16} color={n <= rating ? T.purple : T.border} />
              </button>
            ))}
          </div>
          <input
            value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Comentario (opcional)"
            style={{ padding: "6px 8px", border: `1.5px solid ${T.border}`, borderRadius: 6, fontSize: 12 }}
          />
          <button
            onClick={handleSubmit} disabled={submitting}
            style={{ alignSelf: "flex-start", padding: "5px 12px", borderRadius: 6, border: "none", background: T.purple, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
          >
            {submitting ? "Enviando..." : "Calificar"}
          </button>
        </div>
      )}
    </div>
  );
}
