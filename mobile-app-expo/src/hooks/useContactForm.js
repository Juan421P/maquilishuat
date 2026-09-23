import { useState } from "react";
import { Linking } from "react-native";
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

// Datos de contacto publicados por la empresa (los mismos que muestra la
// web en /contacto).
export const CONTACT = {
  phone: "2222-0000",
  phoneIntl: "+50322220000",
  email: "pedidos@maquilishuat.com",
};

// El backend NO tiene un endpoint de contacto. Antes el formulario mostraba
// "¡Mensaje recibido!" sin enviar nada. Ahora el formulario prepara el
// correo y lo abre en la app de correo del teléfono; el usuario lo envía
// desde ahí. Nunca se dice que el mensaje fue enviado si no lo fue.
export function useContactForm() {
  const [opened, setOpened] = useState(false);
  const [openError, setOpenError] = useState("");

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { nombre: "", email: "", asunto: "", mensaje: "" },
    mode: "onSubmit",
  });

  const submit = handleSubmit(async ({ nombre, email, asunto, mensaje }) => {
    setOpenError("");
    const subjectLabel = ASUNTOS.find((a) => a.id === asunto)?.label || "Consulta";
    const body = `${mensaje.trim()}\n\n—\n${nombre.trim()}\n${email.trim()}`;
    const url = `mailto:${CONTACT.email}?subject=${encodeURIComponent(`[App] ${subjectLabel}`)}&body=${encodeURIComponent(body)}`;
    try {
      await Linking.openURL(url);
      setOpened(true);
    } catch (e) {
      setOpenError(
        `No encontramos una app de correo en este teléfono. Escríbenos a ${CONTACT.email} o llámanos al ${CONTACT.phone}.`
      );
    }
  });

  const openChannel = async (url, fallbackMsg) => {
    setOpenError("");
    try {
      await Linking.openURL(url);
    } catch (e) {
      setOpenError(fallbackMsg);
    }
  };

  const sendAnother = () => {
    setOpened(false);
    reset();
  };

  return {
    control,
    errors,
    submit,
    opened,
    openError,
    sendAnother,
    nombre: watch("nombre"),
    asuntos: ASUNTOS,
    callPhone: () => openChannel(`tel:${CONTACT.phoneIntl}`, `No se pudo abrir el teléfono. Llámanos al ${CONTACT.phone}.`),
    openWhatsApp: () =>
      openChannel(
        `https://wa.me/${CONTACT.phoneIntl.replace("+", "")}`,
        `No se pudo abrir WhatsApp. Escríbenos al ${CONTACT.phone}.`
      ),
    openEmail: () => openChannel(`mailto:${CONTACT.email}`, `No se pudo abrir el correo. Escríbenos a ${CONTACT.email}.`),
    rules: {
      nombre: { validate: rhfRule(validateName, "El nombre") },
      email: { validate: rhfRule(validateEmail) },
      asunto: { validate: rhfRule(validateRequired, "El asunto") },
      mensaje: { validate: rhfRule(validateMessage) },
    },
  };
}
