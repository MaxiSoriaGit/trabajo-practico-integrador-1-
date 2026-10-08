import { matchedData } from "express-validator";
import { ArticleModel, UserModel, TagModel } from "../models/index.js";

// through: { attributes: ["id"] } => cada tag trae ArticleTag.id (lo necesitas para DELETE /articles-tags/:id)
const tagsInclude = { model: TagModel, as: "tags", through: { attributes: ["id"] } };
const authorInclude = { model: UserModel, as: "author", attributes: { exclude: ["password"] } };

export const createArticle = async (req, res) => {
    try {
        const validatedData = matchedData(req, { locations: ["body"] });

        // user_id sale del token, nunca del body
        const article = await ArticleModel.create({ ...validatedData, user_id: req.user.id });

        return res.status(201).json(article);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getAllArticles = async (req, res) => {
    try {
        const articles = await ArticleModel.findAll({
            where: { status: "published" },
            include: [authorInclude, tagsInclude],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json(articles);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getArticleById = async (req, res) => {
    try {
        const { id } = matchedData(req, { locations: ["params"] });

        const article = await ArticleModel.findByPk(id, { include: [authorInclude, tagsInclude] });

        if (!article) {
            return res.status(404).json({ message: "Articulo no encontrado" });
        }

        // un articulo archivado solo lo ve su dueno o un admin
        const canSeeArchived = article.user_id === req.user.id || req.user.role === "admin";
        if (article.status === "archived" && !canSeeArchived) {
            return res.status(404).json({ message: "Articulo no encontrado" });
        }

        return res.status(200).json(article);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

// Articulos del usuario logueado (publicados y archivados)
export const getMyArticles = async (req, res) => {
    try {
        const articles = await ArticleModel.findAll({
            where: { user_id: req.user.id },
            include: [tagsInclude],
            order: [["createdAt", "DESC"]],
        });

        return res.status(200).json(articles);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const getMyArticleById = async (req, res) => {
    try {
        const { id } = matchedData(req, { locations: ["params"] });

        const article = await ArticleModel.findOne({
            where: { id, user_id: req.user.id },
            include: [tagsInclude],
        });

        if (!article) {
            return res.status(404).json({ message: "Articulo no encontrado" });
        }

        return res.status(200).json(article);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const updateArticle = async (req, res) => {
    try {
        const validatedBody = matchedData(req, { locations: ["body"] });

        if (Object.keys(validatedBody).length === 0) {
            return res.status(400).json({ message: "No enviaste ningun campo para actualizar" });
        }

        await req.article.update(validatedBody); // req.article lo carga ownerMiddleware
        return res.status(200).json({ message: "Articulo actualizado correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const deleteArticle = async (req, res) => {
    try {
        await req.article.destroy(); // soft delete + hook que borra sus ArticleTag
        return res.status(200).json({ message: "Articulo eliminado correctamente" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
};
