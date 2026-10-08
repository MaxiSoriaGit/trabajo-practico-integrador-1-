import { verifyToken } from "../helpers/jwt.helper.js";
import { UserModel } from "../models/index.js";

// Lee el JWT de la cookie "token" y deja req.user = { id, role }.
// Consulta la BD para que un usuario eliminado (o con rol cambiado) no use un token viejo.
export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({ message: "No autenticado" });
        }

        let decoded;
        try {
            decoded = verifyToken(token);
        } catch {
            return res.status(401).json({ message: "Token invalido o expirado" });
        }

        const user = await UserModel.findByPk(decoded.id, { attributes: ["id", "role"] });
        if (!user) {
            return res.status(401).json({ message: "El usuario no existe o fue eliminado" });
        }

        req.user = { id: user.id, role: user.role };
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
