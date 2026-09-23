export const errorHandler = (err, req, res, next) => {
    // JSON mal formado en el body
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'El cuerpo de la solicitud no es JSON válido' });
    }
    // Errores de multer (archivo demasiado grande, campo inesperado, etc.)
    if (err.name === 'MulterError') {
        return res.status(400).json({ message: `No se pudo procesar el archivo: ${err.message}` });
    }
    console.error(err.stack);
    const status = err.status || err.http_code || 500;
    return res.status(status).json({
        message: status >= 500 ? 'Error interno del servidor' : (err.message || 'Solicitud inválida')
    });
};
