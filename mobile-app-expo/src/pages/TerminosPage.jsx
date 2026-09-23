import { ScrollView, Text } from "react-native";
import { T } from "../utils/theme";

function H2({ children }) {
  return <Text style={{ fontSize: 15, fontWeight: "800", color: T.text1, marginTop: 18, marginBottom: 6 }}>{children}</Text>;
}
function P({ children }) {
  return <Text style={{ fontSize: 13.5, color: T.text2, lineHeight: 21, marginBottom: 4 }}>{children}</Text>;
}
function Li({ children }) {
  return <Text style={{ fontSize: 13.5, color: T.text2, lineHeight: 21, marginBottom: 4 }}>• {children}</Text>;
}

export default function TerminosPage() {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 32 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: T.text1, marginBottom: 4 }}>Términos y condiciones</Text>
      <Text style={{ fontSize: 12.5, color: T.textMut, marginBottom: 14 }}>Última actualización: abril 2026</Text>

      <P>
        Al utilizar los servicios de Maquilishuat S.A. de C.V. —ya sea mediante pedidos en línea,
        por teléfono o en persona— aceptas los presentes términos y condiciones. Te pedimos que los
        leas con atención.
      </P>

      <H2>1. Sobre el servicio</H2>
      <P>
        Maquilishuat ofrece distribución de agua purificada en presentaciones de garrafón, botella
        y pack. Los pedidos se procesan de lunes a sábado de 7:00 a.m. a 5:00 p.m. No se garantiza
        entrega en festivos sin coordinación previa.
      </P>

      <H2>2. Pedidos y entregas</H2>
      <Li>Los pedidos deben confirmarse antes de las 3:00 p.m. para incluirse en la ruta del mismo día.</Li>
      <Li>Las entregas se realizan dentro de las zonas de cobertura. Consulta disponibilidad.</Li>
      <Li>En caso de ausencia del cliente, el repartidor puede dejar el pedido con un vecino autorizado.</Li>
      <Li>Nos reservamos el derecho de reagendar pedidos en caso de condiciones climáticas adversas.</Li>

      <H2>3. Precios y pagos</H2>
      <P>
        Los precios publicados incluyen el costo del producto y pueden variar según zona y volumen.
        Aceptamos efectivo, transferencia bancaria y tarjeta de débito/crédito. Los pagos en línea
        se procesan a través de plataformas seguras y no almacenamos datos de tarjetas.
      </P>

      <H2>4. Devoluciones</H2>
      <P>
        Si recibes un producto en mal estado o equivocado, contáctanos dentro de las 24 horas
        siguientes a la entrega. Repondremos el producto sin costo adicional. No se aceptan
        devoluciones por cambio de parecer una vez entregado el pedido.
      </P>

      <H2>5. Uso de datos personales</H2>
      <P>
        Los datos que nos proporcionas (nombre, dirección, teléfono, correo) se usan exclusivamente
        para procesar y entregar tus pedidos, y para comunicarnos contigo. No vendemos ni
        compartimos tu información con terceros.
      </P>

      <H2>6. Responsabilidad</H2>
      <P>
        Maquilishuat no se responsabiliza por daños derivados de un uso incorrecto del producto o
        por demoras causadas por factores ajenos a nuestra operación (tráfico, cierre de vías,
        desastres naturales, etc.).
      </P>

      <H2>7. Cambios en estos términos</H2>
      <P>
        Podemos actualizar estos términos en cualquier momento. La versión vigente siempre estará
        disponible en esta pantalla. El uso continuado del servicio implica la aceptación de los
        cambios.
      </P>

      <H2>8. Contacto</H2>
      <P>Para consultas sobre estos términos: legal@maquilishuat.com o llámanos al 2222-0000.</P>
    </ScrollView>
  );
}
