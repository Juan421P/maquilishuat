import { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { T } from "../utils/theme";
import { formatBirthdate } from "../utils/format";
import { fromISODate, toISODate, maxBirthdate, MIN_BIRTHDATE } from "../utils/validators";
import Ic from "./Ic";

// Selector de fecha de nacimiento. Guarda el valor como "AAAA-MM-DD" (el
// formato que espera el backend) y solo permite elegir fechas de alguien
// con 18 años o más: no hay fechas futuras ni inválidas posibles.
export default function DateField({ label = "Fecha de nacimiento", value, onChange, error }) {
  const [iosOpen, setIosOpen] = useState(false);
  const [iosTemp, setIosTemp] = useState(null);
  const maximumDate = maxBirthdate();
  const current = fromISODate(value) || new Date(maximumDate.getFullYear() - 7, 0, 1, 12);

  const open = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: current,
        mode: "date",
        maximumDate,
        minimumDate: MIN_BIRTHDATE,
        onChange: (event, date) => {
          if (event.type === "set" && date) onChange(toISODate(date));
        },
      });
      return;
    }
    setIosTemp(current);
    setIosOpen(true);
  };

  return (
    <View style={{ marginBottom: 14 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 0.6,
          color: T.text3,
          marginBottom: 5,
        }}
      >
        {label}
      </Text>
      <TouchableOpacity
        onPress={open}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? formatBirthdate(value) : "sin seleccionar"}`}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingVertical: 12,
          paddingHorizontal: 12,
          borderWidth: 1.5,
          borderColor: error ? T.red : T.border,
          borderRadius: 10,
          backgroundColor: T.surface,
        }}
      >
        <Ic n="calendar" size={16} color={T.textMut} />
        <Text style={{ flex: 1, fontSize: 14, color: value ? T.text1 : T.textMut }}>
          {value ? formatBirthdate(value) : "Selecciona tu fecha de nacimiento"}
        </Text>
      </TouchableOpacity>
      {error ? (
        <Text style={{ fontSize: 12, color: T.red, marginTop: 3 }}>{error}</Text>
      ) : (
        <Text style={{ fontSize: 11.5, color: T.textMut, marginTop: 3 }}>Debes ser mayor de 18 años</Text>
      )}

      {Platform.OS !== "android" && (
        <Modal visible={iosOpen} transparent animationType="fade" onRequestClose={() => setIosOpen(false)}>
          <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" }}>
            <View style={{ backgroundColor: T.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 24 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", padding: 14 }}>
                <TouchableOpacity onPress={() => setIosOpen(false)}>
                  <Text style={{ color: T.text3, fontSize: 15, fontWeight: "600" }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (iosTemp) onChange(toISODate(iosTemp));
                    setIosOpen(false);
                  }}
                >
                  <Text style={{ color: T.purple, fontSize: 15, fontWeight: "700" }}>Listo</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={iosTemp || current}
                mode="date"
                display="spinner"
                locale="es-ES"
                maximumDate={maximumDate}
                minimumDate={MIN_BIRTHDATE}
                onChange={(_, date) => date && setIosTemp(date)}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}
