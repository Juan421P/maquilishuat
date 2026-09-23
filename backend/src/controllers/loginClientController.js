import clientModel from "../models/client.js";
import adminModel from "../models/admin.js";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";
import { EMAIL_REGEX, normalizeEmail } from "../utils/validation.js";

const loginClientController = {};

const MODELS_BY_TYPE = [
    { userType: "Client", model: clientModel },
    { userType: "Admin", model: adminModel },
];

// Mismo mensaje para "no existe" y "contraseña incorrecta": así el login no
// revela qué correos tienen cuenta.
const INVALID_CREDENTIALS = "Correo o contraseña incorrectos";
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 5;

const lockedMessage = (until) => {
    const minutes = Math.max(1, Math.ceil((new Date(until).getTime() - Date.now()) / 60000));
    return `Cuenta bloqueada temporalmente por varios intentos fallidos. Intenta de nuevo en ${minutes} minuto${minutes === 1 ? "" : "s"}.`;
};

// Datos públicos del usuario que se devuelven al iniciar sesión (la app
// móvil los guarda para mostrar el perfil sin pedirlos de nuevo).
export const publicUser = (user, userType) => ({
    id: user._id.toString(),
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    birthdate: user.birthdate || null,
    picture: user.picture || null,
    userType,
});

loginClientController.login = async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    if (!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: "Correo inválido" });
    }
    if (typeof password !== "string" || !password) {
        return res.status(400).json({ message: "La contraseña es obligatoria" });
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
            return res.status(401).json({ message: INVALID_CREDENTIALS });
        }
        if (userFound.timeOut && userFound.timeOut > Date.now()) {
            return res.status(403).json({ message: lockedMessage(userFound.timeOut), code: "ACCOUNT_LOCKED" });
        }
        const isMatch = await userFound.comparePassword(password);
        if (!isMatch) {
            userFound.loginAttemps = (userFound.loginAttemps || 0) + 1;
            if (userFound.loginAttemps >= MAX_ATTEMPTS) {
                userFound.timeOut = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
                userFound.loginAttemps = 0;
                await userFound.save({ validateBeforeSave: false });
                return res.status(403).json({ message: lockedMessage(userFound.timeOut), code: "ACCOUNT_LOCKED" });
            }
            await userFound.save({ validateBeforeSave: false });
            return res.status(401).json({ message: INVALID_CREDENTIALS });
        }
        userFound.loginAttemps = 0;
        userFound.timeOut = null;
        await userFound.save({ validateBeforeSave: false });
        const token = jsonwebtoken.sign(
            { id: userFound._id, userType },
            config.jwt.secret,
            { expiresIn: "30d" }
        );
        res.cookie("authCookie", token, { httpOnly: true, sameSite: "lax" });
        return res.status(200).json({
            message: "Login exitoso",
            userType,
            token,
            user: publicUser(userFound, userType),
        });
    } catch (error) {
        console.log("error" + error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export default loginClientController;
