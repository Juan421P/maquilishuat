import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../config.js';
import clientModel from '../models/client.js';
import adminModel from '../models/admin.js';

const MODEL_BY_TYPE = { Client: clientModel, Admin: adminModel };

export const verifyToken = async (req, res, next) => {
    const bearer = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null;
    // El header Authorization (app móvil) tiene prioridad sobre la cookie
    // (web). Así una cookie vieja que haya quedado guardada en el cookie jar
    // nativo del teléfono no puede "ganarle" al token de la sesión actual.
    const token = bearer || req.cookies.authCookie;

    if (!token) {
        return res.status(401).json({ message: 'Debes iniciar sesión', code: 'AUTH_REQUIRED' });
    }

    let decoded;
    try {
        decoded = jsonwebtoken.verify(token, config.jwt.secret);
    } catch (error) {
        return res.status(401).json({ message: 'Tu sesión expiró. Inicia sesión nuevamente.', code: 'SESSION_EXPIRED' });
    }

    try {
        // Si la cuenta fue eliminada, el token deja de servir aunque no
        // haya vencido todavía.
        const model = MODEL_BY_TYPE[decoded.userType];
        if (!model || !(await model.exists({ _id: decoded.id }))) {
            return res.status(401).json({ message: 'Tu sesión ya no es válida. Inicia sesión nuevamente.', code: 'SESSION_EXPIRED' });
        }
    } catch (error) {
        return next(error);
    }

    req.user = { id: decoded.id, userType: decoded.userType };
    return next();
};

export const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.userType)) {
        return res.status(403).json({ message: 'insufficient permissions' });
    }
    return next();
};

export const requireSelfOrAdmin = (paramName = 'id') => (req, res, next) => {
    if (req.user && (req.user.userType === 'Admin' || req.user.id === req.params[paramName])) {
        return next();
    }
    return res.status(403).json({ message: 'insufficient permissions' });
};
