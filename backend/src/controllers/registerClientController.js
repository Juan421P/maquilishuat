import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";

import clientModel from "../models/client.js";
import { config } from "../../config.js";
import { brandEmailHtml } from "../utils/emailTemplate.js";

const registerClientController = {};

registerClientController.register = async (req, res) => {
    const { name, lastname, birthdate, email, password } = req.body;

    try {
        const existingClient = await clientModel.findOne({ email });
        if (existingClient) {
            return res.status(400).json({ message: "Ya existe una cuenta registrada con este correo" });
        }

        const randomNumber = crypto.randomBytes(3).toString("hex");

        const token = jsonwebtoken.sign(
            { randomNumber, name, lastname, birthdate, email, password },
            config.jwt.secret,
            { expiresIn: "15min" }
        );

        res.cookie("RegistrationCookie", token, { maxAge: 15 * 60 * 1000 });

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

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("error" + error);
                return res.status(500).json({ message: "Error sending email" });
            }
            // `registrationToken` se envía también en el body porque los
            // clientes nativos (Expo Go / apps móviles) no tienen un cookie
            // jar como el navegador y no pueden depender de la cookie para
            // completar el paso de verificación. La app web sigue
            // funcionando igual porque usa la cookie automáticamente.
            return res.status(200).json({ message: "Email sent", registrationToken: token });
        });

    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

registerClientController.verifyCode = async (req, res) => {
    try {
        const { verificationCodeRequest, registrationToken } = req.body;

        const headerToken = req.headers["x-registration-token"];
        const token = req.cookies.RegistrationCookie || registrationToken || headerToken;

        if (!token) {
            return res.status(400).json({ message: "El código expiró o la sesión es inválida, vuelve a registrarte" });
        }

        let decoded;
        try {
            decoded = jsonwebtoken.verify(token, config.jwt.secret);
        } catch (jwtError) {
            res.clearCookie("RegistrationCookie");
            return res.status(400).json({ message: "El código expiró o la sesión es inválida, vuelve a registrarte" });
        }

        const { randomNumber: storedCode, name, lastname, birthdate, email, password } = decoded;

        if (verificationCodeRequest !== storedCode) {
            return res.status(400).json({ message: "Código incorrecto" });
        }

        const existingClient = await clientModel.findOne({ email });
        if (existingClient) {
            res.clearCookie("RegistrationCookie");
            return res.status(400).json({ message: "Ya existe una cuenta registrada con este correo" });
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

        return res.status(200).json({ message: "Client registered" });
    } catch (error) {
        console.log("error" + error);
        if (error.name === "ValidationError") {
            const message = Object.values(error.errors)[0]?.message || "Datos inválidos";
            return res.status(400).json({ message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default registerClientController;
