import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { T } from "../utils/theme";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function LoginPage({ onSuccess, onRegister, onForgot, onBack }) {
  const { login } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", pw: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErr("");
  };

  const handle = async () => {
    if (!form.email || !form.pw) {
      setErr("Completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.pw);
      toast?.success("Sesión iniciada");
      onSuccess();
    } catch (e) {
      const msg = e.message || "Correo o contraseña incorrectos";
      setErr(msg);
      toast?.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AuthHeader title="Bienvenido" sub="Accede a tu cuenta de cliente" onBack={onBack} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 28 }}>
        <Alert msg={err} />
        <Field label="Correo" type="email" value={form.email} onChangeText={set("email")} placeholder="correo@ejemplo.com" iconName="mail" autoComplete="email" />
        <Field
          label="Contraseña"
          type={show ? "text" : "password"}
          value={form.pw}
          onChangeText={set("pw")}
          placeholder="••••••••"
          iconName="lock"
          right={
            <TouchableOpacity onPress={() => setShow((s) => !s)}>
              <Ic n={show ? "eyeOff" : "eye"} size={18} color={T.textMut} />
            </TouchableOpacity>
          }
        />
        <TouchableOpacity onPress={onForgot} style={{ marginBottom: 24 }}>
          <Text style={{ color: T.purple, fontSize: 14, fontWeight: "600" }}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        <Btn onPress={handle} disabled={loading}>
          {loading ? "Verificando..." : "Ingresar"}
        </Btn>
        <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 20 }}>
          <Text style={{ fontSize: 15, color: T.text3 }}>¿Sin cuenta? </Text>
          <TouchableOpacity onPress={onRegister}>
            <Text style={{ fontSize: 15, color: T.purple, fontWeight: "700" }}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
