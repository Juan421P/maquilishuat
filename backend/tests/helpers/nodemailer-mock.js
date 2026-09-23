import { appendFileSync } from "node:fs";
// Reemplazo de nodemailer para las pruebas: no manda correos reales, solo
// los guarda en memoria para que la prueba lea el código enviado.
export const sentMails = [];
globalThis.__sentMails = sentMails;

const createTransport = () => ({
    sendMail(options, callback) {
        if (globalThis.__failNextMail) {
            globalThis.__failNextMail = false;
            const error = new Error("fallo simulado de SMTP");
            if (callback) return callback(error);
            return Promise.reject(error);
        }
        sentMails.push(options);
        // Para pruebas de punta a punta (app + backend en procesos
        // separados): si MAIL_LOG_FILE está definido, el correo se anota ahí.
        if (process.env.MAIL_LOG_FILE) {
            appendFileSync(process.env.MAIL_LOG_FILE, JSON.stringify({ to: options.to, text: options.text }) + "\n");
        }
        if (callback) return callback(null, { messageId: "test" });
        return Promise.resolve({ messageId: "test" });
    },
});

export default { createTransport };
export { createTransport };
