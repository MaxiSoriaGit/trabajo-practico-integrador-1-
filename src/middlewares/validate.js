import { validationResult } from "express-validator";

// Corta la request con 400 si alguna validacion fallo.
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formatted = errors.formatWith((err) => `${err.path}: ${err.msg}`);
        return res.status(400).json(formatted.array());
    }
    next();
};
