import { ArticleModel } from "../models/index.js";

// Debe ir DESPUES de authMiddleware. Permite seguir solo al dueno del articulo o a un admin.
// Deja el articulo cargado en req.article para que el controller no lo busque de nuevo.
export const ownerMiddleware = async (req, res, next) => {
    try {
        const article = await ArticleModel.findByPk(req.params.id);

        if (!article) {
            return res.status(404).json({ message: "Articulo no encontrado" });
        }

        if (req.user.role !== "admin" && article.user_id !== req.user.id) {
            return res.status(403).json({ message: "No tenes permiso sobre este recurso" });
        }

        req.article = article;
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
