import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";

import clientModel from "../models/client.js";
import { config } from "../../config.js";

const registerClientController = {};

registerClientController.register = async (req, res) => {
    const { name, lastname, birthdate, email, password } = req.body;

    try {
        const existingClient = await clientModel.findOne({ email });
        if (existingClient) {
            return res.status(400).json({ message: "Client already exists" });
        }

        const randomNumber = crypto.randomBytes(3).toString("hex");

        const token = jsonwebtoken.sign(
            { randomNumber, name, lastname, birthdate, email, password },
            config.jwt.secret,
            { expiresIn: "15min" }
        );

        res.cookie("RegistrationCookie", token, { maxAge: 15 * 60 * 1000 });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.email.user,
                pass: config.email.password
            }
        });

        const mailOptions = {
            from: config.email.user,
            to: email,
            subject: "Verificación de cuenta",
            text: "Para verificar tu cuenta, utiliza este código: " + randomNumber + " expira en 15min"
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

registerClientController.verifyCode = async (req, res) => {
    try {
        const { verificationCodeRequest } = req.body;

        const token = req.cookies.RegistrationCookie;

        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        const { randomNumber: storedCode, name, lastname, birthdate, email, password } = decoded;

        if (verificationCodeRequest !== storedCode) {
            return res.status(400).json({ message: "Invalid code" });
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
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default registerClientController;
