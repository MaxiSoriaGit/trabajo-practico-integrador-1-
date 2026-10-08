import { body, param } from "express-validator";

export const idParamValidation = [
    param("id").isInt({ min: 1 }).withMessage("id debe ser un entero positivo").toInt(),
];

export const createUserValidation = [
    body("username")
        .isLength({ min: 3, max: 20 }).withMessage("entre 3 y 20 caracteres")
        .isAlphanumeric().withMessage("debe ser alfanumerico"),
    body("email").isEmail().withMessage("email invalido"),
    body("password")
        .isLength({ min: 8 }).withMessage("minimo 8 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
        .withMessage("debe tener mayuscula, minuscula y numero"),
    body("role").optional().isIn(["user", "admin"]).withMessage("role: user o admin"),
];

export const updateUserValidation = [
    ...idParamValidation,
    body("username").optional()
        .isLength({ min: 3, max: 20 }).withMessage("entre 3 y 20 caracteres")
        .isAlphanumeric().withMessage("debe ser alfanumerico"),
    body("email").optional().isEmail().withMessage("email invalido"),
    body("password").optional()
        .isLength({ min: 8 }).withMessage("minimo 8 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
        .withMessage("debe tener mayuscula, minuscula y numero"),
    body("role").optional().isIn(["user", "admin"]).withMessage("role: user o admin"),
];
