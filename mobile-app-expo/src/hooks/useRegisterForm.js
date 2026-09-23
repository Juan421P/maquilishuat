import { useState } from "react";
import { useForm } from "react-hook-form";
import { authAPI, registrationTokenStore } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { useCooldown } from "./useCooldown";
import { ApiError, getErrorMessage } from "../utils/errors";
import {
  validateName,
  validateBirthdate,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateCode,
  normalizeEmail,
  rhfRule,
} from "../utils/validators";

const DEFAULT_RESEND_SECONDS = 60;

// Los datos viajan dentro del token del código: si el usuario los cambia,
// necesita un código nuevo.
const snapshotOf = (v) =>
  JSON.stringify([v.name.trim(), v.lastname.trim(), v.birthdate, normalizeEmail(v.email), v.pw]);

// Toda la lógica del registro en 2 pasos (datos -> verificación por
// correo). Cada paso tiene su propio formulario de react-hook-form; la
// pantalla solo decide cuál pintar según `step`.
export function useRegisterForm({ onSuccess, onAccountCreated }) {
  const { login } = useAuth();
  const toast = useToast();
  const cooldown = useCooldown();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [codeExpired, setCodeExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [sentSnapshot, setSentSnapshot] = useState("");

  const dataForm = useForm({
    defaultValues: { name: "", lastname: "", birthdate: "", email: "", pw: "", pw2: "", terms: false },
    mode: "onSubmit",
  });

  const codeForm = useForm({ defaultValues: { code: "" }, mode: "onSubmit" });

  // Envía los datos al backend, que manda el código por correo. Se usa para
  // el primer envío y para "Reenviar código" (el backend genera uno nuevo).
  const sendCode = async (values) => {
    await authAPI.register(
      values.name.trim(),
      values.lastname.trim(),
      values.birthdate,
      normalizeEmail(values.email),
      values.pw
    ).then((data) => {
      cooldown.start(data?.resendAfter || DEFAULT_RESEND_SECONDS);
      return data;
    });
  };

  const handleCooldownError = (e) => {
    if (e instanceof ApiError && e.status === 429 && e.data?.retryAfter) {
      cooldown.start(e.data.retryAfter);
    }
  };

  const submitData = dataForm.handleSubmit(async (values) => {
    setServerError("");
    // Si ya se envió un código con estos mismos datos y todavía no se puede
    // pedir otro, solo se avanza al paso 2 (no se hace spam de correos).
    if (cooldown.active) {
      if (snapshotOf(values) === sentSnapshot) {
        setStep(2);
      } else {
        setServerError(`Cambiaste tus datos. Espera ${cooldown.remaining} s para solicitar un código nuevo.`);
      }
      return;
    }
    setLoading(true);
    try {
      await sendCode(values);
      setRegisteredEmail(normalizeEmail(values.email));
      setSentSnapshot(snapshotOf(values));
      setCodeExpired(false);
      codeForm.reset({ code: "" });
      toast?.info("Te enviamos un código de verificación a tu correo");
      setStep(2);
    } catch (e) {
      handleCooldownError(e);
      setServerError(getErrorMessage(e, "Error al registrar"));
    } finally {
      setLoading(false);
    }
  });

  const resendCode = async () => {
    if (cooldown.active || resending) return;
    setServerError("");
    setResending(true);
    try {
      await sendCode(dataForm.getValues());
      setCodeExpired(false);
      codeForm.reset({ code: "" });
      toast?.info("Te enviamos un código nuevo");
    } catch (e) {
      handleCooldownError(e);
      setServerError(getErrorMessage(e, "No se pudo reenviar el código"));
    } finally {
      setResending(false);
    }
  };

  const submitCode = codeForm.handleSubmit(async ({ code }) => {
    setServerError("");
    setLoading(true);
    let created = false;
    try {
      await authAPI.verifyCode(code);
      created = true;
      const { pw, email } = dataForm.getValues();
      const user = await login(normalizeEmail(email), pw);
      await registrationTokenStore.clear();
      toast?.success("¡Cuenta verificada! Bienvenido");
      onSuccess(user);
    } catch (e) {
      if (created) {
        // La cuenta sí se creó, pero el login automático falló (p. ej. sin
        // conexión): se manda al login con un aviso en vez de un error.
        toast?.success("Cuenta creada. Inicia sesión para continuar.");
        onAccountCreated?.();
        return;
      }
      if (e instanceof ApiError && ["CODE_EXPIRED", "SESSION_MISSING", "SESSION_INVALID"].includes(e.code)) {
        setCodeExpired(true);
      }
      setServerError(getErrorMessage(e, "Código inválido"));
    } finally {
      setLoading(false);
    }
  });

  // Volver del paso 2 al paso 1 (botón o botón atrás de Android) para
  // corregir el correo u otros datos.
  const backToData = () => {
    setServerError("");
    setStep(1);
  };

  return {
    step,
    loading,
    resending,
    serverError,
    codeExpired,
    showPassword,
    toggleShowPassword: () => setShowPassword((s) => !s),
    registeredEmail,
    resendIn: cooldown.remaining,
    canResend: !cooldown.active && !resending,
    resendCode,
    backToData,
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
        terms: { validate: (v) => v === true || "Debes aceptar los términos y condiciones" },
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
