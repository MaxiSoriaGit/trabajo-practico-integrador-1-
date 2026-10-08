// Ruta que no existe
export const notFoundHandler = (req, res) => {
    return res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

// Red de seguridad final (4 parametros = middleware de errores de Express)
export const errorHandler = (err, req, res, next) => {
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "El body no es un JSON valido" });
    }
    console.log(err);
    return res.status(500).json({ message: "Error interno del servidor" });
};
