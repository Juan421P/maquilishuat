// Hook de resolución: cuando el backend importa "nodemailer" durante las
// pruebas, recibe el mock en vez del paquete real.
export async function resolve(specifier, context, nextResolve) {
    if (specifier === "nodemailer") {
        return { url: new URL("./nodemailer-mock.js", import.meta.url).href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
}
