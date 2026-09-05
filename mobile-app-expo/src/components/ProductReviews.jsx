import { useState, useEffect, useCallback } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import { reviewsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { validateRating, validateComment, runValidators } from "../utils/validators";
import Ic from "./Ic";

export default function ProductReviews({ productId }) {
  const { isLoggedIn } = useAuth();
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
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
    const { valid, errors } = runValidators({
      rating: validateRating(rating),
      comment: validateComment(comment),
    });
    setFieldErrors(errors);
    if (!valid) return;

    setSubmitting(true);
    try {
      await reviewsAPI.create(productId, rating, comment.trim());
      setRating(0);
      setComment("");
      setFieldErrors({});
      setOk(true);
      load();
    } catch (e) {
      setFieldErrors({ submit: e.message || "No se pudo enviar la reseña" });
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
          {fieldErrors.submit ? <Text style={{ fontSize: 11, color: T.red }}>{fieldErrors.submit}</Text> : null}
          <View style={{ flexDirection: "row", gap: 3 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => { setRating(n); setFieldErrors((e) => ({ ...e, rating: "" })); }}>
                <Ic n="star" size={16} color={n <= rating ? T.purple : T.border} />
              </TouchableOpacity>
            ))}
          </View>
          {fieldErrors.rating ? <Text style={{ fontSize: 11, color: T.red }}>{fieldErrors.rating}</Text> : null}
          <TextInput
            value={comment}
            onChangeText={(v) => { setComment(v); setFieldErrors((e) => ({ ...e, comment: "" })); }}
            placeholder="Comentario (opcional, máx. 500 caracteres)"
            placeholderTextColor={T.textMut}
            maxLength={500}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 8,
              borderWidth: 1.5,
              borderColor: fieldErrors.comment ? T.red : T.border,
              borderRadius: 6,
              fontSize: 12,
              color: T.text1,
            }}
          />
          {fieldErrors.comment ? <Text style={{ fontSize: 11, color: T.red }}>{fieldErrors.comment}</Text> : null}
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
