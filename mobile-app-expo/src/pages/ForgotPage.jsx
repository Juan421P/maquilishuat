import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Controller } from "react-hook-form";
import { T } from "../utils/theme";
import { useForgotPasswordForm } from "../hooks/useForgotPasswordForm";
import { useBackAction } from "../hooks/useBackAction";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import CodeField from "../components/CodeField";
import ResendCode from "../components/ResendCode";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";
import { PASSWORD_MAX } from "../utils/validators";

const SUBTITLES = {
  1: "Te enviaremos un código a tu correo",
  2: "Revisa tu correo",
  3: "Crea tu nueva contraseña",
};

export default function ForgotPage({ onBack }) {
  const {
    step,
    loading,
    resending,
    serverError,
    codeExpired,
    done,
    sentTo,
    resendIn,
    canResend,
    resendCode,
    backStep,
    emailForm,
    codeForm,
    passwordForm,
  } = useForgotPasswordForm();
  const [show, setShow] = useState(false);

  // Botón atrás de Android: vuelve al paso anterior dentro del flujo.
  useBackAction(() => {
    backStep();
    return true;
  }, !done && step > 1);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AuthHeader title="Recuperar acceso" sub={done ? "Contraseña actualizada" : SUBTITLES[step]} onBack={!done && step > 1 ? backStep : onBack} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 28 }} keyboardShouldPersistTaps="handled">
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
            <View style={{ width: "100%" }}>
              <Btn onPress={onBack}>Ir a iniciar sesión</Btn>
            </View>
          </View>
        ) : (
          <>
            <Alert msg={serverError} type={codeExpired ? "warn" : "error"} />
            {step === 1 && (
              <>
                <Controller
                  control={emailForm.control}
                  name="email"
                  rules={emailForm.rules.email}
                  render={({ field }) => (
                    <Field
                      label="Correo electrónico"
                      type="email"
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="correo@ejemplo.com"
                      iconName="mail"
                      autoComplete="email"
                      maxLength={254}
                      error={emailForm.errors.email?.message}
                    />
                  )}
                />
                <Btn onPress={emailForm.submit} disabled={loading}>{loading ? "Enviando..." : "Enviar código"}</Btn>
              </>
            )}
            {step === 2 && (
              <>
                <Text style={{ fontSize: 14, color: T.text2, lineHeight: 21, marginBottom: 16, textAlign: "center" }}>
                  Escribe el código de 6 caracteres que enviamos a{"\n"}
                  <Text style={{ fontWeight: "800" }}>{sentTo}</Text>
                </Text>
                <Controller
                  control={codeForm.control}
                  name="code"
                  rules={codeForm.rules.code}
                  render={({ field }) => (
                    <CodeField label="Código recibido" value={field.value} onChangeText={field.onChange} error={codeForm.errors.code?.message} />
                  )}
                />
                <Btn onPress={codeForm.submit} disabled={loading || codeExpired}>{loading ? "Verificando..." : "Verificar código"}</Btn>
                <ResendCode canResend={canResend} resendIn={resendIn} resending={resending} onResend={resendCode} onBack={backStep} />
              </>
            )}
            {step === 3 && (
              <>
                <Controller
                  control={passwordForm.control}
                  name="pw"
                  rules={passwordForm.rules.pw}
                  render={({ field }) => (
                    <Field
                      label="Nueva contraseña"
                      type={show ? "text" : "password"}
                      autoCapitalize="none"
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Mínimo 8 caracteres"
                      iconName="lock"
                      maxLength={PASSWORD_MAX}
                      autoComplete="new-password"
                      error={passwordForm.errors.pw?.message}
                      right={
                        <TouchableOpacity onPress={() => setShow((s) => !s)} accessibilityLabel={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
                          <Ic n={show ? "eyeOff" : "eye"} size={17} color={T.textMut} />
                        </TouchableOpacity>
                      }
                    />
                  )}
                />
                <Controller
                  control={passwordForm.control}
                  name="pw2"
                  rules={passwordForm.rules.pw2}
                  render={({ field }) => (
                    <Field
                      label="Confirmar contraseña"
                      type={show ? "text" : "password"}
                      autoCapitalize="none"
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Repite la contraseña"
                      iconName="lock"
                      maxLength={PASSWORD_MAX}
                      error={passwordForm.errors.pw2?.message}
                    />
                  )}
                />
                <Btn onPress={passwordForm.submit} disabled={loading}>{loading ? "Guardando..." : "Guardar contraseña"}</Btn>
              </>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
