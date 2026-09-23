import { Alert, Platform } from "react-native";

// Diálogo de confirmación que funciona en Android/iOS (Alert nativo) y en
// web (react-native-web no implementa Alert.alert). Devuelve true si el
// usuario confirmó.
export function confirmAction({ title, message, confirmText = "Aceptar", cancelText = "Cancelar", destructive = false }) {
  if (Platform.OS === "web") {
    // eslint-disable-next-line no-alert
    return Promise.resolve(typeof window !== "undefined" && window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelText, style: "cancel", onPress: () => resolve(false) },
        { text: confirmText, style: destructive ? "destructive" : "default", onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
