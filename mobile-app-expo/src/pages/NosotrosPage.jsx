import { ScrollView, Text, View } from "react-native";
import { T } from "../utils/theme";
import Ic from "../components/Ic";

const VALORES = [
  { icon: "ok", label: "Calidad", desc: "Agua purificada con controles estrictos para garantizar tu salud." },
  { icon: "user", label: "Servicio", desc: "Atención personalizada. Conocemos a nuestros clientes por nombre." },
  { icon: "map", label: "Puntualidad", desc: "Rutas fijas y horarios respetados. Tu pedido llega cuando lo necesitas." },
  { icon: "drop", label: "Compromiso", desc: "Más de 10 años sirviendo a familias y negocios de El Salvador." },
];

const MUNICIPIOS = [
  "San Salvador centro", "San Salvador norte y sur", "Soyapango",
  "Ilopango", "Ayutuxtepeque", "Mejicanos", "Antiguo Cuscatlán",
  "Santa Tecla", "Colón", "Armenia (La Libertad)",
];

function H2({ children }) {
  return <Text style={{ fontSize: 16, fontWeight: "800", color: T.text1, marginTop: 20, marginBottom: 8 }}>{children}</Text>;
}
function P({ children }) {
  return <Text style={{ fontSize: 13.5, color: T.text2, lineHeight: 21 }}>{children}</Text>;
}

export default function NosotrosPage() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: T.text1, marginBottom: 6 }}>Sobre nosotros</Text>
      <Text style={{ fontSize: 13.5, color: T.textMut, marginBottom: 14, lineHeight: 20 }}>
        Más de una década llevando agua pura a los hogares y negocios de El Salvador.
      </Text>
      <P>
        Empezamos en 2013 con dos rutas y una camioneta. Hoy cubrimos más de 15 colonias en el Área
        Metropolitana de San Salvador. El agua llega el mismo día, siempre.
      </P>

      <H2>Nuestra historia</H2>
      <P>
        Todo comenzó cuando el fundador notó que muchas familias en Soyapango y Mejicanos no tenían
        acceso fácil a agua purificada confiable. Con una pick-up, cuatro garrafones y mucha
        constancia, arrancó la primera ruta. Hoy operamos cinco rutas diarias con un equipo de más
        de 15 personas que conoce a sus clientes por nombre.
      </P>

      <H2>Lo que nos mueve</H2>
      <View style={{ gap: 8 }}>
        {VALORES.map(({ icon, label, desc }) => (
          <View key={label} style={{ backgroundColor: T.bg, borderWidth: 1, borderColor: T.border, borderRadius: 12, padding: 12, flexDirection: "row", gap: 10 }}>
            <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#f3e8ff", alignItems: "center", justifyContent: "center" }}>
              <Ic n={icon} size={16} color={T.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: T.text1, marginBottom: 2 }}>{label}</Text>
              <Text style={{ fontSize: 12, color: T.text3, lineHeight: 18 }}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <H2>Nuestro equipo</H2>
      <P>
        Contamos con repartidores comprometidos, un equipo de atención al cliente y personal de
        planta que asegura la purificación y el envasado bajo normas sanitarias vigentes. Cada
        persona conoce la importancia de lo que entrega.
      </P>

      <H2>Zona de cobertura</H2>
      <P>Actualmente atendemos los siguientes municipios:</P>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {MUNICIPIOS.map((m) => (
          <View key={m} style={{ backgroundColor: "#f3e8ff", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 99 }}>
            <Text style={{ fontSize: 11.5, color: T.purpleDark, fontWeight: "600" }}>{m}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 13, color: T.text3, marginTop: 10 }}>
        ¿No estás en la lista? Escríbenos, seguimos creciendo.
      </Text>
    </ScrollView>
  );
}
