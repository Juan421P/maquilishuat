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

const recoveryClientController = {};
const PURPOSE = "recovery";

const sendMailAsync = (transporter, options) =>
    new Promise((resolve, reject) => {
        transporter.sendMail(options, (error, info) => (error ? reject(error) : resolve(info)));
    });

// Verifica el token del flujo de recuperación y traduce los errores de JWT
// a respuestas claras (antes un código vencido terminaba en un 500).
const readRecoveryToken = (req, res) => {
    const { recoveryToken } = req.body || {};
    const headerToken = req.headers["x-recovery-token"];
    // El token explícito (app móvil) tiene prioridad sobre la cookie.
    const token = recoveryToken || headerToken || req.cookies.recoveryCookie;
    if (!token) {
        res.status(400).json({
            message: "La solicitud de recuperación expiró o no se encontró. Solicita un código nuevo.",
            code: "SESSION_MISSING",
        });
        return null;
    }
    try {
        return jsonwebtoken.verify(token, config.jwt.secret);
    } catch (jwtError) {
        res.clearCookie("recoveryCookie");
        if (jwtError.name === "TokenExpiredError") {
            res.status(400).json({ message: "El código expiró. Solicita uno nuevo.", code: "CODE_EXPIRED" });
        } else {
            res.status(400).json({
                message: "La solicitud de recuperación no es válida. Solicita un código nuevo.",
                code: "SESSION_INVALID",
            });
        }
        return null;
    }
};

recoveryClientController.requestCode = async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const emailError = validateEmail(email);
    if (emailError) {
        return res.status(400).json({ message: emailError });
    }
    try {
        const clientFound = await clientModel.findOne({ email });
        if (!clientFound) {
            return res.status(404).json({ message: "No encontramos una cuenta con ese correo" });
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
        markCodeSent(PURPOSE, email);

        const randomCode = crypto.randomBytes(3).toString("hex");
        const token = jsonwebtoken.sign(
            { email, randomCode, verified: false },
            config.jwt.secret,
            { expiresIn: CODE_TTL_SECONDS }
        );
        res.cookie("recoveryCookie", token, { maxAge: CODE_TTL_SECONDS * 1000, httpOnly: true, sameSite: "lax" });
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
            subject: "Código de recuperación - Maquilishuat",
            text: "Para recuperar tu contraseña, utiliza este código: " + randomCode + " expira en 15min",
            html: brandEmailHtml({
                title: "Recupera tu contraseña",
                intro: "Recibimos una solicitud para restablecer tu contraseña. Usa este código, expira en 15 minutos.",
                code: randomCode,
                footer: "Si no pediste esto, ignora este correo; tu contraseña no cambiará.",
            }),
        };
        try {
            await sendMailAsync(transporter, mailOptions);
        } catch (mailError) {
            console.log("error" + mailError);
            clearCodeCooldown(PURPOSE, email);
            return res.status(502).json({ message: "No pudimos enviar el correo. Intenta de nuevo en unos minutos." });
        }
        // Igual que en el registro: se devuelve el token en el body para
        // que la app móvil (sin cookie jar) pueda reenviarlo en los
        // siguientes pasos del flujo de recuperación.
        return res.status(200).json({
            message: "Email sent",
            recoveryToken: token,
            expiresIn: CODE_TTL_SECONDS,
            resendAfter: CODE_RESEND_SECONDS,
        });
    } catch (error) {
        console.log("error" + error);
        clearCodeCooldown(PURPOSE, email);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

recoveryClientController.verifyCode = async (req, res) => {
    try {
        const code = normalizeCode(req.body?.code);
        if (!CODE_REGEX.test(code)) {
            return res.status(400).json({ message: "El código debe tener 6 caracteres (0-9 y a-f)", code: "CODE_FORMAT" });
        }
        const decoded = readRecoveryToken(req, res);
        if (!decoded) return;
        // Un token ya verificado no trae randomCode: no puede "verificarse" de nuevo.
        if (!decoded.randomCode || code !== decoded.randomCode) {
            return res.status(400).json({ message: "Código incorrecto", code: "CODE_INVALID" });
        }
        const newToken = jsonwebtoken.sign(
            { email: decoded.email, verified: true },
            config.jwt.secret,
            { expiresIn: CODE_TTL_SECONDS }
        );
        res.cookie("recoveryCookie", newToken, { maxAge: CODE_TTL_SECONDS * 1000, httpOnly: true, sameSite: "lax" });
        return res.status(200).json({ message: "Code verified successfully", recoveryToken: newToken });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

recoveryClientController.newPassword = async (req, res) => {
    try {
        const { newPassword, confirmNewPassword } = req.body;
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            return res.status(400).json({ message: passwordError });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Las contraseñas no coinciden" });
        }
        const decoded = readRecoveryToken(req, res);
        if (!decoded) return;
        if (!decoded.verified) {
            return res.status(400).json({ message: "Primero verifica el código que te enviamos", code: "CODE_NOT_VERIFIED" });
        }
        const clientFound = await clientModel.findOne({ email: decoded.email });
        if (!clientFound) {
            return res.status(404).json({ message: "No encontramos una cuenta con ese correo" });
        }
        // se asigna en texto plano y se guarda con save() para que el hook pre('save') del modelo la hashee
        clientFound.password = newPassword;
        // Al recuperar el acceso se desbloquea la cuenta.
        clientFound.loginAttemps = 0;
        clientFound.timeOut = null;
        await clientFound.save({ validateBeforeSave: false });
        res.clearCookie("recoveryCookie");
        clearCodeCooldown(PURPOSE, decoded.email);
        return res.status(200).json({ message: "Password updated" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default recoveryClientController;
