import { body } from "express-validator";

export const registerValidation = [
    body("username")
        .isLength({ min: 3, max: 20 }).withMessage("entre 3 y 20 caracteres")
        .isAlphanumeric().withMessage("debe ser alfanumerico"),
    body("email").isEmail().withMessage("email invalido"),
    body("password")
        .isLength({ min: 8 }).withMessage("minimo 8 caracteres")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
        .withMessage("debe tener mayuscula, minuscula y numero"),
    body("first_name")
        .isLength({ min: 2, max: 50 }).withMessage("entre 2 y 50 caracteres")
        .isAlpha("es-ES", { ignore: " " }).withMessage("solo letras"),
    body("last_name")
        .isLength({ min: 2, max: 50 }).withMessage("entre 2 y 50 caracteres")
        .isAlpha("es-ES", { ignore: " " }).withMessage("solo letras"),
];

export const loginValidation = [
    body("email").isEmail().withMessage("email invalido"),
    body("password").notEmpty().withMessage("password obligatoria"),
];

export const updateProfileValidation = [
    body("first_name").optional().isLength({ min: 2, max: 50 }).isAlpha("es-ES", { ignore: " " })
        .withMessage("entre 2 y 50 caracteres, solo letras"),
    body("last_name").optional().isLength({ min: 2, max: 50 }).isAlpha("es-ES", { ignore: " " })
        .withMessage("entre 2 y 50 caracteres, solo letras"),
    body("biography").optional().isLength({ max: 500 }).withMessage("maximo 500 caracteres"),
    body("avatar_url").optional().isURL().withMessage("URL invalida"),
    body("birth_date").optional().isISO8601().withMessage("formato YYYY-MM-DD"),
];
