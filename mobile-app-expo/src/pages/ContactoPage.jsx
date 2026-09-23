import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Controller } from "react-hook-form";
import { T } from "../utils/theme";
import Ic from "../components/Ic";
import Btn from "../components/Btn";
import { useContactForm } from "../hooks/useContactForm";

const INFO = [
  { icon: "phone", label: "Teléfono", lines: ["2222-0000", "WhatsApp disponible"] },
  { icon: "mail", label: "Correo", lines: ["pedidos@maquilishuat.com"] },
  { icon: "map", label: "Dirección", lines: ["Col. Escalón, San Salvador", "Solo con cita previa"] },
  { icon: "clock", label: "Horario", lines: ["Lun – Sáb: 7:00 a.m. – 5:00 p.m.", "Domingos cerrado"] },
];

export default function ContactoPage() {
  const { control, errors, submit, enviado, sendAnother, nombre, asuntos, rules } = useContactForm();

  if (enviado) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12 }}>
        <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" }}>
          <Ic n="ok" size={30} color={T.green} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: "800", color: T.text1 }}>¡Mensaje recibido!</Text>
        <Text style={{ fontSize: 13.5, color: T.text3, textAlign: "center", lineHeight: 20 }}>
          Gracias por escribirnos, {nombre || "visitante"}. Te contactaremos a la brevedad posible.
        </Text>
        <TouchableOpacity onPress={sendAnother} style={{ marginTop: 6 }}>
          <Text style={{ color: T.purple, fontWeight: "700", fontSize: 14 }}>Enviar otro mensaje</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: T.text1, marginBottom: 6 }}>Contáctanos</Text>
        <Text style={{ fontSize: 13.5, color: T.textMut, marginBottom: 18, lineHeight: 20 }}>
          ¿Tienes preguntas o quieres hacer un pedido? Te respondemos en menos de 24 horas.
        </Text>

        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>Tu nombre</Text>
          <Controller
            control={control}
            name="nombre"
            rules={rules.nombre}
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Juan Pérez"
                placeholderTextColor={T.textMut}
                style={{ borderWidth: 1.5, borderColor: errors.nombre ? T.red : T.border, borderRadius: 10, padding: 11, fontSize: 14, color: T.text1 }}
              />
            )}
          />
          {errors.nombre ? <Text style={{ fontSize: 12, color: T.red, marginTop: 3 }}>{errors.nombre.message}</Text> : null}
        </View>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>Correo electrónico</Text>
          <Controller
            control={control}
            name="email"
            rules={rules.email}
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={T.textMut}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ borderWidth: 1.5, borderColor: errors.email ? T.red : T.border, borderRadius: 10, padding: 11, fontSize: 14, color: T.text1 }}
              />
            )}
          />
          {errors.email ? <Text style={{ fontSize: 12, color: T.red, marginTop: 3 }}>{errors.email.message}</Text> : null}
        </View>
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>Asunto</Text>
          <Controller
            control={control}
            name="asunto"
            rules={rules.asunto}
            render={({ field }) => (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {asuntos.map((a) => (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => field.onChange(a.id)}
                    style={{ paddingVertical: 6, paddingHorizontal: 11, borderRadius: 99, backgroundColor: field.value === a.id ? T.purple : "#f3e8ff" }}
                  >
                    <Text style={{ fontSize: 11.5, fontWeight: "700", color: field.value === a.id ? "#fff" : T.purple }}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          />
          {errors.asunto ? <Text style={{ fontSize: 12, color: T.red, marginTop: 5 }}>{errors.asunto.message}</Text> : null}
        </View>
        <View style={{ marginBottom: 18 }}>
          <Text style={{ fontSize: 11, fontWeight: "700", textTransform: "uppercase", color: T.text3, marginBottom: 5 }}>Mensaje</Text>
          <Controller
            control={control}
            name="mensaje"
            rules={rules.mensaje}
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="Cuéntanos en qué te podemos ayudar (mín. 10 caracteres)..."
                placeholderTextColor={T.textMut}
                multiline
                numberOfLines={4}
                style={{ borderWidth: 1.5, borderColor: errors.mensaje ? T.red : T.border, borderRadius: 10, padding: 11, fontSize: 14, color: T.text1, minHeight: 90, textAlignVertical: "top" }}
              />
            )}
          />
          {errors.mensaje ? <Text style={{ fontSize: 12, color: T.red, marginTop: 3 }}>{errors.mensaje.message}</Text> : null}
        </View>
        <Btn onPress={submit}>Enviar mensaje</Btn>

        <Text style={{ fontSize: 15, fontWeight: "800", color: T.text1, marginTop: 28, marginBottom: 12 }}>Información de contacto</Text>
        <View style={{ gap: 12 }}>
          {INFO.map(({ icon, label, lines }) => (
            <View key={label} style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center" }}>
                <Ic n={icon} size={16} color={T.purple} />
              </View>
              <View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: T.text1 }}>{label}</Text>
                {lines.map((l, i) => (
                  <Text key={i} style={{ fontSize: 12, color: i > 0 ? T.textMut : T.text3 }}>{l}</Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
