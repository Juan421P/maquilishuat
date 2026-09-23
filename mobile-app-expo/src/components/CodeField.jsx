import Field from "./Field";
import { CODE_LENGTH, sanitizeCode } from "../utils/validators";

// Campo para los códigos que llegan por correo (6 caracteres hexadecimales,
// p. ej. "a3f9c1"). Registro y recuperación usan exactamente este mismo
// componente:
// - nunca pone mayúsculas (autoCapitalize="none" y se pasa a minúscula)
// - solo deja 0-9 y a-f
// - máximo 6 caracteres
export default function CodeField({ value, onChangeText, error, label = "Código de verificación" }) {
  return (
    <Field
      label={label}
      type="code"
      value={value}
      onChangeText={(text) => onChangeText(sanitizeCode(text))}
      placeholder="p. ej. a3f9c1"
      maxLength={CODE_LENGTH}
      autoCapitalize="none"
      autoComplete="one-time-code"
      error={error}
      hint="6 caracteres: números 0-9 y letras a-f"
      inputStyle={{ fontSize: 20, letterSpacing: 6, fontWeight: "700", textAlign: "center" }}
      inputProps={{ autoCorrect: false, spellCheck: false, textContentType: "oneTimeCode", importantForAutofill: "yes" }}
    />
  );
}
