import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import clientModel from "../models/client.js";
import { config } from "../../config.js";
import { brandEmailHtml } from "../utils/emailTemplate.js";
import {
    normalizeEmail,
    normalizeCode,
    validateEmail,
    validateName,
    validateBirthdate,
    validatePassword,
    CODE_REGEX,
} from "../utils/validation.js";
import {
    CODE_RESEND_SECONDS,
    CODE_TTL_SECONDS,
    secondsUntilResend,
    markCodeSent,
    clearCodeCooldown,
} from "../utils/codeCooldown.js";

const registerClientController = {};
const PURPOSE = "register";

const sendMailAsync = (transporter, options) =>
    new Promise((resolve, reject) => {
        transporter.sendMail(options, (error, info) => (error ? reject(error) : resolve(info)));
    });

registerClientController.register = async (req, res) => {
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const lastname = typeof req.body?.lastname === "string" ? req.body.lastname.trim() : "";
    const birthdate = typeof req.body?.birthdate === "string" ? req.body.birthdate.trim() : req.body?.birthdate;
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    // Se valida TODO antes de mandar el correo: antes la edad (18+) recién
    // se revisaba al verificar el código, después de que el usuario ya
    // había recibido el correo.
    const validationError =
        validateName(name, "El nombre") ||
        validateName(lastname, "El apellido") ||
        validateBirthdate(birthdate) ||
        validateEmail(email) ||
        validatePassword(password);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const existingClient = await clientModel.findOne({ email });
        if (existingClient) {
            return res.status(409).json({ message: "Ya existe una cuenta registrada con este correo" });
        }

        const wait = secondsUntilResend(PURPOSE, email);
        if (wait > 0) {
            res.set("Retry-After", String(wait));
            return res.status(429).json({
                message: `Espera ${wait} segundos antes de solicitar otro código`,
                code: "CODE_COOLDOWN",
                retryAfter: wait,
            });
        }
        // Se marca antes de enviar para que dos toques seguidos no manden
        // dos correos; si el envío falla, se libera.
        markCodeSent(PURPOSE, email);

        const randomNumber = crypto.randomBytes(3).toString("hex");
        const token = jsonwebtoken.sign(
            { randomNumber, name, lastname, birthdate, email, password },
            config.jwt.secret,
            { expiresIn: CODE_TTL_SECONDS }
        );
        res.cookie("RegistrationCookie", token, { maxAge: CODE_TTL_SECONDS * 1000, httpOnly: true, sameSite: "lax" });
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            family: 4,
            auth: {
                user: config.email.user,
                pass: config.email.password
            }
        });
        const mailOptions = {
            from: config.email.user,
            to: email,
            subject: "Verificación de cuenta - Maquilishuat",
            text: "Para verificar tu cuenta, utiliza este código: " + randomNumber + " expira en 15min",
            html: brandEmailHtml({
                title: `¡Hola, ${name}!`,
                intro: "Usa este código para verificar tu cuenta de Maquilishuat. Expira en 15 minutos.",
                code: randomNumber,
                footer: "Si no creaste una cuenta con nosotros, puedes ignorar este correo.",
            }),
        };
        try {
            await sendMailAsync(transporter, mailOptions);
        } catch (mailError) {
            console.log("error" + mailError);
            clearCodeCooldown(PURPOSE, email);
            return res.status(502).json({ message: "No pudimos enviar el correo de verificación. Intenta de nuevo en unos minutos." });
        }
        // `registrationToken` se envía también en el body porque los
        // clientes nativos (Expo Go / apps móviles) no tienen un cookie
        // jar como el navegador y no pueden depender de la cookie para
        // completar el paso de verificación. La app web sigue
        // funcionando igual porque usa la cookie automáticamente.
        return res.status(200).json({
            message: "Email sent",
            registrationToken: token,
            expiresIn: CODE_TTL_SECONDS,
            resendAfter: CODE_RESEND_SECONDS,
        });
    } catch (error) {
        console.log("error" + error);
        clearCodeCooldown(PURPOSE, email);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

registerClientController.verifyCode = async (req, res) => {
    try {
        const { registrationToken } = req.body;
        const code = normalizeCode(req.body?.verificationCodeRequest);
        const headerToken = req.headers["x-registration-token"];
        // El token explícito (app móvil) tiene prioridad sobre la cookie.
        const token = registrationToken || headerToken || req.cookies.RegistrationCookie;
        if (!token) {
            return res.status(400).json({
                message: "Tu registro expiró o no se encontró. Vuelve a solicitar el código.",
                code: "SESSION_MISSING",
            });
        }
        if (!CODE_REGEX.test(code)) {
            return res.status(400).json({ message: "El código debe tener 6 caracteres (0-9 y a-f)", code: "CODE_FORMAT" });
        }
        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.jwt.secret);
        } catch (jwtError) {
            res.clearCookie("RegistrationCookie");
            if (jwtError.name === "TokenExpiredError") {
                return res.status(400).json({ message: "El código expiró. Solicita uno nuevo.", code: "CODE_EXPIRED" });
            }
            return res.status(400).json({
                message: "Tu registro expiró o no es válido. Vuelve a solicitar el código.",
                code: "SESSION_INVALID",
            });
        }
        const { randomNumber: storedCode, name, lastname, birthdate, email, password } = decoded;
        if (!storedCode || code !== storedCode) {
            return res.status(400).json({ message: "Código incorrecto", code: "CODE_INVALID" });
        }
        const existingClient = await clientModel.findOne({ email });
        if (existingClient) {
            res.clearCookie("RegistrationCookie");
            return res.status(409).json({ message: "Ya existe una cuenta registrada con este correo" });
        }
        const newClient = new clientModel({
            name,
            lastname,
            birthdate,
            email,
            password,
            verified_email: true
        });
        await newClient.save();
        res.clearCookie("RegistrationCookie");
        clearCodeCooldown(PURPOSE, email);
        return res.status(200).json({ message: "Client registered" });
    } catch (error) {
        console.log("error" + error);
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors)[0]?.message || "Datos inválidos";
            return res.status(400).json({ message });
        }
        if (error.code === 11000) {
            return res.status(409).json({ message: "Ya existe una cuenta registrada con este correo" });
        }
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default registerClientController;
