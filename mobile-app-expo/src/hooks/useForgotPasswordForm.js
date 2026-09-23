import { useState } from "react";
import { useForm } from "react-hook-form";
import { authAPI, recoveryTokenStore } from "../services/api";
import { useCooldown } from "./useCooldown";
import { useToast } from "../components/Toast";
import { ApiError, getErrorMessage } from "../utils/errors";
import {
  validateEmail,
  validateCode,
  validatePassword,
  validateConfirmPassword,
  normalizeEmail,
  rhfRule,
} from "../utils/validators";

const DEFAULT_RESEND_SECONDS = 60;
const EXPIRED_CODES = ["CODE_EXPIRED", "SESSION_MISSING", "SESSION_INVALID"];

// Flujo de "olvidé mi contraseña" en 3 pasos: correo -> código -> nueva
// contraseña. Un formulario de react-hook-form independiente por paso.
export function useForgotPasswordForm() {
  const toast = useToast();
  const cooldown = useCooldown();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [codeExpired, setCodeExpired] = useState(false);
  const [done, setDone] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const emailForm = useForm({ defaultValues: { email: "" }, mode: "onSubmit" });
  const codeForm = useForm({ defaultValues: { code: "" }, mode: "onSubmit" });
  const passwordForm = useForm({ defaultValues: { pw: "", pw2: "" }, mode: "onSubmit" });

  const handleCooldownError = (e) => {
    if (e instanceof ApiError && e.status === 429 && e.data?.retryAfter) {
      cooldown.start(e.data.retryAfter);
    }
  };

  const requestCode = async (email) => {
    const data = await authAPI.requestRecovery(email);
    cooldown.start(data?.resendAfter || DEFAULT_RESEND_SECONDS);
    setSentTo(email);
    setCodeExpired(false);
    codeForm.reset({ code: "" });
  };

  const submitEmail = emailForm.handleSubmit(async ({ email }) => {
    setServerError("");
    const normalized = normalizeEmail(email);
    // Mismo correo y todavía en espera: se vuelve al paso 2 sin mandar otro.
    if (cooldown.active && normalized === sentTo) {
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      await requestCode(normalized);
      setStep(2);
    } catch (e) {
      handleCooldownError(e);
      setServerError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  });

  const resendCode = async () => {
    if (cooldown.active || resending || !sentTo) return;
    setServerError("");
    setResending(true);
    try {
      await requestCode(sentTo);
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
    try {
      await authAPI.verifyRecovery(code);
      setStep(3);
    } catch (e) {
      if (e instanceof ApiError && EXPIRED_CODES.includes(e.code)) setCodeExpired(true);
      setServerError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  });

  const submitPassword = passwordForm.handleSubmit(async ({ pw, pw2 }) => {
    setServerError("");
    setLoading(true);
    try {
      await authAPI.newPassword(pw, pw2);
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError && EXPIRED_CODES.includes(e.code)) {
        // La verificación venció: hay que pedir un código nuevo.
        setCodeExpired(true);
        setStep(2);
      }
      setServerError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  });

  // Paso anterior (botón "Volver" del paso o botón atrás de Android).
  const backStep = () => {
    setServerError("");
    if (step === 3) {
      // El código ya se usó: para volver hay que pedir uno nuevo.
      recoveryTokenStore.clear().catch((e) => console.warn(e));
      setStep(2);
      setCodeExpired(true);
      return;
    }
    if (step === 2) setStep(1);
  };

  return {
    step,
    loading,
    resending,
    serverError,
    codeExpired,
    done,
    sentTo,
    resendIn: cooldown.remaining,
    canResend: !cooldown.active && !resending,
    resendCode,
    backStep,
    emailForm: {
      control: emailForm.control,
      errors: emailForm.formState.errors,
      submit: submitEmail,
      rules: { email: { validate: rhfRule(validateEmail) } },
    },
    codeForm: {
      control: codeForm.control,
      errors: codeForm.formState.errors,
      submit: submitCode,
      rules: { code: { validate: rhfRule(validateCode) } },
    },
    passwordForm: {
      control: passwordForm.control,
      errors: passwordForm.formState.errors,
      submit: submitPassword,
      rules: {
        pw: { validate: rhfRule(validatePassword) },
        pw2: {
          validate: (value) =>
            validateConfirmPassword(passwordForm.getValues("pw"), value) || true,
        },
      },
    },
  };
}
