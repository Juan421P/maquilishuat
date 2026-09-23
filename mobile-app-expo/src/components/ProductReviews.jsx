import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { Controller } from "react-hook-form";
import { T } from "../utils/theme";
import { useAuth } from "../context/AuthContext";
import { useProductReviews } from "../hooks/useProductReviews";
import { COMMENT_MAX } from "../utils/validators";
import Ic from "./Ic";

// `showAll`: en el detalle de producto se muestran todas las reseñas; en la
// tarjeta del catálogo se limita a las 3 más recientes.
export default function ProductReviews({ productId, showAll = false }) {
  const { isLoggedIn } = useAuth();
  const { data, loading, loadError, reload, submitting, ok, serverError, eligibility, myReview, control, errors, submit, rules } =
    useProductReviews(productId);

  const visible = showAll ? data.reviews : data.reviews.slice(0, 3);

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

      {loading && <Text style={{ fontSize: 11.5, color: T.textMut, marginBottom: 8 }}>Cargando reseñas...</Text>}
      {!loading && loadError ? (
        <TouchableOpacity onPress={reload} style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 11.5, color: T.red }}>{loadError} · Toca para reintentar</Text>
        </TouchableOpacity>
      ) : null}

      {!loading && visible.length > 0 && (
        <View style={{ marginBottom: 10, gap: 6 }}>
          {visible.map((r) => (
            <Text key={r._id} style={{ fontSize: 12, color: T.text3, lineHeight: 17 }}>
              <Text style={{ fontWeight: "700", color: T.text2 }}>{r.user_id?.name || "Cliente"}</Text> — {"★".repeat(r.rating)}
              {r.comment ? `: ${r.comment}` : ""}
            </Text>
          ))}
          {!showAll && data.reviews.length > visible.length && (
            <Text style={{ fontSize: 11, color: T.textMut }}>y {data.reviews.length - visible.length} reseña(s) más en el detalle</Text>
          )}
        </View>
      )}

      {isLoggedIn && eligibility === "reviewed" && (
        <View style={{ backgroundColor: "#f0fdf4", borderRadius: 8, padding: 9 }}>
          <Text style={{ fontSize: 12, color: "#15803d", fontWeight: "700" }}>
            {ok ? "¡Gracias por tu reseña!" : "Ya calificaste este producto"} · {"★".repeat(myReview?.rating || 0)}
          </Text>
        </View>
      )}

      {isLoggedIn && eligibility === "not_purchased" && (
        <Text style={{ fontSize: 11.5, color: T.textMut }}>Podrás calificar este producto después de comprarlo.</Text>
      )}

      {isLoggedIn && eligibility === "can_review" && (
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: T.text2 }}>Califica tu compra</Text>
          {serverError ? <Text style={{ fontSize: 11.5, color: T.red }}>{serverError}</Text> : null}

          <Controller
            control={control}
            name="rating"
            rules={rules.rating}
            render={({ field }) => (
              <View style={{ flexDirection: "row", gap: 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => field.onChange(n)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel={`${n} estrella${n > 1 ? "s" : ""}`}
                    accessibilityState={{ selected: field.value === n }}
                  >
                    <Ic n="star" size={22} color={n <= field.value ? T.purple : T.border} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.rating ? <Text style={{ fontSize: 11, color: T.red }}>{errors.rating.message}</Text> : null}

          <Controller
            control={control}
            name="comment"
            rules={rules.comment}
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder={`Comentario (opcional, máx. ${COMMENT_MAX} caracteres)`}
                placeholderTextColor={T.textMut}
                maxLength={COMMENT_MAX}
                multiline
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  borderWidth: 1.5,
                  borderColor: errors.comment ? T.red : T.border,
                  borderRadius: 8,
                  fontSize: 13,
                  color: T.text1,
                  minHeight: 44,
                  textAlignVertical: "top",
                }}
              />
            )}
          />
          {errors.comment ? <Text style={{ fontSize: 11, color: T.red }}>{errors.comment.message}</Text> : null}

          <TouchableOpacity
            onPress={submit}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting }}
            style={{
              alignSelf: "flex-start",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: T.purple,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
              {submitting ? "Enviando..." : "Publicar reseña"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
