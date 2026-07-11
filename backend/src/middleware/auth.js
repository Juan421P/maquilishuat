import jsonwebtoken from 'jsonwebtoken';
import { config } from '../../config.js';

export const verifyToken = (req, res, next) => {
    const token = req.cookies.authCookie;

    if (!token) {
        return res.status(401).json({ message: 'authentication required' });
    }

    try {
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        req.user = { id: decoded.id, userType: decoded.userType };
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'invalid or expired session' });
    }
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
