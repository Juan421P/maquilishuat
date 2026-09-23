import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
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
import { confirmAction } from "../utils/confirm";

// Eliminar la cuenta es irreversible: se pide la contraseña (el backend la
// verifica) y una confirmación final.
export default function DeleteAccountPage({ onBack, onDeleted }) {
  const { user, forgetAccount } = useAuth();
  const toast = useToast();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const doDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await clientsAPI.remove(user.id, password);
      await forgetAccount();
      toast?.success("Tu cuenta fue eliminada");
      onDeleted();
    } catch (e) {
      if (e instanceof ApiError && e.data?.field === "password") setFieldError(e.message);
      else setError(getErrorMessage(e, "No se pudo eliminar la cuenta"));
    } finally {
      setDeleting(false);
    }
  };

  const confirm = async () => {
    setFieldError("");
    if (!password) {
      setFieldError("Ingresa tu contraseña para confirmar");
      return;
    }
    const yes = await confirmAction({
      title: "¿Eliminar tu cuenta?",
      message: "Esta acción no se puede deshacer. Perderás el acceso a tu historial de pedidos y reseñas desde la app.",
      confirmText: "Eliminar",
      destructive: true,
    });
    if (yes) doDelete();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AppBar title="Eliminar cuenta" onBack={onBack} />
      <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: "#fecdd3", padding: 14 }}>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
            <Ic n="alert" size={20} color={T.red} />
            <Text style={{ flex: 1, fontSize: 13.5, color: T.text2, lineHeight: 20 }}>
              Se eliminará la cuenta <Text style={{ fontWeight: "800" }}>{user?.email}</Text>. No podrás volver a
              iniciar sesión con ella ni ver tus pedidos desde la app.
            </Text>
          </View>
          <Alert msg={error} />
          <Field
            label="Tu contraseña"
            type="password"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setFieldError("");
            }}
            iconName="lock"
            error={fieldError}
          />
          <Btn variant="danger" onPress={confirm} disabled={deleting}>
            {deleting ? "Eliminando..." : "Eliminar mi cuenta"}
          </Btn>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
