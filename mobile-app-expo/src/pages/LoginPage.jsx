import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Controller } from "react-hook-form";
import { T } from "../utils/theme";
import { useLoginForm } from "../hooks/useLoginForm";
import AuthHeader from "../layout/AuthHeader";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";

export default function LoginPage({ onSuccess, onRegister, onForgot, onBack }) {
  const { control, errors, loading, serverError, showPassword, toggleShowPassword, submit, rules } =
    useLoginForm({ onSuccess });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#fff" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AuthHeader title="Bienvenido" sub="Accede a tu cuenta de cliente" onBack={onBack} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24, paddingTop: 28 }}>
        <Alert msg={serverError} />
        <Controller
          control={control}
          name="email"
          rules={rules.email}
          render={({ field }) => (
            <Field
              label="Correo"
              type="email"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="correo@ejemplo.com"
              iconName="mail"
              autoComplete="email"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="pw"
          rules={rules.pw}
          render={({ field }) => (
            <Field
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={field.value}
              onChangeText={field.onChange}
              placeholder="••••••••"
              iconName="lock"
              error={errors.pw?.message}
              right={
                <TouchableOpacity onPress={toggleShowPassword}>
                  <Ic n={showPassword ? "eyeOff" : "eye"} size={18} color={T.textMut} />
                </TouchableOpacity>
              }
            />
          )}
        />
        <TouchableOpacity onPress={onForgot} style={{ marginBottom: 24 }}>
          <Text style={{ color: T.purple, fontSize: 14, fontWeight: "600" }}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
        <Btn onPress={submit} disabled={loading}>
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
