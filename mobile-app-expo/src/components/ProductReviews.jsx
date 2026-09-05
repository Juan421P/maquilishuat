import { useState, useEffect, useCallback } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
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
    reviewsAPI
      .getByProduct(productId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setErr("Selecciona una calificación");
      return;
    }
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
    <View style={{ borderTopWidth: 1, borderTopColor: T.border, marginTop: 10, paddingTop: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Ic key={n} n="star" size={13} color={n <= Math.round(data.average) ? T.purple : T.border} />
        ))}
        <Text style={{ fontSize: 11.5, color: T.textMut }}>
          {data.average > 0 ? data.average.toFixed(1) : "Sin calificaciones"}
          {data.count > 0 ? ` (${data.count})` : ""}
        </Text>
      </View>

      {!loading && data.reviews.length > 0 && (
        <ScrollView style={{ maxHeight: 100, marginBottom: 10 }}>
          {data.reviews.map((r) => (
            <Text key={r._id} style={{ fontSize: 11.5, color: T.text3, marginBottom: 4 }}>
              <Text style={{ fontWeight: "700" }}>{r.user_id?.name || "Cliente"}</Text> — {"★".repeat(r.rating)}
              {r.comment ? `: ${r.comment}` : ""}
            </Text>
          ))}
        </ScrollView>
      )}

      {isLoggedIn && (
        <View style={{ gap: 6 }}>
          {ok && <Text style={{ fontSize: 11, color: T.green }}>¡Gracias por tu reseña!</Text>}
          {err ? <Text style={{ fontSize: 11, color: T.red }}>{err}</Text> : null}
          <View style={{ flexDirection: "row", gap: 3 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)}>
                <Ic n="star" size={16} color={n <= rating ? T.purple : T.border} />
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Comentario (opcional)"
            placeholderTextColor={T.textMut}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 8,
              borderWidth: 1.5,
              borderColor: T.border,
              borderRadius: 6,
              fontSize: 12,
              color: T.text1,
            }}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              alignSelf: "flex-start",
              paddingVertical: 5,
              paddingHorizontal: 12,
              borderRadius: 6,
              backgroundColor: T.purple,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              {submitting ? "Enviando..." : "Calificar"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
