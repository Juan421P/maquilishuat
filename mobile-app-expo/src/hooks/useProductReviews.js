import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { reviewsAPI } from "../services/api";
import { useAccountData } from "../context/AccountDataContext";
import { ApiError, getErrorMessage } from "../utils/errors";
import { validateRating, validateComment, rhfRule } from "../utils/validators";

// Carga las reseñas de un producto y maneja el formulario para calificar.
// Respeta la regla del backend: solo califica quien compró el producto y
// una sola vez (se revisa con los pedidos y reseñas del cliente).
export function useProductReviews(productId) {
  const account = useAccountData();
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState(false);
  const [serverError, setServerError] = useState("");

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { rating: 0, comment: "" },
    mode: "onSubmit",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setData(await reviewsAPI.getByProduct(productId));
    } catch (e) {
      setLoadError(getErrorMessage(e, "No se pudieron cargar las reseñas"));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const myReview = account?.reviewFor(productId) || null;
  const purchased = account?.hasPurchased(productId) || false;
  // "unknown" mientras no han cargado pedidos/reseñas del cliente.
  const eligibility = !account?.eligibilityLoaded
    ? "unknown"
    : myReview
      ? "reviewed"
      : purchased
        ? "can_review"
        : "not_purchased";

  const submit = handleSubmit(async ({ rating, comment }) => {
    setServerError("");
    setOk(false);
    setSubmitting(true);
    try {
      await reviewsAPI.create(productId, rating, comment.trim());
      reset({ rating: 0, comment: "" });
      setOk(true);
      load();
      account?.refreshReviews();
    } catch (e) {
      // 403 (no compró) o 409 (ya calificó): la info local estaba
      // desactualizada; se refresca para que la UI refleje el estado real.
      if (e instanceof ApiError && (e.status === 403 || e.status === 409)) {
        account?.refreshReviews();
        account?.refreshOrders();
      }
      setServerError(getErrorMessage(e, "No se pudo enviar la reseña"));
    } finally {
      setSubmitting(false);
    }
  });

  return {
    data,
    loading,
    loadError,
    reload: load,
    submitting,
    ok,
    serverError,
    eligibility,
    myReview,
    control,
    errors,
    submit,
    rules: {
      rating: { validate: rhfRule(validateRating) },
      comment: { validate: rhfRule(validateComment) },
    },
  };
}
