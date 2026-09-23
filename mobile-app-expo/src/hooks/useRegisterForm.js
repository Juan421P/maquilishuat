import { useState } from "react";
import { useForm } from "react-hook-form";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import {
  validateName,
  validateBirthdate,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateCode,
  rhfRule,
} from "../utils/validators";

// Toda la lógica del registro en 2 pasos (datos -> verificación por
// correo). Cada paso tiene su propio formulario de react-hook-form; la
// pantalla solo decide cuál pintar según `step`.
export function useRegisterForm({ onSuccess }) {
  const { login } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const dataForm = useForm({
    defaultValues: { name: "", lastname: "", birthdate: "", email: "", pw: "", pw2: "" },
    mode: "onSubmit",
  });

  const codeForm = useForm({ defaultValues: { code: "" }, mode: "onSubmit" });

  const submitData = dataForm.handleSubmit(async (values) => {
    setServerError("");
    setLoading(true);
    try {
      await authAPI.register(
        values.name.trim(),
        values.lastname.trim(),
        values.birthdate.trim(),
        values.email.trim(),
        values.pw
      );
      setRegisteredEmail(values.email.trim());
      toast?.info("Te enviamos un código de verificación a tu correo");
      setStep(2);
    } catch (e) {
      const msg = e.message || "Error al registrar";
      setServerError(msg);
      toast?.error(msg);
    } finally {
      setLoading(false);
    }
  });

  const submitCode = codeForm.handleSubmit(async ({ code }) => {
    setServerError("");
    setLoading(true);
    try {
      await authAPI.verifyCode(code.trim());
      const { pw, email } = dataForm.getValues();
      const user = await login(email.trim(), pw);
      toast?.success("Cuenta verificada");
      onSuccess(user);
    } catch (e) {
      const msg = e.message || "Código inválido";
      setServerError(msg);
      toast?.error(msg);
    } finally {
      setLoading(false);
    }
  });

  return {
    step,
    loading,
    serverError,
    showPassword,
    toggleShowPassword: () => setShowPassword((s) => !s),
    registeredEmail,
    dataForm: {
      control: dataForm.control,
      errors: dataForm.formState.errors,
      submit: submitData,
      rules: {
        name: { validate: rhfRule(validateName, "El nombre") },
        lastname: { validate: rhfRule(validateName, "El apellido") },
        birthdate: { validate: rhfRule(validateBirthdate) },
        email: { validate: rhfRule(validateEmail) },
        pw: { validate: rhfRule(validatePassword) },
        pw2: {
          validate: (value) =>
            validateConfirmPassword(dataForm.getValues("pw"), value) || true,
        },
      },
    },
    codeForm: {
      control: codeForm.control,
      errors: codeForm.formState.errors,
      submit: submitCode,
      rules: { code: { validate: rhfRule(validateCode) } },
    },
  };
}
