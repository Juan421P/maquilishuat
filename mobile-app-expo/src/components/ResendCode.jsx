import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";

// "¿No te llegó? Reenviar código (en 42 s)". El backend también limita el
// reenvío (429), así que el contador se sincroniza con lo que responda.
export default function ResendCode({ canResend, resendIn, resending, onResend, onBack, backLabel = "Cambiar correo" }) {
  return (
    <View style={{ alignItems: "center", gap: 10, marginTop: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ fontSize: 13.5, color: T.text3 }}>¿No te llegó el código?</Text>
        {resending ? (
          <ActivityIndicator size="small" color={T.purple} />
        ) : (
          <TouchableOpacity
            onPress={onResend}
            disabled={!canResend}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canResend }}
            hitSlop={8}
          >
            <Text style={{ fontSize: 13.5, fontWeight: "700", color: canResend ? T.purple : T.textMut }}>
              {canResend ? "Reenviar código" : `Reenviar en ${resendIn} s`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {onBack && (
        <TouchableOpacity onPress={onBack} accessibilityRole="button" hitSlop={8}>
          <Text style={{ fontSize: 13, color: T.text3, textDecorationLine: "underline" }}>{backLabel}</Text>
        </TouchableOpacity>
      )}
      <Text style={{ fontSize: 11.5, color: T.textMut, textAlign: "center" }}>
        Revisa también la carpeta de spam. El código vence en 15 minutos.
      </Text>
    </View>
  );
}
