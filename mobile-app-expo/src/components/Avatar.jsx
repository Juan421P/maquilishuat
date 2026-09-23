import { useState } from "react";
import { Image, Text, View } from "react-native";
import Ic from "./Ic";

// Foto de perfil o, si no hay, las iniciales del cliente.
export default function Avatar({ uri, name, lastname, size = 68 }) {
  const [failed, setFailed] = useState(false);
  const initials = `${(name || "").trim()[0] || ""}${(lastname || "").trim()[0] || ""}`.toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(255,255,255,0.22)",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {uri && !failed ? (
        <Image source={{ uri }} style={{ width: size, height: size }} onError={() => setFailed(true)} accessibilityIgnoresInvertColors />
      ) : initials ? (
        <Text style={{ color: "#fff", fontSize: size * 0.36, fontWeight: "800" }}>{initials}</Text>
      ) : (
        <Ic n="user" size={size * 0.47} color="#fff" />
      )}
    </View>
  );
}
