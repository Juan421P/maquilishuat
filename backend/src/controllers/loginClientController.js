import clientModel from "../models/client.js";
import adminModel from "../models/admin.js";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

const loginClientController = {};

const MODELS_BY_TYPE = [
    { userType: "Client", model: clientModel },
    { userType: "Admin", model: adminModel },
];

loginClientController.login = async (req, res) => {
    const { email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Correo inválido" });
    }

    try {
        let userType = null;
        let userFound = null;

        for (const entry of MODELS_BY_TYPE) {
            const found = await entry.model.findOne({ email }).select('+password');
            if (found) {
                userType = entry.userType;
                userFound = found;
                break;
            }
        }

        if (!userFound) {
            return res.status(404).json({ message: "Client not found" });
        }

        if (userFound.timeOut && userFound.timeOut > Date.now()) {
            return res.status(403).json({ message: "Cuenta bloqueada" });
        }

        const isMatch = await userFound.comparePassword(password);

        if (!isMatch) {
            userFound.loginAttemps = (userFound.loginAttemps || 0) + 1;

            if (userFound.loginAttemps >= 5) {
                userFound.timeOut = new Date(Date.now() + 5 * 60 * 1000);
                userFound.loginAttemps = 0;
                await userFound.save();
                return res.status(403).json({ message: "Cuenta bloqueada por multiples intentos fallidos" });
            }

            await userFound.save();
            return res.status(403).json({ message: "Credenciales incorrectas" });
        }

        userFound.loginAttemps = 0;
        userFound.timeOut = null;
        await userFound.save();

        const token = jsonwebtoken.sign(
            { id: userFound._id, userType },
            config.jwt.secret,
            { expiresIn: "30d" }
        );

        res.cookie("authCookie", token);

        return res.status(200).json({ message: "Login exitoso", userType, token });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default loginClientController;
