import { body, param } from "express-validator";

export const idParamValidation = [
    param("id").isInt({ min: 1 }).withMessage("id debe ser un entero positivo").toInt(),
];

export const createTagValidation = [
    body("name")
        .isLength({ min: 2, max: 30 }).withMessage("entre 2 y 30 caracteres")
        .matches(/^\S+$/).withMessage("no debe contener espacios"),
];

export const updateTagValidation = [
    ...idParamValidation,
    body("name")
        .isLength({ min: 2, max: 30 }).withMessage("entre 2 y 30 caracteres")
        .matches(/^\S+$/).withMessage("no debe contener espacios"),
];
