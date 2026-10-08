import { body, param } from "express-validator";

export const createArticleTagValidation = [
    body("article_id").isInt({ min: 1 }).withMessage("article_id debe ser un entero positivo").toInt(),
    body("tag_id").isInt({ min: 1 }).withMessage("tag_id debe ser un entero positivo").toInt(),
];

export const articleTagIdParamValidation = [
    param("articleTagId").isInt({ min: 1 }).withMessage("articleTagId debe ser un entero positivo").toInt(),
];
