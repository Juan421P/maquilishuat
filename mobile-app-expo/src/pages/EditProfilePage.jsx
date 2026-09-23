import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { T } from "../utils/theme";
import AppBar from "../layout/AppBar";
import Field from "../components/Field";
import DateField from "../components/DateField";
import Alert from "../components/Alert";
import Btn from "../components/Btn";
import Ic from "../components/Ic";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { clientsAPI } from "../services/api";
import { getErrorMessage } from "../utils/errors";
import { validateName, validateBirthdate, rhfRule } from "../utils/validators";

// Formatos que acepta el backend (multer-storage-cloudinary).
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

const birthdateToISO = (value) => (value ? String(value).slice(0, 10) : "");

export default function EditProfilePage({ onBack }) {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [picture, setPicture] = useState(null); // { uri, name, type }
  const [pictureError, setPictureError] = useState("");

  const initial = {
    name: user?.name || "",
    lastname: user?.lastname || "",
    birthdate: birthdateToISO(user?.birthdate),
  };
  const { control, handleSubmit, formState: { errors, isDirty } } = useForm({ defaultValues: initial, mode: "onSubmit" });

  const pickImage = async () => {
    setPictureError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (result.canceled || !result.assets?.length) return;
      const asset = result.assets[0];
      const type = (asset.mimeType || "image/jpeg").toLowerCase();
      if (!ALLOWED_TYPES.includes(type)) {
        setPictureError("Formato no permitido. Usa una imagen JPG, PNG o GIF.");
        return;
      }
      if (asset.fileSize && asset.fileSize > MAX_BYTES) {
        setPictureError("La imagen pesa más de 5 MB. Elige una más liviana.");
        return;
      }
      const ext = type === "image/png" ? "png" : type === "image/gif" ? "gif" : "jpg";
      setPicture({ uri: asset.uri, name: asset.fileName || `perfil.${ext}`, type });
    } catch (e) {
      setPictureError(getErrorMessage(e, "No se pudo abrir la galería"));
    }
  };

  const save = handleSubmit(async (values) => {
    setServerError("");
    const fields = {};
    if (values.name.trim() !== initial.name) fields.name = values.name.trim();
    if (values.lastname.trim() !== initial.lastname) fields.lastname = values.lastname.trim();
    if (values.birthdate && values.birthdate !== initial.birthdate) fields.birthdate = values.birthdate;
    if (picture) fields.picture = picture;
    if (Object.keys(fields).length === 0) {
      onBack();
      return;
    }
    setSaving(true);
    try {
      const res = await clientsAPI.update(user.id, fields);
      await updateUser(res.client || { ...user, ...fields, picture: user.picture });
      toast?.success("Perfil actualizado");
      onBack();
    } catch (e) {
      setServerError(getErrorMessage(e, "No se pudo guardar tu perfil"));
    } finally {
      setSaving(false);
    }
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <AppBar title="Editar perfil" onBack={onBack} />
      <ScrollView style={{ flex: 1, backgroundColor: T.bg }} contentContainerStyle={{ padding: 18 }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: "center", marginBottom: 18 }}>
          <View style={{ backgroundColor: T.purple, borderRadius: 60, padding: 3 }}>
            <Avatar uri={picture?.uri || user?.picture} name={user?.name} lastname={user?.lastname} size={92} />
          </View>
          <TouchableOpacity
            onPress={pickImage}
            accessibilityRole="button"
            style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 99, backgroundColor: "#f3e8ff" }}
          >
            <Ic n="camera" size={15} color={T.purple} />
            <Text style={{ color: T.purple, fontWeight: "700", fontSize: 13 }}>{picture ? "Cambiar otra foto" : "Cambiar foto"}</Text>
          </TouchableOpacity>
          {picture && <Text style={{ fontSize: 11.5, color: T.textMut, marginTop: 4 }}>La foto se guarda al tocar "Guardar cambios"</Text>}
          {pictureError ? <Text style={{ fontSize: 12, color: T.red, marginTop: 4, textAlign: "center" }}>{pictureError}</Text> : null}
        </View>

        <View style={{ backgroundColor: T.surface, borderRadius: 12, borderWidth: 1, borderColor: T.border, padding: 14 }}>
          <Alert msg={serverError} />
          <Controller
            control={control}
            name="name"
            rules={{ validate: rhfRule(validateName, "El nombre") }}
            render={({ field }) => (
              <Field label="Nombre" type="name" value={field.value} onChangeText={field.onChange} maxLength={60} error={errors.name?.message} />
            )}
          />
          <Controller
            control={control}
            name="lastname"
            rules={{ validate: rhfRule(validateName, "El apellido") }}
            render={({ field }) => (
              <Field label="Apellido" type="name" value={field.value} onChangeText={field.onChange} maxLength={60} error={errors.lastname?.message} />
            )}
          />
          <Controller
            control={control}
            name="birthdate"
            rules={{ validate: (v) => (!v && !initial.birthdate ? true : validateBirthdate(v) || true) }}
            render={({ field }) => <DateField value={field.value} onChange={field.onChange} error={errors.birthdate?.message} />}
          />
          <Field
            label="Correo"
            type="email"
            value={user?.email || ""}
            editable={false}
            iconName="mail"
            hint="El correo es tu usuario verificado y no se puede cambiar desde la app."
          />
          <Btn onPress={save} disabled={saving || (!isDirty && !picture)}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Btn>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
