import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Controller } from "react-hook-form";
import { T } from "../utils/theme";
import { useAuth } from "../context/AuthContext";
import { useProductReviews } from "../hooks/useProductReviews";
import Ic from "./Ic";

export default function ProductReviews({ productId }) {
  const { isLoggedIn } = useAuth();
  const { data, loading, submitting, ok, serverError, control, errors, submit, rules } =
    useProductReviews(productId);

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
          {serverError ? <Text style={{ fontSize: 11, color: T.red }}>{serverError}</Text> : null}

          <Controller
            control={control}
            name="rating"
            rules={rules.rating}
            render={({ field }) => (
              <View style={{ flexDirection: "row", gap: 3 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <TouchableOpacity key={n} onPress={() => field.onChange(n)}>
                    <Ic n="star" size={16} color={n <= field.value ? T.purple : T.border} />
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
                placeholder="Comentario (opcional, máx. 500 caracteres)"
                placeholderTextColor={T.textMut}
                maxLength={500}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  borderWidth: 1.5,
                  borderColor: errors.comment ? T.red : T.border,
                  borderRadius: 6,
                  fontSize: 12,
                  color: T.text1,
                }}
              />
            )}
          />
          {errors.comment ? <Text style={{ fontSize: 11, color: T.red }}>{errors.comment.message}</Text> : null}

          <TouchableOpacity
            onPress={submit}
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
