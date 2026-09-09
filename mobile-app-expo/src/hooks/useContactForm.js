import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  validateName,
  validateEmail,
  validateRequired,
  validateMessage,
  rhfRule,
} from "../utils/validators";

const ASUNTOS = [
  { id: "pedido", label: "Quiero hacer un pedido" },
  { id: "info", label: "Información sobre productos" },
  { id: "ruta", label: "Consulta sobre rutas de entrega" },
  { id: "otro", label: "Otro" },
];

// El formulario de contacto no golpea un backend real (según los mockups,
// solo confirma en pantalla), así que la lógica es puramente local.
export function useContactForm() {
  const [enviado, setEnviado] = useState(false);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { nombre: "", email: "", asunto: "", mensaje: "" },
    mode: "onSubmit",
  });

  const submit = handleSubmit(() => setEnviado(true));

  const sendAnother = () => {
    setEnviado(false);
    reset();
  };

  return {
    control,
    errors,
    submit,
    enviado,
    sendAnother,
    nombre: watch("nombre"),
    asuntos: ASUNTOS,
    rules: {
      nombre: { validate: rhfRule(validateName, "El nombre") },
      email: { validate: rhfRule(validateEmail) },
      asunto: { validate: rhfRule(validateRequired, "El asunto") },
      mensaje: { validate: rhfRule(validateMessage) },
    },
  };
}
