import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { T } from "../utils/theme";
import AppBar from "../layout/AppBar";
import Field from "../components/Field";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { clientsAPI } from "../services/api";
import { ApiError, getErrorMessage } from "../utils/errors";
import { validatePassword, validateConfirmPassword, validateRequired, rhfRule, PASSWORD_MAX } from "../utils/validators";

export default function ChangePasswordPage({ onBack }) {
  const { user } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [show, setShow] = useState(false);

  const { control, handleSubmit, getValues, setError, formState: { errors } } = useForm({
    defaultValues: { current: "", pw: "", pw2: "" },
    mode: "onSubmit",
  });

  const save = handleSubmit(async ({ current, pw }) => {
    setServerError("");
    if (current === pw) {
      setError("pw", { message: "La nueva contraseña debe ser distinta a la actual" });
      return;
    }
    setSaving(true);
    try {
      await clientsAPI.update(user.id, { currentPassword: current, newPassword: pw });
      toast?.success("Contraseña actualizada");
      onBack();
    } catch (e) {
      if (e instanceof ApiError && e.data?.field === "currentPassword") {
        setError("current", { message: e.message });
      } else {
        setServerError(getErrorMessage(e, "No se pudo cambiar la contraseña"));
      }
    } finally {
      setSaving(false);
    }
  });

  const eye = (
    <TouchableOpacity onPress={() => setShow((s) => !s)} accessibilityLabel={show ? "Ocultar contraseñas" : "Mostrar contraseñas"}>
      <Ic n={show ? "eyeOff" : "eye"} size={18} color={T.textMut} />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AppBar title="Cambiar contraseña" onBack={onBack} />
      <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 14 }}>
          <Text style={{ fontSize: 13, color: T.text3, marginBottom: 14, lineHeight: 19 }}>
            Por seguridad, primero confirma tu contraseña actual. La nueva debe tener entre 8 y {PASSWORD_MAX} caracteres.
          </Text>
          <Alert msg={serverError} />
          <Controller
            control={control}
            name="current"
            rules={{ validate: rhfRule(validateRequired, "La contraseña actual") }}
            render={({ field }) => (
              <Field label="Contraseña actual" type={show ? "text" : "password"} autoCapitalize="none" value={field.value} onChangeText={field.onChange} iconName="lock" error={errors.current?.message} right={eye} />
            )}
          />
          <Controller
            control={control}
            name="pw"
            rules={{ validate: rhfRule(validatePassword) }}
            render={({ field }) => (
              <Field label="Nueva contraseña" type={show ? "text" : "password"} autoCapitalize="none" value={field.value} onChangeText={field.onChange} iconName="lock" maxLength={PASSWORD_MAX} placeholder="Mínimo 8 caracteres" error={errors.pw?.message} />
            )}
          />
          <Controller
            control={control}
            name="pw2"
            rules={{ validate: (v) => validateConfirmPassword(getValues("pw"), v) || true }}
            render={({ field }) => (
              <Field label="Confirmar nueva contraseña" type={show ? "text" : "password"} autoCapitalize="none" value={field.value} onChangeText={field.onChange} iconName="lock" maxLength={PASSWORD_MAX} error={errors.pw2?.message} />
            )}
          />
          <Btn onPress={save} disabled={saving}>{saving ? "Guardando..." : "Cambiar contraseña"}</Btn>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
