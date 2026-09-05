import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { T } from "../utils/theme";
import { authAPI } from "../services/api";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function ForgotPage({ onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const s1 = async () => {
    if (!email) { setErr("Ingresa tu correo"); return; }
    setLoading(true);
    try { await authAPI.requestRecovery(email); setStep(2); setErr(""); }
    catch (e) { setErr(e.message); } finally { setLoading(false); }
  };
  const s2 = async () => {
    if (!code) { setErr("Ingresa el código"); return; }
    setLoading(true);
    try { await authAPI.verifyRecovery(code); setStep(3); setErr(""); }
    catch (e) { setErr(e.message); } finally { setLoading(false); }
  };
  const s3 = async () => {
    if (!pw || !pw2) { setErr("Completa los campos"); return; }
    if (pw !== pw2) { setErr("Las contraseñas no coinciden"); return; }
    setLoading(true);
    try { await authAPI.newPassword(pw, pw2); setDone(true); }
    catch (e) { setErr(e.message); } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AuthHeader title="Recuperar acceso" sub="Restablece tu contraseña" onBack={onBack} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 28 }}>
        {done ? (
          <View style={{ alignItems: "center", paddingTop: 36 }}>
            <View
              style={{
                width: 68, height: 68, borderRadius: 34,
                backgroundColor: "#f0fdf4",
                alignItems: "center", justifyContent: "center", marginBottom: 16,
              }}
            >
              <Ic n="ok" size={32} color={T.green} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "800", color: T.text1, marginBottom: 8 }}>¡Listo!</Text>
            <Text style={{ color: T.text3, fontSize: 14, marginBottom: 24, textAlign: "center" }}>
              Ya puedes iniciar sesión con tu nueva contraseña.
            </Text>
            <Btn onPress={onBack}>Ir a iniciar sesión</Btn>
          </View>
        ) : (
          <>
            <Alert msg={err} />
            {step === 1 && (
              <>
                <Field label="Correo electrónico" type="email" value={email}
                  onChangeText={(v) => { setEmail(v); setErr(""); }}
                  placeholder="correo@ejemplo.com" iconName="mail" />
                <Btn onPress={s1} disabled={loading}>{loading ? "Enviando..." : "Enviar código"}</Btn>
              </>
            )}
            {step === 2 && (
              <>
                <Field label="Código recibido" value={code}
                  onChangeText={(v) => { setCode(v); setErr(""); }}
                  placeholder="Ingresa el código" />
                <Btn onPress={s2} disabled={loading}>{loading ? "Verificando..." : "Verificar código"}</Btn>
              </>
            )}
            {step === 3 && (
              <>
                <Field label="Nueva contraseña" type="password" value={pw}
                  onChangeText={(v) => { setPw(v); setErr(""); }}
                  placeholder="Mínimo 6 caracteres" iconName="lock" />
                <Field label="Confirmar contraseña" type="password" value={pw2}
                  onChangeText={(v) => { setPw2(v); setErr(""); }}
                  placeholder="Repite la contraseña" iconName="lock" />
                <Btn onPress={s3} disabled={loading}>{loading ? "Guardando..." : "Guardar contraseña"}</Btn>
              </>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
