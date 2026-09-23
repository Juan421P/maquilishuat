import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { validateEmail, validateRequired, rhfRule } from "../utils/validators";

// Encapsula toda la lógica del formulario de login: validación con
// react-hook-form, estado de carga/errores y la llamada a authAPI a través
// del AuthContext. La pantalla (LoginPage) solo se encarga de pintar la UI.
export function useLoginForm({ onSuccess }) {
  const { login } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: "", pw: "" }, mode: "onSubmit" });

  const onSubmit = async ({ email, pw }) => {
    setServerError("");
    setLoading(true);
    try {
      await login(email.trim(), pw);
      toast?.success("Sesión iniciada");
      onSuccess();
    } catch (e) {
      const msg = e.message || "Correo o contraseña incorrectos";
      setServerError(msg);
      toast?.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return {
    control,
    errors,
    loading,
    serverError,
    showPassword,
    toggleShowPassword: () => setShowPassword((s) => !s),
    submit: handleSubmit(onSubmit),
    rules: {
      email: { validate: rhfRule(validateEmail) },
      pw: { validate: rhfRule(validateRequired, "La contraseña") },
    },
  };
}
