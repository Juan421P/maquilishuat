import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { errorHandler } from './src/middleware/error_handler.js';
import router from './src/routers/router.js';
const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000,
    // Configurable para pruebas automatizadas; en uso normal sigue en 100.
    max: Number(process.env.RATE_LIMIT_MAX) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    // `message` (no `error`) para que la web y la app muestren el texto.
    message: {
        message: 'Demasiadas solicitudes. Espera un momento e inténtalo nuevamente.',
        code: 'RATE_LIMITED'
    }
}));
app.use('/api', router);
app.use((req, res) => {
    return res.status(404).json({ message: `path ${req.originalUrl} not found on this server` });
});
app.use(errorHandler);
export default app;