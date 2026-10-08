import { body, param } from "express-validator";

export const idParamValidation = [
    param("id").isInt({ min: 1 }).withMessage("id debe ser un entero positivo").toInt(),
];

export const createArticleValidation = [
    body("title").isLength({ min: 3, max: 200 }).withMessage("entre 3 y 200 caracteres"),
    body("content").isLength({ min: 50 }).withMessage("minimo 50 caracteres"),
    body("excerpt").optional().isLength({ max: 500 }).withMessage("maximo 500 caracteres"),
    body("status").optional().isIn(["published", "archived"]).withMessage("published o archived"),
];

export const updateArticleValidation = [
    ...idParamValidation,
    body("title").optional().isLength({ min: 3, max: 200 }).withMessage("entre 3 y 200 caracteres"),
    body("content").optional().isLength({ min: 50 }).withMessage("minimo 50 caracteres"),
    body("excerpt").optional().isLength({ max: 500 }).withMessage("maximo 500 caracteres"),
    body("status").optional().isIn(["published", "archived"]).withMessage("published o archived"),
];
