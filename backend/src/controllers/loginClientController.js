import clientModel from "../models/client.js";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

const loginClientController = {};

loginClientController.login = async (req, res) => {
    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Correo inválido" });
    }

    try {
        const clientFound = await clientModel.findOne({ email }).select('+password');

        if (!clientFound) {
            return res.status(404).json({ message: "Client not found" });
        }

        if (clientFound.timeOut && clientFound.timeOut > Date.now()) {
            return res.status(403).json({ message: "Cuenta bloqueada" });
        }

        const isMatch = await clientFound.comparePassword(password);

        if (!isMatch) {
            clientFound.loginAttemps = (clientFound.loginAttemps || 0) + 1;

            if (clientFound.loginAttemps >= 5) {
                clientFound.timeOut = new Date(Date.now() + 5 * 60 * 1000);
                clientFound.loginAttemps = 0;
                await clientFound.save();
                return res.status(403).json({ message: "Cuenta bloqueada por multiples intentos fallidos" });
            }

            await clientFound.save();
            return res.status(403).json({ message: "Credenciales incorrectas" });
        }

        clientFound.loginAttemps = 0;
        clientFound.timeOut = null;
        await clientFound.save();

        const token = jsonwebtoken.sign(
            { id: clientFound._id, userType: "Client" },
            config.jwt.secret,
            { expiresIn: "30d" }
        );

        res.cookie("authCookie", token);

        return res.status(200).json({ message: "Login exitoso" });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default loginClientController;
