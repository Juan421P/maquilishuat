import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { reviewsAPI } from "../services/api";
import { validateRating, validateComment, rhfRule } from "../utils/validators";

// Carga las reseñas de un producto y maneja el formulario para calificar.
export function useProductReviews(productId) {
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState(false);
  const [serverError, setServerError] = useState("");

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { rating: 0, comment: "" },
    mode: "onSubmit",
  });

  const load = useCallback(() => {
    setLoading(true);
    reviewsAPI
      .getByProduct(productId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = handleSubmit(async ({ rating, comment }) => {
    setServerError("");
    setSubmitting(true);
    try {
      await reviewsAPI.create(productId, rating, comment.trim());
      reset({ rating: 0, comment: "" });
      setOk(true);
      load();
    } catch (e) {
      setServerError(e.message || "No se pudo enviar la reseña");
    } finally {
      setSubmitting(false);
    }
  });

  return {
    data,
    loading,
    submitting,
    ok,
    serverError,
    control,
    errors,
    submit,
    rules: {
      rating: { validate: rhfRule(validateRating) },
      comment: { validate: rhfRule(validateComment) },
    },
  };
}
