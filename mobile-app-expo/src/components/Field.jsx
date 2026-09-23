import { Text, TextInput, View } from "react-native";
import { T } from "../utils/theme";
import Ic from "./Ic";

// Mayúscula automática según el tipo de campo. Antes todos los campos que
// no eran "email" usaban "sentences", y eso convertía la primera letra de
// los códigos de verificación en mayúscula (el backend los rechazaba).
const AUTO_CAPITALIZE = {
  email: "none",
  password: "none",
  code: "none",
  name: "words",
  text: "sentences",
};

export default function Field({
  label,
  type = "text",
  value,
  onChangeText,
  placeholder,
  iconName,
  right,
  error,
  hint,
  autoComplete,
  autoCapitalize,
  keyboardType,
  maxLength,
  editable = true,
  multiline = false,
  inputStyle,
  inputProps = {},
}) {
  const secureTextEntry = type === "password";
  const resolvedKeyboard = keyboardType || (type === "email" ? "email-address" : "default");

  return (
    <View style={{ marginBottom: 14 }}>
      {label && (
        <Text
          style={{
            fontSize: 11,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 0.6,
            color: T.text3,
            marginBottom: 5,
          }}
        >
          {label}
        </Text>
      )}
      <View style={{ position: "relative", justifyContent: multiline ? "flex-start" : "center" }}>
        {iconName && (
          <View style={{ position: "absolute", left: 11, top: multiline ? 13 : undefined, zIndex: 1 }}>
            <Ic n={iconName} size={16} color={T.textMut} />
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={T.textMut}
          autoComplete={autoComplete}
          secureTextEntry={secureTextEntry}
          keyboardType={resolvedKeyboard}
          autoCapitalize={autoCapitalize || AUTO_CAPITALIZE[type] || "sentences"}
          autoCorrect={type === "text" || type === "name"}
          maxLength={maxLength}
          editable={editable}
          multiline={multiline}
          accessibilityLabel={label || placeholder}
          style={[
            {
              paddingVertical: 11,
              paddingRight: right ? 44 : 12,
              paddingLeft: iconName ? 38 : 12,
              borderWidth: 1.5,
              borderColor: error ? T.red : T.border,
              borderRadius: 10,
              fontSize: 14,
              backgroundColor: editable ? T.surface : T.bg,
              color: editable ? T.text1 : T.text3,
            },
            multiline && { minHeight: 80, textAlignVertical: "top" },
            inputStyle,
          ]}
          {...inputProps}
        />
        {right && <View style={{ position: "absolute", right: 11 }}>{right}</View>}
      </View>
      {error ? (
        <Text style={{ fontSize: 12, color: T.red, marginTop: 3 }}>{error}</Text>
      ) : hint ? (
        <Text style={{ fontSize: 11.5, color: T.textMut, marginTop: 3 }}>{hint}</Text>
      ) : null}
    </View>
  );
}
