import { Text, TextInput, View } from "react-native";
import { T } from "../utils/theme";
import Ic from "./Ic";

export default function Field({
  label,
  type = "text",
  value,
  onChangeText,
  placeholder,
  iconName,
  right,
  error,
  autoComplete,
}) {
  const secureTextEntry = type === "password";
  const keyboardType = type === "email" ? "email-address" : type === "date" ? "default" : "default";

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
      <View style={{ position: "relative", justifyContent: "center" }}>
        {iconName && (
          <View style={{ position: "absolute", left: 11, zIndex: 1 }}>
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
          keyboardType={keyboardType}
          autoCapitalize={type === "email" ? "none" : "sentences"}
          style={{
            paddingVertical: 11,
            paddingRight: right ? 44 : 12,
            paddingLeft: iconName ? 38 : 12,
            borderWidth: 1.5,
            borderColor: error ? T.red : T.border,
            borderRadius: 10,
            fontSize: 14,
            backgroundColor: T.surface,
            color: T.text1,
          }}
        />
        {right && <View style={{ position: "absolute", right: 11 }}>{right}</View>}
      </View>
      {error && <Text style={{ fontSize: 12, color: T.red, marginTop: 3 }}>{error}</Text>}
    </View>
  );
}
