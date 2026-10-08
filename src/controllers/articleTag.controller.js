import { matchedData } from "express-validator";
import { ArticleTagModel, ArticleModel, TagModel } from "../models/index.js";

export const createArticleTag = async (req, res) => {
    try {
        const { article_id, tag_id } = matchedData(req, { locations: ["body"] });

        const article = await ArticleModel.findByPk(article_id);
        if (!article) {
            return res.status(404).json({ message: "Articulo no encontrado" });
        }

        if (article.user_id !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "No tenes permiso sobre este articulo" });
        }

        const tag = await TagModel.findByPk(tag_id);
        if (!tag) {
            return res.status(404).json({ message: "Etiqueta no encontrada" });
        }

        const alreadyLinked = await ArticleTagModel.findOne({ where: { article_id, tag_id } });
        if (alreadyLinked) {
            return res.status(409).json({ message: "El articulo ya tiene esa etiqueta" });
        }

        const articleTag = await ArticleTagModel.create({ article_id, tag_id });

        return res.status(201).json(articleTag);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const deleteArticleTag = async (req, res) => {
    try {
        const { articleTagId } = matchedData(req, { locations: ["params"] });

        const articleTag = await ArticleTagModel.findByPk(articleTagId);
        if (!articleTag) {
            return res.status(404).json({ message: "Relacion articulo-etiqueta no encontrada" });
        }

        const article = await ArticleModel.findByPk(articleTag.article_id);
        if (!article) {
            return res.status(404).json({ message: "Articulo no encontrado" });
        }

        if (article.user_id !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ message: "No tenes permiso sobre este articulo" });
        }

        await articleTag.destroy();

        return res.status(200).json({ message: "Etiqueta removida del articulo correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
