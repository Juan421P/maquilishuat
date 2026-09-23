import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Controller } from "react-hook-form";
import { T } from "../utils/theme";
import { useRegisterForm } from "../hooks/useRegisterForm";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function RegisterPage({ onBack, onSuccess }) {
  const {
    step,
    loading,
    serverError,
    showPassword,
    toggleShowPassword,
    dataForm,
    codeForm,
  } = useRegisterForm({ onSuccess });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AuthHeader
        title={step === 1 ? "Crear cuenta" : "Verifica tu correo"}
        sub={step === 1 ? "Solo para clientes" : "Código enviado a tu correo"}
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
        <Alert msg={serverError} />
        {step === 1 ? (
          <>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Controller
                  control={dataForm.control}
                  name="name"
                  rules={dataForm.rules.name}
                  render={({ field }) => (
                    <Field label="Nombre" value={field.value} onChangeText={field.onChange} placeholder="Juan" error={dataForm.errors.name?.message} />
                  )}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Controller
                  control={dataForm.control}
                  name="lastname"
                  rules={dataForm.rules.lastname}
                  render={({ field }) => (
                    <Field label="Apellido" value={field.value} onChangeText={field.onChange} placeholder="Pérez" error={dataForm.errors.lastname?.message} />
                  )}
                />
              </View>
            </View>
            <Controller
              control={dataForm.control}
              name="birthdate"
              rules={dataForm.rules.birthdate}
              render={({ field }) => (
                <Field
                  label="Fecha de nacimiento (AAAA-MM-DD)"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="1995-04-20"
                  error={dataForm.errors.birthdate?.message}
                />
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
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Mínimo 8 caracteres, 1 letra y 1 número"
                  iconName="lock"
                  error={dataForm.errors.pw?.message}
                  right={
                    <TouchableOpacity onPress={toggleShowPassword}>
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
                  type="password"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Repite tu contraseña"
                  iconName="lock"
                  error={dataForm.errors.pw2?.message}
                />
              )}
            />
            <Btn onPress={dataForm.submit} disabled={loading}>
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
            <Controller
              control={codeForm.control}
              name="code"
              rules={codeForm.rules.code}
              render={({ field }) => (
                <Field
                  label="Código de verificación"
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Ingresa el código"
                  error={codeForm.errors.code?.message}
                />
              )}
            />
            <Btn onPress={codeForm.submit} disabled={loading}>
              {loading ? "Verificando..." : "Activar cuenta"}
            </Btn>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
