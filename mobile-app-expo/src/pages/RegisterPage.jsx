import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Controller } from "react-hook-form";
import { T } from "../utils/theme";
import { useRegisterForm } from "../hooks/useRegisterForm";
import { useBackAction } from "../hooks/useBackAction";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import DateField from "../components/DateField";
import CodeField from "../components/CodeField";
import Checkbox from "../components/Checkbox";
import ResendCode from "../components/ResendCode";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";
import TerminosPage from "./TerminosPage";
import { PASSWORD_MAX } from "../utils/validators";

export default function RegisterPage({ onBack, onSuccess, onAccountCreated }) {
  const {
    step,
    loading,
    resending,
    serverError,
    codeExpired,
    showPassword,
    toggleShowPassword,
    registeredEmail,
    resendIn,
    canResend,
    resendCode,
    backToData,
    dataForm,
    codeForm,
  } = useRegisterForm({ onSuccess, onAccountCreated });
  const [termsOpen, setTermsOpen] = useState(false);

  // Botón atrás de Android: cierra los términos o vuelve al paso 1.
  useBackAction(() => {
    if (termsOpen) {
      setTermsOpen(false);
      return true;
    }
    if (step === 2) {
      backToData();
      return true;
    }
    return false;
  }, termsOpen || step === 2);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AuthHeader
        title={step === 1 ? "Crear cuenta" : "Verifica tu correo"}
        sub={step === 1 ? "Solo para clientes" : `Código enviado a ${registeredEmail}`}
        onBack={step === 1 ? onBack : backToData}
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
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <Alert msg={serverError} type={codeExpired ? "warn" : "error"} />
        {step === 1 ? (
          <>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Controller
                  control={dataForm.control}
                  name="name"
                  rules={dataForm.rules.name}
                  render={({ field }) => (
                    <Field label="Nombre" type="name" value={field.value} onChangeText={field.onChange} placeholder="Juan" maxLength={60} autoComplete="given-name" error={dataForm.errors.name?.message} />
                  )}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Controller
                  control={dataForm.control}
                  name="lastname"
                  rules={dataForm.rules.lastname}
                  render={({ field }) => (
                    <Field label="Apellido" type="name" value={field.value} onChangeText={field.onChange} placeholder="Pérez" maxLength={60} autoComplete="family-name" error={dataForm.errors.lastname?.message} />
                  )}
                />
              </View>
            </View>
            <Controller
              control={dataForm.control}
              name="birthdate"
              rules={dataForm.rules.birthdate}
              render={({ field }) => (
                <DateField value={field.value} onChange={field.onChange} error={dataForm.errors.birthdate?.message} />
              )}
            />
            <Controller
              control={dataForm.control}
              name="email"
              rules={dataForm.rules.email}
              render={({ field }) => (
                <Field
                  label="Correo"
                  type="email"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="correo@ejemplo.com"
                  iconName="mail"
                  autoComplete="email"
                  maxLength={254}
                  error={dataForm.errors.email?.message}
                />
              )}
            />
            <Controller
              control={dataForm.control}
              name="pw"
              rules={dataForm.rules.pw}
              render={({ field }) => (
                <Field
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  autoCapitalize="none"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Mínimo 8 caracteres"
                  iconName="lock"
                  maxLength={PASSWORD_MAX}
                  autoComplete="new-password"
                  error={dataForm.errors.pw?.message}
                  right={
                    <TouchableOpacity onPress={toggleShowPassword} accessibilityLabel={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                      <Ic n={showPassword ? "eyeOff" : "eye"} size={17} color={T.textMut} />
                    </TouchableOpacity>
                  }
                />
              )}
            />
            <Controller
              control={dataForm.control}
              name="pw2"
              rules={dataForm.rules.pw2}
              render={({ field }) => (
                <Field
                  label="Confirmar contraseña"
                  type={showPassword ? "text" : "password"}
                  autoCapitalize="none"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Repite tu contraseña"
                  iconName="lock"
                  maxLength={PASSWORD_MAX}
                  error={dataForm.errors.pw2?.message}
                />
              )}
            />
            <Controller
              control={dataForm.control}
              name="terms"
              rules={dataForm.rules.terms}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={field.onChange}
                  label="He leído y acepto los"
                  error={dataForm.errors.terms?.message}
                  extra={
                    <TouchableOpacity onPress={() => setTermsOpen(true)} accessibilityRole="link" hitSlop={6}>
                      <Text style={{ fontSize: 13, color: T.purple, fontWeight: "700", textDecorationLine: "underline" }}>
                        Términos y condiciones
                      </Text>
                    </TouchableOpacity>
                  }
                />
              )}
            />
            <Btn onPress={dataForm.submit} disabled={loading}>
              {loading ? "Enviando código..." : "Continuar"}
            </Btn>
          </>
        ) : (
          <>
            <View style={{ alignItems: "center", paddingVertical: 16 }}>
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
              <Text style={{ fontSize: 14, color: T.text2, lineHeight: 22, maxWidth: 280, textAlign: "center" }}>
                Escribe el código de 6 caracteres que enviamos a{"\n"}
                <Text style={{ fontWeight: "800" }}>{registeredEmail}</Text>
              </Text>
            </View>
            <Controller
              control={codeForm.control}
              name="code"
              rules={codeForm.rules.code}
              render={({ field }) => (
                <CodeField value={field.value} onChangeText={field.onChange} error={codeForm.errors.code?.message} />
              )}
            />
            <Btn onPress={codeForm.submit} disabled={loading || codeExpired}>
              {loading ? "Verificando..." : "Activar cuenta"}
            </Btn>
            <ResendCode
              canResend={canResend}
              resendIn={resendIn}
              resending={resending}
              onResend={resendCode}
              onBack={backToData}
              backLabel="Corregir mis datos"
            />
          </>
        )}
      </ScrollView>

      <Modal visible={termsOpen} animationType="slide" onRequestClose={() => setTermsOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
          <AuthHeader title="Términos" sub="Maquilishuat S.A. de C.V." onBack={() => setTermsOpen(false)} />
          <TerminosPage />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
