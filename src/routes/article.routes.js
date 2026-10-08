import { Router } from "express";
import {
    createArticle,
    getAllArticles,
    getArticleById,
    getMyArticles,
    getMyArticleById,
    updateArticle,
    deleteArticle,
} from "../controllers/article.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    createArticleValidation,
    updateArticleValidation,
    idParamValidation,
} from "../middlewares/validations/article.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ownerMiddleware } from "../middlewares/owner.middleware.js";

export const articleRouter = Router();

// IMPORTANTE: "/articles/user" va ANTES de "/articles/:id",
// si no, Express tomaria "user" como si fuera un :id.
articleRouter.post("/articles", authMiddleware, createArticleValidation, validate, createArticle);
articleRouter.get("/articles", authMiddleware, getAllArticles);
articleRouter.get("/articles/user", authMiddleware, getMyArticles);
articleRouter.get("/articles/user/:id", authMiddleware, idParamValidation, validate, getMyArticleById);
articleRouter.get("/articles/:id", authMiddleware, idParamValidation, validate, getArticleById);
articleRouter.put("/articles/:id", authMiddleware, updateArticleValidation, validate, ownerMiddleware, updateArticle);
articleRouter.delete("/articles/:id", authMiddleware, idParamValidation, validate, ownerMiddleware, deleteArticle);
