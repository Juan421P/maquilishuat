import { useState } from "react";
import { useForm } from "react-hook-form";
import { authAPI } from "../services/api";
import {
  validateEmail,
  validateCode,
  validatePassword,
  validateConfirmPassword,
  rhfRule,
} from "../utils/validators";

// Flujo de "olvidé mi contraseña" en 3 pasos: correo -> código -> nueva
// contraseña. Un formulario de react-hook-form independiente por paso.
export function useForgotPasswordForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const emailForm = useForm({ defaultValues: { email: "" }, mode: "onSubmit" });
  const codeForm = useForm({ defaultValues: { code: "" }, mode: "onSubmit" });
  const passwordForm = useForm({ defaultValues: { pw: "", pw2: "" }, mode: "onSubmit" });

  const submitEmail = emailForm.handleSubmit(async ({ email }) => {
    setServerError("");
    setLoading(true);
    try {
      await authAPI.requestRecovery(email.trim());
      setStep(2);
    } catch (e) {
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  });

  const submitCode = codeForm.handleSubmit(async ({ code }) => {
    setServerError("");
    setLoading(true);
    try {
      await authAPI.verifyRecovery(code.trim());
      setStep(3);
    } catch (e) {
      setServerError(e.message);
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
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  });

  return {
    step,
    loading,
    serverError,
    done,
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
