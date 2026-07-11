import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";

import clientModel from "../models/client.js";
import { config } from "../../config.js";

const recoveryClientController = {};

recoveryClientController.requestCode = async (req, res) => {
    const { email } = req.body;

    try {
        const clientFound = await clientModel.findOne({ email });

        if (!clientFound) {
            return res.status(404).json({ message: "Client not found" });
        }

        const randomCode = crypto.randomBytes(3).toString("hex");

        const token = jsonwebtoken.sign(
            { email, randomCode, verified: false },
            config.jwt.secret,
            { expiresIn: "15min" }
        );

        res.cookie("recoveryCookie", token, { maxAge: 15 * 60 * 1000 });

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
            subject: "Código de recuperación",
            text: "Para recuperar tu contraseña, utiliza este código: " + randomCode + " expira en 15min"
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("error" + error);
                return res.status(500).json({ message: "Error sending email" });
            }
            return res.status(200).json({ message: "Email sent" });
        });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

recoveryClientController.verifyCode = async (req, res) => {
    try {
        const { code } = req.body;

        const token = req.cookies.recoveryCookie;
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);

        if (code !== decoded.randomCode) {
            return res.status(400).json({ message: "Invalid code" });
        }

        const newToken = jsonwebtoken.sign(
            { email: decoded.email, verified: true },
            config.jwt.secret,
            { expiresIn: "15min" }
        );

        res.cookie("recoveryCookie", newToken, { maxAge: 15 * 60 * 1000 });

        return res.status(200).json({ message: "Code verified successfully" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

recoveryClientController.newPassword = async (req, res) => {
    try {
        const { newPassword, confirmNewPassword } = req.body;

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Passwords don't match" });
        }

        const token = req.cookies.recoveryCookie;
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);

        if (!decoded.verified) {
            return res.status(400).json({ message: "Code not verified" });
        }

        const clientFound = await clientModel.findOne({ email: decoded.email });

        if (!clientFound) {
            return res.status(404).json({ message: "Client not found" });
        }

        // se asigna en texto plano y se guarda con save() para que el hook pre('save') del modelo la hashee
        clientFound.password = newPassword;
        await clientFound.save();

        res.clearCookie("recoveryCookie");

        return res.status(200).json({ message: "Password updated" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default recoveryClientController;
