import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Controller } from "react-hook-form";
import { T } from "../utils/theme";
import { useForgotPasswordForm } from "../hooks/useForgotPasswordForm";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function ForgotPage({ onBack }) {
  const { step, loading, serverError, done, emailForm, codeForm, passwordForm } = useForgotPasswordForm();

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
            <Alert msg={serverError} />
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
                      error={emailForm.errors.email?.message}
                    />
                  )}
                />
                <Btn onPress={emailForm.submit} disabled={loading}>{loading ? "Enviando..." : "Enviar código"}</Btn>
              </>
            )}
            {step === 2 && (
              <>
                <Controller
                  control={codeForm.control}
                  name="code"
                  rules={codeForm.rules.code}
                  render={({ field }) => (
                    <Field
                      label="Código recibido"
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Ingresa el código"
                      error={codeForm.errors.code?.message}
                    />
                  )}
                />
                <Btn onPress={codeForm.submit} disabled={loading}>{loading ? "Verificando..." : "Verificar código"}</Btn>
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
                      type="password"
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Mínimo 8 caracteres, 1 letra y 1 número"
                      iconName="lock"
                      error={passwordForm.errors.pw?.message}
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
                      type="password"
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Repite la contraseña"
                      iconName="lock"
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
