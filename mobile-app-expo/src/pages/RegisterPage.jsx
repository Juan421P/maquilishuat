import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function RegisterPage({ onBack, onSuccess }) {
  const { login } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", lastname: "", birthdate: "", email: "", pw: "", pw2: "" });
  const [code, setCode] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (key) => (v) => {
    setForm((f) => ({ ...f, [key]: v }));
    setErr("");
  };

  const handleRegister = async () => {
    if (!form.name || !form.lastname || !form.birthdate || !form.email || !form.pw) {
      setErr("Completa todos los campos");
      return;
    }
    if (form.pw !== form.pw2) {
      setErr("Las contraseñas no coinciden");
      return;
    }
    if (form.pw.length < 6) {
      setErr("Mínimo 6 caracteres");
      return;
    }
    setLoading(true);
    try {
      await authAPI.register(form.name, form.lastname, form.birthdate, form.email, form.pw);
      toast?.info("Te enviamos un código de verificación a tu correo");
      setStep(2);
      setErr("");
    } catch (e) {
      setErr(e.message);
      toast?.error(e.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setErr("Ingresa el código");
      return;
    }
    setLoading(true);
    try {
      await authAPI.verifyCode(code);
      const user = await login(form.email, form.pw);
      toast?.success("Cuenta verificada");
      onSuccess(user);
    } catch (e) {
      setErr(e.message);
      toast?.error(e.message || "Código inválido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AuthHeader
        title={step === 1 ? "Crear cuenta" : "Verifica tu correo"}
        sub={step === 1 ? "Solo para clientes" : `Código enviado a ${form.email}`}
        onBack={onBack}
      />
      <View
        style={{
          backgroundColor: "#f8f9fb",
          paddingVertical: 10,
          paddingHorizontal: 20,
          flexDirection: "row",
          gap: 6,
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: T.border,
        }}
      >
        {[{ n: 1, l: "Datos" }, { n: 2, l: "Verificar" }].map(({ n, l }, i) => (
          <View key={n} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: step >= n ? T.purple : T.border,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {step > n ? (
                <Ic n="check" size={11} color="#fff" />
              ) : (
                <Text style={{ fontSize: 11, fontWeight: "700", color: step >= n ? "#fff" : T.textMut }}>{n}</Text>
              )}
            </View>
            <Text style={{ fontSize: 11, fontWeight: "600", color: step >= n ? T.purple : T.textMut }}>{l}</Text>
            {i < 1 && <View style={{ width: 20, height: 1, backgroundColor: step > 1 ? T.purple : T.border, marginLeft: 2 }} />}
          </View>
        ))}
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <Alert msg={err} />
        {step === 1 ? (
          <>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field label="Nombre" value={form.name} onChangeText={set("name")} placeholder="Juan" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Apellido" value={form.lastname} onChangeText={set("lastname")} placeholder="Pérez" />
              </View>
            </View>
            <Field label="Fecha de nacimiento (AAAA-MM-DD)" value={form.birthdate} onChangeText={set("birthdate")} placeholder="1995-04-20" />
            <Field label="Correo" type="email" value={form.email} onChangeText={set("email")} placeholder="correo@ejemplo.com" iconName="mail" autoComplete="email" />
            <Field
              label="Contraseña"
              type={show ? "text" : "password"}
              value={form.pw}
              onChangeText={set("pw")}
              placeholder="Mínimo 6 caracteres"
              iconName="lock"
              right={
                <TouchableOpacity onPress={() => setShow((s) => !s)}>
                  <Ic n={show ? "eyeOff" : "eye"} size={17} color={T.textMut} />
                </TouchableOpacity>
              }
            />
            <Field label="Confirmar contraseña" type="password" value={form.pw2} onChangeText={set("pw2")} placeholder="Repite tu contraseña" iconName="lock" />
            <Btn onPress={handleRegister} disabled={loading}>
              {loading ? "Registrando..." : "Continuar"}
            </Btn>
          </>
        ) : (
          <>
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: "#f3e8ff",
                  borderWidth: 2,
                  borderColor: "#d8b4fe",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Ic n="mail" size={28} color={T.purple} />
              </View>
              <Text style={{ fontSize: 14, color: T.text2, lineHeight: 22, maxWidth: 240, textAlign: "center" }}>
                Revisa tu bandeja y copia el código de verificación.
              </Text>
            </View>
            <Field label="Código de verificación" value={code} onChangeText={setCode} placeholder="Ingresa el código" />
            <Btn onPress={handleVerify} disabled={loading}>
              {loading ? "Verificando..." : "Activar cuenta"}
            </Btn>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
