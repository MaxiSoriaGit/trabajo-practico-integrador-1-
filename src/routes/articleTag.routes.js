import { Router } from "express";
import { createArticleTag, deleteArticleTag } from "../controllers/articleTag.controller.js";
import { validate } from "../middlewares/validate.js";
import {
    createArticleTagValidation,
    articleTagIdParamValidation,
} from "../middlewares/validations/articleTag.validation.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

export const articleTagRouter = Router();

articleTagRouter.post("/articles-tags", authMiddleware, createArticleTagValidation, validate, createArticleTag);
articleTagRouter.delete("/articles-tags/:articleTagId", authMiddleware, articleTagIdParamValidation, validate, deleteArticleTag);
