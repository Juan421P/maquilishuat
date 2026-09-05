import { useState } from "react";
import { View } from "react-native";
import AuthHeader from "../layout/AuthHeader";
import NosotrosPage from "./NosotrosPage";
import ContactoPage from "./ContactoPage";
import TerminosPage from "./TerminosPage";
import { T } from "../utils/theme";
import { Text, TouchableOpacity } from "react-native";

const TABS = [
  { id: "nosotros", label: "Nosotros" },
  { id: "contacto", label: "Contacto" },
  { id: "terminos", label: "Términos" },
];

export default function InfoHubPage({ onBack }) {
  const [tab, setTab] = useState("nosotros");

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <AuthHeader title="Maquilishuat" sub="Conócenos" onBack={onBack} />
      <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: T.border }}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setTab(t.id)}
            style={{ flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2, borderBottomColor: tab === t.id ? T.purple : "transparent" }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: tab === t.id ? T.purple : T.textMut }}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {tab === "nosotros" && <NosotrosPage />}
      {tab === "contacto" && <ContactoPage />}
      {tab === "terminos" && <TerminosPage />}
    </View>
  );
}
