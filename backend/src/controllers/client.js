import clientModel from "../models/client.js";
import { v2 as cloudinary } from "cloudinary";
import {
    HttpError,
    sendHttpError,
    normalizeEmail,
    validateEmail,
    validateName,
    validateBirthdate,
    validatePassword,
    parseBirthdate,
} from "../utils/validation.js";

const clientController = {};

const isAdmin = (req) => req.user?.userType === "Admin";

// Datos del cliente que se pueden devolver por la API (nunca la contraseña
// ni los contadores internos de intentos de login).
const publicClient = (client) => ({
    _id: client._id,
    name: client.name,
    lastname: client.lastname,
    email: client.email,
    birthdate: client.birthdate || null,
    picture: client.picture || null,
    verified_email: client.verified_email,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
});

const destroyPicture = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.log("error eliminando imagen " + error);
    }
};

clientController.getClient = async (req, res) => {
    try {
        const clients = await clientModel.find();
        return res.status(200).json(clients);
    } catch (error) {
        return sendHttpError(res, error);
    }
};

// GET /clients/:id — el propio cliente (o un admin) consulta su perfil.
clientController.getClientById = async (req, res) => {
    try {
        const client = await clientModel.findById(req.params.id);
        if (!client) {
            throw new HttpError(404, "Cliente no encontrado");
        }
        return res.status(200).json(publicClient(client));
    } catch (error) {
        return sendHttpError(res, error);
    }
};

// PUT /clients/:id (JSON o multipart con el campo "picture").
// Cambios respecto a la versión anterior:
//  - Solo se actualizan los campos enviados (antes name, email y password
//    eran obligatorios en cada edición).
//  - El campo `password` ya NO se guarda directo: con findByIdAndUpdate se
//    guardaba en TEXTO PLANO (sin pasar por el hash) y el cliente no podía
//    volver a iniciar sesión. El panel web mandaba "placeholder_no_change".
//    Para cambiar la contraseña, el propio cliente envía
//    `currentPassword` + `newPassword`.
//  - Ya no se pueden modificar verified_email, loginAttemps ni timeOut.
//  - El correo solo lo cambia un admin (es la identidad verificada).
//  - Se usa save() para que corran las validaciones del modelo (18+).
clientController.updateClient = async (req, res) => {
    const uploadedPictureId = req.file?.filename;
    try {
        const client = await clientModel.findById(req.params.id).select("+password");
        if (!client) {
            throw new HttpError(404, "Cliente no encontrado");
        }
        const body = req.body || {};

        if (body.name !== undefined) {
            const error = validateName(body.name, "El nombre");
            if (error) throw new HttpError(400, error);
            client.name = body.name.trim();
        }
        if (body.lastname !== undefined) {
            const error = validateName(body.lastname, "El apellido");
            if (error) throw new HttpError(400, error);
            client.lastname = body.lastname.trim();
        }
        if (body.birthdate !== undefined && body.birthdate !== "") {
            const error = validateBirthdate(body.birthdate);
            if (error) throw new HttpError(400, error);
            client.birthdate = parseBirthdate(body.birthdate);
        }
        if (body.email !== undefined) {
            const email = normalizeEmail(body.email);
            if (email !== client.email) {
                if (!isAdmin(req)) {
                    throw new HttpError(400, "El correo no se puede cambiar desde tu perfil");
                }
                const error = validateEmail(email);
                if (error) throw new HttpError(400, error);
                if (await clientModel.exists({ email, _id: { $ne: client._id } })) {
                    throw new HttpError(409, "Ya existe una cuenta con ese correo");
                }
                client.email = email;
            }
        }
        if (body.newPassword !== undefined) {
            if (isAdmin(req) && req.user.id !== client._id.toString()) {
                throw new HttpError(403, "Solo el propio cliente puede cambiar su contraseña");
            }
            const current = body.currentPassword;
            if (typeof current !== "string" || !current) {
                throw new HttpError(400, "Ingresa tu contraseña actual");
            }
            if (!(await client.comparePassword(current))) {
                throw new HttpError(400, "La contraseña actual no es correcta", { field: "currentPassword" });
            }
            const error = validatePassword(body.newPassword);
            if (error) throw new HttpError(400, error, { field: "newPassword" });
            if (body.newPassword === current) {
                throw new HttpError(400, "La nueva contraseña debe ser distinta a la actual", { field: "newPassword" });
            }
            client.password = body.newPassword; // pre('save') la hashea
        }

        let previousPictureId = null;
        if (req.file) {
            previousPictureId = client.picture_id;
            client.picture = req.file.path;
            client.picture_id = req.file.filename;
        }

        await client.save();
        if (previousPictureId && previousPictureId !== client.picture_id) {
            await destroyPicture(previousPictureId);
        }
        return res.status(200).json({ message: "Client updated", client: publicClient(client) });
    } catch (error) {
        // Si se subió una foto nueva pero el perfil no se guardó, se borra.
        if (uploadedPictureId) await destroyPicture(uploadedPictureId);
        return sendHttpError(res, error);
    }
};

// DELETE /clients/:id — un cliente que elimina SU cuenta debe confirmar con
// su contraseña; el admin puede eliminar desde el panel sin ella.
clientController.deleteClient = async (req, res) => {
    try {
        const deletedClient = await clientModel.findById(req.params.id).select("+password");
        if (!deletedClient) {
            throw new HttpError(404, "Cliente no encontrado");
        }
        if (!isAdmin(req)) {
            const password = req.body?.password;
            if (typeof password !== "string" || !password || !(await deletedClient.comparePassword(password))) {
                throw new HttpError(400, "La contraseña no es correcta", { field: "password" });
            }
        }
        await clientModel.deleteOne({ _id: deletedClient._id });
        await destroyPicture(deletedClient.picture_id);
        if (req.user.id === deletedClient._id.toString()) {
            res.clearCookie("authCookie");
        }
        return res.status(200).json({ message: "Client deleted" });
    } catch (error) {
        return sendHttpError(res, error);
    }
};

export default clientController;
